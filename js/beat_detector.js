// Rilevamento beat musicali e composizione playlist/loop fino a 5 minuti (300s) — Web Audio API

export async function analizzaAudioBeat(audioInput, fallbackOrOptions = 22) {
  const opts = typeof fallbackOrOptions === 'object' && fallbackOrOptions !== null
    ? fallbackOrOptions
    : { fallbackDuration: Number(fallbackOrOptions) || 22 };
  const fallbackDuration = Math.min(300, Math.max(8, Number(opts.fallbackDuration || 22)));
  const maxDurationCap = Math.min(300, Math.max(8, Number(opts.maxDuration || 300)));

  const files = Array.isArray(audioInput)
    ? audioInput.filter(Boolean)
    : (audioInput ? [audioInput] : []);

  if (!files.length) {
    return {
      audioBuffer: null,
      audioBuffers: [],
      trackDurations: [],
      totalSongDuration: 0,
      duration: fallbackDuration,
      beats: generaBeatRegolari(fallbackDuration, 0.52)
    };
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffers = [];
    const trackDurations = [];
    for (const file of files) {
      const arr = await file.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      audioBuffers.push(buf);
      trackDurations.push(buf.duration || 0);
    }

    const totalSongDuration = trackDurations.reduce((acc, d) => acc + d, 0);
    const analysisDuration = Math.min(maxDurationCap, Math.max(8, totalSongDuration));

    // Analizza i beat sull'intera sequenza di tracce (concatenata in memoria per analisi picchi)
    const sampleRate = audioBuffers[0].sampleRate || 44100;
    const totalSamples = Math.min(
      Math.ceil(analysisDuration * sampleRate),
      audioBuffers.reduce((s, b) => s + b.length, 0)
    );
    const mono = new Float32Array(Math.max(1, totalSamples));
    let writePos = 0;
    for (const buf of audioBuffers) {
      if (writePos >= mono.length) break;
      const ch = buf.getChannelData(0);
      const copyLen = Math.min(ch.length, mono.length - writePos);
      mono.set(ch.subarray(0, copyLen), writePos);
      writePos += copyLen;
    }

    const hop = Math.max(1, Math.floor(sampleRate * 0.05)); // 50ms
    const energies = [];
    for (let i = 0; i < mono.length; i += hop) {
      let sum = 0;
      const end = Math.min(i + hop, mono.length);
      for (let j = i; j < end; j++) {
        sum += mono[j] * mono[j];
      }
      energies.push(Math.sqrt(sum / Math.max(1, end - i)));
    }

    const beats = [0];
    let lastBeat = 0;
    const win = 8;
    for (let i = win; i < energies.length - 1; i++) {
      let avg = 0;
      for (let k = i - win; k < i; k++) avg += energies[k];
      avg /= win;
      const t = (i * hop) / sampleRate;
      if (t > analysisDuration) break;
      if (energies[i] > avg * 1.38 && energies[i] > energies[i - 1] && energies[i] >= energies[i + 1]) {
        if (t - lastBeat >= 0.42) {
          beats.push(Number(t.toFixed(2)));
          lastBeat = t;
        }
      }
    }

    // Estendi i beat fino a maxDurationCap (300s) se il video verrà ripetuto/esteso oltre totalSongDuration
    const finalBeats = beats.length >= 6 ? [...beats] : generaBeatRegolari(analysisDuration, 0.52);
    const baseSpan = Math.max(8, analysisDuration);
    if (baseSpan < maxDurationCap && finalBeats.length >= 2) {
      const baseCopy = [...finalBeats];
      let offset = baseSpan;
      while (offset < maxDurationCap) {
        for (const b of baseCopy) {
          const nb = Number((offset + b).toFixed(2));
          if (nb > finalBeats[finalBeats.length - 1] + 0.35 && nb <= maxDurationCap) {
            finalBeats.push(nb);
          }
        }
        offset += baseSpan;
      }
    }

    return {
      audioBuffer: audioBuffers[0] || null,
      audioBuffers,
      trackDurations,
      totalSongDuration,
      duration: analysisDuration,
      beats: finalBeats
    };
  } finally {
    if (ctx.state !== 'closed') {
      ctx.close().catch(() => {});
    }
  }
}

