import { GAS_WEBAPP_URL, ORDINALS_IT, TIMELINE_PX_PER_SEC, state, uiHooks, $, $$, showToast, fmtMMSS, escapeHtml } from './app_core.js';
import { getSettings, saveSettings, resetLogoDefault } from './storage.js';
import { generaTesti3In1, costruisciPromptSunoGemini, normalizzaMetriQuadri, applicaRegoleBrand } from './gemini_client.js';
import {
  renderizzaVideoOnDevice, caricaImmagine, formatGiancaniMq,
  SPEED_LEVEL_MAP, TRANSIZIONI_CATALOGO, calcolaDurataClipCentrale, disegnaAnteprimaTimelineFrame,
  generaCopertinaHDFromFiles
} from './video_engine.js';
import { estraiWaveformPeaks } from './beat_detector.js';
import { FRASI_PRESTIGIO_STORIE, forzaBrandingChiusura, leggiFraseConTTS } from './generator_engine.js';

const goStep = (n) => uiHooks.goStep(n);
const aggiornaGlobalKpiStrip = () => uiHooks.aggiornaGlobalKpiStrip();
const ricaricaLogoOggetto = () => uiHooks.ricaricaLogoOggetto();
const avviaPreviewLogoStep2 = () => uiHooks.avviaPreviewLogoStep2();
const ponteImmobileAAcquirenti = (imm) => uiHooks.ponteImmobileAAcquirenti(imm);

function ponteImmobileAMontaVideo(imm) {
  const zona = imm.comune || imm.zona || 'Favara';
  const tipo = imm.tipologia || imm.tipoImmobile || 'Appartamento';
  const mqNum = parseMqNumerico(imm.superficie || imm.metriQuadri) || 120;
  const desc = forzaBrandingChiusura(imm.testoColonnaF || imm.descrizione || imm.titolo || '');

  $('#inpZona').value = zona;
  $('#inpTipo').value = tipo;
  $('#inpMq').value = mqNum;
  $('#inpDesc').value = desc;

  if (imm.foto_url && imm.foto_url.startsWith('http') && !state.mediaFiles.some((m) => m.url === imm.foto_url)) {
    state.mediaFiles.push({
      name: `${tipo}_${zona}.jpg`,
      url: imm.foto_url,
      tipo: 'foto',
      fromDrive: true
    });
    state.mediaDurations.push(4);
    aggiornaListaMedia();
  }

  const r = generaTesti3In1({ zona, tipologia: tipo, superficie: String(mqNum), descrizione: desc, temi: $('#inpTemi').value }, '');
  state.testi = r;
  $('#txtCanzone').value = r.canzone;
  $('#txtDescrizione').value = r.descrizione;
  $('#txtSocial').value = r.social;
  goStep(4);
  showToast('🎬 Immobile caricato nel Montatore Video & Timeline!');
}



function leggiSchedaForm() {
  return {
    zona: $('#inpZona')?.value.trim() || 'Favara',
    tipologia: $('#inpTipo')?.value.trim() || 'Appartamento',
    superficie: $('#inpMq')?.value.trim(),
    descrizione: normalizzaMetriQuadri($('#inpDesc')?.value.trim() || ''),
    temi: $('#inpTemi')?.value.trim() || 'ti crei la famiglia, la felicità è dentro la famiglia'
  };
}

let _timelinePreviewAudioEl = null;

