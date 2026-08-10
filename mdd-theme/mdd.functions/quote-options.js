/**
 * GET /_hcms/api/mdd/quote-options?t=<signed token>
 *
 * Public, unauthenticated but token-gated. Feeds the buyer-facing chooser page
 * with the two options so it can render Buy vs Lease side by side.
 *
 * Returns only presentation data - no internal ids beyond the quote ids that
 * are already inside the signed token, no cost or margin fields.
 */

'use strict';

const { client } = require('./lib/hubspot.js');
const { verify } = require('./lib/token.js');
const { publicQuoteUrl } = require('./lib/quote-builder.js');
const { ok, fail, safeError } = require('./lib/respond.js');

const QUOTE_PROPS = [
  'hs_title', 'hs_status', 'hs_quote_amount', 'hs_quote_link', 'hs_domain', 'hs_slug', 'hs_expiration_date',
  'mdd_purchase_option', 'mdd_dealer_name', 'mdd_tracked_units', 'mdd_rooftops',
  'mdd_vehicle_tags', 'mdd_key_tags', 'mdd_placards', 'mdd_gateways', 'mdd_modules',
  'mdd_monthly_value', 'mdd_annual_value', 'mdd_value_breakdown',
  'mdd_net_value_monthly', 'mdd_payback_label',
  'mdd_one_time_total', 'mdd_monthly_total', 'mdd_year1_total'
];

const num = (v) => (v == null || v === '' ? 0 : Number(v));

/**
 * The line items on a quote, in the order HubSpot will bill them.
 *
 * Read back from the quote's own line items rather than recomputed, so what the
 * buyer reads on the chooser is literally what the signed document charges -
 * they cannot drift.
 */
async function lineItemsFor(hs, quoteId) {
  const assoc = await hs.call('GET',
    `/crm/v4/objects/quotes/${encodeURIComponent(quoteId)}/associations/line_items?limit=100`
  ).catch(() => ({ results: [] }));

  const ids = (assoc.results || []).map((r) => r.toObjectId);
  if (!ids.length) return [];

  const batch = await hs.call('POST', '/crm/v3/objects/line_items/batch/read', {
    properties: ['name', 'quantity', 'price', 'amount', 'recurringbillingfrequency', 'hs_position_on_quote'],
    inputs: ids.map((id) => ({ id: String(id) }))
  }).catch(() => ({ results: [] }));

  const rows = (batch.results || []).map((li) => {
    const p = li.properties || {};
    const qty = num(p.quantity);
    const price = num(p.price);
    const name = p.name || '';
    // Mirrors groupFor() in lib/calc.js. Derived rather than stored because a
    // line item carries no group field of its own.
    const group = /^Quick Close/i.test(name) ? 'offer'
      : p.recurringbillingfrequency ? 'monthly'
      : /install/i.test(name) ? 'install'
      : 'hardware';
    return {
      name,
      quantity: qty,
      price,
      amount: p.amount != null && p.amount !== '' ? num(p.amount) : +(qty * price).toFixed(2),
      recurring: !!p.recurringbillingfrequency,
      group,
      pos: p.hs_position_on_quote != null && p.hs_position_on_quote !== '' ? num(p.hs_position_on_quote) : 9999
    };
  });

  // Position pins the order the quote was built in, so the chooser and the
  // signed document list things identically. Falls back to one-time before
  // monthly for any quote created before positions were set.
  rows.sort((a, b) => (a.pos !== b.pos ? a.pos - b.pos
    : a.recurring === b.recurring ? 0 : a.recurring ? 1 : -1));
  return rows.map(function (r) { delete r.pos; return r; });
}

function shape(q, lines) {
  const p = q.properties || {};
  return {
    id: q.id,
    status: p.hs_status,
    option: p.mdd_purchase_option,
    title: p.hs_title,
    expiresOn: p.hs_expiration_date,
    oneTime: num(p.mdd_one_time_total),
    monthly: num(p.mdd_monthly_total),
    year1Total: num(p.mdd_year1_total),
    netValueMonthly: num(p.mdd_net_value_monthly),
    paybackLabel: p.mdd_payback_label || null,
    lines: lines || []
  };
}

exports.main = async (context, sendResponse) => {
  const origin = (context.headers && (context.headers.origin || context.headers.Origin)) || '';

  try {
    const token = (context.params && (context.params.t || [])[0]) || '';
    const v = verify(token, process.env.MDD_QUOTE_SIGNING_SECRET);
    if (!v.ok) {
      const msg = v.reason === 'expired'
        ? 'This link has expired. Ask your MDD rep for a fresh one.'
        : 'This link is not valid.';
      return fail(sendResponse, 403, msg, origin, { reason: v.reason });
    }

    const hs = client(process.env.HUBSPOT_QUOTE_TOKEN);
    const [buy, lease, buyLines, leaseLines] = await Promise.all([
      hs.getQuote(v.payload.b, QUOTE_PROPS),
      hs.getQuote(v.payload.l, QUOTE_PROPS),
      lineItemsFor(hs, v.payload.b),
      lineItemsFor(hs, v.payload.l)
    ]);

    const bp = buy.properties || {};

    // Already chosen? Send them straight to the published quote.
    const published = [buy, lease].find(
      (q) => q.properties && q.properties.hs_status !== 'DRAFT' && q.properties.hs_status !== 'VOID'
    );

    return ok(sendResponse, {
      ok: true,
      alreadyChosen: published
        ? { option: published.properties.mdd_purchase_option, quoteLink: publicQuoteUrl(published.properties) }
        : null,
      dealer: bp.mdd_dealer_name || '',
      system: {
        rooftops: num(bp.mdd_rooftops),
        trackedUnits: num(bp.mdd_tracked_units),
        vehicleTags: num(bp.mdd_vehicle_tags),
        keyTags: num(bp.mdd_key_tags),
        placards: num(bp.mdd_placards),
        gateways: num(bp.mdd_gateways),
        modules: bp.mdd_modules || ''
      },
      value: {
        monthly: num(bp.mdd_monthly_value),
        annual: num(bp.mdd_annual_value),
        breakdown: (bp.mdd_value_breakdown || '')
          .split('\n').filter(Boolean)
          .map((row) => {
            const [label, amount] = row.split('|');
            return { label, amount };
          })
      },
      options: { buy: shape(buy, buyLines), lease: shape(lease, leaseLines) }
    }, origin);

  } catch (err) {
    return fail(sendResponse, 500, safeError(err), origin);
  }
};
