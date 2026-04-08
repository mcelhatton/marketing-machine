# MDD Marketing Machine

A Claude Code-powered marketing automation system for Mobile Dealer Data.

Generate complete multi-channel marketing campaigns with a single prompt.

---

## Overview

The MDD Marketing Machine transforms campaign briefs into production-ready content across all channels:

- **Landing Pages** → HubSpot CMS
- **Blog Posts** → HubSpot CMS
- **Social Posts** → LinkedIn & Facebook
- **Email Sequences** → HubSpot or Mailchimp
- **Press Releases** → Distribution-ready
- **One-Pagers** → Sales collateral

---

## Quick Start

### One-Command Campaign (Recommended)

Generate and deploy a complete marketing campaign with one command:

```bash
# Generate only (review before deploying)
npm run run -- --product key-tracking --angle saturday-chaos --persona sales-manager

# Generate + Deploy to HubSpot (draft mode)
npm run run -- --product key-tracking --angle saturday-chaos --persona sales-manager --deploy

# Generate + Publish everywhere (live)
npm run run -- --product key-tracking --angle saturday-chaos --persona sales-manager --publish
```

This creates:
- ✅ Landing page (HTML, ready for HubSpot)
- ✅ Blog post (Markdown → HTML conversion)
- ✅ 3 LinkedIn posts (with URLs included)
- ✅ 3 Facebook posts (with URLs included)
- ✅ LinkedIn article (long-form thought leadership)
- ✅ 5-email nurture sequence
- ✅ Press release
- ✅ One-pager sales collateral
- ✅ Hero images (auto-downloaded from Pexels)

### Interactive Campaign Builder

For more control, use the interactive wizard:

```bash
npm run build
```

The wizard walks you through:
- 📢 **Platforms** - HubSpot, Mailchimp, LinkedIn, Facebook
- 📦 **Product** - Which MDD product to promote
- 👤 **Audience** - Target persona
- 🎯 **Messaging Angle** - Pre-built hooks or custom
- 🗓️ **Scheduling** - Draft, immediate, or scheduled

### CLI Options

```bash
node scripts/orchestrator/run-campaign.js \
  --product key-tracking \
  --angle saturday-chaos \
  --persona sales-manager \
  --deploy           # Deploy to HubSpot (draft)
  --publish          # Publish to all platforms (live)
  --skip-assets      # Skip image downloads
  --skip-hubspot     # Skip HubSpot deployment
  --skip-social      # Skip social media posting
```

---

## Generated Campaign Structure

```
campaigns/
└── 2024-03-key-tracking-saturday-chaos/
    ├── manifest.json           # Campaign metadata & publishing status
    ├── content/
    │   ├── landing-page.html   # HubSpot landing page
    │   ├── blog-post.md        # Blog article
    │   ├── linkedin-article.md # Long-form LinkedIn content
    │   ├── social/
    │   │   ├── linkedin-post-1.md
    │   │   ├── linkedin-post-2.md
    │   │   ├── facebook-post-1.md
    │   │   └── facebook-post-2.md
    │   └── email/
    │       ├── email-1.md
    │       ├── email-2.md
    │       └── ...
    └── assets/                 # Generated visual assets
        ├── asset-manifest.json
        ├── og-image-spec.json
        ├── og-image-background.jpg
        ├── linkedin-post-spec.json
        ├── stat-card-spec.json
        └── video-explainer-script.json
```

---

## Asset Generation

Generate visual assets (images, videos) for your campaigns.

### Asset Pipeline Options

| Pipeline | Description | API Keys Required |
|----------|-------------|-------------------|
| `stock-only` | Stock photos from Pexels/Unsplash | PEXELS_API_KEY or UNSPLASH_ACCESS_KEY |
| `stock-canva` | Stock photos + branded templates | Above + CANVA_API_KEY |
| `full-pipeline` | All above + AI video generation | All above + RUNWAY_API_KEY, LUMEN5_API_KEY |

### Generating Assets

Assets are generated during the campaign builder wizard (Step 9), or separately:

```bash
# From campaign manifest
node scripts/assets/asset-generator.js campaigns/2024-03/manifest.json

# Quick test
node scripts/assets/asset-generator.js generate key-tracking ./test-output
```

### Asset Types

| Type | Dimensions | Description |
|------|------------|-------------|
| `og-image` | 1200x630 | Open Graph / link preview |
| `linkedin-post` | 1200x627 | LinkedIn feed post image |
| `linkedin-article` | 1920x1080 | LinkedIn article cover |
| `facebook-post` | 1200x630 | Facebook feed post image |
| `stat-card` | 1080x1080 | Statistics graphic (square) |
| `quote-card` | 1080x1080 | Testimonial quote card |
| `blog-hero` | 1200x628 | Blog post hero image |
| `video-clips` | 1920x1080 | AI-generated video scenes |
| `blog-video` | 1920x1080 | Text-to-video conversion |

### Video Generation

AI video generation is available through:

