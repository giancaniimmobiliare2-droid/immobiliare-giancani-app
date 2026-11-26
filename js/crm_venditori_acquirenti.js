// ══════════════════════════════════════════════════════════════════════════════
// 🏷️🤝 CRM VENDITORI (CACCIATORI + MEMORIA 30GG) & ACQUIRENTI (INCROCIO SMART)
// Integrazione completa nell'App Unificata Immobiliare Giancani.
// Rispetta rigorosamente:
// - Estrazione testi da Colonna F
// - Regola Memoria Contatti 30 Giorni con normalizzaTelefonoChiave (+39 / 0039)
// - Dicitura "metri quadri" per esteso
// - Personal branding obbligatorio in chiusura: — Immobiliare Giancani
// ══════════════════════════════════════════════════════════════════════════════

export const WEBHOOK_CACCIATORI = 'https://script.google.com/macros/s/AKfycbwEeH82YCSoOc-KRZx6pSQa_k3Kb5i252_Ajljlo20IOBinGiqA1E0ZE_2gKljHpLu3/exec';
export const DEFAULT_YT_PRESENTAZIONE = 'https://www.youtube.com/watch?v=TsdEk3Y9ewc';
export const GIORNI_SCADENZA_MEMORIA = 15;
export const MS_30_GIORNI = GIORNI_SCADENZA_MEMORIA * 24 * 60 * 60 * 1000;
export const ORDINE_COMUNI_TARGET = ['Favara', 'Aragona', 'Agrigento', 'Comitini', 'Porto Empedocle', 'Siculiana', 'Realmonte'];

export const DEFAULT_TEMPLATE_PRESENTAZIONE_WA = `Gentile {{NOME}}, {{SALUTO_ORARIO}}!

👋 Sono Antonio Giancani, titolare dell'agenzia Immobiliare Giancani.
🏡 Ho visto con molto interesse il Suo annuncio per l'immobile in vendita a {{COMUNE}} ({{VIA_ZONA}}) di {{METRI_QUADRI}}, proposto a {{PREZZO}}.

🤝 Le scrivo perché vorrei lavorare per Lei per venderLe l'immobile al miglior prezzo di mercato, selezionando solo acquirenti già qualificati (zero perditempo) e curando tutta la conformità urbanistica e catastale fino al rogito notarile. 📋✅

🌐 Scopra chi siamo, i nostri immobili e le nostre recensioni sulla nostra Pagina Facebook ufficiale:
https://www.facebook.com/immobiliaregiancani.it

📺 Ci può seguire e contattare anche sul nostro Canale YouTube ufficiale:
https://youtube.com/@immobiliaregiancani

🎥 Il nostro video presentazione: {{LINK_YOUTUBE}}

📱 Se Le fa piacere un colloquio conoscitivo senza alcun impegno, può rispondermi qui su WhatsApp o chiamarmi direttamente al +39 320 166 7156.

Un caro saluto ✨
Antonio Giancani
— Immobiliare Giancani`;

export const INDICE_PORTALI_MINORI = [
  { nome: 'Subito.it (Favara & Provincia AG — Solo Privati)', tipo: 'Leader Privati Sicilia', url: 'https://www.subito.it/annunci-sicilia/vendita/immobili/agrigento/?order=datedesc&f=p' },
  { nome: 'CasaDaPrivato.it', tipo: 'Solo Privati 100%', url: 'https://www.casadaprivato.it/annunci-vendita/immobili/agrigento-provincia' },
  { nome: 'ClickCase.it', tipo: 'Specializzato Privati', url: 'https://www.clickcase.it/vendita-case-agrigento.htm' },
  { nome: 'Bakeca.it Agrigento', tipo: 'Annunci Gratuiti', url: 'https://agrigento.bakeca.it/annunci/vendita-case/' },
  { nome: 'Cambiocasa.it', tipo: 'Annunci Case AG', url: 'https://www.cambiocasa.it/vendita/case/agrigento/' },
  { nome: 'Vivastreet.it Agrigento', tipo: 'Classificati Gratuiti', url: 'https://www.vivastreet.it/vendita-immobili/agrigento' },
  { nome: 'TuttoAnnunci.org AG', tipo: 'Bacheca Storica Free', url: 'https://www.tuttoannunci.org/agrigento/immobili-case_vendita.html' },
  { nome: 'Facebook Marketplace', tipo: 'Social Local', url: 'https://www.facebook.com/marketplace/category/propertyforsale' },
  { nome: 'PCase.it Agrigento', tipo: 'Portale Verticale', url: 'https://www.pcase.it/vendita/agrigento/' },
  { nome: 'Caasa.it Favara/AG', tipo: 'Meta-Aggregatore AI', url: 'https://www.caasa.it/agrigento/favara/in-vendita.html' },
  { nome: 'Trovit Case Favara', tipo: 'Aggregatore Multi-Sito', url: 'https://case.trovit.it/vendita-casa-favara' },
  { nome: 'Immobiliare.it (Ordinati per Modifica)', tipo: 'Monitoraggio Ribassi', url: 'https://www.immobiliare.it/vendita-case/agrigento-provincia/?criterio=dataModifica&ordine=desc' },
  { nome: 'Astalegale.net Tribunale AG', tipo: 'Aste & Saldo e Stralcio', url: 'https://www.astalegale.net/Immobili/Ricerca?provincia=AG' }
];

