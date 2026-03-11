/**
 * Campaign Validator
 *
 * Validates campaign content against brand voice guidelines,
 * checks for forbidden phrases, and ensures completeness.
 *
 * Usage:
 *   node validate-campaign.js <manifest-path>
 *   node validate-campaign.js campaigns/2024-03-key-tracking/manifest.json
 */

const fs = require('fs');
const path = require('path');

// Forbidden phrases from brand voice guidelines
const FORBIDDEN_PHRASES = [
  'leverage',
  'utilize',
  'streamline',
  'optimize',
  'cutting-edge',
  'best-in-class',
  'world-class',
  'revolutionary',
  'game-changing',
  'synergy',
  'paradigm',
  'disrupt',
  'innovative solution',
  'state-of-the-art',
  'next-generation',
  'seamless',
  'robust',
  'scalable',
  'turnkey',
  'end-to-end',
  'holistic',
  'ecosystem',
  'empower',
  'transform',
  'reimagine',
  'unlock',
  'drive results',
  'move the needle',
  'low-hanging fruit',
  'circle back',
  'touch base',
  'take it offline',
  'at the end of the day',
];

// Required content types for a complete campaign
const REQUIRED_CONTENT = [
  'landing-page',
  'blog-post',
  'linkedin-post',
  'facebook-post',
];

// Character limits by platform
const CHARACTER_LIMITS = {
  'linkedin-post': 3000,
  'facebook-post': 63206,
  'email': 500, // Recommended, not hard limit
  'meta-description': 160,
  'title-tag': 60,
};

/**
 * Read manifest file
 */
function readManifest(manifestPath) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(content);
}

/**
 * Read content file
 */
