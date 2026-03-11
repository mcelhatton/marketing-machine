# MDD Marketing Machine

## What This Project Is
A Codex CLI-powered marketing automation system for Mobile Dealer Data (MDD). Prompt once, get a complete multi-channel campaign — content created, files saved, ready for publishing.

## Company
Mobile Dealer Data (MDD) — automotive technology company building Real-Time Location Systems (RTLS) for car dealerships. Website: mdd.io. Tagline: "We Find Keys & Cars™". Phone: 844-292-7110. Address: 5600 Pioneer Creek Drive, Maple Plain, MN 55359.

## Products
- **MDD Locate** — Bluetooth key & vehicle tracking. Flagship product.
- **Service Workflow** — Automated service lane workflow powered by LocateIQ.
- **Recon Workflow** — Automated reconditioning pipeline powered by LocateIQ.
- **VehicleVault** — F&I consumer product. Dealer-branded app with key tracking for customers.
- **LocateIQ** — The underlying technology. Workflow automation powered by real vehicle location. This is our differentiator. Pronounced "locate IQ."

## Key Rules
All rules files are in `.Codex/rules/`. Read them before generating any content.
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

---

## HubSpot CMS Integration

This project also manages the HubSpot CMS theme. See `.Codex/rules/04-hubspot-deployment.md` for deployment commands.

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
