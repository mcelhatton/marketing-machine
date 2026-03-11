/**
 * Unsplash API Client
 *
 * Search and download stock photos for campaign assets.
 * Higher quality photos, good for hero images.
 *
 * @requires UNSPLASH_ACCESS_KEY environment variable
 * API Docs: https://unsplash.com/documentation
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class UnsplashClient {
  constructor(accessKey) {
    this.accessKey = accessKey || process.env.UNSPLASH_ACCESS_KEY;
    this.baseUrl = 'api.unsplash.com';

    if (!this.accessKey) {
      throw new Error('UNSPLASH_ACCESS_KEY is required');
    }
  }

  /**
   * Make authenticated request to Unsplash API
   */
  async request(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: path,
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1',
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
              reject(new Error(`Unsplash API Error: ${res.statusCode} - ${JSON.stringify(response)}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Search for photos
   */
  async searchPhotos(query, options = {}) {
    const {
      perPage = 10,
      page = 1,
      orientation = null, // landscape, portrait, squarish
      color = null,
      orderBy = 'relevant', // relevant, latest
    } = options;

    let path = `/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&order_by=${orderBy}`;

    if (orientation) path += `&orientation=${orientation}`;
    if (color) path += `&color=${color}`;

    return this.request(path);
  }

  /**
   * Get random photo
   */
  async getRandomPhoto(options = {}) {
    const { query = null, orientation = null, count = 1 } = options;

    let path = `/photos/random?count=${count}`;
    if (query) path += `&query=${encodeURIComponent(query)}`;
    if (orientation) path += `&orientation=${orientation}`;

    return this.request(path);
  }

  /**
   * Get photo by ID
   */
  async getPhoto(id) {
    return this.request(`/photos/${id}`);
  }

  /**
   * Track download (required by Unsplash API terms)
   */
  async trackDownload(downloadLocation) {
    // Extract path from full URL
    const url = new URL(downloadLocation);
    return this.request(url.pathname + url.search);
  }

  /**
   * Download photo to file
   */
  async downloadPhoto(photo, outputPath, size = 'regular') {
    // Track the download first (required by Unsplash)
    if (photo.links && photo.links.download_location) {
      try {
        await this.trackDownload(photo.links.download_location);
      } catch (e) {
        console.warn('Could not track download:', e.message);
      }
    }

    // Get the URL for requested size
    const url = photo.urls[size] || photo.urls.regular;

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);

      https.get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          https.get(response.headers.location, (res) => {
            res.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve(outputPath);
            });
          }).on('error', reject);
        } else {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(outputPath);
          });
        }
      }).on('error', reject);
    });
  }

  // ============================================
  // MDD-Specific Search Helpers
  // ============================================

  /**
   * Search for automotive/dealership photos
   */
  async searchAutomotivePhotos(type = 'service', options = {}) {
    const queries = {
      'service': 'car repair auto service garage',
      'lot': 'car dealership parking lot',
      'showroom': 'car showroom dealership',
      'keys': 'car keys',
      'technician': 'auto mechanic',
      'customer': 'car buying customer',
      'dashboard': 'car dashboard technology',
      'mobile': 'smartphone car',
    };

    const query = queries[type] || queries['service'];
    return this.searchPhotos(query, {
      orientation: 'landscape',
      ...options,
    });
  }

  /**
   * Get best photo for a specific use case
   */
  async getBestPhoto(type, options = {}) {
    const results = await this.searchAutomotivePhotos(type, { perPage: 5, ...options });

    if (results.results && results.results.length > 0) {
      const photo = results.results[0];
      return {
        id: photo.id,
        width: photo.width,
        height: photo.height,
        url: photo.urls.regular,
        urlFull: photo.urls.full,
        urlSmall: photo.urls.small,
        urlThumb: photo.urls.thumb,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        alt: photo.alt_description || photo.description || `${type} automotive photo`,
        downloadLocation: photo.links.download_location,
        color: photo.color,
      };
    }

    return null;
  }

  /**
   * Get photo optimized for specific dimensions
   */
  async getPhotoForSize(type, width, height, options = {}) {
    const photo = await this.getBestPhoto(type, options);

    if (photo) {
      // Unsplash supports dynamic resizing via URL params
      const baseUrl = photo.url.split('?')[0];
      photo.urlSized = `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format`;
    }

    return photo;
  }
}

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new UnsplashClient();

  const commands = {
    'search': async () => {
      const query = args.slice(1).join(' ') || 'car dealership';
      const results = await client.searchPhotos(query, { perPage: 5 });
      console.log(`Found ${results.total} photos for "${query}":`);
      results.results.forEach((photo, i) => {
        console.log(`  ${i + 1}. ${photo.alt_description || 'No description'}`);
        console.log(`     URL: ${photo.urls.small}`);
        console.log(`     By: ${photo.user.name}`);
      });
    },
    'automotive': async () => {
      const type = args[1] || 'service';
      const photo = await client.getBestPhoto(type);
      if (photo) {
        console.log(`Best ${type} photo:`);
        console.log(JSON.stringify(photo, null, 2));
      } else {
        console.log('No photos found');
      }
    },
    'random': async () => {
      const query = args[1] || 'car';
      const photos = await client.getRandomPhoto({ query, count: 1 });
      const photo = Array.isArray(photos) ? photos[0] : photos;
      console.log('Random photo:');
      console.log(`  Description: ${photo.alt_description}`);
      console.log(`  URL: ${photo.urls.regular}`);
      console.log(`  By: ${photo.user.name}`);
    },
  };

  if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node unsplash-client.js <command>');
    console.log('Commands:');
    console.log('  search <query>     - Search for photos');
    console.log('  automotive <type>  - Get automotive photo (service, lot, showroom, keys, etc.)');
    console.log('  random <query>     - Get random photo');
  }
}

module.exports = UnsplashClient;
