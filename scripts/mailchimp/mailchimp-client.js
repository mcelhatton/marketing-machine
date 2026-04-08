/**
 * Mailchimp API Client
 *
 * Handles authentication and API calls to Mailchimp.
 * Used for creating and sending email campaigns.
 *
 * @requires MAILCHIMP_API_KEY environment variable
 * @requires MAILCHIMP_SERVER_PREFIX environment variable (e.g., "us21")
 * @requires MAILCHIMP_LIST_ID environment variable (audience ID)
 */

const https = require('https');
const { marked } = require('marked');

class MailchimpClient {
  constructor(apiKey, serverPrefix, listId) {
    this.apiKey = apiKey || process.env.MAILCHIMP_API_KEY;
    this.serverPrefix = serverPrefix || process.env.MAILCHIMP_SERVER_PREFIX;
    this.listId = listId || process.env.MAILCHIMP_LIST_ID;

    if (!this.apiKey) {
      throw new Error('MAILCHIMP_API_KEY is required');
    }

    if (!this.serverPrefix) {
      // Try to extract from API key (format: key-us21)
      const match = this.apiKey.match(/-(\w+)$/);
      if (match) {
        this.serverPrefix = match[1];
      } else {
        throw new Error('MAILCHIMP_SERVER_PREFIX is required');
      }
    }

    if (!this.listId) {
      throw new Error('MAILCHIMP_LIST_ID is required');
    }

    this.baseUrl = `${this.serverPrefix}.api.mailchimp.com`;
  }

  /**
   * Make an authenticated request to Mailchimp API
   */
  async request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const auth = Buffer.from(`anystring:${this.apiKey}`).toString('base64');

