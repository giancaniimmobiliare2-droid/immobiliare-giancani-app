// Motore di montaggio video 100% On-Device (HTML5 Canvas + Web Audio + MediaRecorder)
// Supporta durata fino a 5 minuti (300s), Opzione Durata Canzone / Video, Multi-Canzone (1°, 2°, 3°...) / Loop & Taglio,
// e Logo Agenzia Scontornato di base con animazioni selezionabili (Bagliore, Luccichio Diamante, Beat Pulse, Aureola, Fisso).

import { analizzaAudioBeat, buildMasterAudioBuffer, generaBeatRegolari } from './beat_detector.js';

export const SPEED_LEVEL_MAP = {
  '-4': 0.60,
  '-3': 0.70,
  '-2': 0.80,
  '-1': 0.90,
  '0': 1.00,
  '1': 1.15,
  '2': 1.30,
  '3': 1.50,
  '4': 1.75,
  '5': 2.00,
  '6': 2.50,
  '7': 3.00
};

export const TRANSIZIONI_CATALOGO = [
  { id: 'zoom_in_fast', label: '⚡ Zoom Entrata Velocissimo', short: '⚡ Zoom In' },
  { id: 'zoom_out_fast', label: '💨 Zoom Uscita Velocissimo', short: '💨 Zoom Out' },
  { id: 'zoom_punch_combo', label: '💥 Zoom Uscita + Entrata Rapido', short: '💥 Zoom Combo' },
  { id: 'wipe_top', label: '⬇️ Linea da Sopra a Sotto', short: '⬇️ Sopra→Sotto' },
  { id: 'wipe_bottom', label: '⬆️ Linea da Sotto a Sopra', short: '⬆️ Sotto→Sopra' },
  { id: 'wipe_right_to_left', label: '⬅️ Linea da Destra a Sinistra', short: '⬅️ Dx→Sx' },
  { id: 'wipe_left_to_right', label: '➡️ Linea da Sinistra a Destra', short: '➡️ Sx→Dx' },
  { id: 'shape_star', label: '⭐ Transizione a Stella', short: '⭐ Stella' },
  { id: 'shape_circle', label: '⭕ Transizione a Cerchio', short: '⭕ Cerchio' },
  { id: 'mix_all', label: '🎲 Mix Automatico Tutte (Zoom/Linee/Forme)', short: '🎲 Mix' },
  { id: 'glow', label: '✨ Bagliore di Luce (Glow)', short: '✨ Glow' },
  { id: 'fade_color', label: '🎨 Sfumatura Colorata Oro', short: '🎨 Sfum. Oro' },
  { id: 'fade_black', label: '🌑 Sfumatura Nera', short: '🌑 Sfum. Nera' },
  { id: 'fade_white', label: '⬜ Sfumatura Bianca', short: '⬜ Sfum. Bianca' }
];

export const EFFETTI_CLIP_CATALOGO = [
  { id: 'none', label: '🎞️ Naturale', filter: '' },
  { id: 'warm_gold', label: '✨ Oro Caldo', filter: 'contrast(1.06) saturate(1.22) sepia(0.18) brightness(1.04)' },
  { id: 'hdr_bright', label: '☀️ HDR Luminoso', filter: 'brightness(1.12) contrast(1.12) saturate(1.18)' },
  { id: 'cinema_contrast', label: '🎬 Cinema Contrasto', filter: 'contrast(1.22) saturate(1.08) brightness(0.98)' },
  { id: 'bw_luxury', label: '🖤 B&N Luxury', filter: 'grayscale(1) contrast(1.24) brightness(1.05)' },
  { id: 'sunset_glow', label: '🌅 Tramonto', filter: 'sepia(0.24) saturate(1.32) hue-rotate(-8deg) brightness(1.04)' }
];

export const FONT_SCELTA_CATALOGO = [
  { id: 'montserrat', label: 'Montserrat Modern', css: '800 {s}px "Montserrat", "Segoe UI", sans-serif' },
  { id: 'cinzel', label: 'Cinzel Luxury Serif', css: '700 {s}px "Cinzel", Georgia, serif' },
  { id: 'playfair', label: 'Playfair Editorial', css: 'italic 800 {s}px "Playfair Display", Georgia, serif' },
  { id: 'bebas', label: 'Bebas Neue Impact', css: '900 {s}px "Bebas Neue", Impact, "Arial Black", sans-serif' },
  { id: 'outfit', label: 'Outfit Geometric', css: '800 {s}px "Outfit", "Trebuchet MS", sans-serif' },
  { id: 'inter', label: 'Inter Clean TV', css: '800 {s}px "Inter", "Segoe UI", Roboto, sans-serif' }
];

export const SUBTITLE_STYLES_CATALOGO = [
  { id: 'karaoke_gold', label: '✨ Karaoke Glow Oro' },
  { id: 'cinema_box', label: '🎬 Box Cinema 60% Scurito' },
  { id: 'pop_dynamic', label: '💥 Pop Dinamico Bordo Alto' },
  { id: 'minimal_clean', label: '🤍 Minimal Pulito Luxury' }
];

export function resolveFontTplById(fontId) {
  const f = FONT_SCELTA_CATALOGO.find((x) => x.id === fontId);
  return f ? f.css : FONT_SCELTA_CATALOGO[0].css;
}

export function resolveEffectCssFilter(effectId) {
  const found = EFFETTI_CLIP_CATALOGO.find((e) => e.id === effectId);
  return found ? found.filter : '';
}

export function calcolaDurataClipCentrale(rawDurationSec, cfg = {}) {
  const trimStart = Math.max(0, Number(cfg.trimStart || 0));
  const trimEnd = Math.max(0, Number(cfg.trimEnd || 0));
  const span = Math.max(2, (Number(rawDurationSec || 10) - trimStart - trimEnd));
  const mult = SPEED_LEVEL_MAP[String(cfg.speedLevel ?? 0)] || 1.0;
  let corrSaving = 0;
  if (cfg.corridorEnabled) {
    const cs = Math.max(trimStart, Number(cfg.corridorStart || 0));
    const ce = Math.min(Number(rawDurationSec || 10) - trimEnd, Number(cfg.corridorEnd || 0));
    if (ce > cs) {
      const cSpd = Number(cfg.corridorSpeed || 2.0);
      corrSaving = ((ce - cs) / mult) * (1 - 1 / Math.max(1.1, cSpd));
    }
  }
  return Math.max(2.0, span / mult - corrSaving);
}

const PALETTE_COLORI = [
  '#f5c542', '#38bdf8', '#10b981', '#fb7185', '#a78bfa', '#fb923c', '#ffffff'
];
const FONT_STILI = [
  '800 {s}px "Segoe UI", Roboto, sans-serif',
  '900 {s}px Arial, sans-serif',
  'italic 800 {s}px Georgia, serif',
  '800 {s}px "Trebuchet MS", sans-serif'
];
const EMOJI_SET = ['🏡', '✨', '💛', '🔑', '🌟', '👨‍👩‍👧‍👦', '🌅', '💎'];

let _shimmerOffscreen = null;
let _shimmerCtx = null;

function getOffscreen(w, h) {
  const tw = Math.max(4, Math.ceil(w));
  const th = Math.max(4, Math.ceil(h));
  if (!_shimmerOffscreen) {
    _shimmerOffscreen = document.createElement('canvas');
    _shimmerCtx = _shimmerOffscreen.getContext('2d');
  }
  if (_shimmerOffscreen.width !== tw || _shimmerOffscreen.height !== th) {
    _shimmerOffscreen.width = tw;
    _shimmerOffscreen.height = th;
  }
  return { canvas: _shimmerOffscreen, octx: _shimmerCtx };
}

