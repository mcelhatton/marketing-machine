# MDD Quote System — QA checklist

## Maths parity

The System Builder (`qCalc()` in `demo.html`) and the server (`lib/calc.js`) must agree on
sizing. Run this after any change to either:

```bash
node -e "
const c=require('./mdd-theme/mdd.functions/lib/calc.js');
const map=require('./mdd-theme/mdd.functions/pricing-map.json');
const cat={}; for(const g of ['buy','lease','addons'])
  for(const e of Object.values(map[g])) cat[e.productId]=e.catalogPrice;
const m=c.buildQuoteModel({newInv:300,usedInv:150,loaners:25,usedSoldMo:60,serviceROs:1500,
  laborRate:150,sellThrough:30,modService:true,modRecon:true,modLocate:true,modLot:true,
  modVV:false,minPerRO:15,reconDaysCut:3,holdingCost:40,gatewaysOverride:0},map,cat,400);
const exp={units:475,placards:86,gateways:26,value:63950};
const got={units:m.sizing.units,placards:m.sizing.placards,gateways:m.sizing.gateways,value:m.value.totalValue};
console.log(JSON.stringify(got));
process.exit(JSON.stringify(exp)===JSON.stringify(got)?0:1);
"
```

Reference deal must produce **475 units · 86 placards · 26 gateways · $63,950/mo**.

- [ ] Parity script exits 0
- [ ] Slide and chooser show the same tracked-unit and gateway counts
- [ ] Value recovered on the slide equals value recovered on the quote

## Create Quote

- [ ] Empty deal ID → inline error, no network call
- [ ] Non-numeric deal ID → inline error
- [ ] Non-existent deal ID → "Deal … not found", no orphan quotes created
- [ ] Page key and `MDD_REP_KEY` secret out of sync → 401 with a message saying it needs re-syncing (not a retry prompt)
- [ ] Rep is never asked to type a key anywhere in the flow
- [ ] Zero tracked units → blocked with a clear message
- [ ] Success → both quotes appear on the deal as **drafts**
- [ ] Both quotes carry the correct line items, quantities and prices
- [ ] Buy quote has one-time hardware; Lease quote has none
- [ ] Deal ID persists across slide navigation; **Reset** clears it
- [ ] Drift warning appears when catalog and slide prices disagree

## Chooser page

- [ ] Missing `?t=` → friendly error, no stack trace
- [ ] Tampered token → "not valid"
- [ ] Expired token → "expired", tells them to ask their rep
- [ ] Both options render with correct one-time, monthly and year-1 totals
- [ ] Dealership name appears in the headline and page title
- [ ] Value breakdown rows match the slide
- [ ] Buttons disable during submit; failure re-enables them
- [ ] Renders correctly at 375px, 768px and 1280px
- [ ] Keyboard: both buttons reachable by Tab, visible focus ring, Enter activates
- [ ] Text contrast passes 4.5:1
- [ ] No console errors

## Selection

- [ ] Choosing Buy → Buy publishes, Lease goes VOID
- [ ] Choosing Lease → Lease publishes, Buy goes VOID
- [ ] Buyer lands on a signable quote, not a draft
- [ ] Deal amount equals the chosen option's year-1 total
- [ ] Deal `MDD Purchase Option` matches the click
- [ ] Re-opening the link forwards to the live quote, creates nothing
- [ ] Voided quote is not signable via its own URL

## Quote document

**Do this one first** — it gates everything else in this section:

- [ ] Preview a real quote with `?mddDebug=1`. Confirm every `mdd_*` value resolves and none
      render blank. Custom number/text property access on quotes is undocumented; `qprop()`
      reads both possible paths, and this is how you confirm which one fires.
- [ ] Styles apply (CSS is inlined in a `<style>` block, not linked)
- [ ] `format_currency_value` renders real currency, not a raw number — confirms the
      camelCase `minDecimalDigits`/`maxDecimalDigits` args are accepted
- [ ] Expiration date renders as "August 6, 2026", not a timestamp — `datetimeformat` is
      deprecated-but-working; if HubSpot ever removes it, migrate to `format_datetime` with
      an LDML pattern (`MMMM d, yyyy`), **not** the `%B %e, %Y` string
- [ ] Remove the `?mddDebug=1` block before go-live if you'd rather not ship it

- [ ] Correct option banner (Buy vs Lease) with matching copy
- [ ] System table quantities match the slide
- [ ] Value section renders every breakdown row
- [ ] Payback shows on Buy only
- [ ] Line items table totals equal the banner figures
- [ ] Signature module renders and completes a test signature
- [ ] PDF download is legible — no dark backgrounds, no cut columns
- [ ] Renders on mobile
- [ ] Rep name, title, email appear in the footer

## Security

- [ ] `hubspot.config.yml` and `.env` are gitignored — `git status` shows neither
- [ ] No token, secret or rep key appears in any committed file
- [ ] `create-quote` returns 401 without the rep key header
- [ ] `quote-options` and `quote-select` reject unsigned tokens
- [ ] Error responses carry no stack traces or HubSpot payloads
- [ ] Chooser page sends `noindex`
- [ ] Endpoints reject cross-origin calls from outside `ALLOWED_ORIGINS`

## Housekeeping

- [ ] Test quotes deleted from the test deal
- [ ] `PRICING-RECONCILIATION.md` decisions 2 and 4 resolved before rep rollout
- [ ] Reps briefed on the Deal ID step and filling in their name/email once
