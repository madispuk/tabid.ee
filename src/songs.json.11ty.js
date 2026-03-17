export const data = {
  permalink: "songs.json",
  eleventyExcludeFromCollections: true,
};

export function render(data) {
  const songs = [...data.collections.songs].sort((a, b) => {
    const artistA = a.data?.artist || "";
    const artistB = b.data?.artist || "";
    const cmp = artistA.localeCompare(artistB, "et");
    if (cmp !== 0) return cmp;
    return (a.data?.song || "").localeCompare(b.data?.song || "", "et");
  });

  const manifest = songs.map((item) => {
    const d = this.songDifficulty(item.content || "");
    return {
      s: item.data.slug,
      b: d === "beginner" ? 1 : 0,
    };
  });

  return JSON.stringify(manifest);
}
