# PROMPT: Build the MDD Marketing Machine

## CONTEXT

You are building a Claude Code CLI-powered marketing automation project called `mdd-marketing-machine` for Mobile Dealer Data (MDD), an automotive technology company that builds Real-Time Location Systems (RTLS) for car dealerships. This project lives in VS Code and is managed via Claude Code CLI. When complete, a single prompt to Claude Code should produce a full multi-channel marketing campaign — content created, files saved with campaign metadata, and posts ready for publishing to HubSpot CMS, LinkedIn, and Facebook.

I am sharing 8 source documents alongside this prompt. Read ALL of them before generating any files. These are your primary source material:

**Source documents (loaded with this prompt):**

1. `Adstra__Model_3-7-26.docx` — Master brief with product descriptions, 2 full customer testimonials (Bill Brown Ford, Corwin Toyota), 5 buyer personas with Account Manager corrections, ~30 existing email templates, pricing model, competitor names, and CTA strategy. THIS IS THE RICHEST SOURCE DOCUMENT.

2. `Adstra_ChatGPT_Model_Response_3-7-26.docx` — Marketing agency AI analysis of MDD's messaging. Contains the critical "dealer language vs vendor language" framework, diagnosis of why current emails underperform, 3 strongest sales angles, LocateIQ positioning as "unique mechanism," and 10 rewritten cold outbound emails that are significantly better than the originals.

3. `Adstra_Research_GPT_2-28-26_MDD.docx` — The "Revenue-First Direct Response Growth Model" marketing framework (based on Sabri Suby, Russell Brunson, Eugene Schwartz). Contains the 7-part framework, funnel diagram, and value ladder model that should govern how campaigns are structured.

4. `Rough_Draft_Segmentation__AM_feedback.docx` — Formal persona document with highlighted corrections from MDD's Account Manager (real dealership operator). Contains ground-truth feedback that overrides theoretical personas. Includes data points (90% reduction in key retrieval time, etc.) and a product-to-persona targeting matrix.

5. `VehicleVault-6.pptx` — 11-slide sales deck covering the full MDD platform. Contains all customer names, specific metrics/stats, testimonial quotes, and pricing structure.

6. `LP_MDD_Locate-2.html` — Live landing page for MDD Locate product. Defines current brand voice, visual identity, and page structure.

7. `LP_Service_Recon_Workflow-2.html` — Live landing page for Service & Recon Workflow. Same brand voice and structure pattern.

8. `LP_VehicleVault_FI-2.html` — Live landing page for VehicleVault F&I product. Same brand voice and structure pattern.

---

## INSTRUCTIONS

Build the complete `mdd-marketing-machine` project. Create every file listed below. Do not skip any file. Do not leave placeholder content — every file must contain real, usable content extracted and structured from the source documents.

Work in this order:
1. Create the full directory structure
2. Create CLAUDE.md (root)
3. Create all .claude/rules/ files (00 through 15)
4. Create the knowledge/ directory and migrate all source content
5. Create the templates/ directory with all content templates
6. Create the scripts/ directory with all API integration scaffolding
7. Create the campaigns/ directory structure
8. Create the assets/ directory with brand guide
9. Create package.json, .env.example, and README.md

---

## DIRECTORY STRUCTURE

Create this exact structure:

```
mdd-marketing-machine/
├── CLAUDE.md
├── .claude/
│   └── rules/
│       ├── 00-index.md
│       ├── 01-products.md
│       ├── 02-competitors.md
│       ├── 03-proof-points.md
│       ├── 04-hubspot-deployment.md
│       ├── 05-brand-voice.md
│       ├── 06-platform-specs.md
│       ├── 07-campaign-orchestration.md
│       ├── 08-seo-guidelines.md
│       ├── 09-email-sequences.md
│       ├── 10-image-assets.md
│       ├── 11-personas.md
│       ├── 12-messaging-angles.md
│       ├── 13-pricing-model.md
│       ├── 14-marketing-framework.md
│       └── 15-landing-page-template.md
├── templates/
│   ├── landing-page/
│   │   ├── product-feature.html
│   │   └── campaign-launch.html
│   ├── email/
│   │   ├── cold-outbound.md
│   │   ├── nurture-sequence.md
│   │   └── persona-specific/
│   │       ├── owner-gm.md
│   │       ├── service-manager.md
│   │       ├── sales-manager.md
│   │       └── fi-manager.md
│   ├── blog/
│   │   └── product-feature.md
│   ├── social/
│   │   ├── linkedin-post.md
│   │   ├── facebook-post.md
│   │   └── linkedin-article.md
│   ├── press-release/
│   │   └── standard.md
│   └── one-pager/
│       └── product-feature.md
├── scripts/
│   ├── hubspot/
│   │   ├── hubspot-client.js
│   │   ├── publish-blog.js
│   │   ├── publish-landing-page.js
│   │   └── create-email-campaign.js
│   ├── linkedin/
│   │   ├── linkedin-client.js
│   │   ├── publish-post.js
│   │   └── refresh-token.js
│   ├── facebook/
│   │   ├── facebook-client.js
│   │   ├── publish-post.js
│   │   └── refresh-token.js
│   └── orchestrator/
│       ├── campaign-runner.js
│       ├── file-manager.js
│       └── publish-tracker.js
├── campaigns/
│   └── .gitkeep
├── knowledge/
│   ├── source-docs/
│   │   ├── adstra-model-brief.md
│   │   ├── adstra-improved-emails.md
│   │   ├── adstra-marketing-framework.md
│   │   └── segmentation-am-feedback.md
│   ├── case-studies/
│   │   ├── bill-brown-ford.md
│   │   ├── corwin-toyota.md
│   │   ├── brandon-honda.md
│   │   └── longo-toyota.md
│   ├── email-examples/
│   │   ├── original/
│   │   │   ├── owner-gm-sequence.md
│   │   │   ├── service-manager-sequence.md
│   │   │   ├── sales-manager-sequence.md
│   │   │   └── recon-sequence.md
│   │   └── improved/
│   │       ├── cold-outbound-10-email.md
│   │       └── full-solution-5-email.md
│   ├── landing-pages/
│   │   └── README.md
│   ├── sales-deck/
│   │   └── vehiclevault-deck-content.md
│   └── pricing/
│       └── pricing-model.md
├── assets/
│   ├── logos/
│   │   └── .gitkeep
│   ├── screenshots/
│   │   └── .gitkeep
│   ├── icons/
│   │   └── .gitkeep
│   └── brand-guide.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## FILE-BY-FILE SPECIFICATIONS

### CLAUDE.md (Root)

This is the master context file Claude Code reads on every invocation. It must be concise but comprehensive. Write it as follows:

```
# MDD Marketing Machine

## What This Project Is
A Claude Code CLI-powered marketing automation system for Mobile Dealer Data (MDD). Prompt once, get a complete multi-channel campaign — content created, files saved, ready for publishing.

## Company
Mobile Dealer Data (MDD) — automotive technology company building Real-Time Location Systems (RTLS) for car dealerships. Website: mdd.io. Tagline: "We Find Keys & Cars™". Phone: 844-292-7110. Address: 5600 Pioneer Creek Drive, Maple Plain, MN 55359.

