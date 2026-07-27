# MDD Case Study Framework — Master Template (Web Page)

Use this framework to build customer case study pages for mdd.io. The four tailored outlines (01-04) inherit everything here. Fill in `{{PLACEHOLDERS}}` with the customer and details provided.

---

## Voice & Style Rules (Non-Negotiable)

1. **Dealer language, not vendor language.** Write like someone who's been on the lot.
2. **Forbidden phrases** — never use: "streamline operations," "enhance efficiency," "cutting-edge," "innovative technology," "leverage our platform," "best-in-class," "state-of-the-art," "revolutionize," "unlock potential," "empower your team," "transform your," "seamless integration," "game-changer," "robust solution," "next-generation," "optimize your workflow." Test: if the phrase could describe any SaaS product, cut it.
3. **Every claim needs a number and a name.** Attribute all stats to the named dealership. Never paraphrase quotes — use exact approved quote text.
4. **One pain per case study.** Go deep on the single problem, not everything MDD does.
5. **Short sentences. Short paragraphs.** Scannable on a phone.
6. **LocateIQ is the mechanism.** Say "LocateIQ — workflow automation powered by real vehicle location," not "our tracking system." (Where relevant to the product.)
7. **CTA always drives to demo.** Never "Learn more" / "Contact us." Use "Schedule a 15-Min Demo →" or "Schedule Your Demo →". Phone: 844-292-7110.
8. **Bluetooth, not GPS.** Never call the technology GPS. No jargon (RTLS, BLE) in body copy.
9. **Never name competitors.** Use category language: "legacy key management," "GPS-based solutions," "traditional workflow tools," "manual processes."
10. Product names exact: **MDD Locate**, **Service Workflow**, **Recon Workflow**, **VehicleVault**, **LocateIQ**. Tagline: **We Find Keys & Cars™** (always with ™).

---

## Page Structure (10 Sections)

Dark theme: charcoal `#1A1E24` background, green `#8AC833` accent, DM Sans font. Mobile-first. Follows MDD landing page design system.

### 1. Hero
- Tag: `CASE STUDY — {{PRODUCT}}`
- H1 (8-12 words): Customer name + headline result. Format: `How {{DEALERSHIP}} {{ACHIEVED HEADLINE RESULT}}`
- Subtitle (20-30 words): One sentence framing the before/after.
- Primary CTA: `Schedule a 15-Min Demo →` | Secondary: `Read the Story ↓`
- Hero visual: product screenshot or dealership photo (dark background, green highlights). Never stock photos.

### 2. Dealership Snapshot
Quick-facts bar: `{{DEALERSHIP}}` | `{{LOCATION}}` | `{{BRAND/FRANCHISE}}` | `{{SIZE — vehicles/lots/employees}}` | `{{CONTACT NAME, TITLE}}`

### 3. Headline Stats Bar
3 big numbers, each with label + "at {{DEALERSHIP}}" attribution. Pull from the results section. This is the shareable proof.

### 4. The Challenge
- Open scenario-first: a specific moment the reader recognizes (not a feature description).
- 3-4 pain bullets in dealer language.
- What they tried before and why it fell short (category language only — no competitor names).
- Quantify the pain where possible (cost, time, lost deals).

### 5. The Solution
- Which MDD product(s) they implemented — name them exactly.
- How it works in 3 steps max (e.g., Tag → Track → Manage).
- **The mechanism paragraph:** why this works when the old way didn't. LocateIQ positioning for workflow products; real-time Bluetooth location for Locate.
- Implementation note if available (how fast, how adoption went).

### 6. The Results
- Before/After table (the core asset):

| Metric | Before | After |
|--------|--------|-------|
| {{METRIC_1}} | {{BEFORE}} | {{AFTER}} |

- 3-5 metrics max. Bold the after-numbers.
- Secondary wins as short bullets (CSI, morale, adoption, revenue).

### 7. Customer Quote (Testimonial Block)
- 1-2 exact approved quotes, large type, attributed: Name, Title — Dealership.
- Pick the quote that contains a number or a vivid moment.

### 8. Why It Worked (The MDD Difference)
- Short VS framing: the old way vs. MDD. 3-4 rows.
- This is where category-level competitive positioning lives.

### 9. CTA Section
- H2: outcome-focused (e.g., "Get the same results on your lot.")
- Body: "We'll show you exactly how it works on a live dealership lot. 15 minutes. No commitment."
- Button: `Schedule Your Demo →` + phone 844-292-7110 visible.

### 10. Footer
Standard MDD footer: logo, We Find Keys & Cars™, mdd.io, 844-292-7110, copyright.

---

## SEO Requirements

- **Title tag** ≤60 chars: `{{Result/Topic}} | Mobile Dealer Data`
- **Meta description** ≤155 chars: result + dealership + "Schedule a demo."
- **Slug:** lowercase, hyphens, no dates, <60 chars (e.g., `/corwin-toyota-case-study`)
- One H1 with primary keyword; H2s carry secondary keywords; primary keyword in first 100 words.
- 2-3 internal links: relevant mdd.io product page + related blog/case study.
- Image alt text descriptive with keyword where natural.
- Add Article schema markup (publisher: Mobile Dealer Data, mdd.io).

---

## Quality Checklist (run before finishing)

- [ ] Scenario-first challenge opening
- [ ] All stats attributed to the named dealership
- [ ] Quotes verbatim, correctly attributed
- [ ] One pain, one story — no product kitchen-sink
- [ ] No forbidden phrases; no competitor names; no "GPS"
- [ ] LocateIQ positioned as mechanism (where applicable)
- [ ] CTA = demo, phone visible
- [ ] Title/meta/slug within limits
- [ ] Passes the Saturday Test: would a GM stop and read this on their phone?
