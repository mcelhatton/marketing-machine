#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const rulesDir = path.join(repoRoot, '.claude', 'rules');
const outputDir = path.join(repoRoot, 'docs', 'non-dev-editable-rules');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function convertTextToDoc(textPath, docPath) {
  execFileSync('textutil', ['-convert', 'doc', '-format', 'txt', '-output', docPath, textPath], {
    stdio: 'inherit',
  });
}

function buildRuleDocText(filename, markdown) {
  const headingMatch = markdown.match(/^#\s+(.+)$/m);
  const title = headingMatch ? headingMatch[1].trim() : filename;

  return `# ${filename} - ${title}

Editable export of the live marketing machine rule file.

Source: .claude/rules/${filename}
Use: Edit this document in Word for non-technical review and collaboration.
Important: This export does not automatically overwrite the live source markdown.

---

${markdown}
`;
}

function buildOverviewText(ruleFiles) {
  const ruleRows = ruleFiles.map((file) => {
    const basename = path.basename(file);
    const markdown = fs.readFileSync(path.join(rulesDir, basename), 'utf8');
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const firstParagraphMatch = markdown.match(/^#\s+.+\n+\s*([^\n#].+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : basename;
    const summary = firstParagraphMatch ? firstParagraphMatch[1].trim() : 'Core configuration rule.';

    return `- ${basename} | ${title} | ${summary}`;
  }).join('\n');

  return `# MDD Marketing Machine Overview

Non-technical guide to how the system works and what each editable rule controls.

## What This System Is

The MDD Marketing Machine is a rule-driven content generator for Mobile Dealer Data.
Strategy and messaging live in rule files.
Node scripts turn those rules into campaign assets.
HubSpot and social publishing scripts handle deployment when requested.

## How It Works

1. Rules drive the message.
   Files in .claude/rules/ define brand voice, product positioning, persona targeting, proof points, SEO, email structure, landing page structure, and deployment rules.
2. Scripts assemble the campaign.
   The main generator lives in scripts/orchestrator/.
   It builds a dated campaign folder, creates a manifest, and writes content files for landing pages, blogs, emails, social posts, press releases, and one-pagers.
3. Templates and knowledge provide scaffolding.
   The templates/ folder contains reusable structures, while knowledge/ stores proof, reference examples, case studies, and pricing context.
4. Campaigns are reviewed before publishing.
   Generated content lands in campaigns/.
   Publishing is intentionally a second step, handled by HubSpot, LinkedIn, Facebook, Mailchimp, and asset scripts only when someone explicitly deploys.
5. The website theme is separate.
   The HubSpot CMS theme lives in mdd-theme/.
   That is site implementation work, not campaign rule editing.

## What Non-Developers Should Edit

The best non-technical editing surface is the rule set exported in this folder.
These files control the machine's tone, product claims, proof points, persona targeting, campaign structure, and platform constraints.

- 00-index: Reading order and dependencies. Changes which rules should be consulted first for each content type.
- 01-products: Product messaging and positioning. Changes product descriptions, benefits, differentiators, and messaging do/don't guidance.
- 02-competitors: Competitive framing. Changes how MDD is contrasted against alternatives.
- 03-proof-points: Approved quotes, metrics, customer references. Changes which claims are safe to use in content.
- 04-hubspot-deployment: HubSpot publishing and theme workflow. Changes how publishing instructions are documented.
- 05-brand-voice: Main copywriting rules. Changes tone, forbidden phrases, CTA style, and channel voice.
- 06-platform-specs: Per-channel limits and formatting. Changes post length, email requirements, blog SEO limits, and image specs.
- 07-campaign-orchestration: Campaign structure and sequence. Changes folder structure, generation order, cross-linking, and scheduling defaults.
- 08-seo-guidelines: Organic search guidance. Changes keyword and optimization guidance for blog and landing pages.
- 09-email-sequences: Email campaign patterns. Changes sequence structure, cadence, and email template logic.
- 10-image-assets: Visual asset rules. Changes image guidance and asset expectations.
- 11-personas: Audience targeting. Changes who each product should be pitched to and what pain points matter.
- 12-messaging-angles: Reusable hooks and campaign angles. Changes the narrative options used across campaigns.
- 13-pricing-model: Pricing references. Changes how pricing is framed when referenced in content or sales material.
- 14-marketing-framework: Campaign strategy model. Changes the strategic logic behind hooks, offers, and demo conversion flow.
- 15-landing-page-template: Landing page blueprint. Changes the required sections and layout expectations for landing pages.

## Current Automation Flow

Inputs: product, angle, persona, content mix, optional deployment flags.

Generator:
- scripts/campaign-builder.js provides the interactive wizard.
- scripts/orchestrator/run-campaign.js is the one-command runner.

Output:
- Each run creates a dated folder in campaigns/ with content, assets, and a manifest.json that tracks what was generated and published.

Validation:
- scripts/orchestrator/validate-campaign.js checks forbidden phrases, content completeness, and some SEO and CTA requirements.

Deployment:
- scripts/orchestrator/deploy-campaign.js coordinates HubSpot, LinkedIn, Facebook, Mailchimp, and Pexels-based asset work when deployment is requested.

## Rule File Catalog

${ruleRows}

## Editing Guidance

- Edit the documents in this folder if the goal is business-user review or copy changes.
- Keep product names, named customers, and approved stats consistent with MDD approvals.
- For live system behavior, the source markdown in .claude/rules/ still remains the operative configuration.
- If desired later, a second pass can be added to sync Word edits back into the live markdown sources automatically.
`;
}

function main() {
  if (!fs.existsSync(rulesDir)) {
    throw new Error(`Rules directory not found: ${rulesDir}`);
  }

  ensureDir(outputDir);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdd-rules-docs-'));
  const ruleFiles = fs.readdirSync(rulesDir)
    .filter((file) => file.endsWith('.md'))
    .sort();

  for (const file of ruleFiles) {
    const markdown = fs.readFileSync(path.join(rulesDir, file), 'utf8');
    const text = buildRuleDocText(file, markdown);
    const textPath = path.join(tempDir, file.replace(/\.md$/, '.txt'));
    const docPath = path.join(outputDir, file.replace(/\.md$/, '.doc'));

    fs.writeFileSync(textPath, text);
    convertTextToDoc(textPath, docPath);
  }

  const overviewTextPath = path.join(tempDir, 'MDD-Marketing-Machine-Overview.txt');
  const overviewDocPath = path.join(outputDir, 'MDD-Marketing-Machine-Overview.doc');
  fs.writeFileSync(overviewTextPath, buildOverviewText(ruleFiles));
  convertTextToDoc(overviewTextPath, overviewDocPath);

  console.log(`Exported ${ruleFiles.length + 1} .doc files to ${outputDir}`);
}

main();
