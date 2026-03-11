# MDD Brand Guide

Quick reference for visual brand standards.

---

## Colors

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| **MDD Green** | `#8AC833` | Primary CTA, highlights, accents |
| **Dark Green** | `#5E970F` | Hover states, secondary accent |
| **Charcoal** | `#1A1E24` | Background, primary dark |
| **Card** | `#22272E` | Card backgrounds, sections |

### Secondary Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Gold** | `#F59E0B` | LocateIQ badge, special highlights |
| **White** | `#FFFFFF` | Text on dark, primary content |
| **Gray Light** | `#9CA3AF` | Secondary text, descriptions |
| **Gray Dark** | `#6B7280` | Tertiary text, captions |

---

## Typography

### Fonts

| Font | Weight | Usage |
|------|--------|-------|
| **DM Sans** | 800 (Extra Bold) | Headlines, H1-H2 |
| **DM Sans** | 700 (Bold) | Subheadlines, H3-H4 |
| **DM Sans** | 500 (Medium) | Body text emphasis |
| **DM Sans** | 400 (Regular) | Body text |
| **Space Mono** | 400 | Code, LocateIQ badge |

### Font Loading

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Space+Mono&display=swap" rel="stylesheet">
```

---

## Logo Usage

### Primary Logo

- Use on dark backgrounds
- Minimum size: 120px width
- Clear space: 20px all sides

### Logo Files

```
assets/
├── logo/
│   ├── mdd-logo-full.svg
│   ├── mdd-logo-full.png
│   ├── mdd-logo-icon.svg
│   └── mdd-logo-icon.png
```

---

## Spacing

### Border Radius

| Element | Radius |
|---------|--------|
| Cards | 12px |
| Buttons | 8px |
| Tags/Badges | 20px |
| Inputs | 8px |

### Padding

| Context | Padding |
|---------|---------|
| Section | 80px vertical |
| Card | 32px |
| Button | 16px 32px |
| Tag | 8px 20px |

---

## Image Specifications

### OG Images (Social Sharing)

- **Dimensions:** 1200 x 630px
- **Format:** PNG or JPG
- **Background:** #1A1E24 (charcoal)
- **Text:** White, DM Sans Bold
- **Accent:** #8AC833 (MDD green)

### Blog Featured Images

- **Dimensions:** 1200 x 628px
- **Format:** PNG or JPG
- **Style:** Dark theme, minimal

### One-Pagers / PDFs

- **Dimensions:** 8.5 x 11 inches (US Letter)
- **Margins:** 0.5 inches
- **Resolution:** 300 DPI (print-ready)

---

## Button Styles

### Primary CTA

```css
.cta-primary {
  background: #8AC833;
  color: #1A1E24;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 18px;
}

.cta-primary:hover {
  background: #5E970F;
}
```

### Secondary CTA

```css
.cta-secondary {
  background: #1A1E24;
  color: #FFFFFF;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 700;
}
```

---

## Icons & Badges

### LocateIQ Badge

```css
.locateiq-badge {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
  padding: 8px 20px;
  border-radius: 20px;
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 600;
}
```

### Product Tags

```css
.product-tag {
  background: rgba(138, 200, 51, 0.15);
  color: #8AC833;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

## Photography Style

### Do:
- Dark, moody lighting
- Automotive environments
- Real dealership settings
- Focus on technology in use
- Professional, not stock-photo feeling

### Don't:
- Bright, overlit photos
- Generic office settings
- Staged handshakes
- Obvious stock photos
- Cluttered compositions

---

## Contact Information

| Channel | Value |
|---------|-------|
| Website | mdd.io |
| Phone | 844-292-7110 |
| Email | info@mdd.io |

---

## CSS Variables

```css
:root {
  /* Colors */
  --charcoal: #1A1E24;
  --card: #22272E;
  --card-hover: #2A2F37;
  --green: #8AC833;
  --green-dark: #5E970F;
  --gold: #F59E0B;
  --white: #FFFFFF;
  --gray-light: #9CA3AF;
  --gray-dark: #6B7280;

  /* Spacing */
  --radius: 12px;
  --radius-sm: 8px;
  --radius-pill: 20px;

  /* Shadows */
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.3);
}
```

---

## Quick Reference

### Headlines
- Use DM Sans Extra Bold (800)
- Use `<em>` for green emphasis: `Stop searching. Start *selling.*`
- Keep under 10 words

### Body Copy
- DM Sans Regular (400) or Medium (500)
- Max line width: 65-75 characters
- Line height: 1.6

### CTAs
- Always use arrows: `→` or `&rarr;`
- Keep to 2-4 words
- Example: "Schedule Your Demo →"
