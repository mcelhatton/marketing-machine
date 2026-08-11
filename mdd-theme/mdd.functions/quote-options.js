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
const notify = require('./lib/notify.js');

/**
 * The demo page opens the chooser in a new tab the moment a quote is created,
 * so the first view is almost always the rep checking their own work. Anything
 * inside this window is treated as that preview and does not alert — the buyer
 * cannot have been sent the link yet.
 */
// Not `Number(x) || default` — that swallows a deliberate 0, which is exactly
// the value you want when disabling the suppression. An empty or absent var
// still means "use the default", since Number('') is 0.
const REP_PREVIEW_WINDOW_MS = (() => {
  const raw = process.env.MDD_REP_PREVIEW_WINDOW_MS;
  if (raw == null || String(raw).trim() === '') return 3 * 60 * 1000;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 3 * 60 * 1000;
})();

const QUOTE_PROPS = [
  'hs_title', 'hs_status', 'hs_quote_amount', 'hs_quote_link', 'hs_domain', 'hs_slug', 'hs_expiration_date',
  'hs_createdate', 'hs_sender_firstname', 'hs_sender_lastname',
  'mdd_first_viewed_at', 'mdd_view_count', 'mdd_chooser_url',
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

    // ── Record the view, and alert sales the first time a buyer opens it ─────
    // Stamped on the quote rather than held in memory: the Worker is stateless,
    // and this doubles as CRM data the rep can see on the record.
    if (!published) {
      const alreadyViewed = !!bp.mdd_first_viewed_at;
      const createdMs = Date.parse(bp.hs_createdate || '') || 0;
      const isRepPreview = createdMs > 0 && (Date.now() - createdMs) < REP_PREVIEW_WINDOW_MS;

      const views = (Number(bp.mdd_view_count) || 0) + 1;
      const patch = { mdd_view_count: String(views) };
      if (!alreadyViewed) patch.mdd_first_viewed_at = new Date().toISOString().slice(0, 10);

      const work = hs.updateQuote(v.payload.b, patch).catch(() => {});

      if (!alreadyViewed && !isRepPreview) {
        const alert = notify.send(notify.viewedMessage({
          dealer: bp.mdd_dealer_name,
          dealId: v.payload.d,
          dealName: buy.properties.hs_title,
          rep: [bp.hs_sender_firstname, bp.hs_sender_lastname].filter(Boolean).join(' '),
          chooserUrl: bp.mdd_chooser_url,
          buy: { oneTime: num(bp.mdd_one_time_total), monthly: num(bp.mdd_monthly_total) },
          lease: {
            oneTime: num((lease.properties || {}).mdd_one_time_total),
            monthly: num((lease.properties || {}).mdd_monthly_total)
          }
        }));
        // Hand off to the platform so the buyer's page is not held up by Slack.
        if (context.waitUntil) context.waitUntil(Promise.all([work, alert]));
      } else if (context.waitUntil) {
        context.waitUntil(work);
      }
    }

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
