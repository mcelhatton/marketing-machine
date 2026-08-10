#!/usr/bin/env node
/**
 * Adds the "Create Quote in HubSpot" flow to the System Builder slide of
 * mdd-theme/templates/demo.html.
 *
 * Idempotent - running it twice is a no-op. A .bak is written on first run.
 *   node scripts/quote-system/patch-demo-create-quote.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'mdd-theme', 'templates', 'demo.html');
const MARK = 'MDD-QUOTE-INTEGRATION';

let src = fs.readFileSync(FILE, 'utf8');

if (src.includes(MARK)) {
  console.log('Already patched - nothing to do.');
  process.exit(0);
}
if (!fs.existsSync(FILE + '.bak')) fs.writeFileSync(FILE + '.bak', src);

const apply = (label, find, replace) => {
  if (!src.includes(find)) {
    console.error(`FAILED: could not find anchor for "${label}".`);
    console.error('demo.html has drifted. Fix the anchor in this script before rerunning.');
    process.exit(1);
  }
  src = src.replace(find, replace);
  console.log(`  + ${label}`);
};

/* ------------------------------------------------------------------ 1. CSS */
apply('styles',
  `  .q-hint { font-size: 11px; color: #9ca3af; margin-top: 8px; line-height: 1.5; }`,
  `  .q-hint { font-size: 11px; color: #9ca3af; margin-top: 8px; line-height: 1.5; }

  /* ---------- ${MARK}: Create Quote panel ---------- */
  .q-hs { border-color: #d9f0b0; background: #fbfef5; }
  .q-hs h3 { color: var(--accent); }
  .q-hs .q-row input { width: 100%; text-align: left; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .q-hs-out { margin-top: 10px; font-size: 12px; line-height: 1.6; }
  .q-hs-out.err { color: #b91c1c; }
  .q-hs-out.ok { color: #15803d; }
  .q-hs-link { display: flex; gap: 6px; margin-top: 8px; }
  .q-hs-link input { flex: 1; padding: 6px 8px; font-size: 11px; border: 1px solid #d1d5db; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .q-hs-link button { padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
  .q-hs-warn { color: #b45309; font-size: 11px; margin-top: 6px; }
  .q-actions button:disabled { opacity: .55; cursor: not-allowed; }`);

/* --------------------------------------------------- 2. default config key */
apply('dealId default',
  `    "pVVUpgrade": 400
  }`,
  `    "pVVUpgrade": 400,
    "dealId": ""
  }`);

/* ---------------------------------------------------------- 3. panel markup */
apply('Create Quote panel markup',
  `        <div class="q-actions">
          <button class="primary" id="q-copy">Copy summary</button>
          <button id="q-reset">Reset</button>
        </div>`,
  `        <div class="q-card q-hs">
          <h3>Send to HubSpot</h3>
          <div class="q-row"><input type="text" id="q-deal" placeholder="HubSpot Deal ID — e.g. 31234567890" value="\${escAttr(q.dealId || '')}"></div>
          <div class="q-hint">Open the deal in HubSpot; the ID is the last number in the URL. Creates a Buy quote and a Lease quote as drafts, then gives you one link to send the customer.</div>
          <div class="q-hs-out" id="q-hs-out"></div>
        </div>
        <div class="q-actions">
          <button class="primary" id="q-create">Create Quote</button>
          <button id="q-copy">Copy summary</button>
          <button id="q-reset">Reset</button>
        </div>`);

/* ------------------------------------------------------------- 4. handlers */
apply('handlers',
  `  $("q-copy").onclick = () => {`,
  `  $("q-deal").addEventListener("input", e => { config.quote.dealId = e.target.value.trim(); persist(); });
  $("q-create").onclick = () => mddCreateQuote();
  $("q-copy").onclick = () => {`);

