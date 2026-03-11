/**
 * Publish Blog Post to HubSpot
 *
 * Takes a campaign manifest and markdown file, creates/updates blog post in HubSpot.
 * Converts markdown to HTML before publishing.
 *
 * Usage:
 *   node publish-blog.js <manifest-path>
 *   node publish-blog.js campaigns/2024-03-key-tracking/manifest.json
 */

const fs = require('fs');
const path = require('path');
const HubSpotClient = require('./hubspot-client');

/**
 * Simple markdown to HTML converter
 * For production, use a proper library like marked or showdown
 */
function markdownToHtml(markdown) {
  let html = markdown;

  // Remove YAML frontmatter
  html = html.replace(/^---[\s\S]*?---\n*/m, '');

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Code blocks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```\w*\n?/g, '').trim();
    return `<pre><code>${code}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Paragraphs (simple: double newlines become paragraph breaks)
  html = html.replace(/\n\n+/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');

  return html;
}

/**
 * Read and parse campaign manifest
 */
function readManifest(manifestPath) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(content);
}

/**
 * Extract YAML frontmatter from markdown
 */
function extractFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  }

  return frontmatter;
}

/**
 * Create or update blog post in HubSpot
 */
async function publishBlog(manifestPath, options = {}) {
  const { dryRun = false, publish = false } = options;

  // Read manifest
  const manifest = readManifest(manifestPath);
  const campaignDir = path.dirname(manifestPath);

  // Find blog post in content list
  const blogPost = manifest.content.find(c => c.type === 'blog-post');
  if (!blogPost) {
    throw new Error('No blog post found in manifest');
  }

  // Read markdown file
  const mdPath = path.join(campaignDir, blogPost.file);
  const markdown = fs.readFileSync(mdPath, 'utf8');
  const frontmatter = extractFrontmatter(markdown);

  // Convert to HTML
  const postBody = markdownToHtml(markdown);

  // Prepare blog post data
  const postData = {
    name: blogPost.title || manifest.campaign_name,
    slug: blogPost.slug || manifest.campaign_id,
    htmlTitle: blogPost.seo?.title_tag || `${blogPost.title} | Mobile Dealer Data`,
    metaDescription: blogPost.seo?.meta_description || '',
    postBody: postBody,
    contentGroupId: process.env.HUBSPOT_BLOG_ID || '123456789', // Blog ID from HubSpot
    state: 'DRAFT',
  };

  console.log('Blog Post Data:');
  console.log({
    ...postData,
    postBody: postData.postBody.substring(0, 200) + '...',
  });

  if (dryRun) {
    console.log('\n[DRY RUN] Would create/update blog post with above data');
    console.log('\nFull HTML Preview:');
    console.log(postBody);
    return { success: true, dryRun: true };
  }

  // Create HubSpot client
  const client = new HubSpotClient();

  // Check if post exists
  let existingPost = null;
  try {
    const posts = await client.listBlogPosts(100);
    existingPost = posts.objects?.find(p => p.slug === postData.slug);
  } catch (error) {
    console.log('Could not check for existing posts:', error.message);
  }

  let result;
  if (existingPost) {
    console.log(`\nUpdating existing post: ${existingPost.id}`);
    result = await client.updateBlogPost(existingPost.id, postData);
  } else {
    console.log('\nCreating new blog post...');
    result = await client.createBlogPost(postData);
  }

  console.log('Blog post created/updated:', result.id);

  // Publish if requested
  if (publish && result.id) {
    console.log('Publishing blog post...');
    await client.publishBlogPost(result.id);
    console.log('Blog post published!');
  }

  // Update manifest with post ID
  manifest.hubspot = manifest.hubspot || {};
  manifest.hubspot.blog_post_id = result.id;
  manifest.hubspot.blog_post_url = `https://mdd.io/blog/${postData.slug}`;
  manifest.hubspot.last_updated = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated with HubSpot blog post ID');

  return {
    success: true,
    postId: result.id,
    postUrl: manifest.hubspot.blog_post_url,
  };
}

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node publish-blog.js <manifest-path> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run    Show what would be done without making changes');
    console.log('  --publish    Publish the post after creating/updating');
    console.log('');
    console.log('Example:');
    console.log('  node publish-blog.js campaigns/2024-03-key-tracking/manifest.json --publish');
    process.exit(1);
  }

  const manifestPath = args[0];
  const options = {
    dryRun: args.includes('--dry-run'),
    publish: args.includes('--publish'),
  };

  publishBlog(manifestPath, options)
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { publishBlog, markdownToHtml };
