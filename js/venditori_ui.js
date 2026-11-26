import { state, uiHooks, $, $$, showToast, escapeHtml } from './app_core.js';
import { forzaBrandingChiusura } from './generator_engine.js';
import {
  WEBHOOK_CACCIATORI, DEFAULT_YT_PRESENTAZIONE, DEFAULT_TEMPLATE_PRESENTAZIONE_WA,
  INDICE_PORTALI_MINORI, caricaMemoria30Giorni, getStatoMemoriaItem, getStatoScaduto15gg,
  registraInvioInMemoria30Giorni, sbloccaContattoMemoria,
  caricaVisti, segnaComeVistoStorage, rimuoviDaVistiStorage,
  promuoviSospettoAVeroPrivatoStorage, segnaComeAgenziaStorage,
  getIndiceOrdineComune, compilaMessaggioPresentazione, loadCacciatoriDataset,
  aggiungiVenditoreCustom, parseMqNumerico
} from './crm_venditori_acquirenti.js';

const goStep = (n) => uiHooks.goStep(n);
const aggiornaGlobalKpiStrip = () => uiHooks.aggiornaGlobalKpiStrip();
const ponteImmobileAMontaVideo = (imm) => uiHooks.ponteImmobileAMontaVideo(imm);
const ponteImmobileAAcquirenti = (imm) => uiHooks.ponteImmobileAAcquirenti(imm);

function filtraListaVenditori(list) {
  const q = ($('#vndSearchInput')?.value || '').trim().toLowerCase();
  const com = state.vndComune;
  return list.filter((it) => {
    if (com !== 'TUTTI' && !(it.comune || '').toLowerCase().includes(com.toLowerCase())) return false;
    if (!q) return true;
    const blob = `${it.comune} ${it.titolo} ${it.via_zona} ${it.nome_privato} ${it.nome_agenzia} ${it.telefono} ${it.email_contatto} ${it.descrizione} ${it.prezzo}`.toLowerCase();
    return blob.includes(q);
  });
}

function segnaContattatoEBlocca30gg(item, canale) {
  registraInvioInMemoria30Giorni(item, canale, state.cacciatoriMemCloud);
  showToast(`✅ Contatto salvato in Memoria 30gg (${canale}) e nascosto!`);
  renderVenditoriAll();
  aggiornaGlobalKpiStrip();
}

function avviaWhatsAppVenditore(item) {
  let telClean = String(item.telefono || '').replace(/\D/g, '');
  if (!telClean || telClean.length < 8) {
    const inp = prompt('Inserisci il cellulare WhatsApp del proprietario:', '');
    if (!inp) return;
    telClean = inp.replace(/\D/g, '');
    if (telClean.length < 8) return;
    item.telefono = telClean;
  }
  if (telClean.startsWith('0')) telClean = '39' + telClean;
  else if (!telClean.startsWith('39')) telClean = '39' + telClean;

  const msg = compilaMessaggioPresentazione(item);
  segnaContattatoEBlocca30gg(item, 'WHATSAPP');
  window.open(`https://api.whatsapp.com/send?phone=${telClean}&text=${encodeURIComponent(msg)}`, '_blank');
}

