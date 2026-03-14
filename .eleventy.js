export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/js");

  // Filters work on collection items (each has .data with frontmatter fields)
  eleventyConfig.addFilter("groupByArtist", (items) => {
    const groups = {};
    for (const item of items) {
      const artist = item.data?.artist || item.artist || "Tundmatu";
      const key = artist;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b, "et"))
      .map(([artist, songs]) => ({ artist, songs }));
  });

  eleventyConfig.addFilter("artistSongs", (items, artist) => {
    return items.filter((item) => {
      const a = item.data?.artist || item.artist;
      return a === artist;
    });
  });

  eleventyConfig.addFilter("uniqueArtists", (items) => {
    const artists = [
      ...new Set(
        items
          .map((item) => item.data?.artist || item.artist)
          .filter(Boolean),
      ),
    ];
    return artists.sort((a, b) => a.localeCompare(b, "et"));
  });

  eleventyConfig.addFilter("firstLetters", (artists) => {
    const letters = [
      ...new Set(artists.map((a) => a[0]?.toUpperCase()).filter(Boolean)),
    ];
    return letters.sort((a, b) => a.localeCompare(b, "et"));
  });

  eleventyConfig.addFilter("escapeJsonString", (str) => {
    return JSON.stringify(str).slice(1, -1);
  });

  // Extract unique chords from song content
  const CHORD_RE_GLOBAL =
    /(?<![a-zA-Z])([A-G][#b]?)(m|min|maj|dim|aug|sus[24]?|add)?(\d+)?(\/[A-G][#b]?)?(?![a-zA-Z])/g;
  function isChordLine(line) {
    const stripped = line.trim();
    if (!stripped) return false;
    const withoutChords = stripped
      .replace(CHORD_RE_GLOBAL, "")
      .replace(/[\s|,.\-–—:x\d()\/\[\]]/g, "");
    return withoutChords.length <= stripped.length * 0.3;
  }

  eleventyConfig.addFilter("extractChords", (content) => {
    if (!content) return [];
    const chords = new Set();
    const lines = content.split("\n");
    for (const line of lines) {
      if (!isChordLine(line)) continue;
      CHORD_RE_GLOBAL.lastIndex = 0;
      let m;
      while ((m = CHORD_RE_GLOBAL.exec(line)) !== null) {
        chords.add(m[0]);
      }
    }
    return [...chords];
  });

  // Beginner open chords (easy)
  const BEGINNER_CHORDS = new Set([
    "C", "D", "E", "G", "A",
    "Am", "Dm", "Em",
    "C7", "D7", "E7", "G7", "A7", "B7",
    "Am7", "Em7", "Dm7",
  ]);
  const INTERMEDIATE_CHORDS = new Set([
    "Cm", "Fm", "Gm", "Bm",
    "F", "Bb", "Eb", "Ab",
    "F7", "Bb7",
    "Dsus4", "Dsus2", "Asus4", "Asus2", "Esus4",
    "Csus4", "Gsus4",
    "Cadd9", "Gadd9", "Dadd9", "Eadd9",
    "Cmaj7", "Dmaj7", "Emaj7", "Fmaj7", "Gmaj7", "Amaj7",
    "Cm7", "Fm7", "Gm7", "Bm7",
    "F#m", "C#m", "G#m", "Bbm",
  ]);

  eleventyConfig.addFilter("songDifficulty", (content) => {
    if (!content) return "unknown";
    const chords = new Set();
    const lines = content.split("\n");
    for (const line of lines) {
      if (!isChordLine(line)) continue;
      CHORD_RE_GLOBAL.lastIndex = 0;
      let m;
      while ((m = CHORD_RE_GLOBAL.exec(line)) !== null) {
        chords.add(m[0]);
      }
    }
    if (chords.size === 0) return "unknown";
    let hasHard = false;
    let hasIntermediate = false;
    for (const c of chords) {
      if (!BEGINNER_CHORDS.has(c) && !INTERMEDIATE_CHORDS.has(c))
        hasHard = true;
      if (INTERMEDIATE_CHORDS.has(c)) hasIntermediate = true;
    }
    if (hasHard) return "hard";
    if (hasIntermediate) return "intermediate";
    return "beginner";
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
}
