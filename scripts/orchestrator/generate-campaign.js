/**
 * Campaign Generator - Core Orchestrator
 *
 * This is the main entry point for generating marketing campaigns.
 * Given a campaign brief, it generates all content across channels.
 *
 * Usage:
 *   node generate-campaign.js --product "key-tracking" --angle "saturday-chaos" --persona "sales-manager"
 *   node generate-campaign.js --config campaign-brief.json
 */

const fs = require('fs');
const path = require('path');
const ContentGenerator = require('./content-generator');
const { validateCampaign } = require('./validate-campaign');

// Default campaign configuration
const DEFAULT_CONFIG = {
  contentTypes: [
    'landing-page',
    'blog-post',
    'linkedin-post',
    'facebook-post',
    'linkedin-article',
    'email-sequence',
    'press-release',
    'one-pager',
  ],
  emailCount: 5,
  socialPostCount: 3,
};

/**
 * Generate campaign ID from parameters
 */
function generateCampaignId(product, angle) {
  const date = new Date().toISOString().slice(0, 7); // YYYY-MM
  const slug = `${product}-${angle}`.toLowerCase().replace(/\s+/g, '-');
  return `${date}-${slug}`;
}

/**
 * Create campaign directory structure
 */
function createCampaignDirectory(campaignId) {
  const campaignsDir = path.join(process.cwd(), 'campaigns');
  const campaignDir = path.join(campaignsDir, campaignId);

  // Create directories
  const dirs = [
    campaignDir,
    path.join(campaignDir, 'content'),
    path.join(campaignDir, 'content', 'social'),
    path.join(campaignDir, 'content', 'email'),
    path.join(campaignDir, 'assets'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  return campaignDir;
}

/**
 * Create campaign manifest
 */
function createManifest(campaignDir, config) {
  const manifest = {
    campaign_id: config.campaignId,
    campaign_name: config.campaignName,
    created_at: new Date().toISOString(),
    status: 'draft',
    product: config.product,
    angle: config.angle,
    persona: config.persona,
    content: [],
    publishing: {
      hubspot: { status: 'pending' },
      linkedin: { status: 'pending' },
      facebook: { status: 'pending' },
    },
  };

  const manifestPath = path.join(campaignDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  return manifestPath;
}

/**
 * Update manifest with generated content
 */
function updateManifest(manifestPath, contentItems) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.content = contentItems;
  manifest.updated_at = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Generate all campaign content
 */
async function generateCampaign(config) {
  console.log('\n' + '='.repeat(60));
  console.log('MDD MARKETING MACHINE - Campaign Generator');
  console.log('='.repeat(60));

  // Merge with defaults
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Generate campaign ID if not provided
  if (!fullConfig.campaignId) {
    fullConfig.campaignId = generateCampaignId(fullConfig.product, fullConfig.angle);
  }

  // Generate campaign name if not provided
  if (!fullConfig.campaignName) {
    fullConfig.campaignName = `${fullConfig.product} - ${fullConfig.angle}`.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  console.log(`\nCampaign: ${fullConfig.campaignName}`);
  console.log(`ID: ${fullConfig.campaignId}`);
  console.log(`Product: ${fullConfig.product}`);
  console.log(`Angle: ${fullConfig.angle}`);
  console.log(`Persona: ${fullConfig.persona}`);

  // Create campaign directory
  const campaignDir = createCampaignDirectory(fullConfig.campaignId);
  console.log(`\nCampaign directory: ${campaignDir}`);

  // Create manifest
  const manifestPath = createManifest(campaignDir, fullConfig);
  console.log(`Manifest created: ${manifestPath}`);

  // Initialize content generator
  const generator = new ContentGenerator(fullConfig);

  // Generate content
  const contentItems = [];
  console.log('\n' + '-'.repeat(60));
  console.log('Generating Content...');
  console.log('-'.repeat(60));

  for (const contentType of fullConfig.contentTypes) {
    console.log(`\n[${contentType}]`);

    try {
      const items = await generator.generate(contentType, campaignDir);

      for (const item of items) {
        contentItems.push(item);
        console.log(`  ✓ ${item.file}`);
      }
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
    }
  }

  // Update manifest with content
  updateManifest(manifestPath, contentItems);

  // Validate campaign
  console.log('\n' + '-'.repeat(60));
  console.log('Validating Campaign...');
  console.log('-'.repeat(60));

  const validation = await validateCampaign(manifestPath);

  if (validation.valid) {
    console.log('\n✓ Campaign validation passed');
  } else {
    console.log('\n⚠ Campaign validation warnings:');
    for (const warning of validation.warnings) {
      console.log(`  - ${warning}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('CAMPAIGN GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nGenerated ${contentItems.length} content items:`);

  const typeCounts = {};
  for (const item of contentItems) {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(typeCounts)) {
    console.log(`  - ${type}: ${count}`);
  }

  console.log(`\nCampaign directory: ${campaignDir}`);
  console.log(`Manifest: ${manifestPath}`);

  console.log('\nNext steps:');
  console.log('  1. Review generated content in the campaign directory');
  console.log('  2. Edit content as needed');
  console.log('  3. Run validation: node validate-campaign.js ' + manifestPath);
  console.log('  4. Publish to HubSpot: node ../hubspot/publish-page.js ' + manifestPath);
  console.log('  5. Publish to LinkedIn: node ../linkedin/publish-post.js ' + manifestPath);
  console.log('  6. Publish to Facebook: node ../facebook/publish-post.js ' + manifestPath);

  return {
    success: true,
    campaignId: fullConfig.campaignId,
    campaignDir,
    manifestPath,
    contentItems,
    validation,
  };
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const config = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--config') {
      const configPath = args[++i];
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      Object.assign(config, fileConfig);
    } else if (arg === '--product') {
      config.product = args[++i];
    } else if (arg === '--angle') {
      config.angle = args[++i];
    } else if (arg === '--persona') {
      config.persona = args[++i];
    } else if (arg === '--name') {
      config.campaignName = args[++i];
    } else if (arg === '--id') {
      config.campaignId = args[++i];
    } else if (arg === '--dry-run') {
      config.dryRun = true;
    }
  }

  return config;
}

/**
 * Validate required configuration
 */
function validateConfig(config) {
  const required = ['product', 'angle', 'persona'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  // Validate product
  const validProducts = ['key-tracking', 'lot-management', 'service-workflow', 'recon-workflow', 'vehiclevault', 'full-platform'];
  if (!validProducts.includes(config.product)) {
    throw new Error(`Invalid product: ${config.product}. Valid options: ${validProducts.join(', ')}`);
  }

  // Validate angle
  const validAngles = ['saturday-chaos', 'inventory-cashflow', 'service-revenue', 'lost-key-cost', 'vehiclevault-profit'];
  if (!validAngles.includes(config.angle)) {
    throw new Error(`Invalid angle: ${config.angle}. Valid options: ${validAngles.join(', ')}`);
  }

  // Validate persona
  const validPersonas = ['owner', 'gm', 'service-manager', 'sales-manager', 'fi-manager', 'used-car-manager'];
  if (!validPersonas.includes(config.persona)) {
    throw new Error(`Invalid persona: ${config.persona}. Valid options: ${validPersonas.join(', ')}`);
  }

  return true;
}

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log('MDD Marketing Machine - Campaign Generator');
    console.log('');
    console.log('Usage:');
    console.log('  node generate-campaign.js --product <product> --angle <angle> --persona <persona>');
    console.log('  node generate-campaign.js --config <config-file.json>');
    console.log('');
    console.log('Options:');
    console.log('  --product <product>  Product to feature');
    console.log('                       Options: key-tracking, lot-management, service-workflow,');
    console.log('                                recon-workflow, vehiclevault, full-platform');
    console.log('');
    console.log('  --angle <angle>      Messaging angle');
    console.log('                       Options: saturday-chaos, inventory-cashflow, service-revenue,');
    console.log('                                lost-key-cost, vehiclevault-profit');
    console.log('');
    console.log('  --persona <persona>  Target persona');
    console.log('                       Options: owner, gm, service-manager, sales-manager,');
    console.log('                                fi-manager, used-car-manager');
    console.log('');
    console.log('  --name <name>        Campaign name (optional)');
    console.log('  --id <id>            Campaign ID (optional, auto-generated)');
    console.log('  --config <file>      Load configuration from JSON file');
    console.log('  --dry-run            Show what would be generated without creating files');
    console.log('');
    console.log('Example:');
    console.log('  node generate-campaign.js --product key-tracking --angle saturday-chaos --persona sales-manager');
    process.exit(0);
  }

  const config = parseArgs(args);

  try {
    validateConfig(config);
  } catch (error) {
    console.error('Configuration error:', error.message);
    process.exit(1);
  }

  generateCampaign(config)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { generateCampaign, createCampaignDirectory, createManifest };
