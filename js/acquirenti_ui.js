import { state, uiHooks, $, $$, showToast, escapeHtml } from './app_core.js';
import { normalizzaMetriQuadriStr, forzaBrandingChiusura } from './generator_engine.js';
import {
  caricaAcquirentiCRM, salvaAcquirentiCRM,
  calcolaIncrociPerAcquirente, trovaAcquirentiCompatibiliPerImmobile,
  costruisciMessaggioPropostaAcquirente
} from './crm_venditori_acquirenti.js';

const goStep = (n) => uiHooks.goStep(n);
const aggiornaGlobalKpiStrip = () => uiHooks.aggiornaGlobalKpiStrip();
const ponteImmobileAMontaVideo = (imm) => uiHooks.ponteImmobileAMontaVideo(imm);

export function ponteImmobileAAcquirenti(imm) {
  state.acqMatchContext = imm;
  renderAcquirentiAll();
  goStep(2);
}

function renderAcquirentiAll() {
  const ctxBanner = $('#acqMatchContextBanner');
  const box = $('#acqListContainer');
  if (!box) return;

  if (state.acqMatchContext) {
    const imm = state.acqMatchContext;
    ctxBanner.style.display = 'block';
    ctxBanner.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
        <div>
          🎯 <strong>Incrocio Attivo per Immobile:</strong> ${escapeHtml(imm.titolo || imm.tipologia || 'Immobile')} (${escapeHtml(imm.comune || imm.zona || '')}) • ${escapeHtml(normalizzaMetriQuadriStr(imm.superficie || imm.metriQuadri))} • ${escapeHtml(imm.prezzo || '')}
        </div>
        <button type="button" class="btn btn-outline btn-sm" id="btnClearAcqContext">✕ Mostra Tutti</button>
      </div>
    `;
    if ($('#btnClearAcqContext')) {
      $('#btnClearAcqContext').onclick = () => { state.acqMatchContext = null; renderAcquirentiAll(); };
    }
  } else {
    ctxBanner.style.display = 'none';
  }

  if (!state.acquirenti.length) {
    box.innerHTML = '<div class="card muted">Nessun acquirente registrato. Clicca "➕ Nuovo Acquirente" sopra! — Immobiliare Giancani</div>';
    return;
  }

  let listToRender = state.acquirenti.map((acq) => {
    const incroci = calcolaIncrociPerAcquirente(acq, {
      cacciatori: state.cacciatoriList,
      sheetImmobili: state.sheetImmobili,
      archivio: state.archivio
    });
    let ctxScore = 0;
    if (state.acqMatchContext) {
      const mCtx = trovaAcquirentiCompatibiliPerImmobile(state.acqMatchContext, [acq]);
      ctxScore = mCtx.length ? mCtx[0].score : 0;
    }
    return { acq, incroci, ctxScore };
  });

  if (state.acqMatchContext) {
    listToRender.sort((a, b) => b.ctxScore - a.ctxScore);
  }

  box.innerHTML = listToRender.map(({ acq, incroci, ctxScore }) => {
    const budgetTxt = Number(acq.budgetMax) > 0 ? `${Number(acq.budgetMax).toLocaleString('it-IT')} €` : 'Qualsiasi';
    const matchesHtml = incroci.slice(0, 4).map((m, mi) => `
      <div class="match-row">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
          <strong style="font-size:12.5px; color:#0f172a;">${escapeHtml(m.badgeFonte)} • ${escapeHtml(m.titolo)}</strong>
          <span class="score-pill">${m.score}% Compatibile</span>
        </div>
        <div style="font-size:11.5px; color:#b45309; font-weight:700; margin-top:3px;">
          📍 ${escapeHtml(m.comune)} • 📐 ${escapeHtml(m.superficie)} • 💰 ${escapeHtml(m.prezzo)}
        </div>
        <div class="muted" style="margin-top:3px;">${escapeHtml((m.testoColonnaF || '').slice(0, 120))}...</div>
        <div class="row-actions" style="margin-top:6px;">
          <button type="button" class="btn btn-emerald btn-sm" style="flex:2;" data-acq-wa="${escapeHtml(acq.id)}" data-match-idx="${mi}">📲 Invia Proposta WhatsApp</button>
          <button type="button" class="btn btn-cyan btn-sm" style="flex:1;" data-acq-vid="${escapeHtml(acq.id)}" data-match-idx="${mi}">🎬 Video</button>
          <button type="button" class="btn btn-outline btn-sm" data-acq-tts="${escapeHtml(acq.id)}" data-match-idx="${mi}">🔊</button>
        </div>
      </div>
    `).join('');

    const ctxWaBtn = (state.acqMatchContext && ctxScore >= 40)
      ? `<button type="button" class="btn btn-emerald" style="margin-top:8px;" data-acq-ctx-wa="${escapeHtml(acq.id)}">📲 INVIA SUBITO QUESTO IMMOBILE A ${escapeHtml(acq.nome.toUpperCase())} (${ctxScore}% Match)</button>`
      : '';

    return `
      <div class="card${ctxScore >= 60 ? ' priority-card' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; flex-wrap:wrap;">
          <div>
            <h3 style="margin:0; color:var(--gold);">👤 ${escapeHtml(acq.nome)} ${ctxScore > 0 ? `<span class="score-pill">${ctxScore}% Match Immobile Attivo</span>` : ''}</h3>
            <div style="font-size:12px; color:var(--cyan); margin-top:3px;">
              📞 ${escapeHtml(acq.telefono || 'N/D')} • ${escapeHtml(acq.urgenza || '')}
            </div>
          </div>
          <div style="display:flex; gap:5px;">
            <button type="button" class="btn btn-outline btn-sm" data-acq-edit="${escapeHtml(acq.id)}">✏️</button>
            <button type="button" class="btn btn-danger btn-sm" data-acq-del="${escapeHtml(acq.id)}">🗑️</button>
          </div>
        </div>
        <div class="crm-meta-row" style="margin-top:8px;">
          <span class="crm-tag">📍 ${escapeHtml(acq.comune || 'Tutti')}</span>
          <span class="crm-tag">🏠 ${escapeHtml(acq.tipologia || 'Tutte')}</span>
          <span class="crm-tag">💰 Max ${escapeHtml(budgetTxt)}</span>
          <span class="crm-tag">📐 Min ${escapeHtml(acq.mqMin || 0)} metri quadri</span>
        </div>
        ${acq.note ? `<div class="muted">📝 ${escapeHtml(acq.note)}</div>` : ''}
        ${ctxWaBtn}
        <div style="margin-top:10px; font-size:11.5px; font-weight:800; color:var(--emerald);">
          ✨ ${incroci.length} Immobili Compatibili (Inserzioni + Cacciatori):
        </div>
        ${matchesHtml || '<div class="muted" style="margin-top:4px;">Nessun immobile compatibile sopra soglia per i filtri attuali.</div>'}
      </div>
    `;
  }).join('');

  // Bind events acquirenti
  listToRender.forEach(({ acq, incroci }) => {
    box.querySelectorAll(`[data-acq-wa="${acq.id}"]`).forEach((b) => {
      b.onclick = () => {
        const m = incroci[Number(b.dataset.matchIdx)];
        if (!m) return;
        const msg = costruisciMessaggioPropostaAcquirente(acq, m);
        let tel = String(acq.telefono || '').replace(/\D/g, '');
        if (!tel || tel.length < 8) tel = prompt('Inserisci WhatsApp Acquirente:', '')?.replace(/\D/g, '') || '';
        if (tel.length >= 8) {
          if (!tel.startsWith('39')) tel = '39' + tel;
          window.open(`https://api.whatsapp.com/send?phone=${tel}&text=${encodeURIComponent(msg)}`, '_blank');
        } else {
          navigator.clipboard.writeText(msg).catch(() => {});
          showToast('📋 Proposta Colonna F copiata negli appunti!');
        }
      };
    });
    box.querySelectorAll(`[data-acq-vid="${acq.id}"]`).forEach((b) => {
      b.onclick = () => {
        const m = incroci[Number(b.dataset.matchIdx)];
        if (m) ponteImmobileAMontaVideo(m);
      };
    });
    box.querySelectorAll(`[data-acq-tts="${acq.id}"]`).forEach((b) => {
      b.onclick = () => {
        const m = incroci[Number(b.dataset.matchIdx)];
        if (m) leggiFraseConTTS(m.testoColonnaF || m.titolo);
      };
    });
    box.querySelectorAll(`[data-acq-ctx-wa="${acq.id}"]`).forEach((b) => {
      b.onclick = () => {
        const msg = costruisciMessaggioPropostaAcquirente(acq, state.acqMatchContext);
        let tel = String(acq.telefono || '').replace(/\D/g, '');
        if (tel.length >= 8) {
          if (!tel.startsWith('39')) tel = '39' + tel;
          window.open(`https://api.whatsapp.com/send?phone=${tel}&text=${encodeURIComponent(msg)}`, '_blank');
        } else {
          navigator.clipboard.writeText(msg).catch(() => {});
          showToast('📋 Proposta Colonna F copiata!');
        }
      };
    });
  });

  box.querySelectorAll('[data-acq-edit]').forEach((b) => {
    b.onclick = () => {
      const a = state.acquirenti.find((x) => x.id === b.dataset.acqEdit);
      if (!a) return;
      $('#acqEditId').value = a.id;
      $('#acqNome').value = a.nome || '';
      $('#acqTel').value = a.telefono || '';
      $('#acqComune').value = a.comune || 'Favara';
      $('#acqTipo').value = a.tipologia || 'Appartamento';
      $('#acqBudget').value = a.budgetMax || 140000;
      $('#acqMqMin').value = a.mqMin || 100;
      $('#acqUrgenza').value = a.urgenza || '⚡ Ricerca attiva';
      $('#acqNote').value = a.note || '';
      $('#acqFormBox').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });
  box.querySelectorAll('[data-acq-del]').forEach((b) => {
    b.onclick = () => {
      if (!confirm('Eliminare questa richiesta acquirente?')) return;
      state.acquirenti = state.acquirenti.filter((x) => x.id !== b.dataset.acqDel);
      salvaAcquirentiCRM(state.acquirenti);
      renderAcquirentiAll();
      aggiornaGlobalKpiStrip();
      showToast('🗑️ Acquirente rimosso.');
    };
  });
}



