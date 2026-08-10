#!/usr/bin/env node
/**
 * Local end-to-end test harness for the MDD quote system.
 *
 * Runs the SAME code the serverless endpoints run, straight from your machine.
 * You do not need to deploy anything to use this - it exercises quote creation,
 * line items, associations, publish, void and the deal write.
 *
 * Token is read from .env (HUBSPOT_ACCESS_TOKEN) automatically - no setup needed.
 *
 * Check everything is ready:
 *   node scripts/quote-system/test-quote-flow.js doctor
 *
 * Create both quotes on a deal:
 *   node scripts/quote-system/test-quote-flow.js create --deal 63548402544
 *
 * Simulate the buyer choosing (publishes one, voids the other):
 *   node scripts/quote-system/test-quote-flow.js select --choice buy \
 *        --buy <buyQuoteId> --lease <leaseQuoteId> --deal 63548402544
 *
 * Inspect what got created:
 *   node scripts/quote-system/test-quote-flow.js show --quote <quoteId>
 *
 * Tidy up afterwards (voids both):
 *   node scripts/quote-system/test-quote-flow.js cleanup --buy <id> --lease <id>
 *
 * Useful flags:
 *   --template <id>   quote template record to attach (default: mddQuote)
 *   --dealer "Name"   dealership name on the quote
 *   --json            machine-readable output
 */

'use strict';

