/**
 * Server-side mirror of the System Builder maths in
 * mdd-theme/templates/demo.html  ->  qCalc()
 *
 * IMPORTANT: the browser is never trusted for money. The demo page sends
 * only the dealership INPUTS; every derived number below is recomputed here
 * and again by HubSpot when it totals the line items.
 *
 * If you change qCalc() in demo.html you MUST change this file in the same
 * commit. tests/calc.parity.test.js pins the two together.
 */

'use strict';

const n = (v) => (Number.isFinite(+v) ? +v : 0);

/** What gets tagged. Drives how many tags each tracked unit needs. */
const TAG_MODES = ['car', 'key', 'both'];

/** Inputs accepted from the demo page. Anything else is ignored. */
const INPUT_KEYS = [
  'dealer', 'rooftops', 'salesUnits', 'serviceUnits', 'loaners', 'usedSoldMo',
  'serviceROs', 'laborRate', 'sellThrough', 'gatewaysOverride',
  'tagMode',
  'modLocate', 'modLot', 'modService', 'modRecon', 'modVV',
  'minPerRO', 'reconDaysCut', 'holdingCost',
  'lostKeysMo', 'keyReplaceCost', 'lostDealsMo', 'grossPerDeal',
  'discountType', 'discountValue', 'quickClose',
  'gatewayIndoorOverride', 'gatewayOutdoorOverride',
  // Superseded by salesUnits/serviceUnits. Still accepted so an older saved
  // config, or a link built before the change, keeps producing a correct quote.
  'newInv', 'usedInv'
];

const TEXT_KEYS = { dealer: 200, tagMode: 10, discountType: 10 };
const BOOL_PREFIX = /^(mod|quickClose)/;

function sanitizeInputs(raw) {
  const out = {};
  for (const k of INPUT_KEYS) {
    if (!(k in (raw || {}))) continue;
    const v = raw[k];
    // An explicitly-undefined value means "not supplied" — treating it as 0
    // silently zeroed the legacy new/used inventory fallback.
    if (v === undefined) continue;
    if (k in TEXT_KEYS) out[k] = String(v == null ? '' : v).trim().slice(0, TEXT_KEYS[k]);
    else if (BOOL_PREFIX.test(k)) out[k] = !!v;
    else out[k] = Math.max(0, n(v));
  }

  // Legacy new+used inventory folds into the single sales figure.
  if (out.salesUnits == null && (out.newInv != null || out.usedInv != null)) {
    out.salesUnits = n(out.newInv) + n(out.usedInv);
  }

  if (!TAG_MODES.includes(out.tagMode)) out.tagMode = 'both';
  if (!['percent', 'amount'].includes(out.discountType)) out.discountType = 'none';

  return out;
}

/**
 * Hardware sizing + value model. Pure function of the dealership inputs.
 * Prices are NOT applied here - see buildLineItems().
 */
