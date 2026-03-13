/**
 * Campaign Deployment Orchestrator
 *
 * This script handles the full deployment pipeline:
 * 1. Generate/download assets (hero images, social graphics)
 * 2. Transform content for each platform (markdown → HTML, etc.)
 * 3. Upload assets to platforms
 * 4. Publish content to HubSpot, LinkedIn, Facebook
 * 5. Update manifest with live URLs
 *
 * Usage:
 *   node deploy-campaign.js <campaign-dir-or-manifest>
 *   node deploy-campaign.js campaigns/2026-03-key-tracking-saturday-chaos
 *   node deploy-campaign.js --all (deploy all draft campaigns)
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Load environment variables
require('dotenv').config();

// Import clients
const HubSpotClient = require('../hubspot/hubspot-client');
const LinkedInClient = require('../linkedin/linkedin-client');
const FacebookClient = require('../facebook/facebook-client');
const { PexelsClient } = require('../assets/pexels-client');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  hubspot: {
    templatePath: 'mdd-theme-review/templates/campaign-landing.html',
    blogId: process.env.HUBSPOT_BLOG_ID,
  },
  baseUrls: {
    website: 'https://mdd.io',
    staging: 'https://585393.hs-sites.com',
  },
  assets: {
    downloadDir: 'assets',
    sizes: {
      hero: { width: 1200, height: 630 },
      social: { width: 1200, height: 628 },
      thumbnail: { width: 400, height: 300 },
    },
  },
};

// ============================================
// ASSET GENERATION
// ============================================

class AssetGenerator {
  constructor(campaignDir) {
    this.campaignDir = campaignDir;
    this.assetsDir = path.join(campaignDir, 'assets');

    // Initialize Pexels client if API key available
    if (process.env.PEXELS_API_KEY) {
      this.pexels = new PexelsClient();
    }
  }

  async generateAll(manifest) {
    console.log('\n📸 Generating Assets...');

    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }

    const assets = {
      hero: null,
      og: null,
      social: [],
    };

    // Determine search query based on product
    const searchQuery = this.getSearchQueryForProduct(manifest.product);

    // Generate hero image
    if (this.pexels) {
      try {
        console.log('  Downloading hero image...');
        console.log(`  Search query: "${searchQuery}"`);
        const results = await this.pexels.searchPhotos(searchQuery, { perPage: 1, orientation: 'landscape' });
        const heroPhoto = results.photos && results.photos.length > 0 ? {
          url: results.photos[0].src.large2x || results.photos[0].src.large,
          photographer: results.photos[0].photographer,
          photographerUrl: results.photos[0].photographer_url,
          alt: results.photos[0].alt,
        } : null;

        if (heroPhoto) {
          const heroPath = path.join(this.assetsDir, 'hero.jpg');
          await this.pexels.downloadPhoto(heroPhoto.url, heroPath);
          assets.hero = {
            path: 'assets/hero.jpg',
            url: heroPhoto.url,
            photographer: heroPhoto.photographer,
            pexelsUrl: heroPhoto.photographerUrl,
          };
          console.log('  ✓ Hero image downloaded');

          // Use same image for OG
          const ogPath = path.join(this.assetsDir, 'og-image.jpg');
          fs.copyFileSync(heroPath, ogPath);
          assets.og = { path: 'assets/og-image.jpg' };
          console.log('  ✓ OG image created');
        }
      } catch (error) {
        console.log(`  ⚠ Could not download hero image: ${error.message}`);
      }

      // Generate social media images
      try {
        console.log('  Downloading social media images...');
        const socialPhoto = await this.pexels.getBestPhoto('customer', { orientation: 'landscape' });

        if (socialPhoto) {
          const socialPath = path.join(this.assetsDir, 'social-1.jpg');
          await this.pexels.downloadPhoto(socialPhoto.url, socialPath);
          assets.social.push({
            path: 'assets/social-1.jpg',
            url: socialPhoto.url,
            photographer: socialPhoto.photographer,
          });
          console.log('  ✓ Social image downloaded');
        }
      } catch (error) {
        console.log(`  ⚠ Could not download social image: ${error.message}`);
      }
    } else {
      console.log('  ⚠ PEXELS_API_KEY not set - skipping image downloads');
      console.log('  → Add PEXELS_API_KEY to .env for automatic image generation');
    }

    // Save asset manifest
    const assetManifest = path.join(this.assetsDir, 'assets.json');
    fs.writeFileSync(assetManifest, JSON.stringify(assets, null, 2));

    return assets;
  }

  getPhotoTypeForProduct(product) {
    const productPhotoMap = {
      'key-tracking': 'keys',
      'lot-management': 'lot',
      'service-workflow': 'service',
      'recon-workflow': 'technician',
      'vehiclevault': 'showroom',
      'full-platform': 'dealership-exterior',
    };
    return productPhotoMap[product] || 'service';
  }

  /**
   * Get optimized search query for product
   */
  getSearchQueryForProduct(product) {
    const queries = {
      'key-tracking': 'car keys fob keychain automobile',
      'lot-management': 'car dealership lot new cars rows',
      'service-workflow': 'modern auto repair shop car lift mechanic',
      'recon-workflow': 'car detailing vehicle prep',
      'vehiclevault': 'car salesman customer dealership',
      'full-platform': 'car dealership showroom interior modern',
    };
    return queries[product] || 'car dealership';
  }
}

