/**
 * POST /_hcms/api/mdd/create-quote
 *
 * Called by the Create Quote button on the System Builder slide. Creates TWO
 * draft quotes on the given deal - one Buy, one Lease - and returns a signed
 * chooser URL for the buyer.
 *
 * All the real work is in lib/quote-builder.js so the local test harness runs
 * exactly this code path.
 */

'use strict';

const { createQuotePair } = require('./lib/quote-builder.js');
const { safeEqual } = require('./lib/token.js');
const { ok, fail, safeError } = require('./lib/respond.js');
const MAP = require('./pricing-map.json');

// "MDD - Proposal (Buy / Lease)" -> mdd-quote-theme/templates/mdd-proposal.html.
// Do NOT fall back to "mddQuote" (435681411161) or "Default Basic": both point at
// HubSpot's basic.html, which drops the Comments block without erroring.
const QUOTE_TEMPLATE_ID = process.env.MDD_QUOTE_TEMPLATE_ID || '578170525842';

/**
 * Prices the System Builder is allowed to set, and the ceiling for each.
 *
 * The page can now name its own prices, which is what makes it a quote builder
 * rather than a calculator. That means the browser is trusted with money, so
 * the trust is bounded: only these keys are read, each must be a non-negative
 * number below a sane ceiling, and anything else is ignored rather than
 * clamped — a price that arrives malformed should fall back to the catalog,
 * not silently become a number nobody chose.
 *
 * Ceilings are deliberately generous. They exist to stop a typo or a tampered
 * payload producing a $2,000,000 tag, not to enforce a price book.
 */
const PRICE_LIMITS = {
  pTag: 500, pKeyTag: 500, pPlacard: 500,
  pGatewayIn: 5000, pGatewayOut: 5000,
  pInstall: 100000,
  pMoVehTag: 100, pMoKeyTag: 100, pMoPlacard: 100,
  pMoFlat: 20000, pMoService: 10000, pMoRecon: 10000
};

function sanitizePrices(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const [key, max] of Object.entries(PRICE_LIMITS)) {
    if (raw[key] == null || raw[key] === '') continue;
    const v = Number(raw[key]);
    if (Number.isFinite(v) && v >= 0 && v <= max) out[key] = Math.round(v * 100) / 100;
  }
  return out;
}
const CHOOSER_BASE = process.env.MDD_CHOOSER_BASE || 'https://mdd.io/quote-options';

exports.main = async (context, sendResponse) => {
  const origin = (context.headers && (context.headers.origin || context.headers.Origin)) || '';

  try {
    const supplied = (context.headers && (context.headers['x-mdd-rep-key'] || context.headers['X-MDD-Rep-Key'])) || '';
    if (!safeEqual(supplied, process.env.MDD_REP_KEY)) {
      return fail(sendResponse, 401, 'Not authorised. Check your rep key on the demo page.', origin);
    }

    const body = context.body || {};
    const dealId = String(body.dealId || '').trim();
    if (!/^\d+$/.test(dealId)) {
      return fail(sendResponse, 400, 'A numeric HubSpot deal ID is required.', origin);
    }

    // Who the quote comes from. Without this the template suppresses the whole
    // "Comments from ..." block, so the rep's note never reaches the buyer.
    const s = body.sender || {};
    const sender = (s.email && String(s.email).includes('@'))
      ? {
          firstName: String(s.firstName || '').trim().slice(0, 60) || 'Mobile Dealer',
          lastName: String(s.lastName || '').trim().slice(0, 60) || 'Data',
          email: String(s.email).trim().slice(0, 120),
          company: 'Mobile Dealer Data'
        }
      : undefined;

    const result = await createQuotePair({
      token: process.env.HUBSPOT_QUOTE_TOKEN,
      signingSecret: process.env.MDD_QUOTE_SIGNING_SECRET,
      map: MAP,
      dealId,
      inputs: body.inputs || {},
      vvPerPkg: body.vvPerPkg,
      builderPrices: sanitizePrices(body.prices),
      expiresInDays: body.expiresInDays,
      sender,
      // Free-text note from the System Builder. Escaped, because it lands in
      // hs_comments as HTML on a customer-facing document.
      notes: String(body.notes || '').trim().slice(0, 2000)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || undefined,
      quoteTemplateId: QUOTE_TEMPLATE_ID,
      chooserBase: CHOOSER_BASE
    });

    return ok(sendResponse, { ok: true, ...result }, origin);

  } catch (err) {
    if (err && err.userFacing) return fail(sendResponse, 400, err.message, origin);
    if (err && err.status === 404) return fail(sendResponse, 404, 'Deal not found in HubSpot.', origin);
    return fail(sendResponse, 500, safeError(err), origin);
  }
};
