> **Superseded by [STATUS.md](STATUS.md)** (2026-08-10). This is the original brief, kept
> as a record. Several of its claims turned out to be wrong once run against HubSpot — see
> the corrections table in STATUS.md.

# Handoff prompt — paste everything below into Claude in VS Code

---

You're picking up a partly-finished feature in this repo (`mdd-marketing-machine`). Read this
whole brief before touching anything. Most of the code is written and syntax-checked; what
remains is running it against HubSpot, deploying, and resolving pricing decisions.

## What this feature is

The sales-demo at `mdd.io/sales-demo` has a "System Builder & Investment" slide (section 13)
that sizes an MDD hardware system from a dealership's real numbers and shows two ways to pay:
**Buy** (own the hardware) and **Lease** (hardware in the monthly). Goal: a **Create Quote**
button that pushes those inputs into HubSpot and generates a signable quote where the
**customer picks Buy or Lease and signs based on their selection**.

## The constraint that shaped the design — do not try to "fix" this

**HubSpot has no buyer-selectable optional line items.** Verified: no `hs_is_optional` /
`hs_buyer_selectable` property exists on LINE_ITEM in portal 585393 (the only adjacent one,
`hs_allow_buyer_selected_quantity`, is payment-links only); no quotes/CPQ doc mentions it;
still an open HubSpot Ideas request.

Worse: **publishing a quote sets `hs_locked = true`** — line items and totals freeze. So a
buyer toggling Buy/Lease on a live quote and signing cannot work. Any such UI would have them
sign a document whose CRM amount disagrees with their selection.

**The design instead: two drafts, one decision.**

1. Rep clicks Create Quote with a Deal ID → serverless `create-quote` recomputes all maths
   server-side, prices from the HubSpot **product catalog**, creates a Buy quote and a Lease
   quote, both `DRAFT`.
2. Rep sends the buyer one signed, expiring **chooser link** (`/quote-options`).
3. Buyer sees both side by side, clicks one → `quote-select` publishes it
   (`hs_status = APPROVAL_NOT_NEEDED`), **voids the other**, writes `mdd_purchase_option` and
   `amount` to the deal, and forwards straight to signing.

Result: exactly one signable quote, deal amount matches the choice, one buyer click.
Idempotent — reopening a used link forwards to the live quote.

Portal 585393 runs **legacy quotes** (all templates are `customizable_quote_template`, not
CPQ), so `/crm/v3/objects/quotes` applies.

## File map — all of this already exists

```
mdd-theme/mdd.functions/
  serverless.json            3 endpoints: mdd/create-quote, mdd/quote-options, mdd/quote-select
  create-quote.js            thin handler -> lib/quote-builder.js
  quote-options.js           feeds the chooser page
  quote-select.js            thin handler -> lib/quote-builder.js
  pricing-map.json           SKU <-> System Builder mapping. EDIT THIS, NOT CODE.
  lib/quote-builder.js       createQuotePair() + selectOption() — the real logic
  lib/calc.js                server-side mirror of qCalc() in demo.html
  lib/hubspot.js             CRM client, association type IDs, hs_status enum
  lib/token.js               HMAC sign/verify for chooser links
  lib/respond.js             CORS + safe error shaping

mdd-theme/templates/
  quote-chooser.html         buyer-facing Buy vs Lease page (templateType: page)
  demo.html                  PATCHED — Create Quote panel on §13 (demo.html.bak alongside)

mdd-quote-theme/templates/
  mdd-system-quote.html      the quote document (templateType: quote), CSS inlined
  _to_delete/                superseded standalone CSS — delete this folder

scripts/quote-system/
  create-quote-properties.js creates 19 quote + 1 deal custom properties (idempotent)
  test-quote-flow.js         local harness: doctor | create | select | show | cleanup
  load-env.js                reads .env, maps HUBSPOT_ACCESS_TOKEN -> HUBSPOT_QUOTE_TOKEN
  patch-demo-create-quote.js re-applies the demo.html patch (idempotent)

docs/quote-system/
  ARCHITECTURE.md  SETUP.md  PRICING-RECONCILIATION.md  QA-CHECKLIST.md
```

## State: verified vs unverified

**Verified working**
- `lib/calc.js` reproduces the System Builder exactly: reference deal (300 new + 150 used +
  25 loaners, 1,500 ROs, $150/hr, Service + Recon on) → **475 tracked units, 86 placards,
  26 gateways, $63,950/mo, $767,400/yr**. Parity script is in QA-CHECKLIST.md.
- All JS syntax-checks; both HTML pages' inline JS parses; JSON valid.
- Edge cases handled: zero/negative/NaN/string inputs, missing modules, huge values.
- `demo.html` patch is idempotent and its embedded JS still parses.
- Product catalog already has Buy **and** Lease SKUs — ids are pinned in `pricing-map.json`.

**Never executed against HubSpot — this is the immediate job**
- No quote has been created. No custom properties exist yet. Nothing is uploaded to the CMS.
- Previous session had no network path to `api.hubapi.com`, so nothing could be run.

## Task 1 — run it (do this first)

The token is already in `.env` as `HUBSPOT_ACCESS_TOKEN`; the scripts pick it up automatically.

```bash
node scripts/quote-system/test-quote-flow.js doctor
node scripts/quote-system/create-quote-properties.js
node scripts/quote-system/test-quote-flow.js create --deal 63548402544
```

