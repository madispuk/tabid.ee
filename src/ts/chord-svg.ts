interface Voicing {
  frets: number[];
  fingers?: number[];
  pos?: number;
  barres?: { from: number; to: number; fret: number }[];
}

interface RenderOpts {
  width?: number;
  height?: number;
  mini?: boolean;
  displayMode?: "frets" | "fingers";
  bassNote?: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const ENHARMONIC: Record<string, string> = {
  'Db':'C#','Eb':'D#','Fb':'E','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B','E#':'F','B#':'C'
};
// Open string notes in semitones from C: E=4, A=9, D=2, G=7, B=11, E=4
const OPEN_STRINGS = [4, 9, 2, 7, 11, 4];

function noteSemitone(note: string): number {
  const n = ENHARMONIC[note] ?? note;
  const idx = CHROMATIC.indexOf(n);
  return idx === -1 ? -1 : idx;
}

function bassFretOnString(bassNote: string, stringIdx: number): number {
  const target = noteSemitone(bassNote);
  if (target === -1) return -1;
  return ((target - OPEN_STRINGS[stringIdx]) % 12 + 12) % 12;
}

function applyBassNote(voicing: Voicing, bassNote: string, pos: number): { frets: number[]; bassStringIdx: number } {
  const frets = [...voicing.frets];
  const visibleMin = pos === 0 ? 0 : pos + 1;
  const visibleMax = pos + 5;

  // Try low E (0) then A (1) — pick the one closest to chord position
  let bestString = -1;
  let bestFret = -1;
  for (const s of [0, 1]) {
    let f = bassFretOnString(bassNote, s);
    if (f === 0) { bestString = s; bestFret = 0; break; }
    // Try the fret within visible range, or +12
    for (const candidate of [f, f + 12]) {
      if (candidate >= visibleMin && candidate <= visibleMax) {
        if (bestString === -1 || Math.abs(candidate - (pos + 3)) < Math.abs(bestFret - (pos + 3))) {
          bestString = s; bestFret = candidate;
        }
      }
    }
  }

  if (bestString !== -1) {
    // Mute strings lower than bass string
    for (let i = 0; i < bestString; i++) frets[i] = -1;
    frets[bestString] = bestFret;
  }

  return { frets, bassStringIdx: bestString };
}

export function render(voicing: Voicing, chordName: string, opts: RenderOpts = {}): string {
  const w = opts.width || 80;
  const h = opts.height || 100;
  const mini = opts.mini || false;
  const displayMode = opts.displayMode || "frets";
  const strings = 6;
  const frets = 5;
  const padTop = Math.round((mini ? 18 : 28) * (w / 80));
  const padLeft = Math.round((mini ? 18 : 20) * (w / 80));
  const padRight = Math.round((mini ? 10 : 12) * (w / 80));
  const padBottom = Math.round((mini ? 6 : 8) * (w / 80));
  const gridW = w - padLeft - padRight;
  const gridH = h - padTop - padBottom;
  const stringSpacing = gridW / (strings - 1);
  const fretSpacing = gridH / frets;
  const scale = w / 80;
  const dotR = 4.5 * scale;
  const fontSize = (mini ? 9 : 10) * scale;
  const titleSize = mini ? 10 : 12;

  let pos = voicing.pos || 0;
  const isOpenPos = pos === 0;

  if (!isOpenPos) {
    const minFret = voicing.frets.filter((f) => f > 0).reduce((a, b) => Math.min(a, b), Infinity);
    if (minFret !== Infinity) {
      pos = minFret - 1;
    }
  }

  // Apply bass note modification for slash chords
  let activeFrets = voicing.frets;
  let bassStringIdx = -1;
  if (opts.bassNote) {
    const result = applyBassNote(voicing, opts.bassNote, pos);
    activeFrets = result.frets;
    bassStringIdx = result.bassStringIdx;
    // Recalculate pos if bass note shifted the range
    if (!isOpenPos) {
      const minF = activeFrets.filter((f) => f > 0).reduce((a, b) => Math.min(a, b), Infinity);
      if (minF !== Infinity) pos = minF - 1;
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="chord-svg">`;

  if (!mini && chordName) {
    svg += `<text x="${w / 2}" y="${titleSize}" text-anchor="middle" fill="#cdd6f4" font-size="${titleSize}" font-weight="600" font-family="Inter,sans-serif">${escapeHtml(chordName)}</text>`;
  }

  for (let f = 0; f <= frets; f++) {
    const y = padTop + f * fretSpacing;
    svg += `<line x1="${padLeft}" y1="${y}" x2="${padLeft + gridW}" y2="${y}" stroke="#6c7086" stroke-width="1"/>`;
  }
  for (let s = 0; s < strings; s++) {
    const x = padLeft + s * stringSpacing;
    svg += `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + gridH}" stroke="#585b70" stroke-width="${s === 0 || s === 5 ? 1 : 0.8}"/>`;
  }

  if (isOpenPos) {
    svg += `<rect x="${padLeft - 1}" y="${padTop - 3}" width="${gridW + 2}" height="3" fill="#cdd6f4"/>`;
  } else {
    svg += `<rect x="${padLeft}" y="${padTop}" width="${gridW}" height="1.5" rx="0.5" fill="#585b70"/>`;
  }

  if (voicing.barres) {
    for (const barre of voicing.barres) {
      const fromX = padLeft + barre.from * stringSpacing;
      const toX = padLeft + barre.to * stringSpacing;
      const relativeFret = voicing.frets[barre.from] !== -1 ? voicing.frets[barre.from] : barre.fret;
      const fretIdx = isOpenPos ? relativeFret : relativeFret - pos;
      const y = padTop + (fretIdx - 0.5) * fretSpacing;
      svg += `<rect x="${fromX - dotR}" y="${y - dotR}" width="${toX - fromX + dotR * 2}" height="${dotR * 2}" rx="${dotR}" fill="#cba6f7" opacity="0.7"/>`;
    }
  }

  for (let s = 0; s < strings; s++) {
    const fret = activeFrets[s];
    const x = padLeft + s * stringSpacing;
    const isBass = s === bassStringIdx;
    const dotColor = isBass ? "#a6e3a1" : "#cba6f7";
    const dotTextColor = isBass ? "#1e1e2e" : "#1e1e2e";

    if (fret === -1) {
      const y = padTop - 10 * scale;
      const sz = (mini ? 3 : 4) * scale;
      svg += `<line x1="${x - sz}" y1="${y - sz}" x2="${x + sz}" y2="${y + sz}" stroke="#6c7086" stroke-width="${1.5 * scale}"/>`;
      svg += `<line x1="${x + sz}" y1="${y - sz}" x2="${x - sz}" y2="${y + sz}" stroke="#6c7086" stroke-width="${1.5 * scale}"/>`;
    } else if (fret === 0) {
      const y = padTop - 10 * scale;
      svg += `<circle cx="${x}" cy="${y}" r="${(mini ? 2.5 : 3) * scale}" fill="${isBass ? '#a6e3a1' : 'none'}" stroke="#a6e3a1" stroke-width="${1.5 * scale}"/>`;
    } else {
      const fretIdx = isOpenPos ? fret : fret - pos;
      const y = padTop + (fretIdx - 0.5) * fretSpacing;
      svg += `<circle cx="${x}" cy="${y}" r="${dotR}" fill="${dotColor}"/>`;
      const label = displayMode === "fingers" ? (voicing.fingers && voicing.fingers[s] ? voicing.fingers[s] : fret) : fret;
      svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="${dotTextColor}" font-size="${fontSize - 2 * scale}" font-weight="700" font-family="Inter,sans-serif">${label}</text>`;
    }
  }

  svg += "</svg>";
  return svg;
}