function syncTimelineFromMediaFiles() {
  const defTrans = ($('#selEffetto') ? $('#selEffetto').value : 'zoom_in_fast') || 'zoom_in_fast';
  const nextClips = [];
  for (let i = 0; i < state.mediaFiles.length; i++) {
    const f = state.mediaFiles[i];
    const isVid = f.type ? f.type.startsWith('video/') : (f.tipo === 'video');
    const prev = state.timelineClips[i];
    const baseDur = state.mediaDurations[i] > 0 ? state.mediaDurations[i] : (isVid ? 5 : 4);
    if (prev && prev._srcRef === f) {
      nextClips.push(prev);
    } else {
      nextClips.push({
        id: prev?.id || `clip_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        _srcRef: f,
        name: f.name || `Clip ${i + 1}`,
        isVid,
        durationSec: prev?.durationSec || Math.max(1.5, Math.min(45, Math.round(baseDur * 2) / 2)),
        clipStartSec: Number(prev?.clipStartSec || 0),
        clipEndSec: Number(prev?.clipEndSec || 0),
        rewind: Boolean(prev?.rewind),
        speedLevel: Number(prev?.speedLevel ?? 0),
        effectFilter: prev?.effectFilter || 'none',
        transition: prev?.transition || defTrans,
        calloutText: prev?.calloutText || '',
        subtitleText: prev?.subtitleText || '',
        fontId: prev?.fontId || 'montserrat',
        subtitleStyle: prev?.subtitleStyle || 'karaoke_gold'
      });
    }
  }
  state.timelineClips = nextClips;
  if (state.selectedClipIndex >= state.timelineClips.length) state.selectedClipIndex = state.timelineClips.length - 1;
  if (state.selectedClipIndex < 0 && state.timelineClips.length > 0) state.selectedClipIndex = 0;
  assicuraPreviewMediaCache();
}

function assicuraPreviewMediaCache() {
  const newCache = [];
  for (let i = 0; i < state.mediaFiles.length; i++) {
    const f = state.mediaFiles[i];
    const existing = state.previewMediaCache.find((c) => c && c.srcRef === f);
    if (existing) { newCache.push(existing); continue; }
    const isFile = (f instanceof Blob) || (f && typeof f === 'object' && 'size' in f && !f.url);
    const url = isFile ? URL.createObjectURL(f) : f.url;
    const isVid = isFile ? (f.type || '').startsWith('video/') : (f.tipo === 'video' || f.type === 'video');
    if (isVid) {
      const vid = document.createElement('video');
      if (!isFile) vid.crossOrigin = 'anonymous';
      vid.src = url; vid.muted = true; vid.playsInline = true; vid.preload = 'metadata';
      vid.onloadeddata = () => disegnaFrameTimelineCorrente();
      newCache.push({ type: 'video', el: vid, url, revokeAfter: isFile, srcRef: f, durationSec: state.mediaDurations[i] || 5 });
    } else {
      const img = new Image();
      if (!isFile) img.crossOrigin = 'anonymous';
      img.onload = () => disegnaFrameTimelineCorrente();
      img.src = url;
      newCache.push({ type: 'image', el: img, url, revokeAfter: isFile, srcRef: f, durationSec: 4 });
    }
  }
  state.previewMediaCache = newCache;
}

function aggiornaListaMedia() {
  syncTimelineFromMediaFiles();
  const box = $('#mediaPreviewList');
  if (!box) return;
  if (!state.mediaFiles.length) {
    box.innerHTML = '<span class="muted">Nessun file selezionato. Scegli video/foto qui sopra o importali da Venditori/Drive.</span>';
    aggiornaCentralBoxUI();
    renderTimelineStudio();
    aggiornaGlobalKpiStrip();
    return;
  }
  box.innerHTML = state.mediaFiles.map((f, i) => {
    const isVid = f.type ? f.type.startsWith('video/') : (f.tipo === 'video');
    const isCentral = state.centralClip.index === i;
    const durVal = state.timelineClips[i]?.durationSec || state.mediaDurations[i];
    return `
      <div class="media-pill${isCentral ? ' is-central' : ''}">
        <span>${i + 1}. ${isVid ? '🎬' : '🖼️'}${f.fromDrive ? ' ☁️' : ''} ${escapeHtml((f.name || 'Media').slice(0, 16))} (${fmtMMSS(durVal)})</span>
        ${isVid ? `<button type="button" class="move-btn" data-central="${i}">${isCentral ? '⭐ Centrale' : '☆'}</button>` : ''}
        <button type="button" class="move-btn" data-mv="-1" data-idx="${i}" ${i === 0 ? 'disabled' : ''}>⬆️</button>
        <button type="button" class="move-btn" data-mv="1" data-idx="${i}" ${i === state.mediaFiles.length - 1 ? 'disabled' : ''}>⬇️</button>
        <button type="button" data-rm="${i}">✕</button>
      </div>
    `;
  }).join('');

  box.querySelectorAll('button[data-central]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.central);
      state.centralClip.index = (state.centralClip.index === idx) ? -1 : idx;
      aggiornaListaMedia();
      if (state.centralClip.index >= 0) apriModalClipCentrale();
    };
  });
  box.querySelectorAll('button[data-rm]').forEach((b) => { b.onclick = () => eliminaClipTimeline(Number(b.dataset.rm)); });
  box.querySelectorAll('button[data-mv]').forEach((b) => { b.onclick = () => spostaClipTimeline(Number(b.dataset.idx), Number(b.dataset.idx) + Number(b.dataset.mv)); });
  aggiornaCentralBoxUI();
  renderTimelineStudio();
  aggiornaGlobalKpiStrip();
}

function aggiornaCentralBoxUI() {
  const box = $('#centralClipBox');
  if (!box) return;
  const idx = state.centralClip.index;
  if (idx < 0 || idx >= state.mediaFiles.length) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  const rawDur = state.mediaDurations[idx] || 20;
  const newDur = calcolaDurataClipCentrale(rawDur, state.centralClip);
  const mult = SPEED_LEVEL_MAP[String(state.centralClip.speedLevel)] || 1.0;
  $('#lblCentralName').textContent = state.mediaFiles[idx].name || 'Video Centrale';
  $('#lblCentralStatus').innerHTML = `Livello <strong>${state.centralClip.speedLevel > 0 ? '+' : ''}${state.centralClip.speedLevel}</strong> (${mult.toFixed(2)}x) • Durata: <strong>${fmtMMSS(newDur)}</strong>`;
}

async function misuraDurataAudio(file) {
  try {
    const url = URL.createObjectURL(file);
    const dur = await new Promise((resolve) => {
      const a = new Audio();
      a.preload = 'metadata';
      a.onloadedmetadata = () => resolve(Number.isFinite(a.duration) ? a.duration : 0);
      a.onerror = () => resolve(0);
      a.src = url;
      setTimeout(() => resolve(0), 2500);
    });
    return { dur, url };
  } catch { return { dur: 0, url: '' }; }
}

function aggiornaPlaylistUI() {
  const box = $('#audioPlaylistBox');
  const sum = $('#audioPlaylistSummary');
  const clearBtn = $('#btnClearAudio');
  if (!state.audioPlaylist.length) {
    box.innerHTML = '';
    clearBtn.style.display = 'none';
    sum.textContent = 'Nessuna traccia audio caricata (puoi aggiungere file dal telefono o aprire Canzone 3+ Min / Basi Drive).';
    aggiornaInfoDurataPreview();
    aggiornaWaveformTimeline();
    return;
  }
  clearBtn.style.display = 'inline-flex';
  const totalDur = state.audioPlaylist.reduce((s, t) => s + (t.durationSec || 0), 0);
  box.innerHTML = state.audioPlaylist.map((tr, i) => `
    <div class="audio-track-row">
      <span class="track-pos-badge">${ORDINALS_IT[i] || `${i + 1}°`}</span>
      <div class="track-meta">
        <div class="track-name">🎵 ${escapeHtml(tr.name)}</div>
        <div class="track-dur">Durata: ${tr.durationSec > 0 ? fmtMMSS(tr.durationSec) : 'auto'}</div>
      </div>
      <div class="track-actions">
        <button type="button" data-amv="-1" data-idx="${i}" ${i === 0 ? 'disabled' : ''}>⬆️</button>
        <button type="button" data-amv="1" data-idx="${i}" ${i === state.audioPlaylist.length - 1 ? 'disabled' : ''}>⬇️</button>
        <button type="button" class="del" data-arm="${i}">✕</button>
      </div>
    </div>
  `).join('');

  box.querySelectorAll('[data-amv]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.idx);
      const tgt = idx + Number(b.dataset.amv);
      if (tgt >= 0 && tgt < state.audioPlaylist.length) {
        [state.audioPlaylist[idx], state.audioPlaylist[tgt]] = [state.audioPlaylist[tgt], state.audioPlaylist[idx]];
        aggiornaPlaylistUI();
      }
    };
  });
  box.querySelectorAll('[data-arm]').forEach((b) => {
    b.onclick = () => {
      const [rem] = state.audioPlaylist.splice(Number(b.dataset.arm), 1);
      if (rem?.url) URL.revokeObjectURL(rem.url);
      aggiornaPlaylistUI();
    };
  });
  sum.innerHTML = `🎶 <strong>${state.audioPlaylist.length}</strong> traccia/e • Totale: <strong>${fmtMMSS(totalDur)}</strong>`;
  aggiornaInfoDurataPreview();
  aggiornaWaveformTimeline();
}

function aggiornaInfoDurataPreview() {
  const el = $('#lblDurataPreviewInfo');
  if (!el) return;
  const durOpt = $('#selDurataVideo')?.value || 'durata_canzone';
  const songTotal = state.audioPlaylist.reduce((s, t) => s + (t.durationSec || 0), 0);
  const outroSec = Number($('#selOutro')?.value || 4) || 4;
  const estMedia = getTimelineTotalDuration() + outroSec;
  let targetSec = 30;
  if (durOpt === 'durata_canzone') targetSec = songTotal > 0 ? Math.min(300, songTotal) : Math.max(16, estMedia);
  else if (durOpt === 'durata_video') targetSec = Math.min(300, Math.max(12, estMedia));
  else targetSec = Math.min(300, Number(durOpt) || 30);

  el.innerHTML = `⏱️ Durata stimata video: <strong>${fmtMMSS(targetSec)}</strong> (${Math.round(targetSec)}s) • ${songTotal > 0 ? `Musica ${fmtMMSS(songTotal)}` : 'Senza file musicale caricato'}`;
}

function getTimelineTotalDuration() {
  return state.timelineClips.reduce((s, c) => s + Math.max(0.8, Number(c.durationSec) || 4), 0);
}

function getClipStartOffset(idx) {
  let acc = 0;
  for (let i = 0; i < idx && i < state.timelineClips.length; i++) acc += Math.max(0.8, Number(state.timelineClips[i].durationSec) || 4);
  return acc;
}

async function aggiornaWaveformTimeline() {
  const targetDur = Math.max(getTimelineTotalDuration(), 12);
  try { state.timelineWaveform = await estraiWaveformPeaks(state.audioPlaylist.map((t) => t.file), 180, targetDur); }
  catch { state.timelineWaveform = await estraiWaveformPeaks([], 180, targetDur); }
  disegnaWaveformCanvas();
}

function disegnaWaveformCanvas() {
  const cvs = $('#timelineWaveformCanvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const innerEl = $('#timelineInnerTrack');
  const totalDur = Math.max(getTimelineTotalDuration(), state.timelineWaveform.effectiveDuration || 12);
  const w = Math.max(320, innerEl ? innerEl.offsetWidth - 8 : cvs.width);
  if (cvs.width !== w) cvs.width = w;
  const h = cvs.height;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, w, h);

  const peaks = state.timelineWaveform.peaks || [];
  const barW = w / Math.max(1, peaks.length);
  const playRatio = Math.min(1, Math.max(0, state.timelinePlayheadSec / Math.max(0.1, totalDur)));
  peaks.forEach((pk, idx) => {
    const bh = Math.max(4, pk * (h - 18));
    ctx.fillStyle = (idx / Math.max(1, peaks.length)) <= playRatio ? '#d97706' : (state.timelineWaveform.hasAudio ? '#10b981' : '#0284c7');
    ctx.fillRect(idx * barW, (h - bh) / 2, Math.max(1.5, barW - 1), bh);
  });

  ctx.fillStyle = '#e11d48';
  (state.timelineWaveform.beats || []).forEach((b) => {
    if (b <= totalDur) ctx.fillRect((b / totalDur) * w, 2, 2, 7);
  });
}

function aggiornaPlayheadUI() {
  const totalDur = Math.max(0.1, getTimelineTotalDuration());
  state.timelinePlayheadSec = Math.max(0, Math.min(totalDur, state.timelinePlayheadSec));
  if ($('#timelinePlayheadLine')) $('#timelinePlayheadLine').style.left = `${Math.round(state.timelinePlayheadSec * TIMELINE_PX_PER_SEC)}px`;
  if ($('#timelineTimeReadout')) $('#timelineTimeReadout').textContent = `${state.timelinePlayheadSec.toFixed(1)}s / ${totalDur.toFixed(1)}s`;
  disegnaWaveformCanvas();
  disegnaFrameTimelineCorrente();
}

function disegnaFrameTimelineCorrente() {
  const cvs = $('#timelinePreviewCanvas');
  if (!cvs) return;
  disegnaAnteprimaTimelineFrame(cvs, state.previewMediaCache, state.timelineClips, state.timelinePlayheadSec, {
    defaultTransition: $('#selEffetto')?.value || 'zoom_in_fast',
    logoImg: state.logoImgObj,
    mostraLogo: $('#selMostraLogo')?.value === 'si',
    logoAnimation: $('#selLogoAnim')?.value || 'shimmer_glow'
  });
}

const FX_VISUAL_SVG_MAP = {
  zoom_in_fast: {
    title: 'Zoom Entrata',
    sub: 'Velocissimo >>',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#fef3c7"/><rect x="14" y="10" width="72" height="36" rx="6" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 2"/><rect x="28" y="17" width="44" height="22" rx="4" fill="#d97706"/><path d="M10 8 L25 16 M90 8 L75 16 M10 48 L25 40 M90 48 L75 40" stroke="#b45309" stroke-width="2.5" stroke-linecap="round"/></svg>`
  },
  zoom_out_fast: {
    title: 'Zoom Uscita',
    sub: '<< Velocissimo',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#e0f2fe"/><rect x="14" y="9" width="72" height="38" rx="6" fill="#0284c7" opacity="0.2"/><rect x="30" y="18" width="40" height="20" rx="4" fill="#0284c7"/><path d="M28 16 L12 8 M72 16 L88 8 M28 40 L12 48 M72 40 L88 48" stroke="#0369a1" stroke-width="2.5" stroke-linecap="round"/></svg>`
  },
  zoom_punch_combo: {
    title: 'Zoom Combo',
    sub: 'Uscita + Entrata',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#ffedd5"/><circle cx="50" cy="28" r="21" fill="none" stroke="#ea580c" stroke-width="2.5"/><circle cx="50" cy="28" r="11" fill="#ea580c"/><path d="M50 3 L50 12 M50 44 L50 53 M18 28 L30 28 M70 28 L82 28" stroke="#c2410c" stroke-width="2.5"/></svg>`
  },
  wipe_top: {
    title: 'Linea Sopra → Sotto',
    sub: 'Tendina Verticale',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#ecfdf5"/><rect x="10" y="6" width="80" height="22" rx="4" fill="#10b981"/><line x1="8" y1="28" x2="92" y2="28" stroke="#047857" stroke-width="3"/><path d="M50 32 L50 48 M43 42 L50 49 L57 42" stroke="#047857" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
  },
  wipe_bottom: {
    title: 'Linea Sotto → Sopra',
    sub: 'Salita Verticale',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#ecfdf5"/><rect x="10" y="28" width="80" height="22" rx="4" fill="#059669"/><line x1="8" y1="28" x2="92" y2="28" stroke="#047857" stroke-width="3"/><path d="M50 24 L50 8 M43 14 L50 7 L57 14" stroke="#047857" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
  },
  wipe_right_to_left: {
    title: 'Linea Dx → Sx',
    sub: 'Scorrimento Sx',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#f3e8ff"/><rect x="52" y="8" width="38" height="40" rx="4" fill="#9333ea"/><line x1="52" y1="6" x2="52" y2="50" stroke="#6b21a8" stroke-width="3"/><path d="M44 28 L20 28 M27 21 L19 28 L27 35" stroke="#6b21a8" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
  },
  wipe_left_to_right: {
    title: 'Linea Sx → Dx',
    sub: 'Scorrimento Dx',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#f3e8ff"/><rect x="10" y="8" width="38" height="40" rx="4" fill="#7e22ce"/><line x1="48" y1="6" x2="48" y2="50" stroke="#6b21a8" stroke-width="3"/><path d="M56 28 L80 28 M73 21 L81 28 L73 35" stroke="#6b21a8" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
  },
  shape_star: {
    title: 'Transizione Stella',
    sub: 'Apertura a Stella',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#ffe4e6"/><polygon points="50,6 56,20 72,20 59,29 64,44 50,35 36,44 41,29 28,20 44,20" fill="#e11d48" stroke="#9f1239" stroke-width="1.5"/></svg>`
  },
  shape_circle: {
    title: 'Transizione Cerchio',
    sub: 'Iride Circolare',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#e0e7ff"/><circle cx="50" cy="28" r="20" fill="none" stroke="#4f46e5" stroke-width="2" stroke-dasharray="3 2"/><circle cx="50" cy="28" r="12" fill="#4f46e5"/></svg>`
  },
  glow: {
    title: 'Bagliore Oro',
    sub: 'Flash Luminoso',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#fef9c3"/><circle cx="50" cy="28" r="18" fill="#facc15"/><circle cx="50" cy="28" r="9" fill="#ffffff"/></svg>`
  },
  mix_all: {
    title: 'Mix Automatico',
    sub: 'Zoom + Linee + Forme',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="56" fill="#f1f5f9"/><rect x="12" y="12" width="22" height="32" rx="4" fill="#f59e0b"/><circle cx="50" cy="28" r="13" fill="#10b981"/><polygon points="78,12 89,42 67,42" fill="#6366f1"/></svg>`
  },
  fade_color: {
    title: 'Sfumatura Oro',
    sub: 'Dissolvenza Calda',
    svg: `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gFade" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fef3c7"/></linearGradient></defs><rect width="100" height="56" fill="url(#gFade)"/></svg>`
  }
};

function getMiniTransitionIconSvg(tid) {
  const item = FX_VISUAL_SVG_MAP[tid] || FX_VISUAL_SVG_MAP.zoom_in_fast;
  return item.svg;
}

function renderVisualTransitionsGallery() {
  const grid = $('#visualTransitionsGallery');
  if (!grid) return;
  const activeClip = state.timelineClips[state.selectedClipIndex];
  const currentTrans = activeClip ? (activeClip.transition || 'zoom_in_fast') : ($('#selEffetto')?.value || 'zoom_in_fast');

  grid.innerHTML = Object.entries(FX_VISUAL_SVG_MAP).map(([tid, meta]) => `
    <button type="button" class="fx-visual-card${currentTrans === tid ? ' active' : ''}" data-fx-tid="${tid}">
      <div class="fx-visual-thumb">${meta.svg}</div>
      <div class="fx-visual-title">${escapeHtml(meta.title)}</div>
      <div class="fx-visual-sub">${escapeHtml(meta.sub)}</div>
    </button>
  `).join('');

  grid.querySelectorAll('[data-fx-tid]').forEach((card) => {
    card.onclick = () => {
      const tid = card.dataset.fxTid;
      if (state.selectedClipIndex >= 0 && state.timelineClips[state.selectedClipIndex]) {
        state.timelineClips[state.selectedClipIndex].transition = tid;
        if ($('#selClipTransition')) $('#selClipTransition').value = tid;
        showToast(`✨ Effetto "${FX_VISUAL_SVG_MAP[tid]?.title || tid}" applicato alla Clip #${state.selectedClipIndex + 1}!`);
      } else if ($('#selEffetto')) {
        $('#selEffetto').value = tid;
        state.timelineClips.forEach((c) => { c.transition = tid; });
        showToast(`✨ Effetto "${FX_VISUAL_SVG_MAP[tid]?.title || tid}" impostato sul video!`);
      }
      renderTimelineStudio();
      disegnaFrameTimelineCorrente();
    };
  });
}

