#!/usr/bin/env node
/**
 * MDD Marketing Machine - Full Campaign Runner
 *
 * One command to generate and deploy a complete marketing campaign.
 *
 * Usage:
 *   node run-campaign.js --product key-tracking --angle saturday-chaos --persona sales-manager
 *   node run-campaign.js --product key-tracking --angle saturday-chaos --persona sales-manager --deploy
 *   node run-campaign.js --product key-tracking --angle saturday-chaos --persona sales-manager --publish
 *
 * This script:
 *   1. Generates all campaign content (landing page, blog, social, emails, etc.)
 *   2. Downloads/generates assets (hero images, social graphics)
 *   3. Optionally deploys to HubSpot, LinkedIn, Facebook
 */

const { generateCampaign } = require('./generate-campaign');
const { CampaignDeployer } = require('./deploy-campaign');

async function runCampaign(config) {
  console.log('\n🚀 MDD MARKETING MACHINE - Full Campaign Runner\n');

  // Step 1: Generate campaign
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' STEP 1: GENERATING CAMPAIGN');
  console.log('═══════════════════════════════════════════════════════════\n');

  const generateResult = await generateCampaign({
    product: config.product,
    angle: config.angle,
    persona: config.persona,
    campaignName: config.campaignName,
    campaignId: config.campaignId,
    emailCount: config.emailCount || 5,
    socialPostCount: config.socialPostCount || 3,
  });

  if (!generateResult.success) {
    console.error('\n❌ Campaign generation failed');
    return { success: false };
  }

  // Step 2: Deploy (if requested)
  if (config.deploy || config.publish) {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(' STEP 2: DEPLOYING CAMPAIGN');
    console.log('═══════════════════════════════════════════════════════════');

    const deployer = new CampaignDeployer(generateResult.campaignDir);

    const deployResult = await deployer.deploy({
      skipAssets: config.skipAssets,
      skipHubspot: config.skipHubspot,
      skipSocial: config.skipSocial || !config.publish,
      draftOnly: !config.publish,
    });

    return {
      success: true,
      ...generateResult,
      deployment: deployResult,
    };
  }

  // If no deployment requested, just provide instructions
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' CAMPAIGN READY FOR DEPLOYMENT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nYour campaign has been generated. To deploy:');
  console.log(`\n  npm run deploy ${generateResult.campaignDir}`);
  console.log(`  npm run deploy:full ${generateResult.campaignDir}  # Include social posting`);

  return {
    success: true,
    ...generateResult,
  };
}

// Parse arguments
function parseArgs(args) {
  const config = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--product':
        config.product = args[++i];
        break;
      case '--angle':
        config.angle = args[++i];
        break;
      case '--persona':
        config.persona = args[++i];
        break;
      case '--name':
        config.campaignName = args[++i];
        break;
      case '--id':
        config.campaignId = args[++i];
        break;
      case '--deploy':
        config.deploy = true;
        break;
      case '--publish':
        config.publish = true;
        config.deploy = true;
        break;
      case '--skip-assets':
        config.skipAssets = true;
        break;
      case '--skip-hubspot':
        config.skipHubspot = true;
        break;
      case '--skip-social':
        config.skipSocial = true;
        break;
    }
  }

  return config;
}

// Validate configuration
function validateConfig(config) {
  const required = ['product', 'angle', 'persona'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    console.error(`Missing required options: ${missing.join(', ')}`);
    return false;
  }

  return true;
}

// Show help
function showHelp() {
  console.log(`
MDD Marketing Machine - Full Campaign Runner

USAGE:
  node run-campaign.js [options]

REQUIRED OPTIONS:
  --product <product>   Product to feature
                        Options: key-tracking, lot-management, service-workflow,
                                 recon-workflow, vehiclevault, full-platform

  --angle <angle>       Messaging angle
                        Options: saturday-chaos, inventory-cashflow, service-revenue,
                                 lost-key-cost, vehiclevault-profit

  --persona <persona>   Target persona
                        Options: owner, gm, service-manager, sales-manager,
                                 fi-manager, used-car-manager

OPTIONAL:
  --name <name>         Campaign name (auto-generated if not provided)
  --id <id>             Campaign ID (auto-generated if not provided)
  --deploy              Generate and deploy to HubSpot (draft mode)
  --publish             Generate and publish everywhere (live mode)
  --skip-assets         Skip asset generation
  --skip-hubspot        Skip HubSpot deployment
  --skip-social         Skip social media deployment

EXAMPLES:
  # Generate campaign only
  node run-campaign.js --product key-tracking --angle saturday-chaos --persona sales-manager

  # Generate and deploy to HubSpot (draft)
  node run-campaign.js --product key-tracking --angle saturday-chaos --persona sales-manager --deploy

  # Generate and publish everything
  node run-campaign.js --product key-tracking --angle saturday-chaos --persona sales-manager --publish

ENVIRONMENT VARIABLES:
  Set these in .env file for deployment:

  HUBSPOT_ACCESS_TOKEN     HubSpot API token
  HUBSPOT_BLOG_ID          HubSpot blog ID
  LINKEDIN_ACCESS_TOKEN    LinkedIn OAuth token
  LINKEDIN_ORGANIZATION_ID LinkedIn company page ID
  FACEBOOK_ACCESS_TOKEN    Facebook page access token
  FACEBOOK_PAGE_ID         Facebook page ID
  PEXELS_API_KEY           Pexels API key for stock photos
`);
}

// Main
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const config = parseArgs(args);

  if (!validateConfig(config)) {
    console.log('\nRun with --help for usage information');
    process.exit(1);
  }

  runCampaign(config)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { runCampaign };