function readContentFile(campaignDir, relativePath) {
  const fullPath = path.join(campaignDir, relativePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return null;
}

/**
 * Check for forbidden phrases in content
 */
function checkForbiddenPhrases(content, filename) {
  const issues = [];
  const lowerContent = content.toLowerCase();

  for (const phrase of FORBIDDEN_PHRASES) {
    if (lowerContent.includes(phrase.toLowerCase())) {
      // Find line number
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(phrase.toLowerCase())) {
          issues.push({
            type: 'forbidden-phrase',
            file: filename,
            line: i + 1,
            phrase: phrase,
            context: lines[i].trim().substring(0, 80),
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Check character limits
 */
function checkCharacterLimits(content, contentType, filename) {
  const issues = [];
  const limit = CHARACTER_LIMITS[contentType];

  if (limit && content.length > limit) {
    issues.push({
      type: 'character-limit',
      file: filename,
      contentType: contentType,
      actual: content.length,
      limit: limit,
      message: `Content exceeds ${limit} character limit (${content.length} chars)`,
    });
  }

  return issues;
}

/**
 * Check for required elements in content
 */
function checkRequiredElements(content, contentType, filename) {
  const issues = [];

  // Check for CTA
  const ctaPatterns = [
    /schedule.*demo/i,
    /get.*demo/i,
    /learn more/i,
    /contact us/i,
    /mdd\.io/i,
    /844-292-7110/i,
  ];

  const hasCta = ctaPatterns.some(pattern => pattern.test(content));
  if (!hasCta && ['landing-page', 'blog-post', 'email'].includes(contentType)) {
    issues.push({
      type: 'missing-cta',
      file: filename,
      message: 'No clear call-to-action found',
    });
  }

  // Check for proof points in key content
  const proofPatterns = [
    /bill brown ford/i,
    /corwin toyota/i,
    /longo toyota/i,
    /brandon honda/i,
    /\d+%/,
    /\$\d+/,
    /\d+ (days?|minutes?|hours?|vehicles?)/i,
  ];

  const hasProof = proofPatterns.some(pattern => pattern.test(content));
  if (!hasProof && ['landing-page', 'blog-post', 'linkedin-article'].includes(contentType)) {
    issues.push({
      type: 'missing-proof',
      file: filename,
      message: 'No specific proof points or metrics found',
    });
  }

  return issues;
}

/**
 * Check SEO elements
 */
function checkSeoElements(contentItem, content) {
  const issues = [];

  if (!contentItem.seo) {
    if (['landing-page', 'blog-post'].includes(contentItem.type)) {
      issues.push({
        type: 'missing-seo',
        file: contentItem.file,
        message: 'No SEO metadata defined',
      });
    }
    return issues;
  }

  // Title tag
  if (contentItem.seo.title_tag) {
    if (contentItem.seo.title_tag.length > 60) {
      issues.push({
        type: 'seo-title-length',
        file: contentItem.file,
        actual: contentItem.seo.title_tag.length,
        limit: 60,
        message: `Title tag exceeds 60 characters (${contentItem.seo.title_tag.length} chars)`,
      });
    }
  } else {
    issues.push({
      type: 'missing-seo-title',
      file: contentItem.file,
      message: 'No title tag defined',
    });
  }

  // Meta description
  if (contentItem.seo.meta_description) {
    if (contentItem.seo.meta_description.length > 160) {
      issues.push({
        type: 'seo-description-length',
        file: contentItem.file,
        actual: contentItem.seo.meta_description.length,
        limit: 160,
        message: `Meta description exceeds 160 characters (${contentItem.seo.meta_description.length} chars)`,
      });
    }
  } else {
    issues.push({
      type: 'missing-seo-description',
      file: contentItem.file,
      message: 'No meta description defined',
    });
  }

  return issues;
}

/**
 * Check campaign completeness
 */
function checkCompleteness(manifest) {
  const issues = [];
  const contentTypes = manifest.content.map(c => c.type);

  for (const required of REQUIRED_CONTENT) {
    if (!contentTypes.includes(required)) {
      issues.push({
        type: 'missing-content',
        contentType: required,
        message: `Required content type missing: ${required}`,
      });
    }
  }

  return issues;
}

/**
 * Validate entire campaign
 */
async function validateCampaign(manifestPath) {
  console.log('Validating campaign:', manifestPath);

  const manifest = readManifest(manifestPath);
  const campaignDir = path.dirname(manifestPath);

  const allIssues = [];
  const warnings = [];
  const errors = [];

  // Check completeness
  const completenessIssues = checkCompleteness(manifest);
  allIssues.push(...completenessIssues);

  // Check each content item
  for (const contentItem of manifest.content) {
    const content = readContentFile(campaignDir, contentItem.file);

    if (!content) {
      errors.push(`File not found: ${contentItem.file}`);
      continue;
    }

    // Check forbidden phrases
    const phraseIssues = checkForbiddenPhrases(content, contentItem.file);
    allIssues.push(...phraseIssues);

    // Check character limits
    const limitIssues = checkCharacterLimits(content, contentItem.type, contentItem.file);
    allIssues.push(...limitIssues);

    // Check required elements
    const elementIssues = checkRequiredElements(content, contentItem.type, contentItem.file);
    allIssues.push(...elementIssues);

    // Check SEO
    if (['landing-page', 'blog-post'].includes(contentItem.type)) {
      const seoIssues = checkSeoElements(contentItem, content);
      allIssues.push(...seoIssues);
    }
  }

  // Categorize issues
  for (const issue of allIssues) {
    if (['forbidden-phrase', 'missing-content'].includes(issue.type)) {
      errors.push(formatIssue(issue));
    } else {
      warnings.push(formatIssue(issue));
    }
  }

  // Generate report
  const report = {
    valid: errors.length === 0,
    campaignId: manifest.campaign_id,
    contentCount: manifest.content.length,
    errors: errors,
    warnings: warnings,
    issues: allIssues,
  };

  return report;
}

/**
 * Format issue for display
 */
function formatIssue(issue) {
  switch (issue.type) {
    case 'forbidden-phrase':
      return `[${issue.file}:${issue.line}] Forbidden phrase "${issue.phrase}": "${issue.context}"`;
    case 'character-limit':
      return `[${issue.file}] ${issue.message}`;
    case 'missing-cta':
    case 'missing-proof':
    case 'missing-seo':
    case 'missing-seo-title':
    case 'missing-seo-description':
      return `[${issue.file}] ${issue.message}`;
    case 'seo-title-length':
    case 'seo-description-length':
      return `[${issue.file}] ${issue.message}`;
    case 'missing-content':
      return issue.message;
    default:
      return JSON.stringify(issue);
  }
}

/**
 * Print validation report
 */
function printReport(report) {
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION REPORT');
  console.log('='.repeat(60));

  console.log(`\nCampaign: ${report.campaignId}`);
  console.log(`Content items: ${report.contentCount}`);

  if (report.errors.length > 0) {
    console.log('\n❌ ERRORS (' + report.errors.length + '):');
    for (const error of report.errors) {
      console.log(`  - ${error}`);
    }
  }

  if (report.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (' + report.warnings.length + '):');
    for (const warning of report.warnings) {
      console.log(`  - ${warning}`);
    }
  }

  if (report.valid) {
    console.log('\n✅ Campaign passed validation');
  } else {
    console.log('\n❌ Campaign has validation errors');
  }

  console.log('='.repeat(60));
}

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate-campaign.js <manifest-path>');
    console.log('');
    console.log('Example:');
    console.log('  node validate-campaign.js campaigns/2024-03-key-tracking/manifest.json');
    process.exit(1);
  }

  const manifestPath = args[0];
  const jsonOutput = args.includes('--json');

  validateCampaign(manifestPath)
    .then(report => {
      if (jsonOutput) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        printReport(report);
      }
      process.exit(report.valid ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation error:', error.message);
      process.exit(1);
    });
}

module.exports = { validateCampaign, checkForbiddenPhrases, FORBIDDEN_PHRASES };
