#!/usr/bin/env node
/**
 * Import X/Twitter bookmarks into src/content/links/ as drafts.
 *
 *   node scripts/import-bookmarks.mjs <export-file> [--limit N] [--dry-run]
 *
 * Accepts JSON or CSV, since every bookmark exporter emits a different shape.
 * Field names are sniffed from a list of common aliases rather than assumed.
 *
 * Everything lands with draft: true and an empty note. Nothing appears on the
 * site until you write commentary and untick Draft — the content schema
 * enforces that, so an un-annotated import cannot leak onto the page.
 *
 * Re-running is safe: entries are keyed by tweet id (falling back to URL), and
 * anything already present is skipped rather than duplicated or overwritten.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const OUT_DIR = path.join(process.cwd(), 'src', 'content', 'links');

/* ---------- argument parsing ---------- */

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const overwrite = args.includes('--overwrite');
const limitArg = args.indexOf('--limit');
const limit = limitArg !== -1 ? Number(args[limitArg + 1]) : Infinity;

if (!file) {
  console.error(`
Usage: node scripts/import-bookmarks.mjs <export-file> [--limit N] [--dry-run]

  <export-file>  JSON or CSV from any X bookmarks exporter
  --limit N      only import the first N (try --limit 5 --dry-run first)
  --dry-run      show what would be written, write nothing
  --overwrite    refresh existing entries' title/url/source, keeping your
                 note, tags and draft status. Use after re-exporting.
`);
  process.exit(1);
}

if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

/* ---------- parsing ---------- */

/** Minimal CSV reader: quoted fields, escaped quotes, embedded newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v !== '')) rows.push(row);

  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const raw = fs.readFileSync(file, 'utf8');
let records;

if (file.toLowerCase().endsWith('.csv')) {
  records = parseCsv(raw);
} else {
  const parsed = JSON.parse(raw);
  // Exporters variously emit an array, or wrap it in a key.
  records = Array.isArray(parsed)
    ? parsed
    : (parsed.bookmarks ?? parsed.tweets ?? parsed.data ?? parsed.items ?? []);
  if (!Array.isArray(records)) {
    console.error('Could not find an array of bookmarks in that JSON.');
    console.error('Top-level keys:', Object.keys(parsed).join(', '));
    process.exit(1);
  }
}

console.log(`Read ${records.length} record(s) from ${path.basename(file)}\n`);

/* ---------- field sniffing ---------- */

/**
 * Repair UTF-8 that was written out as Latin-1 ("dÃ¼n" -> "dün").
 * Common in bookmark exporters. Only attempted when every code point is in
 * the Latin-1 range and the reinterpreted bytes are valid UTF-8 — otherwise
 * the text is left exactly as-is rather than risking corruption.
 */
function repairMojibake(value) {
  if (!value) return value;
  if (!/[À-ÿ]/.test(value)) return value;
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) > 255) return value;
  }
  const bytes = Uint8Array.from(value, (c) => c.charCodeAt(0));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    // Not cleanly decodable as a whole -- usually a truncated or mangled
    // sequence somewhere. Accept a lenient decode only if it loses nothing,
    // otherwise leave the original untouched.
    const lenient = new TextDecoder('utf-8').decode(bytes);
    return lenient.includes('�') ? value : lenient;
  }
}

const pick = (obj, names) => {
  for (const n of names) {
    for (const key of Object.keys(obj)) {
      if (key.toLowerCase().replace(/[\s_-]/g, '') === n) {
        const v = obj[key];
        if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
      }
    }
  }
  return undefined;
};

const F = {
  url: ['url', 'tweeturl', 'link', 'permalink', 'tweetlink', 'href', 'statusurl'],
  text: ['text', 'fulltext', 'tweettext', 'content', 'body', 'tweet'],
  // 'userscreenname' first: exports often carry both a handle and a display
  // name, and the handle is what matches the tweet URL.
  author: [
    'userscreenname', 'screenname', 'authorhandle', 'handle',
    'author', 'username', 'user', 'name',
  ],
  date: ['bookmarkedat', 'createdat', 'date', 'time', 'timestamp', 'tweetdate', 'added'],
  id: ['tweetid', 'id', 'idstr', 'statusid', 'restid'],
  expanded: ['expandedurls', 'expandedurl', 'outboundurls', 'urls'],
  hashtags: ['hashtags'],
};

function authorHandle(rec) {
  const raw = pick(rec, F.author);
  if (!raw) return undefined;
  return raw.startsWith('@') ? raw : `@${raw}`;
}

