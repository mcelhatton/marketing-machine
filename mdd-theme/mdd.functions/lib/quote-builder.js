/**
 * Shared quote-pair builder.
 *
 * Used by BOTH the serverless handler (create-quote.js) and the local test
 * harness (scripts/quote-system/test-quote-flow.js). Deliberately no second
 * implementation - if it works from your laptop, the deployed endpoint behaves
 * identically.
 */

'use strict';

const { client, ASSOC, STATUS } = require('./hubspot.js');
const { buildQuoteModel } = require('./calc.js');
const { sign } = require('./token.js');
const { TERMS_HTML, buildComments } = require('../quote-terms.js');

const PORTAL_ID = '585393';

function allProductIds(map) {
  const ids = new Set();
  for (const group of ['buy', 'lease', 'addons']) {
    for (const entry of Object.values(map[group] || {})) ids.add(String(entry.productId));
  }
  return [...ids];
}

const fmtMoney = (v) => '$' + Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

function valueBreakdown(model) {
  const q = model.inputs, v = model.value, rows = [];
  if (v.svcValue) rows.push(`Service: ${Number(q.serviceROs).toLocaleString()} ROs x ${q.minPerRO} min x $${q.laborRate}/hr|${fmtMoney(v.svcValue)}`);
  if (v.placardValue) rows.push(`Paper hang tags eliminated|${fmtMoney(v.placardValue)}`);
  if (v.reconValue) rows.push(`Recon: ${q.usedSoldMo} units x ${q.reconDaysCut} days x $${q.holdingCost}/day|${fmtMoney(v.reconValue)}`);
  if (v.lostKeyValue) rows.push(`Lost keys: ${q.lostKeysMo}/mo x $${q.keyReplaceCost} replacement|${fmtMoney(v.lostKeyValue)}`);
  if (v.lostDealValue) rows.push(`Lost deals: ${q.lostDealsMo}/mo x $${Number(q.grossPerDeal).toLocaleString()} gross|${fmtMoney(v.lostDealValue)}`);
  if (v.vvValue) rows.push(`VehicleVault: ${v.vvInventory.toLocaleString()} inv x 60% x ${q.sellThrough}% x ${fmtMoney(v.vvPerPkg)}/pkg|${fmtMoney(v.vvValue)}`);
  return rows.join('\n');
}

function moduleList(q) {
  return [
    q.modLocate && 'Key & Vehicle Tracking (MDD Locate)',
    q.modLot && 'Lot Management',
    q.modService && 'Service Workflow',
    q.modRecon && 'Recon Workflow',
    q.modVV && 'VehicleVault F&I'
  ].filter(Boolean).join(', ');
}