## Products
- **MDD Locate** — Bluetooth key & vehicle tracking. Flagship product.
- **Service Workflow** — Automated service lane workflow powered by LocateIQ.
- **Recon Workflow** — Automated reconditioning pipeline powered by LocateIQ.
- **VehicleVault** — F&I consumer product. Dealer-branded app with key tracking for customers.
- **LocateIQ** — The underlying technology. Workflow automation powered by real vehicle location. This is our differentiator. Pronounced "locate IQ."

## Key Rules
All rules files are in `.claude/rules/`. Read them before generating any content.
- `05-brand-voice.md` governs ALL content tone and style. READ THIS FIRST.
- `11-personas.md` determines WHO content targets and which products to pitch/avoid per persona.
- `07-campaign-orchestration.md` governs HOW campaigns are structured and saved.
- `06-platform-specs.md` defines per-platform constraints (char limits, formatting, etc.).

## Campaign Workflow
1. Read the prompt to understand what campaign is needed.
2. Read relevant rules files for context.
3. Create campaign folder: `campaigns/YYYY-MM-DD_campaign-slug/`
4. Generate content in dependency order (landing page → blog → press release → emails → social).
5. Save all files to campaign folder with manifest.json.
6. Do NOT publish unless explicitly told to. Default is create-only.

## CTA Strategy
Always drive to demo/consult. Never "learn more." Every dealership is different — the sales team customizes. Default CTA: "Schedule a 15-Min Demo →" or "Schedule Your Demo →". Phone: 844-292-7110.

## Named Customers (approved for use in content)
Bill Brown Ford, Corwin Toyota, Longo Toyota, Brandon Honda (Morgan Automotive Group), Penske Motor Group, Penske Automotive.

## Reference Material
Source documents and reference content are in `knowledge/`. Case studies, email examples, landing page references, and the sales deck are all there.
```

---

### .claude/rules/00-index.md

```
# Rules Index

These rules files govern all content generation in the MDD Marketing Machine. Claude Code MUST read relevant files before generating any content.

## Load Order (by priority)
1. `05-brand-voice.md` — READ FIRST for any content generation task
2. `11-personas.md` — READ for any persona-targeted content
3. `07-campaign-orchestration.md` — READ for any multi-piece campaign
4. `06-platform-specs.md` — READ for any platform-specific content
5. `01-products.md` — READ for product details
6. `03-proof-points.md` — READ for stats, quotes, and customer references
7. `12-messaging-angles.md` — READ for email and social content
8. `09-email-sequences.md` — READ for any email content
9. `02-competitors.md` — READ for competitive positioning
10. `14-marketing-framework.md` — READ for campaign strategy decisions
11. `15-landing-page-template.md` — READ for landing page creation
12. `08-seo-guidelines.md` — READ for blog and landing page SEO
13. `13-pricing-model.md` — READ when pricing is referenced
14. `10-image-assets.md` — READ when images/screenshots are needed
15. `04-hubspot-deployment.md` — READ for HubSpot publishing

## Rule: When in doubt, read more files rather than fewer.
```

---

### .claude/rules/01-products.md

Extract ALL product information from `Adstra__Model_3-7-26.docx` and the 3 landing pages. Structure it as:

**For each product (MDD Locate, Service Workflow, Recon Workflow, VehicleVault, LocateIQ), include:**
- Product name and category
- One-sentence description
- How it works (technical summary — tag/track/manage for Locate, auto-advance for workflows, F&I for VehicleVault)
- Key features (from landing pages — list every feature mentioned)
- Key benefits by persona (from the Adstra Model doc — different personas care about different benefits)
- The specific problem it solves (in dealer language, not vendor language)
- Integration points (DMS systems: Reynolds & Reynolds, CDK)
- Important notes/caveats (e.g., "Not an anti-theft device" from the deck)

**Critical product details to include:**
- LocateIQ is the differentiator. It's the reason MDD workflows are better than competitors. Because MDD knows where the car physically is, workflows advance automatically. Other tools rely on manual status updates.
- VehicleVault is an F&I product the dealership "sells" with the car. Customer gets 2 Bluetooth trackers for their key fobs + a dealer-branded app. Dealership gets high-margin recurring revenue with zero chargebacks.
- "We Find Keys & Cars™" is the registered tagline.
- The flow is: Tag → Track → Manage.
- MDD hardware is Bluetooth-based (like AirTags), NOT GPS. This matters because GPS doesn't work well indoors where cars at dealerships often are.

---

### .claude/rules/02-competitors.md

Extract from `Adstra__Model_3-7-26.docx`. Structure as:

**Competitors:**
- **TrueSpot** — Closest competitor on location/tracking. Direct competitor to MDD Locate.
- **LoJack** — GPS-based solution. Weakness: doesn't work well indoors where dealership cars often are. MDD's Bluetooth approach is superior for indoor/lot environments.
- **Rapid Recon** — Recon workflow competitor. Weakness: relies on manual status updates. MDD's LocateIQ auto-advances workflows based on physical vehicle location.
- **Key lock box systems** — Legacy approach. Only creates accountability, not location. "Only as good as the last person that took the key."

**Competitive positioning rules:**
- NEVER name competitors directly in customer-facing content. Use category references: "legacy lot management systems," "GPS-based solutions," "manual workflow tools."
- ALWAYS position LocateIQ as the differentiator: "Other workflow tools rely on someone remembering to update the system. MDD's doesn't."
- The VS comparison format from the Service/Recon landing page is the approved competitive positioning structure.

**MDD's unfair advantages:**
1. Bluetooth > GPS for indoor/lot environments
2. LocateIQ auto-advances workflows (no manual updates)
3. Single platform for locate + workflow + F&I (competitors only do one)
4. 10+ years of dealer feedback baked into the product
5. Named enterprise customers (Bill Brown Ford, Penske, Morgan Auto Group)

---

### .claude/rules/03-proof-points.md

Extract ALL stats, quotes, and customer references from ALL source documents. Structure as a queryable database:

**Stats by dealership:**

```
## Bill Brown Ford (Livonia, MI)
- Type: World's largest Ford dealership
- Contact: Dave Bird, New Car Inventory Manager (15 years experience)
- Vehicles tracked: 2,000+ across multiple lots
- Sales team adoption: 90% of 29-person new car sales team
- Time saved per delivery: 20 minutes
- Lots: 2 adjacent lots (800 units each) + additional lots (1,000 and 1,700 cars)
- DMS: Reynolds & Reynolds
- Used car operation: 500 vehicles (managed by John Justice, planning implementation)
- Quote: "Mobile Dealer Data allows us to instantly locate the exact position of 2,000 vehicles spread across several lots. This means we can prepare a vehicle for delivery or a show-ready status without the delays caused by previous key location methods." — Dave Bird
- Quote: "MDD allows me to verify if the key control system is securing the vehicle key or if it has been taken by an individual. We can trace it back to someone's desk or the lot." — Dave Bird
- Landing page quote: "MDD instantly locates 2,000 vehicles on multiple lots all over town. We get cars customer-delivered without delays." — Dave Bird

