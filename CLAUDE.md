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
Bill Brown Ford, Corwin Toyota, Longo Toyota, Brandon Honda (Morgan Automotive Group), Morgan Automotive, Penske Motor Group, Penske Automotive, Lithia Automotive.

The public dealer roster is one component — `mdd-theme/partials/trusted-by.html`. Every page
that names customers includes it, so edit the names there and the whole site follows.

## Reference Material
Source documents and reference content are in `knowledge/`. Case studies, email examples, landing page references, and the sales deck are all there.

---

## HubSpot CMS Integration

This project also manages the HubSpot CMS theme. See `.claude/rules/04-hubspot-deployment.md` for deployment commands.

| Item | Value |
|------|-------|
| **HubSpot Portal ID** | 585393 |
| **Staging Domain** | 585393.hs-sites.com |
| **Production Domain** | mdd.io |
| **Theme Location** | `mdd-theme/` |

### Design System Colors (DO NOT MODIFY WITHOUT APPROVAL)
| Element | Value | CSS Variable |
|---------|-------|--------------|
| Primary Color | `#8AC833` (Green) | `--green` |
| Secondary Color | `#5E970F` (Dark Green) | `--green-dark` |
| Dark Background | `#1A1E24` (Charcoal) | `--charcoal` |
| Card Background | `#22272E` | `--card` |
| Gold Accent | `#F59E0B` | `--gold` |

### Fonts
- Heading Font: DM Sans (800 weight)
- Body Font: DM Sans (400/500)
- Mono Font: Space Mono

### Image Optimization & Performance (mobile page speed)

Theme images referenced via `get_asset_url('../mdd-assets/…')` serve from `hubfs/raw_assets/public/mdd-theme/…` and **bypass HubSpot's optimizer** — whatever bytes are in the theme source ship as-is. Uncompressed source images (some were 6 MB PNGs, ~47 MB total) previously tanked mobile PageSpeed. Rules:

- **WebP CANNOT be hosted in theme source.** Design Manager (`hs upload` + the `source-code` API) rejects `.webp` ("extension not supported"), and the File Manager API needs a `files` scope the token doesn't have. Do NOT deploy `.webp` into `mdd-assets/`. (The 3 pre-existing `*.webp` there 404 live; only `mdd-locate.html`, a non-live page, references them.)
- **Optimize in-place as PNG/JPEG** at the same path/extension so `get_asset_url` refs stay valid. PNG: `sips --resampleWidth N <f>` then `pngquant --quality=55-82 --speed 1 --strip --force --output <f> <f>`. Photos → JPEG (`sips ... -s format jpeg -s formatOptions 78`). Target width ≈ 2× display px (desktop dashboards 1600, phone screenshots 1080, placards 520). Tools: `brew install pngquant`. Never re-`sips` a small already-optimized JPEG — it grows.
- **Every `<img>` needs** `width` + `height` (kills CLS — global CSS already has `img{height:auto}`), plus `loading="lazy" decoding="async"` below the fold; the one above-fold hero/showcase image per page uses `loading="eager" fetchpriority="high"`. The homepage hero **background** (a CSS `url()` in `homepage.html` + `theme.css` `.hero,.bg-dark`) is the LCP and is NOT auto-optimized — keep it compressed and preloaded.
- **Bonus:** the `width`/`height` attrs make HubSpot rewrite rendered `<img>` to its `hs-fs/…?width=…&height=…` CDN, which **auto-serves WebP** to modern browsers (CSS backgrounds don't get this). So you get WebP delivery without hosting WebP.
- **Deploy:** `hs upload` works for `templates/` and `partials/` folders and single files, but a folder upload of `mdd-assets/` ABORTS on any `.webp` inside it (move them out first) and the CLI is flaky — retry per file and verify via `GET source-code/published/content/<path>` Content-Length. Then re-publish pages (IDs + steps: `.claude/rules/04-hubspot-deployment.md`). `curl` to mdd.io needs a browser User-Agent or returns HTTP 000 (WAF).

**Render-blocking / mobile LCP (the other half of the perf story):**
- **jQuery** (`jquery-1.11.2.js`, ~1.1 s render block) is injected by `standard_header_includes` from a PORTAL setting, NOT our code — the theme is 100% vanilla JS and does not need it. Cannot be removed from the template. Fix is in HubSpot UI: Settings → Content/Website → Pages → jQuery → "Do not load jQuery" (or at least "Load in footer"). Biggest single mobile win; needs portal access.
- **Google Fonts** were render-blocking (~750 ms). Fixed in `base.html` by loading the stylesheet with `media="print" onload="this.media='all'"` + `<noscript>` fallback (kept the preconnects; `display=swap` paints fallback text immediately). Don't revert to a plain blocking `<link rel="stylesheet">`.
- **Mobile hero LCP:** the `.hero,.bg-dark` CSS background (`dealerlot`) is the LCP and is NOT auto-optimized. There are two sizes: `dealerlot.png` (~1200px, desktop) and `dealerlot-mobile.png` (~720px, ~149 KB) served via `@media (max-width:768px)` in `theme.css` AND the homepage's inline `.hero` (homepage's inline rule overrides theme.css, so both must be updated). The homepage `{% block head %}` preloads both responsively (`media="(max-width:768px)"` / `(min-width:769px)"`).
- **CDN domain quirk:** `get_asset_url` resolves to `mdd.io/hubfs/…` in **HTML/HubL** context but to `585393.fs1.hubspotusercontent-na1.net/hubfs/585393/…` when compiled inside a **theme `.css`** file (HubL IS processed in theme CSS). So CSS background images load cross-origin from fs1. Keep the LCP hero preload + homepage inline hero on `mdd.io` (document origin, already connected = fastest LCP); `base.html` has a `<link rel="preconnect" href="https://585393.fs1.hubspotusercontent-na1.net">` to cut the connection cost for the fs1-served CSS backgrounds (~310 ms LCP). Keep total preconnects ≤4.
- **Remaining perf ceiling is third-party JS (TBT), not our code or LCP.** After images + jQuery + fonts + hero were fixed, the mobile score (~60) is gated by ~333 KB of tracking JS executing on the main thread: Facebook Pixel (~166 KB, biggest), HubSpot marketing (~129 KB: analytics `585393.js`, `web-interactives`, `collectedforms`, `banner`, `pixels`), LinkedIn Insight (~38 KB). These are NOT in the page HTML (verified: `grep facebook/licdn` on rendered page = 0) — they're loaded **dynamically by HubSpot's tracking script from connected Ads integrations**, so they can ONLY be removed in the HubSpot UI: **Marketing → Ads** (disconnect/disable FB + LinkedIn ad-account auto-tracking) and **Settings → Tracking & Analytics → Collected Forms** (toggle off). Keep core `585393.js` (HubSpot analytics) + `banner.js` (consent). Removing FB Pixel is the single biggest remaining lever — BUT it breaks ad conversion tracking, so it's a marketing tradeoff, not a free win. No theme edit can fix this; theme-side optimization is essentially exhausted. Realistic ceiling for a HubSpot CMS site with core analytics: ~75–90 mobile.
