#!/usr/bin/env node
/**
 * Re-capture the purchase terms from a live HubSpot quote into quote-terms.js.
 *
 * Sales maintains the wording in a HubSpot snippet ("quote terms"), and this
 * token has no snippets API access - so the way to pick up an edit is to build
 * one quote in HubSpot with the snippet inserted, then point this at it.
 *
 *   node scripts/quote-system/sync-terms.js --from-quote 41928813895
 *   node scripts/quote-system/sync-terms.js --from-slug uJy5uEslsi1Uim6
 *   node scripts/quote-system/sync-terms.js --from-slug uJy5uEslsi1Uim6 --dry-run
 *
 * Prints a diff summary and rewrites the TERMS_HTML constant in place.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const TARGET = path.join(ROOT, 'mdd-theme/mdd.functions/quote-terms.js');
const { client } = require(path.join(ROOT, 'mdd-theme/mdd.functions/lib/hubspot.js'));

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf('--' + n); return i > -1 ? argv[i + 1] : undefined; };
const DRY = argv.includes('--dry-run');

require('./load-env.js').loadEnv();
const TOKEN = process.env.HUBSPOT_QUOTE_TOKEN;

const C = { g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[31m', d: '\x1b[2m', x: '\x1b[0m' };

function die(m) { console.error(`${C.r}✗ ${m}${C.x}`); process.exit(1); }
if (!TOKEN) die('No HubSpot token. Add HUBSPOT_ACCESS_TOKEN to .env.');

async function resolveQuoteId(hs) {
  const id = arg('from-quote');
  if (id) return id;

  const slug = arg('from-slug');
  if (!slug) die('Pass --from-quote <id> or --from-slug <slug>.');

  const res = await hs.call('POST', '/crm/v3/objects/quotes/search', {
    filterGroups: [{ filters: [{ propertyName: 'hs_slug', operator: 'EQ', value: slug }] }],
    properties: ['hs_title'], limit: 2
  });
  if (!res.total) die(`No quote found with slug "${slug}".`);
  return res.results[0].id;
}

(async () => {
  const hs = client(TOKEN);
  const quoteId = await resolveQuoteId(hs);

  const q = await hs.getQuote(quoteId, ['hs_title', 'hs_terms']);
  const fresh = q.properties.hs_terms;
  if (!fresh || !fresh.trim()) {
    die(`Quote ${quoteId} ("${q.properties.hs_title}") has empty Purchase terms — insert the snippet on it first.`);
  }

  const src = fs.readFileSync(TARGET, 'utf8');
  const m = src.match(/const TERMS_HTML = ("(?:[^"\\]|\\.)*");/);
  if (!m) die(`Could not find the TERMS_HTML constant in ${TARGET}.`);

  const current = JSON.parse(m[1]);
  if (current === fresh) {
    console.log(`${C.g}Already in sync${C.x} — terms on quote ${quoteId} match quote-terms.js (${fresh.length} chars).`);
    return;
  }

  console.log(`Source quote ${quoteId} — "${q.properties.hs_title}"`);
  console.log(`  current ${current.length} chars`);
  console.log(`  fresh   ${fresh.length} chars  ${C.y}(changed)${C.x}`);

  // Headings are the useful diff granularity here; the body is one HTML blob.
  const heads = (s) => (s.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/g) || [])
    .map((h) => h.replace(/<[^>]+>/g, '').trim());
  const a = heads(current), b = heads(fresh);
  const gone = a.filter((h) => !b.includes(h));
  const added = b.filter((h) => !a.includes(h));
  if (gone.length) console.log(`  ${C.r}sections removed:${C.x} ${gone.join(' · ')}`);
  if (added.length) console.log(`  ${C.g}sections added:${C.x}   ${added.join(' · ')}`);

  if (DRY) { console.log(`\n${C.y}--dry-run: nothing written.${C.x}`); return; }

  fs.writeFileSync(TARGET, src.replace(m[1], JSON.stringify(fresh)));
  console.log(`\n${C.g}Updated${C.x} ${path.relative(ROOT, TARGET)}`);
  console.log(`${C.d}New quotes pick this up immediately. Quotes already created keep the terms they were built with.${C.x}`);
})().catch((e) => {
  console.error(`\n${C.r}✗ ${e.message}${C.x}`);
  process.exit(1);
});