function shortTransLabel(tid) {
  const f = TRANSIZIONI_CATALOGO.find((t) => t.id === tid);
  return f ? f.short : '⚡ Trans.';
}

function spostaClipTimeline(fromIdx, toIdx) {
  if (fromIdx < 0 || toIdx < 0 || fromIdx >= state.mediaFiles.length || toIdx >= state.mediaFiles.length || fromIdx === toIdx) return;
  [state.mediaFiles, state.mediaDurations, state.timelineClips, state.previewMediaCache].forEach((arr) => {
    if (arr && fromIdx < arr.length) {
      const [it] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, it);
    }
  });
  state.selectedClipIndex = toIdx;
  aggiornaListaMedia();
  aggiornaInfoDurataPreview();
}

function eliminaClipTimeline(idx) {
  if (idx < 0 || idx >= state.mediaFiles.length) return;
  [state.mediaFiles, state.mediaDurations, state.timelineClips, state.previewMediaCache].forEach((arr) => {
    if (arr && idx < arr.length) arr.splice(idx, 1);
  });
  if (state.centralClip.index === idx) state.centralClip.index = -1;
  else if (state.centralClip.index > idx) state.centralClip.index--;
  if (state.selectedClipIndex >= state.timelineClips.length) state.selectedClipIndex = state.timelineClips.length - 1;
  aggiornaListaMedia();
  aggiornaInfoDurataPreview();
}

