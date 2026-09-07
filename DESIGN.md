---
name: Rajarshi Lahiri — Digital Garden
description: A green-black garden reproduced in five inks, dithered where there is a real image and flat everywhere else.
colors:
  bg: "#0d1310"
  bg-alt: "#111814"
  surface: "#141c17"
  surface-hi: "#18211b"
  soil: "#080c0a"
  text: "#e6e4d9"
  text-dim: "#99a597"
  text-faint: "#7f8e7f"
  accent: "#9ecb8f"
  accent-dim: "#3f5c40"
  accent-deep: "#16241a"
  line: "#202a23"
  line-hi: "#2f3d33"
  signal: "#d9a441"
  stem-seedling: "#647563"
  stem-budding: "#7ca173"
  stem-evergreen: "#c2d9a4"
  ink-0: "#070b09"
  ink-1: "#1e2f22"
  ink-2: "#41613f"
  ink-3: "#84a877"
  ink-4: "#dfe3cf"
typography:
  display:
    fontFamily: "Literata, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.441rem, 6.5vw, 3.052rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "'opsz' 72"
  headline:
    fontFamily: "Literata, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(1.953rem, 3.2vw, 2.441rem)"
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: "-0.02em"
    fontVariation: "'opsz' 72"
  title:
    fontFamily: "Literata, Iowan Old Style, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
    fontVariation: "'opsz' 40"
  body:
    fontFamily: "Literata, Iowan Old Style, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "normal"
    fontVariation: "'opsz' 14"
  ui:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.86em"
    fontWeight: 400
rounded:
  none: "0"
  stem: "2px"
  frame: "8px"
spacing:
  gutter: "1.5rem"
  row: "1.4rem"
  stack: "2.1rem"
  band: "clamp(3rem, 7vw, 4.5rem)"
  section: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.bg}"
    rounded: "{rounded.none}"
    padding: "0.62rem 1.1rem"
    typography: "{typography.ui}"
  button-primary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "0.62rem 1.1rem"
    typography: "{typography.ui}"
  button-ghost-hover:
    textColor: "{colors.accent}"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.none}"
    padding: "0.2rem 0.55rem"
    typography: "{typography.label}"
  filter:
    backgroundColor: "transparent"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.75rem"
    typography: "{typography.label}"
  filter-pressed:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.bg}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.text-dim}"
    typography: "{typography.label}"
  nav-link-current:
    textColor: "{colors.accent}"
  stage-note:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.none}"
    padding: "0.85rem 1.1rem"
    typography: "{typography.ui}"
  portrait:
    backgroundColor: "{colors.soil}"
    rounded: "{rounded.frame}"
    width: "clamp(170px, 22vw, 240px)"
---

# Design System: Rajarshi Lahiri — Digital Garden

## Overview

**Creative North Star: "The Five-Ink Garden"**