const SEED_ACQUIRENTI = [
  {
    id: 'ACQ-SEED-1',
    nome: 'Famiglia Lombardo',
    telefono: '320 000 1122',
    email: '',
    comune: 'Favara',
    tipologia: 'Appartamento',
    budgetMax: 135000,
    mqMin: 110,
    urgenza: '🔥 Pronto (Mutuo già approvato)',
    note: 'Cerca appartamento luminoso con 3 camere e cucina abitabile, piano basso o ascensore.'
  },
  {
    id: 'ACQ-SEED-2',
    nome: 'Dott. Giuseppe Bellavia',
    telefono: '338 000 3344',
    email: '',
    comune: 'Agrigento',
    tipologia: 'Villa',
    budgetMax: 320000,
    mqMin: 160,
    urgenza: '⚡ Ricerca attiva',
    note: 'Interessato a villa o villetta indipendente zona San Leone / Villaggio Mosè / Favara.'
  },
  {
    id: 'ACQ-SEED-3',
    nome: 'Sara & Marco Vaccaro',
    telefono: '347 000 5566',
    email: '',
    comune: 'Aragona',
    tipologia: 'Casa Indipendente',
    budgetMax: 95000,
    mqMin: 90,
    urgenza: '💼 Investimento / Prima Casa',
    note: 'Valuta sia Aragona che Favara o Comitini, anche da riammodernare leggermente.'
  }
];

function safeMq(str) {
  if (!str) return '';
  return String(str)
    .replace(/\b(\d+(?:[.,]\d+)?)\s*(?:m\s*²|m2|mq\.?|MQ\.?)\b/gi, '$1 metri quadri')
    .replace(/\b(?:mq\.?|m²|m2)\b/gi, 'metri quadri')
    .trim();
}

export function normalizzaTelefonoChiave(tel) {
  let digits = String(tel || '').replace(/\D/g, '');
  if (digits.startsWith('0039') && digits.length > 12) {
    digits = digits.slice(4);
  } else if (digits.startsWith('39') && digits.length > 10) {
    digits = digits.slice(2);
  }
  return digits;
}

export function caricaMemoria30Giorni(memCloud = {}) {
  const mem = { ...(memCloud || {}) };
  try {
    const raw = localStorage.getItem('GIANCANI_MEMORIA_30GG');
    if (raw) Object.assign(mem, JSON.parse(raw));
  } catch {}

  const nowMs = Date.now();
  const attiva = {};
  let cambiato = false;
  for (const k of Object.keys(mem)) {
    const rec = mem[k];
    const ts = Number(rec?.timestamp_ms || 0);
    if (ts) {
      const ggPassati = Math.floor((nowMs - ts) / (24 * 60 * 60 * 1000));
      if (nowMs - ts < MS_30_GIORNI) {
        rec.scaduto_15gg = false;
        rec.giorni_rimanenti = Math.max(1, GIORNI_SCADENZA_MEMORIA - ggPassati);
        attiva[k] = rec;
      } else {
        rec.scaduto_15gg = true;
        rec.giorni_passati = ggPassati;
        attiva[k] = rec;
      }
    } else {
      cambiato = true;
    }
  }
  if (cambiato) {
    try { localStorage.setItem('GIANCANI_MEMORIA_30GG', JSON.stringify(attiva)); } catch {}
  }
  return attiva;
}