function duplicaClipTimeline(idx) {
  if (idx < 0 || idx >= state.mediaFiles.length) return;
  const f = state.mediaFiles[idx];
  const dur = state.mediaDurations[idx] || 4;
  const copy = { ...state.timelineClips[idx], id: `clip_${Date.now()}_dup`, _srcRef: f };
  state.mediaFiles.splice(idx + 1, 0, f);
  state.mediaDurations.splice(idx + 1, 0, dur);
  state.timelineClips.splice(idx + 1, 0, copy);
  state.selectedClipIndex = idx + 1;
  aggiornaListaMedia();
  showToast('📑 Clip duplicata!');
}

function dividiClipSelezionata() {
  const idx = state.selectedClipIndex;
  if (idx < 0 || idx >= state.timelineClips.length) { showToast('Seleziona prima una clip sulla Timeline!'); return; }
  const c = state.timelineClips[idx];
  const dur = Number(c.durationSec || 4);
  if (dur < 1.8) { showToast('La clip è troppo breve per dividerla!'); return; }

  const segStart = getClipStartOffset(idx);
  let rel = state.timelinePlayheadSec - segStart;
  if (rel <= 0.6 || rel >= dur - 0.6) rel = dur / 2;
  const d1 = Math.max(0.8, Math.round(rel * 2) / 2);
  const d2 = Math.max(0.8, Math.round((dur - d1) * 2) / 2);

  const srcStart = Number(c.clipStartSec || 0);
  const srcEnd = Number(c.clipEndSec || state.mediaDurations[idx] || dur);
  const ratio = d1 / (d1 + d2);
  const splitMediaT = Math.round((srcStart + (srcEnd - srcStart) * ratio) * 10) / 10;

  c.durationSec = d1;
  c.clipEndSec = splitMediaT;

  const secondPart = {
    ...c,
    id: `clip_${Date.now()}_split2`,
    name: `${c.name} (2)`,
    durationSec: d2,
    clipStartSec: splitMediaT,
    clipEndSec: srcEnd,
    transition: c.transition
  };

  state.mediaFiles.splice(idx + 1, 0, state.mediaFiles[idx]);
  state.mediaDurations.splice(idx + 1, 0, state.mediaDurations[idx]);
  state.timelineClips.splice(idx + 1, 0, secondPart);
  aggiornaListaMedia();
  aggiornaInfoDurataPreview();
  showToast(`✂️ Clip divisa in 2 (${d1.toFixed(1)}s + ${d2.toFixed(1)}s)!`);
}

function allineaTutteClipAiBeat() {
  if (!state.timelineClips.length) { showToast('Nessuna clip nella Timeline!'); return; }
  const beats = state.timelineWaveform.beats || [];
  if (beats.length < 2) { showToast('Aggiungi una canzone per rilevare i battiti!'); return; }
  let cursor = 0;
  state.timelineClips.forEach((c) => {
    const rawTarget = cursor + (Number(c.durationSec) || 4);
    let bestBeat = rawTarget;
    let bestDiff = Infinity;
    for (const b of beats) {
      if (b <= cursor + 0.8) continue;
      const diff = Math.abs(b - rawTarget);
      if (diff < bestDiff) { bestDiff = diff; bestBeat = b; }
    }
    const newDur = Math.max(1.0, Math.round((bestBeat - cursor) * 2) / 2);
    c.durationSec = newDur;
    cursor += newDur;
  });
  renderTimelineStudio();
  aggiornaWaveformTimeline();
  aggiornaInfoDurataPreview();
  showToast('🧲 Tutte le clip allineate ai battiti musicali (Snap-to-Beat)!');
}

function renderTimelineInspector() {
  const box = $('#timelineClipInspector');
  if (!box) return;
  const idx = state.selectedClipIndex;
  if (idx < 0 || idx >= state.timelineClips.length) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  const c = state.timelineClips[idx];
  $('#lblInspectorTitle').textContent = `Clip #${idx + 1}: ${c.name.slice(0, 26)}`;
  $('#btnClipMoveLeft').disabled = (idx === 0);
  $('#btnClipMoveRight').disabled = (idx >= state.timelineClips.length - 1);
  const rewBtn = $('#btnClipRewindToggle');
  rewBtn.textContent = c.rewind ? '⏪ Rewind: ATTIVO (Torna Indietro)' : '⏪ Rewind: OFF';
  rewBtn.classList.toggle('btn-rewind-on', Boolean(c.rewind));
  $('#selClipSpeed').value = String(c.speedLevel ?? 0);
  $('#rngClipDuration').value = Number(c.durationSec || 4);
  $('#lblClipDurationVal').textContent = `${Number(c.durationSec || 4).toFixed(1)}s`;
  $('#selClipTransition').value = c.transition || 'zoom_in_fast';
  $('#inpClipCallout').value = c.calloutText || '';
  $('#inpClipSubtitle').value = c.subtitleText || '';
  $('#selClipFont').value = c.fontId || 'montserrat';
  $('#selClipSubStyle').value = c.subtitleStyle || 'karaoke_gold';
  $$('#clipEffectChips .chip').forEach((ch) => ch.classList.toggle('active', ch.dataset.clipefx === (c.effectFilter || 'none')));
}

function renderTimelineStudio() {
  const clipsTrack = $('#timelineClipsTrack');
  const transTrack = $('#timelineTransitionsTrack');
  const ruler = $('#timelineRuler');
  const inner = $('#timelineInnerTrack');
  const badge = $('#timelineTotalBadge');
  if (!clipsTrack || !ruler || !inner) return;

  const totalDur = getTimelineTotalDuration();
  if (badge) badge.textContent = `${state.timelineClips.length} clip • ${fmtMMSS(totalDur)}`;
  inner.style.width = `${Math.max(320, Math.round(Math.max(totalDur, 10) * TIMELINE_PX_PER_SEC))}px`;

  const stepSec = totalDur > 60 ? 5 : 2;
  const ticks = [];
  for (let t = 0; t <= Math.max(10, Math.ceil(totalDur)); t += stepSec) {
    ticks.push(`<div class="timeline-ruler-tick" style="left:${t * TIMELINE_PX_PER_SEC}px;">${t}s</div>`);
  }
  ruler.innerHTML = ticks.join('');

  if (!state.timelineClips.length) {
    clipsTrack.innerHTML = '<div class="muted" style="padding:12px;">Carica video o foto qui sopra per modificarli nella Timeline Touch.</div>';
    if (transTrack) transTrack.innerHTML = '';
    renderTimelineInspector();
    aggiornaPlayheadUI();
    return;
  }

  clipsTrack.innerHTML = state.timelineClips.map((c, i) => `
    <div class="t-clip-block${state.selectedClipIndex === i ? ' selected' : ''}" data-cidx="${i}" style="width:${Math.max(68, Math.round((Number(c.durationSec) || 4) * TIMELINE_PX_PER_SEC))}px;">
      <div class="t-clip-title">${i + 1}. ${c.isVid ? '🎬' : '🖼️'} ${escapeHtml(c.name)}</div>
      <div class="t-clip-meta">${Number(c.durationSec).toFixed(1)}s${c.rewind ? ' ⏪' : ''}${c.calloutText ? ' 📝' : ''}</div>
      <div class="t-clip-resize-handle" data-resize="${i}">⋮</div>
    </div>
  `).join('');

  if (transTrack) {
    transTrack.innerHTML = state.timelineClips.map((c, i) =>
      `<button type="button" class="t-trans-pill${state.selectedClipIndex === i ? ' selected' : ''}" data-tidx="${i}">
        ${getMiniTransitionIconSvg(c.transition)}
        <span>#${i + 1} ${shortTransLabel(c.transition)}</span>
      </button>`
    ).join('');
    transTrack.querySelectorAll('.t-trans-pill').forEach((btn) => {
      btn.onclick = () => {
        state.selectedClipIndex = Number(btn.dataset.tidx);
        state.timelinePlayheadSec = getClipStartOffset(state.selectedClipIndex) + 0.15;
        renderTimelineStudio();
      };
    });
  }

  clipsTrack.querySelectorAll('.t-clip-block').forEach((block) => {
    const idx = Number(block.dataset.cidx);
    const handle = block.querySelector('.t-clip-resize-handle');
    if (handle) {
      handle.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation(); ev.preventDefault();
        handle.setPointerCapture(ev.pointerId);
        const startX = ev.clientX;
        const startDur = Number(state.timelineClips[idx]?.durationSec || 4);
        const onMove = (mEv) => {
          const nextDur = Math.max(1.0, Math.min(60.0, Math.round((startDur + (mEv.clientX - startX) / TIMELINE_PX_PER_SEC) * 2) / 2));
          if (state.timelineClips[idx]) {
            state.timelineClips[idx].durationSec = nextDur;
            block.style.width = `${Math.max(68, Math.round(nextDur * TIMELINE_PX_PER_SEC))}px`;
          }
        };
        const onUp = () => {
          handle.removeEventListener('pointermove', onMove);
          handle.removeEventListener('pointerup', onUp);
          renderTimelineStudio(); aggiornaWaveformTimeline(); aggiornaInfoDurataPreview();
        };
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
      });
    }
    block.addEventListener('pointerdown', (ev) => {
      if (ev.target && ev.target.closest('.t-clip-resize-handle')) return;
      const startX = ev.clientX;
      let moved = false;
      block.setPointerCapture(ev.pointerId);
      const onMove = (mEv) => { if (Math.abs(mEv.clientX - startX) > 16) { moved = true; block.classList.add('dragging'); } };
      const onUp = (uEv) => {
        block.classList.remove('dragging');
        block.removeEventListener('pointermove', onMove);
        block.removeEventListener('pointerup', onUp);
        const dx = uEv.clientX - startX;
        if (moved && Math.abs(dx) > 36) {
          const tgt = Math.max(0, Math.min(state.timelineClips.length - 1, idx + (dx > 0 ? 1 : -1)));
          if (tgt !== idx) { spostaClipTimeline(idx, tgt); return; }
        }
        state.selectedClipIndex = idx;
        state.timelinePlayheadSec = getClipStartOffset(idx) + 0.12;
        renderTimelineStudio();
      };
      block.addEventListener('pointermove', onMove);
      block.addEventListener('pointerup', onUp);
    });
  });

  renderVisualTransitionsGallery();
  renderTimelineInspector();
  aggiornaPlayheadUI();
}