`doctor` reports token validity, missing scopes, whether the custom properties exist, and what
the quote template record actually is. **Run it first.** The likeliest failure is the token
lacking `crm.objects.quotes.write` / `crm.schemas.quotes.write` — a marketing token usually
doesn't carry those. If so, create a private app with the scopes listed in SETUP.md §1.

Then simulate the buyer:

```bash
node scripts/quote-system/test-quote-flow.js select --choice buy \
  --buy <buyQuoteId> --lease <leaseQuoteId> --deal 63548402544
```

That prints the live signable quote URL. `cleanup --buy <id> --lease <id>` voids both.

**Test records already created (safe to delete when done):**
- Deal `63548402544` — "ZZ TEST — MDD Quote System Sandbox"
- Company `57303892995`, Contact `240365011088` (Testy McQuoteface), both associated

## Task 2 — deploy the CMS side

```bash
hs upload mdd-theme mdd-theme
hs upload mdd-quote-theme mdd-quote-theme
```

Then, and this is the step that causes confusion — **"quote template" means two things:**

| | Name | How it's created |
|---|---|---|
| The CMS design file | `MDD - System Quote (Buy / Lease)` | `hs upload` |
| The quote template **record** | what quotes associate to (typeId 286) | **Settings → Objects → Quotes → Quote templates → Create. UI only, no API.** |

Uploading the file does not create the record. Create the record, grab its id from the URL,
and set it as `MDD_QUOTE_TEMPLATE_ID` (or change the default in `create-quote.js`). Until
then everything points at the existing `mddQuote` record, id `435681411161`.

Also: publish a page from `MDD - Quote Options (Buy vs Lease)` at URL **`/quote-options`** —
must match `MDD_CHOOSER_BASE`.

Secrets, via `hs secrets add`: `HUBSPOT_QUOTE_TOKEN`, `MDD_QUOTE_SIGNING_SECRET`
(`openssl rand -base64 32`), `MDD_REP_KEY` (must match `mdd_rep_key` in `demo.html`; reps never type it).

**Serverless functions require Content Hub Enterprise.** If `hs upload` rejects `functions/`,
the portal is on Professional and the handlers need to move to a Cloudflare Worker — they're
plain Node, the adapter is ~20 lines (mapping documented in SETUP.md). Also update
`MDD_QUOTE_API` in `demo.html`, `API` in `quote-chooser.html`, and `ALLOWED_ORIGINS` in
`lib/respond.js`.

## Task 3 — verify the quote template renders

**Before trusting it, preview a real quote with `?mddDebug=1`.** HubSpot documents custom
quote property access only for *enumeration* types; number and text types are undocumented.
`qprop()` in `mdd-system-quote.html` reads both `custom_properties.<name>` and `<name>`
directly. The debug block prints the actual dict and the resolved values — use it to settle
which path fires, then simplify. If values render blank, that's the first place to look.

Three template details already fixed, don't regress them:
- CSS is **inlined** in a `<style>` block. `{% include %}` on a `.css` file is not supported —
  it dumps raw text unwrapped, and the PDF pipeline is unforgiving.
- `format_currency_value` takes **camelCase** args (`minDecimalDigits`, `maxDecimalDigits`).
  Snake_case is silently wrong.
- `datetimeformat('%B %e, %Y')` is deprecated-but-working. If it ever breaks, migrate to
  `format_datetime` with an **LDML** pattern (`MMMM d, yyyy`) — the `%B` string won't error,
  it'll just emit garbage.

## Task 4 — resolve pricing (needs Colin, not you)

Catalog is source of truth and **disagrees with the demo slide**. Reference deal: Buy drops
$45,160 → **$43,109.64**; Lease rises $1,817 → **$1,860/mo**. Full table in
PRICING-RECONCILIATION.md. Priority order:

1. **Install: $5,000 on the slide vs $1,500 in the catalog.** Currently overridden to $5,000
   rather than silently cutting $3,500 off every quote. Biggest gap — settle first.
2. **Module add-ons.** Catalog has Service ($200/mo) and Recon ($200/mo); slide charges a flat
   $695 regardless. Currently `includedInFlatMonthly: true` so they're not billed separately —
   flipping it takes the reference deal's monthly to $1,095.
3. Tags/placards cheaper in catalog; gateways pricier and split across two SKUs at a **guessed
   70/30** indoor/outdoor ratio.
4. **VehicleVault is value-only** — ticking it raises ROI but adds no line item. Left out of
   quotes deliberately; needs a sizing rule before it can be quoted.

All fixable in `pricing-map.json`. Reps see an automatic drift warning on the slide until
slide and catalog converge.

## Rules

- **Never invent pricing, testimonials, ROI figures, or customer names.** Everything traces to
  the HubSpot catalog or mdd.io / mobiledealerdata.com. Use `[CONTENT NEEDED: …]` placeholders.
- **`lib/calc.js` and `qCalc()` in `demo.html` are two copies of the same maths.** Change one,
  change the other in the same commit. Parity script in QA-CHECKLIST.md.
- **The browser never sends a price.** It sends dealership inputs and a deal ID; everything
  with a dollar sign is computed server-side from the catalog. Keep it that way.
- `hubspot.config.yml` and `.env` are gitignored and hold live credentials — never commit,
  never echo them.
- **Countersigners cannot be set via API** — configure on the quote template in the UI.
- Work through QA-CHECKLIST.md before rollout; the quote-document section is gated on the
  `?mddDebug=1` check.

## Start here

Run `node scripts/quote-system/test-quote-flow.js doctor` and tell me what it says.