export function bindAcquirentiEvents() {
  // BIND CATEGORIA 2 (ACQUIRENTI)
  $('#btnToggleAcqForm').onclick = () => {
    $('#acqEditId').value = '';
    const f = $('#acqFormBox');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
  };
  $('#btnAcqCancel').onclick = () => { $('#acqFormBox').style.display = 'none'; };
  $('#btnAcqSave').onclick = () => {
    const nome = $('#acqNome').value.trim();
    if (!nome) { showToast('Inserisci il nome dell\'acquirente!'); return; }
    const editId = $('#acqEditId').value.trim();
    const rec = {
      id: editId || `ACQ-${Date.now()}`,
      nome,
      telefono: $('#acqTel').value.trim(),
      comune: $('#acqComune').value.trim() || 'Favara',
      tipologia: $('#acqTipo').value.trim() || 'Appartamento',
      budgetMax: parseNumeroPulito($('#acqBudget').value) || 0,
      mqMin: parseMqNumerico($('#acqMqMin').value) || 0,
      urgenza: $('#acqUrgenza').value,
      note: $('#acqNote').value.trim()
    };
    if (editId) {
      const idx = state.acquirenti.findIndex((x) => x.id === editId);
      if (idx >= 0) state.acquirenti[idx] = rec;
    } else {
      state.acquirenti.unshift(rec);
    }
    salvaAcquirentiCRM(state.acquirenti);
    $('#acqFormBox').style.display = 'none';
    renderAcquirentiAll();
    aggiornaGlobalKpiStrip();
    showToast('💾 Acquirente salvato con incroci aggiornati!');
  };


}

export { renderAcquirentiAll };