function stopTimelinePlayback() {
  state.timelinePlaying = false;
  cancelAnimationFrame(state.timelineRafId);
  if (_timelinePreviewAudioEl) _timelinePreviewAudioEl.pause();
  if ($('#btnTimelinePlay')) $('#btnTimelinePlay').textContent = '▶️ Play Timeline';
}

function toggleTimelinePlayback() {
  if (!state.timelineClips.length) { showToast('Carica almeno 1 clip!'); return; }
  if (state.timelinePlaying) { stopTimelinePlayback(); return; }
  const totalDur = getTimelineTotalDuration();
  if (state.timelinePlayheadSec >= totalDur - 0.1) state.timelinePlayheadSec = 0;
  state.timelinePlaying = true;
  if ($('#btnTimelinePlay')) $('#btnTimelinePlay').textContent = '⏸️ Pausa Timeline';
  if (state.audioPlaylist.length && state.audioPlaylist[0].url) {
    if (!_timelinePreviewAudioEl) _timelinePreviewAudioEl = new Audio();
    if (_timelinePreviewAudioEl.src !== state.audioPlaylist[0].url) _timelinePreviewAudioEl.src = state.audioPlaylist[0].url;
    try { _timelinePreviewAudioEl.currentTime = state.timelinePlayheadSec; _timelinePreviewAudioEl.play().catch(() => {}); } catch {}
  }
  let lastTs = performance.now();
  function step(now) {
    if (!state.timelinePlaying) return;
    const dt = Math.min(0.1, (now - lastTs) / 1000);
    lastTs = now;
    state.timelinePlayheadSec += dt;
    if (state.timelinePlayheadSec >= totalDur) { state.timelinePlayheadSec = totalDur; aggiornaPlayheadUI(); stopTimelinePlayback(); return; }
    aggiornaPlayheadUI();
    state.timelineRafId = requestAnimationFrame(step);
  }
  state.timelineRafId = requestAnimationFrame(step);
}

// Clip Centrale modal helpers
let _centralPreviewVidUrl = '';
function apriModalClipCentrale() {
  const idx = state.centralClip.index;
  if (idx < 0 || idx >= state.mediaFiles.length) return;
  const f = state.mediaFiles[idx];
  const vid = $('#centralPreviewVid');
  const aud = $('#centralPreviewAudio');
  if (_centralPreviewVidUrl) { URL.revokeObjectURL(_centralPreviewVidUrl); _centralPreviewVidUrl = ''; }
  if (f instanceof Blob) { _centralPreviewVidUrl = URL.createObjectURL(f); vid.src = _centralPreviewVidUrl; }
  else if (f.url) vid.src = f.url;
  vid.playbackRate = SPEED_LEVEL_MAP[String(state.centralClip.speedLevel)] || 1.0;
  if (state.audioPlaylist.length && state.audioPlaylist[0].url) aud.src = state.audioPlaylist[0].url;
  else aud.removeAttribute('src');
  $('#inpCentralTrimStart').value = state.centralClip.trimStart || 0;
  $('#inpCentralTrimEnd').value = state.centralClip.trimEnd || 0;
  $('#chkCentralCorridor').checked = Boolean(state.centralClip.corridorEnabled);
  $('#centralCorridorBox').style.display = state.centralClip.corridorEnabled ? 'grid' : 'none';
  renderCentralLevels('all');
  aggiornaCentralSummary();
  $('#modalCentralClip').classList.add('open');
}

function renderCentralLevels(mode = 'all') {
  const box = $('#centralLevelsRow');
  if (!box) return;
  const list = mode === 'slow' ? [-4, -3, -2, -1] : (mode === 'fast' ? [1, 2, 3, 4, 5, 6, 7] : [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7]);
  box.innerHTML = list.map((l) => `<button type="button" class="lvl-btn${state.centralClip.speedLevel === l ? ' active' : ''}" data-lvl="${l}">${l > 0 ? `+${l}` : l}<br><small>${SPEED_LEVEL_MAP[String(l)].toFixed(2)}x</small></button>`).join('');
  box.querySelectorAll('[data-lvl]').forEach((b) => {
    b.onclick = () => {
      state.centralClip.speedLevel = Number(b.dataset.lvl);
      $('#centralPreviewVid').playbackRate = SPEED_LEVEL_MAP[String(state.centralClip.speedLevel)] || 1.0;
      renderCentralLevels('all');
      aggiornaCentralSummary();
    };
  });
}

