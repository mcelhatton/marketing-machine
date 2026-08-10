# MDD Quote System — setup runbook

Portal **585393** (mdd-production). Roughly 45 minutes end to end.

> **Tier check first.** CMS serverless functions require **Content Hub Enterprise**. If step 4
> fails with a permissions error, jump to [Fallback](#fallback-no-serverless-functions).

## 1. Create a private app token

HubSpot → Settings → Integrations → Private Apps → **Create private app**, name it
`MDD Quote Builder`. Scopes:

```
crm.objects.quotes.read        crm.objects.quotes.write
crm.objects.deals.read         crm.objects.deals.write
crm.objects.line_items.read    crm.objects.line_items.write
crm.objects.products.read
crm.objects.contacts.read      crm.objects.companies.read
crm.schemas.quotes.write       crm.schemas.deals.write
cpq.quote_templates.write
```

`cpq.quote_templates.write` is what lets step 5 be done over the API instead of by hand.
The token currently in `.env` does **not** carry it (403 on
`POST /crm/v3/objects/quote_template`), nor `crm.objects.companies.write`.

Copy the token. It is shown once.

## 2. Create the custom properties

```bash
export HUBSPOT_QUOTE_TOKEN='pat-na1-…'

node scripts/quote-system/create-quote-properties.js --dry-run   # review
node scripts/quote-system/create-quote-properties.js             # apply
```

Creates 19 quote properties and 1 deal property, all prefixed `mdd_`. Idempotent — safe to
re-run. `crm.schemas.*.write` can be dropped from the token afterwards.

## 3. Load the secrets

```bash
hs secrets add HUBSPOT_QUOTE_TOKEN         # the token from step 1
hs secrets add MDD_QUOTE_SIGNING_SECRET    # openssl rand -base64 32
hs secrets add MDD_REP_KEY                 # must equal mdd_rep_key in demo.html
hs secrets list                            # confirm all three
```

Generate the signing secret with `openssl rand -base64 32`.

`MDD_REP_KEY` must be **identical** to the `mdd_rep_key` value set at the top of
`mdd-theme/templates/demo.html`. Reps never see or type it — HubSpot renders it into the
password-protected page, and reaching that page is the authentication. Rotate by changing
both and re-uploading; they must never drift apart.

## 4. Upload

```bash
hs upload mdd-theme mdd-theme
hs upload mdd-quote-theme mdd-quote-theme
```

Confirm the endpoints registered: Design Manager → **Functions**. You should see
`mdd/create-quote`, `mdd/quote-options`, `mdd/quote-select`.

## 5. Point the quote template at the new design

The functions default to quote template **`mddQuote` (id 435681411161)**. To use the new
`MDD - System Quote (Buy / Lease)` design instead:

Either over the API, with a token carrying `cpq.quote_templates.write`:

```bash
curl -s -X POST https://api.hubapi.com/crm/v3/objects/quote_template \
  -H "Authorization: Bearer $HUBSPOT_QUOTE_TOKEN" -H 'Content-Type: application/json' \
  -d '{"properties":{
        "hs_name":"MDD - System Quote (Buy / Lease)",
        "hs_type":"customizable_quote_template",
        "hs_cms_template_path":"mdd-quote-theme/templates/mdd-system-quote.html",
        "hs_active":"true",
        "hs_quote_property_default_hs_domain":"mdd.io",
        "hs_quote_property_default_hs_language":"en",
        "hs_quote_property_default_hs_locale":"en-us"}}'
```

Or in the UI:

1. HubSpot → Settings → Objects → Quotes → **Quote templates** → Create → pick
   `MDD - System Quote (Buy / Lease)`.
2. Note the new template's id from the URL.
3. Set it in Design Manager → Functions → environment, as `MDD_QUOTE_TEMPLATE_ID`, or edit
   the default in `create-quote.js`, or pass `--template <id>` to the test harness.

Until this is done, quotes attach to `mddQuote` (`435681411161`), which points at HubSpot's
stock `basic.html` — so none of the `mdd_` properties render.

Set the countersigner here too if MDD needs to countersign — **that cannot be done via API.**

## 6. Publish the chooser page

HubSpot → Content → Website Pages → Create → template
`MDD - Quote Options (Buy vs Lease)`. Set the URL to **`/quote-options`** — this must match
`MDD_CHOOSER_BASE` in `create-quote.js` (default `https://mdd.io/quote-options`).

Leave it indexable-off; the template already sends `noindex, nofollow`.

## 7. Smoke test

1. Open `mdd.io/sales-demo`, go to **13 · Wrap-Up → System Builder & Investment**.
2. Fill in a real dealership. Paste a **test deal's** ID into the Send to HubSpot field.
3. Click **Create Quote**. No key prompt — the page carries it.
4. Expect: both quotes summarised, a chooser link, and links to each draft in HubSpot.
5. Open the chooser link in a private window. Confirm both options render with the right
   numbers.
6. Click one. You should land on the published, signable quote.
7. In HubSpot: the chosen quote is published, the other is **VOID**, and the deal's amount
   and `MDD Purchase Option` are set.
8. Re-open the chooser link — it should forward to the live quote, not create anything.

Delete the test quotes when done.

## 8. Roll out to reps

Reps need one thing: the habit of pasting a **Deal ID**, and filling in their name/email once
so the quote is signed by them. There is no key to remember. Everything else is unchanged. Worth saying explicitly on the first call:
*the customer picks Buy or Lease themselves, and the quote they sign matches their pick.*

---

## Fallback: no serverless functions

If the portal is on Content Hub Professional, `hs upload` rejects `mdd-theme/mdd.functions/`.
The three handlers are plain Node with no HubSpot-specific runtime beyond the
`(context, sendResponse)` signature, so they port to a Cloudflare Worker or a Vercel function
in about twenty lines of adapter:

- `context.body` → the parsed JSON request body
- `context.params.t[0]` → `new URL(req.url).searchParams.get('t')`
- `context.headers['x-mdd-rep-key']` → `req.headers.get('x-mdd-rep-key')`
- `process.env.X` → the platform's env binding
- `sendResponse({statusCode, headers, body})` → `new Response(JSON.stringify(body), …)`

Then change `MDD_QUOTE_API` in `demo.html` and `API` in `quote-chooser.html` from
`/_hcms/api/mdd` to the deployed origin, and add that origin to `ALLOWED_ORIGINS` in
`lib/respond.js`. Ask and I'll write the adapter.

---

## Rollback

Nothing here is destructive; the fastest rollback is to stop using it.

| To undo | Do this |
|---|---|
| Create Quote button | `git checkout mdd-theme/templates/demo.html` (or restore `demo.html.bak`), then `hs upload mdd-theme mdd-theme` |
| Endpoints | Delete the three files from Design Manager → Functions |
| Chooser page | Unpublish `/quote-options` |
| Custom properties | Archive the `mdd_` properties in HubSpot — but only after the quotes using them are closed |
| A bad quote pair | Void both quotes on the deal and click Create Quote again |

Custom properties are additive and harmless if left in place.
