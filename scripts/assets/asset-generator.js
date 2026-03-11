/**
 * MDD Asset Generator
 *
 * Main orchestrator for generating marketing assets.
 * Combines stock photos + brand templates + AI augmentation.
 *
 * Pipeline:
 * 1. Get background image (Pexels/Unsplash)
 * 2. Select/populate template (Canva)
 * 3. Apply brand overlay (text, stats, UI elements)
 * 4. Export final assets
 * 5. Generate video clips if requested (Runway/Lumen5)
 */

const fs = require('fs');
const path = require('path');
const { PexelsClient, MDD_PHOTO_QUERIES } = require('./pexels-client');
const UnsplashClient = require('./unsplash-client');
const { CanvaClient, MDD_TEMPLATES } = require('./canva-client');
const { RunwayClient, MDD_VIDEO_PROMPTS, MDD_BEFORE_AFTER } = require('./runway-client');
const { Lumen5Client, MDD_VIDEO_TEMPLATES } = require('./lumen5-client');

// ============================================
// Asset Types & Dimensions
// ============================================

const ASSET_SPECS = {
  // Social Media Images
  'og-image': { width: 1200, height: 630, description: 'Open Graph / Link Preview' },
  'linkedin-post': { width: 1200, height: 627, description: 'LinkedIn Feed Post' },
  'linkedin-article': { width: 1920, height: 1080, description: 'LinkedIn Article Cover' },
  'facebook-post': { width: 1200, height: 630, description: 'Facebook Feed Post' },
  'facebook-ad': { width: 1200, height: 628, description: 'Facebook Ad Creative' },

  // Website
  'blog-hero': { width: 1200, height: 628, description: 'Blog Post Hero Image' },
  'landing-hero': { width: 1920, height: 1080, description: 'Landing Page Hero' },

  // Content
  'stat-card': { width: 1080, height: 1080, description: 'Statistics Card (Square)' },
  'quote-card': { width: 1080, height: 1080, description: 'Testimonial Quote Card' },
  'before-after': { width: 1200, height: 600, description: 'Before/After Comparison' },
  'process-diagram': { width: 1200, height: 800, description: 'Process Flow Diagram' },

  // Video
  'video-landscape': { width: 1920, height: 1080, description: '16:9 Video' },
  'video-square': { width: 1080, height: 1080, description: '1:1 Square Video' },
  'video-portrait': { width: 1080, height: 1920, description: '9:16 Portrait Video' },
};

// ============================================
// Content Mapping by Product/Angle
// ============================================

const PHOTO_MAPPING = {
  // Product → Photo type
  'key-tracking': ['car-keys', 'key-handoff', 'dealership-showroom'],
  'lot-management': ['dealership-lot', 'lot-overview', 'vehicles-parked'],
  'service-workflow': ['service-bay', 'service-lane', 'technician-working'],
  'recon-workflow': ['vehicle-detail', 'service-bay', 'vehicles-parked'],
  'vehiclevault': ['happy-customer', 'key-handoff', 'mobile-app'],
  'full-platform': ['dealership-showroom', 'dashboard-view', 'mobile-app'],
};

const STAT_CONTENT = {
  'bill-brown-ford': {
    stat: '2,000+',
    label: 'Vehicles Tracked',
    substat: '90%',
    sublabel: 'Sales Team Adoption',
  },
  'corwin-toyota': {
    stat: '64%',
    label: 'Out in 60 Minutes',
    substat: '40-60%',
    sublabel: 'More Bay Turns',
  },
  'longo-toyota': {
    stat: '3 Days',
    label: 'Saved Per Car',
    substat: '15 min',
    sublabel: 'Saved Per RO',
  },
  'brandon-honda': {
    stat: '$308K',
    label: 'Monthly F&I Revenue',
    substat: 'Zero',
    sublabel: 'Chargebacks',
  },
};

// ============================================
// Asset Generator Class
// ============================================

class AssetGenerator {
  constructor(options = {}) {
    this.options = options;

    // Initialize clients (lazy - only when needed)
    this._pexels = null;
    this._unsplash = null;
    this._canva = null;
    this._runway = null;
    this._lumen5 = null;
  }

  // Lazy client initialization
  get pexels() {
    if (!this._pexels) this._pexels = new PexelsClient();
    return this._pexels;
  }

  get unsplash() {
    if (!this._unsplash) this._unsplash = new UnsplashClient();
    return this._unsplash;
  }

