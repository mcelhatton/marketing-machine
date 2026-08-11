/**
 * Sales-channel alerts for quote activity.
 *
 * Two moments matter to a rep: the buyer OPENED the options page, and the buyer
 * CHOSE. The first is the better signal — it says the deal is live right now,
 * while the rep can still pick up the phone.
 *
 * Destination is a single incoming-webhook URL in MDD_SALES_WEBHOOK. Slack and
 * Microsoft Teams want different payload shapes, so the format is detected from
 * the host rather than configured — one less thing to get wrong.
 *
 * Nothing in here is allowed to break the buyer's flow. Every send is wrapped so
 * a dead webhook, a timeout or a malformed URL degrades to "no alert" and the
 * quote still works.
 */

'use strict';

const PORTAL_ID = '585393';

const money = (v) => '$' + Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

function dealUrl(dealId) {
  return `https://app.hubspot.com/contacts/${PORTAL_ID}/deal/${dealId}`;
}

/** slack | teams | generic — inferred from the webhook host. */
function flavour(url) {
  if (/hooks\.slack\.com/i.test(url)) return 'slack';
  if (/webhook\.office\.com|office\.com\/webhookb2|logic\.azure\.com/i.test(url)) return 'teams';
  return 'generic';
}

function toSlack(msg) {
  const blocks = [
    { type: 'section', text: { type: 'mrkdwn', text: `*${msg.title}*` } }
  ];
  if (msg.fields && msg.fields.length) {
    blocks.push({
      type: 'section',
      fields: msg.fields.slice(0, 10).map((f) => ({ type: 'mrkdwn', text: `*${f.label}*\n${f.value}` }))
    });
  }
  if (msg.links && msg.links.length) {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: msg.links.map((l) => `<${l.url}|${l.label}>`).join('  ·  ') }]
    });
  }
  return { text: msg.title, blocks };
}

function toTeams(msg) {
  return {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    themeColor: msg.colour || '8AC833',
    summary: msg.title,
    sections: [{
      activityTitle: msg.title,
      facts: (msg.fields || []).map((f) => ({ name: f.label, value: f.value })),
      markdown: true
    }],
    potentialAction: (msg.links || []).map((l) => ({
      '@type': 'OpenUri', name: l.label, targets: [{ os: 'default', uri: l.url }]
    }))
  };
}

function toGeneric(msg) {
  const lines = [msg.title];
  for (const f of msg.fields || []) lines.push(`${f.label}: ${f.value}`);
  for (const l of msg.links || []) lines.push(`${l.label}: ${l.url}`);
  return { text: lines.join('\n') };
}

/**
 * Fire an alert. Never throws, never rejects.
 * Returns true only if the webhook accepted it — useful in tests.
 */
async function send(msg, webhookUrl) {
  const url = webhookUrl || process.env.MDD_SALES_WEBHOOK;
  if (!url) return false;

  const shape = flavour(url);
  const body = shape === 'slack' ? toSlack(msg) : shape === 'teams' ? toTeams(msg) : toGeneric(msg);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.ok;
  } catch (_) {
    return false;   // a broken webhook must never break a quote
  }
}

/** The buyer opened the Buy-vs-Lease page. Sent once per quote pair. */
function viewedMessage(d) {
  return {
    title: `👀 ${d.dealer || 'A prospect'} just opened their quote options`,
    colour: 'F59E0B',
    fields: [
      { label: 'Buy', value: `${money(d.buy.oneTime)} one-time · ${money(d.buy.monthly)}/mo` },
      { label: 'Lease', value: `${money(d.lease.oneTime)} one-time · ${money(d.lease.monthly)}/mo` },
      ...(d.rep ? [{ label: 'Rep', value: d.rep }] : []),
      ...(d.dealName ? [{ label: 'Deal', value: d.dealName }] : [])
    ],
    links: [
      ...(d.dealId ? [{ label: 'Open deal', url: dealUrl(d.dealId) }] : []),
      ...(d.chooserUrl ? [{ label: 'The page they are looking at', url: d.chooserUrl }] : [])
    ]
  };
}

/** The buyer chose. Sent once — a re-opened link does not re-alert. */
function chosenMessage(d) {
  const isLease = d.choice === 'lease';
  return {
    title: `✅ ${d.dealer || 'A prospect'} chose ${isLease ? 'LEASE' : 'BUY'}`,
    colour: '8AC833',
    fields: [
      { label: 'Option', value: isLease ? 'Lease — hardware in the monthly' : 'Buy — own the hardware' },
      { label: 'One-time', value: money(d.oneTime) },
      { label: 'Monthly', value: money(d.monthly) },
      { label: 'First-year total', value: money(d.year1Total) },
      ...(d.rep ? [{ label: 'Rep', value: d.rep }] : []),
      { label: 'Status', value: 'Quote published for signature; the other option was withdrawn.' }
    ],
    links: [
      ...(d.quoteUrl ? [{ label: 'The quote they are signing', url: d.quoteUrl }] : []),
      ...(d.dealId ? [{ label: 'Open deal', url: dealUrl(d.dealId) }] : [])
    ]
  };
}

module.exports = { send, viewedMessage, chosenMessage, flavour, money, dealUrl };
