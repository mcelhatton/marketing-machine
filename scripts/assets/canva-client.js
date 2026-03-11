/**
 * Canva Connect API Client
 *
 * Create and render branded marketing assets using Canva templates.
 * Used for OG images, social cards, ad creatives with brand overlays.
 *
 * @requires CANVA_API_KEY environment variable
 * @requires CANVA_BRAND_KIT_ID environment variable (optional)
 * API Docs: https://www.canva.dev/docs/connect/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class CanvaClient {
  constructor(apiKey, brandKitId) {
    this.apiKey = apiKey || process.env.CANVA_API_KEY;
    this.brandKitId = brandKitId || process.env.CANVA_BRAND_KIT_ID;
    this.baseUrl = 'api.canva.com';

    if (!this.apiKey) {
      throw new Error('CANVA_API_KEY is required');
    }
  }

  /**
   * Make authenticated request to Canva API
   */
  async request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: `/rest/v1${path}`,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = body ? JSON.parse(body) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(new Error(`Canva API Error: ${res.statusCode} - ${JSON.stringify(response)}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  // ============================================
  // Design Methods
  // ============================================

  /**
   * Create a design from a template
   */
  async createDesignFromTemplate(templateId, options = {}) {
    const { title = 'MDD Marketing Asset' } = options;

    return this.request('POST', '/designs', {
      design_type: 'template',
      template_id: templateId,
      title: title,
    });
  }

  /**
   * Create a blank design
   */
  async createBlankDesign(options = {}) {
    const {
      title = 'MDD Marketing Asset',
      width = 1200,
      height = 630,
    } = options;

    return this.request('POST', '/designs', {
      design_type: 'blank',
      title: title,
      width: width,
      height: height,
    });
  }

  /**
   * Get design by ID
   */
  async getDesign(designId) {
    return this.request('GET', `/designs/${designId}`);
  }

  /**
   * List designs
   */
  async listDesigns(limit = 50) {
    return this.request('GET', `/designs?limit=${limit}`);
  }

  /**
   * Export design to image
   */
  async exportDesign(designId, options = {}) {
    const {
      format = 'png', // png, jpg, pdf
      quality = 'high', // low, medium, high
      pages = [1],
    } = options;

    return this.request('POST', `/designs/${designId}/exports`, {
      format: format,
      quality: quality,
      pages: pages,
    });
  }

  /**
   * Get export status and download URL
   */
  async getExportStatus(designId, exportId) {
    return this.request('GET', `/designs/${designId}/exports/${exportId}`);
  }

  /**
   * Wait for export and get download URL
   */
  async waitForExport(designId, exportId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getExportStatus(designId, exportId);

      if (status.status === 'completed') {
        return status.urls;
      } else if (status.status === 'failed') {
        throw new Error('Export failed');
      }

      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Export timed out');
  }

  // ============================================
  // Brand Kit Methods
  // ============================================

  /**
   * Get brand kit
   */
  async getBrandKit() {
    if (!this.brandKitId) {
      throw new Error('CANVA_BRAND_KIT_ID is required for brand operations');
    }
    return this.request('GET', `/brand-kits/${this.brandKitId}`);
  }

  /**
   * List brand templates
   */
  async listBrandTemplates() {
    if (!this.brandKitId) {
      return this.request('GET', '/templates');
    }
    return this.request('GET', `/brand-kits/${this.brandKitId}/templates`);
  }

  // ============================================
  // Autofill Methods (Template Data Injection)
  // ============================================

  /**
   * Autofill a template with data
   * This is the key method for generating branded assets
   */
  async autofillTemplate(templateId, data, options = {}) {
    const { title = 'MDD Generated Asset' } = options;

    return this.request('POST', '/autofill', {
      template_id: templateId,
      data: data,
      title: title,
    });
  }

  /**
   * Get autofill job status
   */
  async getAutofillStatus(jobId) {
    return this.request('GET', `/autofill/${jobId}`);
  }

  /**
   * Wait for autofill to complete
   */
  async waitForAutofill(jobId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getAutofillStatus(jobId);

      if (status.status === 'completed') {
        return status;
      } else if (status.status === 'failed') {
        throw new Error('Autofill failed: ' + (status.error || 'Unknown error'));
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Autofill timed out');
  }

  // ============================================
  // MDD Asset Generation Helpers
  // ============================================

  /**
   * Generate a social media image with text overlay
   */
  async generateSocialImage(templateId, content, options = {}) {
    const {
      headline,
      subheadline,
      stat,
      statLabel,
      backgroundImageUrl,
      logoUrl,
    } = content;

    // Map content to template placeholders
    const data = {};

    if (headline) data.headline = headline;
    if (subheadline) data.subheadline = subheadline;
    if (stat) data.stat = stat;
    if (statLabel) data.stat_label = statLabel;
    if (backgroundImageUrl) data.background_image = backgroundImageUrl;
    if (logoUrl) data.logo = logoUrl;

    // Create autofill job
    const job = await this.autofillTemplate(templateId, data, {
      title: `MDD Social - ${headline || 'Asset'}`,
    });

    // Wait for completion
    const result = await this.waitForAutofill(job.job_id);

    // Export to PNG
    const exportJob = await this.exportDesign(result.design_id, {
      format: 'png',
      quality: 'high',
    });

    // Wait for export
    const urls = await this.waitForExport(result.design_id, exportJob.export_id);

    return {
      designId: result.design_id,
      downloadUrls: urls,
    };
  }

  /**
   * Generate OG image for blog/landing page
   */
  async generateOGImage(templateId, content) {
    return this.generateSocialImage(templateId, {
      headline: content.title,
      subheadline: content.subtitle || content.description,
      ...content,
    });
  }

  /**
   * Generate LinkedIn post image
   */
  async generateLinkedInImage(templateId, content) {
    return this.generateSocialImage(templateId, content);
  }

  /**
   * Generate Facebook ad creative
   */
  async generateFacebookAd(templateId, content) {
    return this.generateSocialImage(templateId, content);
  }
}

// ============================================
// MDD Template IDs (Configure these in Canva)
// ============================================

const MDD_TEMPLATES = {
  // Social Media
  'linkedin-post': process.env.CANVA_TEMPLATE_LINKEDIN_POST,
  'facebook-post': process.env.CANVA_TEMPLATE_FACEBOOK_POST,
  'linkedin-article-cover': process.env.CANVA_TEMPLATE_LINKEDIN_ARTICLE,

  // Blog & Website
  'og-image': process.env.CANVA_TEMPLATE_OG_IMAGE,
  'blog-hero': process.env.CANVA_TEMPLATE_BLOG_HERO,

  // Ads
  'facebook-ad-1200x628': process.env.CANVA_TEMPLATE_FB_AD_1200,
  'linkedin-ad-1200x627': process.env.CANVA_TEMPLATE_LI_AD_1200,

  // Stats & Proof Points
  'stat-card': process.env.CANVA_TEMPLATE_STAT_CARD,
  'before-after': process.env.CANVA_TEMPLATE_BEFORE_AFTER,
  'process-diagram': process.env.CANVA_TEMPLATE_PROCESS,

  // One-Pagers
  'one-pager-cover': process.env.CANVA_TEMPLATE_ONE_PAGER,
};

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new CanvaClient();

  const commands = {
    'designs': async () => {
      const designs = await client.listDesigns(10);
      console.log('Recent designs:');
      console.log(JSON.stringify(designs, null, 2));
    },
    'templates': async () => {
      const templates = await client.listBrandTemplates();
      console.log('Brand templates:');
      console.log(JSON.stringify(templates, null, 2));
    },
    'brand': async () => {
      const brand = await client.getBrandKit();
      console.log('Brand kit:');
      console.log(JSON.stringify(brand, null, 2));
    },
    'create': async () => {
      const title = args[1] || 'Test Design';
      const design = await client.createBlankDesign({
        title,
        width: 1200,
        height: 630,
      });
      console.log('Created design:', design);
    },
  };

  if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node canva-client.js <command>');
    console.log('Commands:', Object.keys(commands).join(', '));
  }
}

module.exports = { CanvaClient, MDD_TEMPLATES };