  get canva() {
    if (!this._canva) this._canva = new CanvaClient();
    return this._canva;
  }

  get runway() {
    if (!this._runway) this._runway = new RunwayClient();
    return this._runway;
  }

  get lumen5() {
    if (!this._lumen5) this._lumen5 = new Lumen5Client();
    return this._lumen5;
  }

  // ============================================
  // Main Generation Methods
  // ============================================

  /**
   * Generate all assets for a campaign
   */
  async generateCampaignAssets(campaignConfig, outputDir) {
    const {
      product,
      angle,
      persona,
      proofPoint,
      headline,
      subheadline,
      platforms = [],
    } = campaignConfig;

    console.log('\n' + '='.repeat(60));
    console.log('   ASSET GENERATOR');
    console.log('='.repeat(60));
    console.log(`\nProduct: ${product}`);
    console.log(`Proof Point: ${proofPoint}`);

    const assets = [];
    const assetsDir = path.join(outputDir, 'assets');

    // Create assets directory
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Determine which assets to generate based on platforms
    const assetTypes = this.getAssetTypesForPlatforms(platforms);

    console.log(`\nGenerating ${assetTypes.length} asset types...`);

    for (const assetType of assetTypes) {
      console.log(`\n[${assetType}]`);

      try {
        const asset = await this.generateAsset(assetType, campaignConfig, assetsDir);
        assets.push(asset);
        console.log(`  ✓ Generated: ${asset.filename}`);
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        assets.push({
          type: assetType,
          error: error.message,
          status: 'failed',
        });
      }
    }

    // Generate video assets if requested
    if (platforms.includes('video') || campaignConfig.generateVideo) {
      console.log('\n[VIDEO ASSETS]');
      try {
        const videoAssets = await this.generateVideoAssets(campaignConfig, assetsDir);
        assets.push(...videoAssets);
      } catch (error) {
        console.error(`  ✗ Video error: ${error.message}`);
      }
    }

    // Generate asset manifest
    const manifest = {
      generated_at: new Date().toISOString(),
      campaign: campaignConfig.campaignId,
      assets: assets,
    };

    fs.writeFileSync(
      path.join(assetsDir, 'asset-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log('\n' + '-'.repeat(60));
    console.log(`Generated ${assets.filter(a => a.status !== 'failed').length} assets`);
    console.log(`Output directory: ${assetsDir}`);

    return assets;
  }

  /**
   * Determine asset types based on selected platforms
   */
  getAssetTypesForPlatforms(platforms) {
    const types = new Set();

    if (platforms.includes('linkedin-posts') || platforms.includes('all')) {
      types.add('linkedin-post');
    }
    if (platforms.includes('linkedin-article') || platforms.includes('all')) {
      types.add('linkedin-article');
    }
    if (platforms.includes('facebook') || platforms.includes('all')) {
      types.add('facebook-post');
      types.add('facebook-ad');
    }
    if (platforms.includes('blog') || platforms.includes('all')) {
      types.add('blog-hero');
      types.add('og-image');
    }
    if (platforms.includes('landing-page') || platforms.includes('all')) {
      types.add('landing-hero');
      types.add('og-image');
    }

    // Always generate stat cards and quote cards for content
    types.add('stat-card');
    types.add('quote-card');

    return Array.from(types);
  }

  /**
   * Generate a single asset
   */
  async generateAsset(assetType, config, outputDir) {
    const spec = ASSET_SPECS[assetType];
    if (!spec) {
      throw new Error(`Unknown asset type: ${assetType}`);
    }

    // Step 1: Get background photo
    const photoType = this.getPhotoTypeForProduct(config.product);
    console.log(`  Fetching background: ${photoType}`);

    let backgroundPhoto;
    try {
      backgroundPhoto = await this.pexels.getBestPhoto(photoType, {
        orientation: spec.width > spec.height ? 'landscape' : 'square',
      });
    } catch (e) {
      // Fallback to Unsplash
      console.log(`  Trying Unsplash fallback...`);
      backgroundPhoto = await this.unsplash.getBestPhoto(photoType);
    }

    // Step 2: Prepare content for overlay
    const content = this.prepareContent(assetType, config);

    // Step 3: Generate via Canva (if template available) or create spec file
    const templateId = MDD_TEMPLATES[assetType];

    let result;
    if (templateId && process.env.CANVA_API_KEY) {
      console.log(`  Rendering via Canva template...`);
      result = await this.canva.generateSocialImage(templateId, {
        ...content,
        backgroundImageUrl: backgroundPhoto?.url,
      });
    } else {
      // Create a spec file for manual creation
      result = await this.createAssetSpec(assetType, spec, content, backgroundPhoto, outputDir);
    }

    return {
      type: assetType,
      ...spec,
      filename: result.filename || `${assetType}.png`,
      backgroundPhoto: backgroundPhoto,
      content: content,
      status: 'completed',
      ...result,
    };
  }

  /**
   * Get photo type based on product
   */
  getPhotoTypeForProduct(product) {
    const types = PHOTO_MAPPING[product] || ['dealership-showroom'];
    return types[0]; // Return primary type
  }

  /**
   * Prepare content for asset overlay
   */
  prepareContent(assetType, config) {
    const { headline, subheadline, proofPoint, product } = config;

    const statContent = STAT_CONTENT[proofPoint?.toLowerCase().replace(/\s+/g, '-')] || {};

    const content = {
      headline: headline,
      subheadline: subheadline,
    };

    // Add stats for stat cards
    if (assetType === 'stat-card') {
      content.stat = statContent.stat || '500+';
      content.statLabel = statContent.label || 'Dealerships';
      content.substat = statContent.substat;
      content.substatLabel = statContent.sublabel;
    }

    // Add quote for quote cards
    if (assetType === 'quote-card') {
      content.quote = config.quote || 'MDD instantly locates 2,000 vehicles on multiple lots all over town.';
      content.attribution = config.attribution || 'Dave Bird, Bill Brown Ford';
    }

    return content;
  }

  /**
   * Create asset specification file for manual creation
   */
  async createAssetSpec(assetType, spec, content, backgroundPhoto, outputDir) {
    const specFile = {
      type: assetType,
      dimensions: `${spec.width}x${spec.height}`,
      description: spec.description,
      background: {
        source: backgroundPhoto?.photographerUrl ? 'pexels' : 'unsplash',
        url: backgroundPhoto?.url,
        photographer: backgroundPhoto?.photographer,
        photographerUrl: backgroundPhoto?.photographerUrl,
      },
      overlay: {
        headline: content.headline,
        subheadline: content.subheadline,
        stat: content.stat,
        statLabel: content.statLabel,
        quote: content.quote,
        attribution: content.attribution,
      },
      brand: {
        primaryColor: '#8AC833',
        secondaryColor: '#1A1E24',
        font: 'DM Sans',
        logoPosition: 'bottom-right',
      },
      instructions: this.getAssetInstructions(assetType),
    };

    const filename = `${assetType}-spec.json`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(specFile, null, 2));

    // Also download background photo
    if (backgroundPhoto?.url) {
      const photoFilename = `${assetType}-background.jpg`;
      const photoPath = path.join(outputDir, photoFilename);

      try {
        if (this._pexels) {
          await this.pexels.downloadPhoto(backgroundPhoto.url, photoPath);
        }
        specFile.backgroundFile = photoFilename;
      } catch (e) {
        console.log(`  Could not download background: ${e.message}`);
      }
    }

    return {
      filename: filename,
      specFile: specFile,
      status: 'spec-created',
    };
  }

  /**
   * Get creation instructions for asset type
   */
  getAssetInstructions(assetType) {
    const instructions = {
      'linkedin-post': [
        'Use dark overlay (60% opacity) on background',
        'Headline in white, DM Sans Bold, centered',
        'Stat number in MDD Green (#8AC833), large',
        'MDD logo in bottom right corner',
      ],
      'stat-card': [
        'Dark background (#1A1E24)',
        'Large stat number in MDD Green, centered',
        'Label below in white',
        'Subtle background pattern or gradient',
      ],
      'quote-card': [
        'Dark background with subtle photo overlay',
        'Quote in white, italic',
        'Attribution in gray below',
        'Quote marks in MDD Green',
      ],
      'og-image': [
        'Clear headline readable at small sizes',
        'Dark overlay on photo background',
        'MDD logo visible',
        'Avoid text on edges (gets cropped)',
      ],
    };

    return instructions[assetType] || ['Follow MDD brand guidelines'];
  }

  // ============================================
  // Video Generation
  // ============================================

  /**
   * Generate video assets
   */
  async generateVideoAssets(config, outputDir) {
    const assets = [];

    // Determine video type based on content
    const videoTypes = this.getVideoTypesForConfig(config);

    for (const videoType of videoTypes) {
      console.log(`  Generating ${videoType} video...`);

      try {
        let result;

        if (videoType === 'explainer' && process.env.LUMEN5_API_KEY) {
          // Use Lumen5 for text-to-video
          result = await this.generateLumen5Video(config);
        } else if (process.env.RUNWAY_API_KEY) {
          // Use Runway for AI-generated scenes
          result = await this.generateRunwayVideo(config, videoType);
        } else {
          // Create video script/storyboard
          result = await this.createVideoScript(config, videoType, outputDir);
        }

        assets.push({
          type: `video-${videoType}`,
          ...result,
          status: 'completed',
        });

        console.log(`  ✓ Video ${videoType} ready`);
      } catch (error) {
        console.error(`  ✗ Video error: ${error.message}`);
        assets.push({
          type: `video-${videoType}`,
          error: error.message,
          status: 'failed',
        });
      }
    }

    return assets;
  }

  /**
   * Get video types based on config
   */
  getVideoTypesForConfig(config) {
    const types = ['explainer'];

    // Add before/after for relevant angles
    if (['saturday-chaos', 'lost-key-cost', 'service-revenue'].includes(config.angle)) {
      types.push('before-after');
    }

    return types;
  }

  /**
   * Generate Lumen5 video
   */
  async generateLumen5Video(config) {
    const content = `
${config.headline}

${config.subheadline || ''}

${config.proofPoint} achieved remarkable results:
${config.stat || 'Significant improvements'} in ${config.statLabel || 'key metrics'}.

See how MDD can help your dealership.
    `.trim();

    const result = await this.lumen5.createAndWait(content, {
      title: config.headline,
      format: 'landscape',
    });

    return {
      url: result.download_url,
      platform: 'lumen5',
    };
  }

  /**
   * Generate Runway video
   */
  async generateRunwayVideo(config, videoType) {
    if (videoType === 'before-after') {
      const scenario = this.getBeforeAfterScenario(config.angle);
      const result = await this.runway.generateBeforeAfter(scenario);
      return {
        beforeUrl: result.before.output_url,
        afterUrl: result.after.output_url,
        platform: 'runway',
      };
    }

    // Single scene video
    const sceneType = this.getSceneTypeForProduct(config.product);
    const result = await this.runway.generateDealershipScene(sceneType);
    return {
      url: result.output_url,
      platform: 'runway',
    };
  }

  /**
   * Get before/after scenario based on angle
   */
  getBeforeAfterScenario(angle) {
    const mapping = {
      'saturday-chaos': 'key-search',
      'lost-key-cost': 'key-search',
      'service-revenue': 'service-wait',
      'inventory-cashflow': 'vehicle-find',
    };
    return mapping[angle] || 'key-search';
  }

  /**
   * Get scene type for product
   */
  getSceneTypeForProduct(product) {
    const mapping = {
      'key-tracking': 'keys-found',
      'lot-management': 'lot-overview',
      'service-workflow': 'service-busy',
      'recon-workflow': 'technician-phone',
      'vehiclevault': 'key-handoff',
    };
    return mapping[product] || 'service-busy';
  }

  /**
   * Create video script/storyboard
   */
  async createVideoScript(config, videoType, outputDir) {
    const script = {
      type: videoType,
      duration: '30-60 seconds',
      format: '16:9 landscape',
      scenes: this.generateScriptScenes(config, videoType),
      music: 'Upbeat, professional',
      voiceover: this.generateVoiceover(config),
    };

    const filename = `video-${videoType}-script.json`;
    fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(script, null, 2));

    return {
      filename: filename,
      script: script,
      platform: 'script-only',
    };
  }