      const options = {
        hostname: this.baseUrl,
        path: `/3.0${path}`,
        method: method,
        headers: {
          'Authorization': `Basic ${auth}`,
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
              reject(new Error(`Mailchimp API Error: ${res.statusCode} - ${response.detail || JSON.stringify(response)}`));
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
  // Campaign Methods
  // ============================================

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData) {
    const {
      subject,
      previewText,
      fromName,
      replyTo,
      title,
    } = campaignData;

    return this.request('POST', '/campaigns', {
      type: 'regular',
      recipients: {
        list_id: this.listId,
      },
      settings: {
        subject_line: subject,
        preview_text: previewText || '',
        title: title || subject,
        from_name: fromName || 'Mobile Dealer Data',
        reply_to: replyTo || 'info@mdd.io',
      },
    });
  }

  /**
   * Update campaign content (HTML)
   */
  async setCampaignContent(campaignId, html, plainText = null) {
    const data = {
      html: html,
    };

    if (plainText) {
      data.plain_text = plainText;
    }

    return this.request('PUT', `/campaigns/${campaignId}/content`, data);
  }

  /**
   * Get campaign details
   */
  async getCampaign(campaignId) {
    return this.request('GET', `/campaigns/${campaignId}`);
  }

  /**
   * List campaigns
   */
  async listCampaigns(count = 10, status = null) {
    let path = `/campaigns?count=${count}`;
    if (status) {
      path += `&status=${status}`;
    }
    return this.request('GET', path);
  }

  /**
   * Send a campaign immediately
   */
  async sendCampaign(campaignId) {
    return this.request('POST', `/campaigns/${campaignId}/actions/send`);
  }

  /**
   * Schedule a campaign
   */
  async scheduleCampaign(campaignId, scheduleTime) {
    // Mailchimp requires ISO 8601 format
    const isoTime = new Date(scheduleTime).toISOString();

    return this.request('POST', `/campaigns/${campaignId}/actions/schedule`, {
      schedule_time: isoTime,
    });
  }

  /**
   * Unschedule a campaign
   */
  async unscheduleCampaign(campaignId) {
    return this.request('POST', `/campaigns/${campaignId}/actions/unschedule`);
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId) {
    return this.request('DELETE', `/campaigns/${campaignId}`);
  }

  /**
   * Test send a campaign
   */
  async sendTestEmail(campaignId, testEmails) {
    return this.request('POST', `/campaigns/${campaignId}/actions/test`, {
      test_emails: Array.isArray(testEmails) ? testEmails : [testEmails],
      send_type: 'html',
    });
  }

  // ============================================
  // Template Methods
  // ============================================

  /**
   * List templates
   */
  async listTemplates(count = 10) {
    return this.request('GET', `/templates?count=${count}`);
  }

  /**
   * Get template
   */
  async getTemplate(templateId) {
    return this.request('GET', `/templates/${templateId}`);
  }

  /**
   * Create template
   */
  async createTemplate(name, html) {
    return this.request('POST', '/templates', {
      name: name,
      html: html,
    });
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, templateData) {
    return this.request('PATCH', `/templates/${templateId}`, templateData);
  }

  // ============================================
  // List/Audience Methods
  // ============================================

  /**
   * Get list info
   */
  async getList() {
    return this.request('GET', `/lists/${this.listId}`);
  }

  /**
   * Get list member count
   */
  async getListStats() {
    const list = await this.getList();
    return {
      memberCount: list.stats.member_count,
      unsubscribeCount: list.stats.unsubscribe_count,
      openRate: list.stats.open_rate,
      clickRate: list.stats.click_rate,
    };
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Validate connection
   */
  async validateConnection() {
    try {
      const result = await this.request('GET', '/ping');
      console.log('Mailchimp connection valid:', result.health_status);
      return true;
    } catch (error) {
      console.error('Mailchimp connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get account info
   */
  async getAccountInfo() {
    return this.request('GET', '/');
  }

  /**
   * Convert markdown to simple HTML for email
   */
  static markdownToEmailHtml(markdown, options = {}) {
    const {
      editableTemplate = false,
      previewText = '',
      title = 'Mobile Dealer Data Email',
      ctaText = 'Schedule a 15-Min Demo &rarr;',
      ctaUrl = 'https://mdd.io/contact-us',
      senderName = 'Mobile Dealer Data Team',
    } = options;

    const bodyHtml = this.renderEmailBody(markdown, {
      senderName,
      darkTheme: editableTemplate,
    });

    if (editableTemplate) {
      return this.buildEditableTemplate({
        bodyHtml,
        previewText,
        title,
        ctaText,
        ctaUrl,
      });
    }

    return this.buildBasicTemplate({ bodyHtml, previewText, title });
  }

  static normalizeMergeTags(markdown, options = {}) {
    const senderName = options.senderName || 'Mobile Dealer Data Team';

    return markdown
      .replace(/^---[\s\S]*?---\n*/m, '')
      .replace(/\{\{FirstName\}\}/g, '@@MAILCHIMP_FNAME@@')
      .replace(/\{\{L(ast)?Name\}\}/g, '@@MAILCHIMP_LNAME@@')
      .replace(/\{\{Company\}\}/g, '@@MAILCHIMP_COMPANY@@')
      .replace(/\{\{Dealership\}\}/g, '@@MAILCHIMP_COMPANY@@')
      .replace(/\{\{SenderName\}\}/g, senderName);
  }

  static restoreMergeTags(html) {
    return html
      .replace(/@@MAILCHIMP_FNAME@@/g, '*|FNAME|*')
      .replace(/@@MAILCHIMP_LNAME@@/g, '*|LNAME|*')
      .replace(/@@MAILCHIMP_COMPANY@@/g, '*|COMPANY|*');
  }

  static renderEmailBody(markdown, options = {}) {
    const darkTheme = Boolean(options.darkTheme);
    const linkColor = darkTheme ? '#8AC833' : '#5E970F';
    const headingColor = darkTheme ? '#FFFFFF' : '#1A1E24';
    const textColor = darkTheme ? '#D1D5DB' : '#333333';
    const mutedColor = darkTheme ? '#9CA3AF' : '#4B5563';

    let html = marked.parse(this.normalizeMergeTags(markdown, options), {
      breaks: true,
      gfm: true,
    });

    html = html
      .replace(/<h1>/g, `<h1 style="margin: 0 0 20px; font-family: Arial, sans-serif; font-size: 28px; line-height: 1.25; color: ${headingColor}; font-weight: 700;">`)
      .replace(/<h2>/g, `<h2 style="margin: 24px 0 16px; font-family: Arial, sans-serif; font-size: 22px; line-height: 1.3; color: ${headingColor}; font-weight: 700;">`)
      .replace(/<h3>/g, `<h3 style="margin: 20px 0 12px; font-family: Arial, sans-serif; font-size: 18px; line-height: 1.35; color: ${headingColor}; font-weight: 700;">`)
      .replace(/<p>/g, `<p style="margin: 0 0 16px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.7; color: ${textColor};">`)
      .replace(/<ul>/g, `<ul style="margin: 0 0 16px; padding-left: 24px; color: ${textColor};">`)
      .replace(/<ol>/g, `<ol style="margin: 0 0 16px; padding-left: 24px; color: ${textColor};">`)
      .replace(/<li>/g, `<li style="margin: 0 0 8px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.7; color: ${textColor};">`)
      .replace(/<a /g, `<a style="color: ${linkColor}; text-decoration: underline;" `)
      .replace(/<blockquote>/g, `<blockquote style="margin: 0 0 16px; padding-left: 16px; border-left: 3px solid ${linkColor}; color: ${mutedColor};">`)
      .replace(/<hr>/g, `<hr style="border: 0; border-top: 1px solid ${darkTheme ? '#374151' : '#E5E7EB'}; margin: 24px 0;">`);

    return this.restoreMergeTags(html).trim();
  }

  static buildBasicTemplate({ bodyHtml, previewText, title }) {
    const safePreviewText = this.escapeHtml(previewText);
    const safeTitle = this.escapeHtml(title);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="display: none; max-height: 0; overflow: hidden;">${safePreviewText}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px;">
              ${bodyHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  static buildEditableTemplate({ bodyHtml, previewText, title, ctaText, ctaUrl }) {
    const safePreviewText = this.escapeHtml(previewText);
    const safeTitle = this.escapeHtml(title);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${safeTitle}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media screen and (max-width: 600px) {
      .mobile-full { width: 100% !important; }
      .mobile-padding { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #1A1E24;">
  <div mc:edit="preheader" style="display: none; max-height: 0; overflow: hidden;">${safePreviewText}</div>
  <div style="display: none; max-height: 0; overflow: hidden;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #1A1E24;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="mobile-full" style="width: 100%; max-width: 600px; background-color: #22272E; border-radius: 12px;">
          <tr>
            <td align="center" style="padding: 32px 40px 16px;" class="mobile-padding">
              <img mc:edit="header_logo" src="https://mdd.io/hubfs/MDD%20Logos/MDD_Logo_White2.png" alt="Mobile Dealer Data" width="140" style="display: block; width: 140px; max-width: 100%;">
            </td>
          </tr>
          <tr>
            <td mc:edit="body" style="padding: 8px 40px 24px;" class="mobile-padding">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 16px;" class="mobile-padding">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td mc:edit="primary_cta" style="border-radius: 8px; background-color: #8AC833;">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 16px 32px; font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; color: #1A1E24; text-decoration: none;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td mc:edit="secondary_cta" align="center" style="padding: 0 40px 40px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #9CA3AF;" class="mobile-padding">
              Or call: <a href="tel:8442927110" style="color: #8AC833; text-decoration: none;">844-292-7110</a>
            </td>
          </tr>
        </table>

        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="mobile-full" style="width: 100%; max-width: 600px;">
          <tr>
            <td align="center" style="padding: 32px 40px;" class="mobile-padding">
              <p mc:edit="footer_note" style="margin: 0 0 12px; font-family: Arial, sans-serif; font-size: 14px; color: #9CA3AF;">
                Mobile Dealer Data - We Find Keys & Cars(TM)
              </p>
              <p style="margin: 0 0 16px; font-family: Arial, sans-serif; font-size: 12px; color: #6B7280;">
                *|LIST:ADDRESS|*
              </p>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #6B7280;">
                <a href="*|UNSUB|*" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
                &nbsp;|&nbsp;
                <a href="*|UPDATE_PROFILE|*" style="color: #6B7280; text-decoration: underline;">Update Preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  static escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// ============================================
// CLI Usage
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new MailchimpClient();

  const commands = {
    'validate': async () => {
      const valid = await client.validateConnection();
      console.log(valid ? 'Connection valid' : 'Connection failed');
    },
    'account': async () => {
      const account = await client.getAccountInfo();
      console.log(JSON.stringify(account, null, 2));
    },
    'list': async () => {
      const list = await client.getList();
      console.log(JSON.stringify(list, null, 2));
    },
    'stats': async () => {
      const stats = await client.getListStats();
      console.log('List Stats:', stats);
    },
    'campaigns': async () => {
      const campaigns = await client.listCampaigns();
      console.log(JSON.stringify(campaigns, null, 2));
    },
    'templates': async () => {
      const templates = await client.listTemplates();
      console.log(JSON.stringify(templates, null, 2));
    },
  };

  if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node mailchimp-client.js <command>');
    console.log('Commands:', Object.keys(commands).join(', '));
  }
}

module.exports = MailchimpClient;