- **Runway ML** (Gen-3 Alpha) - Generate short video scenes from prompts
- **Lumen5** - Convert blog content to video automatically

```bash
# Generate video script (no API key required)
node scripts/assets/asset-generator.js video key-tracking saturday-chaos ./output

# Pre-built dealership scenes
node scripts/assets/runway-client.js scene service-busy

# Before/after comparison videos
node scripts/assets/runway-client.js before-after key-search
```

### Photo Queries by Product

The system uses MDD-specific photo queries for each product:

| Product | Photo Types |
|---------|-------------|
| Key Tracking | car-keys, key-handoff, dealership-showroom |
| Lot Management | dealership-lot, lot-overview, vehicles-parked |
| Service Workflow | service-bay, service-lane, technician-working |
| Recon Workflow | vehicle-detail, service-bay, vehicles-parked |
| VehicleVault | happy-customer, key-handoff, mobile-app |

### Asset Output

For each asset type, the generator creates:

1. **Spec file** (`.json`) - Complete creation instructions
2. **Background photo** (`.jpg`) - Downloaded stock photo
3. **Brand guidelines** - Colors, fonts, positioning

If Canva API is configured, fully rendered assets are generated automatically.

---

## Publishing

After reviewing and editing generated content, publish to each platform:

### HubSpot (Landing Pages & Blog)

```bash
node scripts/hubspot/publish-page.js <manifest> --publish
node scripts/hubspot/publish-blog.js <manifest> --publish
```

### Mailchimp (Email Campaigns)

```bash
# Single email
node scripts/mailchimp/publish-campaign.js <manifest>

# All emails as individual campaigns
node scripts/mailchimp/publish-campaign.js <manifest> --all

# Send test email first
node scripts/mailchimp/publish-campaign.js <manifest> --test you@example.com

# Generate an editable Mailchimp classic template for marketers
node scripts/mailchimp/create-template.js <manifest>

# Generate and upload the editable template to Mailchimp
node scripts/mailchimp/create-template.js <manifest> --upload
```

The template flow is separate from campaign publishing on purpose:
- `publish-campaign.js` creates draft campaigns directly from markdown.
- `create-template.js` creates a Mailchimp classic custom-coded template with editable `mc:edit` regions for body copy, CTA button, preheader, and footer so non-technical marketers can update links and button text in Mailchimp's legacy builder.

### LinkedIn

```bash
# Single post
node scripts/linkedin/publish-post.js <manifest>

# All posts
node scripts/linkedin/publish-post.js <manifest> --all
```

### Facebook

```bash
# Immediate
node scripts/facebook/publish-post.js <manifest>

# Scheduled
node scripts/facebook/publish-post.js <manifest> --schedule "2024-03-20T09:00:00Z"
```

---

## Configuration

### Products

| Product | Description | Auto Proof Point |
|---------|-------------|------------------|
| `key-tracking` | MDD Locate - Key tracking | Bill Brown Ford |
| `lot-management` | MDD Locate - Vehicle tracking | Bill Brown Ford |
| `service-workflow` | Service lane workflow | Corwin Toyota |
| `recon-workflow` | Reconditioning workflow | Longo Toyota |
| `vehiclevault` | VehicleVault F&I product | Brandon Honda |
| `full-platform` | Complete MDD platform | Bill Brown Ford |

### Messaging Angles

| Angle | Scenario |
|-------|----------|
| `saturday-chaos` | Lost keys during peak times |
| `inventory-cashflow` | Cars sitting in recon |
| `service-revenue` | Long service wait times |
| `lost-key-cost` | Cost of lost keys |
| `vehiclevault-profit` | F&I revenue opportunity |
| `custom` | Create your own hook |

### Personas

| Persona | Target |
|---------|--------|
| `owner` | Dealer Principal |
| `gm` | General Manager |
| `service-manager` | Service Director |
| `sales-manager` | Sales Manager |
| `fi-manager` | F&I Director |
| `used-car-manager` | Used Car Manager |

### Email Sequence Types

| Type | Description |
|------|-------------|
| `cold-outbound` | New prospects, never contacted (default: 10 emails) |
| `nurture` | Warm leads who showed interest (default: 5 emails) |
| `re-engagement` | Dormant contacts who went cold |

---

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Variables

```bash
# HubSpot
HUBSPOT_ACCESS_TOKEN=your-token
HUBSPOT_PORTAL_ID=585393

# LinkedIn
LINKEDIN_ACCESS_TOKEN=your-token
LINKEDIN_ORGANIZATION_ID=your-org-id

# Facebook
FACEBOOK_ACCESS_TOKEN=your-token
FACEBOOK_PAGE_ID=your-page-id

# Mailchimp
MAILCHIMP_API_KEY=your-api-key-us21
MAILCHIMP_SERVER_PREFIX=us21
MAILCHIMP_LIST_ID=your-list-id
```

### Asset Generation Variables (Optional)

