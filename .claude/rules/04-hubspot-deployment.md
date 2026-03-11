# HubSpot Deployment Guide

Complete instructions for deploying content to HubSpot CMS.

---

## Authentication

### Private App Token
HubSpot uses Bearer token authentication via Private App.

```
Authorization: Bearer <HUBSPOT_ACCESS_TOKEN>
```

Token is stored in `.env` as `HUBSPOT_ACCESS_TOKEN`.

### Environment Variables
```env
HUBSPOT_ACCESS_TOKEN=pat-na1-XXXXXXXX
HUBSPOT_PORTAL_ID=585393
HUBSPOT_BLOG_ID=XXXXXXXX
HUBSPOT_BLOG_AUTHOR_ID=XXXXXXXX
```

---

## API Endpoints

### Base URL
```
https://api.hubapi.com
```

### Blog Posts
**Create Blog Post:**
```
POST /cms/v3/blogs/posts
```

**Required Fields:**
- `name` — Post title
- `contentGroupId` — Blog ID from .env
- `slug` — URL slug (lowercase, hyphens, no dates)
- `blogAuthorId` — Author ID from .env
- `metaDescription` — SEO description (≤155 chars)
- `postBody` — HTML content

**Optional Fields:**
- `state` — "DRAFT" or "PUBLISHED"
- `publishDate` — ISO-8601 timestamp for scheduled publish

**Example:**
```json
{
  "name": "How Corwin Toyota Cut Service Wait Times by 60%",
  "contentGroupId": "{{HUBSPOT_BLOG_ID}}",
  "slug": "corwin-toyota-service-wait-times",
  "blogAuthorId": "{{HUBSPOT_BLOG_AUTHOR_ID}}",
  "metaDescription": "See how Corwin Toyota reduced express service wait times from 2.5 hours to under 90 minutes with MDD.",
  "postBody": "<p>HTML content here...</p>",
  "state": "DRAFT"
}
```

### Landing Pages
**Create Landing Page:**
```
POST /cms/v3/pages/landing-pages
```

**Required Fields:**
- `name` — Internal name
- `slug` — URL path
- `layoutSections` — Page content

### Marketing Emails
**Create Marketing Email:**
```
POST /marketing/v3/emails
```

**Required Fields:**
- `name` — Email name
- `subject` — Subject line (≤50 chars)
- `fromName` — Sender name
- `content` — Email HTML

### Files
**Upload File:**
```
POST /files/v3/files
```

Use for image uploads before referencing in content.

---

## Content Workflow

### Phase 1: Create as Draft (DEFAULT)
All content should be created as drafts first:
```json
{ "state": "DRAFT" }
```

### Phase 2: Publish (EXPLICIT COMMAND ONLY)
Only publish when explicitly told to:
```json
{ "state": "PUBLISHED" }
```

Or use publish action:
```
POST /cms/v3/blogs/posts/{postId}/publish-action
```
```json
{ "action": "schedule-publish" }
```

---

## HubSpot CLI Commands

### Prerequisites
```bash
npm install -g @hubspot/cli
```

### Configuration File
`hubspot.config.yml` in project root:
```yaml
defaultPortal: mdd-production
portals:
  - name: mdd-production
    portalId: 585393
    authType: personalaccesskey
    personalAccessKey: <TOKEN>
```

### Common Commands

**Authenticate:**
```bash
hs auth
```

**Upload Theme:**
```bash
hs upload mdd-theme mdd-theme-review
```

**Watch for Changes:**
```bash
hs watch mdd-theme mdd-theme-review
```

**List Files:**
```bash
hs ls mdd-theme-review
```

---

## Page Reference

### Staging URLs
| Page | ID | URL |
|------|----|-----|
| Homepage | 209072718456 | /preview-home |
| Key Tracking | 209072718466 | /preview-key-tracking |
| Lot Management | 209072718479 | /preview-lot-management |
| Service Workflow | 209072718484 | /preview-service-workflow |
| Recon Workflow | 209072718486 | /preview-recon-workflow |
| VehicleVault | 209072718488 | /preview-vehiclevault |
| How It Works | 209072718490 | /preview-how-it-works |
| Proof | 209072718493 | /preview-proof |
| Contact Us | 209069682084 | /preview-contact-us |

### Re-publish All Pages
After template changes, re-publish all pages:
```bash
TOKEN="<your-token>"
PAGE_IDS=(209072718456 209072718466 209072718479 209072718484 209072718486 209072718488 209072718490 209072718493 209069682084)

for ID in "${PAGE_IDS[@]}"; do
  curl -s -X POST "https://api.hubapi.com/content/api/v2/pages/$ID/publish-action" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"action": "schedule-publish"}'
done
```

---

## Theme Structure

```
mdd-theme/
├── css/
│   └── theme.css
├── partials/
│   ├── header.html
│   └── footer.html
├── templates/
│   ├── base.html
│   └── [page templates]
└── mdd-assets/
    └── [images]
```

### Path Resolution
Templates are in `templates/` folder. Paths must go UP one level:
- CSS: `../css/theme.css`
- Partials: `../partials/header.html`
- Assets: `../mdd-assets/image.png`

---

## Troubleshooting

### Changes Not Appearing
1. Re-upload entire theme: `hs upload mdd-theme mdd-theme-review`
2. Re-publish all pages
3. Hard refresh browser (Ctrl+Shift+R)
4. Try incognito/private window

### Authentication Errors
1. Run `hs auth` to re-authenticate
2. Check `hubspot.config.yml` has valid token
3. Verify token has CMS scopes

### 404 Errors
1. Verify page exists and is published
2. Check link href matches page slug exactly
3. Re-publish pages after template changes

---

## Best Practices

### Blog Posts
- SEO title ≤60 characters
- Meta description ≤155 characters
- Include H2/H3 heading structure
- Featured image required
- 800-1200 words for standard posts
- Internal links to related MDD content
- URL slug: lowercase, hyphens, no dates

### Landing Pages
- Mobile-responsive required
- Above-the-fold CTA required
- Phone number always visible: 844-292-7110
- Follow 10-section structure (see 15-landing-page-template.md)

### Marketing Emails
- Subject line ≤50 characters
- Preheader text ≤100 characters
- Single primary CTA button
- Plain-text fallback required
- Unsubscribe link required
- Company address in footer
