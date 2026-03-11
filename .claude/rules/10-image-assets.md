# Image Assets

Guidelines for images, screenshots, and visual assets.

---

## Asset Locations

Images are stored in `assets/` directory:

```
assets/
├── logos/
│   └── .gitkeep
├── screenshots/
│   └── .gitkeep
├── icons/
│   └── .gitkeep
└── brand-guide.md
```

---

## Logo Variants

### Primary Logo
- Location: Reference mdd.io for current logo
- Usage: Header, footers, presentations
- Variants needed: Light on dark, dark on light

### VehicleVault Logo
- Location: Reference mdd.io/vehiclevault
- Usage: F&I product materials

### Favicon
- Format: .ico and .png
- Sizes: 16x16, 32x32, 180x180

---

## Product Screenshots

### Current Visual Style
Reference the 3 landing pages in `knowledge/landing-pages/` for current visual style.

Landing pages contain embedded base64 images showing:
- Dashboard views
- Mobile app interfaces
- Workflow visualizations

### Screenshot Requirements
- Dark background (charcoal #1A1E24)
- Green accent (#8AC833) for highlights
- Clean, realistic data (no "Lorem ipsum")
- Mobile app: Show realistic dealership context
- Dashboard: Show meaningful metrics

---

## OG Image Specifications

Open Graph images for social sharing:

| Platform | Dimensions | Notes |
|----------|------------|-------|
| LinkedIn | 1200 x 627 px | 1.91:1 aspect ratio |
| Facebook | 1200 x 630 px | 1.91:1 aspect ratio |
| Twitter/X | 1200 x 628 px | 1.91:1 aspect ratio |
| HubSpot Blog | 1200 x 628 px | Featured image |

---

## Landing Page Image Specs

### Hero Section
- **Max width:** 1100 px
- **Aspect ratio:** 16:9 or similar
- **Content:** Product screenshot, app mockup, or dashboard view
- **Background:** Matches dark theme or transparent

### Feature Cards
- **Icons:** Simple, line-style or filled
- **Size:** 48-64 px
- **Color:** Green (#8AC833) or muted gray

### Stats Section
- Numbers displayed as large text (no images needed)
- Background patterns if used: subtle, dark

---

## Image Guidelines

### DO:
- Use actual product screenshots
- Show real dashboard views
- Use dealership-relevant contexts
- Match the dark theme aesthetic
- Use green accent for highlights
- Include realistic (but not real customer) data

### DON'T:
- Use generic stock photos of "technology"
- Use overly polished mockups that don't match the product
- Use bright/light backgrounds that clash with brand
- Include real customer data in screenshots
- Use competitor imagery

---

## Typography in Images

When adding text overlays to images:

- **Font:** DM Sans (matches brand)
- **Headlines:** Weight 800
- **Body:** Weight 400 or 500
- **Color:** White (#FFFFFF) or Green (#8AC833)
- **Ensure contrast** against background

---

## Icon Style

### Preferred Style
- Line icons or simple filled icons
- Consistent stroke width
- Monochrome (green, white, or gray)
- Rounded corners to match UI

### Icon Libraries (Reference)
- Heroicons
- Feather Icons
- Phosphor Icons

---

## Image File Formats

| Use Case | Format | Notes |
|----------|--------|-------|
| Photos | .jpg | Compress for web |
| Screenshots | .png | Preserve crisp edges |
| Logos | .svg | Scalable vector |
| Icons | .svg | Scalable vector |
| OG Images | .jpg or .png | 1200px wide |

---

## Image Optimization

### File Size Targets
| Type | Max Size |
|------|----------|
| Hero image | 200 KB |
| Feature image | 100 KB |
| Thumbnail | 50 KB |
| Icon | 5 KB |

### Optimization Tools
- TinyPNG for PNG compression
- ImageOptim for batch processing
- Squoosh for web optimization

---

## Alt Text Guidelines

Every image must have descriptive alt text.

### Format
Describe what the image shows, include keyword if natural.

### Examples

**Good:**
```html
<img alt="MDD dashboard showing real-time vehicle locations on a dealership lot" />
```

**Bad:**
```html
<img alt="screenshot" />
<img alt="image1" />
<img alt="" />
```

---

## Image Request Template

When requesting new images, provide:

1. **Purpose:** Where will this image be used?
2. **Dimensions:** Exact pixel dimensions needed
3. **Content:** What should the image show?
4. **Text overlay:** Any text to include?
5. **Style reference:** Link to existing image with similar style

Example:
```
Purpose: LinkedIn post for Service Workflow campaign
Dimensions: 1200 x 627 px
Content: Dashboard showing service bay utilization with green metrics
Text overlay: "64% of customers out in 60 minutes"
Style reference: See LP_Service_Recon_Workflow-2.html hero section
```
