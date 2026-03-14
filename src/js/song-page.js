"use strict";
(() => {
  // src/ts/song-page.ts
  (function() {
    const pre = document.getElementById("song-content");
    const CHORD_RE = /(?<![a-zA-Z])([A-G][#b]?)(m|min|maj|dim|aug|sus[24]?|add)?(\d+)?(\/[A-G][#b]?)?(?![a-zA-Z])/g;
    function isChordLine(line) {
      const stripped = line.trim();
      if (!stripped) return false;
      const withoutChords = stripped.replace(CHORD_RE, "").replace(/[\s|,.\-–—:x\d()\/\[\]]/g, "");
      return withoutChords.length <= stripped.length * 0.3;
    }
    function extractChords(text) {
      const chords = [];
      const seen = /* @__PURE__ */ new Set();
      for (const line of text.split("\n")) {
        if (!isChordLine(line)) continue;
        CHORD_RE.lastIndex = 0;
        let m;
        while ((m = CHORD_RE.exec(line)) !== null) {
          if (!seen.has(m[0])) {
            seen.add(m[0]);
            chords.push(m[0]);
          }
        }
      }
      return chords;
    }
    const fontBtns = document.querySelectorAll(".font-size-btn");
    const sizes = ["text-xs", "text-base", "text-xl"];
    let currentSize = parseInt(localStorage.getItem("songFontSize") ?? "1");
    function applySize() {
      sizes.forEach((s) => pre.classList.remove(s));
      pre.classList.add(sizes[currentSize]);
      pre.classList.remove("md:text-base", "md:text-lg", "md:text-xl");
      fontBtns.forEach((btn) => {
        const active = parseInt(btn.dataset.size) === currentSize;
        btn.classList.toggle("bg-ctp-surface1", active);
        btn.classList.toggle("text-ctp-mauve", active);
        btn.classList.toggle("text-ctp-overlay1", !active);
      });
    }
    fontBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        currentSize = parseInt(btn.dataset.size);
        localStorage.setItem("songFontSize", String(currentSize));
        applySize();
      });
    });
    applySize();
    const popup = document.getElementById("chord-popup");
    const popupName = document.getElementById("popup-chord-name");
    const popupVoicings = document.getElementById("popup-voicings");
    const popupDots = document.getElementById("popup-dots");
    const popupClose = document.getElementById("popup-close");
    function showChordPopup(chordName, anchorEl) {
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
      voicings.forEach((v) => {
        const div = document.createElement("div");
        div.className = "flex-shrink-0";
        div.className = "flex-shrink-0 p-1.5 rounded-lg bg-ctp-surface0";
        div.innerHTML = ChordSVG.render(v, "", {
          width: 100,
          height: 126,
          mini: true
        });
        popupVoicings.appendChild(div);
      });
      popup.classList.remove("hidden");
      const rect = anchorEl.getBoundingClientRect();
      popup.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 440)) + "px";
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow > 160) {
        popup.style.top = rect.bottom + window.scrollY + 4 + "px";
      } else {
        popup.style.top = rect.top + window.scrollY - 140 + "px";
      }
    }
    popupClose.addEventListener("click", () => popup.classList.add("hidden"));
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!popup.contains(target) && !target.classList.contains("chord-link") && !target.closest(".chord-strip-btn")) {
        popup.classList.add("hidden");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") popup.classList.add("hidden");
    });
    let hideTimeout = null;
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
        let m;
        while ((m = CHORD_RE.exec(line)) !== null) {
          if (m.index > lastIndex) {
            fragment.appendChild(
              document.createTextNode(line.slice(lastIndex, m.index))
            );
          }
          const span = document.createElement("span");
          span.textContent = m[0];
          span.className = "chord-link cursor-pointer text-ctp-mauve hover:text-ctp-pink hover:underline text-[1.15em] font-bold";
          span.dataset.chord = m[0];
          span.addEventListener("click", (e) => {
            e.stopPropagation();
            showChordPopup(span.dataset.chord, span);
          });
          span.addEventListener("mouseenter", () => {
            cancelHide();
            showChordPopup(span.dataset.chord, span);
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
    const chordStrip = document.getElementById("chord-strip");
    const chordStripItems = document.getElementById("chord-strip-items");
    const powerStrip = document.getElementById("power-strip");
    const powerStripItems = document.getElementById("power-strip-items");
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
      const powerChordRoots = /* @__PURE__ */ new Set();
      chords.forEach((chord) => {
        const voicings = db[chord] || db[chord.replace(/\/[A-G][#b]?$/, "")];
        const btn = document.createElement("button");
        btn.className = "chord-strip-btn flex flex-col items-center gap-1 p-1.5 rounded-lg bg-ctp-surface0 hover:bg-ctp-surface1 transition-colors";
        btn.title = chord;
        if (voicings && voicings.length > 0) {
          btn.innerHTML = ChordSVG.render(voicings[0], chord, {
            width: 100,
            height: 126,
            mini: true
          }) + `<span class="text-sm font-semibold text-ctp-subtext1 font-mono">${chord}</span>`;
        } else {
          btn.innerHTML = `<span class="text-xs text-ctp-subtext0 font-mono px-2 py-4">${chord}</span>`;
        }
        btn.addEventListener("click", () => showChordPopup(chord, btn));
        chordStripItems.appendChild(btn);
        CHORD_RE.lastIndex = 0;
        const m = CHORD_RE.exec(chord);
        if (m) powerChordRoots.add(m[1]);
      });
      powerStripItems.innerHTML = "";
      const powerChords = [];
      for (const root of powerChordRoots) {
        const powerName = root + "5";
        if (db[powerName]) powerChords.push(powerName);
      }
      if (powerChords.length > 0) {
        powerStrip.classList.remove("hidden");
        powerChords.forEach((pc) => {
          const voicings = db[pc];
          const btn = document.createElement("button");
          btn.className = "chord-strip-btn flex flex-col items-center gap-1 p-1.5 rounded-lg bg-ctp-surface0 hover:bg-ctp-surface1 transition-colors";
          btn.title = pc;
          btn.innerHTML = ChordSVG.render(voicings[0], pc, {
            width: 60,
            height: 76,
            mini: true
          }) + `<span class="text-[11px] font-semibold text-ctp-subtext1 font-mono">${pc}</span>`;
          btn.addEventListener("click", () => showChordPopup(pc, btn));
          powerStripItems.appendChild(btn);
        });
      } else {
        powerStrip.classList.add("hidden");
      }
    }
    makeChordsClickable();
    updateChordStrip();
  })();
})();
