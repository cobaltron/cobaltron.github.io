---
name: Rajarshi Lahiri
description: Prussian ink halftoned onto uncoated cream — one dot pitch, one ink, everywhere.
colors:
  prussian-ink: "#23457a"
  uncoated-cream: "#f5f3ed"
  cream-dim: "#eceade"
  cream-sunk: "#e7e4d9"
  pressed-black: "#191814"
  text-dim: "#56534a"
  text-faint: "#6f6b60"
  hairline: "#dcd8cc"
  hairline-hi: "#c4bfb1"
  selection: "#dbe3f0"
  ink-0: "#101a28"
  ink-1: "#2b4463"
  ink-2: "#6480a4"
  ink-3: "#b8c6da"
  ink-4: "#f5f3ed"
  field-ink: "#cdd7e6"
  highlighter: "#e8b93c"
typography:
  display:
    fontFamily: "Archivo, Archivo Fallback, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.953rem, 5vw, 2.441rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Archivo, Archivo Fallback, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.5625rem, 4.5vw, 1.953rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo, Archivo Fallback, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, Archivo Fallback, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, Archivo Fallback, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0.12em"
rounded:
  none: "0"
spacing:
  pad: "1.5rem"
  shell: "980px"
  read: "66ch"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.pressed-black}"
    rounded: "{rounded.none}"
    padding: "0.55rem 1.1rem"
  button-hover:
    backgroundColor: "transparent"
    textColor: "{colors.prussian-ink}"
  link:
    textColor: "{colors.pressed-black}"
  link-hover:
    textColor: "{colors.prussian-ink}"
  nav-link:
    textColor: "{colors.text-dim}"
  nav-link-current:
    textColor: "{colors.pressed-black}"
  section-title:
    textColor: "{colors.text-faint}"
    typography: "{typography.label}"
---

# Design System: Rajarshi Lahiri

## Overview

**Creative North Star: "The Cyanotype Proof"**

A proof pulled in Prussian ink on uncoated cream stock, before the run. The
whole site is one reproduction technique working under a fixed ink budget:
photographs, the ground behind the page, and the one moment of motion are all
the same ink at the same dot pitch. Nothing is drawn that could not be printed.

The register is quiet, printed and exact. Precision is the personality — there
is no second voice, no second family, no surface that raises itself above the
paper. Depth is tonal, carried by dot density rather than by shadow, because a
press has no shadows to give. Where the system spends anything, it spends it on
the material: a portrait that develops on arrival like a print coming up in the
tray, and a soft area under the pointer where the tint lifts off the page.

It explicitly refuses four neighbours: the dark developer portfolio it replaced
(near-black grounds, neon accents, glass, gradient text), the digital-garden
apparatus that preceded it (growth stages, wiki-links, backlinks), the SaaS
marketing template (card grids, drop shadows, gradient CTAs, hero-metric rows),
and monospace worn as a costume for "technical".

**Key Characteristics:**

- One ink, one dot pitch (3 CSS px), one typeface.
- Cream ground; the dither ramp's top step *is* the page colour.
- Zero shadows, zero radii, zero gradients — structure is hairlines and space.
- Contrast is budgeted numerically, not by eye.
- Motion exists only where the material would actually move.

## Colors

A single blue doing every job — ink, ground and interaction — over a warm
uncoated cream, with neutrals that are warm-grey rather than neutral-grey so
nothing on the page reads colder than the paper.

### Primary

- **Prussian Ink** (`#23457a`): the one accent. Link hover, button hover, focus
  rings, caret, scrollbar thumb hover. Never a fill, never a background — it
  only ever arrives as a state change on something already present.

### Neutral

- **Uncoated Cream** (`#f5f3ed`): the page. Also the dither ramp's top step and
  the page field's paper, so all three are the same value by construction.
- **Cream Dim** (`#eceade`): code blocks and inert panels.
- **Cream Sunk** (`#e7e4d9`): inline code.
- **Pressed Black** (`#191814`): body and heading text. Warm, not neutral.
- **Text Dim** (`#56534a`): prose, leads, nav at rest. 6.9:1 on clean paper.
- **Text Faint** (`#6f6b60`): meta rows, labels, link underlines, button
  borders. 4.8:1 on clean paper and 4.5:1 over the densest field.
- **Hairline** (`#dcd8cc`) and **Hairline Hi** (`#c4bfb1`): rules and dividers
  only. These are decoration and may be faint; they must never be the sole
  affordance for anything.
- **Selection** (`#dbe3f0`): text selection, drawn from the field-ink family so
  a highlight reads as more of the same blue.

### Secondary

