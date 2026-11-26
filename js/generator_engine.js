// ══════════════════════════════════════════════════════════════════════════════
// 🏠 GENERATOR ENGINE — Porting Completo di Generator.html & 08_AutoVisionEGalleria.js
// Gestisce: Scheda Immobile (18 tipi, 7 stati, Regia DarIA), Riconoscimento Stanze,
// Chip Intelligenti & Particolari, 11 Template Emozionali Colonna F, Gemini Vision AI,
// Editor Fotografico Canvas Calibrato (5 Preset + Oscuratore Privacy + Nadir 360°)
// e Frasi Prestigio Colonna F.
// — Immobiliare Giancani
// ══════════════════════════════════════════════════════════════════════════════

export const TIPO_IMMOBILE_LIST = [
  'Appartamento',
  'Villa',
  'Villetta a schiera',
  'Attico / Mansarda',
  'Casa Indipendente',
  'Rustico / Casale',
  'Magazzino / Deposito',
  'Locale Commerciale',
  'Ufficio / Studio',
  'Garage / Box Auto',
  'Capannone',
  'Palazzina / Stabile',
  'Terreno Edificabile',
  'Terreno Agricolo',
  'Casa Vacanze / Pregio',
  'Struttura Ricettiva / B&B',
  'Loft / Open Space',
  'Altro Immobile'
];

export const STATO_IMMOBILE_LIST = [
  { val: 'rifinito e ristrutturato a nuovo', label: '✨ Rifinito e ristrutturato a nuovo' },
  { val: 'nuova costruzione mai abitato', label: '🆕 Nuova costruzione (mai abitato)' },
  { val: 'ottimo stato abitabile subito', label: '👍 Ottimo stato / Abitabile subito' },
  { val: 'di lusso con finiture di alto pregio', label: '💎 Di lusso / Con finiture di pregio' },
  { val: 'buono stato parzialmente ristrutturato', label: '🛠️ Buono stato / Parzialmente ristrutturato' },
  { val: 'da ristrutturare con ottimo potenziale', label: '🔨 Da ristrutturare / Ottimo potenziale' },
  { val: 'al grezzo da personalizzare', label: '🧱 Al grezzo / Da personalizzare' }
];