// ============================================
// CONTENT TRANSFORMER
// ============================================

class ContentTransformer {
  constructor(manifest, campaignDir) {
    this.manifest = manifest;
    this.campaignDir = campaignDir;
    this.liveUrls = {};
  }

  /**
   * Transform markdown to HTML
   */
  markdownToHtml(markdown) {
    return marked(markdown);
  }

  /**
   * Extract body content from markdown file (removes frontmatter)
   */
  extractContent(filePath) {
    const fullPath = path.join(this.campaignDir, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove YAML frontmatter
    if (content.startsWith('---')) {
      const endIndex = content.indexOf('---', 3);
      if (endIndex !== -1) {
        content = content.slice(endIndex + 3).trim();
      }
    }

    // Remove the markdown header line (# Title)
    content = content.replace(/^#[^\n]+\n+/, '');

    return content;
  }

  /**
   * Replace [LINK] placeholders with actual URLs
   */
  replaceLinkPlaceholders(content, url) {
    return content.replace(/\[LINK\]/g, url);
  }

  /**
   * Prepare landing page for HubSpot
   */
  prepareLandingPage(contentItem) {
    const filePath = path.join(this.campaignDir, contentItem.file);
    const html = fs.readFileSync(filePath, 'utf8');

    // The landing page is already HTML, just return it
    return {
      html,
      seo: contentItem.seo,
      slug: contentItem.slug,
    };
  }

  /**
   * Prepare blog post for HubSpot
   */
  prepareBlogPost(contentItem) {
    const markdown = this.extractContent(contentItem.file);
    const html = this.markdownToHtml(markdown);

    return {
      html,
      title: contentItem.title,
      seo: contentItem.seo,
      slug: contentItem.slug,
    };
  }

  /**
   * Prepare social post for LinkedIn/Facebook
   */
  prepareSocialPost(contentItem, platform) {
    let content = this.extractContent(contentItem.file);

    // Remove markdown headers
    content = content.replace(/^#+\s+[^\n]+\n+/gm, '');

    // Get the landing page URL
    const landingPageUrl = this.liveUrls['landing-page'] ||
                          `${CONFIG.baseUrls.website}/${this.manifest.campaign_id}`;

    // Replace [LINK] placeholder
    content = this.replaceLinkPlaceholders(content, landingPageUrl);

    // Clean up for platform
    content = content.trim();

    // Platform-specific adjustments
    if (platform === 'facebook') {
      // Remove arrows (→) and replace with bullets
      content = content.replace(/→/g, '•');
    }

    return {
      text: content,
      link: landingPageUrl,
    };
  }

  /**
   * Prepare email for Mailchimp/HubSpot
   */
  prepareEmail(contentItem) {
    let content = this.extractContent(contentItem.file);

    // Remove the secondary headers (Subject:, Preview:)
    content = content.replace(/\*\*Subject:\*\*[^\n]+\n+/g, '');
    content = content.replace(/\*\*Preview:\*\*[^\n]+\n+/g, '');
    content = content.replace(/---\n+/g, '');

    // Get landing page URL for CTAs
    const landingPageUrl = this.liveUrls['landing-page'] ||
                          `${CONFIG.baseUrls.website}/${this.manifest.campaign_id}`;

    // Convert markdown to HTML
    const html = this.markdownToHtml(content);

    return {
      html,
      subject: contentItem.title,
      day: contentItem.day,
      landingPageUrl,
    };
  }

  setLiveUrl(contentType, url) {
    this.liveUrls[contentType] = url;
  }
}

// ============================================
// PLATFORM PUBLISHERS
// ============================================

class HubSpotPublisher {
  constructor() {
    if (process.env.HUBSPOT_ACCESS_TOKEN) {
      this.client = new HubSpotClient();
    }
  }

  async publishLandingPage(pageData, manifest) {
    if (!this.client) {
      console.log('  ⚠ HUBSPOT_ACCESS_TOKEN not set - skipping HubSpot publish');
      return null;
    }

    try {
      // Create page in HubSpot
      const result = await this.client.createPage({
        name: manifest.campaign_name,
        slug: pageData.slug,
        htmlTitle: pageData.seo.title_tag,
        metaDescription: pageData.seo.meta_description,
        templatePath: CONFIG.hubspot.templatePath,
        state: 'DRAFT',
      });

      console.log(`  ✓ Landing page created (ID: ${result.id})`);

      return {
        id: result.id,
        url: `${CONFIG.baseUrls.staging}/${pageData.slug}`,
        status: 'draft',
      };
    } catch (error) {
      console.log(`  ✗ HubSpot error: ${error.message}`);
      return null;
    }
  }

  async publishBlogPost(postData, manifest) {
    if (!this.client) return null;

    try {
      const result = await this.client.createBlogPost({
        name: postData.title,
        slug: postData.slug,
        htmlTitle: postData.seo.title_tag,
        metaDescription: postData.seo.meta_description,
        postBody: postData.html,
        contentGroupId: CONFIG.hubspot.blogId,
        state: 'DRAFT',
      });

      console.log(`  ✓ Blog post created (ID: ${result.id})`);

      return {
        id: result.id,
        url: `${CONFIG.baseUrls.website}/blog/${postData.slug}`,
        status: 'draft',
      };
    } catch (error) {
      console.log(`  ✗ Blog post error: ${error.message}`);
      return null;
    }
  }
}

class LinkedInPublisher {
  constructor() {
    if (process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_ORGANIZATION_ID) {
      this.client = new LinkedInClient();
    }
  }

  async publishPost(postData) {
    if (!this.client) {
      console.log('  ⚠ LinkedIn credentials not set - skipping LinkedIn publish');
      return null;
    }

    try {
      const result = await this.client.createPostWithLink(
        postData.text,
        postData.link
      );

      console.log(`  ✓ LinkedIn post published`);

      return {
        id: result.id || 'published',
        status: 'published',
      };
    } catch (error) {
      console.log(`  ✗ LinkedIn error: ${error.message}`);
      return null;
    }
  }
}

class FacebookPublisher {
  constructor() {
    if (process.env.FACEBOOK_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID) {
      this.client = new FacebookClient();
    }
  }

  async publishPost(postData) {
    if (!this.client) {
      console.log('  ⚠ Facebook credentials not set - skipping Facebook publish');
      return null;
    }

    try {
      const result = await this.client.createPostWithLink(
        postData.text,
        postData.link
      );

      console.log(`  ✓ Facebook post published`);

      return {
        id: result.id,
        status: 'published',
      };
    } catch (error) {
      console.log(`  ✗ Facebook error: ${error.message}`);
      return null;
    }
  }
}

// ============================================
// MAIN DEPLOYMENT ORCHESTRATOR
// ============================================

class CampaignDeployer {
  constructor(campaignDir) {
    this.campaignDir = campaignDir;
    this.manifestPath = path.join(campaignDir, 'manifest.json');
    this.manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));

    this.assetGenerator = new AssetGenerator(campaignDir);
    this.transformer = new ContentTransformer(this.manifest, campaignDir);

    this.hubspot = new HubSpotPublisher();
    this.linkedin = new LinkedInPublisher();
    this.facebook = new FacebookPublisher();

    this.results = {
      assets: null,
      hubspot: {},
      linkedin: {},
      facebook: {},
      errors: [],
    };
  }

  async deploy(options = {}) {
    console.log('\n' + '='.repeat(60));
    console.log('MDD MARKETING MACHINE - Campaign Deployment');
    console.log('='.repeat(60));
    console.log(`\nCampaign: ${this.manifest.campaign_name}`);
    console.log(`ID: ${this.manifest.campaign_id}`);

    const {
      skipAssets = false,
      skipHubspot = false,
      skipSocial = false,
      draftOnly = true,  // Default to draft mode for safety
    } = options;

    try {
      // Step 1: Generate/download assets
      if (!skipAssets) {
        this.results.assets = await this.assetGenerator.generateAll(this.manifest);
      }

      // Step 2: Deploy to HubSpot (landing page + blog)
      if (!skipHubspot) {
        await this.deployToHubSpot(draftOnly);
      }

      // Step 3: Deploy to social media
      if (!skipSocial && !draftOnly) {
        await this.deployToSocial();
      } else if (draftOnly) {
        console.log('\n📱 Social Media (Skipped - Draft Mode)');
        console.log('  Use --publish flag to post to social media');
      }

      // Step 4: Update manifest with results
      this.updateManifest();

      // Step 5: Generate deployment summary
      this.printSummary();

      return this.results;
    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      this.results.errors.push(error.message);
      throw error;
    }
  }

  async deployToHubSpot(draftOnly) {
    console.log('\n🌐 Deploying to HubSpot...');

    for (const content of this.manifest.content) {
      if (content.type === 'landing-page') {
        const pageData = this.transformer.prepareLandingPage(content);
        const result = await this.hubspot.publishLandingPage(pageData, this.manifest);

        if (result) {
          this.results.hubspot.landingPage = result;
          this.transformer.setLiveUrl('landing-page', result.url);
        }
      } else if (content.type === 'blog-post') {
        const postData = this.transformer.prepareBlogPost(content);
        const result = await this.hubspot.publishBlogPost(postData, this.manifest);

        if (result) {
          this.results.hubspot.blogPost = result;
        }
      }
    }
  }

  async deployToSocial() {
    console.log('\n📱 Deploying to Social Media...');

    let linkedInCount = 0;
    let facebookCount = 0;

    for (const content of this.manifest.content) {
      if (content.type === 'linkedin-post') {
        linkedInCount++;
        if (linkedInCount === 1) { // Only post first one automatically
          const postData = this.transformer.prepareSocialPost(content, 'linkedin');
          const result = await this.linkedin.publishPost(postData);

          if (result) {
            this.results.linkedin[content.file] = result;
          }
        }
      } else if (content.type === 'facebook-post') {
        facebookCount++;
        if (facebookCount === 1) { // Only post first one automatically
          const postData = this.transformer.prepareSocialPost(content, 'facebook');
          const result = await this.facebook.publishPost(postData);

          if (result) {
            this.results.facebook[content.file] = result;
          }
        }
      }
    }

    if (linkedInCount > 1) {
      console.log(`  ℹ ${linkedInCount - 1} additional LinkedIn posts ready for scheduling`);
    }
    if (facebookCount > 1) {
      console.log(`  ℹ ${facebookCount - 1} additional Facebook posts ready for scheduling`);
    }
  }

  updateManifest() {
    this.manifest.deployment = {
      deployed_at: new Date().toISOString(),
      results: this.results,
    };

    this.manifest.publishing = {
      hubspot: {
        status: this.results.hubspot.landingPage ? 'deployed' : 'pending',
        ...this.results.hubspot,
      },
      linkedin: {
        status: Object.keys(this.results.linkedin).length > 0 ? 'deployed' : 'pending',
        posts: this.results.linkedin,
      },
      facebook: {
        status: Object.keys(this.results.facebook).length > 0 ? 'deployed' : 'pending',
        posts: this.results.facebook,
      },
    };

    fs.writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2));
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('DEPLOYMENT SUMMARY');
    console.log('='.repeat(60));

