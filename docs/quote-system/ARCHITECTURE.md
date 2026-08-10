# MDD Quote System — architecture

How a System Builder session on `mdd.io/sales-demo` becomes a signed quote in HubSpot.

## The constraint that shapes everything

HubSpot has **no buyer-selectable optional line items**. Verified three ways:

- No `hs_is_optional` / `hs_buyer_selectable` property exists on the LINE_ITEM object in
  portal 585393. The only adjacent property, `hs_allow_buyer_selected_quantity`, is a
  payment-links feature.
- No quotes or CPQ documentation mentions optional items; it is still an open
  [HubSpot Ideas request](https://community.hubspot.com/t5/HubSpot-Ideas/Optional-Line-Items-for-Quotes/idi-p/568106).
- **Publishing a quote sets `hs_locked = true`.** Line items and totals are frozen. Even a
  custom UI toggle could not change what the buyer actually signs.

So "one quote where the buyer picks Buy or Lease and then signs" cannot be built honestly.
Anything that looks like it would let a buyer sign a document whose CRM amount disagrees
with their selection.

## What we built instead

Two drafts, one decision, one signable quote.

```
  System Builder slide (demo.html §13)
      │  [Create Quote]  ── POST /_hcms/api/mdd/create-quote
      │                     (inputs + dealId only; no prices)
      ▼
  create-quote.js
      1. verify rep key
      2. recompute all sizing + value maths server-side
      3. read live unit prices from the HubSpot product catalog
      4. create line items → Buy set and Lease set
      5. create TWO quotes, both hs_status = DRAFT
         associate: template(286) deal(64) line_items(67) signer(702) company(71)
      6. return a signed, expiring chooser URL
      ▼
  Rep sends the chooser link to the buyer
      ▼
  quote-chooser.html   ── GET /_hcms/api/mdd/quote-options?t=…
      Buy and Lease side by side, with the system sizing and the value model.
      Buyer clicks one.
      ▼
  quote-select.js  ── POST /_hcms/api/mdd/quote-select
      1. verify token
      2. chosen quote  → hs_status = APPROVAL_NOT_NEEDED   (this publishes it)
      3. other quote   → hs_status = VOID                  (can never be signed)
      4. deal          → mdd_purchase_option + amount = year-1 total
      5. return hs_quote_link
      ▼
  Buyer lands on the published MDD quote and signs.
```

Properties of this design:

- Exactly one quote is ever signable. The other is voided before the buyer reaches signing.
- The deal amount matches what the buyer chose, automatically.
- The buyer makes one click, then signs. No second email, no rep round-trip.
- The decision is timestamped in HubSpot on both the quote and the deal.
- Idempotent: re-opening the chooser link after a decision forwards to the live quote
  rather than trying to republish a locked one.

## Why `APPROVAL_NOT_NEEDED`

On legacy quotes this is the status that actually makes a quote live at a public URL.
`APPROVED` also publishes but implies an approval workflow ran. `DRAFT` stays editable and
has no `hs_quote_link`. `hs_quote_link` and `hs_pdf_download_link` are only populated after
publish, which is why `quote-select.js` re-reads the quote before returning.

## Trust boundary

The browser never sends a price. It sends dealership inputs and a deal ID; everything with
a dollar sign is computed in `create-quote.js` from the HubSpot product catalog. A rep
cannot alter a quote by editing the page, and neither can anyone else who finds the
endpoint.

Three secrets, all HubSpot CMS secrets, never in the repo:

| Secret | Purpose |
|---|---|
| `HUBSPOT_QUOTE_TOKEN` | Private app token for the CRM writes |
| `MDD_QUOTE_SIGNING_SECRET` | HMAC key for chooser links |
| `MDD_REP_KEY` | Shared key rendered into the password-protected demo page by HubL. Reps never type it. Must match `mdd_rep_key` at the top of `demo.html`. |

Chooser tokens are HMAC-SHA256 over `{buyId, leaseId, dealId, exp}`, expire with the quote
(default 30 days), and are compared in constant time. They carry no pricing, so a leaked
link exposes a quote the buyer was already entitled to see.

## Files

| Path | Role |
|---|---|
| `mdd-theme/mdd.functions/create-quote.js` | Builds both draft quotes |
| `mdd-theme/mdd.functions/quote-options.js` | Feeds the chooser page |
| `mdd-theme/mdd.functions/quote-select.js` | Publishes one, voids the other |
| `mdd-theme/mdd.functions/lib/calc.js` | Server-side mirror of `qCalc()` |
| `mdd-theme/mdd.functions/lib/hubspot.js` | CRM client, association IDs, status enum |
| `mdd-theme/mdd.functions/lib/token.js` | HMAC sign/verify |
| `mdd-theme/mdd.functions/pricing-map.json` | SKU ↔ System Builder mapping (**edit this, not code**) |
| `mdd-theme/templates/quote-chooser.html` | Buyer-facing decision page |
| `mdd-theme/templates/demo.html` | Patched: Create Quote panel on §13 |
| `mdd-quote-theme/templates/mdd-system-quote.html` | The quote document itself (CSS inlined — see note) |
| `scripts/quote-system/create-quote-properties.js` | Creates the custom properties |
| `scripts/quote-system/patch-demo-create-quote.js` | Re-applies the demo.html patch |

## Known limits

- **Countersigners cannot be set via API.** If MDD needs to countersign, configure it on
  the quote template in the HubSpot UI; it applies to every quote using that template.
- **`calc.js` and `qCalc()` in demo.html are two copies of the same maths.** Change one,
  change the other in the same commit. The parity test in `QA-CHECKLIST.md` catches drift.
- **Serverless functions require Content Hub Enterprise.** If the portal is on Professional,
  `hs upload` will reject the `functions/` folder — see `SETUP.md` for the fallback.
- One chooser link per Create Quote click. Clicking Create Quote twice makes a second pair
  of drafts; delete the stale pair in HubSpot.
- **The quote template's CSS is inlined in a `<style>` block**, not a separate file.
  `{% include %}` on a `.css` file is not a supported HubL pattern — it dumps raw CSS with no
  `<style>` wrapper — and the quote PDF pipeline is the least forgiving place to depend on an
  external stylesheet. Edit the styles inside `mdd-system-quote.html`.

## One thing to verify in preview before you trust it

HubSpot documents custom quote property access **only for enumeration properties**
(`template_data.quote.custom_properties.<name>`, returning `{label, internal}`). Number and
text custom properties are not documented at all. The template's `qprop()` macro therefore
reads both `custom_properties.<name>` and `<name>` directly, which covers either behaviour.

Before rolling out, open a real quote in preview with **`?mddDebug=1`** appended. The template
prints the actual `custom_properties` dict and the resolved values. If one path is clearly
correct, simplify `qprop()` to it. If values render blank on a live quote, that debug block is
where to look first.