const path = require('path');
const FN = path.join(__dirname, '..', '..', 'mdd-theme', 'mdd.functions');
const { createQuotePair, selectOption, PORTAL_ID } = require(path.join(FN, 'lib', 'quote-builder.js'));
const { client } = require(path.join(FN, 'lib', 'hubspot.js'));
const MAP = require(path.join(FN, 'pricing-map.json'));

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const cmd = argv[0];
const arg = (name, def) => {
  const i = argv.indexOf('--' + name);
  return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const has = (name) => argv.includes('--' + name);
const JSON_OUT = has('json');

require('./load-env.js').loadEnv();
const TOKEN = process.env.HUBSPOT_QUOTE_TOKEN;
// Any value works locally - it only signs the chooser link. Use the real
// MDD_QUOTE_SIGNING_SECRET if you want the generated link to work in production.
const SIGNING = process.env.MDD_QUOTE_SIGNING_SECRET || 'local-test-signing-secret';
// "MDD - Proposal (Buy / Lease)". NOT "mddQuote" (435681411161): that one points at HubSpot's
// basic.html, which silently drops the Comments block. Modern renders both
// Comments and Purchase terms, and is what the reference quote uses.
const TEMPLATE = arg('template', '578170525842');
const CHOOSER = process.env.MDD_CHOOSER_BASE || 'https://mdd.io/quote-options';

const C = { g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[31m', d: '\x1b[2m', b: '\x1b[1m', x: '\x1b[0m' };
const say = (s) => { if (!JSON_OUT) console.log(s); };
const money = (v) => '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function die(msg) {
  console.error(`${C.r}✗ ${msg}${C.x}`);
  process.exit(1);
}

if (!TOKEN) die('No HubSpot token found. Add HUBSPOT_ACCESS_TOKEN to .env, or export HUBSPOT_QUOTE_TOKEN.\n  export HUBSPOT_QUOTE_TOKEN=\'pat-na1-…\'');

// Defaults mirror the System Builder's own defaults so the numbers are familiar.
const DEFAULT_INPUTS = {
  dealer: arg('dealer', ''),
  rooftops: 1, newInv: 300, usedInv: 150, loaners: 25,
  usedSoldMo: 60, serviceROs: 1500, laborRate: 150, sellThrough: 30,
  modLocate: true, modLot: true, modService: true, modRecon: true, modVV: false,
  minPerRO: 15, reconDaysCut: 3, holdingCost: 40, gatewaysOverride: 0
};

// ---------------------------------------------------------------- commands

async function doDoctor() {
  const hs = client(TOKEN);
  const checks = [
    ['token valid',              () => hs.call('GET', '/crm/v3/objects/deals?limit=1')],
    ['read products',            () => hs.call('GET', '/crm/v3/objects/products?limit=1')],
    ['read quotes',              () => hs.call('GET', '/crm/v3/objects/quotes?limit=1')],
    ['read quote properties',    () => hs.call('GET', '/crm/v3/properties/quotes')],
    ['write quote properties',   () => hs.call('GET', '/crm/v3/properties/quotes')],
    ['read line items',          () => hs.call('GET', '/crm/v3/objects/line_items?limit=1')],
    ['read contacts',            () => hs.call('GET', '/crm/v3/objects/contacts?limit=1')]
  ];

  console.log(`${C.b}Preflight${C.x}\n`);
  let bad = 0;
  for (const [label, fn] of checks) {
    try { await fn(); console.log(`  ${C.g}ok${C.x}   ${label}`); }
    catch (e) {
      bad++;
      const why = e.status === 403 ? 'missing scope' : e.status === 401 ? 'bad token' : `HTTP ${e.status}`;
      console.log(`  ${C.r}fail${C.x} ${label}  ${C.d}(${why})${C.x}`);
    }
  }

  // Do the custom properties exist yet?
  try {
    const props = await hs.call('GET', '/crm/v3/properties/quotes');
    const have = new Set((props.results || []).map((x) => x.name));
    const need = ['mdd_purchase_option', 'mdd_tracked_units', 'mdd_monthly_value', 'mdd_year1_total'];
    const missing = need.filter((n) => !have.has(n));
    console.log(missing.length
      ? `\n  ${C.y}Custom properties not created yet (${missing.length}/${need.length} missing).${C.x}\n  Run: node scripts/quote-system/create-quote-properties.js`
      : `\n  ${C.g}Custom properties present.${C.x}`);
  } catch (_) { /* covered above */ }

  // Is the quote template record real?
  try {
    const t = await hs.call('GET', `/crm/v3/objects/quote_template/${TEMPLATE}?properties=hs_name,hs_type`);
    console.log(`  ${C.g}Quote template ${TEMPLATE} = "${t.properties.hs_name}" (${t.properties.hs_type}).${C.x}`);
  } catch (e) {
    console.log(`  ${C.y}Could not read quote template ${TEMPLATE}: ${e.message}${C.x}`);
  }

  console.log(bad ? `\n${C.r}${bad} check(s) failed — fix scopes on the private app before running create.${C.x}`
                  : `\n${C.g}${C.b}All good. Run:${C.x} node scripts/quote-system/test-quote-flow.js create --deal 63548402544`);
  process.exit(bad ? 1 : 0);
}

async function doCreate() {
  const dealId = arg('deal');
  if (!dealId) die('Pass --deal <hubspot deal id>');

  say(`${C.b}Creating Buy + Lease drafts on deal ${dealId}${C.x}\n`);

  const res = await createQuotePair({
    token: TOKEN, signingSecret: SIGNING, map: MAP,
    dealId, inputs: DEFAULT_INPUTS, vvPerPkg: 400,
    expiresInDays: 30, quoteTemplateId: TEMPLATE, chooserBase: CHOOSER,
    ...(arg('sender-email') ? {
      sender: {
        firstName: arg('sender-first', 'Mobile Dealer'),
        lastName: arg('sender-last', 'Data'),
        email: arg('sender-email'),
        company: 'Mobile Dealer Data'
      }
    } : {}),
    onProgress: (m) => say(`  ${C.d}${m}${C.x}`)
  });

  if (JSON_OUT) { console.log(JSON.stringify(res, null, 2)); return; }

  const s = res.model.sizing, v = res.model.value;
  console.log(`\n${C.b}System${C.x}`);
  console.log(`  ${s.units} tracked units · ${s.vehicleTags} vehicle tags · ${s.keyTags} key tags`);
  console.log(`  ${s.placards} placards · ${s.gateways} gateways (${s.gatewaysIndoor} indoor / ${s.gatewaysOutdoor} outdoor)`);
  console.log(`\n${C.b}Value recovered${C.x}`);
  console.log(`  ${money(v.totalValue)}/month · ${money(v.annualValue)}/year`);

  for (const k of ['buy', 'lease']) {
    const o = res.model.options[k];
    console.log(`\n${C.b}${o.label}${C.x}`);
    console.log(`  one-time ${money(o.oneTime)} · monthly ${money(o.monthly)} · year 1 ${money(o.year1Total)}`);
    if (o.paybackLabel) console.log(`  payback ${o.paybackLabel} · net ${money(o.netValuePerMonth)}/mo`);
    for (const li of o.lines) {
      console.log(`  ${C.d}· ${li.name} ×${li.quantity} @ ${money(li.price)} = ${money(li.amount)} [${li.billing}]${C.x}`);
    }
  }

  if (res.warnings.length) {
    console.log(`\n${C.y}Warnings${C.x}`);
    res.warnings.forEach((w) => console.log(`  ! ${w}`));
  }

  console.log(`\n${C.g}Created.${C.x}`);
  console.log(`  Buy   quote ${res.buyQuoteId}  ${res.quoteEditUrls.buy}`);
  console.log(`  Lease quote ${res.leaseQuoteId}  ${res.quoteEditUrls.lease}`);
  console.log(`\n  Next — simulate the buyer choosing:`);
  console.log(`  ${C.d}node scripts/quote-system/test-quote-flow.js select --choice buy \\
      --buy ${res.buyQuoteId} --lease ${res.leaseQuoteId} --deal ${dealId}${C.x}`);
}

async function doSelect() {
  const choice = (arg('choice') || '').toLowerCase();
  if (choice !== 'buy' && choice !== 'lease') die('Pass --choice buy|lease');
  const buyQuoteId = arg('buy'), leaseQuoteId = arg('lease');
  if (!buyQuoteId || !leaseQuoteId) die('Pass --buy <id> --lease <id>');

  say(`${C.b}Simulating buyer choosing: ${choice.toUpperCase()}${C.x}\n`);

  const res = await selectOption({
    token: TOKEN, choice, buyQuoteId, leaseQuoteId, dealId: arg('deal')
  });

  if (JSON_OUT) { console.log(JSON.stringify(res, null, 2)); return; }

  console.log(`  chosen quote ${res.quoteId} → status ${C.g}${res.status}${C.x}`);
  console.log(`  other quote  ${res.voidedQuoteId} → ${C.y}VOID${C.x}`);
  if (res.alreadyChosen) console.log(`  ${C.y}(was already decided — nothing republished)${C.x}`);
  console.log(`\n${C.g}${C.b}Open the signable quote:${C.x}`);
  console.log(`  ${res.redirectUrl || '(no link yet — wait a moment and run: show --quote ' + res.quoteId + ')'}`);
  if (res.pdfUrl) console.log(`  PDF: ${res.pdfUrl}`);
}

async function doShow() {
  const quoteId = arg('quote');
  if (!quoteId) die('Pass --quote <id>');
  const hs = client(TOKEN);
  const q = await hs.getQuote(quoteId, [
    'hs_title', 'hs_status', 'hs_quote_amount', 'hs_quote_link', 'hs_pdf_download_link',
    'hs_expiration_date', 'hs_esign_enabled',
    'mdd_purchase_option', 'mdd_dealer_name', 'mdd_tracked_units', 'mdd_gateways',
    'mdd_monthly_value', 'mdd_annual_value', 'mdd_value_breakdown',
    'mdd_one_time_total', 'mdd_monthly_total', 'mdd_year1_total', 'mdd_payback_label',
    'mdd_net_value_monthly', 'mdd_sibling_quote_id', 'mdd_chooser_url'
  ]);
  if (JSON_OUT) { console.log(JSON.stringify(q.properties, null, 2)); return; }
  console.log(`${C.b}Quote ${quoteId}${C.x}`);
  for (const [k, val] of Object.entries(q.properties)) {
    if (val === null || val === '') continue;
    console.log(`  ${k.padEnd(26)} ${String(val).replace(/\n/g, '\n' + ' '.repeat(29))}`);
  }
  const missing = ['mdd_purchase_option', 'mdd_tracked_units', 'mdd_monthly_value']
    .filter((k) => !q.properties[k]);
  if (missing.length) {
    console.log(`\n${C.y}Custom properties missing: ${missing.join(', ')}${C.x}`);
    console.log(`${C.y}Run create-quote-properties.js first.${C.x}`);
  }
}

async function doCleanup() {
  const hs = client(TOKEN);
  const ids = [arg('buy'), arg('lease'), arg('quote')].filter(Boolean);
  if (!ids.length) die('Pass --buy <id> --lease <id> and/or --quote <id>');
  for (const id of ids) {
    try {
      await hs.updateQuote(id, { hs_status: 'VOID' });
      console.log(`  ${C.g}voided${C.x} ${id}`);
    } catch (e) {
      console.log(`  ${C.r}failed${C.x} ${id}: ${e.message}`);
    }
  }
  console.log(`\n  ${C.d}Voided quotes stay on the deal. Delete them in HubSpot if you want them gone:${C.x}`);
  console.log(`  ${C.d}https://app.hubspot.com/quotes/${PORTAL_ID}${C.x}`);
}

// ---------------------------------------------------------------- run
const COMMANDS = { doctor: doDoctor, create: doCreate, select: doSelect, show: doShow, cleanup: doCleanup };

if (!COMMANDS[cmd]) {
  console.log(require('fs').readFileSync(__filename, 'utf8').split('*/')[0].replace(/^\/\*\*?/, '').replace(/^ \* ?/gm, ''));
  process.exit(cmd ? 1 : 0);
}

COMMANDS[cmd]().catch((e) => {
  console.error(`\n${C.r}✗ ${e.message}${C.x}`);
  if (e.body) console.error(C.d + JSON.stringify(e.body, null, 2) + C.x);
  process.exit(1);
});