function tweetUrl(rec) {
  const url = pick(rec, F.url);
  if (url && /^https?:\/\//i.test(url)) return url;
  const id = pick(rec, F.id);
  const author = (pick(rec, F.author) ?? 'i').replace(/^@/, '');
  if (id) return `https://x.com/${author}/status/${id}`;
  return undefined;
}

function tweetId(rec) {
  const explicit = pick(rec, F.id);
  if (explicit && /^\d+$/.test(explicit)) return explicit;
  const url = tweetUrl(rec) ?? '';
  return url.match(/status\/(\d+)/)?.[1];
}

function makeTitle(rec) {
  let text = repairMojibake(pick(rec, F.text) ?? '')
    .replace(/https?:\/\/\S+/g, '')       // strip URLs, incl. t.co
    .replace(/^(?:@\w+[\s,]*)+/, '')       // leading @mentions on replies
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    // A bare-link tweet. Name it after where it points.
    const expanded = (pick(rec, F.expanded) ?? '').split(/\s+/).filter(Boolean);
    const author = authorHandle(rec);
    if (expanded.length > 0) {
      try {
        const host = new URL(expanded[0]).hostname.replace(/^www\./, '');
        return author ? `${host} — shared by ${author}` : host;
      } catch {
        /* unparseable URL; fall through */
      }
    }
    return author ? `Bookmark from ${author}` : 'Bookmark';
  }
  if (text.length > 90) {
    // cut on a word boundary
    text = text.slice(0, 90).replace(/\s+\S*$/, '') + '…';
  }
  return text;
}

function parseDate(rec) {
  const value = pick(rec, F.date);
  if (value) {
    const d = new Date(/^\d+$/.test(value) ? Number(value) * (value.length > 10 ? 1 : 1000) : value);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

const slugify = (s) =>
  s
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'bookmark';

/* ---------- existing entries, so re-runs are idempotent ---------- */

fs.mkdirSync(OUT_DIR, { recursive: true });
const existingUrls = new Set();
for (const f of fs.readdirSync(OUT_DIR)) {
  if (!f.endsWith('.json')) continue;
  try {
    const data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), 'utf8'));
    if (data.url) existingUrls.add(String(data.url).replace(/\/$/, ''));
  } catch {
    /* ignore unreadable file */
  }
}

/* ---------- convert ---------- */

let written = 0;
let skipped = 0;
let malformed = 0;
const seen = new Set();

for (const rec of records) {
  if (written >= limit) break;

  const url = tweetUrl(rec);
  if (!url) {
    malformed++;
    continue;
  }

  const key = url.replace(/\/$/, '');
  if (seen.has(key) || (existingUrls.has(key) && !overwrite)) {
    skipped++;
    continue;
  }
  seen.add(key);

  const id = tweetId(rec);
  const title = makeTitle(rec);
  const author = authorHandle(rec);

  const tags = (pick(rec, F.hashtags) ?? '')
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#/, '').trim().toLowerCase())
    .filter(Boolean);

  const entry = {
    title,
    url,
    ...(author ? { source: author } : {}),
    note: '',
    tags,
    added: parseDate(rec),
    draft: true,
  };

  const name = `${id ? `tweet-${id}` : slugify(title)}.json`;
  const dest = path.join(OUT_DIR, name);

  // Never clobber work already done: an existing note/tags/draft wins.
  if (overwrite && fs.existsSync(dest)) {
    try {
      const prev = JSON.parse(fs.readFileSync(dest, 'utf8'));
      if (prev.note) entry.note = prev.note;
      if (Array.isArray(prev.tags) && prev.tags.length) entry.tags = prev.tags;
      if (typeof prev.draft === 'boolean') entry.draft = prev.draft;
    } catch {
      /* unreadable; just write the fresh entry */
    }
  }

  if (dryRun) {
    console.log(`would write ${name}`);
    console.log(`  title:  ${entry.title}`);
    console.log(`  url:    ${entry.url}`);
    console.log(`  source: ${entry.source ?? '—'}   added: ${entry.added}\n`);
  } else {
    fs.writeFileSync(dest, JSON.stringify(entry, null, 2) + '\n');
  }
  written++;
}

/* ---------- report ---------- */

console.log('─'.repeat(52));
console.log(`${dryRun ? 'Would import' : 'Imported'}: ${written}`);
if (skipped) console.log(`Skipped (already present): ${skipped}`);
if (malformed) console.log(`Skipped (no usable URL): ${malformed}`);

if (!dryRun && written > 0) {
  console.log(`
All ${written} landed as drafts with an empty note — nothing is on the site yet.

  npm run dev   then open /keystatic → Links

Write the note, untick Draft, and it publishes. The build refuses to publish a
link without commentary, so you cannot accidentally ship a bare URL dump.`);
}
