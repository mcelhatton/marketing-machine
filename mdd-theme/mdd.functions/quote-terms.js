/**
 * Purchase terms + buyer comments for MDD quotes.
 *
 * TERMS_HTML is the exact content of the HubSpot sales snippet named
 * "quote terms", captured verbatim from the live quote
 * mdd.io/uJy5uEslsi1Uim6 (quote 41928813895) on 2026-08-10.
 *
 * It is held here rather than pulled from the snippet at runtime because
 * HubSpot exposes no snippets API to this token. If sales edits the snippet,
 * re-capture it:
 *
 *   node scripts/quote-system/sync-terms.js --from-quote <quoteId>
 *
 * Rendered on the quote as the "Purchase terms" block (hs_terms).
 */

'use strict';

const TERMS_HTML = "<div style=\"\" dir=\"auto\" data-top-level=\"true\"><h2>Term &amp; Termination</h2><p style=\"margin:0;\">This Agreement is effective on the <strong>Date Signed</strong>. Services will begin on the <strong>Start Date</strong>, within <strong>30 days of initial payment</strong>.</p><p style=\"margin:0;\">The initial term (<strong>“Initial Term”</strong>) is <strong>three (3) months</strong> from the Start Date, including installation/onboarding and active service use. Thereafter, Services will continue <strong>month-to-month</strong> unless canceled.</p><p style=\"margin:0;\">Customer may cancel during the Initial Term and receive a refund of <strong>initial equipment costs</strong>, less a <strong>20% restocking fee</strong> and less the replacement cost of any <strong>lost, stolen, or damaged equipment</strong>.</p><p style=\"margin:0;\"><strong>Monthly service fees and all installation, setup, travel, shipping, taxes, and related charges are non-refundable.</strong></p><p style=\"margin:0;\">Customer must immediately discontinue use of the Software and Devices upon termination or expiration. <a href=\"https://app-na1.hubspotdocuments.com/documents/585393/view/234283323?accessId=6659e2\" title=\" Click here to view our services and license agreement.\" target=\"_blank\"> Click here to view our services and license agreement.</a></p><hr><h2>Billing, Payment &amp; ACH Authorization</h2><p style=\"margin:0;\"><strong>Lease agreements require monthly ACH autopay.</strong> Customer agrees to enroll prior to service activation and authorizes <strong>Mobile Dealer Data (“MDD”)</strong> to initiate recurring ACH debits for all subscription fees, lease fees, taxes, and authorized charges. This authorization remains in effect until all amounts are paid in full.</p><p style=\"margin:0;\">Returned or rejected payments may be reprocessed and may result in service suspension after notice.</p><p style=\"margin:0;\">Credit card payments, if accepted, are subject to a <strong>4% processing surcharge</strong>.</p><p style=\"margin:0;\">Company reserves the right to increase the subscription or service fees by up to four percent (4%) annually</p><p style=\"margin:0;\">Monthly service fees begin on the <strong>Start Date</strong>.</p><hr><h2>Equipment &amp; Use</h2><p style=\"margin:0;\">Customer will use the Software and Devices only in accordance with the <strong>Mobile Dealer Data Services &amp; License Agreement</strong> and is responsible for all equipment in its possession. Upon termination, leased equipment must be returned in reasonable condition or replacement costs will apply.</p><hr><h2>Governing Agreement</h2><p style=\"margin:0;\">This quote is governed by the <strong>Mobile Dealer Data Services &amp; License Agreement</strong>, which controls in the event of any conflict.</p><p style=\"margin:0;\">Click here to view the Services &amp; License Agreement.</p><hr><h2>Additional Equipment (Optional)</h2><p style=\"margin:0;\"><strong>Purchase:</strong></p><ul><li><p style=\"margin:0;\">Asset Tracking Tag (Key): <strong>$19.95 each</strong></p></li><li><p style=\"margin:0;\">Asset Tracking Tag (Car): <strong>$29.95 each</strong></p></li><li><p style=\"margin:0;\">Service Placard Kit: <strong>$49.95 each</strong></p></li><li><p style=\"margin:0;\">Indoor Tracking Gateway: <strong>$295.00 each</strong></p></li><li><p style=\"margin:0;\">Outdoor Tracking Gateway: <strong>$495.00 each</strong></p></li></ul><p style=\"margin:0;\"><strong>Lease Options (Monthly):</strong></p><ul><li><p style=\"margin:0;\">Asset Tracking Tag (Key): <strong>$1.00 each</strong></p></li><li><p style=\"margin:0;\">Asset Tracking Tag (Car): <strong>$1.00 each</strong></p></li><li><p style=\"margin:0;\">Service Placard Kit: <strong>$2.50 each</strong></p></li></ul><p style=\"margin:0;\">All equipment is subject to availability and shipping timelines.</p><hr><p style=\"margin:0;\">Questions?</p><p style=\"margin:0;\"><strong>sales@mdd.io | 844-292-7110</strong></p><p style=\"margin:0;\">Thank you for your business!</p></div>";

/** Short note rendered above the line items as "Comments from <rep>" (hs_comments). */
function buildComments(o) {
  const money = (v) => '$' + Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const isLease = o.option === 'lease';
  const lines = [];

  // The rep's own note leads. Whatever they typed on the System Builder is the
  // most deal-specific thing on the quote, so it should not sit under a
  // generated summary.
  if (o.notes) lines.push(o.notes);

  lines.push(
    'This quote covers a complete MDD system for ' + o.dealerName + ' - ' +
    Number(o.units).toLocaleString() + ' tracked units' +
    (o.placards ? ', ' + Number(o.placards).toLocaleString() + ' service placards' : '') +
    (o.gateways ? ' and ' + Number(o.gateways).toLocaleString() + ' gateways' : '') + '.'
  );

  lines.push(
    isLease
      ? 'Lease option: hardware is included in the monthly fee, so the only up-front cost is installation and on-boarding (' + money(o.oneTime) + '). Monthly is ' + money(o.monthly) + '.'
      : 'Buy option: you own the hardware outright for ' + money(o.oneTime) + ' up front, with ' + money(o.monthly) + ' per month for the platform and workflows.'
  );

  if (o.modules) lines.push('Included: ' + o.modules + '.');

  if (o.discountAmount > 0) {
    lines.push(
      'Hardware discount applied: ' + money(o.discountAmount) +
      ' off' + (o.discountPct ? ' (' + o.discountPct + '%)' : '') + '.'
    );
  }

  if (o.quickCloseValue > 0) {
    lines.push(
      '<strong>Quick Close offer:</strong> sign within 24 hours of receiving this quote and your first ' +
      'three months of ' + money(o.quickCloseValue / 3) + '/month service are included at no charge - ' +
      'a ' + money(o.quickCloseValue) + ' value. It is on the quote as a 100% discounted line so you can see exactly what it covers.'
    );
  }

  lines.push(
    'Gateway count is an estimate confirmed by our free site survey - the final number does not change your monthly. ' +
    'Every deployment includes a 1-day on-site install, 4-week hypercare, a dedicated customer success manager and a 90-day money-back guarantee.'
  );

  return '<p>' + lines.join('</p><p>') + '</p>';
}

module.exports = { TERMS_HTML, buildComments };
