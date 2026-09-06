/**
 * Wiki-link support for the garden.
 *
 * Turns [[Note Title]] and [[Note Title|display text]] into real links.
 * A target that doesn't resolve to an existing entry still renders — as a
 * "seed": something referred to but not yet written. That's deliberate.
 * Gardens are supposed to show their unfinished edges.
 */
import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content');

/** Collections that wiki-links may point at, in resolution order. */
const LINKABLE = [
  { dir: 'notes', base: '/notes' },
  { dir: 'posts', base: '/posts' },
  { dir: 'projects', base: '/projects' },
];

export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Matches [[target]] or [[target|alias]] — but not ![[embed]]. */
export const WIKILINK_RE = /(?<!!)\[\[([^\][|]+?)(?:\|([^\][]+?))?\]\]/g;

/**
 * Every wiki-link target in a body of markdown, as slugs.
 * Shared with the backlink graph so both sides agree on resolution.
 */
export function extractWikiLinks(body) {
  const out = [];
  if (!body) return out;
  for (const match of body.matchAll(WIKILINK_RE)) {
    out.push(slugify(match[1]));
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Build-time index of what actually exists.
 * Read once per process; the dev server restarts on content changes.
 * ------------------------------------------------------------------ */

let index = null;

function readFrontmatterTitle(raw) {
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const title = fm[1].match(/^title:\s*(.+)$/m);
  if (!title) return null;
  return title[1].trim().replace(/^['"]|['"]$/g, '');
}

function buildIndex() {
  /** @type {Map<string, {url: string, title: string}>} */
  const map = new Map();

  for (const { dir, base } of LINKABLE) {
    const abs = path.join(CONTENT_ROOT, dir);
    let files = [];
    try {
      files = fs.readdirSync(abs);
    } catch {
      continue; // collection not created yet
    }

    for (const file of files) {
      if (!/\.mdx?$/.test(file)) continue;
      const slug = slugify(file.replace(/\.mdx?$/, ''));
      let raw = '';
      try {
        raw = fs.readFileSync(path.join(abs, file), 'utf8');
      } catch {
        /* unreadable — skip */
      }
      const title = readFrontmatterTitle(raw) || slug;
      const entry = { url: `${base}/${slug}`, title };

      // Addressable by filename slug and by title, so [[Retrieval Eval]]
      // and [[retrieval-eval]] both land in the same place.
      if (!map.has(slug)) map.set(slug, entry);
      const titleSlug = slugify(title);
      if (titleSlug && !map.has(titleSlug)) map.set(titleSlug, entry);
    }
  }

  return map;
}

export function resolveTarget(target) {
  if (!index) index = buildIndex();
  return index.get(slugify(target)) ?? null;
}

/** Dev-server helper: drop the cache so new files are picked up. */
export function invalidateIndex() {
  index = null;
}

/* ------------------------------------------------------------------ *
 * The remark plugin
 * ------------------------------------------------------------------ */

export function remarkWikiLinks() {
  return (tree) => {
    // Rebuild per file in dev so a newly created note resolves immediately.
    if (process.env.NODE_ENV !== 'production') index = null;

    visit(tree, 'text', (node, i, parent) => {
      if (!parent || typeof i !== 'number') return;
      if (!node.value.includes('[[')) return;

      const children = [];
      let cursor = 0;

      for (const match of node.value.matchAll(WIKILINK_RE)) {
        const [raw, target, alias] = match;
        const start = match.index ?? 0;

        if (start > cursor) {
          children.push({ type: 'text', value: node.value.slice(cursor, start) });
        }

        const label = (alias ?? target).trim();
        const found = resolveTarget(target);

        if (found) {
          children.push({
            type: 'link',
            url: found.url,
            title: found.title,
            data: { hProperties: { className: ['wikilink'] } },
            children: [{ type: 'text', value: label }],
          });
        } else {
          // Referred to but not yet written. Rendered, not linked.
          children.push({
            type: 'emphasis',
            data: {
              hName: 'span',
              hProperties: {
                className: ['wikilink', 'wikilink--seed'],
                title: 'A seed — referenced but not yet written',
              },
            },
            children: [{ type: 'text', value: label }],
          });
        }

        cursor = start + raw.length;
      }

      if (cursor === 0) return; // nothing matched after all
      if (cursor < node.value.length) {
        children.push({ type: 'text', value: node.value.slice(cursor) });
      }

      parent.children.splice(i, 1, ...children);
      return i + children.length;
    });
  };
}
