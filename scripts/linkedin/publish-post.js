/**
 * Publish LinkedIn Post
 *
 * Takes a campaign manifest and post content, publishes to LinkedIn company page.
 *
 * Usage:
 *   node publish-post.js <manifest-path>
 *   node publish-post.js campaigns/2024-03-key-tracking/manifest.json
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
 * Extract post content from markdown file
 */
function extractPostContent(mdContent) {
  // Remove YAML frontmatter
  let content = mdContent.replace(/^---[\s\S]*?---\n*/m, '');

  // Remove markdown comments
  content = content.replace(/<!--[\s\S]*?-->/g, '');

  // Remove template sections (headers with instructions)
  content = content.replace(/^## .*\n/gm, '');
  content = content.replace(/^### .*\n/gm, '');

  // Find the first actual content block (between code fences if present)
  const codeBlockMatch = content.match(/```\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    content = codeBlockMatch[1];
  }

  // Clean up extra whitespace
  content = content.trim();
  content = content.replace(/\n{3,}/g, '\n\n');

  return content;
}

/**
 * Extract hashtags from content or metadata
 */
function extractHashtags(content, metadata) {
  // Check for hashtags in metadata
  if (metadata.hashtags) {
    return metadata.hashtags.split(',').map(h => h.trim());
  }

  // Extract hashtags from content
  const hashtagMatch = content.match(/#\w+/g);
  return hashtagMatch || [];
}

/**
 * Publish post to LinkedIn
 */
async function publishPost(manifestPath, options = {}) {
  const { dryRun = false, postIndex = 0 } = options;

  // Read manifest
  const manifest = readManifest(manifestPath);
  const campaignDir = path.dirname(manifestPath);

  // Find LinkedIn post in content list
  const linkedinPosts = manifest.content.filter(c => c.type === 'linkedin-post');
  if (linkedinPosts.length === 0) {
    throw new Error('No LinkedIn post found in manifest');
  }

  const linkedinPost = linkedinPosts[postIndex];
  if (!linkedinPost) {
    throw new Error(`LinkedIn post at index ${postIndex} not found`);
  }

  // Read post content
  const postPath = path.join(campaignDir, linkedinPost.file);
  const mdContent = fs.readFileSync(postPath, 'utf8');
  const postText = extractPostContent(mdContent);

  // Extract metadata
  const metadata = {};
  const frontmatterMatch = mdContent.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    frontmatterMatch[1].split('\n').forEach(line => {
      const [key, ...value] = line.split(':');
      if (key && value.length) {
        metadata[key.trim()] = value.join(':').trim();
      }
    });
  }

  const hashtags = extractHashtags(mdContent, metadata);
  const linkUrl = linkedinPost.link_url || manifest.landing_page_url;

  console.log('LinkedIn Post Data:');
  console.log({
    text: postText.substring(0, 200) + (postText.length > 200 ? '...' : ''),
    characterCount: postText.length,
    hashtags,
    linkUrl,
  });

  if (dryRun) {
    console.log('\n[DRY RUN] Would publish post with above content');
    console.log('\nFull Post Text:');
    console.log(postText);
    return { success: true, dryRun: true };
  }

  // Create LinkedIn client
  const client = new LinkedInClient();

  // Format post text with hashtags
  const formattedText = client.formatPostText(postText, hashtags);

  let result;
  if (linkUrl) {
    console.log('\nPublishing post with link preview...');
    result = await client.createPostWithLink(formattedText, linkUrl, {
      linkTitle: manifest.campaign_name,
    });
  } else {
    console.log('\nPublishing text post...');
    result = await client.createPost(formattedText);
  }

  console.log('Post published successfully!');

  // Update manifest with post info
  manifest.linkedin = manifest.linkedin || {};
  manifest.linkedin.posts = manifest.linkedin.posts || [];
  manifest.linkedin.posts.push({
    published_at: new Date().toISOString(),
    post_urn: result.id || result.value?.urn,
  });
  manifest.linkedin.last_updated = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated with LinkedIn post info');

  return {
    success: true,
    postUrn: result.id || result.value?.urn,
  };
}

/**
 * Publish all LinkedIn posts from a campaign
 */
async function publishAllPosts(manifestPath, options = {}) {
  const manifest = readManifest(manifestPath);
  const linkedinPosts = manifest.content.filter(c => c.type === 'linkedin-post');

  console.log(`Found ${linkedinPosts.length} LinkedIn posts to publish`);

  const results = [];
  for (let i = 0; i < linkedinPosts.length; i++) {
    console.log(`\nPublishing post ${i + 1} of ${linkedinPosts.length}...`);
    try {
      const result = await publishPost(manifestPath, { ...options, postIndex: i });
      results.push(result);

      // Wait between posts to avoid rate limiting
      if (i < linkedinPosts.length - 1) {
        console.log('Waiting 5 seconds before next post...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`Error publishing post ${i + 1}:`, error.message);
      results.push({ success: false, error: error.message });
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
    console.log('Usage: node publish-post.js <manifest-path> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run     Show what would be done without making changes');
    console.log('  --all         Publish all LinkedIn posts in the campaign');
    console.log('  --index <n>   Publish only the post at index n (default: 0)');
    console.log('');
    console.log('Example:');
    console.log('  node publish-post.js campaigns/2024-03-key-tracking/manifest.json');
    console.log('  node publish-post.js campaigns/2024-03-key-tracking/manifest.json --all');
    process.exit(1);
  }

  const manifestPath = args[0];
  const dryRun = args.includes('--dry-run');
  const publishAll = args.includes('--all');

  const indexArg = args.indexOf('--index');
  const postIndex = indexArg !== -1 ? parseInt(args[indexArg + 1], 10) : 0;

  const options = { dryRun, postIndex };

  const publishFn = publishAll ? publishAllPosts : publishPost;

  publishFn(manifestPath, options)
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      const success = Array.isArray(result)
        ? result.every(r => r.success)
        : result.success;
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { publishPost, publishAllPosts };