export const SMART_STANZE_CONFIG = {
  topList: [
    { n: 'Bagno', i: '🚿' },
    { n: 'Cucina', i: '🍳' },
    { n: 'Salotto', i: '🛋️' },
    { n: 'Zona Living', i: '🏡' },
    { n: 'Camera da Letto', i: '🛏️' },
    { n: 'Cameretta', i: '🧸' },
    { n: 'Balcone', i: '🌇' },
    { n: 'Terrazzo', i: '☀️' },
    { n: 'Giardino', i: '🌿' },
    { n: 'Garage', i: '🚗' },
    { n: 'Lavanderia', i: '🧺' },
    { n: 'Ripostiglio', i: '📦' },
    { n: 'Disimpegno', i: '🧭' },
    { n: 'Ingresso', i: '🚪' },
    { n: 'Taverna', i: '🍷' },
    { n: 'Mansarda', i: '📐' },
    { n: 'Piscina', i: '🏊' },
    { n: 'Vista Panoramica', i: '🌅' },
    { n: 'Facciata Esterna', i: '🏛️' },
    { n: 'Studio', i: '💼' }
  ],
  categorie: {
    '🚿 Bagni & Servizi Igienici': [
      { n: 'Bagno', i: '🚿' },
      { n: 'Bagno Padronale', i: '🛁' },
      { n: 'Bagno di Servizio', i: '🚾' },
      { n: 'Doppio Servizio', i: '✨' },
      { n: 'Lavanderia', i: '🧺' }
    ],
    '🍳 Cucina & Zona Pranzo': [
      { n: 'Cucina', i: '🍳' },
      { n: 'Cucina Abitabile', i: '🍲' },
      { n: 'Angolo Cottura', i: '🔥' },
      { n: 'Cucinino', i: '🍴' },
      { n: 'Tinello', i: '🪑' },
      { n: 'Zona Pranzo', i: '🍽️' }
    ],
    '🛋️ Salotto & Zona Giorno': [
      { n: 'Salotto', i: '🛋️' },
      { n: 'Zona Living', i: '🏡' },
      { n: 'Soggiorno', i: '🛋️' },
      { n: 'Open Space', i: '✨' },
      { n: 'Salone di Rappresentanza', i: '🏛️' },
      { n: 'Sala TV / Relax', i: '📺' }
    ],
    '🛏️ Camere da Letto & Zona Notte': [
      { n: 'Camera da Letto', i: '🛏️' },
      { n: 'Camera Matrimoniale', i: '👑' },
      { n: 'Cameretta', i: '🧸' },
      { n: 'Camera Singola', i: '🛌' },
      { n: 'Camera Doppia', i: '🛏️' },
      { n: 'Cabina Armadio', i: '👔' }
    ],
    '🌅 Esterni, Balconi & Panorami': [
      { n: 'Balcone', i: '🌇' },
      { n: 'Terrazzo', i: '☀️' },
      { n: 'Veranda', i: '🪟' },
      { n: 'Giardino', i: '🌿' },
      { n: 'Porticato', i: '🏡' },
      { n: 'Cortile', i: '🧱' },
      { n: 'Vista Panoramica', i: '🌅' },
      { n: 'Vista Mare', i: '🌊' },
      { n: 'Facciata Esterna', i: '🏛️' }
    ],
    '🚗 Garage, Accessori & Pertinenze': [
      { n: 'Garage / Box', i: '🚗' },
      { n: 'Posto Auto', i: '🅿️' },
      { n: 'Cantina', i: '🍷' },
      { n: 'Taverna', i: '🪵' },
      { n: 'Mansarda', i: '📐' },
      { n: 'Soffitta', i: '📦' },
      { n: 'Ingresso', i: '🚪' },
      { n: 'Corridoio', i: '🧭' },
      { n: 'Disimpegno', i: '🚶' },
      { n: 'Ripostiglio', i: '🗄️' },
      { n: 'Studio / Ufficio', i: '💼' },
      { n: 'Piscina', i: '🏊' }
    ]
  },
  particolariPerStanza: {
    bagno: [
      'lavabo bidè e wc',
      'con box doccia',
      'con vasca idromassaggio',
      'finestrato e luminoso',
      'padronale con finiture di pregio',
      'di servizio con lavatrice',
      'con sanitari sospesi',
      'doppio lavabo moderno'
    ],
    cucin: [
      'abitabile e spaziosa',
      'a vista open space',
      'con penisola moderna',
      'con isola centrale',
      'angolo cottura attrezzato',
      'piano cottura a induzione',
      'con affaccio sul balcone',
      'arredata con elettrodomestici'
    ],
    salott: [
      'open space luminoso',
      'con camino moderno',
      'con affaccio sul terrazzo',
      'con zona pranzo integrata',
      'con divano e parete TV',
      'ampio con vetrate panoramiche'
    ],
    living: [
      'open space luminoso',
      'con camino e zona relax',
      'con affaccio sul terrazzo',
      'con accesso al giardino',
      'ampio e accogliente'
    ],
    soggiorn: [
      'open space accogliente',
      'con balcone panoramico',
      'con sala da pranzo',
      'luminoso con doppia esposizione'
    ],
    salon: [
      'di rappresentanza ampio',
      'con finiture signorili',
      'con grandi vetrate'
    ],
    letto: [
      'matrimoniale ampia',
      'con cabina armadio',
      'con bagno privato in suite',
      'luminosa con balcone',
      'con pavimentazione in parquet',
      'climatizzata e silenziosa'
    ],
    matrimonial: [
      'ampia e confortevole',
      'con cabina armadio',
      'con bagno in camera',
      'con parquet e balcone'
    ],
    cameretta: [
      'luminosa per ragazzi',
      'con doppio letto',
      'con zona studio scrivania',
      'con armadio a ponte',
      'con balcone'
    ],
    balcon: [
      'panoramico vivibile',
      'vista mare e monti',
      'con tende da sole',
      'con ripostiglio esterno'
    ],
    terrazz: [
      'panoramico a livello',
      "vivibile per cene all'aperto",
      'coperto con pergolato',
      'con vista a 360° aperta'
    ],
    verand: [
      'chiusa e condonata',
      'luminosa ad uso lavanderia/relax',
      'con vetrate scorrevoli'
    ],
    giardin: [
      'privato recintato',
      "con prato all'inglese",
      'con zona barbecue attrezzata',
      'con alberi e piante ornamentali',
      'con impianto di irrigazione'
    ],
    garag: [
      'singolo comodo pavimentato',
      'doppio con soppalco',
      'con saracinesca elettrica',
      'con punto acqua',
      "con accesso diretto all'ascensore"
    ],
    box: [
      'comodo pavimentato',
      'con soppalco e saracinesca'
    ],
    tavern: [
      'con camino e forno a legna',
      'con cucina in muratura e bancone',
      'rifinita in stile rustico in pietra',
      'ideale per feste e cene'
    ],
    mansard: [
      'con travi in legno a vista',
      'con lucernari velux luminosi',
      'abitabile e climatizzata',
      'con pavimentazione in parquet'
    ],
    lavander: [
      'attrezzata con lavatrice e asciugatrice',
      'con pilozzo e stenditoio',
      'con armadiature su misura'
    ],
    ripost: [
      'spazioso con scaffalature',
      'adiacente alla cucina'
    ],
    ingress: [
      'ampio con porta blindata',
      'con guardaroba a scomparsa',
      'con controsoffitto e faretti led'
    ],
    corrido: [
      'con controsoffitto e faretti led',
      'disimpegno notte armadiabile'
    ],
    disimpegn: [
      'luminoso e ben organizzato',
      'zona notte armadiabile'
    ],
    facciat: [
      'esterna signorile e moderna',
      'in ottimo stato conservativo',
      'con cappotto termico'
    ],
    vista: [
      'panoramica aperta',
      'mozzafiato sul mare',
      'sulla vallata e centro storico'
    ],
    piscin: [
      'interrata con solarium',
      'a sfioro panoramica',
      'attrezzata con lettini e doccia'
    ],
    studio: [
      'professionale silenzioso',
      'attrezzato con librerie',
      'luminoso con balcone'
    ]
  }
};