export function formatGiancaniMq(testo) {
  if (!testo) return '';
  return String(testo)
    .replace(/\b(\d+(?:[.,]\d+)?)\s*(?:m\s*²|m2|mq\.?|MQ\.?)\b/gi, '$1 metri quadri')
    .replace(/\b(?:mq\.?|m²|m2)\b/gi, 'metri quadri');
}

export function caricaImmagine(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function preparaMediaClip(item) {
  return new Promise((resolve, reject) => {
    const isFile = (item instanceof Blob) || (item && typeof item === 'object' && 'size' in item && !item.url);
    const url = isFile ? URL.createObjectURL(item) : item.url;
    const isVideo = isFile
      ? (item.type || '').startsWith('video/')
      : (item.tipo === 'video' || item.type === 'video' || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url || ''));

    if (isVideo) {
      const vid = document.createElement('video');
      if (!isFile) vid.crossOrigin = 'anonymous';
      vid.src = url;
      vid.muted = true;
      vid.playsInline = true;
      vid.loop = true;
      vid.preload = 'auto';
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        const d = Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 5.0;
        resolve({ type: 'video', el: vid, url, revokeAfter: isFile, durationSec: Math.min(45, Math.max(2, d)) });
      };
      vid.onloadeddata = finish;
      vid.onloadedmetadata = finish;
      vid.onerror = (e) => { if (!done) { done = true; reject(e); } };
      setTimeout(() => { if (!done) finish(); }, 4500);
    } else {
      const img = new Image();
      if (!isFile) img.crossOrigin = 'anonymous';
      img.onload = () => resolve({ type: 'image', el: img, url, revokeAfter: isFile, durationSec: 4.0 });
      img.onerror = () => {
        // Se URL remoto blocca CORS, carica un fallback locale per non bloccare MediaRecorder/Canvas
        if (!isFile && url !== './assets/icon-512.png') {
          const fb = new Image();
          fb.onload = () => resolve({ type: 'image', el: fb, url: './assets/icon-512.png', revokeAfter: false, durationSec: 4.0 });
          fb.onerror = reject;
          fb.src = './assets/icon-512.png';
        } else {
          reject(new Error('Immagine non caricabile'));
        }
      };
      img.src = url;
    }
  });
}

function segmentaSottotitoli(testoCanzone, durationBody) {
  const righe = formatGiancaniMq(testoCanzone || '')
    .split(/\n+/)
    .map((r) => r.trim())
    .filter((r) => r && !r.startsWith('—'));
  if (!righe.length) return [];
  const step = durationBody / righe.length;
  return righe.map((text, idx) => ({
    text,
    start: idx * step,
    end: (idx + 1) * step,
    color: PALETTE_COLORI[idx % PALETTE_COLORI.length],
    fontTpl: FONT_STILI[idx % FONT_STILI.length],
    emoji: EMOJI_SET[idx % EMOJI_SET.length]
  }));
}

function disegnaStellaDiamante(ctx, cx, cy, r, angle, alpha, tint = '#ffffff') {
  if (alpha <= 0.02 || r <= 0.5) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

  // Croce a 4 punte affilate + bagliore diamante
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.15);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.28, tint);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  for (let arm = 0; arm < 2; arm++) {
    ctx.save();
    if (arm === 1) ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.14, -r * 0.14, r * 0.35, 0);
    ctx.quadraticCurveTo(r * 0.14, r * 0.14, 0, r);
    ctx.quadraticCurveTo(-r * 0.14, r * 0.14, -r * 0.35, 0);
    ctx.quadraticCurveTo(-r * 0.14, -r * 0.14, 0, -r);
    ctx.fill();
    ctx.restore();
  }

  // Piccoli raggi diagonali
  ctx.strokeStyle = `rgba(224, 247, 255, ${Math.min(1, alpha * 0.85)})`;
  ctx.lineWidth = Math.max(1, r * 0.09);
  for (const ang of [Math.PI / 4, -Math.PI / 4]) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * -r * 0.55, Math.sin(ang) * -r * 0.55);
    ctx.lineTo(Math.cos(ang) * r * 0.55, Math.sin(ang) * r * 0.55);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Disegna il logo dell'agenzia RIGOROSAMENTE SCONTORNATO (zero targa/rettangolo opaco dietro)
 * applicando l'animazione scelta dall'utente.
 */