## Corwin Toyota (Colorado Springs, CO)
- Type: Toyota dealership
- Contact: Warren Weimer, Service & Parts Director (former Master Technician)
- Problem: Express service wait times at 2.5 hours
- Results: 64% of customers out within 60 minutes
- Results: 96% of services completed within 90 minutes
- Results: Average wait time cut from 2.5 hours to under 90 minutes
- Results: Bay turns increased 40-60%
- Results: Significant uptick in Toyota Loyalty and Engagement scores and CSI
- Quote: "No one wants to wait two hours for an oil change." — Warren Weimer
- Quote: "With this cycle time tool, we know at the 40-minute mark whether we're having an issue with a particular delivery. We can get help there immediately to meet our delivery promise." — Warren Weimer
- Quote: "We now communicate with customers more efficiently. I have a quick snapshot of capacity and can book that appointment today, so it doesn't float down the street." — Warren Weimer

## Longo Toyota
- Contact: Mark Seipel, Fixed Operations Director
- Time saved per repair order: 15 minutes
- Time saved per car in reconditioning: 3 days
- Quote: "MDD delivers on its promises. Locating a vehicle went from 25 minutes to seconds. Every dealer needs these results." — Mark Seipel

## Brandon Honda (Morgan Automotive Group)
- Additional F&I revenue: $308K per month from VehicleVault
- Time saved per repair order: 41 minutes
- Chargebacks: Zero across all MDD dealers
- Quote: "No longer loses keys, shaved 41 minutes per RO in service, and generates an additional $308K per month selling VehicleVault."

## Ed French (AutoProfit Group)
- Role: President, veteran in dealership performance enhancement
- Quote: "Service managers often focus on stacking work into each repair order. But cycle time management looks at how to add more billable hours through efficiency."
```

**Aggregate stats (for general use):**
- 90% reduction in key retrieval time
- 85% reduction in vehicle location time
- 25% reduction in repair cycle time
- 35% reduction in days to lot for recon work
- Zero chargebacks across all MDD dealers using VehicleVault
- 100% dealer-branded customer app

**Rules for using proof points:**
- ALWAYS attribute stats to a named dealership. Never say "dealerships see 40% improvement" — say "Corwin Toyota increased bay turns 40-60%."
- Match proof points to the persona you're targeting. Service Manager gets Corwin Toyota cycle time story. F&I Manager gets Brandon Honda $308K/mo story. GM/Owner gets Bill Brown Ford scale story.
- Use the exact quote text. Do not paraphrase testimonials.

---

### .claude/rules/04-hubspot-deployment.md

Write HubSpot CMS deployment rules:

- HubSpot CMS Blog Posts API: `POST /cms/v3/blogs/posts` with `state: "PUBLISHED"` to publish immediately
- Landing Pages API: `POST /cms/v3/pages/landing-pages`
- Marketing Emails API: `POST /marketing/v3/emails`
- Files API: `POST /files/v3/files` for image uploads
- Auth: Bearer token via Private App (stored in `.env` as `HUBSPOT_ACCESS_TOKEN`)
- Blog posts require: `name`, `contentGroupId`, `slug`, `blogAuthorId`, `metaDescription`, `postBody`
- All content should be created as drafts first, then published on explicit command
- HubSpot portal ID and blog ID stored in `.env`

---

### .claude/rules/05-brand-voice.md — THIS IS THE MOST IMPORTANT FILE

Analyze ALL 3 landing pages (`LP_MDD_Locate-2.html`, `LP_Service_Recon_Workflow-2.html`, `LP_VehicleVault_FI-2.html`) and the Adstra ChatGPT response (`Adstra_ChatGPT_Model_Response_3-7-26.docx`) to extract the voice patterns.

**Structure this file with these sections:**

**1. Core Principle**
Dealer language, not vendor language. Every sentence should make a dealership operator think "this was written by someone who's been on the lot." If it sounds like it came from a software vendor's marketing department, rewrite it.

**2. The Saturday Test**
Before publishing any content, apply this test: Would a GM reading this on their phone between meetings stop and read it? If not, rewrite.

**3. Forbidden Phrases — NEVER use these:**
(Extract from the Adstra ChatGPT analysis — these are the "vendor brochure" phrases that dealership operators ignore)
- "streamline operations"
- "enhance efficiency"
- "cutting-edge solution"
- "cutting-edge technology"
- "innovative technology"
- "leverage our platform"
- "best-in-class"
- "state-of-the-art"
- "revolutionize your [anything]"
- "unlock potential"
- "unlock new levels"
- "empower your team" (when generic)
- "transform your [anything]" (when generic)
- "seamless integration" (when filler)
- "holistic approach"
- "synergy"
- "paradigm shift"
- "disruptive"
- "next-generation"
- "world-class"
- Any phrase that could describe ANY SaaS product without modification

**4. Required Voice Characteristics**
- **Scenario-first:** Lead with a moment they recognize. "It's Saturday at 11:30. A customer is ready to buy. Your salesperson can't find the key." NOT "Our solution improves key management efficiency."
- **Stat-backed:** Every benefit claim must link to a named dealership and a specific number. Never make vague claims.
- **Short sentences:** Average 8-12 words in social and email. Landing pages can go longer but keep paragraphs short.
- **LocateIQ as the mechanism:** Not "our tracking system" — "LocateIQ, automation powered by real vehicle location." This is the unique mechanism that differentiates MDD.
- **Demo as CTA:** Always drive to demo/consult. Never "learn more," never "download our whitepaper," never "contact us." The CTA is always a 15-minute demo.
- **Conversational authority:** Write like a knowledgeable peer who's spent time on dealership lots, not like a vendor pitching software.
- **One pain per piece:** Each email, each social post, each ad focuses on ONE specific pain point. Don't try to cover everything.
- **Specific over general:** "Corwin Toyota cut wait times from 2.5 hours to under 90 minutes" beats "reduce your service wait times significantly."

**5. Tone by Channel**
- **Cold email:** Pattern interrupt subject line. Under 120 words. One pain per email. Soft CTA: "Worth seeing?" or "Curious if something like that would help?" or "Would it be crazy to show you?" Never hard-sell.
- **LinkedIn:** Executive/thought-leadership. Open with an industry insight or provocative stat. Never sell directly. Position MDD as the expert, not the vendor. Use line breaks for readability. 3-5 hashtags max at bottom.
- **Facebook:** Visual, conversational, community-oriented. Dealership culture, team wins, customer stories. Shorter than LinkedIn.
- **Landing page:** Scannable, stat-heavy. Structure: problem → solution → proof → CTA. Dark theme with green accent (per existing brand). Short punchy headlines.
- **Blog:** SEO-friendly, educational, 800-1200 words. Positions MDD as thought leaders. Internal links to product pages and other blog posts.
- **Press release:** AP style. Factual. Quote-heavy. Dateline format. Boilerplate paragraph at end with company description.
- **One-pager / Product sheet:** Benefit-focused, visual, scannable. Stats prominent. Single CTA.

**6. Vocabulary Rules**
- Always "dealership" not "dealer" in formal content (unless in a quote or conversational context)
- Always "vehicle" not "car" in formal content (except in conversational contexts like emails and social)
- "Locate" (capitalized) = the product. "locate" (lowercase) = the verb. Avoid ambiguity.
- "LocateIQ" is always one word, capital L capital I capital Q. Never "Locate IQ" or "locateiq."
- "VehicleVault" is always one word, capital V capital V. Never "Vehicle Vault" (exception: the deck says "Vehicle Vault" — standardize to VehicleVault going forward).
- "We Find Keys & Cars™" — always include the ™
- Service Workflow and Recon Workflow are proper nouns. Always capitalized.
- "bay turns" not "bay utilization" — use the dealer's language
- "RO" is acceptable shorthand for "repair order" when writing to service managers
- "CSI" for Customer Satisfaction Index — service managers know this acronym intimately
- "F&I" for Finance & Insurance — always use the ampersand, never "Finance and Insurance" in casual copy
- "DMS" for Dealer Management System — never spell it out unless in first reference for external audiences
- "20 Group" — peer advisory boards in automotive. Not tied to a specific number of dealerships. NADA and NCM Associates are the popular moderators.

**7. Anti-Pattern Examples**
Show 3-5 examples of bad copy vs good copy extracted from the Adstra ChatGPT analysis:

BAD (vendor language): "Improve operational efficiency with our tracking solution."
GOOD (dealer language): "It's Saturday at 11:30. A customer is ready to buy. Your salesperson can't find the key."

BAD: "Streamline your service operations with our cutting-edge workflow system."
GOOD: "Corwin Toyota's express service wait times were at 2.5 hours. Now 64% of customers are out within 60 minutes."

BAD: "Leverage our innovative technology to enhance inventory management."
GOOD: "Bill Brown Ford tracks 2,000+ vehicles across multiple lots. Their inventory manager said it eliminated hours of searching every week."

BAD: "Our solution provides a holistic approach to dealership efficiency."
GOOD: "Your workflow dashboard looks organized. But is it accurate? Someone has to remember to log that a car left the bay. They often don't."

BAD: "Unlock new revenue streams with our F&I integration."
GOOD: "Brandon Honda generates an additional $308K per month selling VehicleVault. Zero chargebacks."

---

### .claude/rules/06-platform-specs.md

Write hard constraints for each publishing platform:

**LinkedIn Posts:**
- Max 3,000 characters
- First 2 lines visible before "see more" — this is the hook. Must compel a click.
- 3-5 hashtags at the bottom. Never in the body text.
- No emojis in the first line.
- Use line breaks generously for readability (dealership operators skim on phones).
- Tag @Mobile Dealer Data company page when relevant.
- Never pitch directly. Thought leadership and pain-calling only.
- Post as the company page, not personal profile.

**Facebook Page Posts:**
- Ideal length: 40-80 words for link posts, up to 150 for story posts.
- Link posts auto-preview via Open Graph meta tags from target URL.
- Image posts get higher organic reach — prefer images when possible.
- Include a CTA but keep it conversational.
- More casual tone than LinkedIn.

**HubSpot Blog:**
- SEO title: ≤60 characters
- Meta description: ≤155 characters
- Must include H2/H3 heading structure
- Featured image required (reference from assets or image-assets.md)
- 800-1200 words for standard posts
- Internal links to related MDD content (product pages, other blog posts)
- URL slug: lowercase, hyphens, no dates in slug

**HubSpot Landing Page:**
- Mobile-responsive required
- Above-the-fold CTA required
- Follow the 10-section structure from existing landing pages (see 15-landing-page-template.md)
- HubL template language where applicable
- Form placement in CTA section
- Phone number always visible: 844-292-7110

**HubSpot Marketing Email:**
- Subject line: ≤50 characters
- Preheader text: ≤100 characters
- Single primary CTA button
- Plain-text fallback required
- Unsubscribe link required
- Company address in footer: 5600 Pioneer Creek Drive, Maple Plain, MN 55359
- Phone: 844-292-7110

**Press Release:**
- AP style formatting
- Dateline: CITY, STATE, Month Day, Year
- Boilerplate paragraph about MDD at end
- Contact information block
- ###  at end

**Cold Email (via HubSpot or external):**
- Under 120 words
- No images (deliverability)
- Personalization tokens: {{FirstName}}, {{Dealership}}, {{SenderName}}
- Signature format: SenderName + company + address + phone + unsubscribe

---

### .claude/rules/07-campaign-orchestration.md

Write the rules governing campaign creation and execution:

**Campaign folder structure:**
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
├── email-01-subject.html
├── email-02-subject.html
├── email-03-subject.html
├── email-04-subject.html
├── email-05-subject.html
└── publish-log.json
```