/* -------------------------------------------------- 5. integration module */
apply('integration module',
  `function qSummaryText() {`,
  `/* ================= ${MARK} =================
   Posts the dealership inputs to the CMS serverless function, which prices
   them from the HubSpot product catalog and creates the Buy + Lease draft
   quotes. Prices are never sent from here - the browser is not trusted with
   money. The rep key is entered once per session and kept in sessionStorage. */

const MDD_QUOTE_API = "/_hcms/api/mdd";
const MDD_REP_KEY_LS = "mdd-rep-key";

function mddRepKey(force) {
  let k = force ? "" : sessionStorage.getItem(MDD_REP_KEY_LS);
  if (!k) {
    k = (prompt("MDD rep key (once per session):") || "").trim();
    if (k) sessionStorage.setItem(MDD_REP_KEY_LS, k);
  }
  return k;
}

function mddQuoteOut(html, cls) {
  const el = $("q-hs-out");
  if (!el) return;
  el.className = "q-hs-out" + (cls ? " " + cls : "");
  el.innerHTML = html;
}

async function mddCreateQuote() {
  const q = config.quote;
  const dealId = String(q.dealId || "").trim();

  if (!/^\\d+$/.test(dealId)) {
    mddQuoteOut("Enter the numeric HubSpot Deal ID first.", "err");
    $("q-deal").focus();
    return;
  }

  const key = mddRepKey();
  if (!key) { mddQuoteOut("A rep key is required to create quotes.", "err"); return; }

  const btn = $("q-create");
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Creating…";
  mddQuoteOut("Pricing from the HubSpot catalog and building both quotes…");

  // Only the dealership inputs travel. Pricing lives in HubSpot.
  const inputs = {};
  ["dealer","rooftops","newInv","usedInv","loaners","usedSoldMo","serviceROs",
   "laborRate","sellThrough","gatewaysOverride","modLocate","modLot","modService",
   "modRecon","modVV","minPerRO","reconDaysCut","holdingCost"].forEach(k => { inputs[k] = q[k]; });

  try {
    const res = await fetch(MDD_QUOTE_API + "/create-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-MDD-Rep-Key": key },
      body: JSON.stringify({
        dealId,
        inputs,
        // VehicleVault package margin still lives on this page.
        vvPerPkg: Math.max(0, (+q.pVVUpgrade || 0) - (+q.pVVPreload || 0)),
        expiresInDays: 30
      })
    });
    const data = await res.json();

    if (res.status === 401) {
      sessionStorage.removeItem(MDD_REP_KEY_LS);
      throw new Error("Rep key rejected. Click Create Quote again to re-enter it.");
    }
    if (!data || data.ok !== true) throw new Error((data && data.error) || "Quote creation failed.");

    const b = data.model.options.buy, l = data.model.options.lease;
    const drift = mddDriftNotice(b, l);

    mddQuoteOut(
      "<b>Both quotes created as drafts on " + esc(data.dealName || ("deal " + dealId)) + ".</b><br>" +
      "Buy: " + fmt$(b.oneTime) + " one-time &middot; " + fmt$(b.monthly) + "/mo<br>" +
      "Lease: " + fmt$(l.oneTime) + " one-time &middot; " + fmt$(l.monthly) + "/mo<br>" +
      "<span style='color:#6b7280'>Send this link to the customer — they choose, then sign.</span>" +
      '<div class="q-hs-link"><input readonly value="' + escAttr(data.chooserUrl) + '" id="q-hs-url">' +
      '<button id="q-hs-copy">Copy link</button></div>' +
      '<div style="margin-top:8px"><a href="' + escAttr(data.quoteEditUrls.buy) + '" target="_blank" rel="noopener">Open Buy quote</a> &middot; ' +
      '<a href="' + escAttr(data.quoteEditUrls.lease) + '" target="_blank" rel="noopener">Open Lease quote</a></div>' +
      drift +
      ((data.warnings && data.warnings.length)
        ? '<div class="q-hs-warn">' + data.warnings.map(esc).join("<br>") + "</div>" : ""),
      "ok"
    );

    $("q-hs-copy").onclick = () => {
      const el = $("q-hs-url");
      el.select();
      navigator.clipboard.writeText(el.value).then(() => {
        $("q-hs-copy").textContent = "Copied ✓";
        setTimeout(() => { const c = $("q-hs-copy"); if (c) c.textContent = "Copy link"; }, 1500);
      });
    };
  } catch (e) {
    mddQuoteOut(esc(e.message || String(e)), "err");
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}

/* The slide shows the rep's local price list; HubSpot quotes from the catalog.
   Surface the gap rather than letting the rep discover it in front of a dealer. */
function mddDriftNotice(buy, lease) {
  const c = qCalc(config.quote);
  const notes = [];
  if (Math.abs(c.oneTime - buy.oneTime) > 1) {
    notes.push("Buy one-time on this slide is " + fmt$(c.oneTime) + ", the quote is " + fmt$(buy.oneTime) + ".");
  }
  if (Math.abs(c.leaseMonthly - lease.monthly) > 1) {
    notes.push("Lease monthly on this slide is " + fmt$(c.leaseMonthly) + ", the quote is " + fmt$(lease.monthly) + ".");
  }
  if (!notes.length) return "";
  return '<div class="q-hs-warn"><b>Catalog pricing differs from this slide.</b><br>' +
         notes.map(esc).join("<br>") + "<br>The quote is correct — HubSpot's product catalog is the source of truth.</div>";
}

function qSummaryText() {`);

fs.writeFileSync(FILE, src);
console.log('\\nPatched mdd-theme/templates/demo.html (backup at demo.html.bak).');
