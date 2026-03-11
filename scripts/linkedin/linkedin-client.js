/**
 * LinkedIn API Client
 *
 * Handles authentication and API calls to LinkedIn.
 * Used for publishing posts and articles to company page.
 *
 * @requires LINKEDIN_ACCESS_TOKEN environment variable
 * @requires LINKEDIN_ORGANIZATION_ID environment variable (company page ID)
 */

const https = require('https');

class LinkedInClient {
  constructor(accessToken, organizationId) {
    this.accessToken = accessToken || process.env.LINKEDIN_ACCESS_TOKEN;
    this.organizationId = organizationId || process.env.LINKEDIN_ORGANIZATION_ID;
    this.apiVersion = '202401';
    this.baseUrl = 'api.linkedin.com';

    if (!this.accessToken) {
      throw new Error('LINKEDIN_ACCESS_TOKEN is required');
    }

    if (!this.organizationId) {
      throw new Error('LINKEDIN_ORGANIZATION_ID is required');
    }
  }

  /**
   * Make an authenticated request to LinkedIn API
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
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': this.apiVersion,
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
              reject(new Error(`LinkedIn API Error: ${res.statusCode} - ${JSON.stringify(response)}`));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ statusCode: res.statusCode });
            } else {
              reject(new Error(`Failed to parse response: ${body}`));
            }
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
  // Post Methods
  // ============================================

  /**
   * Create a text post on company page
   */
  async createPost(text, options = {}) {
    const { visibility = 'PUBLIC' } = options;

    const postData = {
      author: `urn:li:organization:${this.organizationId}`,
      commentary: text,
      visibility: visibility,
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    };

    return this.request('POST', '/rest/posts', postData);
  }

  /**
   * Create a post with a link preview
   */
  async createPostWithLink(text, linkUrl, options = {}) {
    const { visibility = 'PUBLIC' } = options;

    const postData = {
      author: `urn:li:organization:${this.organizationId}`,
      commentary: text,
      visibility: visibility,
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        article: {
          source: linkUrl,
          title: options.linkTitle || '',
          description: options.linkDescription || '',
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    };

    return this.request('POST', '/rest/posts', postData);
  }

  /**
   * Create a post with an image
   * Note: Requires image to be uploaded first via initializeUpload
   */
  async createPostWithImage(text, imageUrn, options = {}) {
    const { visibility = 'PUBLIC' } = options;

    const postData = {
      author: `urn:li:organization:${this.organizationId}`,
      commentary: text,
      visibility: visibility,
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        media: {
          id: imageUrn,
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    };

    return this.request('POST', '/rest/posts', postData);
  }

  /**
   * Delete a post
   */
  async deletePost(postUrn) {
    const encodedUrn = encodeURIComponent(postUrn);
    return this.request('DELETE', `/rest/posts/${encodedUrn}`);
  }

  // ============================================
  // Article Methods
  // ============================================

  /**
   * Create an article (long-form content)
   * Note: LinkedIn Articles API is limited - may need to use Share API instead
   */
  async createArticle(articleData) {
    const {
      title,
      content, // HTML content
      visibility = 'PUBLIC',
    } = articleData;

    // LinkedIn articles are typically shared as links to external content
    // or created directly on LinkedIn (no API for native articles)
    // This creates a share with article-like content

    console.log('Note: LinkedIn does not have a native article creation API.');
    console.log('Articles must be created manually on LinkedIn or shared as links.');

    // Alternative: Create a post with a link to the article on your website
    return this.createPostWithLink(
      `New article: ${title}\n\n${content.substring(0, 200)}...`,
      articleData.url || 'https://mdd.io/blog/',
      { visibility }
    );
  }

  // ============================================
  // Image Upload Methods
  // ============================================

  /**
   * Initialize image upload
   */
  async initializeImageUpload() {
    const data = {
      initializeUploadRequest: {
        owner: `urn:li:organization:${this.organizationId}`,
      },
    };

    return this.request('POST', '/rest/images?action=initializeUpload', data);
  }

  // ============================================
  // Organization Methods
  // ============================================

  /**
   * Get organization info
   */
  async getOrganization() {
    return this.request('GET', `/rest/organizations/${this.organizationId}`);
  }

  /**
   * Get organization posts (shares)
   */
  async getOrganizationPosts(count = 10) {
    const author = encodeURIComponent(`urn:li:organization:${this.organizationId}`);
    return this.request('GET', `/rest/posts?author=${author}&count=${count}`);
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Validate connection
   */
  async validateConnection() {
    try {
      await this.getOrganization();
      return true;
    } catch (error) {
      console.error('LinkedIn connection failed:', error.message);
      return false;
    }
  }

  /**
   * Format post text with proper line breaks and hashtags
   */
  formatPostText(text, hashtags = []) {
    let formatted = text.trim();

    // Add hashtags if provided
    if (hashtags.length > 0) {
      const hashtagString = hashtags
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      formatted += `\n\n${hashtagString}`;
    }

    // Validate length
    if (formatted.length > 3000) {
      console.warn('Post exceeds 3000 character limit. Truncating...');
      formatted = formatted.substring(0, 2997) + '...';
    }

    return formatted;
  }
}

// ============================================
// CLI Usage
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new LinkedInClient();

  const commands = {
    'validate': async () => {
      const valid = await client.validateConnection();
      console.log(valid ? 'Connection valid' : 'Connection failed');
    },
    'org': async () => {
      const org = await client.getOrganization();
      console.log(JSON.stringify(org, null, 2));
    },
    'posts': async () => {
      const posts = await client.getOrganizationPosts();
      console.log(JSON.stringify(posts, null, 2));
    },
    'post': async () => {
      const text = args.slice(1).join(' ');
      if (!text) throw new Error('Post text required');
      const result = await client.createPost(text);
      console.log('Posted:', result);
    },
    'post-link': async () => {
      const text = args[1];
      const url = args[2];
      if (!text || !url) throw new Error('Text and URL required');
      const result = await client.createPostWithLink(text, url);
      console.log('Posted:', result);
    },
  };

  if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node linkedin-client.js <command>');
    console.log('Commands:', Object.keys(commands).join(', '));
  }
}

module.exports = LinkedInClient;
