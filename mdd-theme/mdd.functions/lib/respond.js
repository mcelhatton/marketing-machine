'use strict';

/** Only these origins may call the rep-facing endpoint from a browser. */
const ALLOWED_ORIGINS = [
  'https://mdd.io',
  'https://www.mdd.io',
  'https://mddrtls.com',
  'https://www.mddrtls.com'
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type, X-MDD-Rep-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store'
  };
}

function ok(sendResponse, body, origin) {
  sendResponse({ statusCode: 200, headers: corsHeaders(origin), body });
}

function fail(sendResponse, statusCode, message, origin, extra) {
  sendResponse({
    statusCode,
    headers: corsHeaders(origin),
    body: { ok: false, error: message, ...(extra || {}) }
  });
}

/** Never leak a stack trace or a HubSpot payload to the browser. */
function safeError(err) {
  const msg = String((err && err.message) || err);
  return msg.replace(/Bearer\s+\S+/gi, 'Bearer [redacted]').slice(0, 500);
}

module.exports = { ok, fail, corsHeaders, safeError, ALLOWED_ORIGINS };