**Manifest.json structure:**
```json
{
  "campaign": "campaign-slug",
  "product": "product-name",
  "target_persona": "persona-name",
  "created": "ISO-8601-timestamp",
  "created_by": "claude-code",
  "content": [
    {
      "type": "landing-page",
      "file": "landing-page.html",
      "platform": "hubspot",
      "status": "draft",
      "publish_date": null,
      "notes": ""
    }
  ]
}
```

**Content generation order (dependency order — later content links to earlier):**
1. Landing page (all other content will link here)
2. Blog post (SEO anchor, linked from social and email)
3. Press release (formal announcement if applicable)
4. Email sequence (each email links to landing page, references blog)
5. LinkedIn posts (link to landing page or blog, drip over multiple days)
6. Facebook posts (link to landing page, visual emphasis)

**Cross-linking rules:**
- Every social post includes the landing page URL
- Every email CTA links to the landing page
- Blog post links to the product page on mdd.io and the landing page
- Press release includes company URL and demo booking link

**Content variation rules for multi-post campaigns (e.g., 5 LinkedIn posts):**
Each post must use a DIFFERENT angle from `12-messaging-angles.md`:
1. Problem/Pain angle — Lead with the frustrating scenario
2. Feature Spotlight angle — Explain one specific capability
3. Social Proof angle — Named dealership success story
4. Thought Leadership angle — Industry insight or provocative stat
5. CTA/Demo angle — Direct invitation with proof

**Two-phase execution:**
- Phase 1 (DEFAULT): Generate all content, save to campaign folder, create manifest. Do NOT call any APIs.
- Phase 2 (EXPLICIT COMMAND ONLY): When told "publish the [campaign-name] campaign," read the manifest and execute API calls via scripts.

**Dry-run mode:** When `--dry-run` is included, show what would be published but don't execute.

**Email scheduling defaults:**
- 5-email sequence: Day 0 / Day 3 / Day 7 / Day 10 / Day 14
- 3-email sequence: Day 0 / Day 5 / Day 10

**LinkedIn post scheduling defaults:**
- 5 posts dripped over 5 business days (Mon-Fri)
- 3 posts dripped MWF

---

### .claude/rules/08-seo-guidelines.md

Write SEO rules:

**Keyword clusters by product:**
- MDD Locate: "dealership key tracking," "vehicle location system," "lot management software," "car dealership inventory tracking," "Bluetooth vehicle tracking"
- Service Workflow: "dealership service workflow," "service lane cycle time," "automotive service management," "bay turn optimization," "service department efficiency"
- Recon Workflow: "vehicle reconditioning software," "recon workflow automation," "used car reconditioning," "recon cycle time," "days to frontline"
- VehicleVault: "dealership F&I products," "key tracking for customers," "dealer-branded customer app," "F&I recurring revenue," "vehicle ownership app"
- LocateIQ: "RTLS dealership," "real-time location system automotive," "automated workflow dealership," "location-based workflow automation"