function avviaEmailVenditore(item, openMailto = true) {
  let email = String(item.email_contatto || '').trim();
  if (!email || !email.includes('@')) {
    const inp = prompt('Inserisci l\'indirizzo Email del proprietario:', '');
    if (!inp || !inp.includes('@')) return;
    email = inp.trim();
    item.email_contatto = email;
  }
  const msg = compilaMessaggioPresentazione(item);
  const oggetto = `Proposta di collaborazione per la vendita del Suo immobile a ${item.comune} — Immobiliare Giancani`;

  try {
    fetch(WEBHOOK_CACCIATORI, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'invia_email_presentazione',
        id: item.id, telefono: item.telefono, email_contatto: email,
        nome: item.nome_privato, comune: item.comune, oggetto, messaggio: msg
      })
    }).catch(() => {});
  } catch {}

  segnaContattatoEBlocca30gg(item, 'EMAIL');
  if (openMailto) {
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(msg)}`;
  }
}

// PONTI 1-CLICK DALLA SCHEDA VENDITORE / INSERZIONE
function ponteVenditoreAInserzione(item) {
  $('#drvUploadFolderName').value = `${item.tipologia || 'Immobile'} ${item.comune || ''} ${item.via_zona || ''}`.replace(/\s+/g, ' ').trim().slice(0, 60);
  const detectedType = estraiTipoImmobileDaNomeCartella($('#drvUploadFolderName').value);
  if ($('#drvTipo')) $('#drvTipo').value = TIPO_IMMOBILE_LIST.find((t) => t.toLowerCase().includes((item.tipologia || detectedType).toLowerCase())) || detectedType;
  const mqN = parseMqNumerico(item.superficie);
  $('#drvMq').value = mqN || 120;
  $('#drvPrezzo').value = item.prezzo || '';
  $('#drvZona').value = item.comune ? `${item.comune}${item.via_zona ? ` - ${item.via_zona}` : ''}` : 'Favara';
  $('#drvDescGenerale').value = forzaBrandingChiusura(item.descrizione || item.titolo || '');
  selezionaInsSubTab('upload');
  goStep(3);
  showToast('🏠 Dati del Venditore portati in Gestione Inserzioni (Colonna F)!');
}


function renderCardVenditoreHtml(it, mode, mem) {
  const statoMem = getStatoMemoriaItem(it, mem);
  const statoScaduto = getStatoScaduto15gg(it, mem);
  const visti = caricaVisti();
  const isVisto = visti.includes(it.id);
  const isAgenzia = it.cat === 'agenzia';
  const isSospetto = it.cat === 'sospetto_agenzia';
  const badgeClass = isAgenzia ? 'agenzia' : (isSospetto ? 'sospetto' : '');
  const badgeText = isAgenzia ? `🏢 ${(it.nome_agenzia || 'Agenzia').slice(0, 22)}` : (isSospetto ? '🕵️ Sospetto Agenzia' : `👤 ${(it.nome_privato || 'Privato').slice(0, 22)}`);
  const hasWa = Boolean(it.telefono && it.telefono.trim().length >= 8);
  const hasEm = Boolean(it.email_contatto && it.email_contatto.includes('@'));
  let sitoFonte = it.portale || it.fonte || '';
  if (!sitoFonte && it.url) {
    try { sitoFonte = new URL(it.url).hostname.replace(/^www\./i, ''); } catch { sitoFonte = 'Web'; }
  }
  const dataInserzione = it.timestamp || it.data_inserzione || '';

  return `
    <div class="crm-card" data-vid="${escapeHtml(it.id)}">
      <div>
        <div class="crm-hero-img">
          <img src="${escapeHtml(it.foto_url || '')}" alt="${escapeHtml(it.titolo)}" loading="lazy" onerror="this.src='./assets/icon-192.png'">
          <span class="crm-badge-top ${badgeClass}">${escapeHtml(badgeText)}</span>
          ${(sitoFonte || dataInserzione) ? `
            <div style="position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.94); border:1px solid #cbd5e1; border-radius:9px; padding:3px 8px; text-align:right; box-shadow:0 2px 8px rgba(15,23,42,0.16); max-width:48%;">
              ${sitoFonte ? `<div style="font-size:10.5px; font-weight:800; color:#0369a1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">🌐 ${escapeHtml(sitoFonte)}</div>` : ''}
              ${dataInserzione ? `<div style="font-size:9.5px; font-weight:700; color:#475569;">📅 ${escapeHtml(dataInserzione)}</div>` : ''}
            </div>
          ` : ''}
          <span class="crm-price-tag">${escapeHtml(it.prezzo || 'Su richiesta')}</span>
        </div>
        <div class="crm-body">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--cyan); font-weight:700;">
            <span>📍 ${escapeHtml(it.comune)}</span>
            <span>${escapeHtml(it.timestamp || '')}</span>
          </div>
          <div class="crm-title">${escapeHtml(it.titolo)}</div>
          <div class="crm-meta-row">
            <span class="crm-tag">📐 ${escapeHtml(normalizzaMetriQuadriStr(it.superficie))}</span>
            <span class="crm-tag">🏠 ${escapeHtml(it.tipologia || 'Immobile')}</span>
            ${hasWa ? `<span class="crm-tag" style="${statoMem ? 'color:#14532d; background:#cbd5c0; border-color:#6b8e78; opacity:0.65; font-weight:700;' : 'color:#047857; background:#ecfdf5; border-color:#6ee7b7; font-weight:800;'}">📞 ${escapeHtml(it.telefono)}</span>` : ''}
          </div>
          ${(it.ha_ribasso || it.ribasso_importo < 0) ? `<div class="info-banner" style="border-color:#fb7185; margin:4px 0;">📉 Ribasso: ${it.ribasso_importo} € (${it.ribasso_percentuale}%)</div>` : ''}
          ${isSospetto && it.motivo_sospetto ? `<div class="info-banner gold-banner" style="margin:4px 0;">⚠️ ${escapeHtml(it.motivo_sospetto)}</div>` : ''}
          <div class="crm-colf-box">📄 ${escapeHtml(it.descrizione)}</div>
          ${statoMem ? `<div class="info-banner gold-banner" style="margin-top:6px;">✅ Contattato (${escapeHtml(statoMem.canale)}) • Nascosto per ${statoMem.giorni_rimanenti} gg</div>` : ''}
          ${statoScaduto ? `<div class="info-banner" style="margin-top:6px; background:#fef3c7; border-color:#d97706; color:#92400e;">⏰ <strong>Riaffiorato dopo 15 giorni</strong> (contattato il ${escapeHtml(statoScaduto.data_ora || '')} via ${escapeHtml(statoScaduto.canale || '')}) • Pronto per ricontatto — Immobiliare Giancani</div>` : ''}
        </div>
      </div>
      <div>
        <div class="crm-actions">
          ${!isAgenzia ? `
            <button type="button" class="btn ${hasWa ? (statoMem ? 'btn-outline' : 'btn-emerald') : 'btn-outline'} btn-sm" style="flex:1;${statoMem ? ' background:#cbd5c0; color:#14532d; border-color:#6b8e78; opacity:0.65;' : ''}" data-act="wa">📲 ${hasWa ? (statoMem ? 'Già Contattato' : 'WhatsApp') : 'Wa?'}</button>
            <button type="button" class="btn ${hasEm ? 'btn-cyan' : 'btn-outline'} btn-sm" data-act="email">✉️ Email</button>
            ${!statoMem ? `<button type="button" class="btn btn-gold btn-sm" style="width:auto;" data-act="done30" title="Segna contattato su qualsiasi canale per 30gg">✅ Contattato 30gg</button>` : `<button type="button" class="btn btn-outline btn-sm" data-act="unlock30">🔓 Sblocca 30gg</button>`}
          ` : ''}
          ${isSospetto ? `<button type="button" class="btn btn-emerald btn-sm" data-act="promuovi">✅ È Vero Privato</button>` : ''}
          ${!isAgenzia ? `<button type="button" class="btn btn-danger btn-sm" data-act="agenzia">🏢 Agenzia</button>` : ''}
          ${isVisto ? `<button type="button" class="btn btn-outline btn-sm" data-act="unvisto">↩️ Ripristina</button>` : `<button type="button" class="btn btn-outline btn-sm" data-act="visto">👁️ Visto</button>`}
          <a href="${escapeHtml(it.url || '#')}" target="_blank" class="btn btn-outline btn-sm">🌐 Link</a>
        </div>
        <div class="bridge-row">
          <button type="button" class="btn-bridge" data-act="to_ins">🏠 Crea Inserzione</button>
          <button type="button" class="btn-bridge" data-act="to_vid">🎬 Monta Video</button>
          <button type="button" class="btn-bridge" data-act="to_acq">🤝 Acquirenti</button>
        </div>
      </div>
    </div>
  `;
}

function bindCardVenditoreEvents(containerEl, list) {
  if (!containerEl) return;
  containerEl.querySelectorAll('.crm-card[data-vid]').forEach((card) => {
    const id = card.dataset.vid;
    const item = list.find((x) => x.id === id);
    if (!item) return;
    card.querySelectorAll('[data-act]').forEach((btn) => {
      btn.onclick = () => {
        const act = btn.dataset.act;
        if (act === 'wa') avviaWhatsAppVenditore(item);
        else if (act === 'email') avviaEmailVenditore(item, true);
        else if (act === 'done30') segnaContattatoEBlocca30gg(item, 'CONTATTO_DIRETTO');
        else if (act === 'unlock30') {
          sbloccaContattoMemoria(item.id, item.telefono, item.email_contatto, state.cacciatoriMemCloud);
          showToast('🔓 Contatto sbloccato dalla memoria 30 giorni!');
          renderVenditoriAll();
        } else if (act === 'promuovi') {
          promuoviSospettoAVeroPrivatoStorage(item.id, state.cacciatoriList);
          showToast('✅ Spostato tra i Privati Verificati!');
          renderVenditoriAll();
        } else if (act === 'agenzia') {
          segnaComeAgenziaStorage(item.id, item.telefono, state.cacciatoriList);
          showToast('🏢 Segnato come Agenzia!');
          renderVenditoriAll();
        } else if (act === 'visto') {
          segnaComeVistoStorage(item.id);
          showToast('👁️ Spostato nei Visti!');
          renderVenditoriAll();
        } else if (act === 'unvisto') {
          rimuoviDaVistiStorage(item.id);
          showToast('↩️ Ripristinato tra i Nuovi!');
          renderVenditoriAll();
        } else if (act === 'to_ins') ponteVenditoreAInserzione(item);
        else if (act === 'to_vid') ponteImmobileAMontaVideo(item);
        else if (act === 'to_acq') ponteImmobileAAcquirenti(item);
      };
    });
  });
}

function renderVenditoriAll() {
  const mem = caricaMemoria30Giorni(state.cacciatoriMemCloud);
  const visti = caricaVisti();

  const privatiAll = filtraListaVenditori(state.cacciatoriList.filter((x) => x.cat === 'privato' && !visti.includes(x.id)));
  privatiAll.sort((a, b) => {
    const aW = (a.telefono && a.telefono.trim().length >= 8) ? 1 : 0;
    const bW = (b.telefono && b.telefono.trim().length >= 8) ? 1 : 0;
    if (bW !== aW) return bW - aW;
    const aE = (a.email_contatto && a.email_contatto.includes('@')) ? 1 : 0;
    const bE = (b.email_contatto && b.email_contatto.includes('@')) ? 1 : 0;
    if (bE !== aE) return bE - aE;
    const oA = getIndiceOrdineComune(a.comune);
    const oB = getIndiceOrdineComune(b.comune);
    if (oA !== oB) return oA - oB;
    return String(b.timestamp || '').localeCompare(String(a.timestamp || ''));
  });

  const hasRecapitoFn = (x) => Boolean((x.telefono && String(x.telefono).replace(/\D/g, '').length >= 8) || (x.email_contatto && String(x.email_contatto).includes('@')));
  const prontiConRecapito = privatiAll.filter((x) => hasRecapitoFn(x) && !getStatoMemoriaItem(x, mem));
  const senzaRecapitiList = filtraListaVenditori(
    state.cacciatoriList.filter((x) => (x.cat === 'privato' || x.cat === 'sospetto_agenzia') && !visti.includes(x.id) && !getStatoMemoriaItem(x, mem) && !hasRecapitoFn(x))
  );
  const inMemoriaList = privatiAll.filter((x) => Boolean(getStatoMemoriaItem(x, mem)));
  const privVisibili = privatiAll.filter((x) => hasRecapitoFn(x) && !getStatoMemoriaItem(x, mem));
  const sospettiVisibili = filtraListaVenditori(state.cacciatoriList.filter((x) => x.cat === 'sospetto_agenzia' && hasRecapitoFn(x) && !visti.includes(x.id) && !getStatoMemoriaItem(x, mem)));

  let agenzieVisibili = filtraListaVenditori(state.cacciatoriList.filter((x) => x.cat === 'agenzia'));
  const selAg = $('#selVndAgenziaNome');
  if (selAg && selAg.options.length <= 1) {
    const nomi = Array.from(new Set(state.cacciatoriList.filter((x) => x.cat === 'agenzia').map((x) => x.nome_agenzia).filter(Boolean))).sort();
    selAg.innerHTML = '<option value="TUTTE">🏢 Tutte le Agenzie Concorrenti</option>' + nomi.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
  }
  if (selAg && selAg.value !== 'TUTTE') agenzieVisibili = agenzieVisibili.filter((x) => x.nome_agenzia === selAg.value);
  if (state.vndSoloRibassi) agenzieVisibili = agenzieVisibili.filter((x) => x.ha_ribasso || x.ribasso_importo < 0);

  const vistiList = filtraListaVenditori(state.cacciatoriList.filter((x) => visti.includes(x.id) || Boolean(getStatoMemoriaItem(x, mem))));

  if ($('#badgeVndCoda')) $('#badgeVndCoda').textContent = String(prontiConRecapito.length);
  if ($('#badgeVndPrivati')) $('#badgeVndPrivati').textContent = String(privVisibili.length);
  if ($('#badgeVndSenzaRecapiti')) $('#badgeVndSenzaRecapiti').textContent = String(senzaRecapitiList.length);
  if ($('#badgeVndSospetti')) $('#badgeVndSospetti').textContent = String(sospettiVisibili.length);
  if ($('#badgeVndAgenzie')) $('#badgeVndAgenzie').textContent = String(agenzieVisibili.length);
  if ($('#badgeVndVisti')) $('#badgeVndVisti').textContent = String(vistiList.length);
  if ($('#lblVndCountReady')) $('#lblVndCountReady').textContent = String(prontiConRecapito.length);
  if ($('#lblVndCountMem')) $('#lblVndCountMem').textContent = String(inMemoriaList.length);
  if ($('#lblVndCountAll')) $('#lblVndCountAll').textContent = String(privatiAll.length);

  const emailReady = privatiAll.filter((x) => x.email_contatto && x.email_contatto.includes('@') && !getStatoMemoriaItem(x, mem));
  if ($('#btnVndEmailAll')) {
    $('#btnVndEmailAll').textContent = `✉️ Invia Email a Tutti (${emailReady.length})`;
    $('#btnVndEmailAll').onclick = () => {
      if (!emailReady.length) { showToast('Nessuna email pronta da inviare al momento.'); return; }
      if (!confirm(`Inviare la presentazione a ${emailReady.length} proprietari con Email e bloccare per 30 giorni?`)) return;
      emailReady.forEach((it) => avviaEmailVenditore(it, false));
      showToast(`✅ ${emailReady.length} Email inviate e registrate in Memoria 30gg!`);
    };
  }

  // Highlight Card Coda 1-Click
  const hlBox = $('#vndHighlightCard');
  if (hlBox && state.vndSub === 'coda') {
    const coda = prontiConRecapito.filter((x) =>
      !state.vndSaltatiIds.includes(x.id) &&
      !state.vndSaltatiComuni.includes((x.comune || '').toLowerCase())
    );
    if (coda.length > 0) {
      const cur = coda[0];
      const msgPrev = compilaMessaggioPresentazione(cur);
      hlBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
          <span class="score-pill" style="background:var(--gold); color:#0b1120;">📍 ${(cur.comune || '').toUpperCase()} • ${coda.length} in coda</span>
          <span class="muted">${escapeHtml(normalizzaMetriQuadriStr(cur.superficie))} • ${escapeHtml(cur.prezzo)}</span>
        </div>
        <h3 style="margin:0 0 4px;">👤 ${escapeHtml(cur.nome_privato)} ${cur.telefono ? `• <span style="color:var(--emerald);">📞 ${escapeHtml(cur.telefono)}</span>` : `• ✉️ ${escapeHtml(cur.email_contatto)}`}</h3>
        <div style="font-size:13px; font-weight:700; margin-bottom:8px;">🏠 ${escapeHtml(cur.titolo)} (${escapeHtml(cur.via_zona)})</div>
        <div class="crm-colf-box" style="max-height:110px; white-space:pre-line;">${escapeHtml(msgPrev)}</div>
        <div class="row-actions">
          ${cur.telefono ? `<button type="button" class="btn btn-emerald" style="flex:2;" id="btnCurWa1Click">📲 INVIA SU WHATSAPP (1-CLICK • Mem 30gg)</button>` : ''}
          ${cur.email_contatto ? `<button type="button" class="btn btn-cyan" style="flex:1;" id="btnCurEm1Click">✉️ Email 1-Click</button>` : ''}
        </div>
        <div class="row-actions">
          <button type="button" class="btn btn-gold btn-sm" style="flex:2;" id="btnCurDone30">✅ Già Contattato (Qualsiasi Canale • 30gg)</button>
          <button type="button" class="btn btn-outline btn-sm" id="btnCurVisto">👁️ Visto</button>
          <button type="button" class="btn btn-outline btn-sm" id="btnCurSkip">⏭️ Salta</button>
          <button type="button" class="btn btn-outline btn-sm" id="btnCurSkipCom">⏭️ Paese</button>
        </div>
        <div class="bridge-row" style="margin-top:8px; border-radius:10px;">
          <button type="button" class="btn-bridge" id="btnCurBridgeIns">🏠 Crea Inserzione</button>
          <button type="button" class="btn-bridge" id="btnCurBridgeVid">🎬 Monta Video</button>
          <button type="button" class="btn-bridge" id="btnCurBridgeAcq">🤝 Incrocia Acquirenti</button>
        </div>
      `;
      if ($('#btnCurWa1Click')) $('#btnCurWa1Click').onclick = () => avviaWhatsAppVenditore(cur);
      if ($('#btnCurEm1Click')) $('#btnCurEm1Click').onclick = () => avviaEmailVenditore(cur, true);
      if ($('#btnCurDone30')) $('#btnCurDone30').onclick = () => segnaContattatoEBlocca30gg(cur, 'CONTATTO_DIRETTO');
      if ($('#btnCurVisto')) $('#btnCurVisto').onclick = () => { segnaComeVistoStorage(cur.id); renderVenditoriAll(); };
      if ($('#btnCurSkip')) $('#btnCurSkip').onclick = () => { state.vndSaltatiIds.push(cur.id); renderVenditoriAll(); };
      if ($('#btnCurSkipCom')) $('#btnCurSkipCom').onclick = () => { state.vndSaltatiComuni.push((cur.comune || '').toLowerCase()); renderVenditoriAll(); };
      if ($('#btnCurBridgeIns')) $('#btnCurBridgeIns').onclick = () => ponteVenditoreAInserzione(cur);
      if ($('#btnCurBridgeVid')) $('#btnCurBridgeVid').onclick = () => ponteImmobileAMontaVideo(cur);
      if ($('#btnCurBridgeAcq')) $('#btnCurBridgeAcq').onclick = () => ponteImmobileAAcquirenti(cur);
    } else {
      hlBox.innerHTML = `<div class="muted" style="text-align:center; padding:12px;">✅ Coda completata per questo filtro! ${(state.vndSaltatiIds.length || state.vndSaltatiComuni.length) ? '<button type="button" id="btnResetVndSkip" class="btn btn-outline btn-sm" style="margin-left:8px;">↺ Ripristina Saltati</button>' : ''}</div>`;
      if ($('#btnResetVndSkip')) $('#btnResetVndSkip').onclick = () => { state.vndSaltatiIds = []; state.vndSaltatiComuni = []; renderVenditoriAll(); };
    }
  }

  // Toggle sottoviste
  $('#vndPanelCoda').style.display = state.vndSub === 'coda' ? 'block' : 'none';
  $('#vndPanelCards').style.display = ['privati', 'senza_recapiti', 'sospetti', 'agenzie', 'visti'].includes(state.vndSub) ? 'block' : 'none';
  $('#vndPanelPortali').style.display = state.vndSub === 'portali' ? 'block' : 'none';
  if ($('#vndPanelFogliVisita')) $('#vndPanelFogliVisita').style.display = state.vndSub === 'fogli_visita' ? 'block' : 'none';
  $('#vndAgenzieToolbar').style.display = state.vndSub === 'agenzie' ? 'block' : 'none';

  if (state.vndSub === 'coda') {
    let listCoda = privatiAll;
    if (state.vndCodaFilter === 'DA_CONTATTARE') listCoda = privatiAll.filter((x) => !getStatoMemoriaItem(x, mem));
    else if (state.vndCodaFilter === 'IN_MEMORIA_30GG') listCoda = inMemoriaList;
    const shown = listCoda.slice(0, 60);
    $('#vndCodaList').innerHTML = shown.length
      ? shown.map((it) => renderCardVenditoreHtml(it, 'coda', mem)).join('')
      : '<div class="muted">Nessun contatto in questa vista per il filtro selezionato. — Immobiliare Giancani</div>';
    bindCardVenditoreEvents($('#vndCodaList'), shown);
  } else if (['privati', 'senza_recapiti', 'sospetti', 'agenzie', 'visti'].includes(state.vndSub)) {
    const map = { privati: privVisibili, senza_recapiti: senzaRecapitiList, sospetti: sospettiVisibili, agenzie: agenzieVisibili, visti: vistiList };
    const targetList = (map[state.vndSub] || []).slice(0, 80);
    $('#vndCardsGrid').innerHTML = targetList.length
      ? targetList.map((it) => renderCardVenditoreHtml(it, state.vndSub, mem)).join('')
      : '<div class="card muted" style="grid-column:1/-1; text-align:center;">Nessun annuncio trovato per questo filtro. — Immobiliare Giancani</div>';
    bindCardVenditoreEvents($('#vndCardsGrid'), targetList);
  } else if (state.vndSub === 'portali') {
    $('#vndPortaliGrid').innerHTML = INDICE_PORTALI_MINORI.map((p) => `
      <div class="crm-card" style="padding:12px;">
        <strong style="color:var(--gold); font-size:13px;">🌐 ${escapeHtml(p.nome)}</strong>
        <div class="muted" style="margin:4px 0 8px;">${escapeHtml(p.tipo)}</div>
        <a href="${escapeHtml(p.url)}" target="_blank" class="btn btn-cyan btn-sm">Apri Portale ↗</a>
      </div>
    `).join('');
  }
}

