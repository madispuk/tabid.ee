import { render as renderChord } from "./chord-svg";
import { CHORD_DB } from "./chords";

(function () {
  const pre = document.getElementById("song-content") as HTMLPreElement;

  const CHORD_RE =
    /(?<![a-zA-Z])([A-Ga-g][#b]?)(m|min|maj|dim|aug|sus[24]?|add)?(\d+)?(\/[A-Ga-g][#b]?)?(?![a-zA-Z])/gi;

  function normalizeChord(chord: string): string {
    return chord.charAt(0).toUpperCase() + chord.slice(1);
  }

  function isTabLine(line: string): boolean {
    return /^\|?\s*[EBGDAebgd][|\-]/.test(line.trim());
  }

  function isChordLine(line: string): boolean {
    const stripped = line.trim();
    if (!stripped) return false;
    if (isTabLine(line)) return false;
    const withoutChords = stripped
      .replace(CHORD_RE, "")
      .replace(/[\s|,.\-–—:x\d()\/\[\]]/g, "");
    return withoutChords.length <= stripped.length * 0.3;
  }

  function extractChords(text: string): string[] {
    const chords: string[] = [];
    const seen = new Set<string>();
    for (const line of text.split("\n")) {
      if (!isChordLine(line)) continue;
      CHORD_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = CHORD_RE.exec(line)) !== null) {
        const chord = normalizeChord(m[0]);
        if (!seen.has(chord)) {
          seen.add(chord);
          chords.push(chord);
        }
      }
    }
    return chords;
  }

  // ─── Font size toggle ───
  const fontBtns = document.querySelectorAll<HTMLButtonElement>(".font-size-btn");
  const mobileSizes = ["text-[10px]", "text-xs", "text-sm"];
  const desktopSizes = ["md:text-xs", "md:text-sm", "md:text-base"];
  const chordSizes = [
    { width: 100, height: 133 },
    { width: 130, height: 179 },
    { width: 170, height: 241 },
  ];
  let currentSize = parseInt(localStorage.getItem("songFontSize") ?? "1");

  function applySize() {
    mobileSizes.forEach((s) => pre.classList.remove(s));
    desktopSizes.forEach((s) => pre.classList.remove(s));
    pre.classList.remove("text-sm", "md:text-sm");
    pre.classList.add(mobileSizes[currentSize]);
    pre.classList.add(desktopSizes[currentSize]);
    fontBtns.forEach((btn) => {
      const active = parseInt(btn.dataset.size!) === currentSize;
      btn.classList.toggle("bg-ctp-surface1", active);
      btn.classList.toggle("text-ctp-mauve", active);
      btn.classList.toggle("text-ctp-overlay1", !active);
    });
  }

  fontBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentSize = parseInt(btn.dataset.size!);
      localStorage.setItem("songFontSize", String(currentSize));
      applySize();
      updateChordStrip();
    });
  });
  applySize();

  // ─── Chord Display Mode (frets vs fingers) ───
  let chordDisplayMode: string = "frets";

  // ─── Chord Popup ───
  const popup = document.getElementById("chord-popup")!;
  const popupName = document.getElementById("popup-chord-name")!;
  const popupVoicings = document.getElementById("popup-voicings")!;
  const popupDots = document.getElementById("popup-dots")!;
  const popupClose = document.getElementById("popup-close")!;

  function showChordPopup(chordName: string, anchorEl: HTMLElement) {
    const db = CHORD_DB;
    let voicings = db[chordName];
    if (!voicings) {
      const baseName = chordName.replace(/\/[A-G][#b]?$/, "");
      voicings = db[baseName];
    }
    if (!voicings || !voicings.length) return;

    popupName.textContent = chordName;
    popupVoicings.innerHTML = "";
    popupDots.innerHTML = "";

    voicings.forEach((v: any) => {
      const div = document.createElement("div");
      div.className = "flex-shrink-0";
      div.className = "flex-shrink-0 p-1.5 rounded-lg bg-ctp-surface0";
      const cs = chordSizes[currentSize];
      div.innerHTML = renderChord(v, "", {
        width: cs.width,
        height: cs.height,
        mini: true,
        displayMode: chordDisplayMode,
      });
      popupVoicings.appendChild(div);
    });

    popup.classList.remove("hidden");

    const rect = anchorEl.getBoundingClientRect();
    popup.style.left =
      Math.max(8, Math.min(rect.left, window.innerWidth - 440)) + "px";

    const popupHeight = popup.offsetHeight || 140;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow > popupHeight + 4) {
      popup.style.top = rect.bottom + 4 + "px";
    } else {
      popup.style.top = rect.top - popupHeight - 4 + "px";
    }
  }

  popupClose.addEventListener("click", () => popup.classList.add("hidden"));
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (
      !popup.contains(target) &&
      !target.classList.contains("chord-link") &&
      !target.closest(".chord-strip-btn")
    ) {
      popup.classList.add("hidden");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") popup.classList.add("hidden");
  });

  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  function scheduleHide() {
    hideTimeout = setTimeout(() => popup.classList.add("hidden"), 200);
  }
  function cancelHide() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }
  popup.addEventListener("mouseenter", cancelHide);
  popup.addEventListener("mouseleave", scheduleHide);

  // ─── Make chords clickable ───
  function makeChordsClickable() {
    const text = pre.textContent || "";
    const lines = text.split("\n");
    const fragment = document.createDocumentFragment();

    lines.forEach((line, lineIdx) => {
      if (lineIdx > 0) fragment.appendChild(document.createTextNode("\n"));

      if (!isChordLine(line)) {
        fragment.appendChild(document.createTextNode(line));
        return;
      }

      CHORD_RE.lastIndex = 0;
      let lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = CHORD_RE.exec(line)) !== null) {
        if (m.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(line.slice(lastIndex, m.index)),
          );
        }
        const span = document.createElement("span");
        span.textContent = m[0];
        span.className =
          "chord-link cursor-pointer text-ctp-mauve hover:text-ctp-pink hover:underline text-[1.15em] font-bold";
        span.dataset.chord = normalizeChord(m[0]);
        span.addEventListener("click", (e) => {
          e.stopPropagation();
          showChordPopup(span.dataset.chord!, span);
        });
        span.addEventListener("mouseenter", () => {
          cancelHide();
          showChordPopup(span.dataset.chord!, span);
        });
        span.addEventListener("mouseleave", scheduleHide);
        fragment.appendChild(span);
        lastIndex = m.index + m[0].length;
      }
      if (lastIndex < line.length) {
        fragment.appendChild(document.createTextNode(line.slice(lastIndex)));
      }
    });

    pre.innerHTML = "";
    pre.appendChild(fragment);
  }

  // ─── Chord Summary Strip ───
  const chordStrip = document.getElementById("chord-strip")!;
  const chordStripItems = document.getElementById("chord-strip-items")!;
  function updateChordStrip() {
    const content = pre.textContent || "";
    const chords = extractChords(content);
    if (chords.length === 0) {
      chordStrip.classList.add("hidden");
      return;
    }

    chordStrip.classList.remove("hidden");
    chordStripItems.innerHTML = "";

    const db = CHORD_DB;

    chords.forEach((chord) => {
      const voicings =
        db[chord] || db[chord.replace(/\/[A-G][#b]?$/, "")];
      const btn = document.createElement("button");
      btn.className =
        "chord-strip-btn flex flex-col items-center gap-1 p-1.5 rounded-lg bg-ctp-surface0 hover:bg-ctp-surface1 transition-colors";
      btn.title = chord;

      if (voicings && voicings.length > 0) {
        const cs = chordSizes[currentSize];
        btn.innerHTML =
          renderChord(voicings[0], chord, {
            width: cs.width,
            height: cs.height,
            mini: true,
            displayMode: chordDisplayMode,
          }) +
          `<span class="text-sm font-semibold text-ctp-subtext1 font-mono">${chord}</span>`;
      } else {
        btn.innerHTML = `<span class="text-xs text-ctp-subtext0 font-mono px-2 py-4">${chord}</span>`;
      }

      btn.addEventListener("click", () => showChordPopup(chord, btn));
      chordStripItems.appendChild(btn);
    });
  }

  // ─── Chord Mode Toggle ───
  document.querySelectorAll(".chord-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = (btn as HTMLElement).dataset.mode!;
      if (mode === chordDisplayMode) return;
      chordDisplayMode = mode;
      document.querySelectorAll(".chord-mode-btn").forEach((b) => {
        if ((b as HTMLElement).dataset.mode === mode) {
          b.className = "chord-mode-btn text-xs font-medium uppercase tracking-wider px-4 py-2 md:px-3 md:py-1 transition-colors bg-ctp-surface0 text-ctp-lavender";
        } else {
          b.className = "chord-mode-btn text-xs font-medium uppercase tracking-wider px-4 py-2 md:px-3 md:py-1 transition-colors text-ctp-overlay0 hover:text-ctp-text";
        }
      });
      updateChordStrip();
    });
  });

  // ─── Initialize ───
  makeChordsClickable();
  updateChordStrip();
})();