**On-page rules:**
- Title tag: ≤60 chars, include primary keyword
- Meta description: ≤155 chars, include primary keyword and CTA
- H1: One per page, includes primary keyword
- H2/H3: Include secondary keywords naturally
- First 100 words: Include primary keyword
- Internal links: 2-3 per blog post to other MDD content
- Image alt text: Descriptive, include keyword where natural
- URL slug: Short, keyword-rich, no dates

**Content rules:**
- Blog posts: 800-1200 words
- Answer the searcher's question in the first paragraph
- Use schema markup for FAQ, HowTo, and Article where applicable
- Landing pages: No thin content. Every section adds unique value.

---

### .claude/rules/09-email-sequences.md

Extract the email framework from `Adstra_ChatGPT_Model_Response_3-7-26.docx` and structure it:

**Cold outbound principles:**
- The goal is NOT to sell MDD. The goal is to trigger a reply or demo conversation.
- Pattern interrupt subject lines (questions, scenarios — not benefit statements)
- Under 120 words per email
- One pain per email
- Soft CTA: "Worth seeing?" / "Curious?" / "Would it be crazy to show you?"
- Personalization: {{FirstName}}, {{Dealership}}, optionally {{InventoryCount}} or {{EmployeeCount}}
- Dealership operators skim emails on phones between meetings. Shorter = better.

**Cold outbound sequence structure (10 emails):**
1. Trigger Event — "Quick question about lost keys" (best opener)
2. Saturday Chaos — "Saturday at 11:30am" (scenario-based)
3. Big Dealer Proof — Bill Brown Ford story
4. Service Bottleneck — Corwin Toyota cycle time story
5. Inventory Cashflow — "Inventory sitting = cash sitting"
6. Lost Key Cost — "$300-$800 per key replacement"
7. Service Revenue — "Service wait times cut by 60%"
8. VehicleVault Upsell — "A new profit center for dealerships"
9. Simple Curiosity — "Do you already have this?"
10. Breakup — "Should I stop reaching out?"

**Product launch email sequence (5 emails):**
1. Announcement — What's new, key headline benefit
2. Feature Deep-Dive — How it works, LocateIQ mechanism
3. Social Proof — Named dealership results
4. Urgency/Scarcity — Limited implementation slots, calendar CTA
5. Last Chance — Final CTA, breakup-style

**Nurture sequence (5 emails):**
1. Problem Awareness — Scenario-based pain
2. Industry Trend — Why the market is shifting
3. Solution Overview — How MDD solves it
4. Case Study — Full named-dealer story
5. Demo CTA — Soft close

**Subject line formulas:**
- Question about [specific pain]: "Quick question about lost keys"
- Scenario: "Saturday at 11:30am"
- Proof/stat: "Service wait times dropping from 2.5 hrs"
- Social proof: "How the largest Ford dealer handles 2,000 cars"
- Cost/loss: "How much does a lost key cost?"
- Curiosity: "Do you already have this?"
- Breakup: "Should I stop reaching out?"

**Persona-specific email rules:**
- Owner/GM: Brand, profitability, operational efficiency angles
- Service Manager: CSI scores (tied to their pay), cycle times, billable hours. NEVER pitch VehicleVault.
- Sales Manager: Recon visibility, inventory turns, customer-ready vehicles
- F&I Manager: VehicleVault ONLY — profit per deal, recurring revenue, zero chargebacks
- Used Car Manager: Recon speed, days to frontline. NEVER pitch VehicleVault.

---

### .claude/rules/10-image-assets.md

```
# Image Assets

## Current Asset Locations
Images are stored in `assets/`. Screenshots, logos, and icons are organized by type.

## Logo Variants
- Primary logo: (to be added — reference mdd.io for current logo)
- VehicleVault logo: (to be added)
- Favicon: (to be added)

## Product Screenshots
- Reference the 3 landing pages in `knowledge/landing-pages/` for current visual style
- Landing pages contain embedded base64 images of dashboard, app, and workflow screenshots

## OG Image Specs by Platform
- LinkedIn: 1200x627px
- Facebook: 1200x630px
- HubSpot Blog: 1200x628px featured image
- Landing page hero: 1100px max-width, 16:9 or similar aspect ratio

## Image Guidelines
- Dark background (charcoal #1A1E24) preferred for product screenshots
- Green accent (#8AC833) for highlights and CTAs
- DM Sans font for any text overlays
- Never use stock photos of generic "technology" scenes
- Prefer actual product screenshots, dashboard views, or dealership photos
```

---

### .claude/rules/11-personas.md

Extract ALL persona data from `Rough_Draft_Segmentation__AM_feedback.docx` AND the persona sections in `Adstra__Model_3-7-26.docx`. Include ALL Account Manager corrections (the highlighted feedback). Structure as:

**For each persona (Owner, GM, Service Manager, Sales Manager, F&I Manager, Used Car Manager), include:**
- Name (use the persona names: Owner, General Manager "John", Service Manager "Peter", Sales Manager "Sam", F&I Manager, Used Car Manager)
- Demographics (education, age, gender where noted)
- Reports to
- Communication preferences (with AM corrections — e.g., "lots of gatekeeping to get to a GM via phone")
- Key responsibilities
- KPIs they're measured by (specific metrics)
- Primary goals
- How they gain information (with AM corrections — e.g., "20 Group" networking, Automotive News, NADA)
- Common challenges
- **Product benefit matrix:** Which MDD products to pitch, which specific benefits to emphasize, and which products to NEVER pitch. This is the most critical section.

**Include the targeting matrix as a quick-reference table:**

```
| Product | Owner | GM | Svc Mgr | Sales Mgr | F&I Mgr | Used Car Mgr |
|---------|-------|----|---------|-----------|---------|--------------|
| Key & Car Locate | YES (brand) | YES (ops cost) | YES (lost time) | YES (lost deals) | NO | YES (lost deals) |
| Service Workflow | YES (revenue) | YES (efficiency) | YES-PRIMARY (CSI + billable hrs) | INDIRECT (faster turnaround) | NO | INDIRECT (faster to lot) |
| Recon Workflow | YES (inventory turns) | YES (holding costs) | MAYBE | YES-PRIMARY (inventory status) | NO | YES-PRIMARY (cars to lot faster) |
| VehicleVault | YES (recurring revenue) | YES (profit/deal) | DO NOT PITCH | YES (profit/deal) | YES-PRIMARY (F&I product) | DO NOT PITCH |
```

**Critical AM feedback to include verbatim:**
- Owner: "Most concerned about the company brand, and value of the dealership."
- Owner: "They chase industry news, upcoming trends etc, rather than management skill development."
- GM: "There is a lot of gatekeeping to get to a GM via phone."
- Service Manager: "FODs and Service Managers have a higher focus on CSI scores than the rest of the dealership. Much of their pay plan and company OEM sponsorship is tied to that."
- Service Manager on VehicleVault: "He won't care until we have service communication integrated in the VV app."
- Sales Manager: "Think of him as the primary audience to know what is going on with his inventory and when each will be available for sale. This role is also an approving authority for the Recon Work."
- Used Car Manager: "The used car finding apps have increased the pressure — better close the deal quickly or the customer is off to the next dealership."
- Used Car Manager on VehicleVault: "Not sure the used car manager cares."

