#!/usr/bin/env node
/**
 * Creates the custom QUOTE and DEAL properties the MDD quote system writes to.
 * Idempotent: existing properties are left alone, missing ones are created.
 *
 *   HUBSPOT_QUOTE_TOKEN=pat-na1-xxxx node scripts/quote-system/create-quote-properties.js
 *   HUBSPOT_QUOTE_TOKEN=pat-na1-xxxx node scripts/quote-system/create-quote-properties.js --dry-run
 *
 * Token needs: crm.objects.quotes.write, crm.objects.deals.write,
 *              crm.schemas.quotes.write, crm.schemas.deals.write
 */

'use strict';

require('./load-env.js').loadEnv();
const TOKEN = process.env.HUBSPOT_QUOTE_TOKEN;
const DRY = process.argv.includes('--dry-run');
const GROUP_QUOTE = 'quoteinformation';
const GROUP_DEAL = 'dealinformation';

if (!TOKEN) {
  console.error('No HubSpot token found. Add HUBSPOT_ACCESS_TOKEN to .env, or export HUBSPOT_QUOTE_TOKEN.');
  process.exit(1);
}

const num = (name, label, description) => ({
  name, label, description, type: 'number', fieldType: 'number', groupName: GROUP_QUOTE
});
const str = (name, label, description) => ({
  name, label, description, type: 'string', fieldType: 'text', groupName: GROUP_QUOTE
});
const text = (name, label, description) => ({
  name, label, description, type: 'string', fieldType: 'textarea', groupName: GROUP_QUOTE
});

const PURCHASE_OPTION_OPTIONS = [
  { label: 'Buy - own the hardware', value: 'buy', displayOrder: 0 },
  { label: 'Lease - hardware in the monthly', value: 'lease', displayOrder: 1 }
];

const QUOTE_PROPERTIES = [
  {
    name: 'mdd_purchase_option', label: 'MDD Purchase Option',
    description: 'Whether this quote represents the Buy or the Lease path.',
    type: 'enumeration', fieldType: 'select', groupName: GROUP_QUOTE,
    options: PURCHASE_OPTION_OPTIONS
  },
  str('mdd_dealer_name', 'MDD Dealership / Group', 'Dealership name as entered in the System Builder.'),
  num('mdd_rooftops', 'MDD Rooftops', 'Number of rooftops or lots in scope.'),
  num('mdd_tracked_units', 'MDD Tracked Units', 'New + used + loaner units covered by the system.'),
  num('mdd_vehicle_tags', 'MDD Vehicle Tags', 'Vehicle tracking tag count.'),
  num('mdd_key_tags', 'MDD Key Tags', 'Key tracking tag count.'),
  num('mdd_placards', 'MDD Service Placards', 'Reusable service placard count.'),
  num('mdd_gateways', 'MDD Gateways', 'Estimated gateway count; confirmed by site survey.'),
  str('mdd_modules', 'MDD Modules', 'Comma-separated list of modules in scope.'),
  num('mdd_monthly_value', 'MDD Monthly Value Recovered', 'Modelled monthly value recovered.'),
  num('mdd_annual_value', 'MDD Annual Value Recovered', 'Modelled annual value recovered.'),
  text('mdd_value_breakdown', 'MDD Value Breakdown', 'One "label|amount" row per line, rendered by the quote template.'),
  num('mdd_net_value_monthly', 'MDD Net Value / Month', 'Monthly value recovered minus the monthly investment.'),
  str('mdd_payback_label', 'MDD Payback', 'Human-readable payback period, e.g. "< 1 month".'),
  num('mdd_one_time_total', 'MDD One-Time Total', 'One-time investment for this option.'),
  num('mdd_monthly_total', 'MDD Monthly Total', 'Recurring monthly investment for this option.'),
  num('mdd_year1_total', 'MDD Year 1 Total', 'One-time + 12 months. Used as the deal amount.'),
  str('mdd_sibling_quote_id', 'MDD Sibling Quote ID', 'The paired Buy/Lease quote created at the same time.'),
  str('mdd_chooser_url', 'MDD Chooser URL', 'Buyer-facing Buy vs Lease selection link.')
];

const DEAL_PROPERTIES = [
  {
    name: 'mdd_purchase_option', label: 'MDD Purchase Option',
    description: 'Which option the buyer selected on the MDD quote chooser.',
    type: 'enumeration', fieldType: 'select', groupName: GROUP_DEAL,
    options: PURCHASE_OPTION_OPTIONS
  }
];

async function api(method, path, body) {
  const res = await fetch('https://api.hubapi.com' + path, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const txt = await res.text();
  let json = null;
  try { json = txt ? JSON.parse(txt) : null; } catch (_) {}
  return { status: res.status, ok: res.ok, json, txt };
}

async function ensure(objectType, props) {
  const existing = await api('GET', `/crm/v3/properties/${objectType}`);
  if (!existing.ok) {
    console.error(`  ! could not list ${objectType} properties: ${existing.status} ${existing.txt.slice(0, 200)}`);
    return { created: 0, skipped: 0, failed: props.length };
  }
  const have = new Set((existing.json.results || []).map((p) => p.name));

  let created = 0; let skipped = 0; let failed = 0;
  for (const p of props) {
    if (have.has(p.name)) { console.log(`  = ${objectType}.${p.name} already exists`); skipped++; continue; }
    if (DRY) { console.log(`  + ${objectType}.${p.name} WOULD BE CREATED`); created++; continue; }

    const res = await api('POST', `/crm/v3/properties/${objectType}`, p);
    if (res.ok) { console.log(`  + ${objectType}.${p.name} created`); created++; }
    else { console.error(`  ! ${objectType}.${p.name} failed: ${res.status} ${(res.json && res.json.message) || res.txt.slice(0, 200)}`); failed++; }
  }
  return { created, skipped, failed };
}

(async () => {
  console.log(DRY ? 'DRY RUN - nothing will be written\n' : 'Creating MDD quote properties\n');
  console.log('QUOTE:');
  const q = await ensure('quotes', QUOTE_PROPERTIES);
  console.log('\nDEAL:');
  const d = await ensure('deals', DEAL_PROPERTIES);

  console.log(`\nDone. created=${q.created + d.created} existing=${q.skipped + d.skipped} failed=${q.failed + d.failed}`);
  process.exit(q.failed + d.failed > 0 ? 1 : 0);
})();
