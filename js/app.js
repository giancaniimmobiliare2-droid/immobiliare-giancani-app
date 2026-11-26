import { getSettings, saveLogoDataUrl } from './storage.js';
import { avviaAnteprimaLogoCanvas } from './video_engine.js';
import { caricaAcquirentiCRM, loadCacciatoriDataset, sincronizzaMemoriaCloud } from './crm_venditori_acquirenti.js';
import { loadArchivioColonnaF } from './storage.js';
import {
  state, uiHooks, $, $$, showToast, toggleSideDrawer, ricaricaLogoOggetto
} from './app_core.js';
import {
  renderVenditoriAll, selezionaVndSubTab, ponteVenditoreAInserzione, bindVenditoriEvents
} from './venditori_ui.js';
import {
  renderAcquirentiAll, ponteImmobileAAcquirenti, bindAcquirentiEvents
} from './acquirenti_ui.js';
import {
  selezionaInsSubTab, initInserzioniGeneratorUI, caricaCartelleDrive,
  caricaElencoFogliSheet, bindGalleriaEvents
} from './galleria_ui.js';
import {
  ponteImmobileAMontaVideo, aggiornaListaMedia, aggiornaPlaylistUI,
  aggiornaWaveformTimeline, renderTimelineStudio, aggiornaInfoDurataPreview,
  stopTimelinePlayback, renderVisualTransitionsGallery, popolaSelectLiveImmobili,
  bindVideoDirettaEvents
} from './video_diretta_ui.js';
import {
  renderGrigliaModuliSettore, initDocViewerModal, initTutorialModal,
  initFoglioVisitaWidget, initSimulatoreMutuoWidget, initAgendaGiornoWidget
} from './agenda_fogli_visita.js';

const STEP_AREA_TITLES = {
  0: '🏠 Home Aree • Hub Agenzia',
  1: '🏷️ Area Venditori & Cacciatori (30gg)',
  2: '🤝 Area Acquirenti & Smart Match AI',
  3: '🖼️ Area Galleria & Foto (Generator DarIA)',
  4: '🎬 Area Studio Video & Timeline Touch',
  5: '📺 Area Regia Live TV 24H & Share'
};

function aggiornaGlobalKpiStrip() {
  const readyVnd = state.cacciatoriList.filter((x) => x.cat === 'privato' && (x.telefono || x.email_contatto)).length;
  const acqCount = state.acquirenti.length;
  const insCount = state.sheetImmobili.length || state.archivio.length;
  const clipCount = state.timelineClips.length;

  if ($('#kpiStripVenditori')) $('#kpiStripVenditori').textContent = String(readyVnd);
  if ($('#kpiStripAcquirenti')) $('#kpiStripAcquirenti').textContent = String(acqCount);
  if ($('#kpiStripInserzioni')) $('#kpiStripInserzioni').textContent = String(insCount);
  if ($('#kpiStripClip')) $('#kpiStripClip').textContent = String(clipCount);

  if ($('#homeBadgeVenditori')) $('#homeBadgeVenditori').textContent = String(readyVnd);
  if ($('#homeBadgeAcquirenti')) $('#homeBadgeAcquirenti').textContent = String(acqCount);
  if ($('#homeBadgeGalleria')) $('#homeBadgeGalleria').textContent = String(insCount);

  if ($('#drawerBadgeVnd')) $('#drawerBadgeVnd').textContent = String(readyVnd);
  if ($('#drawerBadgeAcq')) $('#drawerBadgeAcq').textContent = String(acqCount);
  if ($('#drawerBadgeIns')) $('#drawerBadgeIns').textContent = String(insCount);
  if ($('#drawerBadgeClip')) $('#drawerBadgeClip').textContent = String(clipCount);
}

function avviaPreviewLogoStep2() {
  if (state.stopLogoPreview) { state.stopLogoPreview(); state.stopLogoPreview = null; }
  const cvs = $('#previewLogoCanvas');
  if (cvs) state.stopLogoPreview = avviaAnteprimaLogoCanvas(cvs, state.logoUrl);
}

