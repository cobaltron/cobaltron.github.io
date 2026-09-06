# Writing guide

How to add notes, posts and links. Two ways to do everything: the **Keystatic
admin UI**, or **files in the repo** — they read and write the same files, so
mix them freely.

```bash
npm run dev     # http://localhost:4321
```

Admin UI: **http://localhost:4321/keystatic**

---

## Which thing am I writing?

| | Use a **note** | Use a **post** |
|---|---|---|
| Shape | An idea, revised over time | A finished piece, dated |
| Ordering | Non-chronological | Newest first |
| Signals quality via | Growth stage | Publish date |
| Lives at | `/notes/<slug>` | `/posts/<slug>` |
| Good for | "What I currently think about X" | "Here's a thing I worked out" |

When unsure, write a note. A seedling note costs nothing and can grow into a post
later. Posts imply you're finished.

---

## Adding a note

**Via the UI:** `/keystatic` → Notes → *New note*.

**Via a file:** create `src/content/notes/my-note-title.mdx`.

```mdx
---
title: Retrieval evaluation is the hard part
summary: One line, shown in listings and search results.
stage: budding
tags:
  - rag
  - evaluation
planted: 2026-09-06
tended: 2026-09-14
draft: false
---

Body goes here. Standard Markdown, plus [[wiki-links]].
```

| Field | Required | Notes |
|---|---|---|
| `title` | **yes** | Also the wiki-link target |
| `planted` | **yes** | `YYYY-MM-DD` |
| `summary` | no | Strongly recommended — it's the listing text |
| `stage` | no | Defaults to `seedling` |
| `tags` | no | Defaults to `[]` |
| `tended` | no | Set when you revise; listings sort by it |
| `draft` | no | `true` hides it in production |

### Growth stages

| Stage | Means | Meter |
|---|---|---|
| `seedling` | Rough and early. Possibly wrong. | ◐○○ |
| `budding` | Taking shape. Argument holds, edges don't. | ◐◐○ |
| `evergreen` | Tended and stable. Still revised. | ◐◐◐ |

The stage is a claim about **how much to trust the note**. Move it up as the
thinking settles. Nothing enforces this but you.

---

## Adding a post

**Via the UI:** `/keystatic` → Posts → *New post*.

**Via a file:** create `src/content/posts/my-post-title.mdx`.

```mdx
---
title: Rebuilding this site as a digital garden
summary: Required. Used in listings, the RSS feed, and social cards.
published: 2026-09-06
updated: 2026-09-20
tags:
  - meta
draft: false
---

Body.
```

`title`, `summary` and `published` are all **required** — the build fails without
them. `updated` and `tags` are optional.

---

## Adding a link

One JSON file per link in `src/content/links/`. **Via the UI:** `/keystatic` →
Links → *New link*.

```json
{
  "title": "A Brief History & Ethos of the Digital Garden",
  "url": "https://maggieappleton.com/garden-history",
  "source": "Maggie Appleton",
  "note": "Why it matters, in your own words. This is the point of the section.",
  "tags": ["gardens", "writing"],
  "added": "2026-09-06"
}
```

| Field | Required |
|---|---|
| `title`, `url`, `note`, `added` | **yes** |
| `source`, `tags` | no |

Two things to know:

- **`note` is the whole value of the section.** A bare URL is worthless in six
  months. Write why it changed your mind, not what it's about.
- **Links have no `draft` field.** Adding one publishes it. Keep it in a scratch
  file until you're ready.

`tags` become the filter buttons on `/links` automatically.

---

## Wiki-links

Anywhere in a note, post or project:

```md
[[Retrieval evaluation is the hard part]]
[[Retrieval evaluation is the hard part|the retrieval problem]]
```

Targets resolve by **title** or by **filename slug**, so both of these work:

```md
[[Retrieval evaluation is the hard part]]
[[retrieval-evaluation-is-the-hard-part]]
```

### Linking to something you haven't written

That's supported and encouraged. An unresolved target renders greyed out with a
`◌` marker — a visible seed, and a to-do list you can't hide from. Write the
note later and every reference to it becomes a real link.

### Backlinks are automatic

Every note shows what links **to** it, computed at build time. You never maintain
these by hand. They work across collections — a project can link to a note and
show up in that note's backlinks.

### Writing about the syntax

Wrap it in backticks. Code spans are skipped, so `` `[[like this]]` `` renders
literally.

### ⚠️ Seed links don't refresh live in dev

**Creating a new note does not retroactively convert existing seed links** while
the dev server is running. Astro caches the compiled output of files that haven't
changed, so the plugin never re-runs on the note doing the linking.

To see it resolve, do one of:

- save (or `touch`) the file **containing** the link, or
- restart the dev server.