async function createQuotePair(opts) {
  const log = opts.onProgress || (() => {});
  const hs = client(opts.token);

  const deal = await hs.getDeal(opts.dealId);
  log(`deal ok: ${deal.properties.dealname}`);

  const catalogPrices = await hs.getProductPrices(allProductIds(opts.map));
  log(`catalog: ${Object.keys(catalogPrices).length} products priced`);

  const model = buildQuoteModel(opts.inputs || {}, opts.map, catalogPrices, opts.vvPerPkg);
  if (model.sizing.units <= 0) {
    const e = new Error('Tracked units is zero - fill in the dealership inventory first.');
    e.userFacing = true;
    throw e;
  }

  const parties = await hs.getDealParties(opts.dealId);
  log(`parties: ${parties.contactIds.length} contact(s), ${parties.companyIds.length} company(ies)`);
  if (!parties.contactIds.length) log('WARNING: no contact on this deal - the quote will have no signer.');

  const dealerName = model.inputs.dealer || deal.properties.dealname || 'MDD Prospect';
  const days = Math.min(120, Math.max(7, Number(opts.expiresInDays) || 30));
  const expiration = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

  // Slug + domain are only validated at publish time, but they must already be
  // on the record by then, so they are set at creation. The slug has to be
  // unique across the portal - deal id + option + a short stamp does it.
  // Truncate on a word boundary. A blind slice(0,40) cut mid-word and produced
  // slugs like ".../zz-test-…-sandbox-safe-to-lease", which reads as a claim
  // about the offer rather than the dealership name.
  let slugBase = String(dealerName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (slugBase.length > 40) slugBase = slugBase.slice(0, 40).replace(/-[^-]*$/, '');
  slugBase = slugBase.replace(/-+$/, '') || 'mdd-quote';

  const stamp = Date.now().toString(36);

  // Whoever the deal belongs to sends the quote, unless the caller says otherwise.
  const ownerId = opts.ownerId || deal.properties.hubspot_owner_id || null;
  const sender = Object.assign(
    { firstName: 'Mobile Dealer', lastName: 'Data', email: 'sales@mdd.io', company: 'Mobile Dealer Data' },
    opts.sender || {}
  );

  const created = {};
  for (const option of ['buy', 'lease']) {
    const opt = model.options[option];
    const lineItemIds = await hs.createLineItems(opt.lines);
    log(`${option}: ${lineItemIds.length} line items created`);

    const quote = await hs.createQuote({
      hs_title: `MDD System - ${dealerName} - ${option === 'buy' ? 'Buy' : 'Lease'}`,
      hs_expiration_date: expiration,
      hs_status: STATUS.DRAFT,
      hs_esign_enabled: 'true',
      hs_currency: opts.map.currency || 'USD',
      // Both are required at create time on legacy quotes. Without hs_template_type
      // the API sees '<NONE>' - the template association happens after creation and
      // is too late to satisfy validation.
      hs_language: opts.language || 'en',
      hs_template_type: 'CUSTOMIZABLE_QUOTE_TEMPLATE',
      hs_slug: `${slugBase}-${option}-${stamp}`,
      hs_domain: opts.quoteDomain || 'mdd.io',
      // The quote template only renders the "Comments from ..." block when it
      // knows who sent the quote, so hs_comments alone is not enough. These
      // cannot be patched later - a published quote is locked.
      hs_sender_firstname: sender.firstName,
      hs_sender_lastname: sender.lastName,
      hs_sender_email: sender.email,
      hs_sender_company_name: sender.company,
      ...(ownerId ? { hubspot_owner_id: String(ownerId) } : {}),
      // "Purchase terms" and "Comments to buyer" on the rendered quote.
      hs_terms: opts.terms || TERMS_HTML,
      hs_comments: opts.comments || buildComments({
        option,
        dealerName,
        units: model.sizing.units,
        placards: model.sizing.placards,
        gateways: model.sizing.gateways,
        oneTime: opt.oneTime,
        monthly: opt.monthly,
        modules: moduleList(model.inputs),
        notes: opts.notes,
        discountPct: opt.discountPct,
        discountAmount: opt.discountAmount,
        quickCloseValue: opt.quickCloseValue
      }),
      mdd_purchase_option: option,
      mdd_dealer_name: dealerName,
      mdd_rooftops: String(model.inputs.rooftops || 0),
      mdd_tracked_units: String(model.sizing.units),
      mdd_vehicle_tags: String(model.sizing.vehicleTags),
      mdd_key_tags: String(model.sizing.keyTags),
      mdd_placards: String(model.sizing.placards),
      mdd_gateways: String(model.sizing.gateways),
      mdd_modules: moduleList(model.inputs),
      mdd_monthly_value: String(model.value.totalValue),
      mdd_annual_value: String(model.value.annualValue),
      mdd_value_breakdown: valueBreakdown(model),
      mdd_net_value_monthly: String(opt.netValuePerMonth),
      mdd_payback_label: opt.paybackLabel || '',
      mdd_one_time_total: String(opt.oneTime),
      mdd_monthly_total: String(opt.monthly),
      mdd_year1_total: String(opt.year1Total),
      mdd_first_90_total: String(opt.first90),
      mdd_quick_close_value: String(opt.quickCloseValue || 0),
      mdd_discount_amount: String(opt.discountAmount || 0),
      mdd_discount_pct: String(opt.discountPct || 0)
    });
    log(`${option}: quote ${quote.id} created`);

    await hs.associate(quote.id, 'quote_template', opts.quoteTemplateId, ASSOC.QUOTE_TO_TEMPLATE);
    await hs.associate(quote.id, 'deals', opts.dealId, ASSOC.QUOTE_TO_DEAL);
    for (const liId of lineItemIds) await hs.associate(quote.id, 'line_items', liId, ASSOC.QUOTE_TO_LINE_ITEM);
    if (parties.contactIds[0]) await hs.associate(quote.id, 'contacts', parties.contactIds[0], ASSOC.QUOTE_TO_CONTACT_SIGNER);
    if (parties.companyIds[0]) await hs.associate(quote.id, 'companies', parties.companyIds[0], ASSOC.QUOTE_TO_COMPANY);
    log(`${option}: associations done`);

    created[option] = { id: quote.id, lineItemIds };
  }

  const token = sign({ b: created.buy.id, l: created.lease.id, d: String(opts.dealId) }, opts.signingSecret, days * 86400);
  const chooserUrl = `${opts.chooserBase}?t=${encodeURIComponent(token)}`;

  await Promise.all([
    hs.updateQuote(created.buy.id, { mdd_sibling_quote_id: created.lease.id, mdd_chooser_url: chooserUrl }),
    hs.updateQuote(created.lease.id, { mdd_sibling_quote_id: created.buy.id, mdd_chooser_url: chooserUrl })
  ]);

  return {
    dealId: String(opts.dealId),
    dealName: deal.properties.dealname,
    buyQuoteId: created.buy.id,
    leaseQuoteId: created.lease.id,
    chooserUrl,
    quoteEditUrls: {
      buy: `https://app.hubspot.com/quotes/${PORTAL_ID}/quote/${created.buy.id}`,
      lease: `https://app.hubspot.com/quotes/${PORTAL_ID}/quote/${created.lease.id}`
    },
    model: { sizing: model.sizing, value: model.value, options: model.options },
    warnings: model.warnings
  };
}

/**
 * The public URL of a quote.
 *
 * hs_quote_link is authoritative but HubSpot populates it asynchronously - for
 * ~15s after publishing it is still null, which used to bounce the buyer to an
 * error at the exact moment they clicked. We set hs_slug and hs_domain
 * ourselves at creation, so the same URL can be derived immediately.
 */
function publicQuoteUrl(props) {
  if (!props) return null;
  if (props.hs_quote_link) return props.hs_quote_link;
  if (props.hs_domain && props.hs_slug) {
    return `https://${props.hs_domain}/${props.hs_slug}`;
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Wait until the published quote actually serves.
 *
 * Publishing is not instant and the timings are counter-intuitive: measured on
 * portal 585393, hs_quote_link is populated at ~5s but the page still 404s
 * until ~15s. So neither the status flip nor the link field means "ready" -
 * the only honest signal is the page returning 200. Redirecting a buyer before
 * that lands them on a 404 at the exact moment they have committed to buying.
 */
async function waitForQuotePage(url, timeoutMs) {
  if (!url) return false;
  const deadline = Date.now() + (timeoutMs || 24000);
  let delay = 1200;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MDDQuoteBot/1.0)' }
      });
      if (res.status === 200) return true;
    } catch (_) { /* transient - keep waiting */ }
    await sleep(delay);
    delay = Math.min(2500, Math.round(delay * 1.25));
  }
  return false;
}