```bash
# Stock Photos
PEXELS_API_KEY=your-pexels-key
UNSPLASH_ACCESS_KEY=your-unsplash-key

# Template-Based Design
CANVA_API_KEY=your-canva-key
CANVA_BRAND_KIT_ID=your-brand-kit-id
CANVA_TEMPLATE_OG_IMAGE=template-id
CANVA_TEMPLATE_LINKEDIN_POST=template-id
# ... (see .env.example for all template IDs)

# AI Video Generation
RUNWAY_API_KEY=your-runway-key
LUMEN5_API_KEY=your-lumen5-key
```

### Validate Connections

```bash
# Publishing APIs
npm run hubspot:validate
npm run linkedin:validate
npm run facebook:validate
npm run mailchimp:validate

# Asset Generation APIs
npm run pexels:validate
npm run unsplash:validate
npm run canva:validate
npm run runway:validate
npm run lumen5:validate
```

---

## Directory Structure

```
mdd-marketing-machine/
├── CLAUDE.md                   # Claude Code instructions
├── .claude/rules/              # Brand voice, products, guidelines (16 files)
├── knowledge/                  # Case studies, pricing, email examples
├── templates/                  # Content templates
├── scripts/
│   ├── campaign-builder.js     # Interactive campaign wizard
│   ├── hubspot/                # HubSpot API client & publishing
│   ├── linkedin/               # LinkedIn API client & publishing
│   ├── facebook/               # Facebook API client & publishing
│   ├── mailchimp/              # Mailchimp API client & publishing
│   ├── orchestrator/           # Campaign generation & validation
│   └── assets/                 # Asset generation clients
│       ├── asset-generator.js  # Main orchestrator
│       ├── pexels-client.js    # Pexels stock photos
│       ├── unsplash-client.js  # Unsplash stock photos
│       ├── canva-client.js     # Canva template rendering
│       ├── runway-client.js    # Runway ML video generation
│       └── lumen5-client.js    # Lumen5 text-to-video
├── campaigns/                  # Generated campaigns (git-ignored)
└── assets/                     # Brand assets & guidelines
```

---

## A/B Testing

When enabled, the generator creates multiple subject line variations:

```
email-1.md           # Version A
email-1-variant-b.md # Version B
email-1-variant-c.md # Version C
```

Test in Mailchimp or HubSpot, then roll out the winner.

---

## Brand Voice

All content follows MDD brand voice guidelines:

**DO:**
- Lead with scenarios, not products
- Use specific proof points (named dealerships, metrics)
- Soft CTAs ("Worth a look?" not "Buy now!")
- Dealer language, not vendor language

**DON'T:**
- Use forbidden phrases (leverage, streamline, cutting-edge, etc.)
- Lead with features
- Be pushy or salesy
- Use vague claims without proof

See `.claude/rules/05-brand-voice.md` for complete guidelines.

---

## Proof Points

Auto-selected based on product:

| Dealership | Product | Metric |
|------------|---------|--------|
| Bill Brown Ford | Key/Lot | 2,000+ vehicles tracked, 90% adoption |
| Corwin Toyota | Service | 64% out in 60 min, 40-60% more bay turns |
| Longo Toyota | Recon | 3 days saved per car |
| Brandon Honda | VehicleVault | $308K/mo F&I revenue |

---

## Validation

Check content before publishing:

```bash
npm run validate campaigns/2024-03-key-tracking/manifest.json
```

Validates:
- Forbidden phrases
- Character limits per platform
- Required elements (CTA, proof points)
- SEO metadata
- Campaign completeness

---

## npm Scripts

### Campaign Workflow

| Script | Description |
|--------|-------------|
| `npm run run -- [options]` | Generate + optionally deploy campaign |
| `npm run build` | Interactive campaign builder wizard |
| `npm run generate -- [options]` | Generate campaign content only |
| `npm run deploy <campaign>` | Deploy campaign to platforms (draft mode) |
| `npm run deploy:preview <campaign>` | Deploy to HubSpot only |
| `npm run deploy:full <campaign>` | Deploy everywhere including social |
| `npm run validate <manifest>` | Validate campaign content |

### Connection Testing

| Script | Description |
|--------|-------------|
| `npm run hubspot:validate` | Test HubSpot connection |
| `npm run linkedin:validate` | Test LinkedIn connection |
| `npm run facebook:validate` | Test Facebook connection |
| `npm run mailchimp:validate` | Test Mailchimp connection |
| `npm run pexels:validate` | Test Pexels API |
| `npm run unsplash:validate` | Test Unsplash API |
| `npm run canva:validate` | Test Canva API |
| `npm run runway:validate` | Test Runway ML API |
| `npm run lumen5:validate` | Test Lumen5 API |

### Asset Generation

| Script | Description |
|--------|-------------|
| `npm run assets:generate` | Generate visual assets from manifest |
| `npm run assets:photo` | Download stock photos |
| `npm run assets:video` | Generate video scripts |

---

## License

Proprietary - Mobile Dealer Data