export const FOTO_PRESETS = [
  { id: 'realta', label: '🌿 Realtà (100%)', b: 100, c: 100, s: 100 },
  { id: 'naturale', label: '✨ Luce Naturale (+3%)', b: 104, c: 103, s: 102 },
  { id: 'ombre', label: '☀️ Schiarisci Ombre', b: 108, c: 98, s: 101 },
  { id: 'calda', label: '🌅 Tonalità Calda', b: 102, c: 104, s: 103 },
  { id: 'bianchi', label: '❄️ Bianchi Puri', b: 103, c: 105, s: 96 }
];

export const WATERMARK_POSIZIONI = [
  { val: 'centrale_semitrasparente', label: '🛡️ Logo Centrale Semitrasparente' },
  { val: '360_nadir', label: '⚪ Cerchio Bianco Nadir 360° (Copri Treppiede)' },
  { val: 'in_basso_destra', label: '📐 Logo in Basso a Destra' },
  { val: 'in_basso_sinistra', label: '📐 Logo in Basso a Sinistra' },
  { val: 'in_alto_destra', label: '📐 Logo in Alto a Destra' },
  { val: 'in_alto_sinistra', label: '📐 Logo in Alto a Sinistra' },
  { val: 'nessuno', label: '🚫 Nessun Logo' }
];

export const FRASI_PRESTIGIO_STORIE = [
  {
    id: '1',
    categoria: 'Prestigio & Valore',
    titolo: "L'Arte dell'Abitare",
    colonnaF: "Il vero lusso non è ciò che mostri, ma lo spazio, la luce e la quiete in cui scegli di vivere. La tua dimora ideale inizia da qui. — Immobiliare Giancani"
  },
  {
    id: '2',
    categoria: 'Prestigio & Valore',
    titolo: 'Oltre le Semplici Mura',
    colonnaF: "Ogni casa ha un'anima, ma solo chi sa guardare oltre sa valorizzarne il reale pregio. Esperienza e riservatezza al tuo servizio. — Immobiliare Giancani"
  },
  {
    id: '3',
    categoria: 'Curiosità & Emozione',
    titolo: 'La Sensazione di Casa',
    colonnaF: "Ti sei mai chiesto perché certe case ti fanno sentire a casa fin dal primo istante in cui varchi la soglia? Scopri la magia dei dettagli. — Immobiliare Giancani"
  },
  {
    id: '4',
    categoria: 'Prestigio & Valore',
    titolo: 'Patrimonio di Famiglia',
    colonnaF: "Acquistare un immobile di valore non è una spesa, è la costruzione solida del tuo patrimonio di famiglia. Guidiamo le tue scelte con autorevolezza. — Immobiliare Giancani"
  },
  {
    id: '5',
    categoria: 'Stimolo & Ambizione',
    titolo: 'Il Tuo Prossimo Livello',
    colonnaF: "Non rimandare il tuo sogno: meriti uno spazio che rifletta davvero i tuoi traguardi. Sali di livello e scegli l'eccellenza. — Immobiliare Giancani"
  },
  {
    id: '6',
    categoria: 'Curiosità & Emozione',
    titolo: 'Luce & Armonia',
    colonnaF: "Sai qual è la differenza tra abitare e vivere bene? La risposta è in questa luce e nella perfetta armonia degli spazi. Lasciati ispirare. — Immobiliare Giancani"
  },
  {
    id: '7',
    categoria: 'Sicurezza & Garanzia',
    titolo: 'Tranquillità Assoluta',
    colonnaF: "La serenità di acquistare senza alcuna sorpresa non ha prezzo. Verifichiamo ogni dettaglio prima, durante e dopo il rogito. — Immobiliare Giancani"
  },
  {
    id: '8',
    categoria: 'Prestigio & Valore',
    titolo: 'Stile Senza Tempo',
    colonnaF: "L'eleganza autentica non è farsi notare, ma farsi ricordare. Trova la dimora che esprime al meglio la tua personalità. — Immobiliare Giancani"
  },
  {
    id: '9',
    categoria: 'Curiosità & Emozione',
    titolo: 'Il Tuo Nuovo Capitolo',
    colonnaF: "E se la casa che hai sempre sognato fosse molto più vicina di quanto immagini? Il tuo prossimo capitolo comincia da qui. — Immobiliare Giancani"
  },
  {
    id: '10',
    categoria: 'Stimolo & Ambizione',
    titolo: 'Spazi da Vivere',
    colonnaF: "Immagina di svegliarti ogni giorno in un ambiente dove libertà, vista e comfort si fondono. Trasforma la tua immaginazione in realtà. — Immobiliare Giancani"
  },
  {
    id: '11',
    categoria: 'Sicurezza & Garanzia',
    titolo: 'Zero Imprevisti',
    colonnaF: "Vendere o acquistare casa con un metodo collaudato significa sicurezza totale e zero imprevisti. Scegli la certezza di professionisti dedicati. — Immobiliare Giancani"
  },
  {
    id: '12',
    categoria: 'Prestigio & Valore',
    titolo: "Architetture d'Autore",
    colonnaF: "Non selezioniamo semplici immobili: scegliamo architetture d'eccellenza per chi pretende il massimo dallo stile di vita. — Immobiliare Giancani"
  },
  {
    id: '13',
    categoria: 'Curiosità & Emozione',
    titolo: 'I Dettagli Invisibili',
    colonnaF: "I dettagli apparentemente invisibili sono quelli che creano la vera perfezione. Guarda con occhi nuovi lo spazio che ti meriti. — Immobiliare Giancani"
  },
  {
    id: '14',
    categoria: 'Stimolo & Ambizione',
    titolo: 'La Felicità ha un Indirizzo',
    colonnaF: "La felicità ha un indirizzo. Inizia a scrivere la tua nuova storia circondato dal valore, dalla bellezza e dalla sicurezza. — Immobiliare Giancani"
  },
  {
    id: '15',
    categoria: 'Prestigio & Valore',
    titolo: 'Consulenza Sartoriale',
    colonnaF: "Come un abito di alta sartoria, ogni compravendita immobiliare richiede precisione millimetrica e riservatezza. Affidati all'eccellenza. — Immobiliare Giancani"
  }
];

