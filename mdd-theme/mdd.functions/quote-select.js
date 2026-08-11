/**
 * POST /_hcms/api/mdd/quote-select   { t: <signed token>, choice: "buy" | "lease" }
 *
 * The buyer's decision point. Publishes the chosen quote, voids the other, and
 * returns the signing URL. Exactly one quote ever becomes signable, and its CRM
 * amount matches what the buyer selected.
 */

'use strict';

const { selectOption } = require('./lib/quote-builder.js');
const { verify } = require('./lib/token.js');
const { ok, fail, safeError } = require('./lib/respond.js');
const { client } = require('./lib/hubspot.js');
const notify = require('./lib/notify.js');

exports.main = async (context, sendResponse) => {
  const origin = (context.headers && (context.headers.origin || context.headers.Origin)) || '';

  try {
    const body = context.body || {};
    const choice = String(body.choice || '').toLowerCase();
    if (choice !== 'buy' && choice !== 'lease') {
      return fail(sendResponse, 400, 'Choose either buy or lease.', origin);
    }

    const v = verify(body.t, process.env.MDD_QUOTE_SIGNING_SECRET);
    if (!v.ok) {
      return fail(sendResponse, 403,
        v.reason === 'expired'
          ? 'This link has expired. Ask your MDD rep for a fresh one.'
          : 'This link is not valid.',
        origin, { reason: v.reason });
    }

    const result = await selectOption({
      token: process.env.HUBSPOT_QUOTE_TOKEN,
      choice,
      buyQuoteId: v.payload.b,
      leaseQuoteId: v.payload.l,
      dealId: v.payload.d
    });

    if (!result.redirectUrl) {
      return fail(sendResponse, 502,
        'The quote was selected but HubSpot has not returned its link yet. Refresh in a moment.',
        origin, { quoteId: result.quoteId });
    }

    // Alert sales — but only on the real decision. Re-opening a used link runs
    // this same path, and a duplicate "they chose!" would erode trust in the
    // alerts entirely.
    if (!result.alreadyChosen) {
      const alert = (async () => {
        try {
          const hs = client(process.env.HUBSPOT_QUOTE_TOKEN);
          const q = await hs.getQuote(result.quoteId, [
            'mdd_dealer_name', 'mdd_one_time_total', 'mdd_monthly_total', 'mdd_year1_total',
            'hs_sender_firstname', 'hs_sender_lastname'
          ]);
          const p = q.properties || {};
          await notify.send(notify.chosenMessage({
            choice,
            dealer: p.mdd_dealer_name,
            dealId: v.payload.d,
            rep: [p.hs_sender_firstname, p.hs_sender_lastname].filter(Boolean).join(' '),
            oneTime: p.mdd_one_time_total,
            monthly: p.mdd_monthly_total,
            year1Total: p.mdd_year1_total,
            quoteUrl: result.redirectUrl
          }));
        } catch (_) { /* an alert must never fail the buyer's redirect */ }
      })();

      if (context.waitUntil) context.waitUntil(alert);
    }

    return ok(sendResponse, { ok: true, ...result }, origin);

  } catch (err) {
    return fail(sendResponse, 500, safeError(err), origin);
  }
};
