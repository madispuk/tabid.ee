(function () {
  const search = document.getElementById("search") as HTMLInputElement;
  const noResults = document.getElementById("no-results")!;
  const resultsCount = document.getElementById("results-count")!;
  const artistGroups = document.querySelectorAll<HTMLElement>(".artist-group");
  const filterBtns = document.querySelectorAll<HTMLElement>(".filter-btn");
  const songList = document.getElementById("song-list")!;
  const layoutBtn = document.getElementById("layout-toggle")!;
  const iconMulti = document.getElementById("icon-multi")!;
  const iconSingle = document.getElementById("icon-single")!;
  const beginnerBtn = document.getElementById("toggle-beginner")!;
  const beginnerDot = document.getElementById("beginner-dot")!;
  const searchClear = document.getElementById("search-clear")!;
  let activeFilter = "all";
  let beginnerOnly = false;
  let multiCol = true;

  function readState() {
    const params = new URLSearchParams(location.hash.slice(1));
    search.value = params.get("q") || "";
    activeFilter = params.get("f") || "all";
    beginnerOnly =
      params.get("b") === "1" ||
      (!params.has("b") && localStorage.getItem("beginnerOnly") === "1");
    setActiveBtn("filter-" + activeFilter);
    applyBeginnerToggle();
    multiCol =
      (params.get("cols") || localStorage.getItem("cols") || "multi") !==
      "single";
    applyLayout();
    updateClearBtn();
  }

  function saveState() {
    const params = new URLSearchParams();
    if (search.value) params.set("q", search.value);
    if (activeFilter !== "all") params.set("f", activeFilter);
    if (beginnerOnly) params.set("b", "1");
    if (!multiCol) params.set("cols", "single");
    const hash = params.toString();
    history.replaceState(null, "", hash ? "#" + hash : location.pathname);
    localStorage.setItem("cols", multiCol ? "multi" : "single");
    localStorage.setItem("beginnerOnly", beginnerOnly ? "1" : "0");
  }

  function applyLayout() {
    songList.classList.toggle("sm:columns-2", multiCol);
    songList.classList.toggle("lg:columns-3", multiCol);
    iconMulti.classList.toggle("hidden", !multiCol);
    iconSingle.classList.toggle("hidden", multiCol);
  }

  function applyBeginnerToggle() {
    if (beginnerOnly) {
      beginnerDot.classList.remove("bg-ctp-overlay0");
      beginnerDot.classList.add("bg-ctp-green");
    } else {
      beginnerDot.classList.remove("bg-ctp-green");
      beginnerDot.classList.add("bg-ctp-overlay0");
    }
  }

  function filterSongs() {
    saveState();
    const query = search.value.toLowerCase().trim();
    let visibleSongs = 0;

    artistGroups.forEach((group) => {
      const items = group.querySelectorAll<HTMLElement>(".song-item");
      let groupVisible = 0;

      items.forEach((item) => {
        const textMatch =
          !query ||
          item.dataset.title!.includes(query) ||
          item.dataset.artist!.includes(query);
        const hasTabs = item.dataset.tabs === "true";
        const difficulty = item.dataset.difficulty;
        const typeMatch =
          activeFilter === "all" ||
          (activeFilter === "tabs" && hasTabs) ||
          (activeFilter === "chords" && !hasTabs);
        const beginnerMatch = !beginnerOnly || difficulty === "beginner";
        const match = textMatch && typeMatch && beginnerMatch;
        item.style.display = match ? "" : "none";
        if (match) groupVisible++;
      });

      group.style.display = groupVisible > 0 ? "" : "none";
      visibleSongs += groupVisible;
    });

    noResults.classList.toggle("hidden", visibleSongs > 0);

    resultsCount.textContent = `${visibleSongs} laulu leitud`;
  }

  function updateClearBtn() {
    if (search.value) {
      searchClear.classList.remove("hidden");
      searchClear.classList.add("flex");
    } else {
      searchClear.classList.add("hidden");
      searchClear.classList.remove("flex");
    }
  }

  search.addEventListener("input", () => {
    updateClearBtn();
    filterSongs();
  });

  searchClear.addEventListener("click", () => {
    search.value = "";
    updateClearBtn();
    filterSongs();
    search.focus();
  });

  document.getElementById("filter-all")!.addEventListener("click", () => {
    activeFilter = "all";
    setActiveBtn("filter-all");
    filterSongs();
  });
  document.getElementById("filter-chords")!.addEventListener("click", () => {
    activeFilter = "chords";
    setActiveBtn("filter-chords");
    filterSongs();
  });
  document.getElementById("filter-tabs")!.addEventListener("click", () => {
    activeFilter = "tabs";
    setActiveBtn("filter-tabs");
    filterSongs();
  });

  beginnerBtn.addEventListener("click", () => {
    beginnerOnly = !beginnerOnly;
    applyBeginnerToggle();
    filterSongs();
  });

  function setActiveBtn(id: string) {
    filterBtns.forEach((b) => {
      b.classList.remove("bg-ctp-mauve", "text-ctp-crust");
      b.classList.add("bg-ctp-surface0", "text-ctp-subtext0");
    });
    const btn = document.getElementById(id)!;
    btn.classList.remove("bg-ctp-surface0", "text-ctp-subtext0");
    btn.classList.add("bg-ctp-mauve", "text-ctp-crust");
  }

  layoutBtn.addEventListener("click", () => {
    multiCol = !multiCol;
    applyLayout();
    saveState();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
  });

  readState();
  filterSongs();
})();