export function normalizzaMetriQuadriStr(val) {
  if (!val) return '120 metri quadri';
  const s = String(val)
    .replace(/\b(\d+(?:[.,]\d+)?)\s*(?:m\s*²|m2|mq\.?|MQ\.?)\b/gi, '$1 metri quadri')
    .replace(/\b(?:mq\.?|m²|m2)\b/gi, 'metri quadri')
    .trim();
  const numOnly = s.match(/^\d+(?:[.,]\d+)?$/);
  if (numOnly) return `${numOnly[0]} metri quadri`;
  if (!s.toLowerCase().includes('metri quadri')) {
    const n = s.replace(/[^\d.,]/g, '').trim();
    return n ? `${n} metri quadri` : `${s} metri quadri`;
  }
  return s;
}

export function normalizzaPrezzoStr(val) {
  const s = String(val || '').trim();
  if (!s || s.toLowerCase().includes('riservata')) return 'Trattativa Riservata';
  if (s.includes('€')) return s;
  return `€ ${s}`;
}

export function forzaBrandingChiusura(testo) {
  let out = String(testo || '')
    .replace(/\b(\d+(?:[.,]\d+)?)\s*(?:m\s*²|m2|mq\.?|MQ\.?)\b/gi, '$1 metri quadri')
    .replace(/\b(?:mq\.?|m²|m2)\b/gi, 'metri quadri')
    .replace(/\s+/g, ' ')
    .trim();
  out = out.replace(/\s*—?\s*Immobiliare Giancani\s*$/i, '').trim();
  return `${out} — Immobiliare Giancani`;
}

/**
 * Deduce la tipologia immobile dal nome cartella o foglio (identico a 08_AutoVisionEGalleria.js)
 */
export function estraiTipoImmobileDaNomeCartella(nomeCartellaOTab) {
  if (!nomeCartellaOTab) return 'Appartamento';
  const clean = String(nomeCartellaOTab).replace(/_/g, ' ').trim();
  const lower = clean.toLowerCase();

  if (lower.includes('villetta')) return 'Villetta a schiera';
  if (lower.includes('villa')) return 'Villa';
  if (lower.includes('appartamento')) return 'Appartamento';
  if (lower.includes('attico') || lower.includes('mansarda')) return 'Attico / Mansarda';
  if (lower.includes('casa indipendente') || lower.includes('indipendente')) return 'Casa Indipendente';
  if (lower.includes('rustico') || lower.includes('casale')) return 'Rustico / Casale';
  if (lower.includes('monolocale')) return 'Appartamento';
  if (lower.includes('bilocale')) return 'Appartamento';
  if (lower.includes('trilocale')) return 'Appartamento';
  if (lower.includes('quadrilocale')) return 'Appartamento';
  if (lower.includes('palazzina') || lower.includes('stabile')) return 'Palazzina / Stabile';
  if (lower.includes('ufficio') || lower.includes('studio')) return 'Ufficio / Studio';
  if (lower.includes('commerciale') || lower.includes('locale') || lower.includes('negozio')) return 'Locale Commerciale';
  if (lower.includes('garage') || lower.includes('box')) return 'Garage / Box Auto';
  if (lower.includes('terreno edif')) return 'Terreno Edificabile';
  if (lower.includes('terreno agr')) return 'Terreno Agricolo';
  if (lower.includes('terreno')) return 'Terreno Edificabile';
  if (lower.includes('deposito') || lower.includes('magazzino')) return 'Magazzino / Deposito';
  if (lower.includes('capannone')) return 'Capannone';
  if (lower.includes('b&b') || lower.includes('hotel')) return 'Struttura Ricettiva / B&B';
  if (lower.includes('loft')) return 'Loft / Open Space';

  return 'Appartamento';
}

/**
 * Deduce la stanza esatta dal nome del file; MAI "Ambiente" generico -> usa tipoImmobileDefault
 */
