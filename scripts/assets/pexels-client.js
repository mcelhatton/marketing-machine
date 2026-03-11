/**
 * Pexels API Client
 *
 * Search and download stock photos for campaign assets.
 * Used for real dealership/automotive backgrounds.
 *
 * @requires PEXELS_API_KEY environment variable
 * API Docs: https://www.pexels.com/api/documentation/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class PexelsClient {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.PEXELS_API_KEY;
    this.baseUrl = 'api.pexels.com';

    if (!this.apiKey) {
      throw new Error('PEXELS_API_KEY is required');
    }
  }

  /**
   * Make authenticated request to Pexels API
   */
  async request(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: path,
        method: 'GET',
        headers: {
          'Authorization': this.apiKey,
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
              reject(new Error(`Pexels API Error: ${res.statusCode} - ${body}`));
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
      perPage = 15,
      page = 1,
      orientation = null, // landscape, portrait, square
      size = null, // large, medium, small
      color = null,
    } = options;

    let path = `/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;

    if (orientation) path += `&orientation=${orientation}`;
    if (size) path += `&size=${size}`;
    if (color) path += `&color=${color}`;

    return this.request(path);
  }

  /**
   * Get curated photos
   */
  async getCurated(perPage = 15, page = 1) {
    return this.request(`/v1/curated?per_page=${perPage}&page=${page}`);
  }

  /**
   * Get photo by ID
   */
  async getPhoto(id) {
    return this.request(`/v1/photos/${id}`);
  }

  /**
   * Search for videos
   */
  async searchVideos(query, options = {}) {
    const {
      perPage = 15,
      page = 1,
      orientation = null,
      size = null,
    } = options;

    let path = `/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;

    if (orientation) path += `&orientation=${orientation}`;
    if (size) path += `&size=${size}`;

    return this.request(path);
  }

  /**
   * Download photo to file
   */
  async downloadPhoto(photoUrl, outputPath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);

      https.get(photoUrl, (response) => {
        // Handle redirects
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
   * Search for dealership/automotive photos
   */
  async searchDealershipPhotos(type = 'service', options = {}) {
    const queries = {
      'service': 'car service department automotive mechanic',
      'lot': 'car dealership lot vehicles parking',
      'showroom': 'car dealership showroom interior',
      'keys': 'car keys automotive',
      'technician': 'auto mechanic technician working',
      'customer': 'car dealership customer sales',
      'exterior': 'car dealership building exterior',
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
    const results = await this.searchDealershipPhotos(type, { perPage: 5, ...options });

    if (results.photos && results.photos.length > 0) {
      // Return the first (most relevant) photo
      const photo = results.photos[0];
      return {
        id: photo.id,
        width: photo.width,
        height: photo.height,
        url: photo.src.large2x || photo.src.large,
        urlMedium: photo.src.medium,
        urlSmall: photo.src.small,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        alt: photo.alt || `${type} dealership photo`,
      };
    }

    return null;
  }
}

// ============================================
// Predefined Search Queries for MDD
// ============================================

const MDD_PHOTO_QUERIES = {
  // Service Department
  'service-bay': 'automotive service bay cars mechanic',
  'service-lane': 'car service drive through lane',
  'service-advisor': 'car service advisor customer',
  'technician-working': 'auto technician mechanic working car',

  // Dealership
  'dealership-lot': 'car dealership parking lot vehicles',
  'dealership-showroom': 'car dealership showroom modern',
  'dealership-exterior': 'car dealership building exterior',

  // Keys & Tracking
  'car-keys': 'car keys automotive fob',
  'key-handoff': 'car key handover dealership',

  // Vehicles
  'vehicles-parked': 'cars parked lot automotive',
  'vehicle-detail': 'car detailing wash',

  // People
  'sales-team': 'car sales team dealership',
  'happy-customer': 'happy customer car purchase',
  'manager': 'automotive manager professional',

  // Technology
  'tablet-automotive': 'tablet technology automotive',
  'mobile-app': 'smartphone app technology',
};

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new PexelsClient();

  const commands = {
    'search': async () => {
      const query = args.slice(1).join(' ') || 'car dealership';
      const results = await client.searchPhotos(query, { perPage: 5 });
      console.log(`Found ${results.total_results} photos for "${query}":`);
      results.photos.forEach((photo, i) => {
        console.log(`  ${i + 1}. ${photo.alt || 'No description'}`);
        console.log(`     URL: ${photo.src.medium}`);
        console.log(`     By: ${photo.photographer}`);
      });
    },
    'dealership': async () => {
      const type = args[1] || 'service';
      const photo = await client.getBestPhoto(type);
      if (photo) {
        console.log(`Best ${type} photo:`);
        console.log(JSON.stringify(photo, null, 2));
      } else {
        console.log('No photos found');
      }
    },
    'download': async () => {
      const query = args[1] || 'car dealership';
      const outputDir = args[2] || './';
      const results = await client.searchPhotos(query, { perPage: 1 });
      if (results.photos.length > 0) {
        const photo = results.photos[0];
        const outputPath = path.join(outputDir, `pexels-${photo.id}.jpg`);
        await client.downloadPhoto(photo.src.large, outputPath);
        console.log(`Downloaded to: ${outputPath}`);
      }
    },
  };

  if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node pexels-client.js <command>');
    console.log('Commands:');
    console.log('  search <query>     - Search for photos');
    console.log('  dealership <type>  - Get dealership photo (service, lot, showroom, keys, technician)');
    console.log('  download <query>   - Download first matching photo');
  }
}

module.exports = { PexelsClient, MDD_PHOTO_QUERIES };
