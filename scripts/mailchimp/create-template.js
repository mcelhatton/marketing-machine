/**
 * Create or update an editable Mailchimp classic template.
 *
 * Usage:
 *   node scripts/mailchimp/create-template.js <manifest-path>
 *   node scripts/mailchimp/create-template.js <manifest-path> --index 1 --upload
 *   node scripts/mailchimp/create-template.js <manifest-path> --template-id 123 --upload
 */

const fs = require('fs');
const path = require('path');
const MailchimpClient = require('./mailchimp-client');
const { buildDefaultCta, getEmailContext } = require('./email-utils');

function parseArgs(args) {
  const indexArg = args.indexOf('--index');
  const nameArg = args.indexOf('--name');
  const outputArg = args.indexOf('--output');
  const templateIdArg = args.indexOf('--template-id');
  const ctaTextArg = args.indexOf('--cta-text');
  const ctaUrlArg = args.indexOf('--cta-url');

  return {
    manifestPath: args[0],
    emailIndex: indexArg !== -1 ? parseInt(args[indexArg + 1], 10) : 0,
    name: nameArg !== -1 ? args[nameArg + 1] : null,
    output: outputArg !== -1 ? args[outputArg + 1] : null,
    templateId: templateIdArg !== -1 ? args[templateIdArg + 1] : null,
    ctaText: ctaTextArg !== -1 ? args[ctaTextArg + 1] : null,
    ctaUrl: ctaUrlArg !== -1 ? args[ctaUrlArg + 1] : null,
    upload: args.includes('--upload'),
    dryRun: args.includes('--dry-run'),
  };
}

async function createTemplate(manifestPath, options = {}) {
  const {
    emailIndex = 0,
    name = null,
    output = null,
    templateId = null,
    ctaText = null,
    ctaUrl = null,
    upload = false,
    dryRun = false,
  } = options;

  const {
    body,
    campaignDir,
    manifest,
    metadata,
    preview,
    subject,
  } = getEmailContext(manifestPath, emailIndex);
  const defaultCta = buildDefaultCta(manifest);

  const templateName = name || `${manifest.campaign_name} - Editable Email ${emailIndex + 1}`;
  const templateOutputPath = output || path.join(
    campaignDir,
    'content',
    'email',
    `email-${emailIndex + 1}-mailchimp-template.html`
  );
  const previewText = metadata.preview_text || preview || body.substring(0, 150);

  const html = MailchimpClient.markdownToEmailHtml(body, {
    editableTemplate: true,
    previewText,
    title: subject || templateName,
    ctaText: ctaText || defaultCta.text,
    ctaUrl: ctaUrl || defaultCta.url,
    senderName: 'Mobile Dealer Data Team',
  });

  console.log('Mailchimp Template Data:');
  console.log({
    templateName,
    output: templateOutputPath,
    previewText,
    upload,
    templateId: templateId || 'new',
  });

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      templateName,
      output: templateOutputPath,
    };
  }

  fs.writeFileSync(templateOutputPath, html);
  console.log(`Template HTML written to ${templateOutputPath}`);

  if (!upload) {
    return {
      success: true,
      templateName,
      output: templateOutputPath,
    };
  }

  const client = new MailchimpClient();
  let result;

  if (templateId) {
    console.log(`Updating Mailchimp template ${templateId}...`);
    result = await client.updateTemplate(templateId, {
      name: templateName,
      html,
    });
  } else {
    console.log('Creating Mailchimp template...');
    result = await client.createTemplate(templateName, html);
  }

  console.log(`Template saved in Mailchimp: ${result.id}`);

  return {
    success: true,
    templateId: result.id,
    templateName,
    output: templateOutputPath,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node create-template.js <manifest-path> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --index <n>          Use email at index n (default: 0)');
    console.log('  --name <name>        Override template name');
    console.log('  --output <path>      Write HTML to a custom path');
    console.log('  --upload             Create or update the template in Mailchimp');
    console.log('  --template-id <id>   Update an existing Mailchimp template');
    console.log('  --cta-text <text>    Override the default button text');
    console.log('  --cta-url <url>      Override the default button URL');
    console.log('  --dry-run            Show the template settings without writing');
    process.exit(1);
  }

  const options = parseArgs(args);

  createTemplate(options.manifestPath, options)
    .then((result) => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { createTemplate };