function aggiornaCentralSummary() {
  const box = $('#centralCalcSummary');
  if (!box || state.centralClip.index < 0) return;
  const newDur = calcolaDurataClipCentrale(state.mediaDurations[state.centralClip.index] || 20, state.centralClip);
  const lvl = state.centralClip.speedLevel;
  box.innerHTML = `⭐ Livello <strong>${lvl > 0 ? '+' + lvl : lvl}</strong> • Durata Clip Centrale: <strong>${fmtMMSS(newDur)}</strong>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIA 5: REGIA LIVE TV 24H, COPERTINA HD, STORIE PRESTIGIO & CONDIVISIONE
// ══════════════════════════════════════════════════════════════════════════════

function popolaSelectLiveImmobili() {
  const selF = $('#selFrasePrestigio');
  if (selF && !selF.options.length) {
    selF.innerHTML = FRASI_PRESTIGIO_STORIE.map((f) => `<option value="${escapeHtml(f.id)}">[${escapeHtml(f.categoria)}] ${escapeHtml(f.titolo)}</option>`).join('');
    $('#txtFrasePrestigioPreview').value = FRASI_PRESTIGIO_STORIE[0].colonnaF;
    selF.onchange = () => {
      const f = FRASI_PRESTIGIO_STORIE.find((x) => x.id === selF.value);
      if (f) $('#txtFrasePrestigioPreview').value = f.colonnaF;
    };
  }
}

async function chiamaRegiaLiveGet(paramsQuery, okMsg) {
  try {
    showToast('📡 Invio comando alla Regia Live TV...');
    const res = await fetch(`${GAS_WEBAPP_URL}?${paramsQuery}`);
    const data = await res.json().catch(() => ({ success: true }));
    showToast(data.success !== false ? okMsg : `⚠️ ${data.error || 'Risposta server'}`);
  } catch (err) {
    showToast('⚠️ Errore connessione Live TV: ' + err.message);
  }
}

function renderRisultatiStep5() {
  const box = $('#risultatiContainer');
  if (!box) return;
  box.innerHTML = state.risultati.map((r, i) => `
    <div class="card" style="margin-top:10px;">
      <h3>Formato ${r.formato} (${r.ext.toUpperCase()} • ${fmtMMSS(r.durataEffettiva)})</h3>
      ${r.videoUrl ? `<video src="${r.videoUrl}" controls playsinline class="preview-video"></video>` : ''}
      <div class="row-actions">
        ${r.videoUrl ? `<a class="btn btn-gold" href="${r.videoUrl}" download="spot_giancani_${r.formato.replace(':', 'x')}.${r.ext}">⬇️ Scarica Video</a>` : ''}
        <a class="btn btn-outline" href="${r.coverUrl}" download="copertina_giancani_${r.formato.replace(':', 'x')}.jpg">🖼️ Scarica Copertina HD</a>
      </div>
      <img src="${r.coverUrl}" class="preview-cover" alt="Copertina HD ${i + 1}">
    </div>
  `).join('');
}



export function bindVideoDirettaEvents() {
  // BIND CATEGORIA 4 (TIMELINE TOUCH, CLIP CENTRALE, AUDIO, TESTI, MONTAGGIO)
  const onAddMediaFiles = async (e) => {
    for (const f of Array.from(e.target.files || [])) {
      state.mediaFiles.push(f);
      let d = 4;
      if ((f.type || '').startsWith('video/')) {
        const u = URL.createObjectURL(f);
        d = await new Promise((res) => {
          const v = document.createElement('video'); v.preload = 'metadata';
          v.onloadedmetadata = () => res(Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 10);
          v.onerror = () => res(10); v.src = u; setTimeout(() => res(10), 2500);
        });
        URL.revokeObjectURL(u);
      }
      state.mediaDurations.push(d);
    }
    aggiornaListaMedia(); aggiornaInfoDurataPreview(); e.target.value = '';
  };
  $('#inpMediaFiles').onchange = onAddMediaFiles;
  if ($('#inpMediaFilesQuick')) $('#inpMediaFilesQuick').onchange = onAddMediaFiles;

  if ($('#btnApplyFxToAllClips')) {
    $('#btnApplyFxToAllClips').onclick = () => {
      const activeClip = state.timelineClips[state.selectedClipIndex];
      const chosen = activeClip ? (activeClip.transition || 'zoom_in_fast') : ($('#selEffetto')?.value || 'zoom_in_fast');
      state.timelineClips.forEach((c) => { c.transition = chosen; });
      if ($('#selEffetto')) $('#selEffetto').value = chosen;
      renderTimelineStudio();
      disegnaFrameTimelineCorrente();
      showToast(`🪄 Effetto "${FX_VISUAL_SVG_MAP[chosen]?.title || chosen}" applicato a tutte le clip!`);
    };
  }

  $('#inpAudioFile').onchange = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) { const { dur, url } = await misuraDurataAudio(f); state.audioPlaylist.push({ file: f, name: f.name, durationSec: dur, url }); }
    aggiornaPlaylistUI();
    e.target.value = '';
  };
  $('#btnClearAudio').onclick = () => {
    state.audioPlaylist.forEach((t) => { if (t.url) URL.revokeObjectURL(t.url); });
    state.audioPlaylist = []; aggiornaPlaylistUI();
  };

  // Timeline scrub, play, split, snap, inspector
  const scrubFromClientX = (clientX, targetEl) => {
    const rect = targetEl.getBoundingClientRect();
    state.timelinePlayheadSec = Math.min(Math.max(0.1, getTimelineTotalDuration()), Math.max(0, clientX - rect.left) / TIMELINE_PX_PER_SEC);
    aggiornaPlayheadUI();
  };
  ['#timelineRuler', '#timelineWaveformCanvas'].forEach((sel) => {
    const el = $(sel);
    if (!el) return;
    let dragging = false;
    el.addEventListener('pointerdown', (e) => { dragging = true; el.setPointerCapture(e.pointerId); scrubFromClientX(e.clientX, $('#timelineInnerTrack')); });
    el.addEventListener('pointermove', (e) => { if (dragging) scrubFromClientX(e.clientX, $('#timelineInnerTrack')); });
    el.addEventListener('pointerup', () => { dragging = false; });
  });
  $('#btnTimelinePlay').onclick = toggleTimelinePlayback;
  $('#btnTimelineResetPlayhead').onclick = () => { stopTimelinePlayback(); state.timelinePlayheadSec = 0; aggiornaPlayheadUI(); };
  $('#btnTimelineSplitClip').onclick = dividiClipSelezionata;
  $('#btnTimelineSnapBeats').onclick = allineaTutteClipAiBeat;
  $('#btnClipMoveLeft').onclick = () => spostaClipTimeline(state.selectedClipIndex, state.selectedClipIndex - 1);
  $('#btnClipMoveRight').onclick = () => spostaClipTimeline(state.selectedClipIndex, state.selectedClipIndex + 1);
  $('#btnClipDuplicate').onclick = () => duplicaClipTimeline(state.selectedClipIndex);
  $('#btnClipDelete').onclick = () => eliminaClipTimeline(state.selectedClipIndex);
  $('#btnClipRewindToggle').onclick = () => {
    const c = state.timelineClips[state.selectedClipIndex];
    if (c) { c.rewind = !c.rewind; renderTimelineStudio(); showToast(c.rewind ? '⏪ Rewind attivato!' : '▶️ Direzione normale'); }
  };
  $('#selClipSpeed').onchange = () => {
    const c = state.timelineClips[state.selectedClipIndex];
    if (c) { c.speedLevel = Number($('#selClipSpeed').value || 0); renderTimelineStudio(); }
  };
  const updClipDur = (val) => {
    const c = state.timelineClips[state.selectedClipIndex];
    if (!c) return;
    c.durationSec = Math.max(1.0, Math.min(60.0, Math.round(Number(val) * 2) / 2));
    renderTimelineStudio(); aggiornaWaveformTimeline(); aggiornaInfoDurataPreview();
  };
  $('#rngClipDuration').oninput = (e) => updClipDur(e.target.value);
  $('#btnClipDurMinus').onclick = () => { const c = state.timelineClips[state.selectedClipIndex]; if (c) updClipDur((c.durationSec || 4) - 0.5); };
  $('#btnClipDurPlus').onclick = () => { const c = state.timelineClips[state.selectedClipIndex]; if (c) updClipDur((c.durationSec || 4) + 0.5); };
  $('#selClipTransition').onchange = () => {
    const c = state.timelineClips[state.selectedClipIndex];
    if (c) { c.transition = $('#selClipTransition').value; renderTimelineStudio(); disegnaFrameTimelineCorrente(); }
  };
  $$('#clipEffectChips .chip').forEach((ch) => {
    ch.onclick = () => {
      const c = state.timelineClips[state.selectedClipIndex];
      if (c) { c.effectFilter = ch.dataset.clipefx || 'none'; renderTimelineInspector(); disegnaFrameTimelineCorrente(); }
    };
  });
  $('#inpClipCallout').oninput = () => { const c = state.timelineClips[state.selectedClipIndex]; if (c) { c.calloutText = $('#inpClipCallout').value; disegnaFrameTimelineCorrente(); } };
  $('#inpClipSubtitle').oninput = () => { const c = state.timelineClips[state.selectedClipIndex]; if (c) { c.subtitleText = $('#inpClipSubtitle').value; disegnaFrameTimelineCorrente(); } };
  $('#selClipFont').onchange = () => { const c = state.timelineClips[state.selectedClipIndex]; if (c) { c.fontId = $('#selClipFont').value; disegnaFrameTimelineCorrente(); } };
  $('#selClipSubStyle').onchange = () => { const c = state.timelineClips[state.selectedClipIndex]; if (c) { c.subtitleStyle = $('#selClipSubStyle').value; disegnaFrameTimelineCorrente(); } };

  // Clip Centrale
  $('#btnClearCentral').onclick = () => { state.centralClip.index = -1; aggiornaListaMedia(); };
  $('#btnOpenCentralModal').onclick = apriModalClipCentrale;
  $('#btnSaveCentralModal').onclick = () => {
    $('#centralPreviewVid').pause(); $('#centralPreviewAudio').pause();
    $('#modalCentralClip').classList.remove('open');
    aggiornaCentralBoxUI(); aggiornaInfoDurataPreview();
  };
  $('#btnSpdSlow').onclick = () => { state.centralClip.speedLevel = -2; renderCentralLevels('slow'); aggiornaCentralSummary(); };
  $('#btnSpdNorm').onclick = () => { state.centralClip.speedLevel = 0; renderCentralLevels('all'); aggiornaCentralSummary(); };
  $('#btnSpdFast').onclick = () => { state.centralClip.speedLevel = 2; renderCentralLevels('fast'); aggiornaCentralSummary(); };
  $('#btnCentralPlaySync').onclick = () => {
    const v = $('#centralPreviewVid'); const a = $('#centralPreviewAudio');
    if (!v.paused) { v.pause(); a.pause(); return; }
    v.currentTime = Number(state.centralClip.trimStart || 0); v.play().catch(() => {});
    if (a.src) { a.currentTime = 0; a.play().catch(() => {}); }
  };
  $('#btnCentralAutoMatch').onclick = () => {
    const songT = state.audioPlaylist.reduce((s, t) => s + (t.durationSec || 0), 0);
    if (songT < 4) { showToast('Carica prima una canzone!'); return; }
    state.centralClip.speedLevel = 1;
    renderCentralLevels('all'); aggiornaCentralSummary(); showToast('🎯 Velocità adattata alla canzone!');
  };
  $('#chkCentralCorridor').onchange = () => {
    state.centralClip.corridorEnabled = $('#chkCentralCorridor').checked;
    $('#centralCorridorBox').style.display = state.centralClip.corridorEnabled ? 'grid' : 'none';
    aggiornaCentralSummary();
  };
  $('#inpCentralTrimStart').oninput = () => { state.centralClip.trimStart = Number($('#inpCentralTrimStart').value || 0); aggiornaCentralSummary(); };
  $('#inpCentralTrimEnd').oninput = () => { state.centralClip.trimEnd = Number($('#inpCentralTrimEnd').value || 0); aggiornaCentralSummary(); };
  $('#inpCorrStart').oninput = () => { state.centralClip.corridorStart = Number($('#inpCorrStart').value || 0); aggiornaCentralSummary(); };
  $('#inpCorrEnd').oninput = () => { state.centralClip.corridorEnd = Number($('#inpCorrEnd').value || 0); aggiornaCentralSummary(); };
  $('#chkCentralEntriamo').onchange = () => { state.centralClip.entriamoFx = $('#chkCentralEntriamo').checked; aggiornaCentralSummary(); };
  $('#chkCentralKeepVoice').onchange = () => { state.centralClip.keepVoice = $('#chkCentralKeepVoice').checked; };

  // Testi & Archivio & Suno 3+ Min
  $$('[data-chip-target]').forEach((btn) => {
    btn.onclick = () => { const t = $(btn.dataset.chipTarget); if (t) t.value = btn.dataset.val; };
  });
  $$('.tab-btn').forEach((b) => {
    b.onclick = () => {
      $$('.tab-btn').forEach((x) => x.classList.remove('active'));
      $$('.tab-area').forEach((x) => x.classList.remove('active'));
      b.classList.add('active'); $(b.dataset.tab).classList.add('active');
    };
  });
  $('#btnGeneraTesti').onclick = async () => {
    const { geminiKey } = getSettings();
    const res = await generaTesti3In1(leggiSchedaForm(), geminiKey);
    state.testi = res;
    $('#txtCanzone').value = res.canzone; $('#txtDescrizione').value = res.descrizione; $('#txtSocial').value = res.social;
    showToast('✅ Testi Colonna F pronti!');
  };
  $('#btnOpenArchivio').onclick = () => {
    const renderArc = (q) => {
      const ql = (q || '').toLowerCase();
      const l = state.archivio.filter((x) => !ql || x.testo.toLowerCase().includes(ql) || x.zona.toLowerCase().includes(ql)).slice(0, 30);
      $('#archivioList').innerHTML = l.map((x, idx) => `<div class="archivio-item" data-arc="${idx}"><div class="archivio-meta">${escapeHtml(x.fonte)} • ${escapeHtml(x.zona)}</div><div class="archivio-text">${escapeHtml(x.testo.slice(0, 140))}...</div></div>`).join('') || '<div class="muted">Nessun risultato.</div>';
      $('#archivioList').querySelectorAll('[data-arc]').forEach((el) => {
        el.onclick = () => {
          const it = l[Number(el.dataset.arc)];
          $('#inpZona').value = it.zona; $('#inpTipo').value = it.tipologia; $('#inpDesc').value = normalizzaMetriQuadri(it.testo);
          $('#modalArchivio').classList.remove('open'); showToast('📂 Importato da Colonna F!');
        };
      });
    };
    renderArc('');
    $('#inpSearchArchivio').oninput = (e) => renderArc(e.target.value);
    $('#modalArchivio').classList.add('open');
  };
  $('#btnCloseArchivio').onclick = () => $('#modalArchivio').classList.remove('open');

  // Suno 3+ Minuti studio
  $('#btnOpenSunoModal').onclick = () => {
    const { promptSuno } = costruisciPromptSunoGemini(leggiSchedaForm());
    $('#txtPromptSuno').value = `${promptSuno} Style: ${$('#sunoStileSel').value}. Duration: ${$('#sunoDurataSel').value}+ min.`;
    $('#modalSuno').classList.add('open');
  };
  $('#btnCloseSuno').onclick = () => $('#modalSuno').classList.remove('open');
  $('#btnCopySuno').onclick = () => { navigator.clipboard.writeText($('#txtPromptSuno').value); showToast('📋 Prompt Suno copiato!'); };
  $('#btnSunoGenera3Min').onclick = async () => {
    const sched = leggiSchedaForm();
    const tema = $('#sunoTemaSel').value;
    const stile = $('#sunoStileSel').value;
    const dur = $('#sunoDurataSel').value;
    const mqTxt = `${sched.superficie || 120} metri quadri`;
    const btn = $('#btnSunoGenera3Min');
    btn.disabled = true; btn.textContent = '⏳ Composizione brano 3+ min...';
    const { promptSuno } = costruisciPromptSunoGemini({ ...sched, temi: tema });
    $('#txtPromptSuno').value = `${promptSuno} Style: ${stile}. Length: ${dur} minutes.`;

    // Prova Google Gemini AI se presente API key, altrimenti struttura lirica completa 3+ min
    const { geminiKey } = getSettings();
    let lyrics = '';
    if (geminiKey && geminiKey.trim().length > 15) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey.trim())}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Scrivi il testo completo di una canzone di ${dur} minuti ([INTRO], [STROFA 1], [RITORNELLO], [STROFA 2], [BRIDGE], [RITORNELLO FINALE], [OUTRO]) per ${sched.tipologia} a ${sched.zona} di ${mqTxt}. Integra "${tema}", la formula "Immobiliare Giancani vende", scrivi SEMPRE "metri quadri" per esteso e chiudi esattamente con "— Immobiliare Giancani".` }] }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          lyrics = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch {}
    }
    if (!lyrics) {
      lyrics = `[INTRO STRUMENTALE] (${stile} • ${dur} min)\nImmobiliare Giancani vende una splendida dimora a ${sched.zona}...\n\n[STROFA 1]\n${sched.tipologia} di ${mqTxt} immerso nella luce più pura,\n${sched.descrizione}, ogni spazio racconta sicurezza e cura.\n\n[RITORNELLO]\nImmobiliare Giancani vende il futuro che hai sempre sognato,\n${tema}, in un nido unico e amato!\n\n[STROFA 2]\nTra stanze ariose e finiture pensate per chi ami,\nogni metro quadro diventa felicità per oggi e per domani.\n\n[BRIDGE]\nNon è soltanto una casa di ${mqTxt}, è il cuore della tua storia!\n\n[RITORNELLO FINALE & OUTRO]\nImmobiliare Giancani vende a ${sched.zona}!\n— Immobiliare Giancani`;
    }
    $('#txtSunoLyrics3Min').value = forzaBrandingChiusura(lyrics).replace(/\s+— Immobiliare Giancani$/, '\n— Immobiliare Giancani');
    btn.disabled = false; btn.textContent = '🚀 COMPONI CANZONE COMPLETA 3+ MINUTI';
    showToast('🎵 Testo Canzone 3+ minuti pronto!');
  };
  $('#btnSunoTtsListen').onclick = () => leggiFraseConTTS($('#txtSunoLyrics3Min').value);
  $('#btnSunoUseInTimeline').onclick = () => {
    const v = $('#txtSunoLyrics3Min').value.trim();
    if (!v) return;
    $('#txtCanzone').value = v;
    $('#modalSuno').classList.remove('open');
    showToast('📥 Testo canzone impostato nei sottotitoli Timeline!');
  };
  $('#btnSunoSendTelegram').onclick = async () => {
    const v = $('#txtSunoLyrics3Min').value.trim();
    if (!v) return;
    try {
      await gasPostJson({ action: 'invia_canzone_telegram', titolo: `${$('#inpTipo').value} ${$('#inpZona').value}`, stile: $('#sunoStileSel').value, tema: $('#sunoTemaSel').value, testo: v });
      showToast('📱 Canzone inviata su Telegram!');
    } catch { showToast('⚠️ Verifica connessione Apps Script per Telegram.'); }
  };

  // Logo toggle & settings
  $('#selMostraLogo').onchange = () => { $('#logoAnimGroup').style.display = $('#selMostraLogo').value === 'si' ? 'block' : 'none'; };
  $('#selDurataVideo').onchange = aggiornaInfoDurataPreview;
  $('#selOutro').onchange = aggiornaInfoDurataPreview;
  $('#btnOpenSettings').onclick = () => $('#modalSettings').classList.add('open');
  $('#btnCloseSettings').onclick = () => $('#modalSettings').classList.remove('open');
  $('#btnSaveSettings').onclick = () => {
    saveSettings({ geminiKey: $('#inpGeminiKey').value.trim(), telefono: $('#inpTelefono').value.trim() });
    $('#modalSettings').classList.remove('open');
    showToast('⚙️ Impostazioni salvate!');
  };

  // Avvio Montaggio Video On-Device
  $('#btnAvviaMontaggio').onclick = async () => {
    if (!state.mediaFiles.length) { showToast('Seleziona almeno 1 foto o video!'); return; }
    const fmtSel = $('#selFormato').value;
    const formati = fmtSel === 'entrambi' ? ['9:16', '16:9'] : [fmtSel];
    $('#progressBox').style.display = 'block';
    $('#btnAvviaMontaggio').disabled = true;
    state.risultati.forEach((r) => { if (r.videoUrl) URL.revokeObjectURL(r.videoUrl); if (r.coverUrl) URL.revokeObjectURL(r.coverUrl); });
    state.risultati = [];
    try {
      for (const fmt of formati) {
        const res = await renderizzaVideoOnDevice({
          filesMedia: state.mediaFiles,
          timelineClips: state.timelineClips,
          audioFiles: state.audioPlaylist.map((t) => t.file),
          audioOverflowMode: $('#selAudioOverflow').value,
          durataOpzione: $('#selDurataVideo').value,
          logoAnimation: $('#selLogoAnim').value,
          mostraLogo: $('#selMostraLogo').value === 'si',
          centralConfig: state.centralClip.index >= 0 ? { ...state.centralClip } : null,
          logoUrl: state.logoUrl,
          scheda: leggiSchedaForm(),
          testoCanzone: $('#txtCanzone').value.trim() || state.testi.canzone,
          formato: fmt,
          effetto: $('#selEffetto').value,
          outroSec: Number($('#selOutro').value || 4),
          sottotitoliAttivi: $('#chkSubs').checked,
          antiShake: $('#chkAntiShake').checked,
          telefono: getSettings().telefono,
          mostraContatti: $('#chkContatti').checked,
          onProgress: (pct, msg) => { $('#progressFill').style.width = `${pct}%`; $('#progressLabel').textContent = `[${fmt}] ${pct}% — ${msg}`; }
        });
        state.risultati.push({ ...res, videoUrl: URL.createObjectURL(res.videoBlob), coverUrl: URL.createObjectURL(res.coverBlob) });
      }
      renderRisultatiStep5();
      goStep(5);
      showToast('🎉 Montaggio completato! Pronto per la condivisione!');
    } catch (err) {
      showToast('❌ Errore montaggio: ' + (err?.message || 'riprova'));
    } finally {
      $('#btnAvviaMontaggio').disabled = false;
    }
  };

  // BIND CATEGORIA 5 (SHARE, COPERTINA HD, REGIA LIVE TV & FRASI PRESTIGIO)
  $('#btnGenQuickCover').onclick = async () => {
    const sched = leggiSchedaForm();
    const coverBlob = await generaCopertinaHDFromFiles(
      state.mediaFiles, state.logoUrl, sched, $('#selFormato')?.value === '16:9' ? '16:9' : '9:16',
      $('#selLogoAnim')?.value || 'shimmer_glow', $('#selMostraLogo')?.value === 'si'
    );
    state.risultati.unshift({ formato: 'Cover HD', ext: 'jpg', durataEffettiva: 0, coverBlob, coverUrl: URL.createObjectURL(coverBlob), videoUrl: '' });
    renderRisultatiStep5();
    showToast('🖼️ Copertina HD generata!');
  };
  $('#btnCondividiNativo').onclick = async () => {
    const r = state.risultati.find((x) => x.videoBlob) || state.risultati[0];
    if (!r) { showToast('Monta prima un video o genera una Copertina HD!'); return; }
    const copyText = $('#txtSocial').value.trim() || 'Immobiliare Giancani vende — Immobiliare Giancani';
    const blob = r.videoBlob || r.coverBlob;
    const file = new File([blob], `spot_giancani.${r.ext || 'mp4'}`, { type: blob.type || 'video/mp4' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ title: 'Immobiliare Giancani', text: copyText, files: [file] }); return; } catch {}
    }
    navigator.clipboard.writeText(copyText).catch(() => {});
    showToast('📋 Testo social copiato! Scarica il file qui sotto.');
  };
  $('#btnCopySocialStep3').onclick = () => {
    navigator.clipboard.writeText($('#txtSocial').value.trim() || forzaBrandingChiusura($('#inpDesc').value));
    showToast('📋 Testo Social Colonna F copiato!');
  };
  $('#btnShareToBuyerMatch').onclick = () => {
    const s = leggiSchedaForm();
    ponteImmobileAAcquirenti({
      titolo: `${s.tipologia} a ${s.zona}`, comune: s.zona, tipologia: s.tipologia,
      superficie: `${s.superficie || 120} metri quadri`, prezzo: 'Trattativa Riservata',
      testoColonnaF: forzaBrandingChiusura(s.descrizione)
    });
  };

  // Regia Live TV
  $('#btnLiveAvatarOn').onclick = () => chiamaRegiaLiveGet('action=imposta_modalita_avatar&mode=CON_AVATAR', '✅ Avatar ATTIVI in Diretta Live!');
  $('#btnLiveAvatarOff').onclick = () => chiamaRegiaLiveGet('action=imposta_modalita_avatar&mode=VUOTO', '✅ Modalità Solo Immobile attivata!');
  $('#selLiveCoppia').onchange = () => {
    const v = $('#selLiveCoppia').value;
    const q = v === 'daria_antonio' ? 'donna=daria&uomo=antonio&primario=donna' : (v === 'solo_daria' ? 'donna=daria&modalita=solo_daria' : (v === 'solo_antonio' ? 'uomo=antonio&modalita=solo_uomo' : 'donna=daria&uomo=dario&primario=donna'));
    chiamaRegiaLiveGet(`action=imposta_coppia_avatar&${q}`, '🎭 Conduttori Live aggiornati!');
  };
  $('#rngLiveZoom').oninput = () => { $('#lblLiveZoomVal').textContent = `${$('#rngLiveZoom').value}%`; };
  $('#btnLiveApplyZoom').onclick = () => chiamaRegiaLiveGet(`action=imposta_zoom&zoom=${encodeURIComponent($('#rngLiveZoom').value)}`, `🔍 Zoom Diretta impostato al ${$('#rngLiveZoom').value}%!`);
  $('#btnLiveSetImmobile').onclick = () => {
    const tab = $('#selLiveImmobile').value;
    if (!tab) { showToast('Seleziona un Immobile Sheet!'); return; }
    chiamaRegiaLiveGet(`action=set_immobile_attivo&tab=${encodeURIComponent(tab)}`, `📺 "${tab}" ora in onda in Diretta Live!`);
  };
  $('#btnLiveSendChat').onclick = () => {
    const msg = $('#inpLiveChatSim').value.trim();
    if (!msg) return;
    chiamaRegiaLiveGet(`action=invia_commento_chat&autore=Regia%20Mobile&messaggio=${encodeURIComponent(msg)}`, '💬 Domanda inviata in onda a DarIA!');
    $('#inpLiveChatSim').value = '';
  };

  // Frasi Prestigio Storie
  $('#btnPrestigioTts').onclick = () => leggiFraseConTTS($('#txtFrasePrestigioPreview').value);
  $('#btnPrestigioUseInVideo').onclick = () => {
    const f = forzaBrandingChiusura($('#txtFrasePrestigioPreview').value);
    $('#txtCanzone').value = f;
    $('#txtSocial').value = f;
    showToast('🎬 Frase Prestigio Colonna F applicata a Sottotitoli & Copy!');
    goStep(4);
  };
}

export {
  ponteImmobileAMontaVideo, aggiornaListaMedia, aggiornaPlaylistUI, aggiornaWaveformTimeline,
  renderTimelineStudio, aggiornaInfoDurataPreview, stopTimelinePlayback,
  renderVisualTransitionsGallery, popolaSelectLiveImmobili, renderRisultatiStep5
};
