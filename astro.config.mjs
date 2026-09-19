import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

/*
 * The canonical origin, used for canonical <link>s and OG tags.
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

  /*
   * The garden's routes are gone, but the links people already made to them
   * are not. PRODUCT.md treats inbound URLs as a commitment, so every removed
   * route lands somewhere deliberate instead of on the 404 page.
   *
   * /about is the interesting one: that page's content now lives as a section
   * on the home page, so the anchor takes people to the same words.
   *
   * /rss.xml is deliberately absent. A feed reader following a redirect would
   * be handed HTML and would keep polling it; a 404 tells it to stop.
   */
  redirects: {
    '/about': '/#about',
    '/now': '/#about',
    '/notes': '/',
    '/posts': '/',
    // Enumerated rather than wildcarded: Astro will not collapse a dynamic
    // source onto a static destination, and these four are the only note and
    // post URLs that were ever published, so a catch-all would buy nothing.
    '/notes/agentforce-and-the-platform-ai-gap': '/',
    '/notes/how-this-garden-works': '/',
    '/notes/retrieval-evaluation-is-the-hard-part': '/',
    '/posts/rebuilding-this-site-as-a-digital-garden': '/',
  },

  // Pages are static by default. Keystatic injects /keystatic and
  // /api/keystatic as on-demand routes; nothing else needs a server.
  integrations: [mdx(), react(), keystatic()],

  markdown: {
    shikiConfig: {
      theme: 'github-light-default',
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
