/**
 * Facebook Graph API Client
 *
 * Handles authentication and API calls to Facebook.
 * Used for publishing posts to company page.
 *
 * @requires FACEBOOK_ACCESS_TOKEN environment variable (Page Access Token)
 * @requires FACEBOOK_PAGE_ID environment variable
 */

const https = require('https');

class FacebookClient {
  constructor(accessToken, pageId) {
    this.accessToken = accessToken || process.env.FACEBOOK_ACCESS_TOKEN;
    this.pageId = pageId || process.env.FACEBOOK_PAGE_ID;
    this.apiVersion = 'v18.0';
    this.baseUrl = 'graph.facebook.com';

    if (!this.accessToken) {
      throw new Error('FACEBOOK_ACCESS_TOKEN is required');
    }

    if (!this.pageId) {
      throw new Error('FACEBOOK_PAGE_ID is required');
    }
  }

  /**
   * Make an authenticated request to Facebook Graph API
   */
  async request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      // Add access token to path
      const separator = path.includes('?') ? '&' : '?';
      const fullPath = `/${this.apiVersion}${path}${separator}access_token=${this.accessToken}`;

      const options = {
        hostname: this.baseUrl,
        path: fullPath,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (response.error) {
              reject(new Error(`Facebook API Error: ${response.error.message}`));
            } else {
              resolve(response);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        });
      });

      req.on('error', reject);

      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  // ============================================
  // Post Methods
  // ============================================

  /**
   * Create a text post on page
   */
  async createPost(message) {
    return this.request('POST', `/${this.pageId}/feed`, {
      message: message,
    });
  }

  /**
   * Create a post with a link
   */
  async createPostWithLink(message, linkUrl) {
    return this.request('POST', `/${this.pageId}/feed`, {
      message: message,
      link: linkUrl,
    });
  }

  /**
   * Create a post with a photo
   */
  async createPostWithPhoto(message, photoUrl) {
    return this.request('POST', `/${this.pageId}/photos`, {
      message: message,
      url: photoUrl,
    });
  }

  /**
   * Get page posts
   */
  async getPosts(limit = 10) {
    return this.request('GET', `/${this.pageId}/posts?limit=${limit}`);
  }

  /**
   * Get a specific post
   */
  async getPost(postId) {
    return this.request('GET', `/${postId}`);
  }

  /**
   * Delete a post
   */
  async deletePost(postId) {
    return this.request('DELETE', `/${postId}`);
  }

  /**
   * Get post insights
   */
  async getPostInsights(postId) {
    return this.request('GET', `/${postId}/insights?metric=post_impressions,post_engagements,post_clicks`);
  }

  // ============================================
  // Page Methods
  // ============================================

  /**
   * Get page information
   */
  async getPageInfo() {
    return this.request('GET', `/${this.pageId}?fields=id,name,about,fan_count`);
  }

  /**
   * Get page insights
   */
  async getPageInsights() {
    return this.request('GET', `/${this.pageId}/insights?metric=page_impressions,page_engaged_users&period=day`);
  }

  // ============================================
  // Scheduled Posts
  // ============================================

  /**
   * Schedule a post for future publication
   */
  async schedulePost(message, scheduledTime, linkUrl = null) {
    const timestamp = Math.floor(new Date(scheduledTime).getTime() / 1000);

    const data = {
      message: message,
      published: false,
      scheduled_publish_time: timestamp,
    };

    if (linkUrl) {
      data.link = linkUrl;
    }

    return this.request('POST', `/${this.pageId}/feed`, data);
  }

  /**
   * Get scheduled posts
   */
  async getScheduledPosts() {
    return this.request('GET', `/${this.pageId}/scheduled_posts`);
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Validate connection
   */
  async validateConnection() {
    try {
      const page = await this.getPageInfo();
      console.log(`Connected to page: ${page.name} (ID: ${page.id})`);
      return true;
    } catch (error) {
      console.error('Facebook connection failed:', error.message);
      return false;
    }
  }

  /**
   * Format post message
   */
  formatMessage(text, options = {}) {
    let message = text.trim();

    // Add hashtags if provided
    if (options.hashtags && options.hashtags.length > 0) {
      const hashtagString = options.hashtags
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      message += `\n\n${hashtagString}`;
    }

    // Validate length (Facebook limit is 63,206 but optimal is under 250)
    if (message.length > 250 && !options.allowLong) {
      console.warn('Post exceeds optimal 250 character length');
    }

    return message;
  }
}

// ============================================
// CLI Usage
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new FacebookClient();

  const commands = {
    'validate': async () => {
      const valid = await client.validateConnection();
      console.log(valid ? 'Connection valid' : 'Connection failed');
    },
    'page': async () => {
      const page = await client.getPageInfo();
      console.log(JSON.stringify(page, null, 2));
    },
    'posts': async () => {
      const posts = await client.getPosts();
      console.log(JSON.stringify(posts, null, 2));
    },
    'post': async () => {
      const message = args.slice(1).join(' ');
      if (!message) throw new Error('Message required');
      const result = await client.createPost(message);
      console.log('Posted:', result);
    },
    'post-link': async () => {
      const message = args[1];
      const url = args[2];
      if (!message || !url) throw new Error('Message and URL required');
      const result = await client.createPostWithLink(message, url);
      console.log('Posted:', result);
    },
    'scheduled': async () => {
      const posts = await client.getScheduledPosts();
      console.log(JSON.stringify(posts, null, 2));
    },
  };

  if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node facebook-client.js <command>');
    console.log('Commands:', Object.keys(commands).join(', '));
  }
}

module.exports = FacebookClient;
