/**
 * Thin HubSpot CRM client for the MDD quote builder.
 * Legacy quotes API (/crm/v3/objects/quotes) - portal 585393 runs
 * customizable_quote_template, i.e. the legacy quote system, not CPQ.
 */

'use strict';

const BASE = 'https://api.hubapi.com';

/** Association type IDs, legacy quotes. */
const ASSOC = {
  QUOTE_TO_TEMPLATE: 286,
  QUOTE_TO_DEAL: 64,
  QUOTE_TO_LINE_ITEM: 67,
  QUOTE_TO_CONTACT_SIGNER: 702,
  QUOTE_TO_COMPANY: 71
};

/** hs_status values that matter to us. */
const STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'APPROVAL_NOT_NEEDED', // this is what actually publishes a legacy quote
  APPROVED: 'APPROVED',
  VOID: 'VOID'
};

class HubSpotError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'HubSpotError';
    this.status = status;
    this.body = body;
  }
}

function client(token) {
  if (!token) throw new Error('HubSpot token missing. Add the HUBSPOT_QUOTE_TOKEN secret.');

  async function call(method, path, body, attempt = 0) {
    const res = await fetch(BASE + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    // Retry once on rate limit / transient 5xx. Serverless caps us at 10s,
    // so exactly one short retry - no exponential ladder.
    if ((res.status === 429 || res.status >= 500) && attempt < 1) {
      await new Promise((r) => setTimeout(r, 600));
      return call(method, path, body, attempt + 1);
    }

    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (_) { /* non-JSON error body */ }

    if (!res.ok) {
      const msg = (json && (json.message || json.error)) || text || res.statusText;
      throw new HubSpotError(`${method} ${path} -> ${res.status}: ${msg}`, res.status, json);
    }
    return json;
  }

  return {
    call,

    /** Live unit prices keyed by product id. */
    async getProductPrices(productIds) {
      if (!productIds.length) return {};
      const out = {};
      const res = await call('POST', '/crm/v3/objects/products/batch/read', {
        properties: ['price', 'name', 'hs_sku', 'hs_status'],
        inputs: productIds.map((id) => ({ id: String(id) }))
      });
      for (const r of res.results || []) {
        if (r.properties && r.properties.hs_status === 'archived') continue;
        out[r.id] = r.properties.price != null ? Number(r.properties.price) : null;
      }
      return out;
    },

    async getDeal(dealId) {
      return call('GET', `/crm/v3/objects/deals/${encodeURIComponent(dealId)}?properties=dealname,amount,pipeline,dealstage,hubspot_owner_id`);
    },

    /** Primary contact + company on the deal, used for signer association. */
    async getDealParties(dealId) {
      const [contacts, companies] = await Promise.all([
        call('GET', `/crm/v4/objects/deals/${encodeURIComponent(dealId)}/associations/contacts?limit=10`).catch(() => ({ results: [] })),
        call('GET', `/crm/v4/objects/deals/${encodeURIComponent(dealId)}/associations/companies?limit=10`).catch(() => ({ results: [] }))
      ]);
      return {
        contactIds: (contacts.results || []).map((r) => r.toObjectId),
        companyIds: (companies.results || []).map((r) => r.toObjectId)
      };
    },

    async createLineItems(lines) {
      if (!lines.length) return [];
      const res = await call('POST', '/crm/v3/objects/line_items/batch/create', {
        inputs: lines.map((l, i) => ({
          properties: {
            // Product-less lines exist so they do not inherit the product's
            // recurring billing frequency — see the Quick Close line in calc.js.
            ...(l.hs_product_id ? { hs_product_id: String(l.hs_product_id) } : {}),
            name: l.name,
            quantity: String(l.quantity),
            price: String(l.price),
            // Pins the order on the rendered quote AND on the chooser page.
            // Without it HubSpot returns line items in an arbitrary order.
            hs_position_on_quote: String(i),
            // HubSpot rejects negative prices, so discounts and the Quick Close
            // giveaway are expressed as a percentage off a full-price line.
            ...(l.discountPercent > 0 ? { hs_discount_percentage: String(l.discountPercent) } : {}),
            ...(l.billing === 'monthly'
              ? { recurringbillingfrequency: 'monthly', hs_recurring_billing_period: 'P12M' }
              : {})
          }
        }))
      });
      return (res.results || []).map((r) => r.id);
    },

    async createQuote(properties) {
      return call('POST', '/crm/v3/objects/quotes', { properties });
    },

    async updateQuote(quoteId, properties) {
      return call('PATCH', `/crm/v3/objects/quotes/${encodeURIComponent(quoteId)}`, { properties });
    },

    async getQuote(quoteId, props) {
      const p = (props || ['hs_title', 'hs_status', 'hs_quote_amount', 'hs_quote_link', 'hs_pdf_download_link', 'hs_expiration_date']).join(',');
      return call('GET', `/crm/v3/objects/quotes/${encodeURIComponent(quoteId)}?properties=${encodeURIComponent(p)}`);
    },

    /** v4 default association - one call per target. */
    async associate(quoteId, toObjectType, toObjectId, typeId) {
      return call('PUT',
        `/crm/v4/objects/quotes/${encodeURIComponent(quoteId)}/associations/${toObjectType}/${encodeURIComponent(toObjectId)}`,
        [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: typeId }]
      );
    },

    async updateDeal(dealId, properties) {
      return call('PATCH', `/crm/v3/objects/deals/${encodeURIComponent(dealId)}`, { properties });
    }
  };
}

module.exports = { client, ASSOC, STATUS, HubSpotError };
