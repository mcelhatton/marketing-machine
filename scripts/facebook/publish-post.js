/**
 * Publish Facebook Post
 *
 * Takes a campaign manifest and post content, publishes to Facebook page.
 *
 * Usage:
 *   node publish-post.js <manifest-path>
 *   node publish-post.js campaigns/2024-03-key-tracking/manifest.json
 */

const fs = require('fs');
const path = require('path');
const FacebookClient = require('./facebook-client');

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

  // Remove template sections (headers)
  content = content.replace(/^##+ .*\n/gm, '');

  // Find content between code fences if present
  const codeBlockMatch = content.match(/```\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    content = codeBlockMatch[1];
  }

  // Clean up
  content = content.trim();
  content = content.replace(/\n{3,}/g, '\n\n');

  return content;
}

/**
 * Extract hashtags from content
 */
function extractHashtags(content) {
  const hashtagMatch = content.match(/#[A-Za-z]\w+/g);
  if (hashtagMatch) {
    // Remove duplicates and filter
    return [...new Set(hashtagMatch)]
      .filter(h => h.length > 3 && h.length < 25)
      .slice(0, 3); // Facebook: fewer hashtags is better
  }
  return [];
}

/**
 * Publish post to Facebook
 */
async function publishPost(manifestPath, options = {}) {
  const { dryRun = false, postIndex = 0, schedule = null } = options;

  // Read manifest
  const manifest = readManifest(manifestPath);
  const campaignDir = path.dirname(manifestPath);

  // Find Facebook post in content list
  const facebookPosts = manifest.content.filter(c => c.type === 'facebook-post');
  if (facebookPosts.length === 0) {
    throw new Error('No Facebook post found in manifest');
  }

  const facebookPost = facebookPosts[postIndex];
  if (!facebookPost) {
    throw new Error(`Facebook post at index ${postIndex} not found`);
  }

  // Read post content
  const postPath = path.join(campaignDir, facebookPost.file);
  const mdContent = fs.readFileSync(postPath, 'utf8');
  const postText = extractPostContent(mdContent);

  const hashtags = extractHashtags(mdContent);
  const linkUrl = facebookPost.link_url || manifest.landing_page_url;

  console.log('Facebook Post Data:');
  console.log({
    text: postText.substring(0, 200) + (postText.length > 200 ? '...' : ''),
    characterCount: postText.length,
    hashtags,
    linkUrl,
    scheduled: schedule || 'immediate',
  });

  if (dryRun) {
    console.log('\n[DRY RUN] Would publish post with above content');
    console.log('\nFull Post Text:');
    console.log(postText);
    return { success: true, dryRun: true };
  }

  // Create Facebook client
  const client = new FacebookClient();

  // Format message
  const formattedMessage = client.formatMessage(postText, { hashtags, allowLong: true });

  let result;
  if (schedule) {
    console.log(`\nScheduling post for ${schedule}...`);
    result = await client.schedulePost(formattedMessage, schedule, linkUrl);
  } else if (linkUrl) {
    console.log('\nPublishing post with link...');
    result = await client.createPostWithLink(formattedMessage, linkUrl);
  } else {
    console.log('\nPublishing text post...');
    result = await client.createPost(formattedMessage);
  }

  console.log('Post published successfully!');

  // Update manifest with post info
  manifest.facebook = manifest.facebook || {};
  manifest.facebook.posts = manifest.facebook.posts || [];
  manifest.facebook.posts.push({
    published_at: schedule || new Date().toISOString(),
    post_id: result.id,
    scheduled: !!schedule,
  });
  manifest.facebook.last_updated = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated with Facebook post info');

  return {
    success: true,
    postId: result.id,
  };
}

/**
 * Publish all Facebook posts from a campaign
 */
async function publishAllPosts(manifestPath, options = {}) {
  const manifest = readManifest(manifestPath);
  const facebookPosts = manifest.content.filter(c => c.type === 'facebook-post');

  console.log(`Found ${facebookPosts.length} Facebook posts to publish`);

  const results = [];
  for (let i = 0; i < facebookPosts.length; i++) {
    console.log(`\nPublishing post ${i + 1} of ${facebookPosts.length}...`);
    try {
      const result = await publishPost(manifestPath, { ...options, postIndex: i });
      results.push(result);

      // Wait between posts
      if (i < facebookPosts.length - 1) {
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
    console.log('  --dry-run          Show what would be done without making changes');
    console.log('  --all              Publish all Facebook posts in the campaign');
    console.log('  --index <n>        Publish only the post at index n (default: 0)');
    console.log('  --schedule <time>  Schedule post for future (ISO 8601 format)');
    console.log('');
    console.log('Example:');
    console.log('  node publish-post.js campaigns/2024-03-key-tracking/manifest.json');
    console.log('  node publish-post.js campaigns/2024-03-key-tracking/manifest.json --all');
    console.log('  node publish-post.js campaigns/2024-03-key-tracking/manifest.json --schedule "2024-03-20T09:00:00Z"');
    process.exit(1);
  }

  const manifestPath = args[0];
  const dryRun = args.includes('--dry-run');
  const publishAll = args.includes('--all');

  const indexArg = args.indexOf('--index');
  const postIndex = indexArg !== -1 ? parseInt(args[indexArg + 1], 10) : 0;

  const scheduleArg = args.indexOf('--schedule');
  const schedule = scheduleArg !== -1 ? args[scheduleArg + 1] : null;

  const options = { dryRun, postIndex, schedule };

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
