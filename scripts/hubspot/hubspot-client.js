/**
 * HubSpot API Client
 *
 * Handles authentication and API calls to HubSpot CMS.
 * Used for publishing landing pages and blog posts.
 *
 * @requires HUBSPOT_ACCESS_TOKEN environment variable
 */

const https = require('https');

class HubSpotClient {
  constructor(accessToken) {
    this.accessToken = accessToken || process.env.HUBSPOT_ACCESS_TOKEN;
    this.baseUrl = 'api.hubapi.com';
    this.portalId = process.env.HUBSPOT_PORTAL_ID || '585393';

    if (!this.accessToken) {
      throw new Error('HUBSPOT_ACCESS_TOKEN is required');
    }
  }

  /**
   * Make an authenticated request to HubSpot API
   */
  async request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: path,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(new Error(`HubSpot API Error: ${res.statusCode} - ${JSON.stringify(response)}`));
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
  // Page Methods
  // ============================================

  /**
   * Create a new CMS page
   */
  async createPage(pageData) {
    const {
      name,
      slug,
      htmlTitle,
      metaDescription,
      templatePath,
      state = 'DRAFT',
    } = pageData;

    return this.request('POST', '/content/api/v2/pages', {
      name,
      slug,
      html_title: htmlTitle,
      meta_description: metaDescription,
      template_path: templatePath,
      state,
    });
  }

  /**
   * Update an existing page
   */
  async updatePage(pageId, pageData) {
    return this.request('PUT', `/content/api/v2/pages/${pageId}`, pageData);
  }

  /**
   * Get page by ID
   */
  async getPage(pageId) {
    return this.request('GET', `/content/api/v2/pages/${pageId}`);
  }

  /**
   * List all pages
   */
  async listPages(limit = 50, offset = 0) {
    return this.request('GET', `/content/api/v2/pages?limit=${limit}&offset=${offset}`);
  }

  /**
   * Publish a page
   */
  async publishPage(pageId) {
    return this.request('POST', `/content/api/v2/pages/${pageId}/publish-action`, {
      action: 'schedule-publish',
    });
  }

  /**
   * Delete a page
   */
  async deletePage(pageId) {
    return this.request('DELETE', `/content/api/v2/pages/${pageId}`);
  }

  // ============================================
  // Blog Methods
  // ============================================

  /**
   * Create a blog post
   */
  async createBlogPost(postData) {
    const {
      name,
      slug,
      htmlTitle,
      metaDescription,
      postBody,
      blogAuthor,
      contentGroupId, // Blog ID
      state = 'DRAFT',
    } = postData;

    return this.request('POST', '/content/api/v2/blog-posts', {
      name,
      slug,
      html_title: htmlTitle,
      meta_description: metaDescription,
      post_body: postBody,
      blog_author: blogAuthor,
      content_group_id: contentGroupId,
      state,
    });
  }

  /**
   * Update a blog post
   */
  async updateBlogPost(postId, postData) {
    return this.request('PUT', `/content/api/v2/blog-posts/${postId}`, postData);
  }

  /**
   * Get blog post by ID
   */
  async getBlogPost(postId) {
    return this.request('GET', `/content/api/v2/blog-posts/${postId}`);
  }

  /**
   * List blog posts
   */
  async listBlogPosts(limit = 50, offset = 0) {
    return this.request('GET', `/content/api/v2/blog-posts?limit=${limit}&offset=${offset}`);
  }

  /**
   * Publish a blog post
   */
  async publishBlogPost(postId) {
    return this.request('POST', `/content/api/v2/blog-posts/${postId}/publish-action`, {
      action: 'schedule-publish',
    });
  }

  // ============================================
  // File/Asset Methods
  // ============================================

  /**
   * Upload a file to HubSpot File Manager
   */
  async uploadFile(filePath, fileName, folderId = null) {
    // File uploads require multipart/form-data
    // This is a placeholder - actual implementation would use form-data library
    console.log(`File upload: ${filePath} -> ${fileName}`);
    throw new Error('File upload requires form-data library. Use hs upload CLI instead.');
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Validate connection
   */
  async validateConnection() {
    try {
      await this.request('GET', '/integrations/v1/me');
      return true;
    } catch (error) {
      console.error('HubSpot connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get portal information
   */
  async getPortalInfo() {
    return this.request('GET', '/integrations/v1/me');
  }
}

// ============================================
// CLI Usage
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new HubSpotClient();

  const commands = {
    'validate': async () => {
      const valid = await client.validateConnection();
      console.log(valid ? 'Connection valid' : 'Connection failed');
    },
    'list-pages': async () => {
      const pages = await client.listPages();
      console.log(JSON.stringify(pages, null, 2));
    },
    'list-posts': async () => {
      const posts = await client.listBlogPosts();
      console.log(JSON.stringify(posts, null, 2));
    },
    'get-page': async () => {
      const pageId = args[1];
      if (!pageId) throw new Error('Page ID required');
      const page = await client.getPage(pageId);
      console.log(JSON.stringify(page, null, 2));
    },
    'publish-page': async () => {
      const pageId = args[1];
      if (!pageId) throw new Error('Page ID required');
      const result = await client.publishPage(pageId);
      console.log('Published:', result);
    },
  };

  if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node hubspot-client.js <command>');
    console.log('Commands:', Object.keys(commands).join(', '));
  }
}

module.exports = HubSpotClient;