The site is a plot of ground rendered under a fixed ink budget. Everything sits on a green-black ground (`bg` #0d1310), with a near-black soil (`soil` #080c0a) held back for the two places something is inset into that ground — the portrait frame and code blocks; the only material in the world is an ordered dither, and it appears exclusively where a real photograph is being reproduced. Dithering is a reproduction technique, not a texture: it earns its place because the five-ink ramp genuinely cannot hold the tones of a photograph, and it is therefore forbidden as wallpaper. The stylesheet contains zero `radial-gradient` declarations and the build ships no procedural dot field, no animated noise, no grain overlay. That absence is a rule, not an oversight.

Density is editorial rather than dashboard-like. Structure is carried by hairlines (`line` #202a23, `line-hi` #2f3d33) and by whitespace; there are no bordered card grids and no drop shadows anywhere in the build. Confidence is the one thing the interface visualises: a three-step stem ramp (`stem-seedling` → `stem-budding` → `stem-evergreen`) encodes how tended a note is, and it is the only place saturation is allowed to mean something. One warm ochre (`signal` #d9a441) exists solely as the focus ring — it never appears as decoration.

Confirmed rejections, all verifiable in the built code: no eyebrow or kicker above any heading (the entry kind moved into the meta row), no mono-caps "technical" label kit, no `text-transform: uppercase` and no positive letter-spacing anywhere sitewide, no decorative section numbering.

**Key Characteristics:**
- One dithered material, applied only to reproduced photographs
- Five-ink ramp defined once in CSS and read at runtime by the renderer
- Two families only: Literata reads and displays, Archivo runs the interface
- Hairlines and whitespace instead of cards and shadows
- Growth stage as the single encoded signal, carried by saturation not hue
- One warm accent reserved entirely for focus

## Colors

A single desaturated green-black world, lit by one soft leaf-green and interrupted by exactly one warm.

### Primary
- **Leaf Green** (`accent`): every link, the brand mark strokes, active nav, hover states, `::marker` and code voice. It is the only hue that moves toward chroma in normal reading.
- **Moss Underline** (`accent-dim`): underline colour for prose links, wiki-link dashed rule, blockquote spine, `.routes` resting border. The quiet form of the accent, used where a full-strength green would shout.
- **Ink Wash** (`accent-deep`): `::selection` background, inline-code background, panel hover wash. A near-black green that reads as a stain rather than a fill.

### Secondary
- **Signal Ochre** (`signal`): the focus ring (`outline: 2px solid`, `outline-offset: 3px`, widened to 4px inside the home page bands) and nothing else. Its total absence from decoration is what makes it legible as a state.

### Tertiary
- **Stem Ramp** (`stem-seedling` / `stem-budding` / `stem-evergreen`): the three growth stages. Confidence rises with saturation and lightness on one hue, so the ramp reads as an ordered scale rather than three categories. Used on the home index rows’ left rails (`.entry-stem`) and on the lit steps of the stage meter.
- **Ink Ramp** (`ink-0` … `ink-4`): the five reproduction inks. These are not UI colours; they are the palette a dithered image is quantised into, and they are consumed by `public/js/dither.js` at runtime.

### Neutral
- **Garden Ground** (`bg`): page background; also the header's translucent base (82% over a 14px blur).
- **Ground Wash** (`bg-alt`): the alternate section band.
- **Bed Surface** / **Bed Surface Raised** (`surface` / `surface-hi`): list rows, stage note, facts table, mobile nav menu; the raised value is the hover step.
- **Soil** (`soil`): the portrait frame's backing and code block backgrounds — the two things inset into the ground.
- **Bone** (`text`): primary reading colour, warm off-white so it does not glare against the green-black.
- **Sage Dim** (`text-dim`): secondary prose, summaries, nav at rest.
- **Sage Faint** (`text-faint`): meta lines, axis ticks, captions, colophon.
- **Hairline** / **Hairline Raised** (`line` / `line-hi`): all structural rules, borders and dividers.

### Named Rules
**The One Warm Rule.** Signal ochre appears only as a focus ring. If a new surface needs a warm accent for anything else, it does not get one.

**The Ramp Is Defined Once Rule.** `--ink-0` … `--ink-4` and `--dither-cell` live in `:root` and are read from computed style by the dither engine. Never hardcode ink values in a script or a component; changing the CSS custom property is the supported way to change every rendered image.

**The Saturation-Not-Hue Rule.** Growth stage is encoded by moving along one green from muted to bright. Do not add a second hue to represent state.

## Typography

**Display Font:** Literata (with Iowan Old Style, Georgia, serif)
**Body Font:** Literata for long-form reading; Archivo (with system-ui, Segoe UI, Roboto) for interface, meta and micro-labels
**Label/Mono Font:** the platform mono stack (`ui-monospace`, SFMono-Regular, Menlo, Consolas) — code only, three sites in the whole build

**Character:** A variable serif with real optical sizing carries everything the reader is meant to slow down for; a neutral grotesque carries everything that is machinery. The pairing is quiet — no tracked-out caps, no mono costume — and the only expressive move is the optical size axis being set deliberately per role.

### Hierarchy
- **Display** (Literata 500, `clamp(2.441rem, 6.5vw, 3.052rem)`, line-height 1, `opsz` 72, tracking -0.02em): the name in the soil band and page `h1`s.
- **Headline** (Literata 400–600, `clamp(1.953rem, 3.2vw, 2.441rem)`, line-height 1.18, `opsz` 48–72, tracking -0.02em): band headings and section titles.
- **Title** (Literata 400–600, 1.25rem, line-height 1.25, `opsz` 32–40): list item titles, entry links, role headings.
- **Body** (Literata 400, 1.125rem, line-height 1.72, `opsz` 14): long-form prose, capped at 68ch.
- **UI** (Archivo 400–500, 1rem, line-height 1.6): summaries, list descriptions, buttons, footer links.
- **Label** (Archivo 400, 0.8rem, tracking normal, sentence case): meta rows, tags, filters, nav links, axis ticks, captions.

### Named Rules
**The Two Faces Rule.** Content titles and long-form reading take Literata; interface, meta and micro-labels take Archivo. There is no third voice. The mono stack is for code, not for looking technical.

**The One Ladder Rule.** Sizes come from the 1.25 ratio ladder (`--t-xs` 0.8rem through `--t-3xl` 3.052rem) off a 16px base. `--t-read` (1.125rem) is not a rung: it is the serif's optical match to `--t-base`, used only for serif reading.

**The No Tracking-Out Rule.** Exactly one tracking value exists (-0.02em) and it applies only above `--t-lg`. Zero `text-transform: uppercase` and zero positive letter-spacing declarations remain sitewide; keep it that way.

**The Optical Size Rule.** Literata is variable on `opsz 7..72`. Set it explicitly per role — small in prose (14), large in display (72). Values above 72 silently clamp, so do not request them.

## Layout

A single centred shell (`--shell` 1160px) with a 1.5rem gutter, narrowing to 900px for mid-width pages and to `68ch + gutters` for reading. Reading measure is capped hard: prose 68ch, leads and summaries 54–62ch, list descriptions 58–68ch.

Vertical rhythm runs on fluid bands: `clamp(3rem, 7vw, 4.5rem)` for the home page's content bands, 5rem for the shared `.section`, each separated by a single top hairline rather than a background change. Lists stack on a 2.1rem gap; index rows use a `3px 1fr` grid with a 1.4rem gutter so the stage rail sits in its own column.

The hero band is one shared grid (`.hero-grid`), defined once in the global stylesheet and used unchanged by the home page and About: `minmax(0, 1fr) auto` with `align-items: start` and a `clamp(1.5rem, 5vw, 4rem)` gap. The text column takes the slack so the portrait sits flush with the right edge of its container, aligning with the nav above it; the lead carries its own `max-width`, so absorbing the slack costs nothing in measure. Below 860px it collapses to a single column at a 2.25rem gap and the portrait takes `order: -1`, arriving above the text.

Responsive behaviour is by collapse, not by re-composition. Breakpoints observed in the build: 940px (3-up grid falls to 2), 860px (hero collapses and the portrait moves above the text, two-column work list goes single-column), 780px (nav collapses to a `details`/`summary` disclosure), 700px (date/label side columns stack), 640px (all grids single-column). Above 780px navigation is a full inline row.

**The Shared Hero Rule.** There is one hero grid and it lives in the global stylesheet. A page that needs a hero uses `.hero-grid` as written; it does not re-declare the columns, the gap, or the collapse locally.

## Elevation & Depth

Flat by construction. There are no drop shadows in the build and none are permitted. Depth is tonal: `soil` sits under `bg`, `surface` sits above it, `surface-hi` is the hover step, and separation is drawn with hairlines. The sticky header is the only layer that reads as floating, and it does so through translucency (82% ground over a 14px backdrop blur) plus a bottom hairline that only appears once the page has scrolled past 8px.

The build declares no `box-shadow` at all, apart from a single `box-shadow: none` reset applied to a third-party embed. The elevation vocabulary is empty on purpose.

### Named Rules
**The No-Lift Rule.** Hover never lifts, scales a surface, or casts. It changes tone (`surface` → `surface-hi`) or washes with `accent-deep` at 0.09 opacity. The one scale transform in the build is on a photograph inside a fixed frame, where nothing moves but the image.

## Shapes

Square by default. Buttons, tags, filters, panels, tables, code blocks, the mobile menu and the nav toggle all have zero radius; the form language is the rectangle plus the hairline. Radius appears in exactly two places and both are physical objects rather than UI chrome: the dithered portrait frame (a single shared 8px, identical on every page) and the index rows' stage rails (a uniform 2px on a 3px-wide bar — enough to soften the caps without reading as a pill).

Borders are 1px throughout, with a 2px accent-dim spine on blockquotes and a 2px accent-dim underline under the home page's `.routes` text links, which go full accent on hover. Dashed and dotted borders are semantic: dashed under a resolved wiki-link, dotted under one that points at an unwritten note, dashed around empty states.

Grids of panels are drawn as a 1px gap over a `line` background with a `line` border, so shared hairlines are single-width rather than doubled at every seam.

## Components

### Buttons
- **Shape:** square (0 radius), 1px border, `0.62rem 1.1rem` padding, 0.55rem icon gap.
- **Primary:** leaf green fill, ground-coloured text, matching border.
- **Hover / Focus:** primary inverts to transparent with green text and border, over 0.2s on the shared `cubic-bezier(0.4, 0, 0.2, 1)`. Focus is the global ochre ring.
- **Ghost:** transparent, bone text, `line-hi` border; hover moves text and border to leaf green.

### Chips (tags and filters)
- **Style:** transparent, `line-hi` hairline, `0.2rem 0.55rem` (tag) or `0.35rem 0.75rem` (filter), label type, no radius.
- **State:** hovering a tag moves text and border to the accent. A pressed filter (`aria-pressed="true"`) inverts fully: leaf-green fill, ground text.

### Containers
- **Corner Style:** square. There is no card component; the bordered card grid was removed on purpose.
- **Background:** `surface` at rest, `surface-hi` on hover or focus-within.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px `line`, or a shared 1px gap in a grid.
- **Internal Padding:** 1rem–1.9rem depending on density; list rows use `1rem 1.2rem`.

### Navigation
Sticky, translucent, label-sized Archivo in `text-dim`. The current page is leaf green with a 1px accent underline offset -0.45rem below the label. The brand is a 22px inline SVG of three ascending strokes, one per growth stage, on the same 1.5 stroke weight as every other authored icon, followed by the name and an accent full stop. Below 780px the link row is replaced by a `details`/`summary` disclosure: a 40px square button whose border and glyph turn accent when open, opening a `surface` panel with `line-hi` border.

### Content List (`.work` / `.work-item`)
The shared language for every collection of things: a serif title at 1.25rem weight 400, one dimmed sentence capped at 58ch, and a quiet label-sized meta line. It replaced the bordered card grid and is used identically on the home page, `/projects` and the About publications block — a collection of things reads the same wherever it appears.

### Hero Band (`.hero` / `.hero-grid`)
The opening of both the home page and About: a display `h1`, a `.hero-lead` in reading serif capped at 54ch, one action row, and the dithered portrait beside it. The action row has two forms and they are not interchangeable — `.routes` on the home page is a pair of plain text links on a 2px moss underline at a 1.75rem gap; `.hero-actions` on About is a 0.8rem flex row of bordered buttons. Text links for going somewhere, a button for a download.

### Index Row (`.index` / `.entry`)
The home page's staged list: a `3px 1fr` grid whose left column is a full-height `.entry-stem` rail carrying the three-step stage ramp as its background (seedling / budding / evergreen), then a serif title at 1.25rem, one dimmed sentence capped at 62ch, and a `.row-meta` line at label size in `text-faint`. Finished posts take `.entry-stem--cut`: a top-aligned 1.1rem `line-hi` stub instead of a full rail, because a finished thing has stopped growing. The rail is `aria-hidden`; the stage it encodes is always also present as text in the meta line.

Two meta classes exist and they are different components — do not merge them. `.entry-meta` is the entry header's wrapping flex meta row in the global stylesheet (0.75rem/1.4rem gaps, hairline `.sep` separators). `.row-meta` is the home index row's single inline meta line. The home row carries its own name precisely because the global flex rule was otherwise reaching it.

### Growth Stage Meter (`.stage`)
Three 9px squares with `line` hairlines; lit steps fill solid with `stem-budding`. Lit steps read by fill, not by pattern — at 9px a pattern difference is invisible, and a dot lattice here would be dithering with nothing to reproduce. The label beside it takes the accent at evergreen and `text-dim` at budding. Every instance carries a screen-reader blurb, because the visual ramp alone does not say what a stage means.

### Dithered Image (`img[data-dither]`)
The signature component and the system's only material. The engine wraps the image, adds a canvas, and quantises luminance into the five `--ink-*` values using an 8×8 Bayer ordered threshold **added before rounding** — that ordering is what puts the crosshatch in the mid-tones. The backing store is sized in dots (`cssPx / --dither-cell`, currently 3), never in device pixels, which is what makes one dot the same size on every element and independent of DPR; CSS scales it back up with `image-rendering: pixelated`. Ordered rather than error-diffused on purpose: the crosshatch is the recognisable artefact and it stays stable across resizes. The source `<img>` remains in the DOM for alt text and the no-JS case and is cross-faded out over 0.45s once the canvas paints; if the canvas is unavailable or tainted, the undithered photograph simply stays. Currently applied to the portrait and the achievement images.

### Wiki-links
Accent text over a 1px dashed `accent-dim` underline. A link to a note that does not exist yet drops to `text-faint`, switches to a dotted underline, takes a `help` cursor and carries a superscript `◌`. Unresolved links are a legitimate state of the garden, not an error.

## Do's and Don'ts

### Do:
- **Do** dither only real photographs, through `img[data-dither]`, and let `public/js/dither.js` read `--ink-*` and `--dither-cell` from `:root`.
- **Do** encode growth stage with the three-step stem ramp — the `.entry-stem` rail or the `.stage` meter — and always pair the visual ramp with text a screen reader can reach.
- **Do** draw structure with 1px hairlines (`line`, `line-hi`) and whitespace.
- **Do** keep prose at 68ch and secondary copy between 54ch and 62ch.
- **Do** set `font-variation-settings: 'opsz'` explicitly per role: 14 for prose, 40–48 for titles, 72 for display.
- **Do** reserve signal ochre for the focus ring, and keep a visible focus ring on every interactive element.
- **Do** put a new collection of things into `.work` / `.work-item`, and a staged or dated index into `.index` / `.entry`, rather than inventing another list style.
- **Do** use the shared `.hero-grid` as written for any new hero, portrait included.
- **Do** use authored inline SVG on the 1.5 stroke weight via `.icon` for any new icon.

### Don't:
- **Don't** use dither, dot fields, grain or noise as a background texture. Zero `radial-gradient` declarations exist in the stylesheet; keep the count at zero.
- **Don't** put an eyebrow, kicker or overline above a heading. Kind, stage and date belong in the meta row beneath the title.
- **Don't** add a drop shadow, glow, or spread ring. The build declares no `box-shadow`; depth is tonal.
- **Don't** introduce `text-transform: uppercase` or any positive letter-spacing. Both counts are zero sitewide.
- **Don't** use monospace as a voice. It is for code, and there are exactly three code sites.
- **Don't** add a third font family or a second tracking value.
- **Don't** build a bordered card grid; the content list replaced it.
- **Don't** number sections decoratively, or add a second hue to signal state.
- **Don't** ship a glyph icon font. Icons are authored inline SVG.
- **Don't** request a Literata `opsz` above 72; it clamps silently.

<!-- Open item, not part of the system: Font Awesome is still loaded from CDN in
     src/layouts/Base.astro and used for four brand glyphs in Footer.astro,
     photography.astro and projects/[...slug].astro. It is a disclosed defect the
     build carries pending the author's decision, not the icon system, and must not
     be inherited by new surfaces. -->