- **Highlighter** (`#e8b93c`): emphasis, and nothing else. It is the only
  non-blue in the system and the only colour not exposed as a custom property —
  it lives baked inside the stroke data URIs, because a `background-image` SVG
  is an isolated document that cannot read a custom property or `currentColor`.
  Regenerate with `npm run highlighter` after changing it.

### The Dither Ramp

Five steps, dark to light, used only by photographs: `#101a28` → `#2b4463` →
`#6480a4` → `#b8c6da` → `#f5f3ed`. The top step is the page colour, which is
why a dithered photograph has no visible edge — it thins out until it is page
again.

**Field Ink** (`#cdd7e6`) is separate and belongs only to the page field, which
is a two-step halftone of that one ink on paper.

### Named Rules

**The One Ink Rule.** Photographs, the page field, and the accent are all the
same blue family. Everything the *press* puts on the sheet is one ink; if
something needs to be distinguished, distinguish it with weight, size, or a
rule.

**The Second Implement Rule.** The highlighter is the single exception, and it
earns the exception by not being press ink at all: it is a marker someone took
to the printed sheet afterwards. That is why it may be a different colour, why
its edges are rough where everything else is exact, and why it is the only
thing on the page that looks applied by hand. A third implement would need the
same kind of argument, and there is not one available.

**The Ceiling Rule.** `--field-amp` (0.24) is a contrast budget, not a taste
setting. Because the field is a two-step ramp, the amplitude *is* dot coverage:
at 24% coverage of Field Ink the ground stays light enough for Text Faint — the
faintest type on the site — to hold 4.5:1 over it. Raising it without redoing
that sum is how a background starts eating the text.

**The Hairline Is Not An Affordance Rule.** `--line` and `--line-hi` draw
structure. Anything a user must notice in order to act — a link underline, a
button border — takes `--text-faint` or stronger.

## Typography

**Display Font:** Archivo (weights 400, 500, 600)
**Body Font:** Archivo — the same family
**Fallback:** `Archivo Fallback`, a metric-matched alias for local Arial /
Helvetica / Liberation Sans, then system-ui
**Label/Mono Font:** the platform mono stack (ui-monospace, SFMono-Regular,
Menlo, Consolas), used for code only

**Character:** One grotesque doing everything, differentiated by weight and size
rather than by family. A site of lists, links and photographs does not need a
second voice, and a second family is a second thing to keep in agreement.

### Delivery

Requested in the document head with `preconnect` to both Google Font origins,
never as a CSS `@import` — an `@import` cannot start until the stylesheet has
downloaded and parsed, which puts the font two round trips behind the page.
Only the three weights the build actually sets are requested; no italic is
loaded, because nothing in the build sets one.

`Archivo Fallback` exists so `font-display: swap` does not reflow the page.
Archivo's average glyph is 10.7% wider than Arial's (xAvgCharWidth 0.561em
against 0.507em, read from the shipped TTF), so the overrides —
`size-adjust: 110.69%`, `ascent-override: 79.32%`, `descent-override: 18.97%` —
are derived from that ratio rather than estimated.

### Hierarchy

- **Display** (600, `clamp(1.953rem, 5vw, 2.441rem)`, 1.1, `-0.02em`): page
  titles. One per page, in `.head`.
- **Headline** (600, `clamp(1.5625rem, 4.5vw, 1.953rem)`, 1.15, `-0.02em`): the
  title of a single project entry.
- **Title** (500, `1.25rem`, 1.3, `-0.02em`): row titles in a list, and `.lead`
  intro copy at the same size in Text Dim.
- **Emphasis**: not a weight. `<strong>` renders as a highlighter stroke at the
  inherited weight — see Components. The weight returns only under
  `forced-colors` and in print, where background images are dropped.
- **Body** (400, `1rem`, 1.7): prose. Measure capped at 66ch (`--read`);
  secondary copy such as `.lead` runs to 58ch and row copy to 62ch.
- **Label** (600, `0.8rem`, `0.12em`, uppercase): section headings and the kit
  list's terms. The only positive tracking and the only uppercase in the system.

### Named Rules

**The One Family Rule.** No second typeface. Mono is for code, of which there
are two sites; it is never a voice.

**The Tracking Band Rule.** Three tracking values, each tied to a size band,
because a grotesque needs more negative tracking as it grows: `-0.035em`
(`--track-display`) on the two display roles, `-0.02em` (`--track-tight`) on
titles and prose headings, and `0.12em` on the uppercase label. Nothing else is
tracked, and nothing goes past the `-0.04em` floor.

**The Heading Measure Rule.** A heading is never set wider than the body it
heads: 20ch display, 24ch entry title, 34ch prose heading, 46ch row title,
against 66ch prose. Every heading takes `text-wrap: balance`; body and lead copy
take `text-wrap: pretty`.

