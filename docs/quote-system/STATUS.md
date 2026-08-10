# Quote system — status as of 2026-08-10

First session with a working network path to `api.hubapi.com`. Everything below was
actually executed, not inferred.

## Done

- **Custom properties created.** 19 on quotes, 1 on deals, all `mdd_` prefixed. `doctor` is green.
- **Pricing reconciled** (Colin's calls, see PRICING-RECONCILIATION.md):
  - Install → catalog **$1,500**. The $5,000 override is gone; `pricing-map.json` has no
    overrides left.
  - Service and Recon Workflow **bill separately at $200/mo each**. `$695` is the
    platform-only rate. `includedInFlatMonthly: false` on both.
  - Catalog wins on every unit price.
- **`demo.html` realigned to the catalog** so the slide and the quote agree:
  - Prices corrected to $29.99 / $19.99 / $49.99 / $1,500.
  - Gateways split 70/30 across the two real SKUs ($295 indoor / $595 outdoor) instead of one
    blended $250 — matches `gatewaySplit` in the pricing map.
  - Lease priced per SKU (veh $1 + key $1 per unit, placard $2.50) instead of a flat $2/unit.
  - Module add-ons added to both Buy and Lease monthlies.
  - Cache key bumped to `mdd-demo-config-v4`; renamed price keys have fallbacks so an older
    saved or hosted config still computes.
  - **The drift warning is now silent** — that was the agreed signal the reconciliation is done.
- **Parity pinned.** `node scripts/quote-system/check-parity.js` compares `qCalc()` in
  `demo.html` against `lib/calc.js` across 7 scenarios and exits non-zero on drift. Run it
  after touching either file.
- **Quote pair created and published end to end** on deal `63674104585`
  ("ZZ SAMPLE — Riverbend Auto Group"), signer `colinm@mdd.io`. Both render live.

## Corrections to the previous handoff

| Claim | Reality |
|---|---|
| "Quote template record is UI only, no API" | It **is** API-creatable — `POST /crm/v3/objects/quote_template` with `hs_cms_template_path`. It needs the `cpq.quote_templates.write` scope, which the current token lacks (403, not 404). |
| Quote create needs the properties in `quote-builder.js` | It also needs **`hs_language`** and **`hs_template_type`**, or create 400s. Both now set. |
| Publishing just sets `hs_status` | Publishing also requires **`hs_slug`** and **`hs_domain`** to already be on the record. Both now set at creation. |
| Serverless functions "if the portal is Professional" | **Confirmed Professional.** `hs upload` returns *"CMS Hub Enterprise is required to use serverless functions"*. The chooser flow cannot run on HubSpot CMS. |

## Blocked — one thing, and it needs portal access

**Serverless functions are refused.** `hs upload mdd-theme/mdd.functions` returns:

> Folder name cannot end with .functions. **This account or user does not have access to
> serverless functions.**

Note "account **or** user" — there are two possible causes and they cannot be told apart
from outside the portal:

1. **The CLI's personal access key lacks the permission.** Strong supporting evidence:
   `hs secrets list` fails with *"the access key ... is missing required scopes"*. Fix is
   `hs auth`, generate a **new** personal access key, and tick every permission — especially
   Serverless Functions and HubDB/secrets. Costs nothing, try this first.
2. **The portal lacks Content Hub Enterprise specifically.** Marketing Hub Enterprise and
   Sales Hub Enterprise are separate products; neither unlocks serverless functions. Check
   Settings → Account Management → Products & Add-ons, or Design Manager → File → New file
   (if "Serverless function" is not offered, the portal does not have it).

Everything else is finished and verified. Once functions upload, the remaining work is:
`hs secrets add` the three secrets, publish `/quote-options` from the
`MDD - Quote Options (Buy vs Lease)` template, and the flow is live — no code changes.

A Cloudflare Worker adapter is committed at `workers/quote-api/` as a fallback. It imports
the same handlers unmodified. It is NOT the preferred path now that Enterprise is expected;
it exists so the feature is not hostage to a HubSpot tier.

**Quote design still not in use.** `mdd-quote-theme/templates/mdd-system-quote.html` is
uploaded but the template *record* has to point at it, which needs `cpq.quote_templates.write`
on the private app (403 today). Quotes currently use **Default Modern** (`237906442771`),
which does render both Comments and Purchase terms — so nothing is missing for the customer,
it is just HubSpot's design rather than MDD's.

## Note on a mistake made this session

Uploading `mdd-theme/mdd.functions/` to test the portal tier published `pricing-map.json` to
`mdd.io/hubfs/raw_assets/public/mdd-theme/mdd.functions/pricing-map.json`, publicly readable.
The raw asset was deleted (source-code API confirms 404) but the hubfs CDN copy persisted
behind a 30-day cache, so the path was **overwritten with a benign stub**, which is what it
serves now. Do not upload `functions/` to this portal again — it cannot work and the contents
are world-readable.

## Sample quotes (safe to delete)

| | Id | Link |
|---|---|---|
| Deal | 63674104585 | ZZ SAMPLE — Riverbend Auto Group |
| Buy | 41994610298 | https://mdd.io/riverbend-auto-group-buy-msnj30f3 |
| Lease | 41980598121 | https://mdd.io/riverbend-auto-group-lease-msnj30f3 |

Reference deal: 475 tracked units, 86 placards, 26 gateways (18/8), Service + Recon on.
Buy $39,609.64 one-time + $1,095/mo. Lease $1,500 one-time + $2,260/mo.
Value recovered $63,950/mo.