function sizeSystem(q, split) {
  // Tags cover the vehicles being sold. Service units are handled by reusable
  // placards instead, so they deliberately do NOT add tags.
  const units = n(q.salesUnits) + n(q.loaners);

  // One tag per unit for car-only or key-only; two when both are tracked.
  const tagsCar = q.tagMode === 'car' || q.tagMode === 'both';
  const tagsKey = q.tagMode === 'key' || q.tagMode === 'both';
  const vehicleTags = tagsCar ? units : 0;
  const keyTags = tagsKey ? units : 0;

  // Placards only exist when Service Workflow is in scope. Service units drive
  // the count directly; the RO-based estimate is only a fallback for when the
  // rep has not been given a service-unit figure.
  const placards = q.modService
    ? (n(q.serviceUnits) > 0
      ? n(q.serviceUnits)
      : Math.max(10, Math.ceil((n(q.serviceROs) / 22) * 1.25)))
    : 0;

  // Gateway estimate: 15 at 200 units, +20 per 500 units, clamped 15..35.
  // Final count is confirmed by the free site survey.
  const gatewaysAuto = Math.round(Math.min(35, Math.max(15, 15 + ((units - 200) / 500) * 20)));
  const gateways = n(q.gatewaysOverride) > 0 ? n(q.gatewaysOverride) : gatewaysAuto;

  // Split the blended count across the two catalog SKUs.
  let gatewaysIndoor;
  let gatewaysOutdoor;
  if (n(q.gatewayIndoorOverride) > 0 || n(q.gatewayOutdoorOverride) > 0) {
    gatewaysIndoor = n(q.gatewayIndoorOverride);
    gatewaysOutdoor = n(q.gatewayOutdoorOverride);
  } else {
    const ratio = (split && split.indoorRatio) || 0.7;
    gatewaysIndoor = Math.round(gateways * ratio);
    gatewaysOutdoor = gateways - gatewaysIndoor;
  }

  // Units carrying a monthly lease charge = tracked vehicles + placards.
  const leaseUnits = units + placards;

  return {
    units, vehicleTags, keyTags, placards,
    gateways, gatewaysAuto, gatewaysIndoor, gatewaysOutdoor,
    leaseUnits,
    tagsPerUnit: (tagsCar ? 1 : 0) + (tagsKey ? 1 : 0),
    // Quick Close is always three months, so the quantity is fixed.
    quickCloseMonths: q.quickClose ? 3 : 0,
    one: 1
  };
}

/**
 * Monthly value recovered. Mirrors qCalc() exactly.
 * VehicleVault needs its own package pricing, which the System Builder holds
 * locally (pVVPreload / pVVUpgrade) - those are passed through as vvPerPkg.
 */
function valueModel(q, sizing, vvPerPkg) {
  const svcValue = q.modService
    ? n(q.serviceROs) * (n(q.minPerRO) / 60) * n(q.laborRate)
    : 0;

  // Paper hang tags eliminated - flat modelled saving when Service is in scope.
  const placardValue = q.modService ? 500 : 0;

  const reconValue = q.modRecon
    ? n(q.usedSoldMo) * n(q.reconDaysCut) * n(q.holdingCost)
    : 0;

  // Keys stop getting replaced once every key is findable. Dealer-supplied
  // count x their own replacement cost - no industry average is assumed.
  const lostKeyValue = n(q.lostKeysMo) * n(q.keyReplaceCost);

  // Deals lost because the car or the key could not be found in time.
  const lostDealValue = n(q.lostDealsMo) * n(q.grossPerDeal);

  const vvInventory = n(q.salesUnits);
  const vvPackages = q.modVV ? vvInventory * 0.60 * (n(q.sellThrough) / 100) : 0;
  const vvValue = q.modVV ? vvPackages * n(vvPerPkg) : 0;

  const totalValue = svcValue + placardValue + reconValue + lostKeyValue + lostDealValue + vvValue;

  return {
    svcValue, placardValue, reconValue,
    lostKeyValue, lostDealValue,
    vvInventory, vvPackages, vvPerPkg: n(vvPerPkg), vvValue,
    totalValue,
    annualValue: totalValue * 12
  };
}

/** Resolve a unit price for a pricing-map entry against the live catalog. */
function resolvePrice(entry, catalogPriceById) {
  if (entry.priceSource === 'override' && entry.overridePrice != null) {
    return { price: n(entry.overridePrice), source: 'override' };
  }
  const live = catalogPriceById[entry.productId];
  if (live != null) return { price: n(live), source: 'catalog' };
  // Catalog lookup failed - fall back to the pinned snapshot rather than $0.
  return { price: n(entry.catalogPrice), source: 'snapshot' };
}

/**
 * Build the line item set for one purchase option.
 * option: 'buy' | 'lease'
 * Returns { lines: [...], oneTime, monthly }
 */
