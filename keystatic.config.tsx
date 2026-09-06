import { config, collection, fields, singleton } from '@keystatic/core';

/**
 * Keystatic admin UI, served at /keystatic.
 *
 * Storage is local while developing (writes straight to disk). Flip `kind`
 * to 'github' once the repo is on GitHub and the env vars are set — see
 * README for the three secrets that need to exist in Vercel.
 *
 * Every field here mirrors the zod schema in src/content.config.ts. If you
 * change one, change the other, or the build will fail validation.
 */
const isProd = process.env.NODE_ENV === 'production';

const tags = fields.array(fields.text({ label: 'Tag' }), {
  label: 'Tags',
  itemLabel: (props) => props.value,
});

export default config({
  storage: isProd
    ? {
        kind: 'github',
        repo: { owner: 'cobaltron', name: 'cobaltron.github.io' },
      }
    : { kind: 'local' },

  ui: {
    brand: { name: 'cobaltron garden' },
    navigation: {
      Garden: ['notes'],
      Writing: ['posts'],
      Work: ['projects', 'roles'],
      Collected: ['links'],
      Archive: ['publications', 'achievements'],
      Pages: ['about', 'now'],
    },
  },

  collections: {
    notes: collection({
      label: 'Notes',
      slugField: 'title',
      path: 'src/content/notes/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'stage'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Also the wiki-link target — [[Title]] resolves here.',
          },
        }),
        summary: fields.text({
          label: 'Summary',
          description: 'One line, shown in listings.',
          multiline: true,
        }),
        stage: fields.select({
          label: 'Growth stage',
          options: [
            { label: 'Seedling — rough and early', value: 'seedling' },
            { label: 'Budding — taking shape', value: 'budding' },
            { label: 'Evergreen — tended and stable', value: 'evergreen' },
          ],
          defaultValue: 'seedling',
        }),
        tags,
        planted: fields.date({
          label: 'Planted',
          description: 'When this note first appeared.',
          validation: { isRequired: true },
        }),
        tended: fields.date({
          label: 'Last tended',
          description: 'Leave empty if it has not been revised.',
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Hidden from the published site.',
          defaultValue: false,
        }),
        content: fields.mdx({
          label: 'Content',
          description: 'Use [[Note Title]] to link to another note.',
          options: { image: { directory: 'public/img/content', publicPath: '/img/content/' } },
        }),
      },
    }),

    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'published'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          validation: { isRequired: true },
        }),
        published: fields.date({
          label: 'Published',
          validation: { isRequired: true },
        }),
        updated: fields.date({ label: 'Updated' }),
        tags,
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        content: fields.mdx({
          label: 'Content',
          options: { image: { directory: 'public/img/content', publicPath: '/img/content/' } },
        }),
      },
    }),

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
        featured: fields.checkbox({
          label: 'Featured',
          description: 'Surfaced on the home page.',
          defaultValue: false,
        }),
        order: fields.integer({
          label: 'Sort order',
          description: 'Lower sorts first.',
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
      columns: ['title', 'added'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        url: fields.url({ label: 'URL', validation: { isRequired: true } }),
        source: fields.text({
          label: 'Source',
          description: 'Who made it — author, publication, or site.',
        }),
        note: fields.text({
          label: 'Why it matters',
          description: 'Your commentary. This is the point of the section.',
          multiline: true,
          validation: { isRequired: true },
        }),
        tags,
        added: fields.date({ label: 'Added', validation: { isRequired: true } }),
      },
    }),

    publications: collection({
      label: 'Publications',
      slugField: 'title',
      path: 'src/content/publications/*',
      format: 'json',
      columns: ['title', 'year'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        venue: fields.text({ label: 'Venue', validation: { isRequired: true } }),
        isbn: fields.text({ label: 'ISBN' }),
        year: fields.integer({ label: 'Year' }),
        url: fields.url({ label: 'URL' }),
        order: fields.integer({ label: 'Sort order', defaultValue: 99 }),
      },
    }),

    roles: collection({
      label: 'Work experience',
      slugField: 'title',
      path: 'src/content/roles/*',
      format: 'json',
      columns: ['title', 'org'],
      schema: {
        title: fields.slug({ name: { label: 'Job title' } }),
        org: fields.text({ label: 'Organisation', validation: { isRequired: true } }),
        period: fields.text({
          label: 'Period',
          description: 'e.g. "2023 — present" or "Previous"',
          validation: { isRequired: true },
        }),
        current: fields.checkbox({ label: 'Current role', defaultValue: false }),
        detail: fields.text({
          label: 'What you did',
          multiline: true,
          validation: { isRequired: true },
        }),
        order: fields.integer({
          label: 'Sort order',
          description: 'Lower sorts first.',
          defaultValue: 99,
        }),
      },
    }),

    achievements: collection({
      label: 'Achievements',
      slugField: 'title',
      path: 'src/content/achievements/*',
      format: 'json',
      columns: ['title', 'year'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        detail: fields.text({ label: 'Detail', multiline: true }),
        image: fields.text({
          label: 'Image path',
          description: 'e.g. /img/ac1.jpg',
        }),
        year: fields.integer({ label: 'Year' }),
        order: fields.integer({ label: 'Sort order', defaultValue: 99 }),
      },
    }),
  },

  singletons: {
    about: singleton({
      label: 'About page',
      path: 'src/content/pages/about',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.text({ label: 'Title', defaultValue: 'About' }),
        updated: fields.date({ label: 'Last updated' }),
        content: fields.mdx({
          label: 'Body',
          options: { image: { directory: 'public/img/content', publicPath: '/img/content/' } },
        }),
      },
    }),

    now: singleton({
      label: 'Now page',
      path: 'src/content/pages/now',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.text({ label: 'Title', defaultValue: 'Now' }),
        updated: fields.date({
          label: 'Last updated',
          description: 'A /now page is only useful if this is honest.',
        }),
        content: fields.mdx({
          label: 'Body',
          options: { image: { directory: 'public/img/content', publicPath: '/img/content/' } },
        }),
      },
    }),
  },
});
