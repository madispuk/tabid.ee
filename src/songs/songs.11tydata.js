export default {
  layout: "song.liquid",
  tags: "songs",
  permalink: "laulud/{{ slug }}/index.html",
  eleventyComputed: {
    pageTitle: (data) => `${data.title} | tabid.ee`,
    metaDescription: (data) =>
      `${data.artist} - ${data.song} akordid ja sõnad kitarrile | tabid.ee`,
  },
};