## Layout

A single centred column, `min(100% - 3rem, 980px)`, with a 66ch reading variant
for prose and single project entries. Sections stack vertically and are divided
by a 1px `--line` rule across the full column width — the rule, not a card or a
background change, is what separates one section from the next.

Vertical rhythm is fluid: `clamp(2.5rem, 6vw, 4rem)` between sections,
`clamp(3rem, 8vw, 5.5rem)` above a page title. Lists use a flat 2.1rem gap and
carry no separators of their own; the space is the separator.

There is exactly **one breakpoint, 46rem**, and it does one thing: turns the two
side-by-side compositions (intro + portrait, about prose + kit list) from
stacked into two columns. Everything else is fluid by construction and needs no
query. A second breakpoint should be treated as evidence that a composition is
wrong rather than as a place to fix it.

The page field sits behind everything as a fixed, viewport-sized canvas at
`z-index: 0`; the header, `main` and the footer are positioned at `z-index: 1`
to ride above it.

## Elevation & Depth

**There are no shadows.** The build declares zero `box-shadow`, zero
`border-radius`, and zero gradients of any kind. This is not an omission — a
printed page has no shadows to give, and adding one would break the only
metaphor the system has.

Depth is entirely tonal, and it is carried by dot density. A photograph recedes
by thinning toward the paper; the page field advances and retreats by gaining
and losing coverage; the pointer lamp reads as light falling on paper because it
removes ink rather than adding a glow. Where something must sit visibly on top
of something else — the sticky header over the field — it does so with an opaque
paper background and a hairline, not with a lift.

### Named Rules

**The No Lift Rule.** Nothing floats. If an element needs to separate from what
is behind it, give it the paper colour and a 1px rule.

## Shapes

Square. Every corner in the system is 0 radius, including buttons, code blocks,
panels and the Instagram embed, which is forced back to `border-radius: 0` to
stop it arriving as a rounded card.

Form language is rectangular and typographic: full-width hairlines, flush-left
columns, and lists that are defined by their spacing rather than by a container.
The one organic shape in the entire build is the portrait's halftone vignette,
and that is generated from the image's own luminance rather than drawn as a
mask.

## Components

**Philosophy: plain and typographic.** Components barely exist as objects. Type,
hairlines and whitespace do the work, and the component layer is deliberately
thin — one button, one link treatment, one row.

### Buttons

- **Shape:** square (0 radius), `0.55rem 1.1rem` padding.
- **Default:** transparent background, Pressed Black label, 1px Text Faint
  border. There is no filled variant and no secondary variant.
- **Hover / Focus:** border and label both go Prussian Ink over 0.18s. Focus
  shows a 2px Prussian Ink ring at 3px offset.

### Links

- **Shape:** underline at 1px, 3px offset, in Text Faint.
- **Hover:** text and underline both go Prussian Ink.
- **Rule:** colour never carries the affordance alone — the underline is always
  present at rest.
- **Outbound:** a 0.62em authored SVG arrow on a 1.5 stroke, plus a visually
  hidden "(opens in a new tab)".

### Navigation

- Text Dim at rest, Prussian Ink on hover, Pressed Black with a 1px bottom rule
  for the current page. Three links and a wordmark; no menu, no hamburger — at
  phone width the row simply wraps.
- The header is sticky with an opaque paper background and gains its bottom
  hairline only once scrolled (`.is-stuck`).

### Rows

The single list primitive, shared by projects and links so the two read as the
same kind of object: a Title-sized heading, one line of Text Dim prose capped at
62ch, and a Text Faint meta row. No borders, no backgrounds, no bullets.

### Highlighter

Emphasis on a printed sheet is not a heavier weight — it is someone marking the
page. Three rough SVG strokes, generated by `scripts/gen-highlighter.py` and
baked into `background-image` data URIs, cycling by paragraph so two marks near
each other are never the same shape twice.

- **Why SVG and not a gradient:** a `linear-gradient` has perfectly straight
  edges, which is the one thing a real highlighter never produces. It would
  also have broken the no-gradients rule for nothing.
- **The tells that make it read:** a skip where the tip lifted, a chisel angle
  at each end, a wavy baseline, and one denser second pass that tapers to
  nothing at both ends. The skip does more work than the wobble at 16px.
- **Geometry:** a `-7 -4 214 48` viewBox with `preserveAspectRatio: none`,
  stretched to the element's background box (roughly 24px tall at body size).
  Amplitudes are authored against that squash, not against the viewBox.
- **Wrapping:** `box-decoration-break: clone`, so a highlight crossing a line
  break gets one stroke per line rather than one box over both.
