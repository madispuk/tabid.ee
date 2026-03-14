export default {
  layout: "song.liquid",
  tags: "songs",
  permalink: "laulud/{{ slug }}/index.html",
  eleventyComputed: {
    pageTitle: (data) => data.title,
  },
};