function selezionaVndSubTab(sub) {
  state.vndSub = sub;
  $$('#vndSubNav .sub-pill').forEach((b) => b.classList.toggle('active', b.dataset.vndSub === sub));
  renderVenditoriAll();
}



export function bindVenditoriEvents() {
  // BIND CATEGORIA 1 (VENDITORI)
  $$('#vndSubNav .sub-pill').forEach((b) => { b.onclick = () => selezionaVndSubTab(b.dataset.vndSub); });
  $$('#vndComuneChips .chip').forEach((c) => {
    c.onclick = () => {
      state.vndComune = c.dataset.vndCom;
      $$('#vndComuneChips .chip').forEach((x) => x.classList.toggle('active', x.dataset.vndCom === state.vndComune));
      renderVenditoriAll();
    };
  });
  $('#vndSearchInput').oninput = () => renderVenditoriAll();
  $$('[data-vnd-filter]').forEach((c) => {
    c.onclick = () => {
      state.vndCodaFilter = c.dataset.vndFilter;
      $$('[data-vnd-filter]').forEach((x) => x.classList.toggle('active', x.dataset.vndFilter === state.vndCodaFilter));
      renderVenditoriAll();
    };
  });
  $('#btnToggleRibassi').onclick = () => {
    state.vndSoloRibassi = !state.vndSoloRibassi;
    $('#btnToggleRibassi').classList.toggle('btn-gold', state.vndSoloRibassi);
    renderVenditoriAll();
  };
  $('#selVndAgenziaNome').onchange = () => renderVenditoriAll();
  $('#btnVndSyncCloud').onclick = async () => {
    try {
      const m = await sincronizzaMemoriaCloud();
      Object.assign(state.cacciatoriMemCloud, m || {});
      renderVenditoriAll();
      showToast('✅ Memoria 30 giorni sincronizzata dal Cloud!');
    } catch { showToast('ℹ️ Memoria locale sul dispositivo attiva.'); }
  };
  $('#btnVndOpenCfgMsg').onclick = () => {
    const box = $('#vndConfigMsgBox');
    const show = box.style.display === 'none';
    box.style.display = show ? 'block' : 'none';
    if (show) {
      $('#cfgYoutubeUrl').value = localStorage.getItem('GIANCANI_YT_URL') || DEFAULT_YT_PRESENTAZIONE;
      $('#cfgMessaggioWa').value = localStorage.getItem('GIANCANI_MSG_PRESENTAZIONE') || DEFAULT_TEMPLATE_PRESENTAZIONE_WA;
    }
  };
  $('#btnCfgSavePresentazione').onclick = () => {
    const yt = $('#cfgYoutubeUrl').value.trim() || DEFAULT_YT_PRESENTAZIONE;
    const msg = forzaBrandingChiusura($('#cfgMessaggioWa').value.trim() || DEFAULT_TEMPLATE_PRESENTAZIONE_WA);
    localStorage.setItem('GIANCANI_YT_URL', yt);
    localStorage.setItem('GIANCANI_MSG_PRESENTAZIONE', msg);
    $('#vndConfigMsgBox').style.display = 'none';
    renderVenditoriAll();
    showToast('💾 Messaggio presentazione salvato!');
  };
  $('#btnCfgResetPresentazione').onclick = () => {
    $('#cfgYoutubeUrl').value = DEFAULT_YT_PRESENTAZIONE;
    $('#cfgMessaggioWa').value = DEFAULT_TEMPLATE_PRESENTAZIONE_WA;
  };
  $('#btnAddManualVendor').onclick = () => {
    const nuovo = aggiungiVenditoreCustom({
      nome: $('#newVndNome').value,
      telefono: $('#newVndTel').value,
      comune: $('#newVndComune').value,
      tipologia: $('#newVndTipo').value,
      superficie: $('#newVndMq').value,
      prezzo: $('#newVndPrezzo').value,
      descrizione: $('#newVndDesc').value
    });
    state.cacciatoriList.unshift(nuovo);
    showToast('✅ Venditore aggiunto! Trovi ora gli Acquirenti compatibili!');
    ponteImmobileAAcquirenti(nuovo);
  };


}

export { renderVenditoriAll, selezionaVndSubTab, ponteVenditoreAInserzione };
