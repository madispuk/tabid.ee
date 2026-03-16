(function () {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const STRING_FREQS = [82.41, 110, 146.83, 196, 246.94, 329.63];
  const STRING_LABELS = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

  let rafId = 0;
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let micStream: MediaStream | null = null;
  let smoothedRot = 0;
  let smoothedCents = 0;
  let selectedString = -1;

  const FREQ_BUF_SIZE = 7;
  let freqHistory: number[] = [];
  let holdFrames = 0;
  const HOLD_MAX = 50;
  let lastNote = '';
  let lastNeedleColor = '#cba6f7';

  function getRms(buf: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return Math.sqrt(sum / buf.length);
  }

  function autoCorrelate(buf: Float32Array, sampleRate: number): number {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.015) return -1;

    let r1 = 0, r2 = SIZE - 1;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < 0.2) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < 0.2) { r2 = SIZE - i; break; }
    }

    const trimBuf = buf.slice(r1, r2);
    const trimLen = trimBuf.length;
    const c = new Array(trimLen).fill(0);
    for (let i = 0; i < trimLen; i++) {
      for (let j = 0; j < trimLen - i; j++) {
        c[i] += trimBuf[j] * trimBuf[j + i];
      }
    }

    let d = 0;
    while (d < trimLen - 1 && c[d] > c[d + 1]) d++;

    let maxval = -1, maxpos = -1;
    for (let i = d; i < trimLen; i++) {
      if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    }
    if (maxpos <= 0) return -1;

    let T0 = maxpos;
    const x1 = c[maxpos - 1], x2 = c[maxpos], x3 = c[maxpos + 1 < trimLen ? maxpos + 1 : maxpos];
    const denom = 2 * x2 - x1 - x3;
    if (denom !== 0) T0 = maxpos - (x3 - x1) / (2 * denom);
    return sampleRate / T0;
  }

  function medianFreq(buf: number[]): number {
    const sorted = [...buf].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  function freqToNote(freq: number): { name: string; octave: number } {
    const midi = Math.round(69 + 12 * Math.log2(freq / 440));
    const name = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return { name, octave };
  }

  function nearestString(freq: number): number {
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < STRING_FREQS.length; i++) {
      const dist = Math.abs(Math.log2(freq / STRING_FREQS[i]));
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    return best;
  }

  function setNeedleColor(color: string) {
    const needle = document.getElementById('tuner-needle');
    if (needle) needle.setAttribute('stroke', color);
  }

  function loop() {
    if (!analyser) return;
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);
    const rms = getRms(buf);
    const freq = autoCorrelate(buf, analyser.context.sampleRate);

    const noteEl = document.getElementById('tuner-note-display');
    const centsEl = document.getElementById('tuner-cents-display');
    const needle = document.getElementById('tuner-needle');

    if (freq > 0 && rms > 0.015) {
      freqHistory.push(freq);
      if (freqHistory.length > FREQ_BUF_SIZE) freqHistory.shift();
      holdFrames = HOLD_MAX;

      const stableFreq = freqHistory.length >= 3 ? medianFreq(freqHistory) : freq;
      const strIdx = selectedString === -1 ? nearestString(stableFreq) : selectedString;
      const targetFreq = STRING_FREQS[strIdx];
      const rawCents = 1200 * Math.log2(stableFreq / targetFreq);
      const cents = Math.max(-50, Math.min(50, rawCents));

      const alpha = Math.min(0.35, 0.15 + rms * 0.8);
      smoothedCents += (cents - smoothedCents) * alpha;
      smoothedRot += ((smoothedCents / 50) * 60 - smoothedRot) * 0.25;

      if (needle) needle.setAttribute('transform', `rotate(${smoothedRot.toFixed(2)}, 100, 100)`);

      const { name, octave } = freqToNote(stableFreq);
      const absCents = Math.abs(smoothedCents);
      const color = absCents < 8 ? '#a6e3a1' : absCents < 20 ? '#f9e2af' : '#f38ba8';

      lastNote = `${name}${octave}`;
      lastNeedleColor = color;
      if (noteEl) {
        noteEl.textContent = lastNote;
        noteEl.style.color = color;
      }
      if (centsEl) {
        const sign = smoothedCents >= 0 ? '+' : '';
        centsEl.textContent = `${sign}${Math.round(smoothedCents)} cents`;
      }
      setNeedleColor(color);
    } else {
      if (holdFrames > 0) {
        holdFrames--;
        smoothedRot += (0 - smoothedRot) * 0.015;
        smoothedCents += (0 - smoothedCents) * 0.015;
        if (needle) needle.setAttribute('transform', `rotate(${smoothedRot.toFixed(2)}, 100, 100)`);
        if (noteEl) {
          noteEl.textContent = lastNote;
          noteEl.style.color = lastNeedleColor;
        }
        if (centsEl) {
          const sign = smoothedCents >= 0 ? '+' : '';
          centsEl.textContent = `${sign}${Math.round(smoothedCents)} cents`;
        }
        setNeedleColor(lastNeedleColor);
      } else {
        smoothedRot += (0 - smoothedRot) * 0.05;
        smoothedCents += (0 - smoothedCents) * 0.05;
        if (needle) needle.setAttribute('transform', `rotate(${smoothedRot.toFixed(2)}, 100, 100)`);
        if (noteEl) {
          noteEl.textContent = '';
          noteEl.style.color = '';
        }
        if (centsEl) centsEl.textContent = '';
        setNeedleColor('#cba6f7');
        freqHistory = [];
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  async function startAudio() {
    try {
      // AudioContext must be created synchronously within the user gesture on iOS
      audioCtx = new AudioContext();
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      await audioCtx.resume();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      audioCtx.createMediaStreamSource(micStream).connect(analyser);
      rafId = requestAnimationFrame(loop);

      const startBtn = document.getElementById('tuner-start');
      if (startBtn) startBtn.style.display = 'none';
    } catch {
      const startBtn = document.getElementById('tuner-start');
      if (startBtn) startBtn.textContent = 'Mikrofon pole kättesaadav';
    }
  }

  // String selector buttons
  document.querySelectorAll<HTMLElement>('.tuner-str-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedString = parseInt(btn.dataset.str ?? '-1', 10);
      document.querySelectorAll<HTMLElement>('.tuner-str-btn').forEach((b) => {
        b.classList.remove('bg-ctp-mauve', 'text-ctp-crust');
        b.classList.add('bg-ctp-surface0', 'text-ctp-subtext0');
      });
      btn.classList.remove('bg-ctp-surface0', 'text-ctp-subtext0');
      btn.classList.add('bg-ctp-mauve', 'text-ctp-crust');
    });
  });

  document.getElementById('tuner-start')?.addEventListener('click', startAudio);
})();
