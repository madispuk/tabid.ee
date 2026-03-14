// Chord voicing database: multiple voicings per chord, simplest first
// Each voicing: [E, A, D, G, B, e] where -1 = muted, 0 = open
// barres: [{from, to, fret}] for barre indicators
// pos: starting fret (0 = open position, otherwise fret number shown)

interface Voicing {
  frets: number[];
  fingers: number[];
  pos: number;
  barres?: { from: number; to: number; fret: number }[];
}

const CHORD_DB: Record<string, Voicing[]> = {
  // ─── Major ───
  'C':  [
    { frets: [-1,3,2,0,1,0], fingers: [0,3,2,0,1,0], pos: 0 },
    { frets: [-1,3,5,5,5,3], fingers: [0,1,3,3,3,1], pos: 1, barres: [{from:1,to:5,fret:3}] },
    { frets: [8,10,10,9,8,8], fingers: [1,3,4,2,1,1], pos: 6, barres: [{from:0,to:5,fret:8}] },
  ],
  'D':  [
    { frets: [-1,-1,0,2,3,2], fingers: [0,0,0,1,3,2], pos: 0 },
    { frets: [-1,5,7,7,7,5], fingers: [0,1,3,3,3,1], pos: 3, barres: [{from:1,to:5,fret:5}] },
    { frets: [10,12,12,11,10,10], fingers: [1,3,4,2,1,1], pos: 8, barres: [{from:0,to:5,fret:10}] },
  ],
  'E':  [
    { frets: [0,2,2,1,0,0], fingers: [0,2,3,1,0,0], pos: 0 },
    { frets: [-1,7,9,9,9,7], fingers: [0,1,3,3,3,1], pos: 5, barres: [{from:1,to:5,fret:7}] },
    { frets: [12,14,14,13,12,12], fingers: [1,3,4,2,1,1], pos: 10, barres: [{from:0,to:5,fret:12}] },
  ],
  'F':  [
    { frets: [1,3,3,2,1,1], fingers: [1,3,4,2,1,1], pos: 0, barres: [{from:0,to:5,fret:1}] },
    { frets: [-1,-1,3,2,1,1], fingers: [0,0,3,2,1,1], pos: 0, barres: [{from:4,to:5,fret:1}] },
    { frets: [-1,8,10,10,10,8], fingers: [0,1,3,3,3,1], pos: 6, barres: [{from:1,to:5,fret:8}] },
  ],
  'G':  [
    { frets: [3,2,0,0,0,3], fingers: [2,1,0,0,0,3], pos: 0 },
    { frets: [3,2,0,0,3,3], fingers: [2,1,0,0,3,4], pos: 0 },
    { frets: [3,5,5,4,3,3], fingers: [1,3,4,2,1,1], pos: 1, barres: [{from:0,to:5,fret:3}] },
  ],
  'A':  [
    { frets: [-1,0,2,2,2,0], fingers: [0,0,1,2,3,0], pos: 0 },
    { frets: [5,7,7,6,5,5], fingers: [1,3,4,2,1,1], pos: 3, barres: [{from:0,to:5,fret:5}] },
    { frets: [-1,0,7,6,5,5], fingers: [0,0,4,3,1,1], pos: 3, barres: [{from:4,to:5,fret:5}] },
  ],
  'B':  [
    { frets: [-1,2,4,4,4,2], fingers: [0,1,3,3,3,1], pos: 0, barres: [{from:1,to:5,fret:2}] },
    { frets: [7,9,9,8,7,7], fingers: [1,3,4,2,1,1], pos: 5, barres: [{from:0,to:5,fret:7}] },
    { frets: [-1,2,4,4,4,-1], fingers: [0,1,2,3,4,0], pos: 0 },
  ],

  // ─── Minor ───
  'Cm': [
    { frets: [-1,3,5,5,4,3], fingers: [0,1,3,4,2,1], pos: 1, barres: [{from:1,to:5,fret:3}] },
    { frets: [8,10,10,8,8,8], fingers: [1,3,4,1,1,1], pos: 6, barres: [{from:0,to:5,fret:8}] },
    { frets: [-1,3,1,0,1,3], fingers: [0,3,1,0,2,4], pos: 0 },
  ],
  'Dm': [
    { frets: [-1,-1,0,2,3,1], fingers: [0,0,0,2,3,1], pos: 0 },
    { frets: [-1,5,7,7,6,5], fingers: [0,1,3,4,2,1], pos: 3, barres: [{from:1,to:5,fret:5}] },
    { frets: [10,12,12,10,10,10], fingers: [1,3,4,1,1,1], pos: 8, barres: [{from:0,to:5,fret:10}] },
  ],
  'Em': [
    { frets: [0,2,2,0,0,0], fingers: [0,2,3,0,0,0], pos: 0 },
    { frets: [-1,7,9,9,8,7], fingers: [0,1,3,4,2,1], pos: 5, barres: [{from:1,to:5,fret:7}] },
    { frets: [12,14,14,12,12,12], fingers: [1,3,4,1,1,1], pos: 10, barres: [{from:0,to:5,fret:12}] },
  ],
  'Fm': [
    { frets: [1,3,3,1,1,1], fingers: [1,3,4,1,1,1], pos: 0, barres: [{from:0,to:5,fret:1}] },
    { frets: [-1,-1,3,1,1,1], fingers: [0,0,3,1,1,1], pos: 0, barres: [{from:3,to:5,fret:1}] },
    { frets: [-1,8,10,10,9,8], fingers: [0,1,3,4,2,1], pos: 6, barres: [{from:1,to:5,fret:8}] },
  ],
  'Gm': [
    { frets: [3,5,5,3,3,3], fingers: [1,3,4,1,1,1], pos: 1, barres: [{from:0,to:5,fret:3}] },
    { frets: [-1,-1,5,3,3,3], fingers: [0,0,3,1,1,1], pos: 1, barres: [{from:3,to:5,fret:3}] },
    { frets: [-1,10,12,12,11,10], fingers: [0,1,3,4,2,1], pos: 8, barres: [{from:1,to:5,fret:10}] },
  ],
  'Am': [
    { frets: [-1,0,2,2,1,0], fingers: [0,0,2,3,1,0], pos: 0 },
    { frets: [5,7,7,5,5,5], fingers: [1,3,4,1,1,1], pos: 3, barres: [{from:0,to:5,fret:5}] },
    { frets: [-1,0,7,5,5,5], fingers: [0,0,4,1,1,1], pos: 3, barres: [{from:3,to:5,fret:5}] },
  ],
  'Bm': [
    { frets: [-1,2,4,4,3,2], fingers: [0,1,3,4,2,1], pos: 0, barres: [{from:1,to:5,fret:2}] },
    { frets: [7,9,9,7,7,7], fingers: [1,3,4,1,1,1], pos: 5, barres: [{from:0,to:5,fret:7}] },
    { frets: [-1,2,0,4,3,2], fingers: [0,1,0,4,3,2], pos: 0 },
  ],

  // ─── 7th ───
  'C7': [
    { frets: [-1,3,2,3,1,0], fingers: [0,3,2,4,1,0], pos: 0 },
    { frets: [8,10,8,9,8,8], fingers: [1,3,1,2,1,1], pos: 6, barres: [{from:0,to:5,fret:8}] },
  ],
  'D7': [
    { frets: [-1,-1,0,2,1,2], fingers: [0,0,0,2,1,3], pos: 0 },
    { frets: [-1,5,7,5,7,5], fingers: [0,1,3,1,4,1], pos: 3, barres: [{from:1,to:5,fret:5}] },
  ],
  'E7': [
    { frets: [0,2,0,1,0,0], fingers: [0,2,0,1,0,0], pos: 0 },
    { frets: [0,2,2,1,3,0], fingers: [0,2,3,1,4,0], pos: 0 },
  ],
  'F7': [
    { frets: [1,3,1,2,1,1], fingers: [1,3,1,2,1,1], pos: 0, barres: [{from:0,to:5,fret:1}] },
    { frets: [-1,-1,1,2,1,1], fingers: [0,0,1,2,1,1], pos: 0, barres: [{from:2,to:5,fret:1}] },
  ],
  'G7': [
    { frets: [3,2,0,0,0,1], fingers: [3,2,0,0,0,1], pos: 0 },
    { frets: [3,5,3,4,3,3], fingers: [1,3,1,2,1,1], pos: 1, barres: [{from:0,to:5,fret:3}] },
  ],
  'A7': [
    { frets: [-1,0,2,0,2,0], fingers: [0,0,1,0,2,0], pos: 0 },
    { frets: [5,7,5,6,5,5], fingers: [1,3,1,2,1,1], pos: 3, barres: [{from:0,to:5,fret:5}] },
  ],
  'B7': [
    { frets: [-1,2,1,2,0,2], fingers: [0,2,1,3,0,4], pos: 0 },
    { frets: [7,9,7,8,7,7], fingers: [1,3,1,2,1,1], pos: 5, barres: [{from:0,to:5,fret:7}] },
  ],

  // ─── Minor 7th ───
  'Cm7': [
    { frets: [-1,3,5,3,4,3], fingers: [0,1,3,1,2,1], pos: 1, barres: [{from:1,to:5,fret:3}] },
    { frets: [8,10,8,8,8,8], fingers: [1,3,1,1,1,1], pos: 6, barres: [{from:0,to:5,fret:8}] },
  ],
  'Dm7': [
    { frets: [-1,-1,0,2,1,1], fingers: [0,0,0,2,1,1], pos: 0, barres: [{from:4,to:5,fret:1}] },
    { frets: [-1,5,7,5,6,5], fingers: [0,1,3,1,2,1], pos: 3, barres: [{from:1,to:5,fret:5}] },
  ],
  'Em7': [
    { frets: [0,2,0,0,0,0], fingers: [0,1,0,0,0,0], pos: 0 },
    { frets: [0,2,2,0,3,0], fingers: [0,1,2,0,3,0], pos: 0 },
  ],
  'Fm7': [
    { frets: [1,3,1,1,1,1], fingers: [1,3,1,1,1,1], pos: 0, barres: [{from:0,to:5,fret:1}] },
  ],
  'Gm7': [
    { frets: [3,5,3,3,3,3], fingers: [1,3,1,1,1,1], pos: 1, barres: [{from:0,to:5,fret:3}] },
    { frets: [-1,-1,5,3,3,3], fingers: [0,0,3,1,1,1], pos: 1, barres: [{from:3,to:5,fret:3}] },
  ],
  'Am7': [
    { frets: [-1,0,2,0,1,0], fingers: [0,0,2,0,1,0], pos: 0 },
    { frets: [5,7,5,5,5,5], fingers: [1,3,1,1,1,1], pos: 3, barres: [{from:0,to:5,fret:5}] },
  ],
  'Bm7': [
    { frets: [-1,2,0,2,0,2], fingers: [0,1,0,2,0,3], pos: 0 },
    { frets: [-1,2,4,2,3,2], fingers: [0,1,3,1,2,1], pos: 0, barres: [{from:1,to:5,fret:2}] },
  ],

  // ─── Flat/Sharp variants ───
  'Bb':  [
    { frets: [-1,1,3,3,3,1], fingers: [0,1,3,3,3,1], pos: 0, barres: [{from:1,to:5,fret:1}] },
    { frets: [6,8,8,7,6,6], fingers: [1,3,4,2,1,1], pos: 4, barres: [{from:0,to:5,fret:6}] },
    { frets: [-1,1,3,3,3,-1], fingers: [0,1,2,3,4,0], pos: 0 },
  ],
  'Eb':  [
    { frets: [-1,-1,1,3,4,3], fingers: [0,0,1,2,4,3], pos: 0 },
    { frets: [-1,6,8,8,8,6], fingers: [0,1,3,3,3,1], pos: 4, barres: [{from:1,to:5,fret:6}] },
    { frets: [11,13,13,12,11,11], fingers: [1,3,4,2,1,1], pos: 9, barres: [{from:0,to:5,fret:11}] },
  ],
  'Ab':  [
    { frets: [4,6,6,5,4,4], fingers: [1,3,4,2,1,1], pos: 2, barres: [{from:0,to:5,fret:4}] },
    { frets: [-1,-1,6,5,4,4], fingers: [0,0,3,2,1,1], pos: 2, barres: [{from:4,to:5,fret:4}] },
  ],
  'Db':  [
    { frets: [-1,-1,3,1,2,1], fingers: [0,0,3,1,2,1], pos: 0, barres: [{from:3,to:5,fret:1}] },
    { frets: [-1,4,6,6,6,4], fingers: [0,1,3,3,3,1], pos: 2, barres: [{from:1,to:5,fret:4}] },
    { frets: [9,11,11,10,9,9], fingers: [1,3,4,2,1,1], pos: 7, barres: [{from:0,to:5,fret:9}] },
  ],
  'Gb':  [
    { frets: [2,4,4,3,2,2], fingers: [1,3,4,2,1,1], pos: 0, barres: [{from:0,to:5,fret:2}] },
    { frets: [-1,-1,4,3,2,2], fingers: [0,0,3,2,1,1], pos: 0, barres: [{from:4,to:5,fret:2}] },
  ],
  'C#':  [
    { frets: [-1,4,6,6,6,4], fingers: [0,1,3,3,3,1], pos: 2, barres: [{from:1,to:5,fret:4}] },
    { frets: [9,11,11,10,9,9], fingers: [1,3,4,2,1,1], pos: 7, barres: [{from:0,to:5,fret:9}] },
  ],
  'D#':  [
    { frets: [-1,-1,1,3,4,3], fingers: [0,0,1,2,4,3], pos: 0 },
    { frets: [-1,6,8,8,8,6], fingers: [0,1,3,3,3,1], pos: 4, barres: [{from:1,to:5,fret:6}] },
  ],
  'F#':  [
    { frets: [2,4,4,3,2,2], fingers: [1,3,4,2,1,1], pos: 0, barres: [{from:0,to:5,fret:2}] },
    { frets: [-1,-1,4,3,2,2], fingers: [0,0,3,2,1,1], pos: 0, barres: [{from:4,to:5,fret:2}] },
    { frets: [-1,9,11,11,11,9], fingers: [0,1,3,3,3,1], pos: 7, barres: [{from:1,to:5,fret:9}] },
  ],
  'G#':  [
    { frets: [4,6,6,5,4,4], fingers: [1,3,4,2,1,1], pos: 2, barres: [{from:0,to:5,fret:4}] },
    { frets: [-1,-1,6,5,4,4], fingers: [0,0,3,2,1,1], pos: 2, barres: [{from:4,to:5,fret:4}] },
  ],
  'A#':  [
    { frets: [-1,1,3,3,3,1], fingers: [0,1,3,3,3,1], pos: 0, barres: [{from:1,to:5,fret:1}] },
    { frets: [6,8,8,7,6,6], fingers: [1,3,4,2,1,1], pos: 4, barres: [{from:0,to:5,fret:6}] },
  ],

  // ─── Flat/Sharp minors ───
  'Bbm': [
    { frets: [-1,1,3,3,2,1], fingers: [0,1,3,4,2,1], pos: 0, barres: [{from:1,to:5,fret:1}] },
    { frets: [6,8,8,6,6,6], fingers: [1,3,4,1,1,1], pos: 4, barres: [{from:0,to:5,fret:6}] },
  ],
  'Ebm': [
    { frets: [-1,6,8,8,7,6], fingers: [0,1,3,4,2,1], pos: 4, barres: [{from:1,to:5,fret:6}] },
    { frets: [11,13,13,11,11,11], fingers: [1,3,4,1,1,1], pos: 9, barres: [{from:0,to:5,fret:11}] },
  ],
  'Abm': [
    { frets: [4,6,6,4,4,4], fingers: [1,3,4,1,1,1], pos: 2, barres: [{from:0,to:5,fret:4}] },
    { frets: [-1,-1,6,4,4,4], fingers: [0,0,3,1,1,1], pos: 2, barres: [{from:3,to:5,fret:4}] },
  ],
  'C#m': [
    { frets: [-1,4,6,6,5,4], fingers: [0,1,3,4,2,1], pos: 2, barres: [{from:1,to:5,fret:4}] },
    { frets: [9,11,11,9,9,9], fingers: [1,3,4,1,1,1], pos: 7, barres: [{from:0,to:5,fret:9}] },
  ],
  'D#m': [
    { frets: [-1,6,8,8,7,6], fingers: [0,1,3,4,2,1], pos: 4, barres: [{from:1,to:5,fret:6}] },
  ],
  'F#m': [
    { frets: [2,4,4,2,2,2], fingers: [1,3,4,1,1,1], pos: 0, barres: [{from:0,to:5,fret:2}] },
    { frets: [-1,-1,4,2,2,2], fingers: [0,0,3,1,1,1], pos: 0, barres: [{from:3,to:5,fret:2}] },
    { frets: [-1,9,11,11,10,9], fingers: [0,1,3,4,2,1], pos: 7, barres: [{from:1,to:5,fret:9}] },
  ],
  'G#m': [
    { frets: [4,6,6,4,4,4], fingers: [1,3,4,1,1,1], pos: 2, barres: [{from:0,to:5,fret:4}] },
    { frets: [-1,-1,6,4,4,4], fingers: [0,0,3,1,1,1], pos: 2, barres: [{from:3,to:5,fret:4}] },
  ],
  'A#m': [
    { frets: [-1,1,3,3,2,1], fingers: [0,1,3,4,2,1], pos: 0, barres: [{from:1,to:5,fret:1}] },
    { frets: [6,8,8,6,6,6], fingers: [1,3,4,1,1,1], pos: 4, barres: [{from:0,to:5,fret:6}] },
  ],

  // ─── 7th flat/sharp ───
  'Bb7': [
    { frets: [-1,1,3,1,3,1], fingers: [0,1,3,1,4,1], pos: 0, barres: [{from:1,to:5,fret:1}] },
    { frets: [6,8,6,7,6,6], fingers: [1,3,1,2,1,1], pos: 4, barres: [{from:0,to:5,fret:6}] },
  ],
  'Eb7': [
    { frets: [-1,-1,1,3,2,3], fingers: [0,0,1,3,2,4], pos: 0 },
    { frets: [-1,6,8,6,8,6], fingers: [0,1,3,1,4,1], pos: 4, barres: [{from:1,to:5,fret:6}] },
  ],
  'Ab7': [
    { frets: [4,6,4,5,4,4], fingers: [1,3,1,2,1,1], pos: 2, barres: [{from:0,to:5,fret:4}] },
  ],
  'F#7': [
    { frets: [2,4,2,3,2,2], fingers: [1,3,1,2,1,1], pos: 0, barres: [{from:0,to:5,fret:2}] },
    { frets: [-1,-1,4,3,2,0], fingers: [0,0,4,3,2,0], pos: 0 },
  ],
  'C#7': [
    { frets: [-1,4,6,4,6,4], fingers: [0,1,3,1,4,1], pos: 2, barres: [{from:1,to:5,fret:4}] },
  ],
  'G#7': [
    { frets: [4,6,4,5,4,4], fingers: [1,3,1,2,1,1], pos: 2, barres: [{from:0,to:5,fret:4}] },
  ],

  // ─── sus2 ───
  'Csus2': [
    { frets: [-1,3,0,0,1,3], fingers: [0,2,0,0,1,4], pos: 0 },
  ],
  'Dsus2': [
    { frets: [-1,-1,0,2,3,0], fingers: [0,0,0,1,2,0], pos: 0 },
  ],
  'Esus2': [
    { frets: [0,2,4,4,0,0], fingers: [0,1,3,4,0,0], pos: 0 },
  ],
  'Fsus2': [
    { frets: [-1,-1,3,0,1,1], fingers: [0,0,3,0,1,1], pos: 0, barres: [{from:4,to:5,fret:1}] },
  ],
  'Gsus2': [
    { frets: [3,0,0,0,3,3], fingers: [1,0,0,0,3,4], pos: 0 },
  ],
  'Asus2': [
    { frets: [-1,0,2,2,0,0], fingers: [0,0,1,2,0,0], pos: 0 },
  ],
  'Ebsus2': [
    { frets: [-1,-1,1,3,4,1], fingers: [0,0,1,3,4,1], pos: 0, barres: [{from:2,to:5,fret:1}] },
  ],

  // ─── sus4 ───
  'Csus4': [
    { frets: [-1,3,3,0,1,1], fingers: [0,3,4,0,1,1], pos: 0, barres: [{from:4,to:5,fret:1}] },
  ],
  'Dsus4': [
    { frets: [-1,-1,0,2,3,3], fingers: [0,0,0,1,2,3], pos: 0 },
  ],
  'Esus4': [
    { frets: [0,2,2,2,0,0], fingers: [0,1,2,3,0,0], pos: 0 },
  ],
  'Fsus4': [
    { frets: [1,1,3,3,1,1], fingers: [1,1,3,4,1,1], pos: 0, barres: [{from:0,to:5,fret:1}] },
  ],
  'Gsus4': [
    { frets: [3,3,0,0,1,3], fingers: [2,3,0,0,1,4], pos: 0 },
  ],
  'Asus4': [
    { frets: [-1,0,2,2,3,0], fingers: [0,0,1,2,3,0], pos: 0 },
  ],
  'Bsus4': [
    { frets: [-1,2,4,4,5,2], fingers: [0,1,2,3,4,1], pos: 0, barres: [{from:1,to:5,fret:2}] },
  ],
  'Bbsus4': [
    { frets: [-1,1,3,3,4,1], fingers: [0,1,2,3,4,1], pos: 0, barres: [{from:1,to:5,fret:1}] },
  ],
  'F#sus4': [
    { frets: [2,4,4,4,2,2], fingers: [1,3,3,4,1,1], pos: 0, barres: [{from:0,to:5,fret:2}] },
  ],

  // ─── sus (alias for sus4) ───
  'Csus': [
    { frets: [-1,3,3,0,1,1], fingers: [0,3,4,0,1,1], pos: 0, barres: [{from:4,to:5,fret:1}] },
  ],
  'Dsus': [
    { frets: [-1,-1,0,2,3,3], fingers: [0,0,0,1,2,3], pos: 0 },
  ],
  'Esus': [
    { frets: [0,2,2,2,0,0], fingers: [0,1,2,3,0,0], pos: 0 },
  ],
  'Asus': [
    { frets: [-1,0,2,2,3,0], fingers: [0,0,1,2,3,0], pos: 0 },
  ],

  // ─── dim ───
  'Cdim': [
    { frets: [-1,3,4,2,4,2], fingers: [0,2,3,1,4,1], pos: 0 },
  ],
  'Ddim': [
    { frets: [-1,-1,0,1,3,1], fingers: [0,0,0,1,3,2], pos: 0 },
  ],
  'Edim': [
    { frets: [0,1,2,0,2,0], fingers: [0,1,2,0,3,0], pos: 0 },
  ],
  'Fdim': [
    { frets: [-1,-1,3,1,0,1], fingers: [0,0,3,1,0,2], pos: 0 },
  ],
  'Gdim': [
    { frets: [3,4,5,3,5,3], fingers: [1,2,3,1,4,1], pos: 1, barres: [{from:0,to:5,fret:3}] },
  ],
  'Adim': [
    { frets: [-1,0,1,2,1,2], fingers: [0,0,1,3,2,4], pos: 0 },
  ],
  'Bdim': [
    { frets: [-1,2,3,4,3,-1], fingers: [0,1,2,4,3,0], pos: 0 },
  ],
  'C#dim': [
    { frets: [-1,4,5,3,5,3], fingers: [0,2,3,1,4,1], pos: 1 },
  ],
  'D#dim': [
    { frets: [-1,-1,1,2,1,2], fingers: [0,0,1,3,2,4], pos: 0 },
  ],
  'F#dim': [
    { frets: [-1,-1,4,2,1,2], fingers: [0,0,4,2,1,3], pos: 0 },
  ],
  'G#dim': [
    { frets: [4,5,6,4,6,4], fingers: [1,2,3,1,4,1], pos: 2, barres: [{from:0,to:5,fret:4}] },
  ],

  // ─── aug ───
  'Caug': [
    { frets: [-1,3,2,1,1,0], fingers: [0,4,3,2,1,0], pos: 0 },
  ],
  'Daug': [
    { frets: [-1,-1,0,3,3,2], fingers: [0,0,0,2,3,1], pos: 0 },
  ],
  'Eaug': [
    { frets: [0,3,2,1,1,0], fingers: [0,4,3,2,1,0], pos: 0 },
  ],
  'Faug': [
    { frets: [-1,-1,3,2,2,1], fingers: [0,0,4,2,3,1], pos: 0 },
  ],
  'Gaug': [
    { frets: [3,2,1,0,0,3], fingers: [3,2,1,0,0,4], pos: 0 },
  ],
  'Aaug': [
    { frets: [-1,0,3,2,2,1], fingers: [0,0,4,2,3,1], pos: 0 },
  ],

  // ─── add9 ───
  'Cadd9': [
    { frets: [-1,3,2,0,3,0], fingers: [0,2,1,0,3,0], pos: 0 },
  ],
  'Dadd9': [
    { frets: [-1,-1,0,2,3,0], fingers: [0,0,0,1,2,0], pos: 0 },
  ],
  'Eadd9': [
    { frets: [0,2,2,1,0,2], fingers: [0,2,3,1,0,4], pos: 0 },
  ],
  'Gadd9': [
    { frets: [3,0,0,0,0,3], fingers: [2,0,0,0,0,3], pos: 0 },
  ],
  'Aadd9': [
    { frets: [-1,0,2,4,2,0], fingers: [0,0,1,3,2,0], pos: 0 },
  ],
  'Fadd9': [
    { frets: [1,0,3,2,1,0], fingers: [1,0,4,3,2,0], pos: 0 },
  ],

  // ─── maj7 ───
  'Cmaj7': [
    { frets: [-1,3,2,0,0,0], fingers: [0,3,2,0,0,0], pos: 0 },
  ],
  'Dmaj7': [
    { frets: [-1,-1,0,2,2,2], fingers: [0,0,0,1,1,1], pos: 0, barres: [{from:3,to:5,fret:2}] },
  ],
  'Emaj7': [
    { frets: [0,2,1,1,0,0], fingers: [0,3,1,2,0,0], pos: 0 },
  ],
  'Fmaj7': [
    { frets: [-1,-1,3,2,1,0], fingers: [0,0,3,2,1,0], pos: 0 },
    { frets: [1,3,3,2,1,0], fingers: [1,3,4,2,1,0], pos: 0 },
  ],
  'Gmaj7': [
    { frets: [3,2,0,0,0,2], fingers: [3,2,0,0,0,1], pos: 0 },
  ],
  'Amaj7': [
    { frets: [-1,0,2,1,2,0], fingers: [0,0,2,1,3,0], pos: 0 },
  ],
  'Bmaj7': [
    { frets: [-1,2,4,3,4,2], fingers: [0,1,3,2,4,1], pos: 0, barres: [{from:1,to:5,fret:2}] },
  ],

  // ─── Minor 7th flat/sharp ───
  'F#m7': [
    { frets: [2,4,2,2,2,2], fingers: [1,3,1,1,1,1], pos: 0, barres: [{from:0,to:5,fret:2}] },
    { frets: [-1,-1,2,2,2,2], fingers: [0,0,1,1,1,1], pos: 0, barres: [{from:2,to:5,fret:2}] },
  ],
  'G#m7': [
    { frets: [4,6,4,4,4,4], fingers: [1,3,1,1,1,1], pos: 2, barres: [{from:0,to:5,fret:4}] },
  ],
  'C#m7': [
    { frets: [-1,4,6,4,5,4], fingers: [0,1,3,1,2,1], pos: 2, barres: [{from:1,to:5,fret:4}] },
  ],
  'Bbm7': [
    { frets: [-1,1,3,1,2,1], fingers: [0,1,3,1,2,1], pos: 0, barres: [{from:1,to:5,fret:1}] },
  ],
  'Ebm7': [
    { frets: [-1,6,8,6,7,6], fingers: [0,1,3,1,2,1], pos: 4, barres: [{from:1,to:5,fret:6}] },
  ],

  // ─── 6th ───
  'C6': [
    { frets: [-1,3,2,2,1,0], fingers: [0,4,2,3,1,0], pos: 0 },
    { frets: [-1,3,5,5,5,5], fingers: [0,1,3,3,3,3], pos: 3, barres: [{from:2,to:5,fret:5}] },
  ],
  'D6': [
    { frets: [-1,-1,0,2,0,2], fingers: [0,0,0,1,0,2], pos: 0 },
    { frets: [-1,5,4,4,3,-1], fingers: [0,4,2,3,1,0], pos: 1 },
  ],
  'E6': [
    { frets: [0,2,2,1,2,0], fingers: [0,2,3,1,4,0], pos: 0 },
  ],
  'F6': [
    { frets: [1,3,3,2,3,1], fingers: [1,3,3,2,4,1], pos: 0, barres: [{from:0,to:5,fret:1}] },
    { frets: [-1,-1,3,2,3,1], fingers: [0,0,3,1,4,1], pos: 0 },
  ],
  'G6': [
    { frets: [3,2,0,0,0,0], fingers: [3,2,0,0,0,0], pos: 0 },
    { frets: [3,2,0,0,3,0], fingers: [2,1,0,0,3,0], pos: 0 },
  ],
  'A6': [
    { frets: [-1,0,2,2,2,2], fingers: [0,0,1,1,1,1], pos: 0, barres: [{from:2,to:5,fret:2}] },
    { frets: [5,7,7,6,7,5], fingers: [1,3,3,2,4,1], pos: 3, barres: [{from:0,to:5,fret:5}] },
  ],
  'B6': [
    { frets: [-1,2,4,4,4,4], fingers: [0,1,3,3,3,3], pos: 0, barres: [{from:2,to:5,fret:4}] },
  ],
  'Eb6': [
    { frets: [-1,-1,1,3,1,3], fingers: [0,0,1,3,2,4], pos: 0 },
  ],

  // ─── 9th (dominant) ───
  'C9': [
    { frets: [-1,3,2,3,3,3], fingers: [0,2,1,3,3,3], pos: 1, barres: [{from:3,to:5,fret:3}] },
  ],
  'D9': [
    { frets: [-1,-1,0,2,1,2], fingers: [0,0,0,2,1,3], pos: 0 },
  ],
  'E9': [
    { frets: [0,2,0,1,0,2], fingers: [0,2,0,1,0,3], pos: 0 },
  ],
  'F9': [
    { frets: [1,0,1,0,1,0], fingers: [1,0,2,0,3,0], pos: 0 },
  ],
  'F#9': [
    { frets: [2,1,2,1,2,2], fingers: [2,1,3,1,4,4], pos: 0, barres: [{from:1,to:3,fret:1}] },
  ],
  'G9': [
    { frets: [3,2,3,2,3,3], fingers: [2,1,3,1,4,4], pos: 1, barres: [{from:1,to:3,fret:2}] },
  ],
  'A9': [
    { frets: [-1,0,2,4,2,3], fingers: [0,0,1,4,2,3], pos: 0 },
  ],
  'Eb9': [
    { frets: [-1,-1,1,0,2,1], fingers: [0,0,1,0,3,2], pos: 0 },
  ],

  // ─── Minor 6th ───
  'Am6': [
    { frets: [-1,0,2,2,1,2], fingers: [0,0,2,3,1,4], pos: 0 },
  ],
  'Cm6': [
    { frets: [-1,3,1,2,1,3], fingers: [0,3,1,2,1,4], pos: 0, barres: [{from:2,to:4,fret:1}] },
  ],
  'Dm6': [
    { frets: [-1,-1,0,2,0,1], fingers: [0,0,0,2,0,1], pos: 0 },
  ],
  'Em6': [
    { frets: [0,2,2,0,2,0], fingers: [0,1,2,0,3,0], pos: 0 },
  ],
  'Fm6': [
    { frets: [1,3,3,1,3,1], fingers: [1,3,4,1,4,1], pos: 0, barres: [{from:0,to:5,fret:1}] },
  ],
  'Gm6': [
    { frets: [3,5,5,3,5,3], fingers: [1,3,4,1,4,1], pos: 1, barres: [{from:0,to:5,fret:3}] },
  ],

  // ─── Power Chords (5ths) ── root-5th-octave on 3 strings ───
  'E5': [
    { frets: [-1,7,9,9,-1,-1], fingers: [0,1,3,4,0,0], pos: 7 },
    { frets: [0,2,2,-1,-1,-1], fingers: [0,1,3,0,0,0], pos: 0 },
  ],
  'F5': [
    { frets: [1,3,3,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 0 },
    { frets: [-1,8,10,10,-1,-1], fingers: [0,1,3,4,0,0], pos: 8 },
  ],
  'F#5': [
    { frets: [2,4,4,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 0 },
    { frets: [-1,9,11,11,-1,-1], fingers: [0,1,3,4,0,0], pos: 9 },
  ],
  'G5': [
    { frets: [3,5,5,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 3 },
    { frets: [-1,10,12,12,-1,-1], fingers: [0,1,3,4,0,0], pos: 10 },
  ],
  'G#5': [
    { frets: [4,6,6,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 4 },
  ],
  'A5': [
    { frets: [5,7,7,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 5 },
    { frets: [-1,0,2,2,-1,-1], fingers: [0,0,1,3,0,0], pos: 0 },
  ],
  'Bb5': [
    { frets: [-1,1,3,3,-1,-1], fingers: [0,1,3,4,0,0], pos: 0 },
    { frets: [6,8,8,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 6 },
  ],
  'B5': [
    { frets: [-1,2,4,4,-1,-1], fingers: [0,1,3,4,0,0], pos: 2 },
    { frets: [7,9,9,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 7 },
  ],
  'C5': [
    { frets: [-1,3,5,5,-1,-1], fingers: [0,1,3,4,0,0], pos: 3 },
    { frets: [8,10,10,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 8 },
  ],
  'C#5': [
    { frets: [-1,4,6,6,-1,-1], fingers: [0,1,3,4,0,0], pos: 4 },
    { frets: [9,11,11,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 9 },
  ],
  'D5': [
    { frets: [-1,5,7,7,-1,-1], fingers: [0,1,3,4,0,0], pos: 5 },
    { frets: [10,12,12,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 10 },
    { frets: [-1,-1,0,2,3,-1], fingers: [0,0,0,1,3,0], pos: 0 },
  ],
  'Eb5': [
    { frets: [-1,6,8,8,-1,-1], fingers: [0,1,3,4,0,0], pos: 6 },
    { frets: [11,13,13,-1,-1,-1], fingers: [1,3,4,0,0,0], pos: 11 },
  ],
};

// Aliases for enharmonic equivalents and common name variations
const enharmonic: Record<string, string> = {
  'C#': 'Db', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'D#',
  'F#': 'Gb', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#',
};

const keys = Object.keys(CHORD_DB);
for (const key of keys) {
  for (const [from, to] of Object.entries(enharmonic)) {
    if (key.startsWith(from)) {
      const altKey = to + key.slice(from.length);
      if (!CHORD_DB[altKey]) {
        CHORD_DB[altKey] = CHORD_DB[key];
      }
    }
  }
}

// Shorthand aliases: "0" = dim, "4" = sus4
const shorthandAliases: Record<string, string> = {
  'C0': 'Cdim', 'C#0': 'C#dim', 'D0': 'Ddim', 'D#0': 'D#dim',
  'E0': 'Edim', 'F0': 'Fdim', 'F#0': 'F#dim', 'G0': 'Gdim',
  'G#0': 'G#dim', 'A0': 'Adim', 'A#0': 'A#dim', 'B0': 'Bdim',
  'Bb0': 'Bbdim', 'Eb0': 'Ebdim', 'Ab0': 'Abdim', 'Db0': 'Dbdim', 'Gb0': 'Gbdim',
  'C4': 'Csus4', 'D4': 'Dsus4', 'E4': 'Esus4', 'F4': 'Fsus4',
  'F#4': 'F#sus4', 'G4': 'Gsus4', 'A4': 'Asus4', 'B4': 'Bsus4',
  'Bb4': 'Bbsus4', 'A#4': 'A#sus4',
  'Eb2': 'Ebsus2',
};
for (const [alias, target] of Object.entries(shorthandAliases)) {
  if (CHORD_DB[target] && !CHORD_DB[alias]) {
    CHORD_DB[alias] = CHORD_DB[target];
  }
}

// Cb enharmonic (not covered by standard sharp/flat pairs)
if (CHORD_DB['B7'] && !CHORD_DB['Cb7']) {
  CHORD_DB['Cb7'] = CHORD_DB['B7'];
}

export { CHORD_DB };
export type { Voicing };
