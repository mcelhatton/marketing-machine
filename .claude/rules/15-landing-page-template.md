# Landing Page Template

The 10-section landing page structure based on MDD's existing high-converting pages.

---

## Visual Identity

### Colors
| Element | Value | CSS Variable |
|---------|-------|--------------|
| Background | #1A1E24 | `--charcoal` |
| Card background | #22272E | `--card` |
| Card border | #2D3239 | `--card-border` |
| Primary accent | #8AC833 | `--green` |
| Dark green | #5E970F | `--green-dark` |
| Green glow | rgba(138,200,51,0.15) | `--green-glow` |
| Green soft | #EEF7E0 | `--green-soft` |
| White | #FFFFFF | `--white` |
| Off-white | #F5F6F4 | `--off-white` |
| Body text | #9CA3AF | `--body` |
| Muted text | #6B7280 | `--muted` |
| Gold accent | #F59E0B | `--gold` |
| Red/Alert | #EF4444 | `--red` |

### Fonts
```css
--font-body: 'DM Sans', system-ui, sans-serif;
--font-mono: 'Space Mono', monospace;
```

### Typography Scale
| Element | Size | Weight | Extras |
|---------|------|--------|--------|
| H1 | clamp(32px, 4vw, 48px) | 800 | letter-spacing: -1px |
| H2 | 36px | 800 | |
| H3 | 20px | 700 | |
| Body | 16px | 400 | line-height: 1.6 |
| Tags | 11px | 700 | letter-spacing: 2px, uppercase |

---

## 10-Section Structure

### Section 1: Navigation

**Position:** Fixed top

**Layout:**
- Logo left
- CTA button right

**Styling:**
```css
background: rgba(26,30,36,0.92);
backdrop-filter: blur(10px);
```

**Content:**
```html
<nav>
  <a href="/" class="logo">MDD <span>Product Name</span></a>
  <a href="#demo" class="nav-cta">Book a Demo</a>
</nav>
```

---

### Section 2: Hero

**Layout:** Two-column grid (text left, image right)

**Left Column:**
1. Product tag (e.g., "MDD Locate")
2. H1 headline
3. Subtitle paragraph
4. CTA buttons (primary + outline)

**Right Column:**
- Hero image (product screenshot, app mockup)

**Background:**
- Green radial gradient glow behind content

**Content Template:**
```html
<section class="hero">
  <div class="hero-content">
    <div class="tag"><!-- PRODUCT TAG --></div>
    <h1><!-- HEADLINE: Benefit-focused, 8-12 words --></h1>
    <p class="sub"><!-- SUBTITLE: 20-30 words --></p>
    <div class="cta-group">
      <a href="#demo" class="btn-primary">Schedule a 15-Min Demo →</a>
      <a href="#how" class="btn-outline">See How It Works</a>
    </div>
  </div>
  <div class="hero-image">
    <!-- HERO IMAGE -->
  </div>
</section>
```

---

### Section 3: Pain Strip

**Purpose:** Make visitor feel seen with familiar frustrations

**Layout:** Card background with pain points

**Content:**
- Header: "Sound familiar?" or "The problem"
- 3-4 short pain point items

**Content Template:**
```html
<section class="pain-strip">
  <h2>Sound familiar?</h2>
  <p><!-- SCENARIO: "It's Saturday at 11:30..." --></p>
  <div class="pain-items">
    <span class="pain-item"><!-- PAIN 1 --></span>
    <span class="pain-item"><!-- PAIN 2 --></span>
    <span class="pain-item"><!-- PAIN 3 --></span>
  </div>
</section>
```

---

### Section 4: Stats Bar

**Purpose:** Build credibility with specific numbers

**Layout:** 3 proof metrics in a row

**Each Stat:**
- Large number (green or gold)
- Label text
- Dealership source

**Content Template:**
```html
<section class="stats-bar">
  <div class="stat">
    <div class="num"><!-- STAT 1: e.g., "2,000+" --></div>
    <div class="label"><!-- LABEL: e.g., "Vehicles tracked" --></div>
    <div class="dealer"><!-- SOURCE: e.g., "Bill Brown Ford" --></div>
  </div>
  <!-- Repeat for stats 2-3 -->
</section>
```

---

### Section 5: How It Works

**Purpose:** Show simplicity of the solution

**Layout:** 3-step flow with numbered icons

**Pattern:** Tag → Track → Manage (or similar)

**Content Template:**
```html
<section class="how-it-works">
  <div class="section-tag">How It Works</div>
  <h2>Three steps. Zero guesswork.</h2>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <h3><!-- STEP 1 TITLE --></h3>
      <p><!-- STEP 1 DESCRIPTION --></p>
    </div>
    <!-- Repeat for steps 2-3 -->
  </div>
</section>
```

---

