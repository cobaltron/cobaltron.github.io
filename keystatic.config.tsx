import { config, collection, fields, singleton } from '@keystatic/core';

/**
 * Keystatic admin UI, served at /keystatic.
 *
 * STORAGE MODE
 *
 * Local by default while developing (writes straight to disk, no auth).
 * GitHub in production (commits via the GitHub API, so you can edit from
 * any device, including a phone).
 *
 * To create the GitHub App you must run in github mode LOCALLY, once:
 *
 *     PUBLIC_KEYSTATIC_STORAGE=github npm run dev          # bash / Git Bash
 *     $env:PUBLIC_KEYSTATIC_STORAGE = "github"; npm run dev  # PowerShell
 *
 * then open http://localhost:4321/keystatic and follow the setup prompts.
 * Keystatic writes the three secrets to a .env file — copy them into Vercel.
 *
 * This detour is necessary because Keystatic's setup wizard only runs when
 * the API route sees NODE_ENV === 'development'. In production a missing
 * secret throws instead, which surfaces as a plain-text error the browser
 * may download rather than display.
 *
 * The PUBLIC_ prefix matters: this file is bundled for both the server API
 * route and the browser UI, and the two must agree on the storage kind.
 *
 * Every field below mirrors the zod schema in src/content.config.ts. If you
 * change one, change the other, or the build will fail validation.
 */
const storageKind =
  import.meta.env.PUBLIC_KEYSTATIC_STORAGE ??
  (import.meta.env.PROD ? 'github' : 'local');

export default config({
  storage:
    storageKind === 'github'
      ? {
          kind: 'github',
          repo: { owner: 'cobaltron', name: 'cobaltron.github.io' },
        }
      : { kind: 'local' },

  ui: {
    brand: { name: 'cobaltron' },
    navigation: {
      Content: ['projects', 'links', 'photos'],
      Pages: ['photography'],
    },
  },

  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'year'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          validation: { isRequired: true },
        }),
        year: fields.integer({ label: 'Year' }),
        role: fields.text({ label: 'Role' }),
        stack: fields.array(fields.text({ label: 'Technology' }), {
          label: 'Stack',
          itemLabel: (props) => props.value,
        }),
        repo: fields.url({ label: 'Repository URL' }),
        demo: fields.url({ label: 'Live demo URL' }),
        order: fields.integer({
          label: 'Sort order',
          description: 'Lower sorts first. The first four appear on the home page.',
          defaultValue: 99,
        }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        content: fields.mdx({
          label: 'Write-up',
          options: { image: { directory: 'public/img/content', publicPath: '/img/content/' } },
        }),
      },
    }),

    links: collection({
      label: 'Links',
      slugField: 'title',
      path: 'src/content/links/*',
      format: 'json',
      columns: ['title', 'draft'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        url: fields.url({ label: 'URL', validation: { isRequired: true } }),
        source: fields.text({
          label: 'Source',
          description: 'Who made it — author, publication, or site.',
        }),
        note: fields.text({
          label: 'Why it matters',
          description:
            'Your commentary. This is the point of the section — a link cannot be published without it.',
          multiline: true,
        }),
        added: fields.date({ label: 'Added', validation: { isRequired: true } }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Hidden from the site. Imported bookmarks start here.',
          defaultValue: false,
        }),
      },
    }),

    photos: collection({
      label: 'Instagram posts',
      slugField: 'url',
      path: 'src/content/photos/*',
      format: 'json',
      columns: ['url'],
      schema: {
        url: fields.slug({
          name: {
            label: 'Instagram post URL',
            description:
              'Paste the post link, e.g. https://www.instagram.com/p/ABC123/ — must be public.',
          },
        }),
        caption: fields.text({
          label: 'Caption',
          description: 'Optional. Shown beneath the embed in your own words.',
          multiline: true,
        }),
        order: fields.integer({ label: 'Sort order', defaultValue: 99 }),
      },
    }),
  },

  singletons: {
    photography: singleton({
      label: 'Photography page',
      path: 'src/content/pages/photography',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.text({ label: 'Title', defaultValue: 'Photography' }),
        handle: fields.text({
          label: 'Instagram handle',
          description: 'Without the @, e.g. rajarshi.shoots',
        }),
        content: fields.mdx({
          label: 'Intro',
          options: { image: { directory: 'public/img/content', publicPath: '/img/content/' } },
        }),
      },
    }),
  },
});
