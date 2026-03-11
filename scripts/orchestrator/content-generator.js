/**
 * Content Generator
 *
 * Generates content based on templates and campaign configuration.
 * Uses the knowledge base and templates to create campaign-specific content.
 */

const fs = require('fs');
const path = require('path');

// Knowledge base paths
const RULES_DIR = path.join(process.cwd(), '.claude', 'rules');
const TEMPLATES_DIR = path.join(process.cwd(), 'templates');
const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');

/**
 * Load rules file content
 */
function loadRules(filename) {
  const filePath = path.join(RULES_DIR, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return null;
}

/**
 * Load template content
 */
function loadTemplate(templatePath) {
  const filePath = path.join(TEMPLATES_DIR, templatePath);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  throw new Error(`Template not found: ${templatePath}`);
}

/**
 * Product configurations
 */
const PRODUCTS = {
  'key-tracking': {
    name: 'Key Tracking',
    tag: 'MDD Locate',
    headline: 'Find any key in seconds.',
    proof: {
      dealership: 'Bill Brown Ford',
      metric: '2,000+ vehicles tracked',
      quote: 'MDD instantly locates 2,000 vehicles on multiple lots all over town.',
    },
  },
  'lot-management': {
    name: 'Lot Management',
    tag: 'MDD Locate',
    headline: 'Know where every vehicle is.',
    proof: {
      dealership: 'Bill Brown Ford',
      metric: 'Sub-foot accuracy',
      quote: 'We get cars customer-delivered without delays.',
    },
  },
  'service-workflow': {
    name: 'Service Workflow',
    tag: 'Service Workflow',
    headline: 'Eliminate service bottlenecks.',
    proof: {
      dealership: 'Corwin Toyota',
      metric: '64% out in 60 minutes',
      quote: 'With this cycle time tool, we know at the 40-minute mark if there\'s an issue.',
    },
  },
  'recon-workflow': {
    name: 'Recon Workflow',
    tag: 'Recon Workflow',
    headline: 'Accelerate time-to-line.',
    proof: {
      dealership: 'Longo Toyota',
      metric: '3 days saved per car',
      quote: 'We cut days from our average time-to-line.',
    },
  },
  'vehiclevault': {
    name: 'VehicleVault',
    tag: 'VehicleVault F&I',
    headline: 'Turn every sale into recurring revenue.',
    proof: {
      dealership: 'Brandon Honda',
      metric: '$308K/month F&I revenue',
      quote: 'Zero chargebacks across all MDD dealers.',
    },
  },
  'full-platform': {
    name: 'Full Platform',
    tag: 'Mobile Dealer Data',
    headline: 'One platform. Total visibility.',
    proof: {
      dealership: 'Bill Brown Ford',
      metric: '500+ dealerships',
      quote: 'MDD instantly locates 2,000 vehicles on multiple lots all over town.',
    },
  },
};

/**
 * Messaging angles
 */
const ANGLES = {
  'saturday-chaos': {
    name: 'Saturday Chaos',
    scenario: 'It\'s Saturday at 11:30am. A customer is ready to buy. Nobody can find the key.',
    pain: 'Three employees searching the lot. Customer waiting. Deal dying.',
  },
  'inventory-cashflow': {
    name: 'Inventory Cashflow',
    scenario: 'Every day a car sits in recon is cash sitting on the lot.',
    pain: 'No visibility into where the bottlenecks are. Holding costs piling up.',
  },
  'service-revenue': {
    name: 'Service Revenue',
    scenario: 'Express service wait times hitting 2.5 hours.',
    pain: 'Customers leaving for quick-lube competitors. CSI scores suffering.',
  },
  'lost-key-cost': {
    name: 'Lost Key Cost',
    scenario: 'Quick question. What did the last lost key cost to replace?',
    pain: '$200-500 per key. Plus the time. Plus the lost deal.',
  },
  'vehiclevault-profit': {
    name: 'VehicleVault Profit',
    scenario: '$308,000 per month. That\'s how much one dealership generates.',
    pain: 'Most F&I products have high chargebacks. Low customer engagement.',
  },
};

/**
 * Persona configurations
 */
const PERSONAS = {
  'owner': { name: 'Owner', title: 'Dealer Principal' },
  'gm': { name: 'GM', title: 'General Manager' },
  'service-manager': { name: 'Service Manager', title: 'Service Director' },
  'sales-manager': { name: 'Sales Manager', title: 'Sales Manager' },
  'fi-manager': { name: 'F&I Manager', title: 'F&I Director' },
  'used-car-manager': { name: 'Used Car Manager', title: 'Used Car Manager' },
};

class ContentGenerator {
  constructor(config) {
    this.config = config;
    this.product = PRODUCTS[config.product];
    this.angle = ANGLES[config.angle];
    this.persona = PERSONAS[config.persona];

    if (!this.product) throw new Error(`Unknown product: ${config.product}`);
    if (!this.angle) throw new Error(`Unknown angle: ${config.angle}`);
    if (!this.persona) throw new Error(`Unknown persona: ${config.persona}`);
  }

  /**
   * Generate content for a specific type
   */
  async generate(contentType, campaignDir) {
    switch (contentType) {
      case 'landing-page':
        return this.generateLandingPage(campaignDir);
      case 'blog-post':
        return this.generateBlogPost(campaignDir);
      case 'linkedin-post':
        return this.generateLinkedInPosts(campaignDir);
      case 'facebook-post':
        return this.generateFacebookPosts(campaignDir);
      case 'linkedin-article':
        return this.generateLinkedInArticle(campaignDir);
      case 'email-sequence':
        return this.generateEmailSequence(campaignDir);
      case 'press-release':
        return this.generatePressRelease(campaignDir);
      case 'one-pager':
        return this.generateOnePager(campaignDir);
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  }

  /**
   * Generate landing page
   */
  async generateLandingPage(campaignDir) {
    const filename = 'landing-page.html';
    const filePath = path.join(campaignDir, 'content', filename);

    const content = this.createLandingPageContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'landing-page',
      file: `content/${filename}`,
      title: this.product.headline,
      slug: this.config.campaignId,
      seo: {
        title_tag: `${this.product.name} | Mobile Dealer Data`,
        meta_description: `${this.angle.scenario} ${this.product.headline}`,
      },
    }];
  }

  /**
   * Generate blog post
   */
  async generateBlogPost(campaignDir) {
    const filename = 'blog-post.md';
    const filePath = path.join(campaignDir, 'content', filename);

    const content = this.createBlogPostContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'blog-post',
      file: `content/${filename}`,
      title: `How ${this.product.proof.dealership} ${this.product.proof.metric}`,
      slug: `${this.config.campaignId}-case-study`,
      seo: {
        title_tag: `${this.product.proof.dealership} Case Study | Mobile Dealer Data`,
        meta_description: `Learn how ${this.product.proof.dealership} achieved ${this.product.proof.metric} with MDD.`,
      },
    }];
  }

  /**
   * Generate LinkedIn posts
   */
  async generateLinkedInPosts(campaignDir) {
    const posts = [];
    const postCount = this.config.socialPostCount || 3;

    for (let i = 1; i <= postCount; i++) {
      const filename = `linkedin-post-${i}.md`;
      const filePath = path.join(campaignDir, 'content', 'social', filename);

      const content = this.createLinkedInPostContent(i);
      fs.writeFileSync(filePath, content);

      posts.push({
        type: 'linkedin-post',
        file: `content/social/${filename}`,
        title: `LinkedIn Post ${i}`,
      });
    }

    return posts;
  }

  /**
   * Generate Facebook posts
   */
  async generateFacebookPosts(campaignDir) {
    const posts = [];
    const postCount = this.config.socialPostCount || 3;

    for (let i = 1; i <= postCount; i++) {
      const filename = `facebook-post-${i}.md`;
      const filePath = path.join(campaignDir, 'content', 'social', filename);

      const content = this.createFacebookPostContent(i);
      fs.writeFileSync(filePath, content);

      posts.push({
        type: 'facebook-post',
        file: `content/social/${filename}`,
        title: `Facebook Post ${i}`,
      });
    }

    return posts;
  }

  /**
   * Generate LinkedIn article
   */
  async generateLinkedInArticle(campaignDir) {
    const filename = 'linkedin-article.md';
    const filePath = path.join(campaignDir, 'content', filename);

    const content = this.createLinkedInArticleContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'linkedin-article',
      file: `content/${filename}`,
      title: `How ${this.product.proof.dealership} Solved the ${this.angle.name} Problem`,
    }];
  }

  /**
   * Generate email sequence
   */
  async generateEmailSequence(campaignDir) {
    const emails = [];
    const emailCount = this.config.emailCount || 5;

    for (let i = 1; i <= emailCount; i++) {
      const filename = `email-${i}.md`;
      const filePath = path.join(campaignDir, 'content', 'email', filename);

      const content = this.createEmailContent(i, emailCount);
      fs.writeFileSync(filePath, content);

      emails.push({
        type: 'email',
        file: `content/email/${filename}`,
        title: `Email ${i} of ${emailCount}`,
        day: (i - 1) * 3, // Send every 3 days
      });
    }

    return emails;
  }

  /**
   * Generate press release
   */
  async generatePressRelease(campaignDir) {
    const filename = 'press-release.md';
    const filePath = path.join(campaignDir, 'content', filename);

    const content = this.createPressReleaseContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'press-release',
      file: `content/${filename}`,
      title: `MDD Helps ${this.product.proof.dealership} Achieve ${this.product.proof.metric}`,
    }];
  }

  /**
   * Generate one-pager
   */
  async generateOnePager(campaignDir) {
    const filename = 'one-pager.md';
    const filePath = path.join(campaignDir, 'content', filename);

    const content = this.createOnePagerContent();
    fs.writeFileSync(filePath, content);

    return [{
      type: 'one-pager',
      file: `content/${filename}`,
      title: `${this.product.name} One-Pager`,
    }];
  }

  // ============================================
  // Content Creation Methods
  // ============================================

  createLandingPageContent() {
    return `<!--
  Campaign: ${this.config.campaignId}
  Product: ${this.config.product}
  Angle: ${this.config.angle}
  Persona: ${this.config.persona}
-->

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.product.name} | Mobile Dealer Data</title>
  <meta name="description" content="${this.angle.scenario}">
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <span class="tag">${this.product.tag}</span>
    <h1>${this.product.headline}</h1>
    <p>${this.angle.scenario}</p>
    <a href="/demo" class="cta">Schedule Your Demo &rarr;</a>
  </section>

  <!-- Pain Section -->
  <section class="pain">
    <p>${this.angle.pain}</p>
  </section>

  <!-- Solution Section -->
  <section class="solution">
    <h2>The Solution</h2>
    <p>Mobile Dealer Data gives you real-time visibility into every key and vehicle.</p>
  </section>

  <!-- Proof Section -->
  <section class="proof">
    <h2>${this.product.proof.dealership}</h2>
    <p class="metric">${this.product.proof.metric}</p>
    <blockquote>"${this.product.proof.quote}"</blockquote>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <h2>Ready to stop searching?</h2>
    <a href="/demo" class="cta">Schedule Your Demo &rarr;</a>
  </section>
</body>
</html>`;
  }

  createBlogPostContent() {
    return `---
campaign_id: ${this.config.campaignId}
product: ${this.config.product}
angle: ${this.config.angle}
persona: ${this.config.persona}
---

# How ${this.product.proof.dealership} ${this.product.proof.metric}

${this.angle.scenario}

${this.angle.pain}

## The Challenge

${this.product.proof.dealership} faced a problem many dealerships know well.

[Expand on the specific challenges they faced...]

## The Solution

They implemented Mobile Dealer Data's ${this.product.name} solution.

[Explain how the solution works...]

## The Results

- ${this.product.proof.metric}
- [Additional metrics...]

> "${this.product.proof.quote}"

## What This Means For You

[Connect to the reader's situation...]

---

**Ready to see similar results?**

[Schedule a Demo](https://mdd.io/demo)
`;
  }

  createLinkedInPostContent(postNumber) {
    const hooks = [
      this.angle.scenario,
      this.product.proof.metric + '.',
      `Quick question for ${this.persona.title}s:`,
    ];

    return `---
campaign_id: ${this.config.campaignId}
post_number: ${postNumber}
platform: linkedin
---

# LinkedIn Post ${postNumber}

\`\`\`
${hooks[(postNumber - 1) % hooks.length]}

${this.angle.pain}

${this.product.proof.dealership} solved this.

Now they've achieved ${this.product.proof.metric}.

The secret? Real-time visibility into every key and vehicle.

Worth a quick look?

#AutomotiveRetail #DealershipLife #${this.product.tag.replace(/\s+/g, '')}
\`\`\`
`;
  }

  createFacebookPostContent(postNumber) {
    return `---
campaign_id: ${this.config.campaignId}
post_number: ${postNumber}
platform: facebook
---

# Facebook Post ${postNumber}

\`\`\`
${this.product.proof.metric}.

That's what ${this.product.proof.dealership} achieved with Mobile Dealer Data.

${this.angle.scenario}

See how they did it: [LINK]
\`\`\`
`;
  }

  createLinkedInArticleContent() {
    return `---
campaign_id: ${this.config.campaignId}
type: linkedin-article
---

# How ${this.product.proof.dealership} Solved the ${this.angle.name} Problem

${this.angle.scenario}

${this.angle.pain}

This happens at dealerships across the country. Most managers just accept it.

But ${this.product.proof.dealership} decided they were done accepting it.

## The Problem

[Expand on the problem with specific details and quantification...]

## The Solution

They implemented Mobile Dealer Data's ${this.product.name} solution.

[Explain the mechanism and how it works...]

## The Results

After implementation, ${this.product.proof.dealership} achieved:

- ${this.product.proof.metric}
- [Additional metrics...]

> "${this.product.proof.quote}"

## What Other Dealerships Are Seeing

[Expand with additional proof points...]

## The Bottom Line

${this.product.headline}

---

**Want to see how this could work at your dealership?**

[Schedule a Demo](https://mdd.io/demo)

#AutomotiveRetail #DealershipLife
`;
  }

  createEmailContent(emailNumber, totalEmails) {
    const emailTypes = ['problem-awareness', 'industry-trend', 'solution', 'case-study', 'cta'];
    const type = emailTypes[(emailNumber - 1) % emailTypes.length];

    return `---
campaign_id: ${this.config.campaignId}
email_number: ${emailNumber}
total_emails: ${totalEmails}
email_type: ${type}
persona: ${this.config.persona}
---

# Email ${emailNumber}: ${type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}

**Subject:** ${this.getEmailSubject(emailNumber)}

---

Hi {{FirstName}},

${this.getEmailBody(emailNumber)}

— {{SenderName}}
`;
  }

  getEmailSubject(emailNumber) {
    const subjects = [
      this.angle.scenario.split('.')[0],
      `${this.product.proof.metric}`,
      `Quick question about ${this.product.name.toLowerCase()}`,
      `How ${this.product.proof.dealership} did it`,
      `Worth a quick look?`,
    ];
    return subjects[(emailNumber - 1) % subjects.length];
  }

  getEmailBody(emailNumber) {
    if (emailNumber === 1) {
      return `${this.angle.scenario}

${this.angle.pain}

There's a simple way to fix this.

More in my next email.`;
    }

    if (emailNumber === 2) {
      return `The dealerships pulling ahead right now aren't doing anything fancy.

They're eliminating small inefficiencies before they add up.

${this.product.proof.dealership} is a good example.

${this.product.proof.metric}.`;
    }

    if (emailNumber === 3) {
      return `Here's how ${this.product.proof.dealership} did it.

They implemented real-time tracking for every key and vehicle.

The technology is simple: know where everything is, automatically.

No manual updates. No behavior change required.`;
    }

    if (emailNumber === 4) {
      return `Let me tell you more about ${this.product.proof.dealership}.

Before MDD: [problem]
After MDD: ${this.product.proof.metric}

"${this.product.proof.quote}"`;
    }

    return `Over the past few weeks, I've shared how dealerships like ${this.product.proof.dealership} are solving ${this.angle.name.toLowerCase()}.

Would it make sense to see how this could work at {{Dealership}}?

15 minutes. No commitment.`;
  }

  createPressReleaseContent() {
    return `---
campaign_id: ${this.config.campaignId}
type: press-release
---

FOR IMMEDIATE RELEASE

**${this.product.proof.dealership} Achieves ${this.product.proof.metric} with Mobile Dealer Data**

*${this.product.name} solution helps dealership ${this.product.headline.toLowerCase()}*

DETROIT, MI — [DATE] — Mobile Dealer Data (MDD), the leading provider of real-time vehicle and key tracking solutions, today announced that ${this.product.proof.dealership} has achieved ${this.product.proof.metric} using MDD's ${this.product.name} solution.

"${this.product.proof.quote}" said [Name], [Title] at ${this.product.proof.dealership}.

[Additional details about the implementation and results...]

About Mobile Dealer Data

Mobile Dealer Data (MDD) provides real-time vehicle and key tracking solutions for automotive dealerships. Used by 500+ dealerships nationwide, MDD's LocateIQ technology delivers sub-foot accuracy and automated workflow updates.

###

Contact:
Media Relations
Mobile Dealer Data
press@mdd.io
844-292-7110
`;
  }

  createOnePagerContent() {
    return `---
campaign_id: ${this.config.campaignId}
type: one-pager
product: ${this.config.product}
---

# ${this.product.name} One-Pager

## ${this.product.headline}

---

### THE CHALLENGE

${this.angle.scenario}

${this.angle.pain}

---

### THE SOLUTION

Mobile Dealer Data's ${this.product.name} gives you real-time visibility into every key and vehicle on your lot.

---

### KEY BENEFITS

- **Real-Time Location** — Know exactly where everything is
- **No Manual Updates** — Tracking happens automatically
- **Mobile Access** — Track from any device, anywhere
- **Proven Results** — ${this.product.proof.metric}

---

### RESULTS

**${this.product.proof.dealership}**

${this.product.proof.metric}

> "${this.product.proof.quote}"

---

### READY TO STOP SEARCHING?

mdd.io | 844-292-7110 | info@mdd.io
`;
  }
}

module.exports = ContentGenerator;
