# MDD Brand System v1

The visual system for mdd.io. Lives in `mdd-theme/css/brand.css`.

---

## Thesis

**Technical data, plainly set.**

MDD sells measurable operational outcomes, and `.claude/rules/05-brand-voice.md` already
requires that every benefit claim carry a named dealership and a specific number. The
visual system takes that literally: **figures are the hero, everything around them is
quiet.** The page reads like a spec sheet, not a brochure.

This is why the system is premium without being generic. The restraint isn't
decoration — it's there so the numbers land.

---

## House rules

These are the six calls that make it a system rather than a set of styles. Breaking one
is what will make a new page look off.

1. **One typeface.** DM Sans, three weights, strict roles. Display is *always* 400 or
   500 — never 700+. Heavy type reads cheap at large sizes; premium comes from size and
   tight tracking, not weight.
2. **One accent.** Green. **Gold is retired** from the system. Red is errors only.
3. **No cards.** Hairlines and space carry structure. Never stack border + shadow +
   radius to make a box.
4. **Every figure is attributed.** `.mdd-fig` always ships a `.src` line. An
   unattributed number is off-brand.
5. **Dark is an event, not a default.** Ink grounds mark beginnings, product moments,
   and endings. Everything between them is paper. A page that is mostly dark loses the
   contrast that makes the dark moments work.
6. **One easing curve, two durations.** Motion confirms; it never performs.

---

## Tokens

### Ground

| Token | Value | Use |
|---|---|---|
| `--ink-900` | `#080A0C` | Footer |
| `--ink-800` | `#0F1216` | Base dark ground — hero, product, CTA |
| `--ink-700` | `#151A1F` | Raised dark — data strips, inset bands |
| `--ink-600` | `#1E252C` | Hover / tertiary surface |
| `--paper` | `#F6F6F3` | Base light ground |
| `--paper-2` | `#FCFCFA` | Secondary light |
| `--paper-3` | `#FFFFFF` | The one surface that lifts — forms |

Neutrals are pulled a few degrees toward the accent's hue. They are never pure grey and
never pure black — that's the difference between chosen and inherited.

### Accent

| Token | Value | Use |
|---|---|---|
| `--grn-500` | `#8AC833` | **Brand primary.** Buttons, accents on ink. Locked by CLAUDE.md. |
| `--grn-400` | `#A5DB54` | Button hover only |
| `--grn-700` | `#4E8409` | **The only green legible as text on paper.** Every green word or rule on a light ground. |
| `--grn-100` / `--grn-600` / `--grn-900` | | Reserved for future use |

> `#8AC833` fails contrast as text on paper. Use `--grn-700` there, always.

### Hairlines

`--line-ink: rgba(255,255,255,.13)` · `--line-pap: rgba(15,18,22,.12)`

The system's only structural device. Everything that would have been a card border,
divider, or box is one of these two values.

### Space

`--s1` 4 · `--s2` 8 · `--s3` 12 · `--s4` 16 · `--s5` 24 · `--s6` 32 · `--s7` 48 ·
`--s8` 64 · `--s9` 88 · `--s10` 120

Section rhythm: `--band` `clamp(88px, 10.5vw, 152px)` · `--band-sm` `clamp(52px, 6vw, 84px)`
Gutter `clamp(20px, 4vw, 40px)` · Container `1240px`

### Motion

`--ease: cubic-bezier(.22,.61,.36,1)` · `--fast: 200ms` (hover) · `--slow: 800ms` (reveal)

Reveals stagger inside a group via `style="--d:110ms"` on each item. Roughly 110ms
apart; never more than four steps.

---

## Type scale

| Class | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `.mdd-d1` | `clamp(42px, 7.4vw, 96px)` | 500 | `-.042em` | **One per page.** Hero only. |
| `.mdd-d2` | `clamp(32px, 5vw, 62px)` | 500 | `-.036em` | Section headers |
| `.mdd-d3` | `clamp(24px, 3.4vw, 40px)` | 400 | `-.028em` | Editorial statements, pull quotes |
| `.mdd-h` | `clamp(20px, 2.2vw, 26px)` | 500 | `-.022em` | Sub-section titles |
| `.mdd-lede` | `clamp(17px, 1.45vw, 19.5px)` | 400 | — | Supporting paragraph, max 54ch |
| `.mdd-body` | `16.5px` | 400 | — | Running text, max 62ch |
| `.mdd-small` | `14.5px` | 400 | — | Captions, form fine print |
| `.mdd-label` | `10.5px` | 600 | `.17em` | **The system's only uppercase.** |

