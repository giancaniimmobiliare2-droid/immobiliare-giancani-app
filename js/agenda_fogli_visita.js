/**
 * Modulo Agenda del Giorno, Fogli Visita, Simulatore Mutuo e Lancio Moduli di Settore
 * Immobiliare Giancani App
 */

const STORAGE_FOGLI_VISITA = 'giancani_fogli_visita_v1';
const STORAGE_AGENDA_GIORNO = 'giancani_agenda_giorno_v1';
const GAS_VISITA_URL =
  'https://script.google.com/macros/s/AKfycbwEeH82YCSoOc-KRZx6pSQa_k3Kb5i252_Ajljlo20IOBinGiqA1E0ZE_2gKljHpLu3/exec';

export const MODULI_PER_SETTORE = {
  venditori: [
    { file: 'docs_agenda/FoglioVisita.html', titolo: 'Foglio Visita Completo', icon: '📝', desc: 'Modulo visita completo con OCR, OTP e GPS' },
    { file: 'docs_agenda/FirmaRemotaVisita.html', titolo: 'Firma Remota Visita', icon: '✍️', desc: 'Link firma cliente a distanza per foglio visita' },
    { file: 'docs_agenda/IncaricoVendita.html', titolo: 'Incarico di Vendita', icon: '📄', desc: 'Compilazione incarico di mediazione immobiliare' },
    { file: 'docs_agenda/FirmaIncarico.html', titolo: 'Firma Incarico', icon: '🖋️', desc: 'Acquisizione firma su incarico di vendita' },
    { file: 'docs_agenda/FirmaRemota.html', titolo: 'Firma Remota Incarico', icon: '📲', desc: 'Firma a distanza proprietario venditore' },
    { file: 'docs_agenda/Bozzeincarichi.html', titolo: 'Bozze Incarichi', icon: '🗂️', desc: 'Archivio bozze incarichi in lavorazione' },
    { file: 'docs_agenda/PannelloBozze.html', titolo: 'Pannello Bozze', icon: '📋', desc: 'Gestione rapida bozze incarichi e mandati' },
    { file: 'docs_agenda/PannelloBozzeTotale.html', titolo: 'Pannello Bozze Totale', icon: '📑', desc: 'Vista completa tutte le bozze e stati' },
    { file: 'docs_agenda/FoglioDocumentazione.html', titolo: 'Foglio Documentazione', icon: '📂', desc: 'Checklist documenti catastali e urbanistici' },
    { file: 'docs_agenda/FirmaRemotaDocumentazione.html', titolo: 'Firma Remota Documenti', icon: '🔐', desc: 'Conferma consegna documenti da remoto' },
    { file: 'docs_agenda/PortaleTecnico.html', titolo: 'Portale Tecnico', icon: '📐', desc: 'Conformita urbanistica, catasto e planimetrie' },
    { file: 'docs_agenda/ReportVenditore.html', titolo: 'Report Venditore', icon: '📊', desc: 'Resoconto visite e riscontri per il proprietario' },
    { file: 'docs_agenda/InserisciImmobileOnPaper.html', titolo: 'Inserisci Immobile', icon: '🏠', desc: 'Scheda rapida acquisizione immobile' },
    { file: 'docs_agenda/CacciatoriImmobili.html', titolo: 'Cacciatori Immobili Web', icon: '🕵️', desc: 'Pannello classico cacciatori immobili' }
  ],
  acquirenti: [
    { file: 'docs_agenda/SimulatoreMutuo.html', titolo: 'Simulatore Mutuo 80%', icon: '🏦', desc: 'Calcolo rata mutuo e fattibilita in agenzia' },
    { file: 'docs_agenda/AreaRiservataAcquirenti.html', titolo: 'Area Riservata Acquirenti', icon: '🔑', desc: 'Portale dedicato ai clienti acquirenti' },
    { file: 'docs_agenda/VipAcquirenti.html', titolo: 'VIP Acquirenti', icon: '⭐', desc: 'Lista prioritaria clienti qualificati' },
    { file: 'docs_agenda/PrecompilazioneCliente.html', titolo: 'Precompilazione Cliente', icon: '🧾', desc: 'Raccolta dati e preferenze acquisto' },
    { file: 'docs_agenda/MappaImmobili.html', titolo: 'Mappa Immobili', icon: '🗺️', desc: 'Geolocalizzazione catalogo immobili' },
    { file: 'docs_agenda/VetrinaMappaComune.html', titolo: 'Vetrina Mappa Comune', icon: '📍', desc: 'Immobili divisi per comune e zona' },
    { file: 'docs_agenda/VetrinaReels.html', titolo: 'Vetrina Reels', icon: '🎞️', desc: 'Vetrina video verticali per acquirenti' }
  ],
  agenda: [
    { file: 'docs_agenda/Index.html', titolo: 'Agenda del Giorno (Originale)', icon: '📅', desc: 'Agenda completa giancaniimmobiliare@gmail.com' },
    { file: 'docs_agenda/CentraleOperativa.html', titolo: 'Centrale Operativa', icon: '🧭', desc: 'Cabina di regia operativa agenzia' },
    { file: 'docs_agenda/DashboardTotale.html', titolo: 'Dashboard Totale', icon: '📈', desc: 'KPI, incarichi, visite e vendite' },
    { file: 'docs_agenda/DariaCommandCenter.html', titolo: 'DarIA Command Center', icon: '🤖', desc: 'Centro comandi assistente DarIA' },
    { file: 'docs_agenda/StanzaDaria.html', titolo: 'Stanza DarIA', icon: '✨', desc: 'Interfaccia dedicata DarIA agenzia' },
    { file: 'docs_agenda/Chat.html', titolo: 'Chat Interna Agenzia', icon: '💬', desc: 'Messaggistica operativa team' },
    { file: 'docs_agenda/Funzioni.html', titolo: 'Utility & Funzioni', icon: '🛠️', desc: 'Strumenti rapidi agenda e portale' }
  ],
  studio: [
    { file: 'docs_diretta/Gen_Tab_BotStorie.html', titolo: 'Bot Storie 15 Minuti', icon: '🤖', desc: 'Automazione ciclo immagini/video ogni 15 min' },
    { file: 'docs_diretta/VideoEditorDaria.html', titolo: 'Video Editor DarIA', icon: '🎬', desc: 'Montaggio e taglio clip DarIA' },
    { file: 'docs_diretta/OwnerReport.html', titolo: 'Owner Report', icon: '📑', desc: 'Report pubblicazioni per proprietari' },
    { file: 'docs_diretta/Gen_Tab_Galleria.html', titolo: 'Galleria Diretta', icon: '🖼️', desc: 'Archivio grafiche generate' },
    { file: 'docs_diretta/Gen_Tab_AutoVision.html', titolo: 'AutoVision AI', icon: '👁️', desc: 'Analisi automatica foto immobili' },
    { file: 'docs_diretta/Gen_Tab_CanzoniSuno.html', titolo: 'Canzoni Suno AI', icon: '🎵', desc: 'Colonne sonore e jingle agenzia' },
    { file: 'docs_diretta/Gen_Tab_TimelineEditor.html', titolo: 'Timeline Editor Pro', icon: '⏱️', desc: 'Timeline multitraccia originale' }
  ],
  diretta: [
    { file: 'docs_diretta/Index.html', titolo: 'Regia Diretta 16:9', icon: '📺', desc: 'Player principale YouTube 24H & Facebook 19:00' },
    { file: 'docs_diretta/Diretta_Verticale.html', titolo: 'Diretta Verticale 9:16', icon: '📱', desc: 'Segnale verticale TikTok / Reels' },
    { file: 'docs_diretta/LiveVerticale.html', titolo: 'Live Verticale Alt', icon: '📡', desc: 'Player verticale alternativo' },
    { file: 'docs_diretta/In_Onda_Verticale.html', titolo: 'In Onda Verticale', icon: '🔴', desc: 'Schermata ON AIR verticale' },
    { file: 'docs_diretta/Gen_Tab_Live.html', titolo: 'Controllo Live TV', icon: '🎛️', desc: 'Gestione diretta e interazioni' },
    { file: 'docs_diretta/Gen_Tab_Palinsesto.html', titolo: 'Palinsesto 24H', icon: '🗓️', desc: 'Programmazione fasce orarie diretta' },
    { file: 'docs_diretta/Gen_Tab_Avatar.html', titolo: 'Avatar DarIA', icon: '👩', desc: 'Configurazione avatar DarIA in diretta' },
    { file: 'docs_diretta/Gen_Tab_Ruoli.html', titolo: 'Ruoli & Copioni', icon: '🎭', desc: 'Impostazione testi Colonna F e toni' },
    { file: 'docs_diretta/Gen_Tab_AzureTTS.html', titolo: 'Voce Azure TTS', icon: '🔊', desc: 'Sintesi vocale DarIA ad alta definizione' },
    { file: 'docs_diretta/Gen_Tab_Analytics.html', titolo: 'Analytics Diretta', icon: '📊', desc: 'Statistiche visualizzazioni e cicli' },
    { file: 'docs_diretta/Gen_Tab_Telegram.html', titolo: 'Report Telegram 4H', icon: '✈️', desc: 'Log invio cumulativo ogni 4 ore' },
    { file: 'docs_diretta/Gen_Tab_Impostazioni.html', titolo: 'Impostazioni Regia', icon: '⚙️', desc: 'Parametri tecnici trasmissione' },
    { file: 'docs_diretta/StudioDaria.html', titolo: 'Studio DarIA Completo', icon: '🎙️', desc: 'Console integrata Studio DarIA' },
    { file: 'docs_diretta/BackupManager.html', titolo: 'Backup Manager', icon: '💾', desc: 'Salvataggio e ripristino configurazioni' }
  ]
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizzaMetriQuadri(testo) {
  return String(testo || '')
    .replace(/\b(\d+)\s*(mq\.?|m²|m2|MQ)\b/gi, '$1 metri quadri');
}

export function renderGrigliaModuliSettore(settore, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const lista = MODULI_PER_SETTORE[settore] || [];
  el.innerHTML = lista
    .map(
      (m) => `
      <button type="button" class="sector-doc-btn" data-doc-file="${escapeHtml(m.file)}" data-doc-title="${escapeHtml(m.titolo)}">
        <span class="sector-doc-ico">${m.icon}</span>
        <span class="sector-doc-txt">
          <strong>${escapeHtml(m.titolo)}</strong>
          <small>${escapeHtml(m.desc)}</small>
        </span>
        <span class="sector-doc-open">Apri ›</span>
      </button>`
    )
    .join('');

  el.querySelectorAll('.sector-doc-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      apriDocumentoSettore(btn.dataset.docFile, btn.dataset.docTitle);
    });
  });
}