export function disegnaLogoAnimato(ctx, logoImg, x, y, w, h, elapsedSec, animType = 'shimmer_glow', options = {}) {
  if (!logoImg || !w || !h) return;
  const { beatIntensity = 0, opacity = 0.96 } = options;

  let scale = 1.0;
  if (animType === 'pulse_beat') {
    const wave = 0.5 + 0.5 * Math.sin(elapsedSec * Math.PI * 2.2);
    scale = 1.0 + Math.max(beatIntensity, wave * 0.5) * 0.07;
  } else if (animType === 'golden_halo') {
    scale = 1.0 + Math.sin(elapsedSec * 2.4) * 0.025;
  }

  const dw = w * scale;
  const dh = h * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Aureola dorata dietro alla sagoma scontornata
  if (animType === 'golden_halo' || animType === 'pulse_beat') {
    const pulse = 0.55 + 0.45 * Math.sin(elapsedSec * 3.1);
    const rMax = Math.max(dw, dh) * (animType === 'pulse_beat' ? 0.65 + beatIntensity * 0.15 : 0.72);
    const halo = ctx.createRadialGradient(
      dx + dw / 2, dy + dh / 2, dw * 0.1,
      dx + dw / 2, dy + dh / 2, rMax
    );
    halo.addColorStop(0, `rgba(255, 224, 120, ${0.42 * pulse})`);
    halo.addColorStop(0.55, `rgba(245, 197, 66, ${0.18 * pulse})`);
    halo.addColorStop(1, 'rgba(245, 197, 66, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.ellipse(dx + dw / 2, dy + dh / 2, rMax, rMax * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (animType === 'shimmer_glow') {
    // Disegna su offscreen canvas con source-atop in modo che il fascio di luce passi SOLO sopra al logo scontornato
    const pad = 16;
    const { canvas: off, octx } = getOffscreen(dw + pad * 2, dh + pad * 2);
    octx.clearRect(0, 0, off.width, off.height);
    octx.save();
    octx.globalCompositeOperation = 'source-over';
    octx.drawImage(logoImg, pad, pad, dw, dh);

    // Ciclo luce ogni 2.3s: passa diagonalmente sopra le lettere e il simbolo
    const cycle = (elapsedSec % 2.3) / 2.3;
    if (cycle < 0.75) {
      const t = cycle / 0.75;
      const beamW = Math.max(36, dw * 0.34);
      const bx = -beamW + t * (off.width + beamW * 2);
      octx.globalCompositeOperation = 'source-atop';
      const shine = octx.createLinearGradient(bx - beamW * 0.5, 0, bx + beamW * 0.5, off.height);
      shine.addColorStop(0, 'rgba(255, 255, 255, 0)');
      shine.addColorStop(0.35, 'rgba(255, 248, 205, 0.45)');
      shine.addColorStop(0.5, 'rgba(255, 255, 255, 0.92)');
      shine.addColorStop(0.65, 'rgba(255, 224, 110, 0.50)');
      shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
      octx.fillStyle = shine;
      octx.fillRect(0, 0, off.width, off.height);
    }
    octx.restore();

    ctx.shadowColor = 'rgba(255, 225, 130, 0.55)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(off, dx - pad, dy - pad);
  } else {
    ctx.shadowColor = animType === 'pulse_beat'
      ? `rgba(245, 197, 66, ${0.45 + beatIntensity * 0.45})`
      : 'rgba(255, 255, 255, 0.38)';
    ctx.shadowBlur = animType === 'pulse_beat' ? 18 + beatIntensity * 14 : 10;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(logoImg, dx, dy, dw, dh);
  }

  // Scintille tipo diamante sopra al logo scontornato
  if (animType === 'diamond_sparkle') {
    const glintSpots = [
      { rx: 0.14, ry: 0.30, ph: 0.0, tint: '#ffffff' },
      { rx: 0.36, ry: 0.22, ph: 0.85, tint: '#fef08a' },
      { rx: 0.56, ry: 0.34, ph: 1.7, tint: '#bae6fd' },
      { rx: 0.77, ry: 0.20, ph: 2.3, tint: '#ffffff' },
      { rx: 0.91, ry: 0.38, ph: 3.1, tint: '#fde047' },
      { rx: 0.48, ry: 0.78, ph: 1.15, tint: '#e0f2fe' },
      { rx: 0.70, ry: 0.76, ph: 2.75, tint: '#ffffff' }
    ];
    const maxR = Math.max(10, Math.min(28, dw * 0.095));
    for (const sp of glintSpots) {
      const wave = Math.max(0, Math.sin(elapsedSec * 3.4 + sp.ph));
      const sparkleA = Math.pow(wave, 2.2);
      if (sparkleA > 0.08) {
        const sr = maxR * (0.45 + 0.65 * sparkleA);
        disegnaStellaDiamante(
          ctx,
          dx + dw * sp.rx,
          dy + dh * sp.ry,
          sr,
          elapsedSec * 0.9 + sp.ph,
          sparkleA,
          sp.tint
        );
      }
    }
  }

  ctx.restore();
}

export function avviaAnteprimaLogoCanvas(canvasEl, getLogoImg, getAnimType) {
  if (!canvasEl) return () => {};
  const ctx = canvasEl.getContext('2d');
  let rafId = 0;
  let stopped = false;
  const t0 = performance.now();

  function frame() {
    if (stopped) return;
    const elapsed = (performance.now() - t0) / 1000;
    const w = canvasEl.width;
    const h = canvasEl.height;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.5, '#fef3c7');
    grad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Sottile griglia decorativa chiara sullo sfondo per evidenziare che il logo è scontornato
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.14)';
    ctx.lineWidth = 1;
    for (let gx = 20; gx < w; gx += 28) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }

    const img = getLogoImg();
    const anim = getAnimType();
    if (img && img.naturalWidth) {
      const pad = 16;
      const sc = Math.min((w - pad * 2) / img.naturalWidth, (h - pad * 2) / img.naturalHeight);
      const lw = img.naturalWidth * sc;
      const lh = img.naturalHeight * sc;
      const beatSim = Math.pow(Math.max(0, Math.sin(elapsed * Math.PI * 2)), 4);
      disegnaLogoAnimato(ctx, img, (w - lw) / 2, (h - lh) / 2, lw, lh, elapsed, anim, {
        beatIntensity: beatSim,
        opacity: 0.98
      });
    }
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
  };
}

function disegnaSmartFrame(ctx, media, w, h, progress, antiShake, opts = {}) {
  if (!media || !media.el) return;
  const el = media.el;
  const mw = media.type === 'video' ? el.videoWidth || w : el.naturalWidth || w;
  const mh = media.type === 'video' ? el.videoHeight || h : el.naturalHeight || h;
  if (!mw || !mh) return;

  const effProg = opts.rewind ? Math.max(0, Math.min(1, 1 - (progress || 0))) : Math.max(0, Math.min(1, progress || 0));
  const extraZoom = Math.max(0.25, Number(opts.zoomScale || 1.0));
  const filterCss = resolveEffectCssFilter(opts.effectFilter || 'none');

  // Sfondo sfocato riempitivo
  ctx.save();
  ctx.filter = filterCss ? `blur(24px) brightness(0.52) ${filterCss}` : 'blur(24px) brightness(0.55)';
  const scaleBg = Math.max(w / mw, h / mh) * 1.08;
  const bw = mw * scaleBg;
  const bh = mh * scaleBg;
  ctx.drawImage(el, (w - bw) / 2, (h - bh) / 2, bw, bh);
  ctx.restore();

  // Soggetto principale con Ken Burns morbido + filtro effetto + eventuale zoom transizione
  ctx.save();
  if (filterCss) ctx.filter = filterCss;
  const scaleFg = Math.min(w / mw, h / mh);
  const baseZoom = (antiShake ? 1.04 : 1.0) + (media.type === 'image' ? effProg * 0.08 : 0.02);
  const zoom = baseZoom * extraZoom;
  const fw = mw * scaleFg * zoom;
  const fh = mh * scaleFg * zoom;
  const dx = (w - fw) / 2;
  const dy = (h - fh) / 2;
  ctx.drawImage(el, dx, dy, fw, fh);
  ctx.restore();
}