    // Assets
    if (this.results.assets) {
      console.log('\n📸 Assets:');
      if (this.results.assets.hero) {
        console.log(`  ✓ Hero image: ${this.results.assets.hero.path}`);
      }
      if (this.results.assets.og) {
        console.log(`  ✓ OG image: ${this.results.assets.og.path}`);
      }
      console.log(`  ✓ Social images: ${this.results.assets.social.length}`);
    }

    // HubSpot
    console.log('\n🌐 HubSpot:');
    if (this.results.hubspot.landingPage) {
      console.log(`  ✓ Landing Page: ${this.results.hubspot.landingPage.url}`);
    }
    if (this.results.hubspot.blogPost) {
      console.log(`  ✓ Blog Post: ${this.results.hubspot.blogPost.url}`);
    }
    if (!this.results.hubspot.landingPage && !this.results.hubspot.blogPost) {
      console.log('  ⚠ Not deployed (credentials not set)');
    }

    // Social
    console.log('\n📱 Social Media:');
    const linkedInPosts = Object.keys(this.results.linkedin).length;
    const facebookPosts = Object.keys(this.results.facebook).length;

    if (linkedInPosts > 0) {
      console.log(`  ✓ LinkedIn: ${linkedInPosts} post(s) published`);
    } else {
      console.log('  ⚠ LinkedIn: Not published');
    }

