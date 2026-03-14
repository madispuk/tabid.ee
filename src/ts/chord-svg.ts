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
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function render(voicing: Voicing, chordName: string, opts: RenderOpts = {}): string {
  const w = opts.width || 80;
  const h = opts.height || 100;
  const mini = opts.mini || false;
  const displayMode = opts.displayMode || "frets";
  const strings = 6;
  const frets = 5;
  const padTop = mini ? 18 : 28;
  const padLeft = mini ? 18 : 20;
  const padRight = mini ? 10 : 12;
  const padBottom = mini ? 6 : 8;
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
    const fret = voicing.frets[s];
    const x = padLeft + s * stringSpacing;

    if (fret === -1) {
      const y = padTop - 10;
      const sz = (mini ? 3 : 4) * scale;
      svg += `<line x1="${x - sz}" y1="${y - sz}" x2="${x + sz}" y2="${y + sz}" stroke="#6c7086" stroke-width="${1.5 * scale}"/>`;
      svg += `<line x1="${x + sz}" y1="${y - sz}" x2="${x - sz}" y2="${y + sz}" stroke="#6c7086" stroke-width="${1.5 * scale}"/>`;
    } else if (fret === 0) {
      const y = padTop - 10;
      svg += `<circle cx="${x}" cy="${y}" r="${(mini ? 2.5 : 3) * scale}" fill="none" stroke="#a6e3a1" stroke-width="${1.5 * scale}"/>`;
    } else {
      const fretIdx = isOpenPos ? fret : fret - pos;
      const y = padTop + (fretIdx - 0.5) * fretSpacing;
      svg += `<circle cx="${x}" cy="${y}" r="${dotR}" fill="#cba6f7"/>`;
      const label = displayMode === "fingers" ? (voicing.fingers && voicing.fingers[s] ? voicing.fingers[s] : fret) : fret;
      svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="#1e1e2e" font-size="${fontSize - 2 * scale}" font-weight="700" font-family="Inter,sans-serif">${label}</text>`;
    }
  }

  svg += "</svg>";
  return svg;
}