export function deduciStanzaOImmobile(fileName, tipoImmobileDefault = 'Appartamento') {
  const fallback = tipoImmobileDefault || 'Appartamento';
  if (!fileName) return fallback;
  const rawBase = String(fileName).replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  const bLow = rawBase.toLowerCase();

  if (/\b(wc|bagno|toilette|servizio|doccia|lavanderia|bidet|water)\b/.test(bLow) || bLow.includes('bagno')) {
    return bLow.includes('lavanderia') ? 'Lavanderia' : 'Bagno';
  }
  if (/\b(cucina|cottura|kitchen|tinello|pranzo)\b/.test(bLow) || bLow.includes('cucina')) {
    return 'Cucina';
  }
  if (bLow.includes('cameretta') || bLow.includes('ragazzi') || bLow.includes('bambin')) {
    return 'Cameretta';
  }
  if (/\b(camera|letto|matrimoniale|notte|singola|padronale)\b/.test(bLow) || bLow.includes('camera')) {
    return 'Camera da Letto';
  }
  if (/\b(soggiorno|salone|living|salotto|relax)\b/.test(bLow) || bLow.includes('soggiorno') || bLow.includes('salone') || bLow.includes('salotto')) {
    return bLow.includes('living') ? 'Zona Living' : 'Soggiorno';
  }
  if (/\b(terrazz|balcon|verand|loggia|vista|panorama)\b/.test(bLow) || bLow.includes('terrazz') || bLow.includes('balcon')) {
    return bLow.includes('balcon') ? 'Balcone' : 'Terrazzo';
  }
  if (/\b(giardin|estern|cortil|portic|facciata|prospetto)\b/.test(bLow) || bLow.includes('giardin') || bLow.includes('estern')) {
    return bLow.includes('giardin') ? 'Giardino' : 'Facciata Esterna';
  }
  if (/\b(garage|box|auto)\b/.test(bLow) || bLow.includes('garage')) {
    return 'Garage / Box';
  }
  if (/\b(ingresso|entrata|corridoio|disimpegno|atrio)\b/.test(bLow) || bLow.includes('ingresso')) {
    return bLow.includes('disimpegn') ? 'Disimpegno' : 'Ingresso';
  }
  if (/\b(piscin|tavern|mansard|ripostigl|cantin|studio)\b/.test(bLow)) {
    if (bLow.includes('piscin')) return 'Piscina';
    if (bLow.includes('tavern')) return 'Taverna';
    if (bLow.includes('mansard')) return 'Mansarda';
    if (bLow.includes('studio')) return 'Studio';
    return 'Ripostiglio';
  }

  // Se non è riconosciuta e non è un nome generico IMG_/DSC_/WhatsApp/numeri
  const isCameraFile = /^(img|dsc|pxl|vid|mov|wa|whatsapp|photo|foto|dcim|360|screenshot|\d+)/i.test(rawBase);
  if (!isCameraFile && rawBase.length >= 3 && rawBase.length <= 36) {
    return rawBase.charAt(0).toUpperCase() + rawBase.slice(1);
  }
  return fallback;
}

export function getSottoDettagliStanza(nomeStanza) {
  const k = String(nomeStanza || '').toLowerCase();
  for (const key of Object.keys(SMART_STANZE_CONFIG.particolariPerStanza)) {
    if (k.includes(key)) {
      return SMART_STANZE_CONFIG.particolariPerStanza[key];
    }
  }
  return [
    'luminoso e accogliente',
    'ristrutturato di recente',
    'con finiture moderne',
    'con vista aperta',
    'climatizzato'
  ];
}

/**
 * 🎙️ 11 Template Emozionali & Sensoriali per Colonna F (identici a 08_AutoVisionEGalleria.js)
 */
