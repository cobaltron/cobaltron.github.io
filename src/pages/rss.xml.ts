import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.published.getTime() - a.data.published.getTime());

  // Evergreen notes go in the feed too, dated by when they were last tended —
  // a garden's updates are as much revision as publication.
  const notes = (await getCollection('notes'))
    .filter((note) => !note.data.draft)
    .map((note) => ({
      title: `${note.data.title} (note)`,
      description: note.data.summary ?? '',
      pubDate: note.data.tended ?? note.data.planted,
      link: `/notes/${note.id}`,
    }));

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.published,
      link: `/posts/${post.id}`,
    })),
    ...notes,
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'Rajarshi Lahiri',
    description:
      'A digital garden on Salesforce engineering, applied AI, and things I am still working out.',
    site: context.site!,
    items,
    customData: '<language>en-gb</language>',
  });
}
