export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");

  eleventyConfig.addFilter("groupByArtist", (songs) => {
    const groups = {};
    for (const song of songs) {
      const key = song.artist || "Tundmatu";
      if (!groups[key]) groups[key] = [];
      groups[key].push(song);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b, "et"))
      .map(([artist, songs]) => ({ artist, songs }));
  });

  eleventyConfig.addFilter("artistSongs", (songs, artist) => {
    return songs.filter((s) => s.artist === artist);
  });

  eleventyConfig.addFilter("uniqueArtists", (songs) => {
    const artists = [...new Set(songs.map((s) => s.artist).filter(Boolean))];
    return artists.sort((a, b) => a.localeCompare(b, "et"));
  });

  eleventyConfig.addFilter("firstLetters", (artists) => {
    const letters = [...new Set(artists.map((a) => a[0]?.toUpperCase()).filter(Boolean))];
    return letters.sort((a, b) => a.localeCompare(b, "et"));
  });

  eleventyConfig.addFilter("escapeJsonString", (str) => {
    return JSON.stringify(str).slice(1, -1);
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