export function generaTestoDescrittivoStanza(stanzaNome, scheda = {}, nomeCartella = '') {
  const tipo = (scheda.tipoImmobile || estraiTipoImmobileDaNomeCartella(nomeCartella) || 'questo immobile').trim();
  const mq = normalizzaMetriQuadriStr(scheda.metriQuadri);
  const zona = (scheda.zona || '').trim();
  const zonaFrase = zona ? ` a ${zona}` : '';
  const prezzo = normalizzaPrezzoStr(scheda.prezzo);
  const prezzoFrase = (prezzo && prezzo !== 'Trattativa Riservata')
    ? ` proposto a ${prezzo}`
    : ' con trattativa riservata';

  let stato = (scheda.stato || 'rifinito con cura').trim();
  if (scheda.statoDettaglio && scheda.statoDettaglio.trim()) {
    stato += ` con ${scheda.statoDettaglio.trim()}`;
  }

  let note = '';
  if (scheda.noteDaria && scheda.noteDaria.trim()) {
    let n = scheda.noteDaria.trim();
    if (!/[.!?]$/.test(n)) n += '.';
    note = ` ${n}`;
  }

  const st = (stanzaNome || tipo || 'Immobile').trim();
  const stLow = st.toLowerCase();
  const tipoArt = tipo.toLowerCase().includes('questo') ? tipo : `questo ${tipo}`;
  let testo = '';

  if (stLow.includes('cucina') || stLow.includes('cottura') || stLow.includes('tinello')) {
    testo = `Entriamo nel cuore pulsante e conviviale della casa: ${st} dove ogni risveglio profuma di caffè e i pranzi della domenica riuniscono chi amate in un'atmosfera calda e autentica. Uno spazio accogliente e ${stato}, che celebra al meglio i ${mq} totali di ${tipoArt}${zonaFrase},${prezzoFrase}.${note} Il luogo ideale dove condividere sorrisi, ricette e ricordi preziosi con tutta la famiglia.`;
  } else if (stLow.includes('salon') || stLow.includes('soggiorno') || stLow.includes('living') || stLow.includes('pranzo') || stLow.includes('salotto') || stLow.includes('open space')) {
    testo = `Ammirate la magnificenza di questa luminosa zona giorno: ${st} concepito per avvolgervi in una sensazione di assoluto benessere e prestigio. Lasciatevi cullare dalla luce pomeridiana che esalta ogni finitura e immaginate la gioia di rilassarvi sul divano dopo una lunga giornata o di brindare con gli amici in uno spazio ${stato}, che nobilita i suoi ${mq} complessivi${zonaFrase},${prezzoFrase}.${note} Il piacere puro e impagabile di sentirsi finalmente e profondamente a casa.`;
  } else if (stLow.includes('camera') || stLow.includes('letto') || stLow.includes('matrimonial') || stLow.includes('notte')) {
    testo = `Varcate la soglia di questa intima ${st}: una vera oasi di pace e silenzio dove il riposo diventa un abbraccio rigenerante per mente e corpo. Uno spazio ovattato, morbido e ${stato}, progettato per regalarvi privacy totale e risvegli sereni all'interno dei ${mq} di ${tipoArt}${zonaFrase},${prezzoFrase}.${note} Il vostro rifugio esclusivo dove ricaricare le energie e sognare in piena tranquillità.`;
  } else if (stLow.includes('cameretta') || stLow.includes('ragazzi') || stLow.includes('bambin') || stLow.includes('studio')) {
    testo = `Ecco un ambiente arioso, protetto e pieno di energia positiva (${st}), perfetto per accompagnare la crescita, i giochi e le passioni dei vostri figli o per ospitare il vostro studio personale. Uno spazio versatile, allegro e ${stato}, meravigliosamente integrato nei ${mq} dell'abitazione${zonaFrase},${prezzoFrase}.${note} Il nido stimolante e sicuro dove coltivare sogni e progetti per il futuro.`;
  } else if (stLow.includes('bagno') || stLow.includes('servizio') || stLow.includes('lavander') || stLow.includes('wc') || stLow.includes('toilette')) {
    testo = `Concedetevi una parentesi di puro benessere e freschezza in questo ${st} curato nei minimi dettagli, pensato come una piccola spa privata all'interno della propria casa. Superfici armoniose, igiene impeccabile e comfort moderno in un contesto ${stato}, a servizio dei ${mq} complessivi dell'immobile${zonaFrase},${prezzoFrase}.${note} Lo spazio intimo ideale per iniziare e concludere ogni giornata con energia e serenità.`;
  } else if (stLow.includes('balcon') || stLow.includes('terrazz') || stLow.includes('verand') || stLow.includes('loggia') || stLow.includes('panorama') || stLow.includes('vista')) {
    testo = `Aprite le porte ed entrate in questo suggestivo ${st}: una magnifica apertura verso l'orizzonte dove respirare libertà e godersi la brezza siciliana. Immaginate la magia di un aperitivo al tramonto sotto le stelle o la quiete di una colazione all'aperto, un plus irrinunciabile che valorizza i ${mq} di ${tipoArt}${zonaFrase},${prezzoFrase}.${note} Lo sfogo all'aperto che trasforma ogni bella giornata in un momento di vacanza quotidiana.`;
  } else if (stLow.includes('giardin') || stLow.includes('corte') || stLow.includes('portic') || stLow.includes('estern') || stLow.includes('facciat') || stLow.includes('piscin')) {
    testo = `Riconnettetevi con la bellezza degli spazi aperti in questo splendido ${st}: un angolo curato e luminoso dove vivere momenti indimenticabili all'aria aperta in totale privacy e sicurezza, a corredo dei ${mq} della proprietà${zonaFrase},${prezzoFrase}.${note} Un'emozione autentica che valorizza ogni giorno vissuto in famiglia.`;
  } else if (stLow.includes('garage') || stLow.includes('box') || stLow.includes('auto')) {
    testo = `La totale tranquillità mentale di rientrare e trovare sempre il proprio posto auto sicuro e riparato: ecco ${st} a servizio di ${tipoArt}${zonaFrase}. Uno spazio custodito e versatile che completa i ${mq} complessivi,${prezzoFrase}.${note} La serenità e la comodità quotidiana di proteggere il proprio veicolo e i propri hobby.`;
  } else if (stLow.includes('magazzin') || stLow.includes('deposit') || stLow.includes('cantin') || stLow.includes('ripostigl') || stLow.includes('tavern') || stLow.includes('mansard')) {
    testo = `Uno spazio prezioso che dona armonia, carattere e ordine a tutta la casa: questo pratico ${st} ${stato} è il perfetto alleato per vivere al meglio i ${mq} totali${zonaFrase},${prezzoFrase}.${note} La funzionalità intelligente che rende l'abitare quotidiano rilassante e organizzato.`;
  } else if (stLow.includes('corridoio') || stLow.includes('disimpegno') || stLow.includes('ingresso') || stLow.includes('entrata') || stLow.includes('atrio')) {
    testo = `La rassicurante sensazione del varcare la soglia e sentirsi accolti nel proprio nido protetto: questo elegante ${st} ${stato} distribuisce con armonia e proporzione i ${mq} di ${tipoArt}${zonaFrase},${prezzoFrase}.${note} Il primo caloroso benvenuto che apre le porte a nuovi capitoli di vita felice.`;
  } else {
    testo = `Ammirate l'atmosfera calda e curata di ${st} in ${tipoArt}${zonaFrase}. Un ambiente ${stato} e ricco di fascino, studiato per regalarvi emozioni autentiche e massimo comfort all'interno dei suoi ${mq} complessivi,${prezzoFrase}.${note} Un'opportunità immobiliare esclusiva presentata con passione e competenza.`;
  }

  return forzaBrandingChiusura(testo);
}