- **Markup:** it rides on `<strong>`, never `<mark>`, so the bold control in
  Keystatic keeps working and no one has to type an element into their prose.
- **Contrast:** 11.7:1 at worst — both stroke passes overlapping, over the
  densest page field.

### The Dithered Surface (signature)

The system's one real component, in `public/js/dither.js`.

- **Photographs** (`img[data-dither]`) quantise through the five-step ramp with
  an 8×8 Bayer matrix at `--dither-cell` (3 CSS px). The canvas backing store is
  measured in dots and scaled up with `image-rendering: pixelated`, so one dot
  is 3 CSS px on every screen regardless of device pixel ratio.
- **`data-dither="portrait"`** adds a vignette that lifts toward the top ink,
  applied *after* the contrast curve, so the image dissolves into the page with
  no edge.
- **Developing:** on arrival, coverage ramps from a blank plate to the full
  image over 1250ms on a cubic ease-out. At progress 0 the canvas is solid paper
  and indistinguishable from the page, so it needs no fade-in — the dots
  appearing are the entrance.
- **The page field** is a two-step halftone of Field Ink across the whole
  viewport, driven by three separable sine waves and capped at `--field-amp`.
- **The lamp:** on fine pointers, a ~170px area under the cursor where coverage
  falls to zero. It only ever removes ink, so it cannot spend the contrast
  budget. It repaints via `putImageData` dirty rects at display rate while the
  field itself stays on a 15fps clock.
- **Degradation:** the real `<img>` stays in the DOM behind every canvas, the
  canvas is `aria-hidden`, and the image is only hidden once the canvas has
  actually painted.

## Do's and Don'ts

### Do:

- **Do** read the ink ramp and `--dither-cell` from `:root`. The palette is
  defined once; no dithering code may hardcode a colour or a pitch.
- **Do** end any photographic ramp at `--paper`, so a dithered image dissolves
  into the page rather than sitting in a box.
- **Do** treat `--field-amp` as a contrast budget: if you change the field ink
  or the amplitude, redo the sum against `--text-faint` and keep it at 4.5:1.
- **Do** give every link a visible underline at rest in `--text-faint`, and let
  hover move both text and underline to `--accent`.
- **Do** draw structure with 1px hairlines and whitespace.
- **Do** keep prose at 66ch, leads at 58ch, and row copy at 62ch.
- **Do** author icons as inline SVG on a 1.5 stroke weight.
- **Do** mark emphasis with the highlighter, and let it ride on `<strong>` so it
  stays authorable from Keystatic's bold control.
- **Do** regenerate the strokes with `npm run highlighter` rather than editing
  the data URIs by hand; the block between the `highlighter:start` and
  `highlighter:end` sentinels is generated.
- **Do** theme the surfaces the browser draws — selection, caret, focus ring,
  scrollbar — from the palette.
- **Do** stop every canvas behaviour under `prefers-reduced-motion` and draw a
  single static frame instead.
- **Do** keep the real content behind any decorative canvas, `aria-hidden` the
  canvas, and hand the content back if the canvas fails.
- **Do** put any new list of things into `.rows` / `.row` rather than inventing
  another list style.
- **Do** let the frame rate give way before the dot pitch on expensive surfaces;
  the pitch is shared with the photographs and cannot drift.

### Don't:

- **Don't** add a `box-shadow`, `border-radius`, or gradient. All three counts
  are zero and are meant to stay zero.
- **Don't** introduce a second typeface or a fourth tracking value.
- **Don't** introduce another hue. The highlighter spends the one exception the
  system has, on the argument that it is a different implement rather than
  different ink.
- **Don't** use bold as emphasis in prose. The weight is reserved for headings
  and labels; in running text, emphasis is the marker.
- **Don't** use monospace as a voice. It is for code, and there are two code
  sites.
- **Don't** let `--line` or `--line-hi` be the only thing marking something
  interactive; they are decoration and sit below 3:1.
- **Don't** build a bordered card grid. The row list replaced it.
- **Don't** put an eyebrow, kicker or overline above a heading.
- **Don't** step the dither pitch responsively, or give one photograph two
  thresholds on two pages. One pitch, one pattern.
- **Don't** quantise a photograph into fewer than the five ramp steps.
- **Don't** add a second breakpoint without first checking whether the
  composition is wrong.
- **Don't** animate anything the material would not actually do. The field
  drifts, a print develops, a lamp moves; nothing bounces, pulses or slides in
  on scroll.
- **Don't** reintroduce growth stages, wiki-links or backlinks. They were
  removed deliberately.
- **Don't** ship a glyph icon font or stand an emoji in for an icon.