Tracking tightens as size grows. That optical compensation is the single biggest reason
large type reads expensive rather than shouty.

---

## Components

### `.mdd-fig` — the signature

Value / unit / meaning / source. Tabular numerals so figures align in a row.

```html
<div class="mdd-fig">
  <span class="v">$308K<span class="u">/mo</span></span>
  <span class="k">Added F&I revenue, one rooftop.</span>
  <span class="src">Brandon Honda</span>
</div>
```

Wrap four of them in `.mdd-data` for the spec-sheet strip.

### `.mdd-split` — the editorial grid

`5fr / 1fr / 5fr`. Section header left, supporting copy right, a full column of air
between. Using the same asymmetry on every section is what makes a page read designed
rather than assembled. Add `.is-baseline` to bottom-align.

### `.mdd-list` — replaces the bullet list and the feature card

Hairline rows of `<b>term</b><span>explanation</span>`.

### `.mdd-field` — the one graphic device

Concentric hairlines radiating from a point: what a real-time location system actually
looks like. Position the focus with `style="--fx:76%;--fy:44%"` — aim it at the product
shot so the motif means something.

**Dark grounds only. Never above ~4% alpha.** It should register as atmosphere, never as
a pattern.

### `.mdd-btn` / `.mdd-alink`

Flat. No gradients, no glow — both date fast and neither survives being scaled up. The
arrow (`<span class="ar">→</span>`) moves 3px on hover. That is the whole interaction.

### `.mdd-stage`

One light angle for every product shot on the site. Consistency here is most of what
separates a considered site from a collection of pages.

---

## Grounds and rhythm

A page alternates. The reference sequence, from VehicleVault:

```
ink   ── hero
ink-2 ── technical data strip
paper ── trust strip (band-sm, hairline bottom)
paper ── editorial statement
ink   ── product showcase
paper ── the argument
white ── lead capture
ink   ── proof
paper ── how it works
white ── lead capture
paper ── FAQ
ink   ── close
```

Three ink moments: open, product, close. Everything else is paper.

---

## Rollout — complete

`brand.css` loads from `base.html` and is scoped under `.mdd`. A page opts in by
wrapping its content in `<div class="mdd">`; nothing in the file can affect a page that
hasn't. All live pages are converted:

| Page | ID |
|---|---|
| Home | 210704149105 |
| Key Tracking | 210709456934 |
| Lot Management | 210709456938 |
| Service Workflow | 210709456940 |
| Recon Workflow | 210704149108 |
| VehicleVault | 210704149110 |
| How It Works | 210704149112 |
| Proof | 210704149114 |
| Contact | 210709456944 |
| Insights | 215681413790 |
| About | 215681413806 |

Plus `blog.html` (standalone template — links `brand.css` itself) and `glossary.html`.
`demo.html` is the internal sales-demo app and is deliberately **not** on the system.

### Conversion state — every page is now rebuilt on the components

The rollout originally landed in two tiers: VehicleVault rebuilt on the components, and
everything else merely restyled through the site-vocabulary layer while keeping its
centred composition. **That second tier is gone.** As of 2026-08-06 all eleven pages are
composed directly on `.mdd-*` components — asymmetric `.mdd-split` / `.mdd-head` headers,
`.mdd-data` figure strips, `.mdd-field` ink moments, staggered `.mdd-r` reveals.

Reference implementations, in order of usefulness as a model:

| Page | Why copy it |
|---|---|
| `mdd-vehiclevault.html` | Densest use of the components; hand-built lead-capture bands |
| `homepage.html` | The canonical hero + data strip + product-grid rhythm |
| `mdd-key-tracking.html` | The pattern for a standard product page built out of modules |

**The site-vocabulary layer still exists and is still load-bearing.** Four legacy grids
were kept deliberately, because the layer already renders them exactly as the system
wants and rewriting them would have been churn for no visual change:
`.home-cards` / `.home-card`, `.home-steps` / `.home-step`, `.home-quote`, `.home-trust`.
Everything else in that layer (`.section`, `.bg-light`, `.lp-light-h2`, `.section-tag`,
the `.hero` scrim, module output) is now reached only through the shared modules.

Those four grids were written for paper only. Placing one on an ink ground needs the
`.mdd-ink` / `.mdd-ink2` variants added alongside them in `brand.css` — without those the
copy renders dark-on-dark.

### The shared modules

