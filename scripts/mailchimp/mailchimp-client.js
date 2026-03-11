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
    let html = markdown;

    // Remove YAML frontmatter
    html = html.replace(/^---[\s\S]*?---\n*/m, '');

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 style="color: #1A1E24; font-family: Arial, sans-serif;">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 style="color: #1A1E24; font-family: Arial, sans-serif;">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 style="color: #1A1E24; font-family: Arial, sans-serif;">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #8AC833;">$1</a>');

    // Line breaks
    html = html.replace(/\n\n+/g, '</p><p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">');

    // Wrap in email template
    const template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px;">
              <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
                ${html}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return template;
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
