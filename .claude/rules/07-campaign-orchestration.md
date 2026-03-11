# Campaign Orchestration

Rules governing how campaigns are created, structured, and executed.

---

## Campaign Folder Structure

Every campaign gets its own dated folder:

```
campaigns/YYYY-MM-DD_campaign-slug/
├── manifest.json
├── landing-page.html
├── blog-post.md
├── press-release.md
├── linkedin-post-01.md
├── linkedin-post-02.md
├── linkedin-post-03.md
├── linkedin-post-04.md
├── linkedin-post-05.md
├── facebook-post-01.md
├── email-01-subject.md
├── email-02-subject.md
├── email-03-subject.md
├── email-04-subject.md
├── email-05-subject.md
└── publish-log.json
```

### Naming Convention
- **Folder:** `YYYY-MM-DD_campaign-slug` (e.g., `2026-03-11_service-workflow-launch`)
- **Files:** `content-type-##.md` or `content-type.md` for single items

---

## Manifest.json Structure

Every campaign must have a manifest.json:

```json
{
  "campaign": "service-workflow-launch",
  "product": "Service Workflow",
  "target_persona": "Service Manager",
  "created": "2026-03-11T10:30:00Z",
  "created_by": "claude-code",
  "content": [
    {
      "type": "landing-page",
      "file": "landing-page.html",
      "platform": "hubspot",
      "status": "draft",
      "publish_date": null,
      "notes": ""
    },
    {
      "type": "blog-post",
      "file": "blog-post.md",
      "platform": "hubspot",
      "status": "draft",
      "publish_date": null,
      "notes": ""
    },
    {
      "type": "linkedin-post",
      "file": "linkedin-post-01.md",
      "platform": "linkedin",
      "status": "draft",
      "publish_date": null,
      "angle": "problem-pain",
      "notes": ""
    }
  ]
}
```

### Manifest Fields
| Field | Description |
|-------|-------------|
| `campaign` | URL-safe campaign slug |
| `product` | Primary MDD product featured |
| `target_persona` | Primary persona being targeted |
| `created` | ISO-8601 timestamp |
| `created_by` | "claude-code" |
| `content[]` | Array of content items |
| `content[].type` | Content type |
| `content[].file` | Filename in campaign folder |
| `content[].platform` | Target platform |
| `content[].status` | "draft", "scheduled", or "published" |
| `content[].publish_date` | ISO-8601 timestamp or null |
| `content[].angle` | Messaging angle used (for multi-post content) |
| `content[].notes` | Any additional notes |

---

## Content Generation Order

Generate content in dependency order (later content links to earlier):

1. **Landing page** — All other content will link here
2. **Blog post** — SEO anchor, linked from social and email
3. **Press release** — Formal announcement if applicable
4. **Email sequence** — Each email links to landing page, references blog
5. **LinkedIn posts** — Link to landing page or blog, drip over multiple days
6. **Facebook posts** — Link to landing page, visual emphasis

---

## Cross-Linking Rules

### Every Social Post
- Includes the landing page URL
- May reference blog post for additional context

### Every Email
- CTA links to the landing page
- May reference blog post in body

### Blog Post
- Links to product page on mdd.io
- Links to the campaign landing page
- Internal links to related MDD blog content

### Press Release
- Includes company URL (mdd.io)
- Includes demo booking link
- Links to landing page in body

---

## Content Variation Rules

### Multi-Post Campaigns (e.g., 5 LinkedIn posts)

Each post must use a DIFFERENT angle from `12-messaging-angles.md`:

| Post | Angle | Description |
|------|-------|-------------|
| 01 | Problem/Pain | Lead with the frustrating scenario |
| 02 | Feature Spotlight | Explain one specific capability |
| 03 | Social Proof | Named dealership success story |
| 04 | Thought Leadership | Industry insight or provocative stat |
| 05 | CTA/Demo | Direct invitation with proof |

**Rule:** Never repeat the same angle twice in a campaign.

---

## Two-Phase Execution

### Phase 1: Create (DEFAULT)
Generate all content, save to campaign folder, create manifest.

**Do NOT call any APIs.**

This is the default behavior unless explicitly told otherwise.

### Phase 2: Publish (EXPLICIT COMMAND ONLY)
When told "publish the [campaign-name] campaign":
1. Read the manifest
2. Execute API calls via scripts
3. Update manifest with publish status
4. Write publish-log.json

### Dry-Run Mode
When `--dry-run` is included:
- Show what would be published
- Don't execute any API calls
- Log the planned actions

---

## Scheduling Defaults

### Email Sequences

**5-email sequence:**
| Email | Day |
|-------|-----|
| Email 1 | Day 0 |
| Email 2 | Day 3 |
| Email 3 | Day 7 |
| Email 4 | Day 10 |
| Email 5 | Day 14 |

**3-email sequence:**
| Email | Day |
|-------|-----|
| Email 1 | Day 0 |
| Email 2 | Day 5 |
| Email 3 | Day 10 |

### LinkedIn Posts

**5 posts:** Dripped over 5 business days (Mon-Fri)
**3 posts:** Dripped MWF

---

## Campaign Types

### Product Launch Campaign
Full multi-channel campaign for a new product or major feature.

**Content:**
- 1 landing page
- 1 blog post
- 1 press release
- 5 emails
- 5 LinkedIn posts
- 3 Facebook posts

### Case Study Campaign
Campaign built around a customer success story.

**Content:**
- 1 landing page (optional)
- 1 blog post (case study format)
- 3 LinkedIn posts
- 2 Facebook posts
- 3 emails

### Pain Point Campaign
Campaign targeting a specific pain point.

**Content:**
- 1 landing page
- 1 blog post
- 5 emails (cold outbound)
- 3 LinkedIn posts

---

## Content Checklist

Before completing a campaign:

- [ ] All content generated in dependency order
- [ ] Landing page URL consistent across all content
- [ ] Each social post uses a different angle
- [ ] Email sequence follows scheduling defaults
- [ ] All proof points attributed to named dealerships
- [ ] CTAs drive to demo (not "learn more")
- [ ] manifest.json complete and accurate
- [ ] No forbidden phrases (per 05-brand-voice.md)
- [ ] Target persona appropriate for products pitched

---

## Example Campaign Prompt

To generate a campaign, Claude Code might receive:

```
Create a Service Workflow campaign targeting Service Managers.
Focus on the cycle time pain point.
Use the Corwin Toyota case study as the primary proof point.
Generate: landing page, blog post, 5 LinkedIn posts, 5 cold emails.
```

Claude Code will:
1. Read relevant rules files (05, 07, 11, 06, 01, 03, 12, 09)
2. Create campaign folder: `campaigns/2026-03-11_service-workflow-cycle-time/`
3. Generate content in dependency order
4. Create manifest.json
5. Report completion (without publishing)