    if (facebookPosts > 0) {
      console.log(`  ✓ Facebook: ${facebookPosts} post(s) published`);
    } else {
      console.log('  ⚠ Facebook: Not published');
    }

    // Errors
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      for (const error of this.results.errors) {
        console.log(`  - ${error}`);
      }
    }

    // Next steps
    console.log('\n📋 Next Steps:');
    console.log('  1. Review deployed content on staging URLs');
    console.log('  2. Publish landing page from HubSpot dashboard');
    console.log('  3. Schedule remaining social posts');
    console.log('  4. Set up email sequence in Mailchimp/HubSpot');

    console.log(`\n✅ Manifest updated: ${this.manifestPath}`);
  }
}

// ============================================
// CLI
// ============================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log('MDD Marketing Machine - Campaign Deployment');
    console.log('');
    console.log('Usage:');
    console.log('  node deploy-campaign.js <campaign-directory>');
    console.log('  node deploy-campaign.js campaigns/2026-03-key-tracking-saturday-chaos');
    console.log('');
    console.log('Options:');
    console.log('  --skip-assets    Skip asset generation');
    console.log('  --skip-hubspot   Skip HubSpot deployment');
    console.log('  --skip-social    Skip social media deployment');
    console.log('  --publish        Publish immediately (default is draft mode)');
    console.log('  --help           Show this help message');
    console.log('');
    console.log('Environment Variables Required:');
    console.log('  HUBSPOT_ACCESS_TOKEN    For landing page and blog deployment');
    console.log('  HUBSPOT_BLOG_ID         For blog post deployment');
    console.log('  LINKEDIN_ACCESS_TOKEN   For LinkedIn posting');
    console.log('  LINKEDIN_ORGANIZATION_ID  For LinkedIn company page');
    console.log('  FACEBOOK_ACCESS_TOKEN   For Facebook posting');
    console.log('  FACEBOOK_PAGE_ID        For Facebook page');
    console.log('  PEXELS_API_KEY          For stock photo downloads');
    return;
  }

  // Parse arguments
  let campaignDir = args.find(arg => !arg.startsWith('--'));
  const options = {
    skipAssets: args.includes('--skip-assets'),
    skipHubspot: args.includes('--skip-hubspot'),
    skipSocial: args.includes('--skip-social'),
    draftOnly: !args.includes('--publish'),
  };

  // Normalize campaign directory path
  if (!campaignDir.startsWith('/')) {
    campaignDir = path.join(process.cwd(), campaignDir);
  }

  // Check if it's a manifest file or directory
  if (campaignDir.endsWith('.json')) {
    campaignDir = path.dirname(campaignDir);
  }

  // Verify campaign exists
  const manifestPath = path.join(campaignDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: Campaign manifest not found at ${manifestPath}`);
    process.exit(1);
  }

  // Deploy
  const deployer = new CampaignDeployer(campaignDir);

  try {
    await deployer.deploy(options);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { CampaignDeployer, AssetGenerator, ContentTransformer };