`hero`, `stats-bar`, `sample-cta`, `lead-form`, `faq` and `cta-section` are what nine of
the eleven pages are assembled from, so they carry the system rather than each page
re-implementing it.

- **`hero.module`** emits `.mdd-label` / `.mdd-d1` / `.mdd-lede` / `.mdd-actions`, and owns
  `id="main-content"` — the header's skip-link target, which previously existed only on
  the two hand-built pages and was a dead link everywhere else. It carries **no `.mdd-r`**:
  the hero is the LCP on every page and must paint immediately rather than start at
  `opacity:0` waiting on the observer. Don't add one.
- **`stats-bar.module`** emits a `.mdd-data` strip of `.mdd-fig`s on a real `.mdd-ink2`
  ground, so the ink-scoped figure rules apply natively. `stat_N_dealer` becomes the `.src`
  line, and a figure with no source is **not rendered at all** — house rule 4, enforced in
  the template. `stat_N_color` is dead; the field survives only so existing module
  instances keep validating.
- The `background` field maps to grounds, not to legacy `bg-*` classes: `light` → paper,
  anything else → ink.

`.mdd-data` defaults to four tracks; `.cols-3` / `.cols-2` / `.cols-1` match the strip to
however many attributed figures a page actually has.

The reveal-on-entry observer lives in **`base.html`**, once, guarded by `window.__mddReveal`.
Pages no longer ship their own copy. Anything hidden at load (the Insights library) has to
add `.in` itself on reveal, since the observer never saw it.

### Site chrome

`.mddx-header` / `.mddx-footer` are live in `partials/`. The header is flat and
transparent over a dark hero, solidifying on scroll — replacing the floating pill and
its gradient button.

### Bugs fixed during the rollout

The modules were emitting class names that existed in no stylesheet, so several
sections had been rendering unstyled:

- `.hero-content`, `.cta-group`, `.hero-centered`, `.tag-gold` — the hero module's
  `layout="centered"` never centred, and the VehicleVault gold tag always rendered green
- `bg--light`, `feature-grid--3col`, `.step-card`, `.testimonial-quote`,
  `.section-headline` — feature grid, steps and testimonial modules
- Every button showed a **double arrow** (`Schedule a 15-Min Demo → →`): the module
  appended `&rarr;` to a field value that already ended in one. Modules now strip any
  trailing arrow and append a single `<span class="ar">`.
- Every dark band repeated the same dealership-lot photograph. The photo is now
  reserved for the hero; `.mdd .bg-dark` is flat ink.

Found and fixed in the 2026-08-06 page rollout:

- The header's **skip link pointed at `#main-content`, which existed on two pages.** On the
  other nine it went nowhere. `hero.module` now emits the id.
- **Gold survived on live pages** after being retired — `section-tag gold` on key-tracking,
  recon and about, and `stat_N_color="gold"` on five stat bars. All gone. (`mdd-locate.html`
  and `mdd-workflow.html` still contain gold; both are off the live nav and were left alone.)
- The **aggregate figures on `/mdd-proof` shipped with empty `stat_N_dealer`**, i.e.
  unattributed numbers on the page whose entire job is attribution. They now read
  "Across MDD dealers".
- `.mdd-split` with a **single child** lands in column 3, not column 1 — both the
  `:first-child` and `:last-child` rules match it. A lone section header wants `.mdd-head`.

### Deploying

Theme source is written with the private-app token (the `hs` CLI token lost its `files`
scope):

```
curl -X PUT "https://api.hubapi.com/cms/v3/source-code/published/content/<theme>/<path>" \
     -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" -F "file=@<localfile>"
```

then POST `content/api/v2/pages/{id}/publish-action` `{"action":"schedule-publish"}`
for each page ID above.

**Stage first.** `mdd-theme-v2` is a full copy of the theme folder — upload there,
point a throwaway page at `mdd-theme-v2/templates/<x>.html`, verify, then upload to
`mdd-theme`. Two caveats learned the hard way: v2 has no `mdd-assets`, so
`get_asset_url` returns empty and backgrounds render as `url()`; and module
`fields.json` in v2 can be stale/empty, which makes a module render **nothing** rather
than error. Sync `meta.json` + `fields.json` too before trusting a staging result.

---

## Copy discipline

The system assumes short copy. Sections are built for one statement plus one supporting
sentence, and the `.mdd-lede` / `.mdd-fig .k` max-widths enforce it. If copy overruns
those measures, cut the copy — don't widen the measure.

Everything in `.claude/rules/05-brand-voice.md` still governs. This system just gives
the numbers somewhere to land.
