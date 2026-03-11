/**
 * Publish Landing Page to HubSpot
 *
 * Takes a campaign manifest and HTML file, creates/updates page in HubSpot CMS.
 *
 * Usage:
 *   node publish-page.js <manifest-path>
 *   node publish-page.js campaigns/2024-03-key-tracking/manifest.json
 */

const fs = require('fs');
const path = require('path');
const HubSpotClient = require('./hubspot-client');

/**
 * Read and parse campaign manifest
 */
function readManifest(manifestPath) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(content);
}

/**
 * Read HTML content from file
 */
function readHtmlFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Extract metadata from HTML comments
 */
function extractMetadata(html) {
  const metaMatch = html.match(/<!--\s*([\s\S]*?)\s*-->/);
  if (!metaMatch) return {};

  const metadata = {};
  const lines = metaMatch[1].split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      metadata[cleanKey] = valueParts.join(':').trim();
    }
  }

  return metadata;
}

/**
 * Create or update page in HubSpot
 */
async function publishPage(manifestPath, options = {}) {
  const { dryRun = false, publish = false } = options;

  // Read manifest
  const manifest = readManifest(manifestPath);
  const campaignDir = path.dirname(manifestPath);

  // Find landing page in content list
  const landingPage = manifest.content.find(c => c.type === 'landing-page');
  if (!landingPage) {
    throw new Error('No landing page found in manifest');
  }

  // Read HTML file
  const htmlPath = path.join(campaignDir, landingPage.file);
  const html = readHtmlFile(htmlPath);
  const metadata = extractMetadata(html);

  // Prepare page data
  const pageData = {
    name: manifest.campaign_name,
    slug: landingPage.slug || manifest.campaign_id,
    htmlTitle: landingPage.seo?.title_tag || `${manifest.campaign_name} | Mobile Dealer Data`,
    metaDescription: landingPage.seo?.meta_description || '',
    templatePath: `mdd-theme-review/templates/${metadata.templatetype === 'page' ? 'campaign-launch' : 'product-feature'}.html`,
    state: 'DRAFT',
  };

  console.log('Page Data:');
  console.log(JSON.stringify(pageData, null, 2));

  if (dryRun) {
    console.log('\n[DRY RUN] Would create/update page with above data');
    return { success: true, dryRun: true };
  }

  // Create HubSpot client
  const client = new HubSpotClient();

  // Check if page exists
  let existingPage = null;
  try {
    const pages = await client.listPages(100);
    existingPage = pages.objects?.find(p => p.slug === pageData.slug);
  } catch (error) {
    console.log('Could not check for existing pages:', error.message);
  }

  let result;
  if (existingPage) {
    console.log(`\nUpdating existing page: ${existingPage.id}`);
    result = await client.updatePage(existingPage.id, pageData);
  } else {
    console.log('\nCreating new page...');
    result = await client.createPage(pageData);
  }

  console.log('Page created/updated:', result.id);

  // Publish if requested
  if (publish && result.id) {
    console.log('Publishing page...');
    await client.publishPage(result.id);
    console.log('Page published!');
  }

  // Update manifest with page ID
  manifest.hubspot = manifest.hubspot || {};
  manifest.hubspot.page_id = result.id;
  manifest.hubspot.page_url = `https://585393.hs-sites.com/${pageData.slug}`;
  manifest.hubspot.last_updated = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated with HubSpot page ID');

  return {
    success: true,
    pageId: result.id,
    pageUrl: manifest.hubspot.page_url,
  };
}

/**
 * Batch publish multiple pages
 */
async function batchPublish(manifestPaths, options = {}) {
  const results = [];

  for (const manifestPath of manifestPaths) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Processing: ${manifestPath}`);
    console.log('='.repeat(50));

    try {
      const result = await publishPage(manifestPath, options);
      results.push({ path: manifestPath, ...result });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      results.push({ path: manifestPath, success: false, error: error.message });
    }
  }

  return results;
}

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node publish-page.js <manifest-path> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run    Show what would be done without making changes');
    console.log('  --publish    Publish the page after creating/updating');
    console.log('');
    console.log('Example:');
    console.log('  node publish-page.js campaigns/2024-03-key-tracking/manifest.json --publish');
    process.exit(1);
  }

  const manifestPath = args[0];
  const options = {
    dryRun: args.includes('--dry-run'),
    publish: args.includes('--publish'),
  };

  publishPage(manifestPath, options)
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { publishPage, batchPublish };
