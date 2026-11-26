// Generatore testi 3-in-1 (Canzone, Descrizione, Copy Social) + Prompt Gemini/Suno
// Rispetta rigorosamente: "metri quadri" per esteso, "Immobiliare Giancani vende", chiusura "— Immobiliare Giancani"

export function normalizzaMetriQuadri(testo) {
  if (!testo) return '';
  return String(testo)
    .replace(/\b(\d+(?:[.,]\d+)?)\s*(?:m\s*²|m2|mq\.?|MQ\.?)\b/gi, '$1 metri quadri')
    .replace(/\b(?:mq\.?|m²|m2)\b/gi, 'metri quadri');
}

export function applicaRegoleBrand(testo, scheda) {
  let out = normalizzaMetriQuadri(testo || '').trim();
  const mqNum = String(scheda.superficie || '').replace(/[^\d.,]/g, '').trim();
  if (mqNum && !out.toLowerCase().includes('metri quadri')) {
    out += `\nSuperficie: ${mqNum} metri quadri.`;
  }
  if (!out.toLowerCase().includes('immobiliare giancani vende')) {
    out = `Immobiliare Giancani vende ${scheda.tipologia || 'immobile'} a ${scheda.zona || 'Favara'}.\n` + out;
  }
  out = out.replace(/—\s*Immobiliare Giancani\s*$/i, '').trim();
  return `${out}\n\n— Immobiliare Giancani`;
}

export function costruisciPromptSunoGemini(scheda) {
  const zona = scheda.zona || 'Favara';
  const tipo = scheda.tipologia || 'Appartamento';
  const mq = scheda.superficie ? `${scheda.superficie} metri quadri` : 'ampi spazi';
  const desc = normalizzaMetriQuadri(scheda.descrizione || '4 camere, cucina abitabile, bagno, vista panoramica');
  const temi = scheda.temi || 'famiglia, felicità, calore di casa, futuro sereno';

  const promptGemini = `Scrivi il testo di una canzone allegra, positiva ed emozionante in italiano per un video immobiliare di Immobiliare Giancani.
Dati obbligatori:
- Formula iniziale: "Immobiliare Giancani vende"
- Tipologia: ${tipo}
- Zona: ${zona}
- Superficie: ${mq} (scrivi SEMPRE "metri quadri" per esteso, mai "mq")
- Dettagli: ${desc}
- Temi positivi: ${temi} (ti crei la famiglia, la felicità è dentro la famiglia)
- Chiusura obbligatoria esatta: — Immobiliare Giancani`;

  const promptSuno = `Upbeat warm Italian pop, acoustic guitar, uplifting piano, joyful family atmosphere, 118 BPM, clear male/female vocal, bright modern production. Lyrics about ${tipo} in ${zona} (${mq}), Immobiliare Giancani vende, home happiness and family.`;

  return { promptGemini, promptSuno };
}

function generaFallbackLocale(scheda) {
  const zona = scheda.zona || 'Favara';
  const tipo = scheda.tipologia || 'Appartamento';
  const mq = scheda.superficie ? `${scheda.superficie} metri quadri` : 'ampi spazi luminosi';
  const desc = normalizzaMetriQuadri(scheda.descrizione || '4 camere, cucina, bagno e vista panoramica');
  const temi = scheda.temi || 'la felicità è dentro la famiglia, un nido dove crescere insieme';

  const canzone = applicaRegoleBrand(
`Immobiliare Giancani vende un sogno vero a ${zona} 🏡
${tipo} di ${mq}, luce calda ogni mattina ✨
${desc}, spazio per chi ami davvero ❤️
Qui ti crei la famiglia, ${temi} 🌟
Apri la porta al tuo domani, vivi la tua casa adesso! 🔑`,
    scheda
  );

  const descrizione = applicaRegoleBrand(
`Immobiliare Giancani vende splendido ${tipo.toLowerCase()} situato a ${zona}, con una superficie di ${mq}.
L'immobile dispone di ${desc}. Una soluzione pensata per il benessere quotidiano, dove la felicità è dentro la famiglia e ogni ambiente accoglie luce e armonia.`,
    scheda
  );

  const social = applicaRegoleBrand(
`🏡 NUOVA PROPOSTA A ${zona.toUpperCase()}!
Immobiliare Giancani vende ${tipo.toLowerCase()} di ${mq} ✨
✅ ${desc}
💛 Ideale per chi sogna calore, serenità e un futuro in famiglia!
📩 Scrivici in privato o chiamaci per prenotare la tua visita.`,
    scheda
  );

  return { canzone, descrizione, social, usatoGemini: false };
}

export async function generaTesti3In1(scheda, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return generaFallbackLocale(scheda);
  }

  const zona = scheda.zona || 'Favara';
  const tipo = scheda.tipologia || 'Appartamento';
  const mq = scheda.superficie ? `${scheda.superficie} metri quadri` : 'superficie generosa';
  const desc = normalizzaMetriQuadri(scheda.descrizione || '4 camere, cucina, bagno, vista panoramica');
  const temi = scheda.temi || 'ti crei la famiglia, la felicità è dentro la famiglia';

  const systemPrompt = `Sei il copywriter ufficiale di Immobiliare Giancani. Rispondi SOLO in JSON valido con le chiavi: "canzone", "descrizione", "social".
REGOLE OBBLIGATORIE:
1. Ogni testo deve contenere "Immobiliare Giancani vende".
2. Ogni superficie deve essere scritta per esteso come "metri quadri" (VIETATO scrivere mq o m²).
3. Ogni testo deve terminare con "— Immobiliare Giancani".
4. Usa temi positivi: ${temi}.
Dati immobile: ${tipo} a ${zona}, ${mq}, dettagli: ${desc}.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = JSON.parse(rawText);
    return {
      canzone: applicaRegoleBrand(parsed.canzone, scheda),
      descrizione: applicaRegoleBrand(parsed.descrizione, scheda),
      social: applicaRegoleBrand(parsed.social, scheda),
      usatoGemini: true
    };
  } catch (err) {
    console.warn('Fallback locale Gemini:', err);
    return generaFallbackLocale(scheda);
  }
}