  /**
   * Generate script scenes
   */
  generateScriptScenes(config, videoType) {
    if (videoType === 'before-after') {
      return [
        {
          scene: 1,
          duration: '5s',
          description: 'Problem scenario - frustrated employee searching',
          text: config.angle === 'saturday-chaos'
            ? "It's Saturday at 11:30am. Customer is ready to buy."
            : 'The problem every dealership knows.',
        },
        {
          scene: 2,
          duration: '5s',
          description: 'Pain point visualization',
          text: 'Nobody can find the key.',
        },
        {
          scene: 3,
          duration: '5s',
          description: 'Solution introduction',
          text: `${config.proofPoint} found a better way.`,
        },
        {
          scene: 4,
          duration: '5s',
          description: 'Solution in action',
          text: 'Now they find any key in seconds.',
        },
        {
          scene: 5,
          duration: '5s',
          description: 'Result/stat',
          text: config.stat ? `${config.stat} ${config.statLabel}` : 'Real results.',
        },
        {
          scene: 6,
          duration: '5s',
          description: 'CTA',
          text: 'See how at mdd.io',
        },
      ];
    }

    // Default explainer
    return [
      { scene: 1, duration: '5s', description: 'Hook', text: config.headline },
      { scene: 2, duration: '10s', description: 'Problem', text: config.subheadline },
      { scene: 3, duration: '10s', description: 'Solution', text: 'Mobile Dealer Data provides real-time visibility.' },
      { scene: 4, duration: '5s', description: 'Proof', text: `${config.proofPoint}: ${config.stat}` },
      { scene: 5, duration: '5s', description: 'CTA', text: 'Learn more at mdd.io' },
    ];
  }