export function getStatoMemoriaItem(item, mem) {
  if (!item || !mem) return null;
  const telRaw = String(item.telefono || '').replace(/\D/g, '');
  const telClean = normalizzaTelefonoChiave(telRaw);
  const emClean = String(item.email_contatto || '').toLowerCase().trim();
  const rec = mem[item.id]
    || (telClean.length >= 8 ? mem['TEL_' + telClean] : null)
    || (telRaw.length >= 8 ? mem['TEL_' + telRaw] : null)
    || (emClean ? mem['EMAIL_' + emClean] : null)
    || null;
  return (rec && !rec.scaduto_15gg) ? rec : null;
}

export function getStatoScaduto15gg(item, mem) {
  if (!item || !mem) return null;
  const telRaw = String(item.telefono || '').replace(/\D/g, '');
  const telClean = normalizzaTelefonoChiave(telRaw);
  const emClean = String(item.email_contatto || '').toLowerCase().trim();
  const rec = mem[item.id]
    || (telClean.length >= 8 ? mem['TEL_' + telClean] : null)
    || (telRaw.length >= 8 ? mem['TEL_' + telRaw] : null)
    || (emClean ? mem['EMAIL_' + emClean] : null)
    || null;
  return (rec && rec.scaduto_15gg) ? rec : null;
}

export function registraInvioInMemoria30Giorni(item, canale = 'CONTATTO_DIRETTO', memCloud = {}) {
  const mem = caricaMemoria30Giorni(memCloud);
  const now = new Date();
  const dateStr = `${now.toLocaleDateString('it-IT')} ${now.toLocaleTimeString('it-IT').slice(0, 5)}`;
  const telRaw = String(item.telefono || '').replace(/\D/g, '');
  const telClean = normalizzaTelefonoChiave(telRaw);
  const emClean = String(item.email_contatto || '').toLowerCase().trim();

  const rec = {
    id: item.id,
    telefono: telClean,
    email_contatto: emClean,
    nome: item.nome_privato || 'Proprietario Privato',
    comune: item.comune || 'Agrigento',
    canale,
    data_invio: dateStr,
    timestamp_ms: now.getTime(),
    giorni_rimanenti: GIORNI_SCADENZA_MEMORIA
  };

  mem[item.id] = rec;
  if (telClean.length >= 8) mem['TEL_' + telClean] = rec;
  if (emClean) mem['EMAIL_' + emClean] = rec;

  try {
    localStorage.setItem('GIANCANI_MEMORIA_30GG', JSON.stringify(mem));
  } catch {}

  try {
    fetch(WEBHOOK_CACCIATORI, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'registra_invio_presentazione', ...rec })
    }).catch(() => {});
  } catch {}

  return rec;
}

export function sbloccaContattoMemoria(itemId, telefono = '', email = '', memCloud = {}) {
  const mem = caricaMemoria30Giorni(memCloud);
  delete mem[itemId];
  const telRaw = String(telefono || '').replace(/\D/g, '');
  const telClean = normalizzaTelefonoChiave(telRaw);
  const emClean = String(email || '').toLowerCase().trim();
  if (telClean) delete mem['TEL_' + telClean];
  if (telRaw) delete mem['TEL_' + telRaw];
  if (emClean) delete mem['EMAIL_' + emClean];
  if (memCloud) {
    delete memCloud[itemId];
    if (telClean) delete memCloud['TEL_' + telClean];
    if (telRaw) delete memCloud['TEL_' + telRaw];
    if (emClean) delete memCloud['EMAIL_' + emClean];
  }
  try {
    localStorage.setItem('GIANCANI_MEMORIA_30GG', JSON.stringify(mem));
  } catch {}
}

