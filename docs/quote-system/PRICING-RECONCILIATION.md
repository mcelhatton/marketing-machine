# Pricing reconciliation — decisions needed

> **RESOLVED 2026-08-10.** Colin's calls: install = catalog **$1,500**; Service and Recon
> Workflow **bill separately at $200/mo each** ($695 is platform-only); catalog wins on every
> unit price. `pricing-map.json` now carries **no overrides**, and `demo.html` was realigned to
> match, so the slide and the quote agree and the drift warning is silent. Only VehicleVault
> (decision 5) is still open. The tables below are kept as the record of what changed.

The System Builder slide carries its own price list. The HubSpot product catalog carries a
different one. You chose the catalog as the source of truth, so **quotes will not match the
numbers your reps currently see on the slide** until these are resolved.

Reference deal: 300 new + 150 used + 25 loaners = **475 tracked units**, 1,500 ROs/month,
$150/hr labour, Service + Recon on. That sizes to 86 placards and 26 gateways — identical
in both systems. Only the money differs.

## Buy — one-time

| Item | Qty | Slide price | Catalog price | Slide total | Catalog total |
|---|---:|---:|---:|---:|---:|
| Vehicle tracking tags | 475 | $40.00 | **$29.99** | $19,000.00 | $14,245.25 |
| Key tracking tags | 475 | $20.00 | **$19.99** | $9,500.00 | $9,495.25 |
| Service placards | 86 | $60.00 | **$49.99** | $5,160.00 | $4,299.14 |
| Gateways — indoor | 18 | $250.00 | **$295.00** | — | $5,310.00 |
| Gateways — outdoor | 8 | $250.00 | **$595.00** | — | $4,760.00 |
| *(slide models one blended gateway)* | 26 | $250.00 | — | $6,500.00 | — |
| Installation & On-Boarding | 1 | $5,000.00 | $1,500.00 | $5,000.00 | **$5,000.00** † |
| **Total** | | | | **$45,160.00** | **$43,109.64** |

† Currently overridden to the slide's $5,000 — see decision 2.

## Lease — monthly

| Item | Qty | Slide price | Catalog price | Slide total | Catalog total |
|---|---:|---:|---:|---:|---:|
| Vehicle tag lease | 475 | $1.00 | $1.00 | $475.00 | $475.00 |
| Key tag lease | 475 | $1.00 | $1.00 | $475.00 | $475.00 |
| Placard lease | 86 | $2.00 | **$2.50** | $172.00 | $215.00 |
| MDD Locate monthly | 1 | $695.00 | $695.00 | $695.00 | $695.00 |
| **Total / month** | | | | **$1,817.00** | **$1,860.00** |

Net effect on the reference deal: Buy drops **$2,050**, Lease rises **$43/month**.

---

## Decisions

Each has a one-line fix in `mdd-theme/mdd.functions/pricing-map.json`. Nothing here needs a
code change.

### 1. Hardware unit prices — catalog is lower

Vehicle tags, key tags and placards are all cheaper in the catalog than on the slide. Either
the catalog is stale, or reps have been quoting above list.

- **Catalog wins (current setting).** Nothing to do. Reps will see the drift warning on the
  slide after clicking Create Quote.
- **Slide wins.** Update the three products in HubSpot to $40 / $20 / $60. Preferred if the
  slide reflects current street pricing — it fixes the catalog for everyone, not just quotes.

### 2. Install — $5,000 vs $1,500 ⚠️ **biggest gap**

`Installation & On-Boarding` is $1,500 in the catalog and $5,000 on the slide. I set this to
**override at $5,000** rather than silently cutting $3,500 off every quote. This is the one
item you should not leave as-is.

- If **$5,000** is right: update the HubSpot product to $5,000, then set
  `buy.install.priceSource` and `lease.install.priceSource` back to `"catalog"`.
- If **$1,500** is right: set both to `"catalog"` now and correct the slide default `pInstall`.
- If install genuinely varies by rooftop count, it should become a quantity-driven line
  (`qtyFrom: "rooftops"`) rather than a flat fee. Say the word and I'll wire it.

### 3. Gateways — one blended price vs two real SKUs

The slide models a single $250 gateway. The catalog has indoor at $295 and outdoor at $595.
I split the auto-calculated count 70/30 indoor/outdoor (`gatewaySplit` in the pricing map).

That ratio is a guess. If your site surveys show a different typical mix, change it. Reps can
also override per-quote — pass `gatewayIndoorOverride` / `gatewayOutdoorOverride`, which
`calc.js` already accepts but the slide does not yet expose. Worth adding two inputs to the
Pricing panel if the mix varies much by dealer.

### 4. Module add-ons — currently not billed separately

The catalog has `Service Workflow Monthly Add-on` ($200/mo) and `Recon Workflow Monthly
Add-on` ($200/mo). The slide charges a **flat $695/month regardless of module selection**.

Set to `includedInFlatMonthly: true`, so they do not appear as charges. On the reference deal
(Service + Recon both on) billing them separately would take the monthly from $695 to $1,095.

- Flat $695 is the real offer → leave it, but consider showing the add-ons as $0 line items
  so the buyer sees what they are getting.
- Modules are genuinely priced separately → set `includedInFlatMonthly: false` on both, and
  drop the slide's `pMoFlat` to the true platform-only rate.

### 5. VehicleVault — modelled but never quoted

The System Builder treats VehicleVault as **value only** (`pVVPreload` / `pVVUpgrade` drive
the ROI figure). No investment line is produced, so ticking the VehicleVault module raises the
value recovered without raising the price. The catalog has `Vehicle Vault Box Package
(25 count)` at $2,499.75.

Left out of quotes deliberately — adding it silently would change what your reps are pitching.
If VehicleVault should be quoted, tell me how it is sized (packages of 25 against which
inventory count?) and I'll add it to both option sets.

### 6. Lease placard — $2.00 vs $2.50

Smallest gap, easiest call. The slide charges $2/month for *everything* including placards;
the catalog prices placard lease at $2.50. Catalog currently wins. If $2 flat is the real
offer, update the catalog product.

---

## Recommended order

1. Settle **install** (decision 2) — largest single gap.
2. Settle **module add-ons** (decision 4) — changes the monthly, the number buyers anchor on.
3. Fix the catalog to match reality for the rest, so the slide and quotes converge.
4. Once catalog and slide agree, delete every `override` from the pricing map. The drift
   warning on the slide going quiet is the signal you're done.
