import { defineConfig, envField } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import { remarkWikiLinks } from './src/lib/wikilinks.mjs';

/*
 * The canonical origin, used for canonical <link>s, OG tags and the RSS feed.
 *
 * Vercel injects VERCEL_PROJECT_PRODUCTION_URL at build time — on the free tier
 * that's <project>.vercel.app, and it switches to your custom domain by itself
 * once you add one, so there's nothing to change later.
 *
 * SITE_URL overrides it if you'd rather set the origin explicitly (or if the
 * project has system environment variables turned off).
 */
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

// https://astro.build/config
export default defineConfig({
  site,
  adapter: vercel(),

  // Pages are static by default. Keystatic injects /keystatic and
  // /api/keystatic as on-demand routes; nothing else needs a server.
  integrations: [mdx(), react(), keystatic()],

  markdown: {
    /*
     * Astro 7 defaults to the `satteri` processor, whose `mdastPlugins` take a
     * visitor object ({ name, image(node, ctx) }) rather than a unified
     * transformer — a remark plugin passed there is silently ignored.
     * `unified()` is the classic remark/rehype pipeline, where the wiki-link
     * plugin's mdast output and its hName/hProperties are honoured.
     * gfm and smart punctuation are opt-in here, so they're set explicitly to
     * match satteri's defaults.
     */
    processor: unified({
      remarkPlugins: [remarkWikiLinks],
      gfm: true,
      smartypants: true,
    }),
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: false,
    },
  },

  // Only needed once you switch Keystatic to GitHub storage. Local mode
  // ignores these, but the API handler reads them, so they're declared
  // optional to keep it from throwing.
  env: {
    schema: {
      KEYSTATIC_GITHUB_CLIENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      KEYSTATIC_GITHUB_CLIENT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      KEYSTATIC_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },
});
