/**
 * Publish Email Campaign to Mailchimp
 *
 * Takes a campaign manifest and email content, creates campaign in Mailchimp.
 * Campaigns are created as drafts - human publishes after review.
 *
 * Usage:
 *   node publish-campaign.js <manifest-path>
 *   node publish-campaign.js campaigns/2024-03-key-tracking/manifest.json
 */

const fs = require('fs');
const MailchimpClient = require('./mailchimp-client');
const { getEmailContext, readManifest } = require('./email-utils');

/**
 * Create campaign in Mailchimp
 */
async function publishCampaign(manifestPath, options = {}) {
  const { dryRun = false, emailIndex = 0, schedule = null, testEmail = null } = options;

  const {
    manifest,
    body,
    emailItem,
    metadata,
    preview,
    subject,
  } = getEmailContext(manifestPath, emailIndex);

  // Determine subject line
  const emailSubject = emailItem.subject || subject || `${manifest.campaign_name} - Email ${emailIndex + 1}`;
  const previewText = metadata.preview_text || preview || body.substring(0, 150);

  // Convert to HTML
  const htmlContent = MailchimpClient.markdownToEmailHtml(body, {
    previewText,
    senderName: 'Mobile Dealer Data Team',
    title: `${manifest.campaign_name} - Email ${emailIndex + 1}`,
  });
  const plainTextContent = MailchimpClient.normalizeMergeTags(body, {
    senderName: 'Mobile Dealer Data Team',
  });

  console.log('Mailchimp Campaign Data:');
  console.log({
    title: `${manifest.campaign_name} - Email ${emailIndex + 1}`,
    subject: emailSubject,
    previewText,
    schedule: schedule || 'draft',
  });

  if (dryRun) {
    console.log('\n[DRY RUN] Would create campaign with above data');
    console.log('\nEmail Body Preview:');
    console.log(body.substring(0, 500) + '...');
    return { success: true, dryRun: true };
  }

  // Create Mailchimp client
  const client = new MailchimpClient();

  // Create campaign
  console.log('\nCreating Mailchimp campaign...');
  const campaign = await client.createCampaign({
    subject: emailSubject,
    previewText,
    title: `${manifest.campaign_name} - Email ${emailIndex + 1}`,
    fromName: 'Mobile Dealer Data',
    replyTo: 'info@mdd.io',
  });

  console.log(`Campaign created: ${campaign.id}`);

  // Set content
  console.log('Setting campaign content...');
  await client.setCampaignContent(campaign.id, htmlContent, plainTextContent);

  // Send test email if requested
  if (testEmail) {
    console.log(`Sending test email to ${testEmail}...`);
    await client.sendTestEmail(campaign.id, testEmail);
    console.log('Test email sent!');
  }

  // Schedule if requested
  if (schedule && schedule !== 'draft') {
    console.log(`Scheduling campaign for ${schedule}...`);
    await client.scheduleCampaign(campaign.id, schedule);
    console.log('Campaign scheduled!');
  }

  // Update manifest
  manifest.mailchimp = manifest.mailchimp || {};
  manifest.mailchimp.campaigns = manifest.mailchimp.campaigns || [];
  manifest.mailchimp.campaigns.push({
    email_index: emailIndex,
    campaign_id: campaign.id,
    web_id: campaign.web_id,
    status: schedule ? 'scheduled' : 'draft',
    created_at: new Date().toISOString(),
    scheduled_for: schedule || null,
  });
  manifest.mailchimp.last_updated = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest updated with Mailchimp campaign info');

  return {
    success: true,
    campaignId: campaign.id,
    webId: campaign.web_id,
    status: schedule ? 'scheduled' : 'draft',
    archiveUrl: campaign.archive_url,
  };
}

/**
 * Publish all emails as individual campaigns
 */
async function publishAllEmails(manifestPath, options = {}) {
  const manifest = readManifest(manifestPath);
  const emails = manifest.content.filter(c => c.type === 'email');

  console.log(`Found ${emails.length} emails to create as campaigns`);

  const results = [];
  for (let i = 0; i < emails.length; i++) {
    console.log(`\nCreating campaign ${i + 1} of ${emails.length}...`);
    try {
      const result = await publishCampaign(manifestPath, { ...options, emailIndex: i });
      results.push(result);

      // Wait between campaigns to avoid rate limiting
      if (i < emails.length - 1) {
        console.log('Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Error creating campaign ${i + 1}:`, error.message);
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
    console.log('Usage: node publish-campaign.js <manifest-path> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run          Show what would be done without making changes');
    console.log('  --all              Create campaigns for all emails in the sequence');
    console.log('  --index <n>        Create campaign for email at index n (default: 0)');
    console.log('  --schedule <time>  Schedule campaign (ISO 8601 format)');
    console.log('  --test <email>     Send test email before scheduling');
    console.log('');
    console.log('Example:');
    console.log('  node publish-campaign.js campaigns/2024-03-key-tracking/manifest.json');
    console.log('  node publish-campaign.js campaigns/2024-03-key-tracking/manifest.json --all');
    console.log('  node publish-campaign.js campaigns/2024-03-key-tracking/manifest.json --test you@example.com');
    process.exit(1);
  }

  const manifestPath = args[0];
  const dryRun = args.includes('--dry-run');
  const publishAll = args.includes('--all');

  const indexArg = args.indexOf('--index');
  const emailIndex = indexArg !== -1 ? parseInt(args[indexArg + 1], 10) : 0;

  const scheduleArg = args.indexOf('--schedule');
  const schedule = scheduleArg !== -1 ? args[scheduleArg + 1] : null;

  const testArg = args.indexOf('--test');
  const testEmail = testArg !== -1 ? args[testArg + 1] : null;

  const options = { dryRun, emailIndex, schedule, testEmail };

  const publishFn = publishAll ? publishAllEmails : publishCampaign;

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

module.exports = { publishCampaign, publishAllEmails };