---

### .claude/rules/12-messaging-angles.md

Extract from `Adstra_ChatGPT_Model_Response_3-7-26.docx`:

**The 5 Proven Sales Angles:**

1. **The Saturday Chaos Angle** — "Customer ready to buy. Key missing. Sale stalls."
   - Pain: Lost deal + embarrassment
   - Best for: Owner, GM, Sales Manager
   - Example hook: "It's Saturday at 11:30. A customer is ready to buy. Your salesperson can't find the key."
   - Proof: Bill Brown Ford — 90% sales team adoption, 2,000+ vehicles tracked

2. **The Inventory Cashflow Angle** — "A $40K car sitting in recon is dead capital."
   - Pain: Money locked in slow recon, aging inventory
   - Best for: Owner, GM, Used Car Manager, Sales Manager
   - Example hook: "Every extra day a car sits in recon is cash sitting on the lot."
   - Proof: Longo Toyota — 3 days saved per car in reconditioning

3. **The Service Revenue Angle** — "Bay utilization and cycle time."
   - Pain: Long service wait times, low bay turns, lost customer-pay work to quick-lube competitors
   - Best for: Service Manager, GM, Owner
   - Example hook: "One Toyota store had express service wait times at 2.5 hours."
   - Proof: Corwin Toyota — 64% out in 60 min, 96% in 90 min, 40-60% increase in bay turns

4. **The Lost Key Cost Angle** — "$300-$800 per key replacement."
   - Pain: Quietly hemorrhaging money on lost keys
   - Best for: GM, Owner, Service Manager
   - Example hook: "Do you know how many keys your dealership replaces every year?"
   - Proof: Zero lost keys at Bill Brown Ford with MDD

5. **The VehicleVault Profit Angle** — "High-margin F&I product with zero chargebacks."
   - Pain: Need to increase F&I per-deal revenue, need recurring revenue
   - Best for: F&I Manager, Owner, GM, Sales Manager
   - Example hook: "Brandon Honda generates $308K/mo in additional F&I revenue."
   - Proof: Brandon Honda — $308K/mo, zero chargebacks

**Usage rules:**
- Multi-post campaigns MUST use different angles per piece. Never repeat the same angle twice in a campaign.
- Match angles to personas using the targeting matrix in 11-personas.md.
- Each angle has a natural "best" proof point — use it.

---

### .claude/rules/13-pricing-model.md

Extract from `Adstra__Model_3-7-26.docx` and `VehicleVault-6.pptx`:

```
# MDD Pricing Model

## Important Note
Pricing is customized per dealership. Below are general ranges for use in sales materials. Always drive to demo/consult for specific pricing.

## Structure
- **Installation:** One-time fee, varies by dealership size and configuration
- **Base amount:** Monthly base subscription
- **Workflow add-ons:** ~$400/month per workflow module (Service Workflow and/or Recon Workflow)
- **Per-tag fees:** ~$3/key/month + ~$3/car/month

## From Sales Deck (Public Pricing)
- Lot Management: Starting at $55 per vehicle
- Service Workflow: Included with qualifying volume
- F&I Integration (VehicleVault): Custom pricing based on term length and benefit package

## Rules for Content
- Never state exact pricing in marketing content unless referencing the public deck prices above
- Always frame as "starting at" or "custom based on your dealership's needs"
- The CTA is always to schedule a demo for custom pricing — never to "see our pricing page"
- VehicleVault pricing: "Pricing varies based on term length and benefit package. Contact your Mobile Dealer Data representative for a customized quote."
```

---

### .claude/rules/14-marketing-framework.md

Extract the framework from `Adstra_Research_GPT_2-28-26_MDD.docx` and adapt it for MDD:

**Revenue-First Direct Response Growth Model (adapted for MDD)**

This framework governs the STRATEGIC STRUCTURE of campaigns, not just the copy.

**Core Philosophy:**
1. Psychographics > Demographics — We sell to pain, desire, fear, identity (not just job titles)
2. Offers win markets — The demo offer must feel irresistible
3. Enter the conversation already happening in their mind — We don't create demand, we channel existing demand
4. Optimize for booked demos — Not vanity metrics

**Campaign Funnel Structure:**
Cold Traffic → Hook/Ad → Lead Magnet/Content → Opt-In/Landing Page → Bridge → Book a Demo → Sales Process → Close → Upsell (VehicleVault, additional workflows)

**Hook Requirements (any ad, social post, email subject):**
Must answer instantly: Who is this for? What painful problem? What different path?
If they don't feel seen in 3 seconds, we lose.

**Proof Requirements (any middle-funnel content):**
Must include: Named dealership, specific metric, role-relevant quote.
Generic proof ("dealerships love us") is worthless.

**CTA Requirements (any conversion content):**
Must include: Risk reversal ("15-minute demo, no commitment, no pressure"), specific time frame, soft language.

**Value Ladder (MDD-specific):**
- FREE: Blog content, LinkedIn posts, industry insights
- LEAD: Demo booking, custom ROI projection
- CORE: MDD Locate (key & vehicle tracking)
- EXPAND: Add Service Workflow, Recon Workflow
- PREMIUM: VehicleVault F&I integration
- CONTINUITY: Monthly per-tag fees, recurring VehicleVault subscriptions

---

### .claude/rules/15-landing-page-template.md

Analyze the 3 landing pages and codify the pattern:

**Visual Identity:**
- Background: charcoal #1A1E24
- Cards: #22272E with #2D3239 borders
- Primary accent: green #8AC833
- Dark green: #5E970F
- Green glow: rgba(138,200,51,0.15)
- Green soft: #EEF7E0
- White: #FFFFFF
- Off-white: #F5F6F4
- Body text: #9CA3AF
- Muted: #6B7280
- Gold: #F59E0B
- Red: #EF4444

**Fonts:**
- Body: 'DM Sans', system-ui, sans-serif
- Tags/labels/monospace: 'Space Mono', monospace

**10-Section Landing Page Structure:**
1. **Nav** — Fixed top. Logo left, CTA button right. Background: rgba(26,30,36,0.92) with backdrop blur.
2. **Hero** — Two-column grid. Left: tag → H1 → subtitle → CTA buttons. Right: hero image. Green radial gradient glow behind content.
3. **Pain Strip** — Card background. "Sound familiar?" or "The problem." Scenario-based pain points (3-4 short items).
4. **Stats Bar** — 3 proof metrics with named sources. Large numbers in green. Source name below each.
5. **How It Works** — 3-step flow with numbered icons. Tag → Track → Manage pattern.
6. **Feature Grid** — 6 feature cards. Each: icon → title → description. Card background with border.
7. **VS Comparison** (optional) — Two-column: "Other Tools" vs "MDD + LocateIQ." Positioned as clear winner.
8. **Testimonial** — Blockquote with large quotation mark. Name + Title + Company below.
9. **CTA Section** — Centered. H2 → subtitle → CTA button → phone number. Green radial gradient glow.
10. **Footer** — Brand logo, copyright, key links.

