// Gestione storage locale persistente su Android (IndexedDB + localStorage)
const DB_NAME = 'giancani_studio_pwa';
const DB_VERSION = 1;
const STORE_KV = 'kv_store';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSet(key, val) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_KV, 'readwrite');
    tx.objectStore(STORE_KV).put(val, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_KV, 'readonly');
    const req = tx.objectStore(STORE_KV).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export function getSettings() {
  try {
    const raw = localStorage.getItem('giancani_pwa_settings');
    const def = {
      geminiKey: '',
      telefono: '+39 320 000 0000',
      sito: 'www.immobiliaregiancani.it',
      lastStyles: []
    };
    return raw ? { ...def, ...JSON.parse(raw) } : def;
  } catch {
    return { geminiKey: '', telefono: '+39 320 000 0000', sito: 'www.immobiliaregiancani.it', lastStyles: [] };
  }
}

export function saveSettings(patch) {
  const cur = getSettings();
  const next = { ...cur, ...patch };
  localStorage.setItem('giancani_pwa_settings', JSON.stringify(next));
  return next;
}

export async function getLogoDataUrl() {
  const saved = await idbGet('agency_logo_scontornato_v3');
  if (saved) return saved;
  return './assets/logo_default.png';
}

export async function saveLogoDataUrl(dataUrl) {
  await idbSet('agency_logo_scontornato_v3', dataUrl);
  return dataUrl;
}

export async function resetLogoDefault() {
  await idbSet('agency_logo_scontornato_v3', null);
  return './assets/logo_default.png';
}

export async function loadArchivioColonnaF() {
  try {
    const custom = await idbGet('archivio_custom');
    const res = await fetch('./data/archivio_colonna_f.json');
    const base = res.ok ? await res.json() : [];
    return Array.isArray(custom) && custom.length ? [...custom, ...base] : base;
  } catch {
    return [];
  }
}
