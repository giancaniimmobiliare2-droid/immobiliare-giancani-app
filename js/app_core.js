import { getLogoDataUrl } from './storage.js';

export const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwTAyOTWpm3mNGX-DAWbZ7XOtrog52md5-P_jUEHoEhsoXCrJGj_bLClOiDvo5FKUbpWg/exec';
export const ORDINALS_IT = ['1° Prima', '2° Seconda', '3° Terza', '4° Quarta', '5° Quinta', '6° Sesta', '7° Settima', '8° Ottava'];
export const TIMELINE_PX_PER_SEC = 28;

export const STEP_AREA_TITLES = {
  0: '🏠 Home Aree • Hub Agenzia',
  1: '🏷️ Area Venditori & Cacciatori (30gg)',
  2: '🤝 Area Acquirenti & Smart Match AI',
  3: '🖼️ Area Galleria & Foto (Generator DarIA)',
  4: '🎬 Area Studio Video & Timeline Touch',
  5: '📺 Area Regia Live TV 24H & Share'
};

export const state = {
  step: 0,
  logoUrl: './assets/logo_default.png',
  logoImgObj: null,
  stopLogoPreview: null,
  cacciatoriList: [],
  cacciatoriMemCloud: {},
  vndSub: 'coda',
  vndComune: 'TUTTI',
  vndCodaFilter: 'DA_CONTATTARE',
  vndSoloRibassi: false,
  vndSaltatiIds: [],
  vndSaltatiComuni: [],
  acquirenti: [],
  acqMatchContext: null,
  driveLoaded: false,
  driveFolders: [],
  selectedFolder: null,
  selectedFolderFiles: [],
  uploadQueueFiles: [],
  sheetImmobili: [],
  activeSheetTab: '',
  activeSheetItems: [],
  activeSheetScheda: null,
  galFilterType: 'tutti',
  galSelectedIndices: new Set(),
  galExcludedMap: {},
  basiMusicaliDrive: [],
  videoSenzaTestoDrive: [],
  editorQueueIdx: -1,
  editorSheetIdx: -1,
  editorImgObj: null,
  editorOpts: {
    brightness: 100, contrast: 100, saturation: 100,
    maskEnabled: false, maskX: 50, maskY: 50, maskSize: 80, maskOpacity: 95,
    logoPosition: 'centrale_semitrasparente'
  },
  pano360Img: null,
  pano360Yaw: 0,
  pano360Pitch: 0,
  pano360AutoSpin: false,
  pano360Raf: 0,
  smartTargetSetter: null,
  mediaFiles: [],
  audioPlaylist: [],
  archivio: [],
  testi: { canzone: '', descrizione: '', social: '' },
  risultati: [],
  mediaDurations: [],
  timelineClips: [],
  selectedClipIndex: -1,
  timelinePlayheadSec: 0,
  timelinePlaying: false,
  timelineRafId: 0,
  timelineWaveform: {
    hasAudio: false, peaks: [], beats: [], trackBoundaries: [], totalSongDuration: 0, effectiveDuration: 22
  },
  previewMediaCache: [],
  centralClip: {
    index: -1, speedLevel: 0, trimStart: 0, trimEnd: 0,
    corridorEnabled: false, corridorStart: 10, corridorEnd: 18, corridorSpeed: 2.0,
    entriamoFx: true, keepVoice: false
  },
  deferredPrompt: null
};

export const uiHooks = {
  goStep: () => {},
  aggiornaGlobalKpiStrip: () => {},
  renderVenditoriAll: () => {},
  renderAcquirentiAll: () => {},
  ponteVenditoreAInserzione: () => {},
  ponteImmobileAMontaVideo: () => {},
  ponteImmobileAAcquirenti: () => {},
  caricaCartelleDrive: async () => {},
  caricaElencoFogliSheet: async () => {},
  popolaSelectLiveImmobili: () => {},
  aggiornaListaMedia: () => {},
  aggiornaPlaylistUI: () => {},
  aggiornaWaveformTimeline: () => {},
  renderTimelineStudio: () => {},
  aggiornaInfoDurataPreview: () => {},
  stopTimelinePlayback: () => {},
  avviaPreviewLogoStep2: () => {}
};

export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => Array.from(document.querySelectorAll(sel));

export function showToast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

export function fmtMMSS(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function toggleSideDrawer(open) {
  const drw = $('#sideDrawer');
  const ov = $('#sideDrawerOverlay');
  if (!drw || !ov) return;
  const isOpen = typeof open === 'boolean' ? open : !drw.classList.contains('open');
  drw.classList.toggle('open', isOpen);
  ov.classList.toggle('open', isOpen);
}

export async function ricaricaLogoOggetto() {
  state.logoUrl = await getLogoDataUrl();
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => { state.logoImgObj = img; };
  img.src = state.logoUrl;
}