export function apriDocumentoSettore(filePath, titolo) {
  const modal = document.getElementById('modalDocViewer');
  const titleEl = document.getElementById('docViewerTitle');
  const iframe = document.getElementById('docViewerIframe');
  const extLink = document.getElementById('docViewerExtLink');
  if (!modal || !iframe) return;

  if (titleEl) titleEl.textContent = titolo || filePath;
  if (extLink) extLink.href = filePath;

  iframe.onload = () => {
    try {
      const win = iframe.contentWindow;
      if (win && !win.google) {
        win.google = {
          script: {
            run: new Proxy(
              {},
              {
                get() {
                  return () => {};
                }
              }
            )
          }
        };
      }
    } catch (_) {
      // Cross-origin guard
    }
  };

  iframe.src = filePath;
  modal.classList.remove('hidden');
}

export function initDocViewerModal() {
  const modal = document.getElementById('modalDocViewer');
  const closeBtn = document.getElementById('btnCloseDocViewer');
  const iframe = document.getElementById('docViewerIframe');
  if (!modal) return;
  closeBtn?.addEventListener('click', () => {
    modal.classList.add('hidden');
    if (iframe) iframe.src = 'about:blank';
  });
}

export function initTutorialModal(onJumpStep) {
  const modal = document.getElementById('modalTutorialApp');
  if (!modal) return;

  const openBtns = [
    document.getElementById('btnOpenTutorialTop'),
    document.getElementById('btnDrawerOpenTutorial'),
    document.getElementById('btnKpiTutorial')
  ].filter(Boolean);

  const closeBtn = document.getElementById('btnCloseTutorial');
  const drawer = document.getElementById('sideDrawer');
  const overlay = document.getElementById('sideDrawerOverlay');

  const apri = () => {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    modal.classList.remove('hidden');
  };
  const chiudi = () => modal.classList.add('hidden');

  openBtns.forEach((b) => b.addEventListener('click', apri));
  closeBtn?.addEventListener('click', chiudi);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) chiudi();
  });

  modal.querySelectorAll('.tut-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tutTab;
      modal.querySelectorAll('.tut-tab').forEach((t) => t.classList.toggle('active', t === tab));
      modal.querySelectorAll('.tut-panel').forEach((p) => p.classList.toggle('active', p.dataset.tutPanel === target));
    });
  });

  modal.querySelectorAll('[data-tut-jump]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = Number(btn.dataset.tutJump);
      chiudi();
      if (typeof onJumpStep === 'function') onJumpStep(step);
    });
  });
}