### Section 6: Feature Grid

**Purpose:** Highlight key capabilities

**Layout:** 6 feature cards (2x3 or 3x2 grid)

**Each Card:**
- Icon (optional)
- Title (H3)
- Description paragraph

**Content Template:**
```html
<section class="features">
  <div class="section-tag">What You Get</div>
  <h2>Built for real dealership operations.</h2>
  <div class="feature-grid">
    <div class="feature-card">
      <h3><!-- FEATURE 1 TITLE --></h3>
      <p><!-- FEATURE 1 DESCRIPTION --></p>
    </div>
    <!-- Repeat for features 2-6 -->
  </div>
</section>
```

---

### Section 7: VS Comparison (Optional)

**Purpose:** Position MDD against alternatives

**Layout:** Two-column comparison

**Left Column:** "Other Tools" (competitor category)
**Right Column:** "MDD + LocateIQ"

**Content Template:**
```html
<section class="comparison">
  <div class="section-tag">The MDD Difference</div>
  <div class="vs-container">
    <div class="vs-left">
      <h3>Other Workflow Tools</h3>
      <ul>
        <li><!-- COMPETITOR WEAKNESS 1 --></li>
        <li><!-- COMPETITOR WEAKNESS 2 --></li>
      </ul>
    </div>
    <div class="vs-divider">VS</div>
    <div class="vs-right">
      <h3>MDD + LocateIQ</h3>
      <ul>
        <li><!-- MDD STRENGTH 1 --></li>
        <li><!-- MDD STRENGTH 2 --></li>
      </ul>
    </div>
  </div>
</section>
```

---

### Section 8: Testimonial

**Purpose:** Social proof from named customer

**Layout:** Blockquote with attribution

**Styling:**
- Large quotation mark graphic
- Quote in larger text
- Name + Title + Company below

**Content Template:**
```html
<section class="testimonial">
  <blockquote>
    <p>"<!-- QUOTE TEXT -->"</p>
  </blockquote>
  <div class="author"><!-- NAME --></div>
  <div class="author-role"><!-- TITLE --> — <!-- COMPANY --></div>
</section>
```

---

### Section 9: CTA Section

**Purpose:** Final conversion push

**Layout:** Centered with green radial gradient glow

**Content:**
- H2 headline
- Subtitle paragraph
- Primary CTA button
- Phone number

**Content Template:**
```html
<section class="cta-section" id="demo">
  <h2>See it in 15 minutes.</h2>
  <p>We'll show you exactly how MDD works on a live dealership lot. No commitment. No pressure.</p>
  <a href="https://mdd.io/demo" class="btn-primary">Schedule Your Demo →</a>
  <p class="phone">Or call us: 844-292-7110</p>
</section>
```

---

### Section 10: Footer

**Purpose:** Brand closure and key links

**Content:**
- MDD logo
- Tagline: "We Find Keys & Cars™"
- Phone: 844-292-7110
- Copyright
- Key links (Privacy, Terms)

**Content Template:**
```html
<footer>
  <div class="footer-brand">
    <span class="logo">MDD</span>
    <span class="tagline">We Find Keys & Cars™</span>
  </div>
  <div class="footer-links">
    <a href="https://mdd.io">mdd.io</a>
    <span>844-292-7110</span>
  </div>
  <div class="copyright">© 2026 Mobile Dealer Data. All rights reserved.</div>
</footer>
```

---

## Button Styles

### Primary Button
```css
.btn-primary {
  background: #8AC833;
  color: #1A1E24;
  font-weight: 700;
  font-size: 16px;
  padding: 14px 28px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(138,200,51,0.3);
}
.btn-primary:hover {
  background: #5E970F;
  color: #FFFFFF;
}
```

### Outline Button
```css
.btn-outline {
  background: transparent;
  border: 2px solid #2D3239;
  color: #FFFFFF;
  padding: 14px 28px;
  border-radius: 10px;
}
.btn-outline:hover {
  border-color: #8AC833;
  color: #8AC833;
}
```

---

## Responsive Behavior

All grids collapse to single-column on mobile (max-width: 768px):
- Hero: Stack text above image
- Feature grid: Single column
- Stats: Stack vertically
- VS comparison: Stack vertically

---

## Content Checklist

Before publishing a landing page:

- [ ] Product tag matches the product
- [ ] H1 is benefit-focused, 8-12 words
- [ ] Pain strip uses scenario-based language
- [ ] Stats all attributed to named dealerships
- [ ] How It Works is 3 clear steps
- [ ] 6 feature cards with benefits (not just features)
- [ ] Testimonial is real, attributed quote
- [ ] CTA drives to demo
- [ ] Phone number visible (844-292-7110)
- [ ] Mobile responsive
- [ ] No forbidden phrases (see 05-brand-voice.md)