export async function sincronizzaMemoriaCloud() {
  const r = await fetch(`${WEBHOOK_CACCIATORI}?action=get_memoria_contatti`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  if (data && data.memoria) {
    const localMem = caricaMemoria30Giorni({});
    Object.assign(localMem, data.memoria);
    localStorage.setItem('GIANCANI_MEMORIA_30GG', JSON.stringify(localMem));
    return localMem;
  }
  return caricaMemoria30Giorni({});
}

export function caricaVisti() {
  try { return JSON.parse(localStorage.getItem('GIANCANI_IMMOBILI_VISTI') || '[]'); }
  catch { return []; }
}

export function segnaComeVistoStorage(itemId) {
  const visti = caricaVisti();
  if (!visti.includes(itemId)) visti.push(itemId);
  try { localStorage.setItem('GIANCANI_IMMOBILI_VISTI', JSON.stringify(visti)); } catch {}
  return visti;
}

export function rimuoviDaVistiStorage(itemId) {
  const next = caricaVisti().filter((id) => id !== itemId);
  try { localStorage.setItem('GIANCANI_IMMOBILI_VISTI', JSON.stringify(next)); } catch {}
  return next;
}

export function applicaPromossiESegnalazioni(dataset) {
  let promossi = [];
  let segnalateId = [];
  let segnalateTel = ['3284670316'];
  try {
    promossi = JSON.parse(localStorage.getItem('GIANCANI_PROMOSSI_PRIVATI') || '[]');
    segnalateId = JSON.parse(localStorage.getItem('GIANCANI_AGENZIE_SEGNALATE_ID') || '[]');
    const extraTel = JSON.parse(localStorage.getItem('GIANCANI_AGENZIE_SEGNALATE_TEL') || '[]');
    segnalateTel = Array.from(new Set(segnalateTel.concat(extraTel)));
  } catch {}

  dataset.forEach((it) => {
    if (promossi.includes(it.id)) it.cat = 'privato';
    const telClean = normalizzaTelefonoChiave(it.telefono || '');
    if (segnalateId.includes(it.id) || (telClean.length >= 8 && segnalateTel.includes(telClean))) {
      it.cat = 'agenzia';
      if (!it.nome_agenzia || it.nome_agenzia === 'Privato') {
        it.nome_agenzia = telClean ? `Agenzia (${telClean})` : 'Agenzia Segnalata';
      }
    }
  });
}

export function promuoviSospettoAVeroPrivatoStorage(itemId, dataset) {
  let promossi = [];
  try { promossi = JSON.parse(localStorage.getItem('GIANCANI_PROMOSSI_PRIVATI') || '[]'); } catch {}
  if (!promossi.includes(itemId)) promossi.push(itemId);
  try { localStorage.setItem('GIANCANI_PROMOSSI_PRIVATI', JSON.stringify(promossi)); } catch {}
  dataset.forEach((it) => { if (it.id === itemId) it.cat = 'privato'; });
}

export function segnaComeAgenziaStorage(itemId, telefono, dataset) {
  let segnalateId = [];
  let segnalateTel = [];
  try {
    segnalateId = JSON.parse(localStorage.getItem('GIANCANI_AGENZIE_SEGNALATE_ID') || '[]');
    segnalateTel = JSON.parse(localStorage.getItem('GIANCANI_AGENZIE_SEGNALATE_TEL') || '[]');
  } catch {}
  if (!segnalateId.includes(itemId)) segnalateId.push(itemId);
  const telClean = normalizzaTelefonoChiave(telefono || '');
  if (telClean.length >= 8 && !segnalateTel.includes(telClean)) segnalateTel.push(telClean);
  try {
    localStorage.setItem('GIANCANI_AGENZIE_SEGNALATE_ID', JSON.stringify(segnalateId));
    localStorage.setItem('GIANCANI_AGENZIE_SEGNALATE_TEL', JSON.stringify(segnalateTel));
  } catch {}
  applicaPromossiESegnalazioni(dataset);
}

export function getIndiceOrdineComune(comune) {
  const cLow = String(comune || '').toLowerCase();
  for (let i = 0; i < ORDINE_COMUNI_TARGET.length; i++) {
    if (cLow.includes(ORDINE_COMUNI_TARGET[i].toLowerCase())) return i;
  }
  return 99;
}

export function getSalutoOrario() {
  const ora = new Date().getHours();
  if (ora < 13) return 'buongiorno ☀️';
  if (ora < 18) return 'buon pomeriggio 👋';
  return 'buonasera 🌙';
}

export function compilaMessaggioPresentazione(item) {
  let ytUrl = DEFAULT_YT_PRESENTAZIONE;
  let tpl = DEFAULT_TEMPLATE_PRESENTAZIONE_WA;
  try {
    ytUrl = localStorage.getItem('GIANCANI_YT_URL') || DEFAULT_YT_PRESENTAZIONE;
    tpl = localStorage.getItem('GIANCANI_MSG_PRESENTAZIONE') || DEFAULT_TEMPLATE_PRESENTAZIONE_WA;
  } catch {}
  const nome = (item.nome_privato && item.nome_privato !== 'Proprietario Privato') ? item.nome_privato : 'proprietario';
  const salutoOrario = getSalutoOrario();
  let msg = tpl
    .replace(/\{\{SALUTO_ORARIO\}\}/g, salutoOrario)
    .replace(/\bbuongiorno\b/i, salutoOrario)
    .replace(/\{\{NOME\}\}/g, nome)
    .replace(/\{\{COMUNE\}\}/g, item.comune || 'Agrigento')
    .replace(/\{\{VIA_ZONA\}\}/g, item.via_zona || item.titolo || '')
    .replace(/\{\{METRI_QUADRI\}\}/g, safeMq(item.superficie) || 'Non specificata')
    .replace(/\{\{PREZZO\}\}/g, item.prezzo || 'Su richiesta')
    .replace(/\{\{LINK_YOUTUBE\}\}/g, ytUrl);

  msg = safeMq(msg);
  if (!msg.includes('— Immobiliare Giancani')) {
    msg = msg.replace(/\s*Immobiliare Giancani\s*$/i, '').trim() + '\n— Immobiliare Giancani';
  }
  return msg;
}

export async function loadCacciatoriDataset() {
  let base = { dataset: [], memoria_invii_30gg: {}, ultimo_aggiornamento: '' };
  try {
    const res = await fetch('./data/cacciatori_dataset.json');
    if (res.ok) base = await res.json();
  } catch {}
  let custom = [];
  try {
    custom = JSON.parse(localStorage.getItem('GIANCANI_VENDITORI_CUSTOM') || '[]');
  } catch {}
  const list = [...custom, ...(Array.isArray(base.dataset) ? base.dataset : [])];
  applicaPromossiESegnalazioni(list);
  return {
    dataset: list,
    memoriaCloud: base.memoria_invii_30gg || {},
    ultimoAggiornamento: base.ultimo_aggiornamento || ''
  };
}

export function aggiungiVenditoreCustom(form) {
  const newItem = {
    id: `MAN-${Date.now()}`,
    cat: 'privato',
    fonte: 'Inserimento Manuale App',
    comune: (form.comune || 'Favara').trim(),
    titolo: (form.titolo || `${form.tipologia || 'Immobile'} a ${form.comune || 'Favara'}`).trim(),
    via_zona: (form.via_zona || form.comune || 'Favara').trim(),
    tipologia: (form.tipologia || 'Appartamento').trim(),
    superficie: safeMq(form.superficie || '120') + (String(form.superficie || '').toLowerCase().includes('metri quadri') ? '' : ' metri quadri'),
    prezzo: form.prezzo ? (String(form.prezzo).includes('€') ? String(form.prezzo) : `${form.prezzo} €`) : 'Su richiesta',
    nome_privato: (form.nome || 'Proprietario Privato').trim(),
    nome_agenzia: 'Privato',
    telefono: (form.telefono || '').trim(),
    email_contatto: (form.email || '').trim(),
    url: form.url || 'https://www.immobiliaregiancani.it',
    foto_url: form.foto_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=60',
    descrizione: `${safeMq(form.descrizione || `${form.tipologia || 'Immobile'} in vendita a ${form.comune || 'Favara'}.`)}\n— Immobiliare Giancani`,
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  let custom = [];
  try { custom = JSON.parse(localStorage.getItem('GIANCANI_VENDITORI_CUSTOM') || '[]'); } catch {}
  custom.unshift(newItem);
  try { localStorage.setItem('GIANCANI_VENDITORI_CUSTOM', JSON.stringify(custom)); } catch {}
  return newItem;
}

// ══════════════════════════════════════════════════════════════════════════════
// 🤝 SEZIONE 2: CRM ACQUIRENTI & MOTORE DI INCROCIO INTELLIGENTE (SMART MATCH)
// ══════════════════════════════════════════════════════════════════════════════

export function caricaAcquirentiCRM() {
  try {
    const raw = localStorage.getItem('GIANCANI_ACQUIRENTI_CRM');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  try {
    localStorage.setItem('GIANCANI_ACQUIRENTI_CRM', JSON.stringify(SEED_ACQUIRENTI));
  } catch {}
  return [...SEED_ACQUIRENTI];
}

export function salvaAcquirentiCRM(list) {
  try { localStorage.setItem('GIANCANI_ACQUIRENTI_CRM', JSON.stringify(list || [])); } catch {}
}

export function parseNumeroPulito(str) {
  if (typeof str === 'number') return str;
  const cleaned = String(str || '').replace(/[^\d]/g, '');
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : 0;
}

export function parseMqNumerico(str) {
  const m = String(str || '').match(/(\d+(?:[.,]\d+)?)/);
  return m ? Math.round(parseFloat(m[1].replace(',', '.'))) : 0;
}

/**
 * 🎯 Calcola gli immobili compatibili per un Acquirente incrociando:
 * 1) Inserzioni Agenzia (Fogli Sheet / Archivio Colonna F)
 * 2) Venditori Privati Verificati (Cacciatori di Immobili)
 */
export function calcolaIncrociPerAcquirente(acq, { cacciatori = [], sheetImmobili = [], archivio = [] } = {}) {
  const cCom = String(acq.comune || '').trim().toLowerCase();
  const cTip = String(acq.tipologia || '').trim().toLowerCase();
  const cBud = Number(acq.budgetMax || 0);
  const cMq = Number(acq.mqMin || 0);

  const kandidati = [];

  // A. Da Fogli Google Sheet attivi in Agenzia
  (sheetImmobili || []).forEach((s) => {
    const label = s.nome || s.label || s.tabName || 'Immobile Agenzia';
    const testoF = safeMq(s.testoF || s.descrizione || `${label} proposto in esclusiva da Immobiliare Giancani.`);
    kandidati.push({
      id: `SHEET_${s.tabName || label}`,
      sourceKind: 'agenzia_sheet',
      badgeFonte: '🏠 Inserzione Agenzia (Sheet)',
      titolo: label.replace(/_/g, ' '),
      comune: s.zona || label,
      tipologia: s.tipoImmobile || label,
      superficie: s.metriQuadri ? safeMq(s.metriQuadri) : (parseMqNumerico(testoF) ? `${parseMqNumerico(testoF)} metri quadri` : '120 metri quadri'),
      prezzo: s.prezzo || 'Trattativa Riservata',
      testoColonnaF: testoF,
      tabName: s.tabName || s.name,
      foto_url: s.fotoUrl || './assets/icon-192.png',
      telefono: '+39 320 166 7156'
    });
  });

  // B. Da Archivio Colonna F
  (archivio || []).slice(0, 60).forEach((ar, idx) => {
    kandidati.push({
      id: `ARCH_${idx}`,
      sourceKind: 'archivio_colf',
      badgeFonte: '📄 Archivio Colonna F',
      titolo: `${ar.tipologia || 'Immobile'} — ${ar.zona || 'Favara'}`,
      comune: ar.zona || 'Favara',
      tipologia: ar.tipologia || 'Appartamento',
      superficie: parseMqNumerico(ar.testo) ? `${parseMqNumerico(ar.testo)} metri quadri` : '120 metri quadri',
      prezzo: ar.prezzo || 'Trattativa Riservata',
      testoColonnaF: safeMq(ar.testo),
      foto_url: './assets/icon-192.png',
      telefono: '+39 320 166 7156'
    });
  });

  // C. Da Venditori Privati Verificati (Cacciatori)
  (cacciatori || []).filter((x) => x.cat === 'privato' || x.cat === 'sospetto_agenzia').forEach((it) => {
    kandidati.push({
      id: it.id,
      sourceKind: 'privato_cacciatori',
      badgeFonte: it.cat === 'privato' ? '👤 Venditore Privato (Cacciatori)' : '🕵️ Sospetto Privato',
      titolo: it.titolo,
      comune: it.comune,
      tipologia: it.tipologia,
      superficie: safeMq(it.superficie),
      prezzo: it.prezzo,
      testoColonnaF: safeMq(it.descrizione),
      foto_url: it.foto_url,
      url: it.url,
      telefono: it.telefono,
      rawCacciatore: it
    });
  });

  const matched = [];
  for (const cand of kandidati) {
    let score = 0;
    const motivi = [];

    const haystack = `${cand.comune} ${cand.titolo} ${cand.testoColonnaF}`.toLowerCase();
    if (!cCom || cCom === 'tutti' || haystack.includes(cCom)) {
      score += 35;
      motivi.push(`📍 Zona (${cCom || 'Tutte'})`);
    }

    const tipHay = `${cand.tipologia} ${cand.titolo}`.toLowerCase();
    if (!cTip || cTip === 'tutte' || tipHay.includes(cTip.split(' ')[0])) {
      score += 25;
      motivi.push(`🏠 ${cand.tipologia}`);
    }

    const pNum = parseNumeroPulito(cand.prezzo);
    if (cBud > 0 && pNum > 0) {
      if (pNum <= cBud) {
        score += 25;
        motivi.push(`💰 In budget (${cand.prezzo})`);
      } else if (pNum <= cBud * 1.12) {
        score += 12;
        motivi.push(`💰 Quasi in budget (${cand.prezzo})`);
      } else {
        score -= 25;
      }
    } else {
      score += 10;
    }

    const mqNum = parseMqNumerico(cand.superficie);
    if (cMq > 0 && mqNum > 0) {
      if (mqNum >= cMq) {
        score += 15;
        motivi.push(`📐 ${mqNum} metri quadri`);
      } else if (mqNum >= cMq * 0.85) {
        score += 5;
      } else {
        score -= 10;
      }
    }

    if (score >= 45) {
      matched.push({
        ...cand,
        score: Math.min(100, Math.max(0, score)),
        motivi
      });
    }
  }

  matched.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Priorità alle inserzioni ufficiali dell'agenzia a parità di punteggio
    const aPri = a.sourceKind === 'agenzia_sheet' ? 1 : 0;
    const bPri = b.sourceKind === 'agenzia_sheet' ? 1 : 0;
    return bPri - aPri;
  });

  return matched.slice(0, 12);
}

/**
 * 🤝 Incrocio inverso: dato un immobile (da Venditori o Inserzioni), trova gli Acquirenti interessati
 */
export function trovaAcquirentiCompatibiliPerImmobile(immobile, acquirentiList = []) {
  const list = [];
  for (const acq of acquirentiList) {
    const res = calcolaIncrociPerAcquirente(acq, {
      cacciatori: immobile.cat ? [immobile] : [],
      sheetImmobili: immobile.tabName ? [immobile] : [],
      archivio: !immobile.cat && !immobile.tabName ? [immobile] : []
    });
    if (res.length > 0 && res[0].score >= 45) {
      list.push({ acquirente: acq, score: res[0].score, motivi: res[0].motivi });
    }
  }
  return list.sort((a, b) => b.score - a.score);
}

/**
 * 📲 Messaggio WhatsApp 1-Click per proporre un immobile compatibile all'Acquirente (Colonna F)
 */
export function costruisciMessaggioPropostaAcquirente(acq, immobile) {
  const saluto = getSalutoOrario();
  const mqTxt = safeMq(immobile.superficie) || 'ampia metratura in metri quadri';
  const colF = safeMq(immobile.testoColonnaF || immobile.descrizione || '').replace(/—\s*Immobiliare Giancani\s*$/i, '').trim();
  const body = `Gentile ${acq.nome}, ${saluto}! 👋

Sono Antonio Giancani di Immobiliare Giancani.
✨ Ho trovato una proposta perfettamente in linea con la Sua ricerca (${acq.tipologia || 'Immobile'} a ${acq.comune || 'Favara/Agrigento'}):

🏡 ${immobile.titolo}
📍 Comune / Zona: ${immobile.comune || acq.comune}
📐 Superficie: ${mqTxt}
💰 Prezzo: ${immobile.prezzo || 'Trattativa Riservata'}

📝 Descrizione:
${colF}

📅 Mi faccia sapere se desidera fissare un sopralluogo o ricevere il video tour completo!
📞 Chiamata / WhatsApp: +39 320 166 7156

— Immobiliare Giancani`;
  return safeMq(body);
}
