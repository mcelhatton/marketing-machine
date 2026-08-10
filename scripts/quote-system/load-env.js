/**
 * Minimal .env loader for the quote-system scripts.
 *
 * The repo already keeps a HubSpot private app token in .env as
 * HUBSPOT_ACCESS_TOKEN, so accept that name as well as the
 * HUBSPOT_QUOTE_TOKEN the serverless secrets use. No dependency, because
 * this repo has no dotenv and adding one for six lines is silly.
 */

'use strict';

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const file = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(file)) {
    for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  }
  // Accept either name; the serverless secret name wins if both are set.
  if (!process.env.HUBSPOT_QUOTE_TOKEN && process.env.HUBSPOT_ACCESS_TOKEN) {
    process.env.HUBSPOT_QUOTE_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
  }
  return process.env.HUBSPOT_QUOTE_TOKEN;
}

module.exports = { loadEnv };