/**
 * Costruisce una traccia audio continua di esattamente `targetDurationSec` secondi:
 * - Se presenti 2 o più canzoni: le concatena nell'ordine esatto (1°, 2°, 3°...) con crossfade morbido.
 * - Se il video dura più dell'audio e `overflowMode === 'loop_cut'`: raddoppia/ripete le tracce fino alla fine del video.
 * - Taglia sempre esattamente a `targetDurationSec` con fade-in iniziale e fade-out finale elegante.
 */
export function buildMasterAudioBuffer(audioCtx, audioBuffers, targetDurationSec, overflowMode = 'loop_cut') {
  const valid = (audioBuffers || []).filter((b) => b && b.length > 0);
  if (!valid.length) return null;

  const sr = audioCtx.sampleRate || valid[0].sampleRate || 44100;
  const numCh = Math.max(1, Math.min(2, Math.max(...valid.map((b) => b.numberOfChannels || 1))));
  const totalSamples = Math.max(1, Math.ceil(targetDurationSec * sr));
  const outBuf = audioCtx.createBuffer(numCh, totalSamples, sr);

  const singleDuration = valid.reduce((s, b) => s + b.duration, 0);
  const shouldLoop = overflowMode === 'loop_cut' || valid.length === 1;
  const crossfadeSamples = Math.floor(0.35 * sr);

  let writePos = 0;
  let passIdx = 0;

  while (writePos < totalSamples) {
    if (passIdx > 0 && !shouldLoop) break;
    for (let tIdx = 0; tIdx < valid.length; tIdx++) {
      if (writePos >= totalSamples) break;
      const src = valid[tIdx];
      const srcLen = src.length;
      const srcSr = src.sampleRate || sr;
      const ratio = srcSr / sr;
      const resampledLen = Math.max(1, Math.round(srcLen / ratio));
      const overlap = (writePos > 0 && resampledLen > crossfadeSamples * 3) ? crossfadeSamples : 0;
      const startPos = Math.max(0, writePos - overlap);
      const writable = Math.min(resampledLen, totalSamples - startPos);

      for (let ch = 0; ch < numCh; ch++) {
        const srcData = src.getChannelData(Math.min(ch, src.numberOfChannels - 1));
        const outData = outBuf.getChannelData(ch);

        for (let i = 0; i < writable; i++) {
          const sIdx = Math.min(srcLen - 1, Math.floor(i * ratio));
          let sample = srcData[sIdx];

          // Crossfade morbido in ingresso sulla giunzione tra 1°, 2°, 3° o sul loop
          if (overlap > 0 && i < overlap) {
            const w = i / overlap;
            outData[startPos + i] = outData[startPos + i] * (1 - w) + sample * w;
          } else {
            outData[startPos + i] = sample;
          }
        }
      }
      writePos = startPos + writable;
    }
    passIdx++;
    if (singleDuration <= 0.1) break;
  }

  // Applica Fade-In iniziale (0.3s) e Fade-Out finale morbido (1.4s) al taglio di fine video
  const fadeInLen = Math.min(Math.floor(0.3 * sr), Math.floor(totalSamples * 0.15));
  const fadeOutLen = Math.min(Math.floor(1.4 * sr), Math.floor(totalSamples * 0.25));
  for (let ch = 0; ch < numCh; ch++) {
    const outData = outBuf.getChannelData(ch);
    for (let i = 0; i < fadeInLen; i++) {
      outData[i] *= i / fadeInLen;
    }
    const fadeStart = Math.max(0, totalSamples - fadeOutLen);
    for (let i = fadeStart; i < totalSamples; i++) {
      const rem = (totalSamples - i) / Math.max(1, fadeOutLen);
      outData[i] *= rem;
    }
  }

  return outBuf;
}