**Button Styles:**
- Primary: green background (#8AC833), charcoal text, bold, 16px, rounded, green shadow. Hover: dark green, white text.
- Outline: transparent with card-border, white text. Hover: green border, green text.

**Responsive:**
- All grids collapse to single-column on mobile (max-width: 768px)

---

### knowledge/ — SOURCE DOCUMENT MIGRATION

**knowledge/source-docs/adstra-model-brief.md:**
Convert the entire `Adstra__Model_3-7-26.docx` to clean markdown. Keep all content — product descriptions, testimonials, personas, emails, pricing. This is the master reference.

**knowledge/source-docs/adstra-improved-emails.md:**
Extract ONLY the 10 improved cold outbound emails + the full-solution 5-email sequence from `Adstra_ChatGPT_Model_Response_3-7-26.docx`. Format each email with Subject, Body, and notes on the angle used.

**knowledge/source-docs/adstra-marketing-framework.md:**
Extract the "Revenue-First Direct Response Growth Model" section from `Adstra_Research_GPT_2-28-26_MDD.docx`. Include the 7-part framework, funnel diagram, and value ladder.

**knowledge/source-docs/segmentation-am-feedback.md:**
Convert `Rough_Draft_Segmentation__AM_feedback.docx` to clean markdown. Preserve ALL AM feedback annotations.

**knowledge/case-studies/ — One file per dealership:**
Extract from all source docs. Each file should have: Dealership Name, Location, Contact Name & Title, Challenge, Solution, Results (specific metrics), Quotes.

**knowledge/email-examples/original/ — Anti-patterns:**
Extract the ~30 original emails from `Adstra__Model_3-7-26.docx`. Organize by persona. Label each as "ORIGINAL — see improved/ for better versions."

**knowledge/email-examples/improved/ — Target patterns:**
Extract the 10 cold outbound + 5 full-solution from `Adstra_ChatGPT_Model_Response_3-7-26.docx`.

**knowledge/landing-pages/README.md:**
Note that the 3 HTML landing pages should be copied into this directory manually. Reference their filenames: `LP_MDD_Locate-2.html`, `LP_Service_Recon_Workflow-2.html`, `LP_VehicleVault_FI-2.html`.

**knowledge/sales-deck/vehiclevault-deck-content.md:**
Extract all text content from `VehicleVault-6.pptx`. Structure by slide number with all copy, stats, and quotes.

**knowledge/pricing/pricing-model.md:**
Extract pricing details from both the Adstra Model doc and the PPTX. Include all public and internal pricing.

---

### templates/ — CONTENT TEMPLATES

Each template should be a markdown file with clear section markers and placeholders that Claude Code fills when generating campaign content.

**templates/landing-page/product-feature.html:**
Create a complete HTML template based on the 10-section structure in `15-landing-page-template.md`. Use the exact color scheme, fonts, and layout patterns from the existing landing pages. Include placeholder comments like `<!-- HERO HEADLINE -->`, `<!-- PAIN POINT 1 -->`, `<!-- STAT 1: number -->`, etc.

**templates/landing-page/campaign-launch.html:**
Same structure but adapted for a campaign (e.g., a product launch campaign vs. an evergreen product page). Include a "What's New" or "Announcement" section.

**templates/email/cold-outbound.md:**
```
# Cold Outbound Email Template

**Angle:** [Angle from 12-messaging-angles.md]
**Target Persona:** [From 11-personas.md]
**Position in Sequence:** [1-10]

**Subject:** [≤50 chars, pattern interrupt, question or scenario]
**Preview Text:** [≤100 chars]

---

Hi {{FirstName}},

[Opening: 1-2 sentences. Scenario or question. Specific to their role.]

[Pain elaboration: 2-3 bullet points or short lines. Specific dealership moments.]

[Bridge to MDD: 1-2 sentences. LocateIQ mechanism or specific result.]

[Proof: 1 sentence. Named dealership + specific metric.]

[Soft CTA: 1 sentence. Question format.]

--- {{SenderName}}

---
**Word count target:** Under 120 words
**Rules:** One pain per email. No forbidden phrases. Dealer language only.
```

**templates/email/persona-specific/ — One template per persona:**
Each should include persona-specific pain points, approved products, approved proof points, and tone adjustments. Extract from `11-personas.md` and `12-messaging-angles.md`.

**templates/social/linkedin-post.md:**
```
# LinkedIn Post Template

**Angle:** [From 12-messaging-angles.md]
**Target Persona:** [From 11-personas.md]
**Character count target:** 800-1500 (sweet spot for engagement)

---

[Hook: First 2 lines. Must compel "see more" click. Provocative stat, scenario, or question.]

[blank line]

[Body: 5-10 short lines. Pain → mechanism → proof structure. Use line breaks.]

[blank line]

[Proof: Named dealership + specific metric.]

[blank line]

[CTA: Soft. "Link in comments" or "DM for details" or embedded URL.]

[blank line]

#hashtag1 #hashtag2 #hashtag3

---
**Rules:** No emojis in first line. 3-5 hashtags max at bottom. Never hard-sell.
```

**templates/social/facebook-post.md, templates/blog/product-feature.md, templates/press-release/standard.md, templates/one-pager/product-feature.md:**
Create similar structured templates with platform-specific rules from `06-platform-specs.md`.

---

### scripts/ — API INTEGRATION SCAFFOLDING

**scripts/hubspot/hubspot-client.js:**
```javascript
// Shared HubSpot API client
// Uses @hubspot/api-client npm package
// Auth via Private App Bearer Token from .env

require('dotenv').config();
const hubspot = require('@hubspot/api-client');

const client = new hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
module.exports = client;
```

**scripts/hubspot/publish-blog.js:**
Create a complete Node.js script that:
- Reads a blog post markdown file from a campaign folder
- Converts it to HTML
- Creates the blog post via HubSpot CMS API (`/cms/v3/blogs/posts`)
- Sets: name, contentGroupId, slug, blogAuthorId, metaDescription, postBody, state
- Logs the response (post ID, URL) to publish-log.json
- Supports `--draft` flag to create as draft vs published

**scripts/hubspot/publish-landing-page.js:**
Similar pattern for landing pages via `/cms/v3/pages/landing-pages`.

**scripts/hubspot/create-email-campaign.js:**
Similar pattern for marketing emails via `/marketing/v3/emails`.

**scripts/linkedin/linkedin-client.js:**
```javascript
// Shared LinkedIn API client
// Uses axios for REST calls to LinkedIn Posts API
// Auth via OAuth 2.0 Bearer Token from .env
// Token expires every 60 days — use refresh-token.js to renew

require('dotenv').config();
const axios = require('axios');

const linkedinApi = axios.create({
  baseURL: 'https://api.linkedin.com/rest',
  headers: {
    'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
    'X-Restli-Protocol-Version': '2.0.0',
    'LinkedIn-Version': '202401',
    'Content-Type': 'application/json'
  }
});

module.exports = linkedinApi;
```

**scripts/linkedin/publish-post.js:**
Create a complete script that:
- Reads a LinkedIn post markdown file from a campaign folder
- Publishes via LinkedIn Posts API (`POST /rest/posts`)
- Sets: author (org URN), commentary, visibility (PUBLIC), distribution (MAIN_FEED), lifecycleState (PUBLISHED)
- Logs response to publish-log.json

**scripts/linkedin/refresh-token.js:**
Create a script for refreshing the OAuth token using the refresh token.

**scripts/facebook/facebook-client.js:**
```javascript
// Shared Facebook Graph API client
// Auth via Page Access Token from .env (permanent, never-expiring)

require('dotenv').config();
const axios = require('axios');

const facebookApi = axios.create({
  baseURL: 'https://graph.facebook.com/v19.0',
  params: { access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN }
});

module.exports = { facebookApi, pageId: process.env.FACEBOOK_PAGE_ID };
```

**scripts/facebook/publish-post.js:**
Create a complete script that:
- Reads a Facebook post markdown file from a campaign folder
- Publishes via Graph API (`POST /{page-id}/feed`)
- Sets: message, link (if applicable)
- Logs response to publish-log.json

**scripts/orchestrator/campaign-runner.js:**
Create the master orchestration script that:
- Reads a campaign manifest.json
- Iterates through content items
- Calls the appropriate publish script for each platform
- Adds delay between API calls (3 seconds)
- Updates manifest with publish status and timestamps
- Writes publish-log.json with all API responses
- Supports `--dry-run` flag
- Supports `--platform [hubspot|linkedin|facebook]` flag to publish to single platform

**scripts/orchestrator/file-manager.js:**
Create a utility that:
- Creates campaign folder with date prefix
- Generates manifest.json skeleton
- Names files according to convention
- Provides helper functions for reading/writing campaign files

**scripts/orchestrator/publish-tracker.js:**
Create a utility that:
- Reads publish-log.json
- Provides summary of what was published where and when
- Can query across campaigns ("what did we publish to LinkedIn this month?")

---

### Root Files

**package.json:**
```json
{
  "name": "mdd-marketing-machine",
  "version": "1.0.0",
  "description": "Claude Code CLI-powered marketing automation for Mobile Dealer Data",
  "scripts": {
    "publish": "node scripts/orchestrator/campaign-runner.js",
    "publish:dry-run": "node scripts/orchestrator/campaign-runner.js --dry-run",
    "publish:hubspot": "node scripts/orchestrator/campaign-runner.js --platform hubspot",
    "publish:linkedin": "node scripts/orchestrator/campaign-runner.js --platform linkedin",
    "publish:facebook": "node scripts/orchestrator/campaign-runner.js --platform facebook",
    "refresh:linkedin": "node scripts/linkedin/refresh-token.js",
    "tracker": "node scripts/orchestrator/publish-tracker.js"
  },
  "dependencies": {
    "@hubspot/api-client": "^11.2.0",
    "axios": "^1.7.0",
    "dayjs": "^1.11.0",
    "dotenv": "^16.4.0",
    "fs-extra": "^11.2.0",
    "marked": "^12.0.0"
  }
}
```

**.env.example:**
```
# HubSpot (Private App)
HUBSPOT_ACCESS_TOKEN=pat-na1-XXXXXXXX
HUBSPOT_PORTAL_ID=XXXXXXXX
HUBSPOT_BLOG_ID=XXXXXXXX
HUBSPOT_BLOG_AUTHOR_ID=XXXXXXXX

# LinkedIn (OAuth 2.0)
LINKEDIN_CLIENT_ID=XXXXXXXX
LINKEDIN_CLIENT_SECRET=XXXXXXXX
LINKEDIN_ACCESS_TOKEN=XXXXXXXX
LINKEDIN_REFRESH_TOKEN=XXXXXXXX
LINKEDIN_ORG_ID=urn:li:organization:XXXXXXXX

# Facebook (Page Access Token)
FACEBOOK_PAGE_ID=XXXXXXXX
FACEBOOK_PAGE_ACCESS_TOKEN=XXXXXXXX

# General
MDD_WEBSITE_URL=https://mdd.io
MDD_DEMO_URL=https://mdd.io/demo
```

**.gitignore:**
```
node_modules/
.env
campaigns/*/publish-log.json
.DS_Store
```

**README.md:**
Create a comprehensive README covering:
- Project overview and purpose
- Prerequisites (Node.js, Claude Code CLI, API credentials)
- Setup instructions (clone, npm install, configure .env)
- How to run a campaign (example prompt for Claude Code)
- How to publish (npm scripts)
- Directory structure explanation
- API setup guides for HubSpot, LinkedIn, Facebook (brief with links to docs)
- Example campaign prompt (the Recon Workflow example from the proposal)

**assets/brand-guide.md:**
Create based on the landing page analysis:
```
# MDD Brand Guide

## Colors
- Charcoal (primary bg): #1A1E24
- Card bg: #22272E
- Card border: #2D3239
- Green (primary accent): #8AC833
- Green dark: #5E970F
- Green glow: rgba(138,200,51,0.15)
- Green soft: #EEF7E0
- White: #FFFFFF
- Off-white: #F5F6F4
- Body text: #9CA3AF
- Muted text: #6B7280
- Gold: #F59E0B
- Red/Alert: #EF4444

## Typography
- Body: 'DM Sans', system-ui, sans-serif
- Monospace/Tags: 'Space Mono', monospace
- Body size: 16px (24 half-points)
- H1: clamp(32px, 4vw, 48px), weight 800, letter-spacing -1px
- H2: 36px, weight 800
- Tags: 11px, weight 700, letter-spacing 2px, uppercase

## Logo Usage
- Logo text: "MDD" with green "Locate" / "Vehicle Vault" descriptor
- Tagline: "We Find Keys & Cars™"
- Footer: "mdd.io | We Find Keys & Cars™ | 844-292-7110"

## Button Styles
- Primary: bg #8AC833, text #1A1E24, bold, rounded 10px, shadow rgba(138,200,51,0.3)
- Outline: border 2px #2D3239, text white, rounded 10px
- CTA text: "Schedule a 15-Min Demo →" or "Schedule Your Demo →"

## Imagery
- Dark backgrounds for product screenshots
- Green accent overlays for emphasis
- No generic stock photography
- Prefer actual product UI, dashboard screenshots, dealership contexts
```

---

## QUALITY CHECKS

After generating all files, verify:

1. **Brand voice consistency:** Grep all generated content for forbidden phrases from `05-brand-voice.md`. If any are found, rewrite.
2. **Persona targeting accuracy:** Check that no content pitches VehicleVault to Service Managers or Used Car Managers.
3. **Proof point attribution:** Every stat must be attributed to a named dealership. No generic claims.
4. **Cross-references:** Rules files should reference each other correctly (e.g., "see 12-messaging-angles.md" in the email template).
5. **Template completeness:** Every template should be usable immediately — no "TODO" or "TBD" placeholders in the structural elements.
6. **Script functionality:** All scripts should have proper error handling, dotenv configuration, and clear console output.

---

## TOTAL FILE COUNT

This prompt should produce approximately 65-70 files across the entire project structure. Do not skip any. Every file must contain real, usable content — not placeholders.

Begin building now. Start with the directory structure, then CLAUDE.md, then the rules files in order (00-15), then knowledge/, then templates/, then scripts/, then root files.
