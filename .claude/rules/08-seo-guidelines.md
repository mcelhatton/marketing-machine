# SEO Guidelines

Search engine optimization rules for blog posts and landing pages.

---

## Keyword Clusters by Product

### MDD Locate
| Primary | Secondary |
|---------|-----------|
| dealership key tracking | find car keys dealership |
| vehicle location system | lot management software |
| car dealership inventory tracking | Bluetooth vehicle tracking |
| dealership lot management | auto dealer key finder |

### Service Workflow
| Primary | Secondary |
|---------|-----------|
| dealership service workflow | service lane cycle time |
| automotive service management | bay turn optimization |
| service department efficiency | auto repair workflow software |
| service advisor tools | dealership service tracking |

### Recon Workflow
| Primary | Secondary |
|---------|-----------|
| vehicle reconditioning software | recon workflow automation |
| used car reconditioning | recon cycle time |
| days to frontline | car dealer recon process |
| reconditioning management | used car preparation software |

### VehicleVault
| Primary | Secondary |
|---------|-----------|
| dealership F&I products | key tracking for customers |
| dealer-branded customer app | F&I recurring revenue |
| vehicle ownership app | car dealer loyalty app |
| F&I add-on products | consumer key finder |

### LocateIQ
| Primary | Secondary |
|---------|-----------|
| RTLS dealership | real-time location system automotive |
| automated workflow dealership | location-based workflow automation |
| indoor vehicle tracking | dealership automation |

---

## On-Page SEO Rules

### Title Tag
- **Maximum:** 60 characters
- **Include:** Primary keyword
- **Format:** `[Primary Topic] | Mobile Dealer Data`

**Example:**
```
How to Reduce Service Wait Times | Mobile Dealer Data
```

### Meta Description
- **Maximum:** 155 characters
- **Include:** Primary keyword AND a CTA
- **Format:** Describe the content + soft CTA

**Example:**
```
See how Corwin Toyota cut service wait times from 2.5 hours to under 90 minutes with MDD's automated workflow. Schedule a demo.
```

### Headings
- **H1:** One per page, includes primary keyword
- **H2:** Major sections, include secondary keywords naturally
- **H3:** Subsections, support the H2 above

### First 100 Words
Include primary keyword in the first 100 words of body content.

### Internal Links
- **Blog posts:** 2-3 internal links to other MDD content
- Link to product pages on mdd.io
- Link to related blog posts
- Use descriptive anchor text (not "click here")

### Image Alt Text
- Descriptive of the image content
- Include keyword where natural
- Don't keyword stuff

**Example:**
```html
<img alt="MDD dashboard showing real-time vehicle locations on a dealership lot" />
```

### URL Slug
- **Lowercase** only
- **Hyphens** between words
- **No dates** in the slug
- **Keyword-rich** but readable
- **Short** — under 60 characters preferred

**Good:**
```
/service-workflow-cycle-time-reduction
/corwin-toyota-case-study
```

**Bad:**
```
/2026-03-11-how-corwin-toyota-reduced-their-service-wait-times-using-mdd
```

---

## Content Rules

### Blog Posts
- **Minimum:** 800 words
- **Maximum:** 1,200 words (for standard posts)
- **Answer the question** in the first paragraph
- **Use schema markup** where applicable (FAQ, HowTo, Article)
- **Include a CTA** at the end

### Landing Pages
- **No thin content** — every section adds unique value
- **Stats and proof points** throughout
- **Scannable format** — headers, bullets, short paragraphs
- **Mobile-optimized** — content readable on phones

---

## Schema Markup

### Article (Blog Posts)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {
    "@type": "Organization",
    "name": "Mobile Dealer Data"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Mobile Dealer Data",
    "url": "https://mdd.io"
  },
  "datePublished": "2026-03-11",
  "dateModified": "2026-03-11"
}
```

### FAQ (When applicable)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does MDD track vehicle locations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MDD uses Bluetooth tracking tags..."
      }
    }
  ]
}
```

---

## Competitive SEO Positioning

### Target Search Intent
| Intent | Content Type |
|--------|-------------|
| "how to find lost keys at dealership" | Blog post (problem-focused) |
| "dealership key tracking software" | Landing page (solution-focused) |
| "service workflow software" | Product page |
| "recon cycle time reduction" | Case study |

### Beat Competitors On
- Specific numbers and proof points (they use vague claims)
- Named customer testimonials (they use anonymous quotes)
- Detailed how-it-works content (they stay high-level)
- Fresh, regularly updated content (they let content age)

---

## SEO Checklist

Before publishing:

- [ ] Title tag ≤60 characters with primary keyword
- [ ] Meta description ≤155 characters with keyword + CTA
- [ ] One H1 with primary keyword
- [ ] H2/H3 structure with secondary keywords
- [ ] Primary keyword in first 100 words
- [ ] 2-3 internal links to MDD content
- [ ] All images have descriptive alt text
- [ ] URL slug is short, lowercase, hyphenated
- [ ] Content is 800-1,200 words
- [ ] Answer the searcher's question in first paragraph
- [ ] CTA at the end driving to demo

---

## Keyword Research Process

When targeting a new topic:

1. **Identify the pain point** — What would a dealer search for?
2. **Check the cluster** — Which product category does it fit?
3. **Define primary keyword** — The main term to rank for
4. **Define secondary keywords** — Supporting terms
5. **Check search intent** — Are they looking for info or a solution?
6. **Choose content type** — Blog, landing page, or case study
7. **Write to answer** — What question are they really asking?

---

## Content Calendar Considerations

### Seasonal Opportunities
| Month | Topic Opportunity |
|-------|-------------------|
| January | New year operational improvements |
| March-April | Spring inventory prep |
| May-June | Summer sales season preparation |
| September | Fall service push |
| November-December | Year-end efficiency reviews |

### Evergreen Topics
- Lost key costs
- Service cycle time
- Recon bottlenecks
- Bay utilization
- Customer wait times
- Inventory management
