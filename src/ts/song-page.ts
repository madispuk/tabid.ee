import { render as renderChord } from "./chord-svg";
import { CHORD_DB } from "./chords";

(function () {
  const pre = document.getElementById("song-content") as HTMLPreElement;

  const CHORD_RE =
    /(?<![a-zA-Z])([A-Ga-g][#b]?)(m|min|maj|dim|aug|sus[24]?|add)?(\d+)?(\/[A-Ga-g][#b]?)?(?![a-zA-Z])/gi;

  function normalizeChord(chord: string): string {
    return chord.charAt(0).toUpperCase() + chord.slice(1);
  }

  // ─── Transpose ───
  const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const ENHARMONIC: Record<string, string> = {
    'Db':'C#','Eb':'D#','Fb':'E','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B','E#':'F','B#':'C'
  };

  function transposeNote(note: string, semitones: number): string {
    const n = ENHARMONIC[note] ?? note;
    const idx = CHROMATIC.indexOf(n);
    if (idx === -1) return note;
    return CHROMATIC[((idx + semitones) % 12 + 12) % 12];
  }

  function transposeChordName(chord: string, semitones: number): string {
    if (semitones === 0) return chord;
    const slashIdx = chord.lastIndexOf('/');
    let main = chord, bass = '';
    if (slashIdx > 0 && /[A-G]/.test(chord[slashIdx + 1])) {
      main = chord.slice(0, slashIdx);
      bass = chord.slice(slashIdx + 1);
    }
    const rootMatch = main.match(/^([A-G][#b]?)(.*)$/);
    if (!rootMatch) return chord;
    const [, root, quality] = rootMatch;
    return transposeNote(root, semitones) + quality + (bass ? '/' + transposeNote(bass, semitones) : '');
  }

  let currentTranspose = 0;
  const originalContent = pre.textContent || "";

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

  const chordDisplayMode = "frets";

  // ─── Chord Popup ───
  const popup = document.getElementById("chord-popup")!;
  const popupName = document.getElementById("popup-chord-name")!;
  const popupVoicings = document.getElementById("popup-voicings")!;
  const popupDots = document.getElementById("popup-dots")!;
  const popupClose = document.getElementById("popup-close")!;

  function parseSlashChord(chordName: string): { baseName: string; bassNote: string | undefined } {
    const slashMatch = chordName.match(/^(.+)\/([A-G][#b]?)$/);
    if (slashMatch) return { baseName: slashMatch[1], bassNote: slashMatch[2] };
    return { baseName: chordName, bassNote: undefined };
  }

  function showChordPopup(chordName: string, anchorEl: HTMLElement) {
    const db = CHORD_DB;
    const { baseName, bassNote } = parseSlashChord(chordName);
    let voicings = db[chordName] || db[baseName];
    if (!voicings || !voicings.length) return;

    popupName.textContent = chordName;
    popupVoicings.innerHTML = "";
    popupDots.innerHTML = "";

    voicings.forEach((v: any) => {
      const div = document.createElement("div");
      div.className = "flex-shrink-0 p-1.5 rounded-lg bg-ctp-surface0";
      const cs = chordSizes[currentSize];
      div.innerHTML = renderChord(v, "", {
        width: cs.width,
        height: cs.height,
        mini: true,
        displayMode: chordDisplayMode,
        bassNote,
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
    const lines = originalContent.split("\n");
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
        const transposedChord = transposeChordName(normalizeChord(m[0]), currentTranspose);
        span.textContent = transposedChord;
        span.className =
          "chord-link cursor-pointer text-ctp-mauve hover:text-ctp-pink hover:underline text-[1.15em] font-bold";
        span.dataset.chord = transposedChord;
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
    const chords = extractChords(originalContent).map(c => transposeChordName(c, currentTranspose));
    if (chords.length === 0) {
      chordStrip.classList.add("hidden");
      return;
    }

    chordStrip.classList.remove("hidden");
    chordStripItems.innerHTML = "";

    const db = CHORD_DB;

    chords.forEach((chord) => {
      const { baseName, bassNote } = parseSlashChord(chord);
      const voicings = db[chord] || db[baseName];
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
            bassNote,
          }) +
          `<span class="text-sm font-semibold text-ctp-subtext1 font-mono">${chord}</span>`;
      } else {
        btn.innerHTML = `<span class="text-xs text-ctp-subtext0 font-mono px-2 py-4">${chord}</span>`;
      }

      btn.addEventListener("click", () => showChordPopup(chord, btn));
      chordStripItems.appendChild(btn);
    });
  }

  // ─── Transpose controls ───
  const transposeValue = document.getElementById("transpose-value")!;
  const transposeDown = document.getElementById("transpose-down")!;
  const transposeUp = document.getElementById("transpose-up")!;

  function applyTranspose() {
    transposeValue.textContent = currentTranspose > 0 ? `+${currentTranspose}` : String(currentTranspose);
    transposeValue.classList.toggle("text-ctp-mauve", currentTranspose !== 0);
    transposeValue.classList.toggle("text-ctp-subtext1", currentTranspose === 0);
    makeChordsClickable();
    updateChordStrip();
  }

  function wrapTranspose(n: number): number { n = ((n % 12) + 12) % 12; return n > 6 ? n - 12 : n; }
  transposeDown.addEventListener("click", () => { currentTranspose = wrapTranspose(currentTranspose - 1); applyTranspose(); });
  transposeUp.addEventListener("click", () => { currentTranspose = wrapTranspose(currentTranspose + 1); applyTranspose(); });

  // ─── Auto-scroll ───
  const scrollToggle = document.getElementById("autoscroll-toggle")!;
  const scrollBar = document.getElementById("autoscroll-bar")!;
  const scrollSpacer = document.getElementById("autoscroll-spacer")!;
  const scrollSlider = document.getElementById("scroll-speed") as HTMLInputElement;
  let scrollVisible = false;

  // Autoscroll: rAF loop, accumulates fractional px and scrolls whole pixels.
  // Slider 1–80 maps to 5–100 px/s.
  let scrollPxPerSec = 0;
  let scrollRafId: number | null = null;
  let scrollPrev: number | null = null;
  let scrollRemainder = 0;
  let touchActive = false;

  document.addEventListener("touchstart", (e) => {
    if (!scrollBar.contains(e.target as Node)) touchActive = true;
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (!scrollBar.contains(e.target as Node)) touchActive = false;
  }, { passive: true });

  function scrollTick(now: number) {
    if (scrollPrev !== null && !touchActive) {
      const dt = (now - scrollPrev) / 1000;
      scrollRemainder += scrollPxPerSec * dt;
      const px = Math.floor(scrollRemainder);
      if (px >= 1) {
        scrollRemainder -= px;
        window.scrollBy(0, px);
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        scrollPrev = now;
        scrollRafId = requestAnimationFrame(scrollTick);
        return;
      }
    }
    scrollPrev = now;
    scrollRafId = requestAnimationFrame(scrollTick);
  }

  function startScroll() {
    if (scrollRafId !== null) return;
    scrollPrev = null;
    scrollRemainder = 0;
    scrollRafId = requestAnimationFrame(scrollTick);
  }

  function stopScroll() {
    if (scrollRafId !== null) {
      cancelAnimationFrame(scrollRafId);
      scrollRafId = null;
      scrollPrev = null;
      scrollRemainder = 0;
    }
  }

  scrollToggle.addEventListener("click", () => {
    scrollVisible = !scrollVisible;
    scrollBar.classList.toggle("hidden", !scrollVisible);
    scrollSpacer.classList.toggle("hidden", !scrollVisible);
    scrollToggle.classList.toggle("bg-ctp-surface0", scrollVisible);
    scrollToggle.classList.toggle("text-ctp-mauve", scrollVisible);
    scrollToggle.classList.toggle("text-ctp-overlay1", !scrollVisible);
    if (!scrollVisible) {
      scrollSlider.value = "0";
      scrollPxPerSec = 0;
      stopScroll();
    }
  });

  scrollSlider.addEventListener("input", () => {
    const v = Number(scrollSlider.value);
    // slider 0 = stop, 1–80 maps to 3–40 px/s
    scrollPxPerSec = v <= 0 ? 0 : 3 + (v / 80) * 37;
    if (scrollPxPerSec > 0) {
      startScroll();
    } else {
      stopScroll();
    }
  });

  // ─── Initialize ───
  makeChordsClickable();
  updateChordStrip();
})();
