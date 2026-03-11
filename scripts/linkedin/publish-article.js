/**
 * Publish LinkedIn Article
 *
 * Takes a campaign manifest and article content, creates a post linking to the article.
 * Note: LinkedIn does not have an API for creating native articles.
 * This script creates a post that links to the article on your website.
 *
 * Usage:
 *   node publish-article.js <manifest-path>
 *   node publish-article.js campaigns/2024-03-key-tracking/manifest.json
 */

const fs = require('fs');
const path = require('path');
const LinkedInClient = require('./linkedin-client');

/**
 * Read and parse campaign manifest
 */
function readManifest(manifestPath) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(content);
}

/**
 * Extract article metadata and create promotional post
 */
function createArticlePromoPost(articleContent, articleUrl, options = {}) {
  // Extract title from markdown
  const titleMatch = articleContent.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : options.title || 'New Article';

  // Extract first paragraph as teaser
  const contentWithoutFrontmatter = articleContent.replace(/^---[\s\S]*?---\n*/m, '');
  const contentWithoutTitle = contentWithoutFrontmatter.replace(/^#\s+.+\n*/m, '');

  // Get first meaningful paragraph
  const paragraphs = contentWithoutTitle.split(/\n\n+/);
  let teaser = '';

  for (const p of paragraphs) {
    const cleaned = p.replace(/^[#*-]\s*/gm, '').trim();
    if (cleaned.length > 50 && !cleaned.startsWith('<!--') && !cleaned.startsWith('```')) {
      teaser = cleaned;
      break;
    }
  }

  // Truncate teaser if needed
  if (teaser.length > 250) {
    teaser = teaser.substring(0, 247) + '...';
  }

  // Create promotional post text
  const postText = `${title}

${teaser}

Read the full article:`;

  return {
    text: postText,
    url: articleUrl,
    title: title,
    teaser: teaser,
  };
}

/**
 * Publish article promo post to LinkedIn
 */
async function publishArticle(manifestPath, options = {}) {
  const { dryRun = false } = options;

  // Read manifest
  const manifest = readManifest(manifestPath);
  const campaignDir = path.dirname(manifestPath);

  // Find LinkedIn article in content list
  const linkedinArticle = manifest.content.find(c => c.type === 'linkedin-article');
  if (!linkedinArticle) {
    throw new Error('No LinkedIn article found in manifest');
  }

  // Read article content
  const articlePath = path.join(campaignDir, linkedinArticle.file);
  const articleContent = fs.readFileSync(articlePath, 'utf8');

  // Determine article URL
  const articleUrl = linkedinArticle.published_url
    || manifest.hubspot?.blog_post_url
    || `https://mdd.io/blog/${manifest.campaign_id}`;

  // Create promotional post
  const promoPost = createArticlePromoPost(articleContent, articleUrl, {
    title: linkedinArticle.title,
  });

  // Extract hashtags from article
  const hashtagMatch = articleContent.match(/#[A-Za-z]\w+/g);
  const hashtags = hashtagMatch
    ? [...new Set(hashtagMatch.filter(h => h.length > 3 && h.length < 25))].slice(0, 5)
    : ['AutomotiveRetail', 'DealershipLife'];

  console.log('LinkedIn Article Promo Post:');
  console.log({
    title: promoPost.title,
    teaser: promoPost.teaser.substring(0, 100) + '...',
    url: promoPost.url,
    hashtags,
  });

  if (dryRun) {
    console.log('\n[DRY RUN] Would publish article promo post');
    console.log('\nFull Post Text:');
    console.log(promoPost.text);
    console.log('\nNote: LinkedIn does not have an API for native articles.');
    console.log('This creates a post linking to your article.');
    return { success: true, dryRun: true };
  }

  // Create LinkedIn client
  const client = new LinkedInClient();

  // Format post text with hashtags
  const formattedText = client.formatPostText(promoPost.text, hashtags);

  console.log('\nPublishing article promo post...');
  const result = await client.createPostWithLink(formattedText, promoPost.url, {
    linkTitle: promoPost.title,
    linkDescription: promoPost.teaser,
  });

  console.log('Article promo post published successfully!');

  // Update manifest with article info
  manifest.linkedin = manifest.linkedin || {};
  manifest.linkedin.article = {
    published_at: new Date().toISOString(),
    promo_post_urn: result.id || result.value?.urn,
    article_url: promoPost.url,
  };
  manifest.linkedin.last_updated = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated with LinkedIn article info');

  return {
    success: true,
    postUrn: result.id || result.value?.urn,
    articleUrl: promoPost.url,
  };
}

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node publish-article.js <manifest-path> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run    Show what would be done without making changes');
    console.log('');
    console.log('Note: LinkedIn does not have an API for creating native articles.');
    console.log('This script creates a promotional post linking to your article.');
    console.log('');
    console.log('Example:');
    console.log('  node publish-article.js campaigns/2024-03-key-tracking/manifest.json');
    process.exit(1);
  }

  const manifestPath = args[0];
  const options = {
    dryRun: args.includes('--dry-run'),
  };

  publishArticle(manifestPath, options)
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { publishArticle, createArticlePromoPost };