function disegnaEffettoTransizione(ctx, w, h, kind, localT) {
  if (localT > 0.35) return;
  const alpha = Math.max(0, 1 - localT / 0.35);
  ctx.save();
  if (kind === 'glow') {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.8);
    grad.addColorStop(0, `rgba(255, 240, 180, ${alpha * 0.85})`);
    grad.addColorStop(1, 'rgba(245, 197, 66, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (kind === 'fade_black') {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.9})`;
    ctx.fillRect(0, 0, w, h);
  } else if (kind === 'fade_white') {
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
    ctx.fillRect(0, 0, w, h);
  } else if (kind === 'fade_color') {
    ctx.fillStyle = `rgba(245, 197, 66, ${alpha * 0.55})`;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function creaTracciatoStella(ctx, cx, cy, outerR, innerR, rotRad = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const ang = rotRad + (i * Math.PI) / 5;
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

const MIX_TRANSITIONS = [
  'zoom_in_fast', 'wipe_top', 'shape_circle', 'wipe_right_to_left',
  'zoom_out_fast', 'shape_star', 'wipe_left_to_right', 'wipe_bottom', 'zoom_punch_combo'
];

function disegnaScenaConTransizione(ctx, prevMedia, currMedia, w, h, kind, localT, progress, antiShake, clipOpts = {}, prevOpts = {}, clipIdx = 0) {
  const transKind = kind === 'mix_all'
    ? MIX_TRANSITIONS[Math.abs(clipIdx) % MIX_TRANSITIONS.length]
    : (kind || 'glow');
  const transDur = (transKind.startsWith('zoom_')) ? 0.34 : 0.46;
  const p = Math.min(1, Math.max(0, localT / transDur));
  const ease = 1 - Math.pow(1 - p, 3);

  if (!prevMedia || prevMedia === currMedia || p >= 1) {
    disegnaSmartFrame(ctx, currMedia, w, h, progress, antiShake, clipOpts);
    return;
  }

  if (transKind === 'zoom_in_fast') {
    disegnaSmartFrame(ctx, prevMedia, w, h, 1, antiShake, { ...prevOpts, zoomScale: 1 + ease * 0.45 });
    ctx.save();
    ctx.globalAlpha = Math.min(1, p * 1.45);
    const fastZoom = 2.45 - ease * 1.45;
    disegnaSmartFrame(ctx, currMedia, w, h, progress, antiShake, { ...clipOpts, zoomScale: fastZoom });
    ctx.restore();
    if (p < 0.45) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 245, 210, ${(1 - p / 0.45) * 0.32})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
    return;
  }

  if (transKind === 'zoom_out_fast') {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - ease * 0.9);
    disegnaSmartFrame(ctx, prevMedia, w, h, 1, antiShake, { ...prevOpts, zoomScale: 1.0 - ease * 0.58 });
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = Math.min(1, p * 1.35);
    const outScale = 1.75 - ease * 0.75;
    disegnaSmartFrame(ctx, currMedia, w, h, progress, antiShake, { ...clipOpts, zoomScale: outScale });
    ctx.restore();
    return;
  }

  if (transKind === 'zoom_punch_combo') {
    if (p < 0.45) {
      const subP = p / 0.45;
      disegnaSmartFrame(ctx, prevMedia, w, h, 1, antiShake, { ...prevOpts, zoomScale: 1.0 - subP * 0.52 });
      ctx.save();
      ctx.fillStyle = `rgba(245, 197, 66, ${subP * 0.35})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else {
      const subP = (p - 0.45) / 0.55;
      const subEase = 1 - Math.pow(1 - subP, 3);
      disegnaSmartFrame(ctx, currMedia, w, h, progress, antiShake, { ...clipOpts, zoomScale: 2.30 - subEase * 1.30 });
    }
    return;
  }

  if (transKind === 'wipe_top' || transKind === 'wipe_bottom' || transKind === 'wipe_right_to_left' || transKind === 'wipe_left_to_right') {
    disegnaSmartFrame(ctx, prevMedia, w, h, 1, antiShake, prevOpts);
    ctx.save();
    ctx.beginPath();
    if (transKind === 'wipe_top') {
      ctx.rect(0, 0, w, h * ease);
    } else if (transKind === 'wipe_bottom') {
      const y = h * (1 - ease);
      ctx.rect(0, y, w, h * ease);
    } else if (transKind === 'wipe_right_to_left') {
      const x = w * (1 - ease);
      ctx.rect(x, 0, w * ease, h);
    } else {
      ctx.rect(0, 0, w * ease, h);
    }
    ctx.clip();
    disegnaSmartFrame(ctx, currMedia, w, h, progress, antiShake, clipOpts);
    ctx.restore();

    // Linea dorata luminosa lungo il taglio della transizione a linea
    ctx.save();
    ctx.strokeStyle = '#f5c542';
    ctx.shadowColor = '#f5c542';
    ctx.shadowBlur = 16;
    ctx.lineWidth = Math.max(4, Math.round(Math.min(w, h) * 0.006));
    ctx.beginPath();
    if (transKind === 'wipe_top') {
      const yy = h * ease; ctx.moveTo(0, yy); ctx.lineTo(w, yy);
    } else if (transKind === 'wipe_bottom') {
      const yy = h * (1 - ease); ctx.moveTo(0, yy); ctx.lineTo(w, yy);
    } else if (transKind === 'wipe_right_to_left') {
      const xx = w * (1 - ease); ctx.moveTo(xx, 0); ctx.lineTo(xx, h);
    } else {
      const xx = w * ease; ctx.moveTo(xx, 0); ctx.lineTo(xx, h);
    }
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (transKind === 'shape_star') {
    disegnaSmartFrame(ctx, prevMedia, w, h, 1, antiShake, prevOpts);
    const maxR = Math.hypot(w, h) * 1.18;
    const outerR = Math.max(6, maxR * ease);
    const innerR = outerR * 0.44;
    const rot = -Math.PI / 2 + (1 - ease) * 0.45;
    ctx.save();
    creaTracciatoStella(ctx, w / 2, h / 2, outerR, innerR, rot);
    ctx.clip();
    disegnaSmartFrame(ctx, currMedia, w, h, progress, antiShake, clipOpts);
    ctx.restore();

    ctx.save();
    creaTracciatoStella(ctx, w / 2, h / 2, outerR, innerR, rot);
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.9)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (transKind === 'shape_circle') {
    disegnaSmartFrame(ctx, prevMedia, w, h, 1, antiShake, prevOpts);
    const maxR = Math.hypot(w, h) * 0.62;
    const r = Math.max(6, maxR * ease);
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.clip();
    disegnaSmartFrame(ctx, currMedia, w, h, progress, antiShake, clipOpts);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.9)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    return;
  }

  disegnaSmartFrame(ctx, currMedia, w, h, progress, antiShake, clipOpts);
  disegnaEffettoTransizione(ctx, w, h, transKind, localT);
}

function disegnaSottotitoloCinetico(ctx, w, h, sub, t) {
  if (!sub || !sub.text) return;
  const rel = Math.max(0, t - (sub.start || 0));
  const styleId = sub.subtitleStyle || 'karaoke_gold';
  const bounce = styleId === 'pop_dynamic' ? Math.sin(Math.min(1, rel * 6) * Math.PI) * 9 : Math.sin(Math.min(1, rel * 5) * Math.PI) * 5;
  const fontSize = Math.round(w * (sub.calloutOnly ? 0.038 : 0.044));
  const fontTpl = sub.fontTpl || '800 {s}px "Segoe UI", Roboto, sans-serif';

  ctx.save();
  ctx.font = fontTpl.replace('{s}', fontSize);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cleanText = formatGiancaniMq(sub.text);
  const maxW = w * 0.86;
  const words = cleanText.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const trimmedLines = lines.slice(0, 4);

  // Callout in alto se presente sulla clip
  if (sub.calloutText) {
    const cTxt = formatGiancaniMq(sub.calloutText);
    const cfs = Math.round(w * 0.036);
    ctx.font = fontTpl.replace('{s}', cfs);
    const ctw = Math.min(w * 0.88, ctx.measureText(cTxt).width + 28);
    ctx.fillStyle = 'rgba(11, 17, 32, 0.82)';
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.88)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect((w - ctw) / 2, h * 0.11, ctw, cfs * 1.7, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f5c542';
    ctx.fillText(cTxt, w / 2, h * 0.11 + cfs * 0.85, w * 0.84);
  }

  const baseY = (styleId === 'cinema_box' ? h * 0.79 : h * 0.77) - bounce;
  const lineH = fontSize * 1.24;

  // Box cinema semi-trasparente al 60% dietro al testo Colonna F
  if (styleId === 'cinema_box') {
    const boxH = trimmedLines.length * lineH + 26;
    const boxW = w * 0.90;
    const bx = (w - boxW) / 2;
    const by = baseY - boxH / 2;
    ctx.fillStyle = 'rgba(11, 17, 32, 0.62)';
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();
  }

  // Emoji animata sopra al testo
  if (sub.emoji && styleId !== 'minimal_clean') {
    const emojiX = w / 2 + Math.sin(t * 5) * 16;
    const emojiY = baseY - (trimmedLines.length * lineH) / 2 - fontSize * 0.9;
    ctx.font = `${Math.round(fontSize * 1.15)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.fillText(sub.emoji, emojiX, emojiY);
  }

  ctx.font = fontTpl.replace('{s}', fontSize);
  trimmedLines.forEach((l, i) => {
    const y = baseY + (i - (trimmedLines.length - 1) / 2) * lineH;
    ctx.lineWidth = Math.max(4, fontSize * 0.16);
    ctx.strokeStyle = styleId === 'pop_dynamic' ? '#0b1120' : 'rgba(11, 17, 32, 0.92)';
    ctx.strokeText(l, w / 2, y);
    if (styleId === 'karaoke_gold') {
      ctx.shadowColor = 'rgba(245, 197, 66, 0.65)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = sub.color || '#f5c542';
    } else if (styleId === 'cinema_box') {
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = sub.color || '#ffffff';
    }
    ctx.fillText(l, w / 2, y);
    ctx.shadowBlur = 0;
  });
  ctx.restore();
}

function disegnaOutroAnimato(ctx, w, h, logoImg, scheda, outroProg, elapsedSec, opzioni) {
  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#090e1a');
  grad.addColorStop(0.5, '#172554');
  grad.addColorStop(1, '#0b1120');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Cornice dorata luxury sottile
  const padF = w * 0.04;
  ctx.strokeStyle = 'rgba(245, 197, 66, 0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(padF, padF, w - padF * 2, h - padF * 2, 24);
  ctx.stroke();

  // Logo SCONTORNATO GRANDE animato senza nessun riquadro bianco/giallo dietro
  const enterScale = 0.86 + Math.min(1, outroProg * 2.2) * 0.14;
  let logoBottomY = h * 0.36;
  if (logoImg && opzioni.mostraLogo !== false) {
    const maxW = w * 0.72 * enterScale;
    const maxH = h * 0.24 * enterScale;
    const sc = Math.min(maxW / logoImg.width, maxH / logoImg.height);
    const lw = logoImg.width * sc;
    const lh = logoImg.height * sc;
    const lx = (w - lw) / 2;
    const ly = h * 0.22;
    logoBottomY = ly + lh;
    disegnaLogoAnimato(ctx, logoImg, lx, ly, lw, lh, elapsedSec, opzioni.logoAnimation || 'shimmer_glow', {
      beatIntensity: Math.max(0, Math.sin(elapsedSec * 6)),
      opacity: 1.0
    });
  } else {
    logoBottomY = h * 0.30;
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5c542';
  ctx.font = `800 ${Math.round(w * 0.046)}px "Segoe UI", sans-serif`;
  ctx.fillText('IMMOBILIARE GIANCANI VENDE', w / 2, logoBottomY + h * 0.08);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `600 ${Math.round(w * 0.034)}px "Segoe UI", sans-serif`;
  const mqTxt = scheda.superficie ? ` • ${scheda.superficie} metri quadri` : '';
  ctx.fillText(`${scheda.tipologia || 'Immobile'} • ${scheda.zona || 'Favara'}${mqTxt}`, w / 2, logoBottomY + h * 0.13);

  if (opzioni.mostraContatti && opzioni.telefono) {
    ctx.fillStyle = '#38bdf8';
    ctx.font = `700 ${Math.round(w * 0.036)}px "Segoe UI", sans-serif`;
    ctx.fillText(`📞 ${opzioni.telefono}`, w / 2, logoBottomY + h * 0.19);
  }

  ctx.fillStyle = '#f5c542';
  ctx.font = `800 ${Math.round(w * 0.04)}px "Segoe UI", sans-serif`;
  ctx.fillText('— Immobiliare Giancani', w / 2, h - h * 0.09);
  ctx.restore();
}

export async function generaCopertinaHD(mediaList, logoUrl, scheda, formato = '9:16', logoAnimation = 'shimmer_glow', mostraLogo = true) {
  const w = formato === '16:9' ? 1280 : 720;
  const h = formato === '16:9' ? 720 : 1280;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (mediaList.length > 0) {
    disegnaSmartFrame(ctx, mediaList[0], w, h, 0.2, false);
  } else {
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, w, h);
  }

  const grad = ctx.createLinearGradient(0, h * 0.45, 0, h);
  grad.addColorStop(0, 'rgba(11,17,32,0)');
  grad.addColorStop(1, 'rgba(11,17,32,0.92)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  if (mostraLogo) {
    try {
      const logo = await caricaImmagine(logoUrl);
      const maxW = formato === '16:9' ? w * 0.24 : w * 0.36;
      const sc = Math.min(maxW / logo.width, (h * 0.14) / logo.height);
      const lw = logo.width * sc;
      const lh = logo.height * sc;
      // Logo SCONTORNATO senza targa bianca/gialla dietro
      disegnaLogoAnimato(ctx, logo, 28, 28, lw, lh, 0.75, logoAnimation, { opacity: 0.98 });
    } catch {}
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5c542';
  ctx.font = `800 ${Math.round(w * 0.052)}px "Segoe UI", sans-serif`;
  ctx.fillText('IMMOBILIARE GIANCANI VENDE', 32, h - w * 0.23);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(w * 0.042)}px "Segoe UI", sans-serif`;
  const rawMq = String(scheda.superficie || '').replace(/\s*metri quadri/gi, '').trim();
  const mqTxt = rawMq ? ` • ${rawMq} metri quadri` : '';
  ctx.fillText(`${scheda.tipologia || 'Immobile'} a ${scheda.zona || 'Favara'}${mqTxt}`, 32, h - w * 0.16);

  ctx.fillStyle = '#f5c542';
  ctx.font = `700 ${Math.round(w * 0.032)}px "Segoe UI", sans-serif`;
  ctx.fillText('— Immobiliare Giancani', 32, h - w * 0.09);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92));
}

export async function generaCopertinaHDFromFiles(filesMedia, logoUrl, scheda, formato = '9:16', logoAnimation = 'shimmer_glow', mostraLogo = true) {
  let mediaList = [];
  if (filesMedia && filesMedia.length > 0) {
    try {
      const m0 = await preparaMediaClip(filesMedia[0]);
      mediaList = [m0];
    } catch {}
  }
  const blob = await generaCopertinaHD(mediaList, logoUrl, scheda, formato, logoAnimation, mostraLogo);
  mediaList.forEach((m) => { if (m.revokeAfter && m.url) URL.revokeObjectURL(m.url); });
  return blob;
}

function disegnaBadgeEntriamo(ctx, w, h, localT) {
  if (localT < 0 || localT > 1.8) return;
  const alpha = localT < 0.25 ? localT / 0.25 : (localT > 1.4 ? Math.max(0, (1.8 - localT) / 0.4) : 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  const flashA = localT < 0.35 ? (1 - localT / 0.35) * 0.65 : 0;
  if (flashA > 0) {
    ctx.fillStyle = `rgba(255, 224, 130, ${flashA})`;
    ctx.fillRect(0, 0, w, h);
  }
  const txt = "🔑 ENTRIAMO NELL'IMMOBILE";
  const fs = Math.round(w * 0.042);
  ctx.font = `800 ${fs}px "Segoe UI", sans-serif`;
  const tw = ctx.measureText(txt).width;
  const bw = tw + 44;
  const bh = fs * 1.9;
  const bx = (w - bw) / 2;
  const by = h * 0.16;
  ctx.fillStyle = 'rgba(11, 17, 32, 0.86)';
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f5c542';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(txt, w / 2, by + bh / 2);
  ctx.restore();
}

function buildTimelineSegments(mediaList, timelineClips, bodyDuration, defaultTransition) {
  const count = mediaList.length;
  if (!count) return [];
  const hasCustom = Array.isArray(timelineClips) && timelineClips.length > 0;
  const items = [];
  for (let i = 0; i < count; i++) {
    const cfg = (hasCustom && timelineClips[i]) ? timelineClips[i] : {};
    const m = mediaList[i];
    const baseDur = Math.max(0.8, Number(cfg.durationSec) || m.durationSec || (m.type === 'image' ? 4.0 : 5.0));
    items.push({
      media: m,
      clipIdx: i,
      durationSec: baseDur,
      clipStartSec: Math.max(0, Number(cfg.clipStartSec || 0)),
      clipEndSec: Number(cfg.clipEndSec || 0),
      rewind: Boolean(cfg.rewind),
      speedLevel: Number(cfg.speedLevel ?? 0),
      effectFilter: cfg.effectFilter || 'none',
      transition: cfg.transition || defaultTransition || 'glow',
      calloutText: cfg.calloutText || '',
      subtitleText: cfg.subtitleText || '',
      fontId: cfg.fontId || 'montserrat',
      subtitleStyle: cfg.subtitleStyle || 'karaoke_gold'
    });
  }

  const baseSum = items.reduce((s, it) => s + it.durationSec, 0) || 1;
  const segments = [];
  let cursor = 0;

  if (bodyDuration <= baseSum * 1.15) {
    // Scala proporzionalmente la sequenza per chiudere esattamente a bodyDuration
    const scale = bodyDuration / baseSum;
    items.forEach((it, idx) => {
      const dur = idx === items.length - 1 ? Math.max(0.5, bodyDuration - cursor) : Math.max(0.6, it.durationSec * scale);
      segments.push({
        ...it,
        startSec: cursor,
        endSec: cursor + dur,
        prevMedia: idx > 0 ? items[idx - 1].media : null,
        prevOpts: idx > 0 ? items[idx - 1] : null
      });
      cursor += dur;
    });
  } else {
    // Ciclo ordinato fino a coprire l'intera durata (fino a 5 minuti)
    let passIdx = 0;
    while (cursor < bodyDuration - 0.05 && segments.length < 300) {
      const it = items[passIdx % items.length];
      const dur = Math.min(it.durationSec, bodyDuration - cursor);
      const prevSeg = segments.length > 0 ? segments[segments.length - 1] : null;
      segments.push({
        ...it,
        segIndex: passIdx,
        startSec: cursor,
        endSec: cursor + dur,
        prevMedia: prevSeg ? prevSeg.media : null,
        prevOpts: prevSeg || null
      });
      cursor += dur;
      passIdx++;
    }
  }
  return segments;
}

export function disegnaAnteprimaTimelineFrame(canvasEl, mediaObjs, timelineClips, playheadSec, opts = {}) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  const w = canvasEl.width;
  const h = canvasEl.height;

  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#fffbeb');
  bgGrad.addColorStop(0.55, '#fef3c7');
  bgGrad.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  if (!timelineClips || !timelineClips.length) {
    ctx.fillStyle = '#b45309';
    ctx.font = '800 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎬 Anteprima Video Live — Immobiliare Giancani', w / 2, h / 2 - 12);
    ctx.fillStyle = '#475569';
    ctx.font = '600 12px "Segoe UI", sans-serif';
    ctx.fillText('Carica video o foto per vedere l\'anteprima sopra la Timeline', w / 2, h / 2 + 14);
    return;
  }

  let acc = 0;
  let currIdx = timelineClips.length - 1;
  let segStart = 0;
  for (let i = 0; i < timelineClips.length; i++) {
    const dur = Math.max(0.8, Number(timelineClips[i].durationSec) || 4);
    if (playheadSec < acc + dur || i === timelineClips.length - 1) {
      currIdx = i;
      segStart = acc;
      break;
    }
    acc += dur;
  }

  const clip = timelineClips[currIdx];
  const prevClip = currIdx > 0 ? timelineClips[currIdx - 1] : null;
  const currMedia = mediaObjs[currIdx];
  const prevMedia = currIdx > 0 ? mediaObjs[currIdx - 1] : null;
  const segDur = Math.max(0.8, Number(clip.durationSec) || 4);
  const localT = Math.max(0, playheadSec - segStart);
  const prog = Math.min(1, localT / segDur);

  if (currMedia && currMedia.el) {
    if (currMedia.type === 'video' && Number.isFinite(currMedia.el.duration) && currMedia.el.duration > 0.2) {
      const vDur = currMedia.el.duration;
      const mult = SPEED_LEVEL_MAP[String(clip.speedLevel ?? 0)] || 1.0;
      const trimS = Math.max(0, Math.min(vDur - 0.2, Number(clip.clipStartSec || 0)));
      const trimE = clip.clipEndSec && clip.clipEndSec > trimS + 0.1 ? Math.min(vDur, Number(clip.clipEndSec)) : vDur;
      const span = Math.max(0.4, trimE - trimS);
      const tPos = clip.rewind
        ? Math.max(trimS + 0.02, (trimE - 0.05) - ((localT * mult) % span))
        : trimS + ((localT * mult) % span);
      if (!currMedia.el.seeking && Math.abs((currMedia.el.currentTime || 0) - tPos) > 0.08) {
        try { currMedia.el.currentTime = tPos; } catch {}
      }
    }
    disegnaScenaConTransizione(
      ctx,
      prevMedia && prevMedia.el ? prevMedia : null,
      currMedia,
      w,
      h,
      clip.transition || opts.defaultTransition || 'zoom_in_fast',
      localT,
      prog,
      true,
      { rewind: clip.rewind, effectFilter: clip.effectFilter || 'none' },
      prevClip ? { rewind: prevClip.rewind, effectFilter: prevClip.effectFilter || 'none' } : {},
      currIdx
    );
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f5c542';
    ctx.font = '700 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(clip.name || `Clip ${currIdx + 1}`, w / 2, h / 2);
  }

  // Callout / Sottotitolo personalizzato della clip (Colonna F) anche in anteprima timeline
  if (clip.calloutText || clip.subtitleText) {
    disegnaSottotitoloCinetico(ctx, w, h, {
      text: clip.subtitleText || clip.calloutText,
      calloutText: clip.subtitleText ? clip.calloutText : '',
      start: segStart,
      color: '#f5c542',
      fontTpl: resolveFontTplById(clip.fontId || opts.fontId || 'montserrat'),
      subtitleStyle: clip.subtitleStyle || opts.subtitleStyle || 'karaoke_gold',
      emoji: '🏡'
    }, playheadSec);
  }

  // Logo scontornato in anteprima se attivo
  if (opts.mostraLogo !== false && opts.logoImg && opts.logoImg.naturalWidth) {
    const sc = Math.min((w * 0.26) / opts.logoImg.naturalWidth, (h * 0.14) / opts.logoImg.naturalHeight);
    const lw = opts.logoImg.naturalWidth * sc;
    const lh = opts.logoImg.naturalHeight * sc;
    disegnaLogoAnimato(ctx, opts.logoImg, w - lw - 10, 10, lw, lh, playheadSec, opts.logoAnimation || 'shimmer_glow', { opacity: 0.94 });
  }

  // Pillola stato clip in basso sull'anteprima
  ctx.save();
  const badges = [`#${currIdx + 1}`];
  if (clip.rewind) badges.push('⏪ REWIND');
  if (clip.effectFilter && clip.effectFilter !== 'none') badges.push('✨ ' + clip.effectFilter);
  const label = badges.join(' • ');
  ctx.font = '700 11px "Segoe UI", sans-serif';
  const tw = ctx.measureText(label).width + 16;
  ctx.fillStyle = 'rgba(11, 17, 32, 0.78)';
  ctx.strokeStyle = 'rgba(245, 197, 66, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(10, h - 30, tw, 22, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f5c542';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 18, h - 19);
  ctx.restore();
}

export async function renderizzaVideoOnDevice({
  filesMedia,
  timelineClips = null,
  audioFile = null,
  audioFiles = [],
  audioOverflowMode = 'loop_cut',
  durataOpzione = 'durata_canzone',
  logoAnimation = 'shimmer_glow',
  mostraLogo = true,
  centralConfig = null,
  logoUrl,
  scheda,
  testoCanzone,
  formato = '9:16',
  effetto = 'glow',
  outroSec = 4,
  sottotitoliAttivi = true,
  antiShake = true,
  telefono = '',
  mostraContatti = true,
  onProgress = () => {}
}) {
  const orderedAudioFiles = (Array.isArray(audioFiles) && audioFiles.length)
    ? audioFiles.filter(Boolean)
    : (audioFile ? [audioFile] : []);

  onProgress(5, 'Caricamento clip, foto e logo scontornato...');
  const mediaList = await Promise.all(filesMedia.map(preparaMediaClip));
  const logoImg = mostraLogo ? await caricaImmagine(logoUrl).catch(() => null) : null;

  onProgress(12, 'Analisi beat musicali e playlist audio (fino a 5 min)...');
  const {
    audioBuffers,
    totalSongDuration,
    beats
  } = await analizzaAudioBeat(orderedAudioFiles, { fallbackDuration: 20, maxDuration: 300 });

  const hasCentral = Boolean(
    centralConfig &&
    Number.isInteger(centralConfig.index) &&
    centralConfig.index >= 0 &&
    centralConfig.index < mediaList.length
  );
  const centralMedia = hasCentral ? mediaList[centralConfig.index] : null;
  const introMediaList = hasCentral ? mediaList.filter((_, i) => i !== centralConfig.index) : [];
  const introTimelineCfgs = (hasCentral && Array.isArray(timelineClips))
    ? timelineClips.filter((_, i) => i !== centralConfig.index)
    : [];
  const centralTimelineCfg = (hasCentral && Array.isArray(timelineClips))
    ? (timelineClips[centralConfig.index] || {})
    : {};
  const centralEffectiveDur = hasCentral ? calcolaDurataClipCentrale(centralMedia.durationSec, centralConfig) : 0;

  // Calcola somma durate personalizzate dalla Timeline Touch
  const customMediaSum = Array.isArray(timelineClips) && timelineClips.length === mediaList.length
    ? timelineClips.reduce((acc, c, i) => acc + Math.max(0.8, Number(c?.durationSec) || mediaList[i].durationSec || 4), 0)
    : mediaList.reduce((acc, m) => acc + (m.durationSec || 4), 0);

  let rawTarget = 22;
  const optStr = String(durataOpzione || 'durata_canzone').toLowerCase();
  if (hasCentral && introMediaList.length === 0) {
    rawTarget = centralEffectiveDur + outroSec;
  } else if (optStr === 'durata_canzone') {
    rawTarget = totalSongDuration > 0
      ? totalSongDuration
      : (hasCentral ? centralEffectiveDur + Math.max(3, introMediaList.length * 3) + outroSec : Math.max(12, customMediaSum + outroSec));
  } else if (optStr === 'durata_video') {
    if (hasCentral) {
      const introSum = introMediaList.reduce((acc, m, idx) => acc + (Number(introTimelineCfgs[idx]?.durationSec) || m.durationSec || 3.5), 0);
      rawTarget = introSum + centralEffectiveDur + outroSec;
    } else {
      rawTarget = (customMediaSum > 0 ? customMediaSum : 16) + outroSec;
    }
  } else {
    rawTarget = Number(optStr) || 30;
  }

  const totalDuration = Math.min(300, Math.max(8, Math.round(rawTarget * 10) / 10));
  const bodyDuration = Math.max(5, totalDuration - outroSec);
  const introDuration = hasCentral
    ? (introMediaList.length > 0 ? Math.max(0, bodyDuration - centralEffectiveDur) : 0)
    : 0;
  const effectiveBeats = beats && beats.length ? beats : generaBeatRegolari(totalDuration, 0.52);

  // Costruisci la sequenza timeline (standard o intro della Clip Centrale)
  const activeIntroPool = hasCentral ? introMediaList : mediaList;
  const activeIntroCfgs = hasCentral
    ? introTimelineCfgs
    : (Array.isArray(timelineClips) && timelineClips.length === mediaList.length ? timelineClips : null);
  const introSpanForSegments = hasCentral ? introDuration : bodyDuration;
  const segments = buildTimelineSegments(activeIntroPool, activeIntroCfgs, introSpanForSegments, effetto);

  const w = formato === '16:9' ? 1280 : 720;
  const h = formato === '16:9' ? 720 : 1280;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const coverBlob = await generaCopertinaHD(
    hasCentral ? (introMediaList.length ? [introMediaList[0]] : [centralMedia]) : mediaList,
    logoUrl,
    scheda,
    formato,
    logoAnimation,
    mostraLogo
  );
  const subs = sottotitoliAttivi ? segmentaSottotitoli(testoCanzone, bodyDuration) : [];

  const stream = canvas.captureStream(30);
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const dest = audioCtx.createMediaStreamDestination();
  const masterAudio = buildMasterAudioBuffer(audioCtx, audioBuffers, totalDuration, audioOverflowMode);
  const musicGain = audioCtx.createGain();
  musicGain.gain.value = 1.0;
  musicGain.connect(dest);

  if (masterAudio) {
    const src = audioCtx.createBufferSource();
    src.buffer = masterAudio;
    src.connect(musicGain);
    src.start(0);
  }

  if (hasCentral && centralConfig.keepVoice && centralMedia.type === 'video' && !centralTimelineCfg.rewind) {
    try {
      centralMedia.el.muted = false;
      centralMedia.el.volume = 1.0;
      const vidNode = audioCtx.createMediaElementSource(centralMedia.el);
      const vidGain = audioCtx.createGain();
      vidGain.gain.value = 1.0;
      vidNode.connect(vidGain);
      vidGain.connect(dest);
    } catch {}
  }

  dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));

  const mimeTypes = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm'
  ];
  const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 3500000 } : undefined);
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

  mediaList.forEach((m, idx) => {
    const isRew = Array.isArray(timelineClips) && timelineClips[idx]?.rewind;
    if (m.type === 'video' && (!hasCentral || m !== centralMedia) && !isRew) {
      m.el.play().catch(() => {});
    }
  });
  if (hasCentral && centralMedia.type === 'video') {
    centralMedia.el.pause();
    centralMedia.el.currentTime = Math.max(0, Number(centralConfig.trimStart || 0));
  }

  return new Promise((resolve) => {
    recorder.onstop = () => {
      mediaList.forEach((m) => { if (m.revokeAfter) URL.revokeObjectURL(m.url); });
      audioCtx.close().catch(() => {});
      const ext = (mimeType || '').includes('mp4') ? 'mp4' : 'webm';
      const videoBlob = new Blob(chunks, { type: mimeType || 'video/webm' });
      onProgress(100, 'Montaggio completato!');
      resolve({ videoBlob, coverBlob, ext, formato, durataEffettiva: Math.round(totalDuration) });
    };

    recorder.start(250);
    const startTime = performance.now();
    let lastSegIdx = -1;
    let centralStarted = false;

    function tick() {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed >= totalDuration) {
        recorder.stop();
        return;
      }

      const pct = Math.min(98, Math.round(18 + (elapsed / totalDuration) * 80));
      onProgress(pct, elapsed < bodyDuration
        ? (hasCentral && elapsed >= introDuration ? `Clip Centrale ${Math.floor(elapsed)}s / ${Math.round(totalDuration)}s...` : `Montaggio ${Math.floor(elapsed)}s / ${Math.round(totalDuration)}s...`)
        : 'Rendering outro animato...');

      if (elapsed < bodyDuration && mediaList.length > 0) {
        let lastBeatTime = 0;
        for (let bi = 0; bi < effectiveBeats.length; bi++) {
          if (effectiveBeats[bi] <= elapsed) {
            lastBeatTime = effectiveBeats[bi];
          } else {
            break;
          }
        }
        const beatDist = Math.max(0, elapsed - lastBeatTime);
        const beatIntensity = Math.max(0, 1 - beatDist / 0.28);

        if (hasCentral && elapsed >= introDuration) {
          const localCentralT = elapsed - introDuration;
          const isCentralRew = Boolean(centralTimelineCfg.rewind);
          const centralMult = SPEED_LEVEL_MAP[String(centralConfig.speedLevel ?? 0)] || 1.0;

          if (!centralStarted) {
            centralStarted = true;
            if (centralMedia.type === 'video' && !isCentralRew) {
              centralMedia.el.currentTime = Math.max(0, Number(centralConfig.trimStart || 0));
              centralMedia.el.play().catch(() => {});
            } else if (centralMedia.type === 'video') {
              centralMedia.el.pause();
            }
            if (centralConfig.keepVoice && !isCentralRew) {
              musicGain.gain.setTargetAtTime(0.20, audioCtx.currentTime, 0.18);
            }
          }

          if (centralMedia.type === 'video') {
            if (isCentralRew) {
              const vDur = Math.max(1, centralMedia.el.duration || 10);
              const targetRev = Math.max(0.03, (vDur - 0.08) - ((localCentralT * centralMult) % Math.max(0.8, vDur - 0.1)));
              if (!centralMedia.el.seeking && Math.abs((centralMedia.el.currentTime || 0) - targetRev) > 0.06) {
                try { centralMedia.el.currentTime = targetRev; } catch {}
              }
            } else {
              let curMult = centralMult;
              const curT = centralMedia.el.currentTime || 0;
              if (centralConfig.corridorEnabled && curT >= Number(centralConfig.corridorStart || 0) && curT <= Number(centralConfig.corridorEnd || 0)) {
                curMult = Math.min(4.0, centralMult * Number(centralConfig.corridorSpeed || 2.0));
              }
              if (Math.abs((centralMedia.el.playbackRate || 1) - curMult) > 0.02) {
                centralMedia.el.playbackRate = curMult;
              }
            }
          }

          const centralProg = localCentralT / Math.max(1, bodyDuration - introDuration);
          const prevSeg = segments.length ? segments[segments.length - 1] : null;
          disegnaScenaConTransizione(
            ctx,
            prevSeg ? prevSeg.media : null,
            centralMedia,
            w,
            h,
            centralTimelineCfg.transition || effetto,
            localCentralT,
            centralProg,
            antiShake,
            { rewind: isCentralRew, effectFilter: centralTimelineCfg.effectFilter || 'none' },
            prevSeg || {},
            99
          );
          if (introDuration > 0 && centralConfig.entriamoFx !== false) {
            disegnaBadgeEntriamo(ctx, w, h, localCentralT);
          }
        } else if (segments.length > 0) {
          let segIdx = segments.length - 1;
          for (let si = 0; si < segments.length; si++) {
            if (elapsed < segments[si].endSec) {
              segIdx = si;
              break;
            }
          }
          const seg = segments[segIdx];
          const localT = Math.max(0, elapsed - seg.startSec);
          const segDur = Math.max(0.4, seg.endSec - seg.startSec);
          const prog = Math.min(1, localT / segDur);
          const mult = SPEED_LEVEL_MAP[String(seg.speedLevel ?? 0)] || 1.0;

          if (segIdx !== lastSegIdx) {
            lastSegIdx = segIdx;
            if (seg.media.type === 'video') {
              const vd = Math.max(1, seg.media.el.duration || 6);
              const trimS = Math.max(0, Math.min(vd - 0.2, Number(seg.clipStartSec || 0)));
              const trimE = seg.clipEndSec && seg.clipEndSec > trimS + 0.1 ? Math.min(vd, Number(seg.clipEndSec)) : vd;
              if (seg.rewind) {
                seg.media.el.pause();
                try { seg.media.el.currentTime = Math.max(trimS + 0.02, trimE - 0.08); } catch {}
              } else {
                seg.media.el.playbackRate = mult;
                try {
                  if (trimS > 0.05) seg.media.el.currentTime = trimS;
                } catch {}
                seg.media.el.play().catch(() => {});
              }
            }
          } else if (seg.media.type === 'video' && seg.rewind) {
            const vd = Math.max(1, seg.media.el.duration || 6);
            const trimS = Math.max(0, Math.min(vd - 0.2, Number(seg.clipStartSec || 0)));
            const trimE = seg.clipEndSec && seg.clipEndSec > trimS + 0.1 ? Math.min(vd, Number(seg.clipEndSec)) : vd;
            const span = Math.max(0.5, trimE - trimS);
            const targetRev = Math.max(trimS + 0.02, (trimE - 0.08) - ((localT * mult) % span));
            if (!seg.media.el.seeking && Math.abs((seg.media.el.currentTime || 0) - targetRev) > 0.06) {
              try { seg.media.el.currentTime = targetRev; } catch {}
            }
          }

          disegnaScenaConTransizione(
            ctx,
            seg.prevMedia,
            seg.media,
            w,
            h,
            seg.transition || effetto,
            localT,
            prog,
            antiShake,
            { rewind: seg.rewind, effectFilter: seg.effectFilter },
            seg.prevOpts || {},
            segIdx
          );

          // Sottotitolo / Callout personalizzato della singola clip (se configurato in Timeline Touch)
          if (seg.subtitleText || seg.calloutText) {
            disegnaSottotitoloCinetico(ctx, w, h, {
              text: seg.subtitleText || seg.calloutText,
              calloutText: seg.subtitleText ? seg.calloutText : '',
              start: seg.startSec,
              color: '#f5c542',
              fontTpl: resolveFontTplById(seg.fontId || 'montserrat'),
              subtitleStyle: seg.subtitleStyle || 'karaoke_gold',
              emoji: EMOJI_SET[segIdx % EMOJI_SET.length]
            }, elapsed);
          }
        }

        // Logo AGENZIA SCONTORNATO (solo se mostraLogo = true)
        if (mostraLogo && logoImg) {
          const maxLw = formato === '16:9' ? w * 0.18 : w * 0.28;
          const scL = Math.min(maxLw / logoImg.width, (h * 0.10) / logoImg.height);
          const lw = logoImg.width * scL;
          const lh = logoImg.height * scL;
          disegnaLogoAnimato(ctx, logoImg, w - lw - 22, 22, lw, lh, elapsed, logoAnimation, {
            beatIntensity,
            opacity: 0.96
          });
        }

        if (sottotitoliAttivi) {
          const activeSub = subs.find((s) => elapsed >= s.start && elapsed < s.end);
          if (activeSub) disegnaSottotitoloCinetico(ctx, w, h, activeSub, elapsed);
        }
      } else {
        if (hasCentral && centralConfig.keepVoice) {
          musicGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.25);
        }
        const outroProg = (elapsed - bodyDuration) / Math.max(1, outroSec);
        disegnaOutroAnimato(ctx, w, h, logoImg, scheda, outroProg, elapsed, {
          telefono,
          mostraContatti,
          logoAnimation,
          mostraLogo
        });
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}