function goStep(n) {
  state.step = n;
  toggleSideDrawer(false);
  $$('.step-panel').forEach((el) => el.classList.toggle('active', Number(el.dataset.step) === n));
  $$('.nav-btn').forEach((el) => el.classList.toggle('active', Number(el.dataset.step) === n));
  $$('[data-drawer-step]').forEach((el) => el.classList.toggle('active', Number(el.dataset.drawerStep) === n));
  if ($('#lblCurrentAreaTop')) $('#lblCurrentAreaTop').textContent = STEP_AREA_TITLES[n] || STEP_AREA_TITLES[0];

  if (n === 1) renderVenditoriAll();
  if (n === 2) renderAcquirentiAll();
  if (n === 3 && !state.driveLoaded) caricaCartelleDrive();
  if (n === 4) {
    avviaPreviewLogoStep2();
    aggiornaInfoDurataPreview();
    renderTimelineStudio();
    renderVisualTransitionsGallery();
  } else {
    if (state.stopLogoPreview) { state.stopLogoPreview(); state.stopLogoPreview = null; }
    stopTimelinePlayback();
  }
  if (n === 5) popolaSelectLiveImmobili();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Registra i ponti condivisi per i moduli di settore
Object.assign(uiHooks, {
  goStep,
  aggiornaGlobalKpiStrip,
  renderVenditoriAll,
  renderAcquirentiAll,
  ponteVenditoreAInserzione,
  ponteImmobileAMontaVideo,
  ponteImmobileAAcquirenti,
  caricaCartelleDrive,
  caricaElencoFogliSheet,
  popolaSelectLiveImmobili,
  aggiornaListaMedia,
  aggiornaPlaylistUI,
  aggiornaWaveformTimeline,
  renderTimelineStudio,
  aggiornaInfoDurataPreview,
  stopTimelinePlayback,
  avviaPreviewLogoStep2,
  ricaricaLogoOggetto
});

function bindNavigationEvents() {
  // Delegazione globale robusta: funziona sempre anche prima/dopo il caricamento dati
  document.addEventListener('click', (e) => {
    const vndBtn = e.target.closest('[data-home-vnd-sub]');
    if (vndBtn) {
      e.stopPropagation();
      goStep(1);
      try { selezionaVndSubTab(vndBtn.dataset.homeVndSub); } catch {}
      return;
    }
    const insBtn = e.target.closest('[data-home-ins-sub]');
    if (insBtn) {
      e.stopPropagation();
      goStep(3);
      try { selezionaInsSubTab(insBtn.dataset.homeInsSub); } catch {}
      return;
    }
    const drawerStepBtn = e.target.closest('[data-drawer-step]');
    if (drawerStepBtn) {
      goStep(Number(drawerStepBtn.dataset.drawerStep));
      return;
    }
    const navBtn = e.target.closest('.nav-btn');
    if (navBtn) {
      goStep(Number(navBtn.dataset.step));
      return;
    }
    const jumpBtn = e.target.closest('[data-jump-step]');
    if (jumpBtn) {
      if (e.target.closest('button') && e.target.closest('button') !== jumpBtn) return;
      goStep(Number(jumpBtn.dataset.jumpStep));
    }
  });

  if ($('#btnOpenDrawer')) $('#btnOpenDrawer').onclick = () => toggleSideDrawer(true);
  if ($('#btnCloseDrawer')) $('#btnCloseDrawer').onclick = () => toggleSideDrawer(false);
  if ($('#sideDrawerOverlay')) $('#sideDrawerOverlay').onclick = () => toggleSideDrawer(false);
  if ($('#btnGoHomeTop')) $('#btnGoHomeTop').onclick = () => goStep(0);
  if ($('#imgLogoHeader')) $('#imgLogoHeader').onclick = () => goStep(0);
  if ($('#brandHomeClick')) $('#brandHomeClick').onclick = () => goStep(0);

  if ($('#btnDrawerOpenSuno')) $('#btnDrawerOpenSuno').onclick = () => {
    goStep(4);
    setTimeout(() => $('#btnOpenSunoModal')?.click(), 180);
  };
  if ($('#btnDrawerOpenArchivio')) $('#btnDrawerOpenArchivio').onclick = () => {
    goStep(4);
    setTimeout(() => $('#btnPickArchivio')?.click(), 180);
  };
  if ($('#btnDrawerSyncCloud')) $('#btnDrawerSyncCloud').onclick = () => {
    toggleSideDrawer(false);
    $('#btnGlobalSync')?.click();
  };
}

async function init() {
  // 1) Collega SUBITO la navigazione così i clic funzionano sempre al 100%
  try { bindNavigationEvents(); } catch (e) { console.error('Nav bind error:', e); }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=14').catch(() => {});
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); state.deferredPrompt = e;
    if ($('#btnInstallPwa')) $('#btnInstallPwa').style.display = 'inline-flex';
  });
  if ($('#btnInstallPwa')) {
    $('#btnInstallPwa').onclick = async () => {
      if (!state.deferredPrompt) return;
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
      if ($('#btnInstallPwa')) $('#btnInstallPwa').style.display = 'none';
    };
  }

  try {
    await ricaricaLogoOggetto();
  } catch (e) { console.warn('Logo init fallback:', e); }
  if ($('#imgLogoHeader')) $('#imgLogoHeader').src = state.logoUrl;
  if ($('#imgLogoDrawer')) $('#imgLogoDrawer').src = state.logoUrl;

  try {
    const settings = getSettings();
    if ($('#inpGeminiKey')) $('#inpGeminiKey').value = settings.geminiKey || '';
    if ($('#inpTelefono')) $('#inpTelefono').value = settings.telefono || '320 166 7156';
  } catch (e) { console.warn('Settings init fallback:', e); }

  try {
    const [caccData, archivioData] = await Promise.all([
      loadCacciatoriDataset().catch(() => ({ dataset: [], memoriaCloud: {} })),
      loadArchivioColonnaF().catch(() => [])
    ]);
    state.cacciatoriList = caccData.dataset || [];
    state.cacciatoriMemCloud = caccData.memoriaCloud || {};
    state.archivio = archivioData || [];
  } catch (e) { console.warn('Dataset init fallback:', e); }

  try { state.acquirenti = caricaAcquirentiCRM(); } catch (e) { state.acquirenti = []; }

  const safeRun = (label, fn) => {
    try { fn(); } catch (e) { console.error(`[Init ${label}]`, e); }
  };

  safeRun('InserzioniGenerator', () => initInserzioniGeneratorUI());
  safeRun('Venditori', () => renderVenditoriAll());
  safeRun('Acquirenti', () => renderAcquirentiAll());
  safeRun('VisualTransitions', () => renderVisualTransitionsGallery());
  safeRun('GlobalKpi', () => aggiornaGlobalKpiStrip());

  sincronizzaMemoriaCloud().then((m) => {
    Object.assign(state.cacciatoriMemCloud, m || {});
    safeRun('VenditoriSync', () => renderVenditoriAll());
    safeRun('GlobalKpiSync', () => aggiornaGlobalKpiStrip());
  }).catch(() => {});

  if ($('#btnGlobalSync')) {
    $('#btnGlobalSync').onclick = async () => {
      showToast('🔄 Sincronizzazione Cloud 30gg & Drive...');
      const [m] = await Promise.all([sincronizzaMemoriaCloud().catch(() => ({})), caricaCartelleDrive().catch(() => {})]);
      Object.assign(state.cacciatoriMemCloud, m || {});
      safeRun('VenditoriSyncBtn', () => renderVenditoriAll());
      safeRun('GlobalKpiSyncBtn', () => aggiornaGlobalKpiStrip());
      showToast('✅ Tutto sincronizzato con il Cloud!');
    };
  }

  if ($('#inpLogoFile')) {
    $('#inpLogoFile').onchange = async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = async () => {
        await saveLogoDataUrl(reader.result);
        await ricaricaLogoOggetto();
        if ($('#imgLogoHeader')) $('#imgLogoHeader').src = state.logoUrl;
        if ($('#imgLogoDrawer')) $('#imgLogoDrawer').src = state.logoUrl;
        if (state.step === 4) avviaPreviewLogoStep2();
        showToast('✅ Logo aggiornato in tutte le aree!');
      };
      reader.readAsDataURL(f);
    };
  }

  // Binding modulari di settore (protetti singolarmente)
  safeRun('bindVenditori', () => bindVenditoriEvents());
  safeRun('bindAcquirenti', () => bindAcquirentiEvents());
  safeRun('bindGalleria', () => bindGalleriaEvents());
  safeRun('bindVideoDiretta', () => bindVideoDirettaEvents());

  safeRun('aggiornaListaMedia', () => aggiornaListaMedia());
  safeRun('aggiornaPlaylistUI', () => aggiornaPlaylistUI());
  safeRun('aggiornaWaveformTimeline', () => aggiornaWaveformTimeline());
  safeRun('initDocViewerModal', () => initDocViewerModal());
  safeRun('initTutorialModal', () => initTutorialModal((step) => goStep(step)));
  safeRun('initFoglioVisitaWidget', () => initFoglioVisitaWidget());
  safeRun('initSimulatoreMutuoWidget', () => initSimulatoreMutuoWidget());
  safeRun('initAgendaGiornoWidget', () => initAgendaGiornoWidget());
  safeRun('sectorDocsAgenda', () => renderGrigliaModuliSettore('agenda', 'sectorDocsAgenda'));
  safeRun('sectorDocsVenditori', () => renderGrigliaModuliSettore('venditori', 'sectorDocsVenditori'));
  safeRun('sectorDocsAcquirenti', () => renderGrigliaModuliSettore('acquirenti', 'sectorDocsAcquirenti'));
  safeRun('sectorDocsStudio', () => renderGrigliaModuliSettore('studio', 'sectorDocsStudio'));
  safeRun('sectorDocsDiretta', () => renderGrigliaModuliSettore('diretta', 'sectorDocsDiretta'));
}

document.addEventListener('DOMContentLoaded', init);