export function initFoglioVisitaWidget() {
  const form = document.getElementById('fvQuickForm');
  const canvas = document.getElementById('fvSignCanvas');
  const btnClear = document.getElementById('btnFvClearSign');
  const listEl = document.getElementById('fvSavedList');
  const dateInput = document.getElementById('fvData');
  const timeInput = document.getElementById('fvOra');

  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
  if (timeInput && !timeInput.value) {
    const now = new Date();
    timeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  let hasSigned = false;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    let drawing = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      return {
        x: ((pt.clientX - rect.left) * canvas.width) / rect.width,
        y: ((pt.clientY - rect.top) * canvas.height) / rect.height
      };
    };

    const start = (e) => {
      e.preventDefault();
      drawing = true;
      hasSigned = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const move = (e) => {
      if (!drawing) return;
      e.preventDefault();
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const stop = () => {
      drawing = false;
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', stop);

    btnClear?.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
    });
  }

  const caricaLista = () => {
    if (!listEl) return;
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem(STORAGE_FOGLI_VISITA) || '[]');
    } catch (_) {
      items = [];
    }
    if (!items.length) {
      listEl.innerHTML = '<div class="muted-empty">Nessun foglio visita salvato sul dispositivo.</div>';
      return;
    }
    listEl.innerHTML = items
      .slice(0, 8)
      .map(
        (v, idx) => `
      <div class="fv-saved-card">
        <div class="fv-saved-head">
          <strong>${escapeHtml(v.nome)}</strong>
          <span>${escapeHtml(v.data)} ${escapeHtml(v.ora)}</span>
        </div>
        <div class="fv-saved-body">
          🏠 ${escapeHtml(v.immobile)}<br>
          📞 ${escapeHtml(v.telefono)} ${v.cf ? `• CF: ${escapeHtml(v.cf)}` : ''}
          ${v.firmato ? ' • <span class="badge-signed">✍️ Firmato</span>' : ''}
        </div>
        <div class="fv-saved-actions">
          <button type="button" class="btn-mini btn-wa-fv" data-idx="${idx}">💬 Invia Riepilogo WhatsApp</button>
          <button type="button" class="btn-mini btn-del-fv" data-idx="${idx}">🗑️</button>
        </div>
      </div>`
      )
      .join('');

    listEl.querySelectorAll('.btn-wa-fv').forEach((b) => {
      b.addEventListener('click', () => {
        const v = items[Number(b.dataset.idx)];
        if (!v) return;
        const msg =
          `Gentile ${v.nome}, confermiamo il Foglio Visita del ${v.data} alle ${v.ora} per l'immobile: ${v.immobile}.\n` +
          (v.note ? `Note: ${v.note}\n` : '') +
          `— Immobiliare Giancani`;
        const tel = String(v.telefono || '').replace(/\D/g, '');
        const url = tel
          ? `https://wa.me/${tel.startsWith('39') ? tel : '39' + tel}?text=${encodeURIComponent(msg)}`
          : `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
      });
    });

    listEl.querySelectorAll('.btn-del-fv').forEach((b) => {
      b.addEventListener('click', () => {
        items.splice(Number(b.dataset.idx), 1);
        localStorage.setItem(STORAGE_FOGLI_VISITA, JSON.stringify(items));
        caricaLista();
      });
    });
  };

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('fvNome')?.value.trim();
    const telefono = document.getElementById('fvTelefono')?.value.trim();
    const cf = document.getElementById('fvCf')?.value.trim().toUpperCase();
    const immobile = normalizzaMetriQuadri(document.getElementById('fvImmobile')?.value.trim());
    const data = document.getElementById('fvData')?.value;
    const ora = document.getElementById('fvOra')?.value;
    const note = normalizzaMetriQuadri(document.getElementById('fvNote')?.value.trim());

    if (!nome || !immobile) {
      alert('Inserisci almeno Nome Visitatore e Immobile.');
      return;
    }

    const record = {
      id: Date.now(),
      nome,
      telefono,
      cf,
      immobile,
      data,
      ora,
      note,
      firmato: hasSigned,
      firmaDataUrl: hasSigned && canvas ? canvas.toDataURL('image/png') : ''
    };

    let items = [];
    try {
      items = JSON.parse(localStorage.getItem(STORAGE_FOGLI_VISITA) || '[]');
    } catch (_) {
      items = [];
    }
    items.unshift(record);
    localStorage.setItem(STORAGE_FOGLI_VISITA, JSON.stringify(items.slice(0, 50)));

    // Sincronizzazione leggera verso Google Apps Script
    try {
      fetch(GAS_VISITA_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'salvaFoglioVisitaRapido', ...record })
      }).catch(() => {});
    } catch (_) {}

    form.reset();
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
    if (canvas) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
    }
    caricaLista();
    alert('✅ Foglio Visita salvato! — Immobiliare Giancani');
  });

  caricaLista();
}

export function initSimulatoreMutuoWidget() {
  const prezzoEl = document.getElementById('mutuoPrezzo');
  const ltvEl = document.getElementById('mutuoLtv');
  const anniEl = document.getElementById('mutuoAnni');
  const tanEl = document.getElementById('mutuoTan');
  const outRata = document.getElementById('mutuoRataOut');
  const outImp = document.getElementById('mutuoImportoOut');
  const outTot = document.getElementById('mutuoTotaleOut');
  if (!prezzoEl || !outRata) return;

  const calcola = () => {
    const prezzo = Math.max(10000, Number(prezzoEl.value) || 150000);
    const ltv = Math.min(100, Math.max(10, Number(ltvEl?.value) || 80));
    const anni = Math.min(40, Math.max(5, Number(anniEl?.value) || 25));
    const tan = Math.max(0.1, Number(tanEl?.value) || 3.4);

    const capitale = prezzo * (ltv / 100);
    const i = tan / 100 / 12;
    const n = anni * 12;
    const rata = (capitale * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const totale = rata * n;

    outRata.textContent = `${Math.round(rata).toLocaleString('it-IT')} € / mese`;
    if (outImp) outImp.textContent = `${Math.round(capitale).toLocaleString('it-IT')} € (${ltv}%)`;
    if (outTot) outTot.textContent = `${Math.round(totale).toLocaleString('it-IT')} €`;
  };

  [prezzoEl, ltvEl, anniEl, tanEl].forEach((el) => el?.addEventListener('input', calcola));
  calcola();
}

export function initAgendaGiornoWidget() {
  const form = document.getElementById('agendaQuickForm');
  const listEl = document.getElementById('agendaListContainer');
  if (!listEl) return;

  const carica = () => {
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem(STORAGE_AGENDA_GIORNO) || '[]');
    } catch (_) {
      items = [];
    }
    if (!items.length) {
      items = [
        { id: 1, ora: '09:30', titolo: 'Controllo nuovi annunci privati e senza recapiti', cat: 'Cacciatori', done: false },
        { id: 2, ora: '11:00', titolo: 'Visita immobile 120 metri quadri con Foglio Visita', cat: 'Visita', done: false },
        { id: 3, ora: '19:00', titolo: 'Diretta Live Facebook & YouTube 24H DarIA', cat: 'Diretta', done: false }
      ];
      localStorage.setItem(STORAGE_AGENDA_GIORNO, JSON.stringify(items));
    }

    listEl.innerHTML = items
      .map(
        (it, idx) => `
      <div class="agenda-item ${it.done ? 'done' : ''}">
        <button type="button" class="agenda-check" data-idx="${idx}">${it.done ? '✅' : '⬜'}</button>
        <div class="agenda-info">
          <div class="agenda-meta"><span>🕒 ${escapeHtml(it.ora)}</span> • <span class="agenda-cat">${escapeHtml(it.cat)}</span></div>
          <div class="agenda-title">${escapeHtml(it.titolo)}</div>
        </div>
        <button type="button" class="agenda-del" data-idx="${idx}">✕</button>
      </div>`
      )
      .join('');

    listEl.querySelectorAll('.agenda-check').forEach((b) => {
      b.addEventListener('click', () => {
        const i = Number(b.dataset.idx);
        items[i].done = !items[i].done;
        localStorage.setItem(STORAGE_AGENDA_GIORNO, JSON.stringify(items));
        carica();
      });
    });

    listEl.querySelectorAll('.agenda-del').forEach((b) => {
      b.addEventListener('click', () => {
        items.splice(Number(b.dataset.idx), 1);
        localStorage.setItem(STORAGE_AGENDA_GIORNO, JSON.stringify(items));
        carica();
      });
    });
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const ora = document.getElementById('agOra')?.value || '10:00';
    const cat = document.getElementById('agCat')?.value || 'Visita';
    const titolo = normalizzaMetriQuadri(document.getElementById('agTitolo')?.value.trim());
    if (!titolo) return;

    let items = [];
    try {
      items = JSON.parse(localStorage.getItem(STORAGE_AGENDA_GIORNO) || '[]');
    } catch (_) {
      items = [];
    }
    items.unshift({ id: Date.now(), ora, cat, titolo, done: false });
    localStorage.setItem(STORAGE_AGENDA_GIORNO, JSON.stringify(items));
    form.reset();
    carica();
  });

  carica();
}
