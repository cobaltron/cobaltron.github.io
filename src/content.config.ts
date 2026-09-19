import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

/**
 * Curated links, with commentary on why each one matters.
 *
 * `note` is optional so bulk imports (e.g. X bookmarks) can land as drafts,
 * but the refine below makes it impossible to *publish* one without
 * commentary. A bare URL is worthless six months later, and the annotation is
 * the whole point — so the build enforces it rather than relying on discipline.
 */
const links = defineCollection({
  loader: glob({ base: './src/content/links', pattern: '**/*.json' }),
  schema: z
    .object({
      title: z.string(),
      url: z.string().url(),
      source: z.string().optional(),
      note: z.string().default(''),
      added: z.coerce.date(),
      draft: z.boolean().default(false),
    })
    .refine((data) => data.draft || data.note.trim().length > 0, {
      message:
        'A published link needs a note explaining why it matters. Add one, or set draft: true.',
      path: ['note'],
    }),
});

/** Standalone prose, edited as singletons. Only /photography uses one. */
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
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

export const collections = { projects, links, pages, photos };
