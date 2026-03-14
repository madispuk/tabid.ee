import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const API_BASE = "https://kitarr.astar.ee/api.php";
const __dirname = dirname(fileURLToPath(import.meta.url));

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function getAllPageTitles() {
  const titles = [];
  let apcontinue = "";

  while (true) {
    const params = new URLSearchParams({
      action: "query",
      list: "allpages",
      aplimit: "500",
      format: "json",
    });
    if (apcontinue) params.set("apcontinue", apcontinue);

    const data = await fetchJson(`${API_BASE}?${params}`);
    for (const page of data.query.allpages) {
      titles.push(page.title);
    }

    if (data.continue?.apcontinue) {
      apcontinue = data.continue.apcontinue;
    } else {
      break;
    }
  }

  return titles;
}

async function fetchPageBatch(titles) {
  const params = new URLSearchParams({
    action: "query",
    titles: titles.join("|"),
    prop: "revisions|categories",
    rvprop: "content",
    rvslots: "main",
    cllimit: "50",
    format: "json",
  });

  const data = await fetchJson(`${API_BASE}?${params}`);
  return Object.values(data.query.pages);
}

function parseSong(page) {
  const title = page.title;
  const content =
    page.revisions?.[0]?.slots?.main?.["*"] ??
    page.revisions?.[0]?.["*"] ??
    "";

  // Extract categories
  const categories = (page.categories || []).map((c) =>
    c.title.replace("Category:", ""),
  );

  // Extract content from <pre>...</pre> block
  const preMatch = content.match(/<pre>([\s\S]*?)<\/pre>/i);
  const songContent = preMatch ? preMatch[1].trim() : content.trim();

  // Parse "Artist - Song Title" format
  let artist = "";
  let song = title;

  const dashMatch = title.match(/^(.+?)\s*-\s*(.+)$/);
  if (dashMatch) {
    artist = dashMatch[1].trim();
    song = dashMatch[2].trim();
  }

  // Create URL-friendly slug
  const slug = title
    .toLowerCase()
    .replace(/[äöüõ]/g, (c) => ({ ä: "a", ö: "o", ü: "u", õ: "o" })[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Detect tablature
  const hasTabs =
    /^[eEBGDAb]\|[-0-9hp \/\\~|]+/m.test(songContent) ||
    /\|[-0-9hp ]{4,}\|/.test(songContent);

  return {
    title,
    artist,
    song,
    category: categories[0] || "",
    content: songContent,
    slug,
    hasTabs,
  };
}

// Skip non-song pages
const SKIP_PAGES = new Set([
  "Main Page",
  "Pealeht",
  "Akordid",
  "Eesti lood kitarrile",
  "Tabide lugemine",
]);

function shouldSkip(title) {
  if (SKIP_PAGES.has(title)) return true;
  if (title.startsWith("MediaWiki:")) return true;
  if (title.startsWith("Template:")) return true;
  if (title.startsWith("Category:")) return true;
  if (title.startsWith("Help:")) return true;
  return false;
}

function escapeYamlString(str) {
  if (
    /[:#{}[\],&*?|>!%@`"']/.test(str) ||
    str.startsWith("-") ||
    str.startsWith(" ") ||
    str.endsWith(" ")
  ) {
    return JSON.stringify(str);
  }
  return str;
}

async function main() {
  console.log("Fetching all page titles...");
  const allTitles = await getAllPageTitles();
  console.log(`Found ${allTitles.length} pages total`);

  const songTitles = allTitles.filter((t) => !shouldSkip(t));
  console.log(`${songTitles.length} song pages after filtering`);

  const songs = [];
  const batchSize = 50;

  for (let i = 0; i < songTitles.length; i += batchSize) {
    const batch = songTitles.slice(i, i + batchSize);
    console.log(
      `Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(songTitles.length / batchSize)}...`,
    );

    const pages = await fetchPageBatch(batch);
    for (const page of pages) {
      if (page.missing !== undefined) continue;
      const song = parseSong(page);
      if (song.content) {
        songs.push(song);
      }
    }

    // Be polite to the server
    await new Promise((r) => setTimeout(r, 200));
  }

  // Sort by artist, then song title
  songs.sort(
    (a, b) =>
      a.artist.localeCompare(b.artist, "et") ||
      a.song.localeCompare(b.song, "et"),
  );

  // Deduplicate slugs
  const slugCounts = {};
  for (const song of songs) {
    const base = song.slug;
    if (slugCounts[base] !== undefined) {
      slugCounts[base]++;
      song.slug = `${base}-${slugCounts[base]}`;
    } else {
      slugCounts[base] = 0;
    }
  }

  // Output individual .liquid files
  const songsDir = join(__dirname, "src", "songs");
  mkdirSync(songsDir, { recursive: true });

  for (const song of songs) {
    const frontmatter = [
      "---",
      `title: ${escapeYamlString(song.title)}`,
      `artist: ${escapeYamlString(song.artist)}`,
      `song: ${escapeYamlString(song.song)}`,
      `slug: ${song.slug}`,
      `hasTabs: ${song.hasTabs}`,
      "---",
    ].join("\n");

    const filePath = join(songsDir, `${song.slug}.liquid`);
    writeFileSync(filePath, frontmatter + "\n" + song.content + "\n");
  }

  console.log(`Saved ${songs.length} songs as .liquid files to src/songs/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