**Production builds are always correct** — every file is processed fresh, so
seeds resolve properly regardless. This is a dev-server-only wrinkle.

---

## Writing from your phone

The admin UI is fully responsive — I checked the dashboard and the editor at a
390px viewport. Fields stack into one column, dates use your phone's native
picker, and Save stays pinned to the top bar.

### One-time setup

Phone editing needs the **deployed** site, not localhost. Local mode writes to
disk on the machine running the dev server; only GitHub mode can commit from a
browser anywhere.

The GitHub App has to be created from your machine — Keystatic's setup wizard
only runs in development. Once:

```bash
PUBLIC_KEYSTATIC_STORAGE=github npm run dev
```

Open <http://localhost:4321/keystatic>, enter your Vercel URL as the **Deployed
App URL**, click **Create GitHub App**, and copy the four values it writes to
`.env` into Vercel's environment variables. Redeploy. Full steps in the README.

After that, `https://rlahiri.vercel.app/keystatic` signs you in with GitHub on
any device.

### Make it feel like an app

Add it to your home screen so it opens without browser chrome:

- **iOS Safari** — Share → *Add to Home Screen*
- **Android Chrome** — ⋮ → *Add to Home screen*

Point it at `/keystatic` directly, not the site root.

### The loop

Edit → **Save** → Keystatic commits to GitHub → Vercel rebuilds → live in about
a minute. Nothing to install and no terminal.

### What phones are genuinely good for

- **Adding links.** Four short fields. This is the single best mobile task —
  paste a URL, write why it matters, done.
- **Updating `/now`.** Short, and it's the page most likely to go stale.
- **Bumping a growth stage** from seedling to budding after rereading something.
- **Capturing a seedling** before you forget the thought.
- **Typo fixes.**

### What's awkward

- **Wiki-links have no autocomplete.** Type `[[Exact Note Title]]` from memory.
  Get it wrong and it silently renders as a seed rather than erroring — worth
  checking the page afterwards.
- **Long-form drafting.** The editor is fine; phone keyboards are not.
- **Reordering tags** uses small drag handles. Fiddly.
- **Links publish immediately** — there's no `draft` field on links, so anything
  you save from your phone is live at the next rebuild.
- **Every save triggers a rebuild.** Batch your edits rather than saving after
  each sentence.

If you'd rather review before publishing, Keystatic's GitHub mode has a branch
picker in its top bar — check whether committing to a branch and opening a PR
suits you better than committing straight to `master`.

### If a page downloads as a .txt file

Keystatic returns API errors as bare strings with no `content-type`, so phones
save them rather than showing them. Open the file — it's the error message. A
`login.txt` means the secrets aren't set in Vercel; see the setup steps above.

### No-setup fallback

Before the GitHub App is configured — or if Keystatic is ever down — you can
edit any file straight from **github.com in a mobile browser**: navigate to the
file, tap the pencil, commit. You're editing raw MDX with no validation, so keep
the frontmatter rules above handy. Vercel rebuilds identically.

---

## Filenames, slugs and URLs

The filename becomes the URL:

```
src/content/notes/retrieval-evaluation.mdx  ->  /notes/retrieval-evaluation
```

Use lowercase words separated by hyphens. Keystatic does this for you from the
title.

**Renaming a file changes its URL and breaks inbound links.** Wiki-links that
resolve by title will survive; anything pointing at the old path won't.

---

## Drafts

Set `draft: true` on a note, post or project.

- **Dev** — visible, so you can preview.
- **Production** — hidden from listings, no page built, absent from RSS.

Links have no draft field.

---

## Publishing

**From the UI (once deployed):** Save in Keystatic → it commits to GitHub →
Vercel rebuilds. That's the whole loop.

**From your machine:**

```bash
npm run build            # catch schema errors before pushing
git add -A
git commit -m "Add note on retrieval evaluation"
git push
```

Vercel rebuilds on push to `master`.

### When the build fails

Almost always a schema violation — a missing `planted`, a missing `summary` on a
post, or a malformed date. The error names the file and the field. `npm run build`
locally reproduces it every time.

If you add or rename a field, change it in **both** places or the build breaks:

- `src/content.config.ts` — validation
- `keystatic.config.tsx` — the editing UI

---

## Cheat sheet

```bash
npm run dev                     # write at /keystatic
npm run build                   # verify before pushing
git add -A && git commit -m "…" && git push
```

```
src/content/notes/*.mdx         title + planted required
src/content/posts/*.mdx         title + summary + published required
src/content/links/*.json        title + url + note + added required
src/content/projects/*.mdx      title + summary required
src/content/pages/{about,now}   edited as singletons in Keystatic
```
