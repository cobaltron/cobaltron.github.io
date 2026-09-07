# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The author, first. The garden is a thinking tool: Rajarshi writes here to work
things out, and publishes because publishing raises the quality bar. Design
decisions serve revisiting, revising and re-linking his own notes before they
serve anyone else.

The site is public and does get outside readers — practitioners arriving at a
single note through a link or search, and people assessing his work. Their
relative priority is **undecided**; do not promote either group to primary
without asking.

## Product Purpose

A personal digital garden holding two kinds of writing and a record of the work
around them.

- **Notes** — evergreen, revised over time, each carrying a growth stage.
- **Posts** — dated, finished, left alone after publishing.
- Supporting collections: projects, links (things read elsewhere, with the
  reason they stuck), publications, roles, achievements, and singleton About /
  Now / Photography pages.

Success is that it keeps being written in and revised — a note that gets tended
is the product working. It replaced a single-page portfolio that had stopped
changing because there was nowhere to put a half-formed thought.

## Positioning

Salesforce platform depth and applied AI engineering in the same practitioner.
Lightning/Apex architecture, Agentforce agent design, Data Cloud segmentation
and the sharing-and-visibility model on one side; RAG systems, agentic
pipelines and evaluation harnesses on the other. Most people in this space have
one or the other.

It is backed by a computer-vision research grounding — two Springer
publications — which is where the recurring "measure the thing, then believe
it" stance in the writing comes from.

## Operating Context

- Authoring happens in the Keystatic admin UI at `/keystatic`, not by hand in
  the editor. Content lives as MDX and JSON under `src/content/`.
- Notes link to each other with `[[wiki-links]]`, resolved at build time by
  `src/lib/wikilinks.mjs`; every entry renders its backlinks. Links that go
  nowhere yet are deliberate.
- Content schemas are defined twice and must stay in sync:
  `src/content.config.ts` (zod, validated at build) and `keystatic.config.tsx`
  (the editing UI). A field added to one and not the other fails the build.
- Deployed on Vercel. The canonical origin comes from
  `VERCEL_PROJECT_PRODUCTION_URL`, overridable with `SITE_URL`.
- `WRITING.md` documents the authoring workflow; `README.md` documents the
  build.

## Capabilities and Constraints

**Growth stages** — `seedling` (rough and early, possibly wrong), `budding`
(taking shape, edges unresolved), `evergreen` (tended and stable). Density 1–3.
Stages, wiki-links and backlinks are the mechanics of the garden, not
decoration, and must not be dropped.

**Keystatic editability** — everything must remain editable through the admin
UI. No field may be authored only in code.

**RSS and stable URLs** — `/rss.xml` and existing note and post URLs are
commitments to anyone who has subscribed or linked in.

**Draft flag** — `draft: true` hides an entry in production and shows it in dev.

**Stack** — Astro 7, MDX, React islands, Vercel adapter, Keystatic 0.6.
Markdown runs the classic `unified()` processor rather than Astro 7's default
`satteri`, because satteri's `mdastPlugins` silently ignore the wiki-link remark
plugin. Node `>=20 <25`.

**Explicitly not a constraint** — the hand-built dithered portrait treatment
(`public/js/dither.js`, `/img/photo.jpg`) was offered as something to preserve
and not claimed. Treat it as replaceable.

**Undecided** — the relative priority of outside audiences (see Users).

## Brand Commitments

Name: Rajarshi Lahiri; repository and package name `cobaltron`. Social handle
`@rajarshi_lahiri`.

The voice in the existing copy is first-person, plain, and unhedged — willing to
say a thing is half-formed or possibly wrong rather than dressing it up. This is
observed in the shipped content, not confirmed as binding; ask before changing
it, and ask before writing new factual copy in a different register.

## Evidence on Hand

Real, and usable without qualification:

- Two Springer publications — *Detection of Necrosis in Mice Liver Tissue using
  Deep Convolutional Neural Network* (LNCS vol. 11942, ISBN 978-3-030-34872-4)
  and *Detection of Pulsars Using an Artificial Neural Network* (AISC, ISBN
  978-981-13-7403-6).
- Roles: Salesforce Developer & Consultant at Deloitte Consulting (current);
  Salesforce Developer at Tata Consultancy Services (previous).
- Salesforce certifications named in `about.mdx`: Application Architect, Data
  Architect, Agentforce Specialist, Sharing and Visibility.
- Three awards with images at `/img/ac1.jpg`, `/img/ac2.jpg`, `/img/ac3.png`.
- Shipped project write-ups under `src/content/projects/`, including a
  five-stage medical document intake pipeline and a text-to-SQL RAG application
  with an evaluation framework.
- Portrait at `/img/photo.jpg`; photography as Instagram embeds on
  `/photography`.

Absent, and never to be invented: testimonials, named clients, customer counts,
benchmarks, traffic or subscriber numbers, pricing, and any claim about work
done for a specific Deloitte or TCS client beyond what `roles/` already states.

## Product Principles

1. **The author is the first reader.** Optimise for returning to and revising
   your own notes; outside readers benefit from that, not the reverse.
2. **Confidence is visible.** Publish half-formed work as half-formed. The
   stage marker is the honesty mechanism, not a badge.
3. **Everything stays editable in Keystatic.** A change that can only be made in
   a code editor has broken the product.
4. **Inbound links are commitments.** URLs and the feed outlive any redesign.
5. **Measure, then believe.** Carried from the computer-vision work into how AI
   claims are made here — describe what was evaluated, not what was demoed.