async function blobOrUrlToBase64Parts(fileOrUrl) {
  if (!fileOrUrl) return null;
  if (fileOrUrl instanceof Blob) {
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result || '');
        const idx = res.indexOf(',');
        const mime = (res.match(/^data:([^;]+);/) || [])[1] || fileOrUrl.type || 'image/jpeg';
        resolve(idx >= 0 ? { mimeType: mime, data: res.slice(idx + 1) } : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(fileOrUrl);
    });
  }
  try {
    const resp = await fetch(fileOrUrl);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await blobOrUrlToBase64Parts(blob);
  } catch {
    return null;
  }
}

/**
 * 👁️ Analizza la foto reale con Gemini Vision AI (gemini-1.5-flash) con Base64
 * Fallback automatico ai 11 template sensoriali in caso di assenza chiave o errore.
 */
export async function analizzaFotoConGeminiVision(fileOrUrl, stanza, scheda = {}, geminiKey = '', extraPrompt = '') {
  const key = String(geminiKey || '').trim();
  const nomeStanza = (stanza || scheda.tipoImmobile || 'Immobile').trim();
  if (!key || key.length < 15) {
    return {
      testo: generaTestoDescrittivoStanza(nomeStanza, scheda),
      usatoVision: false,
      motivo: 'Chiave Gemini non impostata: applicato generatore emozionale 11 ambienti.'
    };
  }

  const mqStr = normalizzaMetriQuadriStr(scheda.metriQuadri);
  const przStr = normalizzaPrezzoStr(scheda.prezzo);
  const prompt = `Sei DarIA, testimonial e voce d'élite di Immobiliare Giancani.
Devi presentare l'ambiente '${nomeStanza}' di questo immobile con stile caloroso, emozionale e persuasivo.

SCHEDA IMMOBILE:
- Tipologia: ${scheda.tipoImmobile || 'Immobile'}
- Superficie Totale: ${mqStr}
- Zona / Posizione: ${scheda.zona || 'Favara ed Agrigento'}
- Prezzo di Vendita: ${przStr}
- Stato & Finiture: ${scheda.stato || 'rifinito con cura'}${scheda.statoDettaglio ? ` (${scheda.statoDettaglio})` : ''}
${scheda.noteDaria ? `- ISTRUZIONI REGIA DARIA: ${scheda.noteDaria}\n` : ''}${extraPrompt ? `- Focus: ${extraPrompt}\n` : ''}
REGOLE TASSATIVE:
1. Osserva gli elementi visivi reali nella foto (luce, pavimenti, colori, finestre, arredi) e integrali con il nome '${nomeStanza}'.
2. Integra con naturalezza tipologia, superficie in 'metri quadri' (MAI abbreviare in mq o m²), zona, stato e prezzo.
3. Scrivi 2 o 3 frasi scorrevoli pronte per la lettura vocale in diretta TV / Reels.
4. Termina TASSATIVAMENTE con: — Immobiliare Giancani`;

  try {
    const parts = [{ text: prompt }];
    const b64 = await blobOrUrlToBase64Parts(fileOrUrl);
    if (b64 && b64.data && b64.mimeType.startsWith('image/')) {
      parts.push({ inline_data: { mime_type: b64.mimeType, data: b64.data } });
    }

    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`
    ];

    for (const url of endpoints) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      });
      if (!res.ok) continue;
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (raw && raw.trim().length > 20) {
        return {
          testo: forzaBrandingChiusura(raw),
          usatoVision: Boolean(b64),
          motivo: b64 ? 'Analisi visiva Gemini Vision completata!' : 'Testo Gemini AI generato!'
        };
      }
    }
  } catch (err) {
    console.warn('Gemini Vision fallback:', err);
  }

  return {
    testo: generaTestoDescrittivoStanza(nomeStanza, scheda),
    usatoVision: false,
    motivo: 'Applicato template emozionale locale (Colonna F).'
  };
}

/**
 * 🎨 Motore Editor Fotografico Canvas Calibrato + Oscuratore Circolare Privacy + Nadir 360°
 */
export function applicaFiltroEFotoEditorCanvas(canvas, img, logoImg, opts = {}) {
  if (!canvas || !img) return;
  const maxDim = opts.maxDim || 1920;
  let tw = img.naturalWidth || img.width || 1200;
  let th = img.naturalHeight || img.height || 800;
  if (tw > maxDim || th > maxDim) {
    if (tw >= th) { th = Math.round((th * maxDim) / tw); tw = maxDim; }
    else { tw = Math.round((tw * maxDim) / th); th = maxDim; }
  }
  if (canvas.width !== tw) canvas.width = tw;
  if (canvas.height !== th) canvas.height = th;
  const ctx = canvas.getContext('2d');

  const b = Number(opts.brightness ?? 100);
  const c = Number(opts.contrast ?? 100);
  const s = Number(opts.saturation ?? 100);

  ctx.clearRect(0, 0, tw, th);
  ctx.save();
  ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
  ctx.drawImage(img, 0, 0, tw, th);
  ctx.restore();

  // Oscuratore Circolare Privacy (targhe auto, volti, foto di famiglia)
  if (opts.maskEnabled) {
    const posX = (Number(opts.maskX ?? 50) / 100) * tw;
    const posY = (Number(opts.maskY ?? 50) / 100) * th;
    const radius = Math.max(12, Number(opts.maskSize ?? 80) * (tw / 1000));
    const opacity = Math.max(0.1, Math.min(1, Number(opts.maskOpacity ?? 95) / 100));

    // Sfocatura reale dell'area circolare + patina scura opzionale
    ctx.save();
    ctx.beginPath();
    ctx.arc(posX, posY, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.filter = 'blur(18px) brightness(0.85)';
    ctx.drawImage(img, 0, 0, tw, th);
    ctx.filter = 'none';
    ctx.fillStyle = `rgba(11, 17, 32, ${(opacity * 0.55).toFixed(2)})`;
    ctx.fillRect(posX - radius, posY - radius, radius * 2, radius * 2);
    ctx.restore();

    // Bordo sottile tratteggiato solo in anteprima editor se richiesto
    if (opts.showMaskGuide) {
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 197, 66, 0.85)';
      ctx.lineWidth = Math.max(2, tw * 0.003);
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(posX, posY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Watermark Logo Agenzia (7 posizioni incluso 360° Cerchio Bianco Nadir)
  const posizione = opts.logoPosition || 'centrale_semitrasparente';
  if (opts.applyWatermark !== false && posizione !== 'nessuno' && logoImg && (logoImg.naturalWidth || logoImg.width)) {
    const lW = logoImg.naturalWidth || logoImg.width;
    const lH = logoImg.naturalHeight || logoImg.height;
    ctx.save();
    const logoW = tw * 0.20;
    const logoH = (lH / lW) * logoW;
    const margin = tw * 0.03;

    if (posizione === '360_nadir') {
      const radius = tw * 0.08;
      const cx = tw / 2;
      const cy = th - (radius * 0.85);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      const nw = radius * 1.45;
      const nh = (lH / lW) * nw;
      ctx.drawImage(logoImg, cx - nw / 2, cy - nh / 2, nw, nh);
    } else if (posizione === 'in_basso_destra') {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(logoImg, tw - logoW - margin, th - logoH - margin, logoW, logoH);
    } else if (posizione === 'in_basso_sinistra') {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(logoImg, margin, th - logoH - margin, logoW, logoH);
    } else if (posizione === 'in_alto_destra') {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(logoImg, tw - logoW - margin, margin, logoW, logoH);
    } else if (posizione === 'in_alto_sinistra') {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(logoImg, margin, margin, logoW, logoH);
    } else {
      const cw = tw * 0.30;
      const ch = (lH / lW) * cw;
      ctx.globalAlpha = 0.42;
      ctx.drawImage(logoImg, (tw - cw) / 2, (th - ch) / 2, cw, ch);
    }
    ctx.restore();
  }
}

export async function preparaFileBase64ConEditorOpts(file, opts = {}, logoImg = null) {
  const isImg = (file.type || '').startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp)$/i.test(file.name || '');
  if (!isImg) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result);
      img.onload = () => {
        const cvs = document.createElement('canvas');
        const is360 = (file.name || '').toLowerCase().includes('360');
        const effectivePos = opts.logoPosition || (is360 ? '360_nadir' : 'centrale_semitrasparente');
        applicaFiltroEFotoEditorCanvas(cvs, img, logoImg, {
          ...opts,
          logoPosition: effectivePos,
          showMaskGuide: false,
          maxDim: 1920
        });
        resolve(cvs.toDataURL('image/jpeg', 0.88));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function leggiFraseConTTS(testo) {
  const clean = String(testo || '')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return false;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'it-IT';
    u.rate = 0.96;
    const voices = window.speechSynthesis.getVoices();
    const itV = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('it'));
    if (itV) u.voice = itV;
    window.speechSynthesis.speak(u);
    return true;
  }
  return false;
}