export function generaBeatRegolari(duration, step = 0.52) {
  const beats = [];
  for (let t = 0; t < duration; t += step) {
    beats.push(Number(t.toFixed(2)));
  }
  return beats;
}

/**
 * Estrae i picchi normalizzati per disegnare la "Linea del Suono" (Waveform) sulla Timeline Touch,
 * più i confini tra brani (1° Prima, 2° Seconda...) e gli istanti di battito musicale.
 */
export async function estraiWaveformPeaks(audioInput, numBins = 180, targetDurationSec = 0) {
  const bins = Math.max(24, Math.min(400, Number(numBins) || 180));
  const rawList = Array.isArray(audioInput) ? audioInput : (audioInput ? [audioInput] : []);
  const files = rawList
    .map((item) => (item && item.file ? item.file : item))
    .filter((f) => f && typeof f.arrayBuffer === 'function');

  if (!files.length) {
    const eff = Math.min(300, Math.max(8, Number(targetDurationSec) || 22));
    const peaks = [];
    for (let i = 0; i < bins; i++) {
      const ph = (i / bins) * eff;
      const groove = 0.32 + 0.45 * Math.pow(Math.abs(Math.sin(ph * 3.1)), 2) + 0.14 * Math.sin(i * 1.7);
      peaks.push(Math.min(0.95, Math.max(0.12, groove)));
    }
    return {
      hasAudio: false,
      peaks,
      beats: generaBeatRegolari(eff, 0.52),
      trackBoundaries: [],
      totalSongDuration: 0,
      effectiveDuration: eff
    };
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const decoded = [];
    let totalSongDuration = 0;
    const trackBoundaries = [];
    const ordinals = ['1° Prima', '2° Seconda', '3° Terza', '4° Quarta', '5° Quinta', '6° Sesta'];

    for (let idx = 0; idx < files.length; idx++) {
      const f = files[idx];
      const arr = await f.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      const dur = buf.duration || 0;
      trackBoundaries.push({
        label: ordinals[idx] || `${idx + 1}°`,
        name: f.name || `Traccia ${idx + 1}`,
        startSec: totalSongDuration,
        endSec: totalSongDuration + dur
      });
      totalSongDuration += dur;
      decoded.push(buf);
    }

    const eff = Math.min(300, Math.max(8, Number(targetDurationSec) || totalSongDuration || 22));
    const sr = decoded[0]?.sampleRate || 44100;
    const onePassSamples = Math.max(1, decoded.reduce((s, b) => s + b.length, 0));
    const concat = new Float32Array(onePassSamples);
    let pos = 0;
    for (const b of decoded) {
      const ch = b.getChannelData(0);
      concat.set(ch, pos);
      pos += ch.length;
    }

    const masterSamples = Math.max(1, Math.round(eff * sr));
    const peaks = new Array(bins).fill(0.12);
    let maxVal = 0.001;
    const step = Math.max(1, Math.floor(masterSamples / bins));

    for (let i = 0; i < bins; i++) {
      const s0 = Math.floor((i / bins) * masterSamples);
      const s1 = Math.min(masterSamples, s0 + step);
      const stride = Math.max(1, Math.floor((s1 - s0) / 48));
      let peak = 0;
      for (let k = s0; k < s1; k += stride) {
        const v = Math.abs(concat[k % onePassSamples]);
        if (v > peak) peak = v;
      }
      peaks[i] = peak;
      if (peak > maxVal) maxVal = peak;
    }
    for (let i = 0; i < bins; i++) {
      peaks[i] = Math.min(1.0, Math.max(0.08, peaks[i] / maxVal));
    }

    const analysis = await analizzaAudioBeat(files, { fallbackDuration: eff, maxDuration: 300 });
    return {
      hasAudio: true,
      peaks,
      beats: analysis.beats || generaBeatRegolari(eff, 0.52),
      trackBoundaries,
      totalSongDuration,
      effectiveDuration: eff
    };
  } finally {
    if (ctx.state !== 'closed') {
      ctx.close().catch(() => {});
    }
  }
}
