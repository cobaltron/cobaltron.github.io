import { getCollection, type CollectionEntry } from 'astro:content';
import { extractWikiLinks, slugify } from './wikilinks.mjs';

export type LinkableCollection = 'notes' | 'posts' | 'projects';

export interface Ref {
  collection: LinkableCollection;
  id: string;
  title: string;
  url: string;
  summary?: string;
}

const BASE: Record<LinkableCollection, string> = {
  notes: '/notes',
  posts: '/posts',
  projects: '/projects',
};

export interface Graph {
  /** slug of the target -> everything that points at it */
  backlinks: Map<string, Ref[]>;
  /** "<collection>:<id>" -> resolved things it points at */
  outgoing: Map<string, Ref[]>;
  /** Targets referenced by something but never written. */
  seeds: Map<string, Ref[]>;
  refs: Map<string, Ref>;
}

let cached: Graph | null = null;

function isPublished(entry: { data: { draft?: boolean } }) {
  return import.meta.env.DEV || !entry.data.draft;
}

function keyOf(collection: string, id: string) {
  return `${collection}:${id}`;
}

/**
 * Walks every linkable entry, resolves its [[wiki-links]], and inverts the
 * result into a backlink map. Runs once per build and is cached — every page
 * that renders backlinks shares this single pass.
 */
export async function buildGraph(): Promise<Graph> {
  if (cached) return cached;

  const collections: LinkableCollection[] = ['notes', 'posts', 'projects'];
  const entries: {
    collection: LinkableCollection;
    entry: CollectionEntry<LinkableCollection>;
  }[] = [];

  for (const collection of collections) {
    const found = await getCollection(collection as 'notes');
    for (const entry of found) {
      if (!isPublished(entry)) continue;
      entries.push({ collection, entry: entry as CollectionEntry<LinkableCollection> });
    }
  }

  // Addressable by id-slug and by title-slug, matching the remark plugin.
  const refs = new Map<string, Ref>();
  for (const { collection, entry } of entries) {
    const ref: Ref = {
      collection,
      id: entry.id,
      title: entry.data.title,
      url: `${BASE[collection]}/${entry.id}`,
      summary: (entry.data as { summary?: string }).summary,
    };
    const idSlug = slugify(entry.id);
    const titleSlug = slugify(entry.data.title);
    if (!refs.has(idSlug)) refs.set(idSlug, ref);
    if (titleSlug && !refs.has(titleSlug)) refs.set(titleSlug, ref);
  }

  const backlinks = new Map<string, Ref[]>();
  const outgoing = new Map<string, Ref[]>();
  const seeds = new Map<string, Ref[]>();

  for (const { collection, entry } of entries) {
    const source: Ref = {
      collection,
      id: entry.id,
      title: entry.data.title,
      url: `${BASE[collection]}/${entry.id}`,
      summary: (entry.data as { summary?: string }).summary,
    };

    const targets = new Set(extractWikiLinks(entry.body ?? ''));
    const resolved: Ref[] = [];

    for (const target of targets) {
      const hit = refs.get(target);

      if (!hit) {
        // Referenced but not written — a seed.
        const list = seeds.get(target) ?? [];
        if (!list.some((r) => r.url === source.url)) list.push(source);
        seeds.set(target, list);
        continue;
      }

      if (hit.url === source.url) continue; // don't count self-references

      resolved.push(hit);

      const incoming = backlinks.get(hit.url) ?? [];
      if (!incoming.some((r) => r.url === source.url)) incoming.push(source);
      backlinks.set(hit.url, incoming);
    }

    outgoing.set(keyOf(collection, entry.id), resolved);
  }

  cached = { backlinks, outgoing, seeds, refs };
  return cached;
}

export async function getBacklinks(collection: LinkableCollection, id: string) {
  const graph = await buildGraph();
  return graph.backlinks.get(`${BASE[collection]}/${id}`) ?? [];
}

export async function getOutgoing(collection: LinkableCollection, id: string) {
  const graph = await buildGraph();
  return graph.outgoing.get(keyOf(collection, id)) ?? [];
}

/** Unwritten targets, most-referenced first — the garden's to-do list. */
export async function getSeeds() {
  const graph = await buildGraph();
  return [...graph.seeds.entries()]
    .map(([slug, sources]) => ({ slug, sources }))
    .sort((a, b) => b.sources.length - a.sources.length);
}
