# MDD.io Complete Website — HubSpot CMS Theme
## Vehicle Vault by Mobile Dealer Data

---

## Theme Package Contents

```
mdd-theme/
├── css/
│   └── theme.css                    ← Global stylesheet (all pages share this)
├── partials/
│   ├── header.html                  ← Global nav (sticky, dropdown, mobile toggle)
│   └── footer.html                  ← Global footer (links, app badges, copyright)
├── templates/
│   ├── base.html                    ← Base template (all pages extend this)
│   ├── homepage.html                ← mdd.io (homepage)
│   ├── mdd-key-tracking.html        ← /mdd-key-tracking
│   ├── mdd-lot-management.html      ← /mdd-lot-management
│   ├── mdd-service-workflow.html     ← /mdd-service-workflow
│   ├── mdd-recon-workflow.html       ← /mdd-recon-workflow
│   ├── mdd-vehiclevault.html         ← /mdd-vehiclevault
│   ├── how-it-works.html            ← /how-it-works
│   ├── mdd-proof.html               ← /mdd-proof
│   └── contact-us.html             ← /contact-us
├── mdd-assets/                      ← Upload images here (see Step 1)
└── SETUP_GUIDE.md                   ← This file
```

**Total: 13 files** (1 CSS + 2 partials + 1 base + 9 page templates)

---

## Design System

| Element | Value |
|---------|-------|
| **Primary Color** | `#8AC833` |
| **Secondary Color** | `#5E970F` |
| **Dark Background** | `#1A1E24` (charcoal) |
| **Card Background** | `#22272E` |
| **Gold Accent** | `#F59E0B` |
| **Heading Font** | DM Sans (800 weight) |
| **Body Font** | DM Sans (400/500) |
| **Mono Font** | Space Mono (tags, stats) |
| **Border Radius** | 12px (cards), 8px (buttons), 20px (tags) |

---

## Step-by-Step Setup

### Step 1: Upload New Images

1. In HubSpot, go to **Content → Design Manager**
2. Create a folder called `mdd-assets` at the root level of your theme
3. Upload these 9 images into `mdd-assets/`:
   - `mdd-app-icon.png`
   - `app-map-tracking.png`
   - `app-vehicle-detail.png`
   - `app-dealer-profile.png`
   - `app-rewards.png`
   - `mdd-locate-mobile.webp`
   - `service-dashboard.webp`
   - `workflow-phone.png`
   - `warmer-colder.webp`

**Note:** The templates also reference your existing HubSpot images at their current `hubfs` URLs. Those don't need to be moved.

### Step 2: Upload the CSS File

1. In Design Manager, create a `css` folder
2. Upload `theme.css` into the `css` folder
3. The base template references it via: `{{ get_asset_url('./css/theme.css') }}`

### Step 3: Create the Global Partials

**Header:**
1. Design Manager → File → New File → HTML + HubL
2. Select "Template Partial" → Name it "MDD Header"
3. Paste the contents of `partials/header.html`
4. **Important:** The file must have `templateType: global_partial` in the annotation
5. Save and publish

**Footer:**
1. Same process → Name it "MDD Footer"
2. Paste the contents of `partials/footer.html`
3. Save and publish

### Step 4: Create the Base Template

1. Design Manager → New File → HTML + HubL → Template → Page
2. Name it "MDD Base Template"
3. Paste the contents of `templates/base.html`
4. **Set `isAvailableForNewContent: false`** (this is a parent template, not directly used)
5. Save and publish

### Step 5: Create Each Page Template

For EACH of the 9 page templates:

1. Design Manager → New File → HTML + HubL → Template → Page
2. Name it accordingly (e.g., "MDD Homepage")
3. Paste the full contents from the corresponding file
4. Save and publish

### Step 6: Create the Pages

For EACH page:

1. Go to **Marketing → Landing Pages → Create** (or Website Pages)
2. Select the corresponding template
3. Set the page title, URL slug, and meta description
4. Publish

---

## Page-to-Template Mapping

| Page URL | Template File | Template Name |
|----------|--------------|---------------|
| `/` (homepage) | `homepage.html` | MDD Homepage |
| `/mdd-key-tracking` | `mdd-key-tracking.html` | MDD Key Tracking |
| `/mdd-lot-management` | `mdd-lot-management.html` | MDD Lot Management |
| `/mdd-service-workflow` | `mdd-service-workflow.html` | MDD Service Workflow |
| `/mdd-recon-workflow` | `mdd-recon-workflow.html` | MDD Recon Workflow |
| `/mdd-vehiclevault` | `mdd-vehiclevault.html` | MDD VehicleVault F&I |
| `/how-it-works` | `how-it-works.html` | How It Works |
| `/mdd-proof` | `mdd-proof.html` | MDD Proof |
| `/contact-us` | `contact-us.html` | Contact Us |

---

## HubSpot Features Used

| Feature | Purpose |
|---------|---------|
| `{{ standard_header_includes }}` | HubSpot tracking code, jQuery, global CSS |
| `{{ standard_footer_includes }}` | Analytics, CTA/form scripts |
| `{{ content.html_title }}` | Page title from HubSpot settings |
| `{{ content.meta_description }}` | Meta description from settings |
| `{{ get_asset_url() }}` | Image/CSS paths from Design Manager |
| `{% extends %}` / `{% block %}` | Template inheritance (pages extend base) |
| `{% global_partial %}` | Shared header/footer across all pages |
| `{% module %}` | HubSpot CTA and form modules |
| `{{ year }}` | Dynamic copyright year |

---

## Customization Notes

### To connect your HubSpot form (Contact page):
Replace the form module's `form_id` with your actual HubSpot form ID:
```
{% module "contact_form" path="@hubspot/form",
  form={ "form_id": "YOUR-ACTUAL-FORM-ID" }
%}
```
Then remove the HTML fallback form below it.

### To add HubSpot CTA tracking:
Each page already has a CTA section. To connect tracked CTAs, add:
```
{% module "page_cta" path="@hubspot/cta",
  label="Page CTA"
%}
```

### To change the demo link:
Search for `/contact-us` across templates and replace with your HubSpot meeting link.

### Mobile responsiveness:
All breakpoints are handled in `theme.css`. The nav collapses to a hamburger menu on mobile with a simple JS toggle.

---

## File Path References

The templates use two types of image paths:

**Existing HubSpot images** (already in your File Manager):
```
https://mdd.io/hubfs/Geofence%20Macbook.png
https://mdd.io/hubfs/Audi%20Nashua%20dealership%20management%20interface.png
(etc.)
```

**New uploaded images** (need to be in Design Manager):
```
{{ get_asset_url('./mdd-assets/warmer-colder.webp') }}
{{ get_asset_url('./mdd-assets/workflow-phone.png') }}
(etc.)
```

---

## Support

Questions? Contact Mobile Dealer Data
- **Web:** mdd.io
- **Phone:** 844-292-7110
