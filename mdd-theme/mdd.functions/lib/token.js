/**
 * HMAC-signed, expiring tokens for the customer-facing chooser link.
 *
 * The chooser URL is emailed to a buyer, so it must not be guessable and must
 * not let anyone enumerate quote ids. The token carries the quote id pair and
 * an expiry, signed with MDD_QUOTE_SIGNING_SECRET.
 */

'use strict';

const crypto = require('crypto');

const b64url = (buf) => Buffer.from(buf).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const unb64url = (str) => Buffer.from(
  str.replace(/-/g, '+').replace(/_/g, '/'), 'base64'
).toString('utf8');

function sign(payload, secret, ttlSeconds = 60 * 60 * 24 * 45) {
  if (!secret) throw new Error('Signing secret missing. Add the MDD_QUOTE_SIGNING_SECRET secret.');
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const data = b64url(JSON.stringify(body));
  const mac = b64url(crypto.createHmac('sha256', secret).update(data).digest());
  return `${data}.${mac}`;
}

function verify(token, secret) {
  if (!secret) throw new Error('Signing secret missing.');
  if (typeof token !== 'string' || !token.includes('.')) {
    return { ok: false, reason: 'malformed' };
  }
  const [data, mac] = token.split('.');
  const expected = b64url(crypto.createHmac('sha256', secret).update(data).digest());

  const a = Buffer.from(mac || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: 'bad_signature' };
  }

  let payload;
  try { payload = JSON.parse(unb64url(data)); } catch (_) {
    return { ok: false, reason: 'malformed' };
  }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: 'expired' };
  }
  return { ok: true, payload };
}

/** Constant-time compare for the rep shared secret. */
function safeEqual(a, b) {
  const ba = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

module.exports = { sign, verify, safeEqual };
