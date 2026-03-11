/**
 * Runway ML API Client
 *
 * Generate AI video scenes for marketing content.
 * Used for short explainer clips and ad creatives.
 *
 * @requires RUNWAY_API_KEY environment variable
 * API Docs: https://docs.runwayml.com/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class RunwayClient {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.RUNWAY_API_KEY;
    this.baseUrl = 'api.runwayml.com';

    if (!this.apiKey) {
      throw new Error('RUNWAY_API_KEY is required');
    }
  }

  /**
   * Make authenticated request to Runway API
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
          'X-Runway-Version': '2024-01-01',
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
              reject(new Error(`Runway API Error: ${res.statusCode} - ${JSON.stringify(response)}`));
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
  // Text-to-Video Generation (Gen-3 Alpha)
  // ============================================

  /**
   * Generate video from text prompt
   */
  async generateVideo(prompt, options = {}) {
    const {
      duration = 5, // seconds (5 or 10)
      aspectRatio = '16:9', // 16:9, 9:16, 1:1
      seed = null,
    } = options;

    const data = {
      prompt: prompt,
      duration: duration,
      aspect_ratio: aspectRatio,
    };

    if (seed) data.seed = seed;

    return this.request('POST', '/generations', data);
  }

  /**
   * Generate video from image + prompt (Image-to-Video)
   */
  async generateVideoFromImage(imageUrl, prompt, options = {}) {
    const {
      duration = 5,
      aspectRatio = '16:9',
    } = options;

    return this.request('POST', '/generations', {
      prompt: prompt,
      image_url: imageUrl,
      duration: duration,
      aspect_ratio: aspectRatio,
      mode: 'image-to-video',
    });
  }

  /**
   * Get generation status
   */
  async getGenerationStatus(generationId) {
    return this.request('GET', `/generations/${generationId}`);
  }

  /**
   * Wait for generation to complete
   */
  async waitForGeneration(generationId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getGenerationStatus(generationId);

      if (status.status === 'completed') {
        return status;
      } else if (status.status === 'failed') {
        throw new Error('Generation failed: ' + (status.error || 'Unknown error'));
      }

      // Video generation takes time - wait 5 seconds between checks
      console.log(`  Generation status: ${status.status} (attempt ${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Generation timed out');
  }

  /**
   * Generate and wait for video
   */
  async generateAndWait(prompt, options = {}) {
    console.log(`Generating video: "${prompt.substring(0, 50)}..."`);

    const generation = await this.generateVideo(prompt, options);
    console.log(`Generation started: ${generation.id}`);

    const result = await this.waitForGeneration(generation.id);
    console.log(`Generation complete: ${result.output_url}`);

    return result;
  }

  // ============================================
  // MDD Video Generation Helpers
  // ============================================

  /**
   * Generate a dealership scene video
   */
  async generateDealershipScene(sceneType, options = {}) {
    const prompts = MDD_VIDEO_PROMPTS[sceneType];

    if (!prompts) {
      throw new Error(`Unknown scene type: ${sceneType}. Available: ${Object.keys(MDD_VIDEO_PROMPTS).join(', ')}`);
    }

    return this.generateAndWait(prompts.prompt, {
      duration: options.duration || prompts.duration || 5,
      aspectRatio: options.aspectRatio || '16:9',
    });
  }

  /**
   * Generate before/after comparison clips
   */
  async generateBeforeAfter(scenario, options = {}) {
    const beforeAfter = MDD_BEFORE_AFTER[scenario];

    if (!beforeAfter) {
      throw new Error(`Unknown scenario: ${scenario}`);
    }

    console.log('Generating "before" clip...');
    const before = await this.generateAndWait(beforeAfter.before, options);

    console.log('Generating "after" clip...');
    const after = await this.generateAndWait(beforeAfter.after, options);

    return {
      before: before,
      after: after,
      scenario: scenario,
    };
  }

  /**
   * Generate video storyboard (multiple scenes)
   */
  async generateStoryboard(scenes, options = {}) {
    const results = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      console.log(`\nGenerating scene ${i + 1}/${scenes.length}: ${scene.name || scene.prompt.substring(0, 30)}...`);

      const result = await this.generateAndWait(scene.prompt, {
        duration: scene.duration || options.duration || 5,
        aspectRatio: scene.aspectRatio || options.aspectRatio || '16:9',
      });

      results.push({
        scene: i + 1,
        name: scene.name,
        prompt: scene.prompt,
        ...result,
      });
    }

    return results;
  }
}

// ============================================
// MDD Video Prompts Library
// ============================================

const MDD_VIDEO_PROMPTS = {
  // Service Department Scenes
  'service-busy': {
    prompt: 'Busy automotive service department with multiple vehicles in service bays, technicians working, modern dealership interior, professional lighting, cinematic',
    duration: 5,
  },
  'service-waiting': {
    prompt: 'Customer waiting area at car dealership service department, people checking phones, service advisor at desk, clean modern interior',
    duration: 5,
  },
  'technician-searching': {
    prompt: 'Auto technician walking through dealership parking lot searching for a car, looking frustrated, holding clipboard, sunny day',
    duration: 5,
  },
  'technician-phone': {
    prompt: 'Auto technician looking at smartphone app showing vehicle location map, satisfied expression, service bay background',
    duration: 5,
  },

  // Key Tracking Scenes
  'keys-searching': {
    prompt: 'Car dealership employee searching through key board looking for specific key, slightly stressed expression, office background',
    duration: 5,
  },
  'keys-found': {
    prompt: 'Car dealership employee smiling while looking at phone app, holding car key, professional interior',
    duration: 5,
  },
  'key-handoff': {
    prompt: 'Car salesperson handing keys to happy customer at dealership, celebration moment, showroom background, warm lighting',
    duration: 5,
  },

  // Lot Management Scenes
  'lot-overview': {
    prompt: 'Aerial view of car dealership lot with many vehicles parked in rows, sunny day, cinematic drone shot',
    duration: 5,
  },
  'lot-walking': {
    prompt: 'Car salesperson and customer walking through dealership lot looking at vehicles, professional attire, daytime',
    duration: 5,
  },

  // Technology Scenes
  'dashboard-view': {
    prompt: 'Close-up of tablet or computer screen showing vehicle tracking dashboard with map interface, modern office background, soft focus',
    duration: 5,
  },
  'mobile-app': {
    prompt: 'Hand holding smartphone showing vehicle location tracking app with map and vehicle icons, dealership background blurred',
    duration: 5,
  },

  // Customer Experience
  'happy-customer': {
    prompt: 'Happy customer receiving car keys at dealership, shaking hands with salesperson, celebratory moment, showroom background',
    duration: 5,
  },
  'test-drive': {
    prompt: 'Customer getting into car for test drive at dealership, salesperson opening door, excited expression, sunny day',
    duration: 5,
  },
};

// ============================================
// Before/After Scenarios
// ============================================

const MDD_BEFORE_AFTER = {
  'key-search': {
    before: 'Frustrated car dealership employee searching through messy key board, stressed expression, papers scattered, chaotic office',
    after: 'Calm car dealership employee using smartphone to locate key instantly, satisfied smile, organized workspace',
  },
  'vehicle-find': {
    before: 'Car salesperson walking through large parking lot in rain searching for vehicle, looking at clipboard, frustrated',
    after: 'Car salesperson standing confidently next to correct vehicle, phone in hand showing location, sunny day',
  },
  'service-wait': {
    before: 'Customer looking at watch impatiently in service waiting area, clock on wall showing long wait time',
    after: 'Customer receiving text notification that car is ready, smiling, standing up to leave',
  },
  'customer-waiting': {
    before: 'Customer waiting awkwardly in dealership while multiple employees search for car key, checking time',
    after: 'Customer being handed keys immediately, happy expression, smooth transaction',
  },
};

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new RunwayClient();

  const commands = {
    'generate': async () => {
      const prompt = args.slice(1).join(' ') || 'Car dealership service department with vehicles';
      const result = await client.generateAndWait(prompt);
      console.log('Video URL:', result.output_url);
    },
    'scene': async () => {
      const sceneType = args[1] || 'service-busy';
      const result = await client.generateDealershipScene(sceneType);
      console.log('Video URL:', result.output_url);
    },
    'before-after': async () => {
      const scenario = args[1] || 'key-search';
      const result = await client.generateBeforeAfter(scenario);
      console.log('Before video:', result.before.output_url);
      console.log('After video:', result.after.output_url);
    },
    'scenes': async () => {
      console.log('Available scenes:');
      Object.entries(MDD_VIDEO_PROMPTS).forEach(([key, value]) => {
        console.log(`  ${key}: ${value.prompt.substring(0, 60)}...`);
      });
    },
  };

  if (commands[command]) {
    commands[command]().catch(console.error);
  } else {
    console.log('Usage: node runway-client.js <command>');
    console.log('Commands:');
    console.log('  generate <prompt>     - Generate video from prompt');
    console.log('  scene <type>          - Generate MDD dealership scene');
    console.log('  before-after <type>   - Generate before/after comparison');
    console.log('  scenes                - List available scene types');
  }
}

module.exports = { RunwayClient, MDD_VIDEO_PROMPTS, MDD_BEFORE_AFTER };