/**
 * Which block a line belongs to on the quote.
 *
 * Buyers read a quote as "what do I pay every month" and "what do I pay once",
 * so the document is grouped that way rather than in catalog order. Install is
 * split out from the rest of the one-time spend because it is a service, not
 * hardware, and it is the line most often questioned.
 */
const GROUPS = ['monthly', 'hardware', 'install', 'offer'];

function groupFor(key, entry) {
  if (entry.billing === 'monthly') return 'monthly';
  if (key === 'install') return 'install';
  return 'hardware';
}

function buildLineItems(option, map, sizing, q, catalogPriceById) {
  const group = map[option];
  const lines = [];
  const warnings = [];

  const push = (key, entry) => {
    if (entry.requiresModule && !q[entry.requiresModule]) return;
    const qty = entry.qtyFrom === 'one' ? 1 : n(sizing[entry.qtyFrom]);
    if (qty <= 0) return;

    const { price, source } = resolvePrice(entry, catalogPriceById);
    if (source === 'snapshot') {
      warnings.push(`Catalog lookup failed for ${entry.name} (product ${entry.productId}); used pinned price $${price}.`);
    }
    lines.push({
      key,
      hs_product_id: entry.productId,
      name: entry.name,
      quantity: qty,
      price,
      billing: entry.billing,
      group: groupFor(key, entry),
      priceSource: source,
      amount: +(qty * price).toFixed(2)
    });
  };

  for (const [key, entry] of Object.entries(group)) push(key, entry);

  // Module add-ons are shared between buy and lease.
  for (const [key, entry] of Object.entries(map.addons || {})) {
    if (entry.includedInFlatMonthly) continue; // rolled into the flat platform fee
    push(key, entry);
  }

  // Group the quote: monthly, then hardware, then install. Catalog order is
  // preserved inside each block, so related SKUs still sit together.
  lines.sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group));

  // ── One-time discount off hardware ───────────────────────────────────────
  // HubSpot rejects negative prices, so a discount cannot be its own credit
  // line. It is applied as hs_discount_percentage on each hardware line, which
  // renders as "$X after N% discount". A fixed-dollar discount is converted to
  // the equivalent percentage of the hardware subtotal - verified exact to the
  // cent at 4 decimal places.
  const hardware = lines.filter((l) => l.group === 'hardware');
  const hardwareSubtotal = +hardware.reduce((s, l) => s + l.amount, 0).toFixed(2);

  let discountPct = 0;
  if (q.discountType === 'percent') {
    discountPct = Math.min(100, Math.max(0, n(q.discountValue)));
  } else if (q.discountType === 'amount' && hardwareSubtotal > 0) {
    const capped = Math.min(n(q.discountValue), hardwareSubtotal);
    discountPct = +(capped / hardwareSubtotal * 100).toFixed(4);
  }

  let discountAmount = 0;
  if (discountPct > 0) {
    for (const l of hardware) {
      l.discountPercent = discountPct;
      l.discountAmount = +(l.amount * discountPct / 100).toFixed(2);
      l.amount = +(l.amount - l.discountAmount).toFixed(2);
      discountAmount = +(discountAmount + l.discountAmount).toFixed(2);
    }
  }

  // ── Quick Close: 3 months of platform service free ───────────────────────
  // Shown as a real line at full price with a 100% discount, so the buyer sees
  // what they are being given rather than an invisible price cut. Capped at
  // $695/month regardless of the platform rate.
  const QUICK_CLOSE_CAP = 695;
  const QUICK_CLOSE_MONTHS = 3;
  let quickCloseValue = 0;

  if (q.quickClose) {
    const platform = (map[option] || {}).platformMonthly;
    if (platform) {
      const { price } = resolvePrice(platform, catalogPriceById);
      const rate = Math.min(QUICK_CLOSE_CAP, price);
      if (rate > 0) {
        quickCloseValue = +(rate * QUICK_CLOSE_MONTHS).toFixed(2);
        lines.push({
          key: 'quickClose',
          // Deliberately NOT linked to the platform product. A line item created
          // from that product inherits recurringbillingfrequency=monthly and
          // HubSpot will not let it be overridden, which would file this credit
          // under the monthly charges. A product-less line stays one-time.
          hs_product_id: null,
          name: `Quick Close offer - ${QUICK_CLOSE_MONTHS} months ${platform.name} included`,
          quantity: QUICK_CLOSE_MONTHS,
          price: rate,
          billing: 'one_time',
          group: 'offer',
          priceSource: 'catalog',
          discountPercent: 100,
          discountAmount: quickCloseValue,
          amount: 0
        });
      }
    }
  }

  const oneTime = +lines.filter((l) => l.billing === 'one_time')
    .reduce((s, l) => s + l.amount, 0).toFixed(2);
  const monthly = +lines.filter((l) => l.billing === 'monthly')
    .reduce((s, l) => s + l.amount, 0).toFixed(2);

  return {
    lines, oneTime, monthly, warnings,
    hardwareSubtotal, discountPct, discountAmount, quickCloseValue
  };
}

