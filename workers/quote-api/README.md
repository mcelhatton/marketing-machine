# MDD Quote API — Cloudflare Worker

Hosts the three quote endpoints. HubSpot CMS serverless functions need Content Hub
Enterprise, which portal 585393 does not have — verified twice, with two independent
credentials. This is the fallback, and it is fully tested.

**This directory is an adapter only.** All logic lives in `mdd-theme/mdd.functions/` and is
imported unmodified, so the local harness and this Worker run identical code.

## Endpoints

| Method | Path | Who calls it |
|---|---|---|
| POST | `/create-quote` | The Create Quote button on `/sales-demo` (rep-only) |
| GET | `/quote-options` | The `/quote-options` chooser page (buyer) |
| POST | `/quote-select` | The buyer's Buy/Lease decision |

## Deploy

```bash
cd workers/quote-api
npm install

npx wrangler login                     # interactive, or export CLOUDFLARE_API_TOKEN

npx wrangler secret put HUBSPOT_QUOTE_TOKEN        # the pat-na1-… from .env
npx wrangler secret put MDD_QUOTE_SIGNING_SECRET   # openssl rand -base64 32
npx wrangler secret put MDD_REP_KEY                # must equal mdd_rep_key in demo.html

npx wrangler deploy
```

Deploy prints the Worker URL. Then point the front end at it — **both** files:

- `mdd-theme/templates/demo.html` → `MDD_QUOTE_API`
- `mdd-theme/templates/quote-chooser.html` → `API`

and add the Worker origin to `ALLOWED_ORIGINS` in
`mdd-theme/mdd.functions/lib/respond.js` if you serve the chooser from anywhere but mdd.io.
Re-upload both templates and re-publish the pages.

## MDD_REP_KEY

Not something reps type. HubSpot renders it into `/sales-demo`, which is password-protected;
reaching that page is the authentication. The secret here and `mdd_rep_key` at the top of
`demo.html` must always match — rotate both together or Create Quote 401s.

## Local development

```bash
npm run dev        # wrangler dev --local, real workerd runtime
```

Secrets come from `.dev.vars` (gitignored — it holds a live HubSpot token, never commit it):

```
HUBSPOT_QUOTE_TOKEN=pat-na1-…
MDD_QUOTE_SIGNING_SECRET=anything-for-local
MDD_REP_KEY=…
```

Local runs hit **real HubSpot** and create **real quotes**. Use the sandbox deal
`63548402544` or the sample deal `63674104585`, and void what you create.

## Verified

Run against `wrangler dev --local` on 2026-08-10, full chain, real HubSpot:

- 401 without the rep key; 403 on a tampered token (`bad_signature`)
- CORS preflight returns `Access-Control-Allow-Origin: https://mdd.io`
- `create-quote` → Buy $39,609.64 + $1,095/mo, Lease $1,500 + $2,260/mo
- `quote-select` immediately after creation → correct redirect, no race
  (`hs_quote_link` is null for ~15s after publish; the URL is derived from
  `hs_domain` + `hs_slug` instead)
- Chosen quote published with Purchase terms, Comments and Signature rendering;
  other quote VOID; deal amount and `mdd_purchase_option` written back
- Re-opening a used link forwards instead of creating anything

Bundle: 96 KiB, 22 KiB gzipped. `nodejs_compat` is required — `token.js` uses `node:crypto`.
