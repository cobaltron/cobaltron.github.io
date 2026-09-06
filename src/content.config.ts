import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Growth stages — the core garden convention.
 * A note is never "done"; it's at some stage of tending.
 */
export const STAGES = ['seedling', 'budding', 'evergreen'] as const;

export const STAGE_META: Record<
  (typeof STAGES)[number],
  { label: string; blurb: string; density: number }
> = {
  seedling: {
    label: 'Seedling',
    blurb: 'Rough and early. Half-formed, possibly wrong.',
    density: 1,
  },
  budding: {
    label: 'Budding',
    blurb: 'Taking shape. The argument holds, the edges do not.',
    density: 2,
  },
  evergreen: {
    label: 'Evergreen',
    blurb: 'Tended and stable. Still revised when I learn better.',
    density: 3,
  },
};

/** Evergreen notes — the garden proper. Non-chronological. */
const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    stage: z.enum(STAGES).default('seedling'),
    tags: z.array(z.string()).default([]),
    planted: z.coerce.date(),
    tended: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

/** The stream — dated essays, newest first. */
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/** Things I've built. */
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number().optional(),
    role: z.string().optional(),
    stack: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

/**
 * Data collections below are one JSON file per entry — `.json` is the only
 * data format Astro's glob loader registers, and one-file-per-entry is what
 * Keystatic's collection UI writes. The entry `id` comes from the filename.
 */

/**
 * Curated links, with commentary on why each one matters.
 *
 * `note` is optional so bulk imports (e.g. X bookmarks) can land as drafts,
 * but the refine below makes it impossible to *publish* one without
 * commentary. A bare URL is worthless six months later, and the whole point
 * of this section is the annotation — so the build enforces it rather than
 * relying on discipline.
 */
const links = defineCollection({
  loader: glob({ base: './src/content/links', pattern: '**/*.json' }),
  schema: z
    .object({
      title: z.string(),
      url: z.string().url(),
      source: z.string().optional(),
      note: z.string().default(''),
      tags: z.array(z.string()).default([]),
      added: z.coerce.date(),
      draft: z.boolean().default(false),
    })
    .refine((data) => data.draft || data.note.trim().length > 0, {
      message:
        'A published link needs a note explaining why it matters. Add one, or set draft: true.',
      path: ['note'],
    }),
});

/** Publications — carried over from the old portfolio. */
const publications = defineCollection({
  loader: glob({ base: './src/content/publications', pattern: '**/*.json' }),
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    isbn: z.string().optional(),
    year: z.number().optional(),
    url: z.string().url().optional(),
    order: z.number().default(99),
  }),
});

/** Awards and recognition — also carried over. */
const achievements = defineCollection({
  loader: glob({ base: './src/content/achievements', pattern: '**/*.json' }),
  schema: z.object({
    title: z.string(),
    detail: z.string().optional(),
    image: z.string().optional(),
    year: z.number().optional(),
    order: z.number().default(99),
  }),
});

/** Work experience — shown on /about. */
const roles = defineCollection({
  loader: glob({ base: './src/content/roles', pattern: '**/*.json' }),
  schema: z.object({
    title: z.string(),
    org: z.string(),
    period: z.string(),
    current: z.boolean().default(false),
    detail: z.string(),
    order: z.number().default(99),
  }),
});

/** Standalone prose pages (/about, /now), edited as singletons. */
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    updated: z.coerce.date().optional(),
    handle: z.string().optional(),
  }),
});

/** Instagram posts embedded on /photography. */
const photos = defineCollection({
  loader: glob({ base: './src/content/photos', pattern: '**/*.json' }),
  schema: z.object({
    url: z
      .string()
      .url()
      .refine((u) => /instagram\.com\/(p|reel|tv)\//.test(u), {
        message:
          'Must be a public Instagram post/reel URL, e.g. https://www.instagram.com/p/ABC123/',
      }),
    caption: z.string().optional(),
    order: z.number().default(99),
  }),
});

export const collections = {
  notes,
  posts,
  projects,
  links,
  publications,
  achievements,
  roles,
  pages,
  photos,
};


