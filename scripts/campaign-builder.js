#!/usr/bin/env node

/**
 * MDD Campaign Builder - Interactive Campaign Creation Wizard
 *
 * Walks marketing managers through building a complete campaign,
 * then generates all content files for review.
 *
 * Usage:
 *   node campaign-builder.js
 *
 * Or make executable:
 *   chmod +x campaign-builder.js
 *   ./campaign-builder.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { generateCampaign } = require('./orchestrator/generate-campaign');

// ============================================
// Configuration Options
// ============================================

const PLATFORMS = {
  'email-hubspot': { name: 'Email (HubSpot)', group: 'email' },
  'email-mailchimp': { name: 'Email (Mailchimp)', group: 'email' },
  'facebook': { name: 'Facebook Posts', group: 'social' },
  'linkedin-posts': { name: 'LinkedIn Posts', group: 'social' },
  'linkedin-article': { name: 'LinkedIn Article', group: 'content' },
  'blog': { name: 'Blog Post (HubSpot)', group: 'content' },
  'landing-page': { name: 'Landing Page (HubSpot)', group: 'content' },
  'press-release': { name: 'Press Release', group: 'content' },
  'one-pager': { name: 'One-Pager / Sales Collateral', group: 'content' },
};

const PRODUCTS = {
  'key-tracking': {
    name: 'Key Tracking',
    description: 'MDD Locate - Find any key in seconds',
    proofPoint: 'Bill Brown Ford',
  },
  'lot-management': {
    name: 'Lot Management',
    description: 'MDD Locate - Know where every vehicle is',
    proofPoint: 'Bill Brown Ford',
  },
  'service-workflow': {
    name: 'Service Workflow',
    description: 'Eliminate service bottlenecks, improve CSI',
    proofPoint: 'Corwin Toyota',
  },
  'recon-workflow': {
    name: 'Recon Workflow',
    description: 'Accelerate time-to-line, reduce holding costs',
    proofPoint: 'Longo Toyota',
  },
  'vehiclevault': {
    name: 'VehicleVault',
    description: 'F&I product - recurring revenue, zero chargebacks',
    proofPoint: 'Brandon Honda',
  },
  'full-platform': {
    name: 'Full Platform',
    description: 'Complete MDD solution overview',
    proofPoint: 'Bill Brown Ford',
  },
};

const PERSONAS = {
  'owner': { name: 'Owner / Dealer Principal', title: 'Dealer Principal' },
  'gm': { name: 'General Manager', title: 'General Manager' },
  'service-manager': { name: 'Service Manager', title: 'Service Director' },
  'sales-manager': { name: 'Sales Manager', title: 'Sales Manager' },
  'fi-manager': { name: 'F&I Manager', title: 'F&I Director' },
  'used-car-manager': { name: 'Used Car Manager', title: 'Used Car Manager' },
};

const EMAIL_TYPES = {
  'cold-outbound': { name: 'Cold Outbound', description: 'New prospects, never contacted' },
  'nurture': { name: 'Nurture Sequence', description: 'Warm leads, shown interest' },
  're-engagement': { name: 'Re-engagement', description: 'Dormant contacts, went cold' },
};

const ANGLES = {
  'saturday-chaos': {
    name: 'Saturday Chaos',
    hook: "It's Saturday at 11:30am. A customer is ready to buy. Nobody can find the key.",
  },
  'inventory-cashflow': {
    name: 'Inventory Cashflow',
    hook: 'Every day a car sits in recon is cash sitting on the lot.',
  },
  'service-revenue': {
    name: 'Service Revenue',
    hook: 'Express service wait times hitting 2.5 hours.',
  },
  'lost-key-cost': {
    name: 'Lost Key Cost',
    hook: 'Quick question. What did the last lost key cost to replace?',
  },
  'vehiclevault-profit': {
    name: 'VehicleVault Profit',
    hook: "$308,000 per month. That's how much one dealership generates.",
  },
  'custom': {
    name: 'Custom Hook',
    hook: null,
  },
};

const PROMO_CONTEXTS = {
  'standard': { name: 'Standard Outreach', description: 'Regular marketing campaign' },
  'trade-show': { name: 'Trade Show Follow-up', description: 'Post-NADA or industry event' },
  'seasonal': { name: 'Seasonal Push', description: 'End of quarter, year-end, etc.' },
  'product-launch': { name: 'Product Launch', description: 'New feature or product announcement' },
  'case-study': { name: 'Case Study Feature', description: 'Highlighting customer success' },
};

const SCHEDULING = {
  'draft': { name: 'Draft Only', description: 'Generate files for review, publish manually' },
  'immediate': { name: 'Publish Immediately', description: 'Publish right after generation' },
  'scheduled': { name: 'Schedule for Later', description: 'Set a specific publish date/time' },
};

const ASSET_TYPES = {
  'og-image': { name: 'OG / Link Preview Image', description: '1200x630, for blog/landing pages' },
  'social-images': { name: 'Social Media Images', description: 'LinkedIn/Facebook post images' },
  'stat-cards': { name: 'Stat/Proof Point Cards', description: 'Branded statistics graphics' },
  'hero-image': { name: 'Hero / Banner Image', description: 'Landing page hero background' },
  'video-clips': { name: 'Video Clips (AI)', description: 'Runway ML generated scenes' },
  'blog-video': { name: 'Blog-to-Video', description: 'Lumen5 video from blog content' },
};

const ASSET_SOURCES = {
  'stock-only': { name: 'Stock Photos Only', description: 'Pexels/Unsplash - fastest' },
  'stock-canva': { name: 'Stock + Canva Templates', description: 'Branded overlays on stock photos' },
  'full-pipeline': { name: 'Full Pipeline', description: 'Stock + Canva + AI video generation' },
  'none': { name: 'No Assets', description: 'Text content only' },
};

// ============================================
// Interactive Prompts
// ============================================

class CampaignBuilder {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.config = {};
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async promptChoice(question, options, allowMultiple = false) {
    console.log('\n' + question);
    console.log('-'.repeat(50));

    const keys = Object.keys(options);
    keys.forEach((key, index) => {
      const opt = options[key];
      const desc = opt.description ? ` - ${opt.description}` : '';
      console.log(`  ${index + 1}. ${opt.name}${desc}`);
    });

    if (allowMultiple) {
      console.log(`\n  Enter numbers separated by commas (e.g., 1,2,3) or "all"`);
    }

    const answer = await this.prompt('\nYour choice: ');

    if (allowMultiple) {
      if (answer.toLowerCase() === 'all') {
        return keys;
      }
      const indices = answer.split(',').map(s => parseInt(s.trim(), 10) - 1);
      return indices.filter(i => i >= 0 && i < keys.length).map(i => keys[i]);
    } else {
      const index = parseInt(answer, 10) - 1;
      if (index >= 0 && index < keys.length) {
        return keys[index];
      }
      return keys[0]; // Default to first option
    }
  }

  async promptYesNo(question, defaultYes = true) {
    const hint = defaultYes ? '[Y/n]' : '[y/N]';
    const answer = await this.prompt(`${question} ${hint}: `);

    if (answer === '') {
      return defaultYes;
    }
    return answer.toLowerCase().startsWith('y');
  }

  async promptNumber(question, defaultValue, min = 1, max = 20) {
    const answer = await this.prompt(`${question} [${defaultValue}]: `);

    if (answer === '') {
      return defaultValue;
    }

    const num = parseInt(answer, 10);
    if (isNaN(num) || num < min || num > max) {
      console.log(`  Invalid. Using default: ${defaultValue}`);
      return defaultValue;
    }
    return num;
  }

  // ============================================
  // Build Flow
  // ============================================

  async run() {
    this.printHeader();

    try {
      // Step 1: Platforms
      await this.askPlatforms();

      // Step 2: Product
      await this.askProduct();

      // Step 3: Audience/Persona
      await this.askPersona();

      // Step 4: Email Type (if email selected)
      if (this.config.hasEmail) {
        await this.askEmailType();
      }

      // Step 5: Messaging Angle
      await this.askAngle();

      // Step 6: Promotional Context
      await this.askPromoContext();

      // Step 7: A/B Testing
      await this.askABTesting();

      // Step 8: Content Counts
      await this.askContentCounts();

      // Step 9: Asset Generation
      await this.askAssetGeneration();

      // Step 10: Scheduling
      await this.askScheduling();

      // Step 11: Campaign Name
      await this.askCampaignName();

      // Show Game Plan
      const confirmed = await this.showGamePlan();

      if (confirmed) {
        await this.generateCampaign();
      } else {
        console.log('\nCampaign cancelled. Run again to start over.');
      }
    } catch (error) {
      console.error('\nError:', error.message);
    } finally {
      this.rl.close();
    }
  }

  printHeader() {
    console.log('\n' + '='.repeat(60));
    console.log('   MDD MARKETING MACHINE - Campaign Builder');
    console.log('='.repeat(60));
    console.log("\nLet's build your campaign. I'll walk you through each step.\n");
  }

  async askPlatforms() {
    console.log('\n📢 STEP 1: SELECT PLATFORMS');

    this.config.platforms = await this.promptChoice(
      'Which platforms are you building for?',
      PLATFORMS,
      true
    );

    // Determine what types of content we need
    this.config.hasEmail = this.config.platforms.some(p =>
      p.includes('email')
    );
    this.config.hasSocial = this.config.platforms.some(p =>
      ['facebook', 'linkedin-posts'].includes(p)
    );
    this.config.hasHubSpotEmail = this.config.platforms.includes('email-hubspot');
    this.config.hasMailchimpEmail = this.config.platforms.includes('email-mailchimp');

    console.log(`\n✓ Selected: ${this.config.platforms.map(p => PLATFORMS[p].name).join(', ')}`);
  }

  async askProduct() {
    console.log('\n📦 STEP 2: SELECT PRODUCT');

    this.config.product = await this.promptChoice(
      'Which product are you promoting?',
      PRODUCTS
    );

    this.config.proofPoint = PRODUCTS[this.config.product].proofPoint;
    console.log(`\n✓ Product: ${PRODUCTS[this.config.product].name}`);
    console.log(`  Auto-selected proof point: ${this.config.proofPoint}`);
  }

  async askPersona() {
    console.log('\n👤 STEP 3: SELECT TARGET AUDIENCE');

    this.config.persona = await this.promptChoice(
      'Who is the primary target audience?',
      PERSONAS
    );

    console.log(`\n✓ Persona: ${PERSONAS[this.config.persona].name}`);

    // Validate persona-product fit
    this.validatePersonaProductFit();
  }

  validatePersonaProductFit() {
    const warnings = [];

    // F&I Manager should only get VehicleVault
    if (this.config.persona === 'fi-manager' && this.config.product !== 'vehiclevault') {
      warnings.push(`⚠️  F&I Managers typically only care about VehicleVault, not ${PRODUCTS[this.config.product].name}`);
    }

    // Service Manager shouldn't get VehicleVault
    if (this.config.persona === 'service-manager' && this.config.product === 'vehiclevault') {
      warnings.push(`⚠️  Service Managers typically don't care about VehicleVault (no service communication yet)`);
    }

    if (warnings.length > 0) {
      console.log('\n' + warnings.join('\n'));
      console.log('  (Proceeding anyway - you know your audience best)');
    }
  }

  async askEmailType() {
    console.log('\n📧 STEP 4: EMAIL SEQUENCE TYPE');

    this.config.emailType = await this.promptChoice(
      'What type of email sequence?',
      EMAIL_TYPES
    );

    console.log(`\n✓ Email Type: ${EMAIL_TYPES[this.config.emailType].name}`);
  }

  async askAngle() {
    console.log('\n🎯 STEP 5: MESSAGING ANGLE');

    this.config.angleKey = await this.promptChoice(
      'Select a messaging angle (or create custom):',
      ANGLES
    );

    if (this.config.angleKey === 'custom') {
      console.log('\nEnter your custom opening hook (the scenario that grabs attention):');
      this.config.customHook = await this.prompt('Hook: ');
      this.config.angle = 'custom';
      console.log(`\n✓ Custom Hook: "${this.config.customHook}"`);
    } else {
      this.config.angle = this.config.angleKey;
      this.config.hook = ANGLES[this.config.angleKey].hook;
      console.log(`\n✓ Angle: ${ANGLES[this.config.angleKey].name}`);
      console.log(`  Hook: "${this.config.hook}"`);
    }
  }

  async askPromoContext() {
    console.log('\n📅 STEP 6: PROMOTIONAL CONTEXT');

    this.config.promoContext = await this.promptChoice(
      "What's the context for this campaign?",
      PROMO_CONTEXTS
    );

    console.log(`\n✓ Context: ${PROMO_CONTEXTS[this.config.promoContext].name}`);
  }

  async askABTesting() {
    console.log('\n🧪 STEP 7: A/B TESTING');

    this.config.abTesting = await this.promptYesNo(
      'Generate A/B test variations for subject lines?',
      true
    );

    if (this.config.abTesting) {
      this.config.abVariations = await this.promptNumber(
        'How many subject line variations?',
        3,
        2,
        5
      );
      console.log(`\n✓ A/B Testing: Yes (${this.config.abVariations} variations)`);
    } else {
      console.log('\n✓ A/B Testing: No');
    }
  }

  async askContentCounts() {
    console.log('\n📝 STEP 8: CONTENT COUNTS');

    if (this.config.hasEmail) {
      this.config.emailCount = await this.promptNumber(
        'How many emails in the sequence?',
        this.config.emailType === 'cold-outbound' ? 10 : 5,
        1,
        15
      );
      console.log(`  ✓ Emails: ${this.config.emailCount}`);
    }

    if (this.config.hasSocial) {
      this.config.socialPostCount = await this.promptNumber(
        'How many social posts per platform?',
        3,
        1,
        10
      );
      console.log(`  ✓ Social Posts: ${this.config.socialPostCount} per platform`);
    }
  }

  async askAssetGeneration() {
    console.log('\n🖼️  STEP 9: ASSET GENERATION');

    // First ask about asset pipeline
    this.config.assetSource = await this.promptChoice(
      'How should we generate visual assets?',
      ASSET_SOURCES
    );

    console.log(`\n✓ Asset Source: ${ASSET_SOURCES[this.config.assetSource].name}`);

    if (this.config.assetSource === 'none') {
      this.config.assetTypes = [];
      return;
    }

    // Ask which asset types to generate
    console.log('\nWhich types of assets do you need?');

    // Filter available assets based on source
    const availableAssets = { ...ASSET_TYPES };
    if (this.config.assetSource === 'stock-only') {
      // Stock only - remove video options
      delete availableAssets['video-clips'];
      delete availableAssets['blog-video'];
    }
    if (this.config.assetSource !== 'full-pipeline') {
      // Remove AI video unless full pipeline
      delete availableAssets['video-clips'];
      delete availableAssets['blog-video'];
    }

    this.config.assetTypes = await this.promptChoice(
      'Select asset types to generate:',
      availableAssets,
      true
    );

    console.log(`\n✓ Asset Types: ${this.config.assetTypes.map(t => ASSET_TYPES[t].name).join(', ')}`);

    // Ask about video specifics if video selected
    if (this.config.assetTypes.includes('video-clips')) {
      console.log('\nVideo clip options:');
      this.config.videoSceneType = await this.promptChoice(
        'What type of video scenes?',
        {
          'dealership-scenes': { name: 'Dealership Scenes', description: 'Service bay, lot, showroom' },
          'before-after': { name: 'Before/After', description: 'Problem vs solution comparison' },
          'product-demo': { name: 'Product Demo Feel', description: 'App/dashboard focused' },
        }
      );

      this.config.videoCount = await this.promptNumber(
        'How many video clips?',
        2,
        1,
        5
      );

      console.log(`\n✓ Video: ${this.config.videoCount} ${this.config.videoSceneType} clips`);
    }
  }

  async askScheduling() {
    console.log('\n🗓️  STEP 10: SCHEDULING');

    this.config.scheduling = await this.promptChoice(
      'When should this content be published?',
      SCHEDULING
    );

    if (this.config.scheduling === 'scheduled') {
      console.log('\nEnter schedule date/time (YYYY-MM-DD HH:MM or relative like "next Monday 9am"):');
      this.config.scheduleDate = await this.prompt('Schedule: ');
    }

    console.log(`\n✓ Scheduling: ${SCHEDULING[this.config.scheduling].name}`);
    if (this.config.scheduleDate) {
      console.log(`  Date: ${this.config.scheduleDate}`);
    }
  }

  async askCampaignName() {
    console.log('\n✏️  STEP 11: CAMPAIGN NAME');

    const autoName = this.generateCampaignName();
    console.log(`\nSuggested name: "${autoName}"`);

    const useAuto = await this.promptYesNo('Use this name?', true);

    if (useAuto) {
      this.config.campaignName = autoName;
    } else {
      this.config.campaignName = await this.prompt('Enter campaign name: ');
    }

    console.log(`\n✓ Campaign Name: ${this.config.campaignName}`);
  }

  generateCampaignName() {
    const date = new Date().toISOString().slice(0, 7);
    const product = PRODUCTS[this.config.product].name;
    const persona = PERSONAS[this.config.persona].name.split(' ')[0];
    const context = PROMO_CONTEXTS[this.config.promoContext].name;

    return `${date} ${product} - ${persona} - ${context}`;
  }

  // ============================================
  // Game Plan
  // ============================================

  async showGamePlan() {
    console.log('\n' + '='.repeat(60));
    console.log('   📋 CAMPAIGN GAME PLAN');
    console.log('='.repeat(60));

    console.log('\n📌 CAMPAIGN OVERVIEW');
    console.log('-'.repeat(40));
    console.log(`   Name:          ${this.config.campaignName}`);
    console.log(`   Product:       ${PRODUCTS[this.config.product].name}`);
    console.log(`   Audience:      ${PERSONAS[this.config.persona].name}`);
    console.log(`   Proof Point:   ${this.config.proofPoint}`);
    console.log(`   Context:       ${PROMO_CONTEXTS[this.config.promoContext].name}`);

    console.log('\n🎯 MESSAGING');
    console.log('-'.repeat(40));
    if (this.config.customHook) {
      console.log(`   Angle:         Custom`);
      console.log(`   Hook:          "${this.config.customHook}"`);
    } else {
      console.log(`   Angle:         ${ANGLES[this.config.angle].name}`);
      console.log(`   Hook:          "${ANGLES[this.config.angle].hook}"`);
    }

    console.log('\n📦 CONTENT TO GENERATE');
    console.log('-'.repeat(40));

    const contentList = [];

    if (this.config.platforms.includes('landing-page')) {
      contentList.push('   • Landing Page (HubSpot)');
    }
    if (this.config.platforms.includes('blog')) {
      contentList.push('   • Blog Post (HubSpot)');
    }
    if (this.config.hasHubSpotEmail) {
      contentList.push(`   • Email Sequence - HubSpot (${this.config.emailCount} emails)`);
    }
    if (this.config.hasMailchimpEmail) {
      contentList.push(`   • Email Campaign - Mailchimp (${this.config.emailCount} emails)`);
    }
    if (this.config.platforms.includes('linkedin-posts')) {
      contentList.push(`   • LinkedIn Posts (${this.config.socialPostCount} posts)`);
    }
    if (this.config.platforms.includes('linkedin-article')) {
      contentList.push('   • LinkedIn Article');
    }
    if (this.config.platforms.includes('facebook')) {
      contentList.push(`   • Facebook Posts (${this.config.socialPostCount} posts)`);
    }
    if (this.config.platforms.includes('press-release')) {
      contentList.push('   • Press Release');
    }
    if (this.config.platforms.includes('one-pager')) {
      contentList.push('   • One-Pager / Sales Collateral');
    }

    console.log(contentList.join('\n'));

    if (this.config.abTesting) {
      console.log(`\n   🧪 A/B Testing: ${this.config.abVariations} subject line variations`);
    }

    // Asset Generation Section
    if (this.config.assetSource !== 'none' && this.config.assetTypes && this.config.assetTypes.length > 0) {
      console.log('\n🖼️  ASSETS TO GENERATE');
      console.log('-'.repeat(40));
      console.log(`   Pipeline:      ${ASSET_SOURCES[this.config.assetSource].name}`);

      this.config.assetTypes.forEach(type => {
        console.log(`   • ${ASSET_TYPES[type].name}`);
      });

      if (this.config.videoSceneType) {
        console.log(`   Video Type:    ${this.config.videoSceneType}`);
        console.log(`   Video Count:   ${this.config.videoCount} clips`);
      }
    }

    console.log('\n📅 SCHEDULING');
    console.log('-'.repeat(40));
    console.log(`   Mode:          ${SCHEDULING[this.config.scheduling].name}`);
    if (this.config.scheduleDate) {
      console.log(`   Date:          ${this.config.scheduleDate}`);
    }
    console.log(`   Output:        Files generated for review (human publishes)`);

    console.log('\n' + '='.repeat(60));

    return await this.promptYesNo('\n🚀 Generate this campaign?', true);
  }

  // ============================================
  // Generate Campaign
  // ============================================

  async generateCampaign() {
    console.log('\n⏳ Generating campaign content...\n');

    // Build content types array
    const contentTypes = [];

    if (this.config.platforms.includes('landing-page')) {
      contentTypes.push('landing-page');
    }
    if (this.config.platforms.includes('blog')) {
      contentTypes.push('blog-post');
    }
    if (this.config.platforms.includes('linkedin-posts')) {
      contentTypes.push('linkedin-post');
    }
    if (this.config.platforms.includes('linkedin-article')) {
      contentTypes.push('linkedin-article');
    }
    if (this.config.platforms.includes('facebook')) {
      contentTypes.push('facebook-post');
    }
    if (this.config.hasEmail) {
      contentTypes.push('email-sequence');
    }
    if (this.config.platforms.includes('press-release')) {
      contentTypes.push('press-release');
    }
    if (this.config.platforms.includes('one-pager')) {
      contentTypes.push('one-pager');
    }

    // Generate campaign ID
    const campaignId = this.config.campaignName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Build config for generator
    const generatorConfig = {
      campaignId,
      campaignName: this.config.campaignName,
      product: this.config.product,
      angle: this.config.angle === 'custom' ? 'saturday-chaos' : this.config.angle, // Fallback for generator
      persona: this.config.persona,
      contentTypes,
      emailCount: this.config.emailCount || 5,
      socialPostCount: this.config.socialPostCount || 3,
      emailType: this.config.emailType,
      promoContext: this.config.promoContext,
      abTesting: this.config.abTesting,
      abVariations: this.config.abVariations,
      customHook: this.config.customHook,
      proofPoint: this.config.proofPoint,
      scheduling: this.config.scheduling,
      scheduleDate: this.config.scheduleDate,
      platforms: this.config.platforms,
      // Asset generation config
      assetSource: this.config.assetSource,
      assetTypes: this.config.assetTypes || [],
      videoSceneType: this.config.videoSceneType,
      videoCount: this.config.videoCount,
    };

    try {
      const result = await generateCampaign(generatorConfig);

      this.printSuccess(result);
    } catch (error) {
      console.error('\n❌ Error generating campaign:', error.message);
    }
  }

  printSuccess(result) {
    console.log('\n' + '='.repeat(60));
    console.log('   ✅ CAMPAIGN GENERATED SUCCESSFULLY');
    console.log('='.repeat(60));

    console.log(`\n📁 Campaign Directory:`);
    console.log(`   ${result.campaignDir}`);

    console.log(`\n📄 Manifest:`);
    console.log(`   ${result.manifestPath}`);

    console.log('\n📋 NEXT STEPS:');
    console.log('-'.repeat(40));
    console.log('   1. Review generated content in the campaign directory');
    console.log('   2. Edit content as needed');
    console.log('   3. When ready, publish using:');

    if (this.config.platforms.includes('landing-page') || this.config.platforms.includes('blog')) {
      console.log(`\n   HubSpot:`);
      console.log(`   node scripts/hubspot/publish-page.js ${result.manifestPath}`);
    }

    if (this.config.hasMailchimpEmail) {
      console.log(`\n   Mailchimp:`);
      console.log(`   node scripts/mailchimp/publish-campaign.js ${result.manifestPath} --all`);
    }

    if (this.config.platforms.includes('linkedin-posts')) {
      console.log(`\n   LinkedIn:`);
      console.log(`   node scripts/linkedin/publish-post.js ${result.manifestPath} --all`);
    }

    if (this.config.platforms.includes('facebook')) {
      console.log(`\n   Facebook:`);
      console.log(`   node scripts/facebook/publish-post.js ${result.manifestPath} --all`);
    }

    // Asset generation instructions
    if (this.config.assetSource !== 'none' && this.config.assetTypes && this.config.assetTypes.length > 0) {
      console.log(`\n   Generate Assets:`);
      console.log(`   node scripts/assets/asset-generator.js ${result.manifestPath}`);

      if (this.config.assetTypes.includes('video-clips') || this.config.assetTypes.includes('blog-video')) {
        console.log(`\n   ⚠️  Video generation requires API credits:`);
        console.log(`      - Runway ML (video-clips): ~$0.05/second`);
        console.log(`      - Lumen5 (blog-video): Check plan limits`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('   Happy campaigning! 🚀');
    console.log('='.repeat(60) + '\n');
  }
}

// ============================================
// Main
// ============================================

if (require.main === module) {
  const builder = new CampaignBuilder();
  builder.run();
}

module.exports = CampaignBuilder;