  /**
   * Generate voiceover script
   */
  generateVoiceover(config) {
    return `
${config.headline}

${config.subheadline || 'Dealerships across the country face this challenge every day.'}

${config.proofPoint || 'Leading dealerships'} solved this with Mobile Dealer Data.

${config.stat ? `They achieved ${config.stat} ${config.statLabel}.` : 'The results speak for themselves.'}

See how MDD can help your dealership at mdd.io.
    `.trim();
  }
}

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const generator = new AssetGenerator();

  const commands = {
    'manifest': async () => {
      // Generate assets from campaign manifest
      const manifestPath = args[1];
      if (!manifestPath) {
        throw new Error('Manifest path required');
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const campaignDir = path.dirname(manifestPath);

      // Build config from manifest
      const config = {
        campaignId: manifest.campaign_id,
        product: manifest.product,
        proofPoint: manifest.proof_point,
        headline: manifest.headline || manifest.campaign_name,
        subheadline: manifest.subheadline,
        platforms: manifest.platforms || [],
        angle: manifest.angle,
        assetTypes: manifest.asset_types || [],
        videoSceneType: manifest.video_scene_type,
        videoCount: manifest.video_count,
        assetSource: manifest.asset_source,
      };

      console.log(`\nGenerating assets for campaign: ${config.campaignId}`);
      console.log(`Asset source: ${config.assetSource || 'stock-canva'}`);
      console.log(`Asset types: ${(config.assetTypes || []).join(', ') || 'auto'}`);

      await generator.generateCampaignAssets(config, campaignDir);
    },

    'generate': async () => {
      const config = {
        campaignId: 'test-campaign',
        product: args[1] || 'key-tracking',
        proofPoint: 'Bill Brown Ford',
        headline: 'Find Any Key in Seconds',
        subheadline: 'Stop searching. Start selling.',
        platforms: ['linkedin-posts', 'facebook', 'blog'],
      };

      const outputDir = args[2] || './test-assets';
      await generator.generateCampaignAssets(config, outputDir);
    },

    'photo': async () => {
      const product = args[1] || 'service-workflow';
      const photoType = generator.getPhotoTypeForProduct(product);
      console.log(`Photo type for ${product}: ${photoType}`);

      const photo = await generator.pexels.getBestPhoto(photoType);
      console.log('Best photo:', JSON.stringify(photo, null, 2));
    },

    'video': async () => {
      const product = args[1] || 'key-tracking';
      const angle = args[2] || 'saturday-chaos';

      const config = {
        product,
        angle,
        proofPoint: 'Bill Brown Ford',
        headline: 'Find Any Key in Seconds',
      };

      const outputDir = args[3] || './test-video';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      console.log('Generating video assets...');
      const assets = await generator.generateVideoAssets(config, outputDir);
      console.log('Video assets:', JSON.stringify(assets, null, 2));
    },
  };

  // Handle manifest path as first argument (no command needed)
  if (command && command.endsWith('.json')) {
    args.unshift('manifest');
    commands['manifest']().catch(console.error);
  } else if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node asset-generator.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  <manifest.json>                - Generate assets from campaign manifest');
    console.log('  generate <product> [outputDir] - Generate assets for a campaign');
    console.log('  photo <product>                - Find best photo for product');
    console.log('  video <product> [angle] [dir]  - Generate video script');
    console.log('');
    console.log('Examples:');
    console.log('  node asset-generator.js campaigns/2024-01-key-tracking/manifest.json');
    console.log('  node asset-generator.js generate key-tracking ./output');
    console.log('  node asset-generator.js photo service-workflow');
  }
}

module.exports = { AssetGenerator, ASSET_SPECS, STAT_CONTENT };