/**
 * Full quote model for both options.
 * catalogPriceById: { "24668726200": 29.99, ... } fetched live from HubSpot.
 */
function buildQuoteModel(rawInputs, map, catalogPriceById, vvPerPkg) {
  const q = sanitizeInputs(rawInputs);
  const sizing = sizeSystem(q, map.gatewaySplit);
  const value = valueModel(q, sizing, vvPerPkg);

  const buy = buildLineItems('buy', map, sizing, q, catalogPriceById);
  const lease = buildLineItems('lease', map, sizing, q, catalogPriceById);

  const buyNet = +(value.totalValue - buy.monthly).toFixed(2);
  const leaseNet = +(value.totalValue - lease.monthly).toFixed(2);
  const payback = buy.oneTime > 0 && buyNet > 0 ? buy.oneTime / buyNet : 0;

  return {
    inputs: q,
    sizing,
    value,
    options: {
      buy: {
        label: 'Buy - own the hardware',
        oneTime: buy.oneTime,
        monthly: buy.monthly,
        netValuePerMonth: buyNet,
        paybackMonths: +payback.toFixed(2),
        paybackLabel: payback === 0 ? null : payback < 1 ? '< 1 month' : `${payback.toFixed(1)} months`,
        // First-year total contract value, used as the HubSpot deal amount.
        year1Total: +(buy.oneTime + buy.monthly * 12).toFixed(2),
        hardwareSubtotal: buy.hardwareSubtotal,
        discountPct: buy.discountPct,
        discountAmount: buy.discountAmount,
        quickCloseValue: buy.quickCloseValue,
        // Everything the dealer actually pays inside the 90-day money-back
        // window. Quick Close waives the platform fee for those same 3 months,
        // so it comes straight off the number at risk.
        first90: +(buy.oneTime + buy.monthly * 3 - buy.quickCloseValue).toFixed(2),
        lines: buy.lines
      },
      lease: {
        label: 'Lease - hardware in the monthly',
        oneTime: lease.oneTime,
        monthly: lease.monthly,
        netValuePerMonth: leaseNet,
        paybackMonths: 0,
        paybackLabel: null,
        year1Total: +(lease.oneTime + lease.monthly * 12).toFixed(2),
        hardwareSubtotal: lease.hardwareSubtotal,
        discountPct: lease.discountPct,
        discountAmount: lease.discountAmount,
        quickCloseValue: lease.quickCloseValue,
        first90: +(lease.oneTime + lease.monthly * 3 - lease.quickCloseValue).toFixed(2),
        lines: lease.lines
      }
    },
    warnings: [...buy.warnings, ...lease.warnings]
  };
}

module.exports = {
  sanitizeInputs, sizeSystem, valueModel,
  resolvePrice, buildLineItems, buildQuoteModel,
  INPUT_KEYS
};