/** The buyer's decision, extracted so the harness can simulate it. */
async function selectOption(opts) {
  const hs = client(opts.token);
  const chosenId = opts.choice === 'buy' ? opts.buyQuoteId : opts.leaseQuoteId;
  const otherId = opts.choice === 'buy' ? opts.leaseQuoteId : opts.buyQuoteId;

  const current = await hs.getQuote(chosenId, [
    'hs_status', 'hs_quote_link', 'hs_domain', 'hs_slug', 'mdd_year1_total'
  ]);
  const alreadyLive = current.properties
    && current.properties.hs_status !== STATUS.DRAFT
    && current.properties.hs_status !== STATUS.VOID;

  if (!alreadyLive) {
    await hs.updateQuote(chosenId, { hs_status: STATUS.PUBLISHED });
    await hs.updateQuote(otherId, { hs_status: STATUS.VOID }).catch(() => {});
    if (opts.dealId) {
      await hs.updateDeal(opts.dealId, {
        mdd_purchase_option: opts.choice,
        amount: String(current.properties.mdd_year1_total || '')
      }).catch(() => {});
    }
  }

  const fresh = await hs.getQuote(chosenId, [
    'hs_status', 'hs_quote_link', 'hs_pdf_download_link', 'hs_domain', 'hs_slug'
  ]);
  const redirectUrl = publicQuoteUrl(fresh.properties);

  // A quote that was already live is serving; only a fresh publish needs the wait.
  const ready = alreadyLive
    ? true
    : await waitForQuotePage(redirectUrl, opts.readyTimeoutMs);

  return {
    choice: opts.choice, quoteId: chosenId, voidedQuoteId: otherId,
    alreadyChosen: alreadyLive, status: fresh.properties.hs_status,
    redirectUrl,
    ready,
    pdfUrl: fresh.properties.hs_pdf_download_link || null
  };
}

module.exports = { createQuotePair, selectOption, publicQuoteUrl, allProductIds, valueBreakdown, moduleList, PORTAL_ID };
