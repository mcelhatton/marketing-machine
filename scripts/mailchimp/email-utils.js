const fs = require('fs');
const path = require('path');

function readManifest(manifestPath) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(content);
}

function extractEmailContent(mdContent) {
  let content = mdContent.replace(/^---[\s\S]*?---\n*/m, '');
  content = content.replace(/<!--[\s\S]*?-->/g, '');

  const subjectMatch = content.match(/\*\*Subject:\*\*\s*(.+)/i);
  const previewMatch = content.match(/\*\*Preview:\*\*\s*(.+)/i);

  const subject = subjectMatch ? subjectMatch[1].trim() : null;
  const preview = previewMatch ? previewMatch[1].trim() : null;

  if (subjectMatch) {
    content = content.replace(subjectMatch[0], '');
  }

  if (previewMatch) {
    content = content.replace(previewMatch[0], '');
  }

  content = content
    .replace(/^#+ .+\n*/gm, '')
    .replace(/^\s*---\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { subject, preview, body: content };
}

function extractMetadata(mdContent) {
  const match = mdContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return {};
  }

  const metadata = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      metadata[key.trim()] = valueParts.join(':').trim().replace(/^"(.*)"$/, '$1');
    }
  }

  return metadata;
}

function getEmailContext(manifestPath, emailIndex = 0) {
  const manifest = readManifest(manifestPath);
  const campaignDir = path.dirname(manifestPath);
  const emails = manifest.content.filter((item) => item.type === 'email');

  if (emails.length === 0) {
    throw new Error('No email content found in manifest');
  }

  const emailItem = emails[emailIndex];
  if (!emailItem) {
    throw new Error(`Email at index ${emailIndex} not found`);
  }

  const emailPath = path.join(campaignDir, emailItem.file);
  const mdContent = fs.readFileSync(emailPath, 'utf8');
  const metadata = extractMetadata(mdContent);
  const { subject, preview, body } = extractEmailContent(mdContent);

  return {
    manifest,
    campaignDir,
    emailItem,
    emailPath,
    mdContent,
    metadata,
    subject,
    preview,
    body,
  };
}

function buildDefaultCta(manifest) {
  const campaignId = manifest.campaign_id || 'mdd-email';

  return {
    text: 'Schedule a 15-Min Demo &rarr;',
    url: `https://mdd.io/contact-us?utm_source=mailchimp&utm_medium=email&utm_campaign=${campaignId}`,
  };
}

module.exports = {
  readManifest,
  extractEmailContent,
  extractMetadata,
  getEmailContext,
  buildDefaultCta,
};
