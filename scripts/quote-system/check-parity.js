#!/usr/bin/env node
/**
 * Pins qCalc() in demo.html to lib/calc.js.
 *
 * The System Builder slide and the server-side quote engine are two copies of
 * the same maths. If they drift, reps quote one number and HubSpot bills
 * another. Run this after touching either file.
 *
 *   node scripts/quote-system/check-parity.js
 *
 * Exits non-zero on any mismatch.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { buildQuoteModel } = require(path.join(ROOT, 'mdd-theme/mdd.functions/lib/calc.js'));
const MAP = require(path.join(ROOT, 'mdd-theme/mdd.functions/pricing-map.json'));

const src = fs.readFileSync(path.join(ROOT, 'mdd-theme/templates/demo.html'), 'utf8');

// 1. The inline script must parse.
const scripts = [...src.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
for (const [i, s] of scripts.entries()) {
  try { new Function(s); } catch (e) { fail(`demo.html script block ${i} does not parse: ${e.message}`); }
}

// 2. Lift the defaults and qCalc() straight out of the page.
const defaults = JSON.parse(src.match(/"quote":\s*(\{[\s\S]*?\n  \})/)[1]);

// Brace-match the function body rather than anchoring on its return statement —
// that anchor broke silently the first time qCalc's return shape changed.
const start = src.indexOf('function qCalc(q)');
if (start < 0) fail('Could not find qCalc() in demo.html.');
let depth = 0, end = -1;
for (let i = src.indexOf('{', start); i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}' && --depth === 0) { end = i + 1; break; }
}
if (end < 0) fail('Could not find the end of qCalc() in demo.html.');
const qCalc = new Function(src.slice(start, end) + '; return qCalc;')();

// Catalog snapshot pinned to pricing-map.json, so this runs offline.
const catalog = {};
for (const group of ['buy', 'lease', 'addons']) {
  for (const e of Object.values(MAP[group])) catalog[e.productId] = e.catalogPrice;
}

const CASES = [
  { name: 'reference deal', inputs: defaults },
  { name: 'service only',   inputs: { ...defaults, modRecon: false } },
  { name: 'recon only',     inputs: { ...defaults, modService: false } },
  { name: 'no modules',     inputs: { ...defaults, modService: false, modRecon: false } },
  { name: 'gateway override', inputs: { ...defaults, gatewaysOverride: 31 } },
  { name: 'gateway mix pinned by survey', inputs: { ...defaults, gatewayIndoorOverride: 22, gatewayOutdoorOverride: 4 } },
  { name: 'gateway mix, indoor only', inputs: { ...defaults, gatewayIndoorOverride: 26, gatewayOutdoorOverride: 0 } },
  { name: 'small store',    inputs: { ...defaults, salesUnits: 65, serviceUnits: 0, loaners: 0, serviceROs: 300 } },
  { name: 'large group',    inputs: { ...defaults, rooftops: 6, salesUnits: 2700, serviceUnits: 200, loaners: 120, serviceROs: 9000 } },
  { name: 'car tags only',  inputs: { ...defaults, tagMode: 'car' } },
  { name: 'key tags only',  inputs: { ...defaults, tagMode: 'key' } },
  { name: 'service units split', inputs: { ...defaults, salesUnits: 300, serviceUnits: 150 } },
  { name: 'lost keys + deals',   inputs: { ...defaults, lostKeysMo: 8, keyReplaceCost: 500, lostDealsMo: 2, grossPerDeal: 3000 } },
  { name: '10% hardware discount', inputs: { ...defaults, discountType: 'percent', discountValue: 10 } },
  { name: '$1,000 off hardware',   inputs: { ...defaults, discountType: 'amount', discountValue: 1000 } },
  { name: 'quick close',    inputs: { ...defaults, quickClose: true } },
  { name: 'discount + quick close', inputs: { ...defaults, discountType: 'percent', discountValue: 15, quickClose: true } },
  { name: 'service units drive placards', inputs: { ...defaults, salesUnits: 400, serviceUnits: 120 } },
  { name: 'no service units (RO fallback)', inputs: { ...defaults, salesUnits: 400, serviceUnits: 0 } },
  { name: 'legacy new/used config', inputs: { ...defaults, salesUnits: undefined, newInv: 300, usedInv: 150 } }
];

let fails = 0;
const near = (a, b) => Math.abs(a - b) < 0.02;

for (const tc of CASES) {
  const c = qCalc(tc.inputs);
  const m = buildQuoteModel(tc.inputs, MAP, catalog, Math.max(0, (+tc.inputs.pVVUpgrade || 0) - (+tc.inputs.pVVPreload || 0)));
  const checks = [
    ['units', c.units, m.sizing.units],
    ['vehicleTags', c.vehicleTags, m.sizing.vehicleTags],
    ['keyTags', c.keyTags, m.sizing.keyTags],
    ['value.lostKeys', c.lostKeyValue, m.value.lostKeyValue],
    ['value.lostDeals', c.lostDealValue, m.value.lostDealValue],
    ['buy.discountAmt', c.discountAmount, m.options.buy.discountAmount],
    ['buy.quickClose', c.quickCloseValue, m.options.buy.quickCloseValue],
    ['placards', c.placards, m.sizing.placards],
    ['gateways', c.gateways, m.sizing.gateways],
    ['gatewaysIndoor', c.gatewaysIndoor, m.sizing.gatewaysIndoor],
    ['gatewaysOutdoor', c.gatewaysOutdoor, m.sizing.gatewaysOutdoor],
    ['buy.oneTime', c.oneTime, m.options.buy.oneTime],
    ['buy.monthly', c.monthly, m.options.buy.monthly],
    ['lease.oneTime', c.leaseOneTime, m.options.lease.oneTime],
    ['lease.monthly', c.leaseMonthly, m.options.lease.monthly],
    ['value.total', c.totalValue, m.value.totalValue]
  ];
  const bad = checks.filter(([, a, b]) => !near(a, b));
  if (bad.length) {
    fails += bad.length;
    console.log(`\x1b[31mFAIL\x1b[0m ${tc.name}`);
    bad.forEach(([n, a, b]) => console.log(`       ${n}: demo.html ${a}  vs  calc.js ${b}`));
  } else {
    console.log(`\x1b[32m ok \x1b[0m ${tc.name}`);
  }
}

function fail(msg) { console.error(`\x1b[31m✗ ${msg}\x1b[0m`); process.exit(1); }

console.log(fails
  ? `\n\x1b[31m${fails} mismatch(es). demo.html qCalc() and lib/calc.js have drifted.\x1b[0m`
  : `\n\x1b[32mParity holds across ${CASES.length} scenarios.\x1b[0m`);
process.exit(fails ? 1 : 0);
