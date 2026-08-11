/**
 * Cloudflare Worker adapter for the MDD quote endpoints.
 *
 * HubSpot CMS serverless functions need Content Hub Enterprise; portal 585393 is
 * on Professional, so the three handlers run here instead. This file is ONLY an
 * adapter - it holds no business logic. The handlers in
 * mdd-theme/mdd.functions/ are imported unchanged, so the local test harness, the
 * (unused) HubSpot functions and this Worker all execute the same code.
 *
 * Routes, mounted under whatever route you bind in wrangler.toml:
 *   POST /create-quote     rep-only, creates the Buy + Lease draft pair
 *   GET  /quote-options    buyer-facing, feeds the chooser page
 *   POST /quote-select     buyer's decision - publishes one, voids the other
 *
 * Deploy:  npx wrangler deploy
 * Secrets: npx wrangler secret put HUBSPOT_QUOTE_TOKEN
 *          npx wrangler secret put MDD_QUOTE_SIGNING_SECRET
 *          npx wrangler secret put MDD_REP_KEY
 */

import createQuote from '../../../mdd-theme/mdd.functions/create-quote.js';
import quoteOptions from '../../../mdd-theme/mdd.functions/quote-options.js';
import quoteSelect from '../../../mdd-theme/mdd.functions/quote-select.js';

// Default import, not named — these modules are CommonJS and named-export
// interop from CJS is not reliable across bundlers.
import respond from '../../../mdd-theme/mdd.functions/lib/respond.js';
const { corsHeaders } = respond;

const ROUTES = {
  'create-quote': { handler: createQuote.main, method: 'POST' },
  'quote-options': { handler: quoteOptions.main, method: 'GET' },
  'quote-select': { handler: quoteSelect.main, method: 'POST' }
};

/**
 * The handlers were written against HubSpot's (context, sendResponse) contract.
 * sendResponse is fire-and-forget there, so wrap it in a promise here.
 */
function runHandler(handler, context) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const sendResponse = (res) => {
      if (settled) return;
      settled = true;
      resolve(res || { statusCode: 204, headers: {}, body: null });
    };
    Promise.resolve(handler(context, sendResponse)).then(
      () => { if (!settled) reject(new Error('Handler finished without sending a response.')); },
      reject
    );
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin') || '';

    // The handlers read configuration from process.env (HubSpot's convention).
    // Workers exposes bindings on `env`, so bridge them before dispatching.
    if (typeof process !== 'undefined' && process.env) {
      for (const k of ['HUBSPOT_QUOTE_TOKEN', 'MDD_QUOTE_SIGNING_SECRET', 'MDD_REP_KEY',
                       'MDD_QUOTE_TEMPLATE_ID', 'MDD_CHOOSER_BASE', 'MDD_SALES_WEBHOOK']) {
        if (env[k] != null) process.env[k] = env[k];
      }
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const name = url.pathname.replace(/^\/+|\/+$/g, '').split('/').pop();
    const route = ROUTES[name];

    if (!route) {
      return json(404, { ok: false, error: 'Unknown endpoint.' }, origin);
    }
    if (request.method !== route.method) {
      return json(405, { ok: false, error: `Use ${route.method} for /${name}.` }, origin);
    }

    // Match HubSpot's context shape exactly.
    let body = {};
    if (route.method === 'POST') {
      try { body = await request.json(); } catch (_) {
        return json(400, { ok: false, error: 'Expected a JSON body.' }, origin);
      }
    }

    const params = {};
    for (const [k, v] of url.searchParams) {
      (params[k] = params[k] || []).push(v);   // HubSpot gives arrays
    }

    const headers = {};
    for (const [k, v] of request.headers) headers[k.toLowerCase()] = v;

    // waitUntil lets the handlers fire sales alerts after the response is sent,
    // so a slow Slack never delays the buyer. Bound because Cloudflare requires
    // it to be called on the original context object.
    const context = {
      body, params, headers, accountId: '585393',
      waitUntil: ctx && ctx.waitUntil ? ctx.waitUntil.bind(ctx) : null
    };

    try {
      const res = await runHandler(route.handler, context);
      return json(res.statusCode || 200, res.body, origin, res.headers);
    } catch (err) {
      return json(500, { ok: false, error: 'Something went wrong building the quote.' }, origin);
    }
  }
};

function json(status, body, origin, extraHeaders) {
  return new Response(body == null ? null : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
      ...(extraHeaders || {})
    }
  });
}
