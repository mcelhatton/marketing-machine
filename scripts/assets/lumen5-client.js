/**
 * Lumen5 API Client
 *
 * Convert blog posts and text content to marketing videos.
 * Used for LinkedIn video content, explainer videos.
 *
 * @requires LUMEN5_API_KEY environment variable
 * API Docs: https://lumen5.com/api/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class Lumen5Client {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.LUMEN5_API_KEY;
    this.baseUrl = 'api.lumen5.com';

    if (!this.apiKey) {
      throw new Error('LUMEN5_API_KEY is required');
    }
  }

  /**
   * Make authenticated request to Lumen5 API
   */
  async request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: `/v1${path}`,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = body ? JSON.parse(body) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(new Error(`Lumen5 API Error: ${res.statusCode} - ${JSON.stringify(response)}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  // ============================================
  // Video Creation Methods
  // ============================================

  /**
   * Create video from URL (blog post)
   */
  async createVideoFromUrl(url, options = {}) {
    const {
      format = 'landscape', // landscape, square, portrait
      templateId = null,
    } = options;

    const data = {
      url: url,
      format: format,
    };

    if (templateId) data.template_id = templateId;

    return this.request('POST', '/videos', data);
  }

  /**
   * Create video from text content
   */
  async createVideoFromText(content, options = {}) {
    const {
      title,
      slides = [],
      format = 'landscape',
      templateId = null,
      music = true,
      voiceover = false,
    } = options;

    // If slides not provided, create from content
    const videoSlides = slides.length > 0 ? slides : this.contentToSlides(content, title);

    const data = {
      format: format,
      slides: videoSlides,
      music: music,
      voiceover: voiceover,
    };

    if (templateId) data.template_id = templateId;

    return this.request('POST', '/videos', data);
  }

  /**
   * Convert text content to slides
   */
  contentToSlides(content, title) {
    const slides = [];

    // Title slide
    if (title) {
      slides.push({
        type: 'title',
        text: title,
      });
    }

    // Split content into sentences/paragraphs
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s.length < 200);

    // Create slides from sentences (max 8 content slides)
    const maxSlides = Math.min(sentences.length, 8);
    for (let i = 0; i < maxSlides; i++) {
      slides.push({
        type: 'content',
        text: sentences[i],
      });
    }

    // CTA slide
    slides.push({
      type: 'cta',
      text: 'Learn more at mdd.io',
    });

    return slides;
  }

  /**
   * Get video status
   */
  async getVideoStatus(videoId) {
    return this.request('GET', `/videos/${videoId}`);
  }

  /**
   * Wait for video to complete
   */
  async waitForVideo(videoId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getVideoStatus(videoId);

      if (status.status === 'completed' || status.status === 'ready') {
        return status;
      } else if (status.status === 'failed') {
        throw new Error('Video creation failed: ' + (status.error || 'Unknown error'));
      }

      console.log(`  Video status: ${status.status} (${status.progress || 0}%)`);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
    }

    throw new Error('Video creation timed out');
  }

  /**
   * Create and wait for video
   */
  async createAndWait(content, options = {}) {
    console.log('Creating video...');

    let video;
    if (options.url) {
      video = await this.createVideoFromUrl(options.url, options);
    } else {
      video = await this.createVideoFromText(content, options);
    }

    console.log(`Video creation started: ${video.id}`);
    const result = await this.waitForVideo(video.id);
    console.log(`Video ready: ${result.download_url}`);

    return result;
  }

  /**
   * List videos
   */
  async listVideos(limit = 20) {
    return this.request('GET', `/videos?limit=${limit}`);
  }

  /**
   * Get templates
   */
  async listTemplates() {
    return this.request('GET', '/templates');
  }

  // ============================================
  // MDD Video Generation Helpers
  // ============================================

  /**
   * Create video from MDD blog post content
   */
  async createBlogVideo(blogContent, options = {}) {
    const { title, body, proofPoint } = blogContent;

    // Extract key points for slides
    const slides = [
      { type: 'title', text: title },
    ];

    // Add key stats if available
    if (proofPoint) {
      slides.push({
        type: 'content',
        text: `${proofPoint.dealership}: ${proofPoint.metric}`,
        highlight: true,
      });
    }

    // Extract bullet points or key sentences
    const bulletMatch = body.match(/[•\-\*]\s*(.+)/g);
    if (bulletMatch) {
      bulletMatch.slice(0, 4).forEach(bullet => {
        slides.push({
          type: 'content',
          text: bullet.replace(/^[•\-\*]\s*/, ''),
        });
      });
    }

    // CTA slide
    slides.push({
      type: 'cta',
      text: 'See how it works at mdd.io',
    });

    return this.createAndWait(body, {
      title: title,
      slides: slides,
      format: options.format || 'landscape',
      ...options,
    });
  }

  /**
   * Create video from case study
   */
  async createCaseStudyVideo(caseStudy, options = {}) {
    const { dealership, challenge, solution, results, quote } = caseStudy;

    const slides = [
      { type: 'title', text: `How ${dealership} Transformed Their Operations` },
      { type: 'content', text: `The Challenge: ${challenge}` },
      { type: 'content', text: `The Solution: ${solution}` },
    ];

    // Add results
    if (Array.isArray(results)) {
      results.slice(0, 3).forEach(result => {
        slides.push({
          type: 'stat',
          text: result,
        });
      });
    }

    // Add quote if available
    if (quote) {
      slides.push({
        type: 'quote',
        text: `"${quote.text}" - ${quote.attribution}`,
      });
    }

    // CTA
    slides.push({
      type: 'cta',
      text: 'Get similar results at mdd.io',
    });

    return this.createAndWait('', {
      title: `${dealership} Case Study`,
      slides: slides,
      format: options.format || 'landscape',
      ...options,
    });
  }

  /**
   * Create LinkedIn video from post content
   */
  async createLinkedInVideo(postContent, options = {}) {
    // Extract hook (first 1-2 sentences)
    const sentences = postContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const hook = sentences.slice(0, 2).join('. ');
    const body = sentences.slice(2, 6).join('. ');

    const slides = [
      { type: 'hook', text: hook },
    ];

    // Add body content
    sentences.slice(2, 6).forEach(sentence => {
      if (sentence.trim().length > 10) {
        slides.push({ type: 'content', text: sentence.trim() });
      }
    });

    // CTA
    slides.push({
      type: 'cta',
      text: 'Learn more in the comments',
    });

    return this.createAndWait(postContent, {
      slides: slides,
      format: 'square', // Better for LinkedIn feed
      ...options,
    });
  }
}

// ============================================
// MDD Video Templates
// ============================================

const MDD_VIDEO_TEMPLATES = {
  'case-study': {
    slides: [
      { type: 'title', placeholder: '{{dealership}} Results' },
      { type: 'problem', placeholder: '{{challenge}}' },
      { type: 'solution', placeholder: '{{solution}}' },
      { type: 'stat', placeholder: '{{metric}}' },
      { type: 'cta', text: 'Get similar results at mdd.io' },
    ],
  },
  'stat-highlight': {
    slides: [
      { type: 'hook', placeholder: '{{hook}}' },
      { type: 'stat', placeholder: '{{stat}}' },
      { type: 'context', placeholder: '{{context}}' },
      { type: 'cta', text: 'See how at mdd.io' },
    ],
  },
  'before-after': {
    slides: [
      { type: 'title', text: 'Before vs After' },
      { type: 'before', placeholder: '{{before}}' },
      { type: 'after', placeholder: '{{after}}' },
      { type: 'result', placeholder: '{{result}}' },
      { type: 'cta', text: 'Transform your dealership' },
    ],
  },
  'quick-tip': {
    slides: [
      { type: 'hook', placeholder: '{{hook}}' },
      { type: 'tip', placeholder: '{{tip}}' },
      { type: 'proof', placeholder: '{{proof}}' },
      { type: 'cta', text: 'Learn more at mdd.io' },
    ],
  },
};

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new Lumen5Client();

  const commands = {
    'videos': async () => {
      const videos = await client.listVideos();
      console.log('Recent videos:');
      console.log(JSON.stringify(videos, null, 2));
    },
    'templates': async () => {
      const templates = await client.listTemplates();
      console.log('Available templates:');
      console.log(JSON.stringify(templates, null, 2));
    },
    'from-url': async () => {
      const url = args[1];
      if (!url) throw new Error('URL required');
      const result = await client.createAndWait('', { url });
      console.log('Video ready:', result.download_url);
    },
    'from-text': async () => {
      const text = args.slice(1).join(' ') || 'MDD helps dealerships find keys in seconds.';
      const result = await client.createAndWait(text, { title: 'MDD Marketing Video' });
      console.log('Video ready:', result.download_url);
    },
    'case-study': async () => {
      const result = await client.createCaseStudyVideo({
        dealership: 'Bill Brown Ford',
        challenge: 'Lost keys costing hours per day',
        solution: 'Real-time key and vehicle tracking',
        results: ['2,000+ vehicles tracked', '90% sales team adoption', 'Zero lost keys'],
        quote: {
          text: 'MDD instantly locates 2,000 vehicles on multiple lots',
          attribution: 'Dave Bird, Inventory Manager',
        },
      });
      console.log('Video ready:', result.download_url);
    },
  };

  if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node lumen5-client.js <command>');
    console.log('Commands:');
    console.log('  videos          - List recent videos');
    console.log('  templates       - List available templates');
    console.log('  from-url <url>  - Create video from blog URL');
    console.log('  from-text <txt> - Create video from text');
    console.log('  case-study      - Create case study video');
  }
}

module.exports = { Lumen5Client, MDD_VIDEO_TEMPLATES };
