# cobaltron — a digital garden

Astro 7 + MDX, content managed through Keystatic, deployed on Vercel.

Two kinds of writing live here: **posts** (dated, finished) and **notes**
(evergreen, revised over time, carrying a growth stage). Notes link to each other
with `[[wiki-links]]`, and every entry shows what links *to* it.

## Running it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build
```

The admin UI is at **http://localhost:4321/keystatic**.

📝 **[WRITING.md](WRITING.md) — how to add notes, posts and links.**

## Content

| Collection | Path | Format |
|---|---|---|
| Notes | `src/content/notes/` | MDX |
| Posts | `src/content/posts/` | MDX |
| Projects | `src/content/projects/` | MDX |
| Links | `src/content/links/` | JSON, one file per link |
| Publications | `src/content/publications/` | JSON |
| Achievements | `src/content/achievements/` | JSON |
| Work experience | `src/content/roles/` | JSON |
| About / Now | `src/content/pages/` | MDX singletons |

Schemas are defined twice and **must be kept in sync**:

- `src/content.config.ts` — zod schemas, validated at build time.
- `keystatic.config.tsx` — the editing UI.

Change a field in one, change it in the other, or the build fails validation.

### Growth stages

`seedling` → `budding` → `evergreen`. The stage is a claim about how much to
trust a note, which is more useful than a date. Rendered as a three-dot density
meter next to each note.

### Wiki-links

Write `[[Note Title]]` or `[[Note Title|display text]]` in any note, post, or
project. Targets resolve by title *or* by filename slug.

A link whose target doesn't exist still renders — greyed out with a `◌` marker.
That's deliberate: it marks an idea you've referenced but not written yet.

Two build-time pieces make this work:

- `src/lib/wikilinks.mjs` — a remark plugin that resolves `[[targets]]` against
  the entries that actually exist.
- `src/lib/graph.ts` — walks every entry's raw body and inverts the link map to
  produce backlinks.

Because both run at build time over files in the repo, backlinks can never drift
out of sync with the content.

> **Note on the markdown processor.** Astro 7 defaults to `satteri`, whose
> `mdastPlugins` take a visitor object rather than a unified transformer — a
> remark plugin passed there is *silently ignored*. `astro.config.mjs` therefore
> uses `unified()` from `@astrojs/markdown-remark`, with `gfm` and `smartypants`
> set explicitly to match satteri's defaults. Don't switch it back without
> rewriting the plugin.

## Deploying to Vercel (free tier)

1. Push this repo to GitHub (`origin` is already
   `github.com/cobaltron/cobaltron.github.io`).
2. In Vercel, **New Project** → import the repo. Framework preset: **Astro**.
   Build command and output directory are detected via `@astrojs/vercel` —
   leave the defaults.
3. Deploy. You'll get `https://<project-name>.vercel.app`.

The site is static except `/keystatic` and `/api/keystatic`, which the adapter
deploys as serverless functions. Comfortably inside the Hobby plan's limits.

### You don't need to set the domain anywhere

`site` in `astro.config.mjs` is resolved at build time:

```js
process.env.SITE_URL ?? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
```

Vercel injects `VERCEL_PROJECT_PRODUCTION_URL`, so canonical URLs, OG tags and
the RSS feed all point at your real `.vercel.app` address with no configuration.
Locally it falls back to `http://localhost:4321`.

**When you buy a domain later**, add it to the Vercel project as the production
domain and that variable starts returning it automatically — no code change, no
redeploy trigger beyond the usual. Set `SITE_URL` in Vercel's environment
variables only if you want to force a specific origin.

### ⚠️ GitHub Pages will 404 after you push

This repo is named `cobaltron.github.io`, which GitHub Pages publishes
automatically. The rebuild removed the root `index.html`, so once you push,
`cobaltron.github.io` will start returning 404 while Vercel serves the real site.

Either disable it (repo **Settings → Pages → Source: None**) or leave it broken
deliberately. Nothing in this project depends on it.

### Making the CMS work in production

Locally, Keystatic writes straight to disk — no setup. In production it commits
through the GitHub API, which needs a GitHub App.

**The App must be created by running locally in github mode.** Keystatic's setup
wizard only runs when the API route sees `NODE_ENV === 'development'`; in
production a missing secret throws instead. So:

```bash
PUBLIC_KEYSTATIC_STORAGE=github npm run dev
```

1. Open <http://localhost:4321/keystatic>. You'll get **Keystatic Setup**.
2. Put your Vercel URL (`https://rlahiri.vercel.app`) in **Deployed App URL**.
   Leave the organisation field blank for a personal account.
3. **Create GitHub App** → approve on GitHub → you're redirected back and the
   secrets are written to `.env` (already gitignored — never commit it).
4. Copy all four into Vercel → Settings → Environment Variables:

   ```
   KEYSTATIC_GITHUB_CLIENT_ID
   KEYSTATIC_GITHUB_CLIENT_SECRET
   KEYSTATIC_SECRET
   PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
   ```

5. Redeploy.

Afterwards, plain `npm run dev` goes back to local mode (writes to disk, no
auth). Saving from the deployed admin UI commits to the repo and triggers a
rebuild.

`keystatic.config.tsx` already points at `cobaltron/cobaltron.github.io` — update
it if you ever rename the repo.

### Troubleshooting: a downloaded `login.txt`

Keystatic's API returns errors as bare strings with no `content-type`, so a
mobile browser saves them as a file instead of displaying them. Open it — it's
the error text, not something you need.

A `login.txt` from `/api/keystatic/github/login` means the three secrets above
aren't set in the deployed environment. Follow the steps above.

## Placeholder content to replace

These were written as scaffolding to demonstrate the mechanics. Rewrite or delete:

- `src/content/notes/retrieval-evaluation-is-the-hard-part.mdx`
- `src/content/notes/agentforce-and-the-platform-ai-gap.mdx`
- `src/content/posts/rebuilding-this-site-as-a-digital-garden.mdx`
- `src/content/pages/now.mdx`
- the three files in `src/content/links/`

`src/content/notes/how-this-garden-works.mdx` documents the site's own
conventions, so it's worth keeping and editing rather than deleting.

Everything in `projects/`, `publications/`, `achievements/`, `roles/`, and
`pages/about.mdx` was migrated from the previous site and is factual.
