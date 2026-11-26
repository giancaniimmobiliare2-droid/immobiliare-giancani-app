import { GAS_WEBAPP_URL, state, uiHooks, $, $$, showToast, escapeHtml } from './app_core.js';
import { getSettings } from './storage.js';
import {
  TIPO_IMMOBILE_LIST, STATO_IMMOBILE_LIST, SMART_STANZE_CONFIG, FOTO_PRESETS,
  WATERMARK_POSIZIONI, normalizzaMetriQuadriStr, normalizzaPrezzoStr, forzaBrandingChiusura,
  estraiTipoImmobileDaNomeCartella, deduciStanzaOImmobile, getSottoDettagliStanza,
  generaTestoDescrittivoStanza, analizzaFotoConGeminiVision,
  applicaFiltroEFotoEditorCanvas, preparaFileBase64ConEditorOpts
} from './generator_engine.js';

const goStep = (n) => uiHooks.goStep(n);
const aggiornaGlobalKpiStrip = () => uiHooks.aggiornaGlobalKpiStrip();
const ponteImmobileAMontaVideo = (imm) => uiHooks.ponteImmobileAMontaVideo(imm);
const ponteImmobileAAcquirenti = (imm) => uiHooks.ponteImmobileAAcquirenti(imm);
const popolaSelectLiveImmobili = () => uiHooks.popolaSelectLiveImmobili();
const aggiornaListaMedia = () => uiHooks.aggiornaListaMedia();

function selezionaInsSubTab(sub) {
  $$('#insSubNav .sub-pill').forEach((b) => b.classList.toggle('active', b.dataset.insSub === sub));
  if ($('#insPanelUpload')) $('#insPanelUpload').style.display = sub === 'upload' ? 'block' : 'none';
  if ($('#insPanelGalleria')) $('#insPanelGalleria').style.display = sub === 'galleria' ? 'block' : 'none';
  if ($('#insPanelCartelle')) $('#insPanelCartelle').style.display = sub === 'cartelle' ? 'block' : 'none';
  if ($('#insPanelStorieDrive')) $('#insPanelStorieDrive').style.display = sub === 'storie' ? 'block' : 'none';
  if (sub === 'storie') {
    caricaBasiMusicaliGalleriaDrive();
    popolaStorieDriveGalleriaUI();
  }
}

function initInserzioniGeneratorUI() {
  const tipoOptsHtml = TIPO_IMMOBILE_LIST.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  const statoOptsHtml = STATO_IMMOBILE_LIST.map((s) => `<option value="${escapeHtml(s.val)}">${escapeHtml(s.label)}</option>`).join('');
  if ($('#drvTipo')) $('#drvTipo').innerHTML = tipoOptsHtml;
  if ($('#drvStato')) $('#drvStato').innerHTML = statoOptsHtml;
  if ($('#modSchedaTipo')) $('#modSchedaTipo').innerHTML = tipoOptsHtml;
  if ($('#modSchedaStato')) $('#modSchedaStato').innerHTML = statoOptsHtml;

  const wmOptsHtml = WATERMARK_POSIZIONI.map((w) => `<option value="${escapeHtml(w.val)}">${escapeHtml(w.label)}</option>`).join('');
  if ($('#drvWatermarkPos')) $('#drvWatermarkPos').innerHTML = wmOptsHtml;
  if ($('#selEdWatermarkPos')) $('#selEdWatermarkPos').innerHTML = wmOptsHtml;

  // Render Smart Stanze Bar (20 Top + Catalogo 6 Categorie)
  const bar = $('#drvSmartStanzeBar');
  if (bar) {
    bar.innerHTML = SMART_STANZE_CONFIG.topList.map((s) =>
      `<button type="button" class="smart-chip" data-smart-stanza="${escapeHtml(s.n)}">${s.i} ${escapeHtml(s.n)}</button>`
    ).join('') + `<button type="button" class="smart-chip" id="btnOpenAllStanzeCat" style="border-color:var(--gold-dark); color:var(--gold-dark); font-weight:800;">➕ Tutte (6 Categorie)</button>`;

    bar.querySelectorAll('[data-smart-stanza]').forEach((btn) => {
      btn.onclick = () => {
        const stName = btn.dataset.smartStanza;
        const subBar = $('#drvSmartSubDetailsBar');
        const details = getSottoDettagliStanza(stName);
        subBar.style.display = 'flex';
        subBar.innerHTML = `<span style="font-size:10.5px; color:#047857; font-weight:800;">✨ Particolari ${escapeHtml(stName)}:</span>` +
          details.map((d) => `<button type="button" class="smart-subchip" data-subdet="${escapeHtml(d)}">+ ${escapeHtml(d)}</button>`).join('');
        subBar.querySelectorAll('[data-subdet]').forEach((sb) => {
          sb.onclick = () => {
            const scheda = leggiSchedaDrivePayload();
            $('#drvDescGenerale').value = generaTestoDescrittivoStanza(`${stName} ${sb.dataset.subdet}`, scheda, $('#drvUploadFolderName').value);
            showToast(`✨ Aggiunto particolare: ${stName} ${sb.dataset.subdet}`);
          };
        });
        const scheda = leggiSchedaDrivePayload();
        $('#drvDescGenerale').value = generaTestoDescrittivoStanza(stName, scheda, $('#drvUploadFolderName').value);
        showToast(`🪄 Testo Colonna F generato per: ${stName}`);
      };
    });
    if ($('#btnOpenAllStanzeCat')) {
      $('#btnOpenAllStanzeCat').onclick = () => apriCatalogoStanzeModal((stName) => {
        const scheda = leggiSchedaDrivePayload();
        $('#drvDescGenerale').value = generaTestoDescrittivoStanza(stName, scheda, $('#drvUploadFolderName').value);
      });
    }
  }
  popolaStorieDriveGalleriaUI();
}

function apriCatalogoStanzeModal(onPick) {
  state.smartTargetSetter = onPick;
  const body = $('#smartStanzeCatalogBody');
  const renderCat = (q) => {
    const ql = (q || '').toLowerCase().trim();
    let html = '';
    for (const [cat, list] of Object.entries(SMART_STANZE_CONFIG.categorie)) {
      const m = list.filter((it) => !ql || it.n.toLowerCase().includes(ql) || cat.toLowerCase().includes(ql));
      if (!m.length) continue;
      html += `<div class="sheet-item-card"><div style="font-size:12px; font-weight:800; color:#b45309; margin-bottom:6px;">${escapeHtml(cat)}</div><div class="chips">` +
        m.map((it) => `<button type="button" class="smart-chip" data-pick-st="${escapeHtml(it.n)}">${it.i} ${escapeHtml(it.n)}</button>`).join('') +
        `</div></div>`;
    }
    if (!html) html = `<button type="button" class="btn btn-gold btn-sm" data-pick-st="${escapeHtml(q)}">Usa "${escapeHtml(q)}"</button>`;
    body.innerHTML = html;
    body.querySelectorAll('[data-pick-st]').forEach((b) => {
      b.onclick = () => {
        if (state.smartTargetSetter) state.smartTargetSetter(b.dataset.pickSt);
        $('#modalSmartStanzeCatalog').classList.remove('open');
      };
    });
  };
  $('#inpSmartStanzeSearch').value = '';
  $('#inpSmartStanzeSearch').oninput = (e) => renderCat(e.target.value);
  renderCat('');
  $('#modalSmartStanzeCatalog').classList.add('open');
}

function leggiSchedaDrivePayload() {
  return {
    tipoImmobile: ($('#drvTipo')?.value) || 'Appartamento',
    metriQuadri: normalizzaMetriQuadriStr($('#drvMq')?.value.trim() || '120'),
    prezzo: normalizzaPrezzoStr($('#drvPrezzo')?.value.trim()),
    zona: $('#drvZona')?.value.trim() || 'Favara',
    stato: $('#drvStato')?.value || 'rifinito e ristrutturato a nuovo',
    statoDettaglio: $('#drvStatoDettaglio')?.value.trim() || '',
    noteDaria: normalizzaMetriQuadri($('#drvNoteDaria')?.value.trim() || '')
  };
}

function renderSmartStanzeChipsInlineHtml(idx, prefix = 'que') {
  return `
    <div class="smart-stanze-scroll" style="margin-top:4px;">
      ${SMART_STANZE_CONFIG.topList.slice(0, 10).map((s) =>
        `<button type="button" class="smart-chip" data-${prefix}-quickst="${idx}" data-stname="${escapeHtml(s.n)}">${s.i} ${escapeHtml(s.n)}</button>`
      ).join('')}
      <button type="button" class="smart-chip" data-${prefix}smart="${idx}" style="border-color:#d97706; font-weight:800;">➕ Tutte (6 Cat.)</button>
    </div>
    <div id="${prefix}-subbar-${idx}" class="smart-subdetails-bar" style="display:none;"></div>
  `;
}

function renderUploadQueueList() {
  const box = $('#drvUploadFilesList');
  if (!box) return;
  if (!state.uploadQueueFiles.length) { box.innerHTML = ''; return; }
  const { geminiKey } = getSettings();

  box.innerHTML = state.uploadQueueFiles.map((item, idx) => {
    const isVid = (item.file.type || '').startsWith('video/');
    const is360 = item.tipoMedia === '360';
    const mb = (item.file.size / (1024 * 1024)).toFixed(2);
    if (!item.thumbUrl && !isVid) {
      try { item.thumbUrl = URL.createObjectURL(item.file); } catch {}
    }
    return `
      <div class="sheet-item-card" style="border:1.5px solid #fcd34d; background:#ffffff;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
            ${isVid
              ? `<div class="upload-queue-thumb" style="display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;">🎥</div>`
              : `<img src="${escapeHtml(item.thumbUrl || '')}" class="upload-queue-thumb" alt="">`
            }
            <div style="min-width:0; flex:1;">
              <strong style="font-size:13px; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                #${idx + 1} ${isVid ? '🎥 VIDEO' : (is360 ? '🌐 FOTO 360°' : '🖼️ FOTO')} — ${escapeHtml(item.file.name)}
              </strong>
              <span class="muted">${mb} MB • Watermark: ${escapeHtml(item.editorOpts?.logoPosition || 'centrale_semitrasparente')}</span>
            </div>
          </div>
          <div style="display:flex; gap:5px; flex-wrap:wrap;">
            ${!isVid ? `<button type="button" class="btn btn-outline btn-sm" data-quetoggle360="${idx}">${is360 ? '🌐 360° Attiva' : '🌐 Imposta 360°'}</button>` : ''}
            ${is360 && !isVid ? `<button type="button" class="btn btn-cyan btn-sm" data-quepano="${idx}">🌐 Vista 360°</button>` : ''}
            ${!isVid ? `<button type="button" class="btn btn-cyan btn-sm" data-queedit="${idx}">🎨 Editor/Privacy</button>` : ''}
            <button type="button" class="btn btn-danger btn-sm" data-querm="${idx}">✕</button>
          </div>
        </div>

        <label style="margin-top:8px;">🏠 Nome Stanza / Ambiente (Colonna D) — Riconosciuta o personalizzata coi chip sotto:</label>
        <div style="display:flex; gap:6px;">
          <input type="text" data-questanza="${idx}" value="${escapeHtml(item.stanza)}" style="flex:1; font-weight:700;" placeholder="Es. Bagno, Cucina, Salotto, Terrazzo...">
          <button type="button" class="btn btn-gold btn-sm" style="width:auto;" data-quetpl="${idx}" title="Rigenera Descrizione Emozionale Colonna F per questa stanza">💾 Genera Colonna F</button>
        </div>
        ${renderSmartStanzeChipsInlineHtml(idx, 'que')}

        ${isVid ? `
          <label style="margin-top:6px;">🎥 Didascalia / Nota Regia Video (come Generator.html):</label>
          <input type="text" data-quenotevid="${idx}" value="${escapeHtml(item.noteVideo || 'Panoramica interni ed esterni con ripresa fluida')}" placeholder="Es. Vista cucina drone, balcone e vista panoramica">
        ` : ''}

        <label style="margin-top:6px;">🎙️ Descrizione Parlata DarIA (Colonna F — "metri quadri" + "— Immobiliare Giancani"):</label>
        <textarea style="min-height:70px;" data-quecolf="${idx}">${escapeHtml(item.colonnaF)}</textarea>

        <div class="row-actions" style="margin-top:6px;">
          ${!isVid ? `<button type="button" class="btn btn-cyan btn-sm" style="flex:1;" data-quevis="${idx}">🤖 Analizza con Gemini Vision AI</button>` : ''}
          <button type="button" class="btn btn-outline btn-sm" style="flex:1;" data-quetpl2="${idx}">🪄 11 Template Emozionali</button>
          <button type="button" class="btn btn-outline btn-sm" data-quetts="${idx}">🔊 Ascolta Voce</button>
        </div>
      </div>
    `;
  }).join('');

  const bindSubDetailsForQueue = (idx, stName) => {
    const subBar = $(`#que-subbar-${idx}`);
    if (!subBar) return;
    const details = getSottoDettagliStanza(stName);
    subBar.style.display = 'flex';
    subBar.innerHTML = `<span style="font-size:10px; color:#047857; font-weight:800;">✨ Particolari:</span>` +
      details.map((d) => `<button type="button" class="smart-subchip" data-quesubdet="${escapeHtml(d)}">+ ${escapeHtml(d)}</button>`).join('');
    subBar.querySelectorAll('[data-quesubdet]').forEach((sb) => {
      sb.onclick = () => {
        const it = state.uploadQueueFiles[idx];
        const combined = `${stName} ${sb.dataset.quesubdet}`.trim();
        it.stanza = combined;
        it.colonnaF = generaTestoDescrittivoStanza(combined, leggiSchedaDrivePayload(), $('#drvUploadFolderName').value);
        const inp = box.querySelector(`[data-questanza="${idx}"]`);
        const ta = box.querySelector(`[data-quecolf="${idx}"]`);
        if (inp) inp.value = it.stanza;
        if (ta) ta.value = it.colonnaF;
        showToast(`✨ Stanza aggiornata: ${combined}`);
      };
    });
  };

  box.querySelectorAll('[data-querm]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.querm);
      const rem = state.uploadQueueFiles[idx];
      if (rem?.thumbUrl) URL.revokeObjectURL(rem.thumbUrl);
      state.uploadQueueFiles.splice(idx, 1);
      renderUploadQueueList();
    };
  });
  box.querySelectorAll('[data-questanza]').forEach((inp) => {
    inp.oninput = () => { state.uploadQueueFiles[Number(inp.dataset.questanza)].stanza = inp.value; };
    inp.onfocus = () => bindSubDetailsForQueue(Number(inp.dataset.questanza), inp.value);
  });
  box.querySelectorAll('[data-quecolf]').forEach((ta) => {
    ta.oninput = () => { state.uploadQueueFiles[Number(ta.dataset.quecolf)].colonnaF = ta.value; };
  });
  box.querySelectorAll('[data-quenotevid]').forEach((inp) => {
    inp.oninput = () => { state.uploadQueueFiles[Number(inp.dataset.quenotevid)].noteVideo = inp.value; };
  });
  box.querySelectorAll('[data-que-quickst]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.queQuickst);
      const stName = b.dataset.stname;
      const it = state.uploadQueueFiles[idx];
      it.stanza = stName;
      it.colonnaF = generaTestoDescrittivoStanza(stName, leggiSchedaDrivePayload(), $('#drvUploadFolderName').value);
      const inp = box.querySelector(`[data-questanza="${idx}"]`);
      const ta = box.querySelector(`[data-quecolf="${idx}"]`);
      if (inp) inp.value = stName;
      if (ta) ta.value = it.colonnaF;
      bindSubDetailsForQueue(idx, stName);
      showToast(`🏠 Stanza "${stName}" e descrizione Colonna F impostate!`);
    };
  });
  box.querySelectorAll('[data-quesmart]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.quesmart);
      apriCatalogoStanzeModal((stName) => {
        state.uploadQueueFiles[idx].stanza = stName;
        state.uploadQueueFiles[idx].colonnaF = generaTestoDescrittivoStanza(stName, leggiSchedaDrivePayload(), $('#drvUploadFolderName').value);
        renderUploadQueueList();
        bindSubDetailsForQueue(idx, stName);
      });
    };
  });
  box.querySelectorAll('[data-quetpl], [data-quetpl2]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.quetpl ?? b.dataset.quetpl2);
      const it = state.uploadQueueFiles[idx];
      it.colonnaF = generaTestoDescrittivoStanza(it.stanza, leggiSchedaDrivePayload(), $('#drvUploadFolderName').value);
      const ta = box.querySelector(`[data-quecolf="${idx}"]`);
      if (ta) ta.value = it.colonnaF;
      showToast('🪄 Descrizione emozionale Colonna F generata!');
    };
  });
  box.querySelectorAll('[data-quevis]').forEach((b) => {
    b.onclick = async () => {
      const idx = Number(b.dataset.quevis);
      const it = state.uploadQueueFiles[idx];
      b.disabled = true; b.textContent = '⏳ Vision AI...';
      const res = await analizzaFotoConGeminiVision(it.file, it.stanza, leggiSchedaDrivePayload(), geminiKey);
      it.colonnaF = res.testo;
      b.disabled = false; b.textContent = '🤖 Analizza con Gemini Vision AI';
      renderUploadQueueList();
      showToast(res.motivo);
    };
  });
  box.querySelectorAll('[data-quetts]').forEach((b) => {
    b.onclick = () => {
      const it = state.uploadQueueFiles[Number(b.dataset.quetts)];
      leggiFraseConTTS(it.colonnaF || it.stanza);
    };
  });
  box.querySelectorAll('[data-queedit]').forEach((b) => {
    b.onclick = () => apriModalPhotoEditor(Number(b.dataset.queedit), -1);
  });
  box.querySelectorAll('[data-quetoggle360]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.quetoggle360);
      const it = state.uploadQueueFiles[idx];
      const next360 = it.tipoMedia !== '360';
      it.tipoMedia = next360 ? '360' : 'foto';
      if (!it.editorOpts) it.editorOpts = {};
      it.editorOpts.logoPosition = next360 ? '360_nadir' : ($('#drvWatermarkPos')?.value || 'centrale_semitrasparente');
      renderUploadQueueList();
      showToast(next360 ? '🌐 Impostata come Foto 360° Sferica (con Cerchio Nadir sul fondo)!' : '🖼️ Impostata come Foto Standard.');
    };
  });
  box.querySelectorAll('[data-quepano]').forEach((b) => {
    b.onclick = () => {
      const it = state.uploadQueueFiles[Number(b.dataset.quepano)];
      if (it?.thumbUrl) apriVistaSferica360Modal(it.thumbUrl, it.stanza);
    };
  });
}

function apriModalPhotoEditor(queueIdx = -1, sheetIdx = -1) {
  state.editorQueueIdx = queueIdx;
  state.editorSheetIdx = sheetIdx;
  const item = queueIdx >= 0 ? state.uploadQueueFiles[queueIdx] : state.activeSheetItems[sheetIdx];
  if (!item) return;

  const is360 = (item.tipoMedia === '360' || item.tipo === '360' || (item.file?.name || '').toLowerCase().includes('360'));
  const defPos = item.editorOpts?.logoPosition || $('#drvWatermarkPos')?.value || (is360 ? '360_nadir' : 'centrale_semitrasparente');
  state.editorOpts = {
    brightness: 100, contrast: 100, saturation: 100,
    maskEnabled: false, maskX: 50, maskY: 50, maskSize: 80, maskOpacity: 95,
    logoPosition: defPos,
    ...(item.editorOpts || {})
  };

  $('#rngEdBright').value = state.editorOpts.brightness;
  $('#rngEdContrast').value = state.editorOpts.contrast;
  $('#rngEdSat').value = state.editorOpts.saturation;
  $('#selEdWatermarkPos').value = state.editorOpts.logoPosition;
  $('#chkEdPrivacyMask').checked = Boolean(state.editorOpts.maskEnabled);
  $('#edPrivacyControls').style.display = state.editorOpts.maskEnabled ? 'grid' : 'none';
  $('#rngEdMaskX').value = state.editorOpts.maskX;
  $('#rngEdMaskY').value = state.editorOpts.maskY;
  $('#rngEdMaskSize').value = state.editorOpts.maskSize;
  $('#rngEdMaskOp').value = state.editorOpts.maskOpacity;

  const pRow = $('#editorPresetsRow');
  pRow.innerHTML = FOTO_PRESETS.map((p) =>
    `<button type="button" class="chip" data-preset="${p.id}">${escapeHtml(p.label)}</button>`
  ).join('');
  pRow.querySelectorAll('[data-preset]').forEach((pb) => {
    pb.onclick = () => {
      const found = FOTO_PRESETS.find((x) => x.id === pb.dataset.preset);
      if (!found) return;
      state.editorOpts.brightness = found.b;
      state.editorOpts.contrast = found.c;
      state.editorOpts.saturation = found.s;
      $('#rngEdBright').value = found.b;
      $('#rngEdContrast').value = found.c;
      $('#rngEdSat').value = found.s;
      aggiornaPreviewPhotoEditor();
    };
  });

  if (item.file instanceof Blob) {
    const url = URL.createObjectURL(item.file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      state.editorImgObj = img;
      $('#modalPhotoEditor').classList.add('open');
      aggiornaPreviewPhotoEditor();
    };
    img.src = url;
  } else if (item.url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      state.editorImgObj = img;
      $('#modalPhotoEditor').classList.add('open');
      aggiornaPreviewPhotoEditor();
    };
    img.onerror = () => {
      showToast('ℹ️ Immagine Drive aperta in modalità configurazione Watermark/Preset.');
      state.editorImgObj = null;
      $('#modalPhotoEditor').classList.add('open');
    };
    img.src = item.url;
  }
}

function aggiornaPreviewPhotoEditor() {
  state.editorOpts.brightness = Number($('#rngEdBright').value || 100);
  state.editorOpts.contrast = Number($('#rngEdContrast').value || 100);
  state.editorOpts.saturation = Number($('#rngEdSat').value || 100);
  state.editorOpts.logoPosition = $('#selEdWatermarkPos').value || 'centrale_semitrasparente';
  state.editorOpts.maskEnabled = $('#chkEdPrivacyMask').checked;
  state.editorOpts.maskX = Number($('#rngEdMaskX').value || 50);
  state.editorOpts.maskY = Number($('#rngEdMaskY').value || 50);
  state.editorOpts.maskSize = Number($('#rngEdMaskSize').value || 80);
  state.editorOpts.maskOpacity = Number($('#rngEdMaskOp').value || 95);

  $('#valEdBright').textContent = `${state.editorOpts.brightness}%`;
  $('#valEdContrast').textContent = `${state.editorOpts.contrast}%`;
  $('#valEdSat').textContent = `${state.editorOpts.saturation}%`;
  $('#valEdMaskX').textContent = `${state.editorOpts.maskX}%`;
  $('#valEdMaskY').textContent = `${state.editorOpts.maskY}%`;
  $('#valEdMaskSize').textContent = `${state.editorOpts.maskSize}px`;
  $('#valEdMaskOp').textContent = `${state.editorOpts.maskOpacity}%`;
  $('#edPrivacyControls').style.display = state.editorOpts.maskEnabled ? 'grid' : 'none';

  const cvs = $('#editorFotoCanvas');
  if (cvs && state.editorImgObj) {
    applicaFiltroEFotoEditorCanvas(cvs, state.editorImgObj, state.logoImgObj, {
      ...state.editorOpts,
      applyWatermark: true,
      showMaskGuide: true,
      maxDim: 1000
    });
  }
}

// 🌐 VISTA SFERICA 360° INTERATTIVA (CANVAS 360° PANORAMA)
function apriVistaSferica360Modal(imgUrl, title = 'Ambiente 360°') {
  if (!imgUrl) return;
  if ($('#lblPano360Title')) $('#lblPano360Title').textContent = title || 'Ambiente 360°';
  $('#modalPanorama360').classList.add('open');
  const cvs = $('#pano360Canvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#fffbeb';
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⏳ Caricamento Panorama Sferico 360°...', cvs.width / 2, cvs.height / 2);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    state.pano360Img = img;
    state.pano360Yaw = 0;
    state.pano360Pitch = 0;
    state.pano360AutoSpin = true;
    avviaLoopPanorama360();
  };
  img.onerror = () => {
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.fillStyle = '#0369a1';
    ctx.fillText('🌐 Foto 360° Registrata su Google Drive', cvs.width / 2, cvs.height / 2);
  };
  img.src = imgUrl;
}

function disegnaFramePanorama360() {
  const cvs = $('#pano360Canvas');
  const img = state.pano360Img;
  if (!cvs || !img) return;
  const ctx = cvs.getContext('2d');
  const w = cvs.width;
  const h = cvs.height;
  const iw = img.naturalWidth || img.width || 1200;
  const ih = img.naturalHeight || img.height || 600;

  const fovW = Math.min(iw, Math.round(iw * 0.48));
  const fovH = Math.min(ih, Math.round(ih * 0.62));
  let sx = ((state.pano360Yaw % 360) + 360) % 360 / 360 * iw;
  const sy = Math.max(0, Math.min(ih - fovH, (ih - fovH) / 2 + (state.pano360Pitch / 90) * ((ih - fovH) / 2)));

  ctx.clearRect(0, 0, w, h);
  if (sx + fovW <= iw) {
    ctx.drawImage(img, sx, sy, fovW, fovH, 0, 0, w, h);
  } else {
    const firstW = iw - sx;
    const secondW = fovW - firstW;
    const destFirstW = Math.round((firstW / fovW) * w);
    ctx.drawImage(img, sx, sy, firstW, fovH, 0, 0, destFirstW, h);
    ctx.drawImage(img, 0, sy, secondW, fovH, destFirstW, 0, w - destFirstW, h);
  }
  // Bussola 360° in sovrimpressione
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.fillRect(12, 12, 165, 28);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🌐 360° • Angolo: ${Math.round(((state.pano360Yaw % 360) + 360) % 360)}°`, 20, 30);
}

function avviaLoopPanorama360() {
  cancelAnimationFrame(state.pano360Raf);
  const step = () => {
    if (!$('#modalPanorama360')?.classList.contains('open')) return;
    if (state.pano360AutoSpin) state.pano360Yaw = (state.pano360Yaw + 0.35) % 360;
    disegnaFramePanorama360();
    state.pano360Raf = requestAnimationFrame(step);
  };
  state.pano360Raf = requestAnimationFrame(step);
}

async function gasPostJson(payload) {
  const res = await fetch(GAS_WEBAPP_URL, {
    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function creaSoloFoglioECartella() {
  const folderName = $('#drvUploadFolderName').value.trim();
  if (!folderName) { showToast('Inserisci nome cartella / nuovo Foglio Sheet!'); return; }
  const resBox = $('#drvUploadResultBox');
  resBox.innerHTML = '<div class="info-banner">⏳ Creazione cartella Drive e Foglio Sheet...</div>';
  try {
    const datiScheda = leggiSchedaDrivePayload();
    const descColF = $('#drvDescGenerale').value.trim() ? forzaBrandingChiusura($('#drvDescGenerale').value) : generaTestoDescrittivoStanza(datiScheda.tipoImmobile, datiScheda, folderName);
    const out = await gasPostJson({ action: 'crea_foglio_sheet', nomeCartella: folderName, datiScheda, descrizioneColonnaF: descColF });
    if (out.success) {
      resBox.innerHTML = `<div class="info-banner gold-banner">✅ <strong>Creato!</strong> Foglio: <strong>${escapeHtml(out.tabName)}</strong><br>— Immobiliare Giancani</div>`;
      caricaCartelleDrive();
      caricaElencoFogliSheet();
    } else {
      resBox.innerHTML = `<div class="info-banner" style="border-color:#fb7185;">⚠️ ${escapeHtml(out.error || 'Errore')}</div>`;
    }
  } catch (err) {
    resBox.innerHTML = `<div class="info-banner" style="border-color:#fb7185;">❌ Errore: ${escapeHtml(err.message)}</div>`;
  }
}

async function avviaUploadSuDriveESheet() {
  const folderName = $('#drvUploadFolderName').value.trim();
  if (!folderName) { showToast('Inserisci il nome della proprietà o cartella (es. Casa Poggio)!'); return; }
  if (!state.uploadQueueFiles.length) { showToast('Seleziona almeno una foto o video dallo smartphone!'); return; }

  const progWrap = $('#drvUploadProgress');
  const pBar = $('#drvUploadBar');
  const pPct = $('#drvUploadPct');
  const pLbl = $('#drvUploadStatus');
  const reportBox = $('#drvUploadFilesReportBox');
  const resBox = $('#drvUploadResultBox');
  const btn = $('#btnDrvUploadAll');

  progWrap.style.display = 'block';
  pBar.style.width = '2%';
  if (pPct) pPct.textContent = '0%';
  btn.disabled = true;
  resBox.innerHTML = '';

  const total = state.uploadQueueFiles.length;
  if (reportBox) {
    reportBox.innerHTML = state.uploadQueueFiles.map((it, idx) => {
      const mb = (it.file.size / (1024 * 1024)).toFixed(2);
      const isVid = (it.file.type || '').startsWith('video/');
      const icon = isVid ? '🎥' : (it.tipoMedia === '360' ? '🌐' : '🖼️');
      return `<div class="upload-report-row" id="up-rep-row-${idx}">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:62%;font-weight:700;">${icon} ${escapeHtml(it.file.name)} <small class="muted">(${mb} MB)</small></span>
        <span id="up-rep-status-${idx}" style="color:#d97706;font-weight:800;">⏳ In attesa...</span>
      </div>`;
    }).join('');
  }

  const datiScheda = leggiSchedaDrivePayload();
  const applyWm = $('#drvChkWatermark').checked;
  const defLogoPos = $('#drvWatermarkPos')?.value || 'centrale_semitrasparente';
  const successes = [];
  const fails = [];

  for (let i = 0; i < total; i++) {
    const item = state.uploadQueueFiles[i];
    const pct = Math.round((i / total) * 100);
    pBar.style.width = `${Math.max(6, pct)}%`;
    if (pPct) pPct.textContent = `${pct}%`;
    pLbl.textContent = `Elaborazione ${i + 1} di ${total}: ${item.file.name}...`;
    const stEl = $(`#up-rep-status-${i}`);
    if (stEl) stEl.innerHTML = '🎨 Watermark & Ridimensionamento...';

    try {
      const edOpts = {
        brightness: 100, contrast: 100, saturation: 100, maskEnabled: false,
        logoPosition: item.tipoMedia === '360' ? '360_nadir' : defLogoPos,
        applyWatermark: applyWm,
        ...(item.editorOpts || {})
      };
      const b64 = await preparaFileBase64ConEditorOpts(item.file, edOpts, state.logoImgObj);
      const isVid = (item.file.type || '').startsWith('video/');
      const colF = item.colonnaF?.trim() ? forzaBrandingChiusura(item.colonnaF) : generaTestoDescrittivoStanza(item.stanza, datiScheda, folderName);
      if (stEl) stEl.innerHTML = '🚀 Invio a Google Drive...';

      const out = await gasPostJson({
        action: 'carica_singolo_file',
        nomeCartella: folderName,
        datiScheda,
        file: {
          fileName: item.file.name,
          mimeType: isVid ? (item.file.type || 'video/mp4') : 'image/jpeg',
          base64Data: b64,
          noteVideo: item.noteVideo || '',
          tipoMedia: isVid ? 'video' : (item.tipoMedia || ((item.file.name || '').toLowerCase().includes('360') ? '360' : 'foto')),
          stanzaCustom: item.stanza,
          descrizioneColonnaF: colF
        }
      });
      if (out && out.success) {
        successes.push(out);
        if (stEl) stEl.innerHTML = `<span style="color:#059669;">✅ Caricato (${escapeHtml(out.stanza || item.stanza)})</span>`;
      } else {
        const errMsg = out?.error || 'Errore Apps Script';
        fails.push({ name: item.file.name, err: errMsg });
        if (stEl) stEl.innerHTML = `<span style="color:#dc2626;">❌ ${escapeHtml(errMsg)}</span>`;
      }
    } catch (err) {
      fails.push({ name: item.file.name, err: err.message });
      if (stEl) stEl.innerHTML = `<span style="color:#dc2626;">❌ ${escapeHtml(err.message)}</span>`;
    }
  }

  pBar.style.width = '100%';
  if (pPct) pPct.textContent = '100%';
  pLbl.textContent = `✅ Elaborazione completata (${successes.length}/${total} caricati su Drive)!`;
  btn.disabled = false;

  const last = successes[successes.length - 1] || {};
  const cleanTabTarget = last.tabName || folderName.replace(/[\[\]\*?:/\\']/g, '').replace(/\s+/g, '_').trim();
  resBox.innerHTML = `<div class="info-banner ${fails.length ? '' : 'gold-banner'}">
    🎉 <strong>NUOVO IMMOBILE &amp; CARTELLA CREATI SU GOOGLE DRIVE CON SUCCESSO!</strong><br>
    Caricati <strong>${successes.length}/${total}</strong> file sul Foglio <strong>${escapeHtml(cleanTabTarget)}</strong> con testi descrittivi da Colonna F per DarIA!
    <div style="display:flex; gap:12px; flex-wrap:wrap; margin:8px 0;">
      ${last.cartellaImmobileUrl ? `<a href="${last.cartellaImmobileUrl}" target="_blank" style="color:#0284c7; font-weight:800;">📂 Apri Cartella Immobile Drive ↗</a>` : ''}
      ${last.sheetUrl ? `<a href="${last.sheetUrl}" target="_blank" style="color:#b45309; font-weight:800;">📊 Apri Foglio Google Sheet ↗</a>` : ''}
    </div>
    <div class="row-actions" style="margin-top:8px;">
      <button type="button" class="btn btn-emerald btn-sm" id="btnPostUpOpenGal" style="flex:1;">🖼️ Apri in Galleria Foto</button>
      <button type="button" class="btn btn-cyan btn-sm" id="btnPostUpOpenReel" style="flex:1;">🎬 Genera Subito Video Reel 9:16</button>
      <button type="button" class="btn btn-gold btn-sm" id="btnPostUpOpenSuno" style="width:auto; flex:1;">🎵 Crea Canzone 3+ Min</button>
    </div>
    <div style="margin-top:6px; font-weight:800;">— Immobiliare Giancani</div>
  </div>`;

  if ($('#btnPostUpOpenGal')) {
    $('#btnPostUpOpenGal').onclick = () => {
      selezionaInsSubTab('galleria');
      caricaMediaFoglioSheet(cleanTabTarget);
    };
  }
  if ($('#btnPostUpOpenReel')) {
    $('#btnPostUpOpenReel').onclick = () => apriModalGeneraReelGalleria(cleanTabTarget);
  }
  if ($('#btnPostUpOpenSuno')) {
    $('#btnPostUpOpenSuno').onclick = () => $('#btnOpenSunoModal')?.click();
  }

  caricaCartelleDrive();
  caricaElencoFogliSheet();
}

async function caricaCartelleDrive() {
  const grid = $('#drvFoldersGrid');
  const cnt = $('#drvFoldersCount');
  const selUp = $('#drvUploadSelectExisting');
  const selPick = $('#drvSelectFolderPicker');
  if (cnt) cnt.textContent = '⏳ Scansione cartelle Google Drive...';
  try {
    const res = await fetch(`${GAS_WEBAPP_URL}?action=get_drive_folders`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.folders || []);
    state.driveFolders = list;
    if (cnt) cnt.textContent = `📂 ${list.length} cartelle Google Drive trovate`;
    if (selUp) {
      selUp.innerHTML = '<option value="">✨ Crea nuova cartella &amp; nuovo Foglio Sheet (scrivi il nome sotto)...</option>' +
        list.map((f) => `<option value="${escapeHtml(f.cleanName || f.name)}">📂 ${escapeHtml(f.cleanName || f.name)}</option>`).join('');
    }
    if (selPick) {
      selPick.innerHTML = '<option value="">📱 Scegli una Cartella Google Drive (1-Tap)...</option>' +
        list.map((f) => {
          const cCount = (typeof f.fileCount === 'number' && f.fileCount > 0) ? ` (${f.fileCount} file)` : '';
          return `<option value="${escapeHtml(f.id || f.name)}">📂 ${escapeHtml(f.cleanName || f.name)}${cCount}</option>`;
        }).join('');
    }
    renderGrigliaCartelleDrive($('#drvSearchFolder')?.value || '');
  } catch (err) {
    if (cnt) cnt.textContent = `⚠️ Drive offline o non connesso (${err.message})`;
    if (grid) grid.innerHTML = '';
  }
}

function renderGrigliaCartelleDrive(query) {
  const grid = $('#drvFoldersGrid');
  if (!grid) return;
  const q = (query || '').trim().toLowerCase();
  const list = state.driveFolders.filter((f) => !q || `${f.name} ${f.cleanName} ${f.id}`.toLowerCase().includes(q));
  if (!list.length) { grid.innerHTML = '<div class="muted" style="padding:8px;">Nessuna cartella trovata.</div>'; return; }
  grid.innerHTML = list.slice(0, 60).map((f) => {
    const isSel = state.selectedFolder && state.selectedFolder.id === f.id;
    const fCount = typeof f.fileCount === 'number' && f.fileCount > 0 ? `🖼️ ${f.fileCount} file` : '📁 Google Drive';
    return `<div class="drive-card${isSel ? ' selected' : ''}" data-fid="${escapeHtml(f.id)}">
      <div class="drive-card-title">${escapeHtml(f.cleanName || f.name)}</div>
      <div class="drive-card-sub" style="display:flex;justify-content:space-between;align-items:center;">
        <span>${fCount}</span>
        <strong>${isSel ? '✅ Selezionata' : '👁️ Anteprima'}</strong>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.drive-card').forEach((card) => {
    card.onclick = () => {
      const fObj = state.driveFolders.find((x) => x.id === card.dataset.fid);
      if (fObj) selezionaCartellaDrive(fObj);
    };
  });
}

async function selezionaCartellaDrive(folder) {
  state.selectedFolder = folder;
  if ($('#drvSelectFolderPicker')) $('#drvSelectFolderPicker').value = folder.id || folder.name;
  if ($('#drvSyncManualFolderInput')) $('#drvSyncManualFolderInput').value = folder.id || folder.cleanName || folder.name;
  renderGrigliaCartelleDrive($('#drvSearchFolder')?.value || '');
  $('#drvFolderDetailBox').style.display = 'block';
  $('#drvSelectedFolderTitle').textContent = `📂 ${folder.cleanName || folder.name}`;
  $('#drvSelectedFolderLink').href = folder.url || `https://drive.google.com/drive/folders/${folder.id}`;
  $('#drvFolderPreviewGrid').innerHTML = '<span class="muted">⏳ Caricamento anteprima foto/video dalla cartella...</span>';
  try {
    const res = await fetch(`${GAS_WEBAPP_URL}?action=get_drive_folder_preview&id=${encodeURIComponent(folder.id)}`);
    const data = await res.json();
    const files = Array.isArray(data) ? data : (data.files || []);
    state.selectedFolderFiles = files;
    $('#drvSelectedFolderTitle').textContent = `📂 ${folder.cleanName || folder.name} (${files.length} file)`;
    $('#drvFolderPreviewGrid').innerHTML = files.length
      ? files.map((f) => {
          const url = f.url || (f.id ? `https://lh3.googleusercontent.com/d/${f.id}` : '');
          const isVid = f.tipo === 'video' || (f.mime && f.mime.includes('video'));
          const is360 = f.tipo === '360' || (f.name || '').toLowerCase().includes('360');
          return isVid
            ? `<div class="drive-thumb" style="display:flex;align-items:center;justify-content:center;font-size:24px;">🎥</div>`
            : `<div class="drive-thumb"><img src="${escapeHtml(url)}" alt="">${is360 ? '<span style="position:absolute;bottom:2px;right:2px;font-size:9px;background:#0284c7;color:#fff;padding:1px 4px;border-radius:4px;">360°</span>' : ''}</div>`;
        }).join('')
      : '<span class="muted">Cartella vuota.</span>';
  } catch (err) {
    $('#drvFolderPreviewGrid').innerHTML = `<span class="muted">Errore: ${escapeHtml(err.message)}</span>`;
  }
}

async function caricaElencoFogliSheet() {
  const sel = $('#drvSheetSelect');
  try {
    const res = await fetch(`${GAS_WEBAPP_URL}?action=get_elenco_immobili`);
    const data = await res.json();
    state.sheetImmobili = data.immobili || [];
    if (data.sheetUrl && $('#btnOpenMasterSheet')) $('#btnOpenMasterSheet').href = data.sheetUrl;
    const opts = '<option value="">-- Seleziona Foglio Immobile --</option>' +
      state.sheetImmobili.map((im) => `<option value="${escapeHtml(im.tabName || im.name)}">📄 ${escapeHtml(im.nome || im.label || im.tabName)}</option>`).join('');
    if (sel) sel.innerHTML = opts;
    if ($('#selLiveImmobile')) $('#selLiveImmobile').innerHTML = opts;
    aggiornaGlobalKpiStrip();
  } catch {
    if (sel) sel.innerHTML = '<option value="">⚠️ Errore caricamento fogli</option>';
  }
}

async function caricaMediaFoglioSheet(tabName) {
  state.activeSheetTab = tabName;
  state.galSelectedIndices.clear();
  if ($('#drvSheetSelect') && $('#drvSheetSelect').value !== tabName) $('#drvSheetSelect').value = tabName;
  const listBox = $('#drvSheetItemsList');
  const bar = $('#drvSheetActionsBar');
  const bottomBox = $('#galBottomSaveBox');
  listBox.innerHTML = '<div class="muted" style="padding:18px;text-align:center;">⏳ Caricamento media, stanze e testi Colonna F...</div>';
  if (bar) bar.style.display = 'none';
  if (bottomBox) bottomBox.style.display = 'none';
  try {
    const res = await fetch(`${GAS_WEBAPP_URL}?action=get_immobile_media&tab=${encodeURIComponent(tabName)}`);
    const data = await res.json();
    const items = (data.items || []).map((it, i) => ({
      ...it,
      rowIndex: it.rowIndex || (i + 2),
      tipo: (it.tipo || 'foto').toLowerCase(),
      stanza: (!it.stanza || it.stanza.toLowerCase().startsWith('ambiente'))
        ? estraiTipoImmobileDaNomeCartella(tabName)
        : it.stanza,
      logoPos: it.tipo === '360' ? '360_nadir' : 'centrale_semitrasparente'
    }));
    state.activeSheetScheda = data.scheda || {
      tipoImmobile: estraiTipoImmobileDaNomeCartella(tabName),
      zona: tabName.replace(/_/g, ' '),
      metriQuadri: '120 metri quadri',
      prezzo: 'Trattativa Riservata',
      stato: 'rifinito e ristrutturato a nuovo',
      statoDettaglio: '',
      noteDaria: ''
    };
    state.activeSheetItems = items;
    aggiornaContatoriFiltriGalleria();
    if (!items.length) {
      listBox.innerHTML = '<div class="muted" style="padding:18px;text-align:center;">📭 Nessun media trovato in questo foglio.</div>';
      return;
    }
    if (bar) bar.style.display = 'flex';
    if (bottomBox) bottomBox.style.display = 'block';
    renderGalleriaSheetCards();
  } catch (err) {
    listBox.innerHTML = `<div class="muted">Errore caricamento galleria: ${escapeHtml(err.message)}</div>`;
  }
}

function aggiornaContatoriFiltriGalleria() {
  const all = state.activeSheetItems || [];
  if ($('#galCntTutti')) $('#galCntTutti').textContent = String(all.length);
  if ($('#galCntFoto')) $('#galCntFoto').textContent = String(all.filter((x) => x.tipo === 'foto').length);
  if ($('#galCntVideo')) $('#galCntVideo').textContent = String(all.filter((x) => x.tipo === 'video').length);
  if ($('#galCnt360')) $('#galCnt360').textContent = String(all.filter((x) => x.tipo === '360').length);
  if ($('#galSelCountLabel')) {
    const n = state.galSelectedIndices.size;
    $('#galSelCountLabel').textContent = `${n} selezionat${n === 1 ? 'o' : 'i'}`;
  }
}

function renderGalleriaSheetCards() {
  const listBox = $('#drvSheetItemsList');
  if (!listBox) return;
  const filtro = state.galFilterType || 'tutti';
  const schedaSheet = state.activeSheetScheda || { tipoImmobile: estraiTipoImmobileDaNomeCartella(state.activeSheetTab), zona: state.activeSheetTab.replace(/_/g, ' '), metriQuadri: '120 metri quadri' };
  const { geminiKey } = getSettings();

  const visible = state.activeSheetItems
    .map((it, idx) => ({ it, idx }))
    .filter(({ it }) => filtro === 'tutti' || it.tipo === filtro);

  aggiornaContatoriFiltriGalleria();

  if (!visible.length) {
    listBox.innerHTML = `<div class="muted" style="padding:16px;text-align:center;">Nessun elemento per il filtro "${escapeHtml(filtro.toUpperCase())}".</div>`;
    return;
  }

  const wmOptsHtml = WATERMARK_POSIZIONI.map((w) => `<option value="${escapeHtml(w.val)}">${escapeHtml(w.label)}</option>`).join('');

  listBox.innerHTML = visible.map(({ it, idx }) => {
    const isSel = state.galSelectedIndices.has(idx);
    const isVid = it.tipo === 'video';
    const is360 = it.tipo === '360';
    const badgeCls = isVid ? 'video' : (is360 ? 's360' : 'foto');
    const badgeIcon = isVid ? '🎥 VIDEO' : (is360 ? '🌐 360°' : '📷 FOTO');
    const rowKey = `${state.activeSheetTab}_${it.rowIndex}`;
    const isEscluso = Boolean(state.galExcludedMap[rowKey]);

    return `
      <div class="gallery-card-gen${isSel ? ' selected' : ''}" id="gal-card-${idx}">
        <div class="gal-card-media-box">
          <input type="checkbox" class="gal-select-chk" data-galchk="${idx}" ${isSel ? 'checked' : ''}>
          <span class="gal-type-badge ${badgeCls}">${badgeIcon} • Riga ${it.rowIndex}</span>
          ${isVid
            ? `<video src="${escapeHtml(it.url)}" controls preload="metadata"></video>`
            : `<img src="${escapeHtml(it.url)}" alt="${escapeHtml(it.stanza)}">`
          }
        </div>
        <div class="gal-card-body">
          <div style="display:flex; gap:5px;">
            <input type="text" data-shstanza="${idx}" value="${escapeHtml(it.stanza)}" style="flex:1; font-weight:800;" placeholder="Nome Stanza (es. Bagno, Cucina...)">
            <button type="button" class="btn btn-gold btn-sm" style="width:auto;" data-shsavestanza="${idx}" title="Salva Nome Stanza e Genera Descrizione Emozionale Colonna F">💾</button>
          </div>
          ${renderSmartStanzeChipsInlineHtml(idx, 'sh')}

          <textarea style="min-height:76px; font-size:12.5px;" data-shcolf="${idx}">${escapeHtml(it.testo || '')}</textarea>

          <div class="gal-controls-row">
            <button type="button" class="gal-icon-btn" data-shtts="${idx}" title="Ascolta Lettura Voce">🔊</button>
            <button type="button" class="gal-icon-btn" data-shtpl="${idx}" title="11 Template Emozionali Colonna F">🪄</button>
            <button type="button" class="gal-icon-btn" data-shvis="${idx}" title="Analizza con Gemini Vision AI">🤖</button>
            ${!isVid ? `<button type="button" class="gal-icon-btn" data-shedit="${idx}" title="Editor Foto, Privacy & Nadir 360°">🎨</button>` : ''}
            <button type="button" class="gal-icon-btn" data-shadd="${idx}" title="Porta nello Studio Video">🎬</button>
            <button type="button" class="gal-icon-btn" style="color:#dc2626;" data-shdel="${idx}" title="Elimina Media">🗑️</button>
          </div>

          ${!isVid ? `
            <button type="button" class="btn ${is360 ? 'btn-cyan' : 'btn-outline'} btn-sm" data-shtoggle360="${idx}" style="width:100%;">
              ${is360 ? '🌐 360° ATTIVA (Tocca per Foto Standard)' : '🌐 TRASFORMA IN FOTO 360° SFERICA'}
            </button>
          ` : ''}
          ${is360 ? `
            <button type="button" class="btn btn-cyan btn-sm" data-shpano="${idx}" style="width:100%;">🌐 PROVA VISTA SFERICA 360° INTERATTIVA</button>
          ` : ''}

          <button type="button" class="btn-inonda-toggle ${isEscluso ? 'off' : 'on'}" data-shinonda="${idx}">
            ${isEscluso ? '🔴 ESCLUSO DALLA DIRETTA (Tocca per Abilitare)' : '🟢 IN ONDA NELLA DIRETTA (Tocca per Saltare)'}
          </button>

          <div>
            <label style="margin:2px 0;">🎨 Posizione Logo Watermark (Miniatura):</label>
            <select data-shlogopos="${idx}" style="padding:6px 8px; font-size:11.5px;">${wmOptsHtml}</select>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Imposta valore select watermark per ciascuna card
  visible.forEach(({ it, idx }) => {
    const sel = listBox.querySelector(`[data-shlogopos="${idx}"]`);
    if (sel) sel.value = it.logoPos || (it.tipo === '360' ? '360_nadir' : 'centrale_semitrasparente');
  });

  const bindSubDetailsForSheet = (idx, stName) => {
    const subBar = $(`#sh-subbar-${idx}`);
    if (!subBar) return;
    const details = getSottoDettagliStanza(stName);
    subBar.style.display = 'flex';
    subBar.innerHTML = `<span style="font-size:10px; color:#047857; font-weight:800;">✨ Particolari:</span>` +
      details.map((d) => `<button type="button" class="smart-subchip" data-shsubdet="${escapeHtml(d)}">+ ${escapeHtml(d)}</button>`).join('');
    subBar.querySelectorAll('[data-shsubdet]').forEach((sb) => {
      sb.onclick = () => {
        const it = state.activeSheetItems[idx];
        const combined = `${stName} ${sb.dataset.shsubdet}`.trim();
        it.stanza = combined;
        it.testo = generaTestoDescrittivoStanza(combined, schedaSheet, state.activeSheetTab);
        const inp = listBox.querySelector(`[data-shstanza="${idx}"]`);
        const ta = listBox.querySelector(`[data-shcolf="${idx}"]`);
        if (inp) inp.value = it.stanza;
        if (ta) ta.value = it.testo;
        showToast(`✨ Stanza e Colonna F aggiornate: ${combined}`);
      };
    });
  };

  listBox.querySelectorAll('[data-galchk]').forEach((chk) => {
    chk.onchange = () => {
      const idx = Number(chk.dataset.galchk);
      if (chk.checked) state.galSelectedIndices.add(idx);
      else state.galSelectedIndices.delete(idx);
      $(`#gal-card-${idx}`)?.classList.toggle('selected', chk.checked);
      aggiornaContatoriFiltriGalleria();
    };
  });
  listBox.querySelectorAll('[data-shstanza]').forEach((inp) => {
    inp.oninput = () => { state.activeSheetItems[Number(inp.dataset.shstanza)].stanza = inp.value; };
    inp.onfocus = () => bindSubDetailsForSheet(Number(inp.dataset.shstanza), inp.value);
  });
  listBox.querySelectorAll('[data-shcolf]').forEach((ta) => {
    ta.oninput = () => { state.activeSheetItems[Number(ta.dataset.shcolf)].testo = ta.value; };
  });
  listBox.querySelectorAll('[data-shlogopos]').forEach((sel) => {
    sel.onchange = () => { state.activeSheetItems[Number(sel.dataset.shlogopos)].logoPos = sel.value; };
  });
  listBox.querySelectorAll('[data-sh-quickst]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.shQuickst);
      const stName = b.dataset.stname;
      const it = state.activeSheetItems[idx];
      it.stanza = stName;
      it.testo = generaTestoDescrittivoStanza(stName, schedaSheet, state.activeSheetTab);
      const inp = listBox.querySelector(`[data-shstanza="${idx}"]`);
      const ta = listBox.querySelector(`[data-shcolf="${idx}"]`);
      if (inp) inp.value = stName;
      if (ta) ta.value = it.testo;
      bindSubDetailsForSheet(idx, stName);
      showToast(`🏠 "${stName}" + Descrizione Colonna F generata!`);
    };
  });
  listBox.querySelectorAll('[data-shsmart]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.shsmart);
      apriCatalogoStanzeModal((stName) => {
        state.activeSheetItems[idx].stanza = stName;
        state.activeSheetItems[idx].testo = generaTestoDescrittivoStanza(stName, schedaSheet, state.activeSheetTab);
        renderGalleriaSheetCards();
      });
    };
  });
  listBox.querySelectorAll('[data-shsavestanza], [data-shtpl]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.shsavestanza ?? b.dataset.shtpl);
      const it = state.activeSheetItems[idx];
      it.testo = generaTestoDescrittivoStanza(it.stanza, schedaSheet, state.activeSheetTab);
      const ta = listBox.querySelector(`[data-shcolf="${idx}"]`);
      if (ta) ta.value = it.testo;
      showToast(`💾 Stanza "${it.stanza}" e Colonna F pronte!`);
    };
  });
  listBox.querySelectorAll('[data-shvis]').forEach((b) => {
    b.onclick = async () => {
      const idx = Number(b.dataset.shvis);
      const it = state.activeSheetItems[idx];
      b.disabled = true; b.textContent = '⏳';
      const resVis = await analizzaFotoConGeminiVision(it.url, it.stanza, schedaSheet, geminiKey);
      it.testo = resVis.testo;
      const ta = listBox.querySelector(`[data-shcolf="${idx}"]`);
      if (ta) ta.value = it.testo;
      b.disabled = false; b.textContent = '🤖';
      showToast(resVis.motivo);
    };
  });
  listBox.querySelectorAll('[data-shtts]').forEach((b) => {
    b.onclick = () => leggiFraseConTTS(state.activeSheetItems[Number(b.dataset.shtts)]?.testo || '');
  });
  listBox.querySelectorAll('[data-shedit]').forEach((b) => {
    b.onclick = () => apriModalPhotoEditor(-1, Number(b.dataset.shedit));
  });
  listBox.querySelectorAll('[data-shadd]').forEach((b) => {
    b.onclick = () => {
      const it = state.activeSheetItems[Number(b.dataset.shadd)];
      if (it?.url) {
        state.mediaFiles.push({ name: `${it.stanza || 'Clip'}.jpg`, url: it.url, tipo: it.tipo === 'video' ? 'video' : 'foto', fromDrive: true });
        state.mediaDurations.push(4);
        aggiornaListaMedia();
        showToast(`🎬 "${it.stanza}" aggiunta allo Studio Video!`);
      }
    };
  });
  listBox.querySelectorAll('[data-shdel]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.shdel);
      const it = state.activeSheetItems[idx];
      if (!it || !confirm(`Rimuovere "${it.stanza}" dalla galleria?`)) return;
      state.activeSheetItems.splice(idx, 1);
      state.galSelectedIndices.clear();
      renderGalleriaSheetCards();
      showToast('🗑️ Elemento rimosso (clicca Salva Tutte le Modifiche per confermare su Sheet).');
    };
  });
  listBox.querySelectorAll('[data-shtoggle360]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.shtoggle360);
      const it = state.activeSheetItems[idx];
      it.tipo = it.tipo === '360' ? 'foto' : '360';
      it.logoPos = it.tipo === '360' ? '360_nadir' : 'centrale_semitrasparente';
      renderGalleriaSheetCards();
      showToast(it.tipo === '360' ? '🌐 Trasformata in Foto 360° Sferica!' : '🖼️ Impostata come Foto Standard.');
    };
  });
  listBox.querySelectorAll('[data-shpano]').forEach((b) => {
    b.onclick = () => {
      const it = state.activeSheetItems[Number(b.dataset.shpano)];
      if (it?.url) apriVistaSferica360Modal(it.url, it.stanza);
    };
  });
  listBox.querySelectorAll('[data-shinonda]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.shinonda);
      const it = state.activeSheetItems[idx];
      const rowKey = `${state.activeSheetTab}_${it.rowIndex}`;
      state.galExcludedMap[rowKey] = !state.galExcludedMap[rowKey];
      renderGalleriaSheetCards();
      showToast(state.galExcludedMap[rowKey] ? '🔴 Ambiente escluso dalla Diretta Live' : '🟢 Ambiente abilitato In Onda nella Diretta Live');
    };
  });
}

async function avviaBulkVisionAIGalleria() {
  if (!state.activeSheetItems.length) { showToast('Carica prima un immobile in Galleria!'); return; }
  const { geminiKey } = getSettings();
  const schedaSheet = state.activeSheetScheda || { tipoImmobile: estraiTipoImmobileDaNomeCartella(state.activeSheetTab), zona: state.activeSheetTab.replace(/_/g, ' '), metriQuadri: '120 metri quadri' };
  const indices = state.galSelectedIndices.size > 0
    ? Array.from(state.galSelectedIndices)
    : state.activeSheetItems.map((_, i) => i);

  showToast(`🤖 Avvio AI Visione Stanze su ${indices.length} elementi...`);
  for (const idx of indices) {
    const it = state.activeSheetItems[idx];
    if (!it || it.tipo === 'video') continue;
    const resVis = await analizzaFotoConGeminiVision(it.url, it.stanza, schedaSheet, geminiKey);
    it.testo = resVis.testo;
  }
  renderGalleriaSheetCards();
  showToast(`✅ Visione AI completata su ${indices.length} stanze! Clicca Salva per registrare su Sheet.`);
}

async function salvaModificheColonnaFSuSheet() {
  if (!state.activeSheetTab || !state.activeSheetItems.length) return;
  showToast('💾 Salvataggio di tutte le modifiche su Google Sheets...');
  const modifiche = state.activeSheetItems.map((it) => ({
    rowIndex: it.rowIndex,
    stanza: it.stanza,
    testo: forzaBrandingChiusura(it.testo),
    tipo: it.tipo || 'foto'
  }));
  try {
    const res = await gasPostJson({ action: 'salva_modifiche_galleria', tabName: state.activeSheetTab, modifiche });
    showToast(res?.success ? `🎉 Tutte le ${modifiche.length} modifiche (Stanze, Colonna F e 360°) salvate su Sheet!` : '⚠️ Errore salvataggio');
  } catch (err) { showToast('❌ Errore: ' + err.message); }
}

function importaFoglioSheetNelMontaggio() {
  if (!state.activeSheetItems.length) return;
  const colFAll = [];
  let added = 0;
  state.activeSheetItems.forEach((it) => {
    if (it.testo) colFAll.push(formatGiancaniMq(it.testo));
    if (it.url && it.tipo !== 'video') {
      state.mediaFiles.push({ name: `${it.stanza || 'Stanza'}.jpg`, url: it.url, tipo: 'foto', fromDrive: true });
      state.mediaDurations.push(4);
      added++;
    }
  });
  if (colFAll.length) {
    $('#inpZona').value = state.activeSheetTab.replace(/_/g, ' ');
    $('#inpTipo').value = estraiTipoImmobileDaNomeCartella(state.activeSheetTab);
    $('#inpDesc').value = colFAll[0];
    $('#txtCanzone').value = colFAll.map((t) => t.replace(/—\s*Immobiliare Giancani\s*$/i, '').trim()).join('\n');
    $('#txtDescrizione').value = colFAll.join('\n\n');
  }
  aggiornaListaMedia();
  showToast(`✅ Importate ${added} foto e testi Colonna F!`);
  goStep(4);
}

// 📋 MODALE SCHEDA IMMOBILE & REGIA DARIA + MODALE REEL 9:16 + SUB 4 STORIE DRIVE
function apriModalSchedaImmobileDarIA() {
  const s = state.activeSheetScheda || leggiSchedaDrivePayload();
  if ($('#modSchedaTipo')) $('#modSchedaTipo').value = s.tipoImmobile || 'Appartamento';
  if ($('#modSchedaMq')) $('#modSchedaMq').value = String(s.metriQuadri || '120').replace(/\s*metri quadri/i, '').trim();
  if ($('#modSchedaPrezzo')) $('#modSchedaPrezzo').value = s.prezzo || '';
  if ($('#modSchedaZona')) $('#modSchedaZona').value = s.zona || 'Favara';
  if ($('#modSchedaStato')) $('#modSchedaStato').value = s.stato || 'rifinito e ristrutturato a nuovo';
  if ($('#modSchedaStatoDettaglio')) $('#modSchedaStatoDettaglio').value = s.statoDettaglio || '';
  if ($('#modSchedaNoteDaria')) $('#modSchedaNoteDaria').value = s.noteDaria || '';
  $('#modalSchedaImmobileStudio').classList.add('open');
}

async function salvaModalSchedaImmobileDarIA() {
  const nuovaScheda = {
    tipoImmobile: $('#modSchedaTipo')?.value || 'Appartamento',
    metriQuadri: normalizzaMetriQuadriStr($('#modSchedaMq')?.value || '120'),
    prezzo: normalizzaPrezzoStr($('#modSchedaPrezzo')?.value),
    zona: $('#modSchedaZona')?.value.trim() || 'Favara',
    stato: $('#modSchedaStato')?.value || 'rifinito e ristrutturato a nuovo',
    statoDettaglio: $('#modSchedaStatoDettaglio')?.value.trim() || '',
    noteDaria: normalizzaMetriQuadri($('#modSchedaNoteDaria')?.value.trim() || '')
  };
  state.activeSheetScheda = nuovaScheda;
  // Allinea anche il form di upload
  if ($('#drvTipo')) $('#drvTipo').value = nuovaScheda.tipoImmobile;
  if ($('#drvMq')) $('#drvMq').value = nuovaScheda.metriQuadri.replace(/\s*metri quadri/i, '');
  if ($('#drvPrezzo')) $('#drvPrezzo').value = nuovaScheda.prezzo;
  if ($('#drvZona')) $('#drvZona').value = nuovaScheda.zona;
  if ($('#drvStato')) $('#drvStato').value = nuovaScheda.stato;
  if ($('#drvStatoDettaglio')) $('#drvStatoDettaglio').value = nuovaScheda.statoDettaglio;
  if ($('#drvNoteDaria')) $('#drvNoteDaria').value = nuovaScheda.noteDaria;

  $('#modalSchedaImmobileStudio').classList.remove('open');
  if (state.activeSheetTab) {
    try {
      await gasPostJson({ action: 'salva_scheda_immobile', tabName: state.activeSheetTab, datiScheda: nuovaScheda });
    } catch {}
  }
  showToast('✅ Scheda Immobile & Istruzioni Regia DarIA salvate!');
}

function apriModalGeneraReelGalleria(tabOverride = '') {
  const tab = tabOverride || state.activeSheetTab || $('#drvSheetSelect')?.value || $('#drvUploadFolderName')?.value.trim() || 'Immobile Giancani';
  if ($('#modReelImmobileNome')) $('#modReelImmobileNome').value = tab.replace(/_/g, ' ');
  const firstColF = state.activeSheetItems[0]?.testo
    || $('#drvDescGenerale')?.value.trim()
    || `Splendido ${tab.replace(/_/g, ' ')} in vendita. Ampia metratura di oltre 120 metri quadri, vani luminosi e rifiniture curate. Per info: 320 1667156 — Immobiliare Giancani`;
  if ($('#modReelTestoF')) $('#modReelTestoF').value = forzaBrandingChiusura(firstColF);
  caricaBasiMusicaliGalleriaDrive();
  if ($('#modReelStatusMsg')) $('#modReelStatusMsg').style.display = 'none';
  $('#modalGeneraReelStudio').classList.add('open');
}

async function caricaBasiMusicaliGalleriaDrive() {
  try {
    const res = await fetch(`${GAS_WEBAPP_URL}?action=get_musica`);
    const data = await res.json();
    const tracks = data.playlist || data.brani || data.tracks || [];
    state.basiMusicaliDrive = tracks;
    if ($('#badgeBasiMusicaliGal')) $('#badgeBasiMusicaliGal').textContent = `🎵 ${tracks.length} brani MP3`;
    const opts = '<option value="">Traccia Predefinita (Sicilian Sunset)</option>' +
      tracks.map((t) => `<option value="${escapeHtml(t.id || t.name || '')}">${escapeHtml(t.titolo || t.name || 'Brano Drive')}</option>`).join('');
    if ($('#selBasiMusicaliGal')) $('#selBasiMusicaliGal').innerHTML = opts;
    if ($('#modReelMusicaSelect')) $('#modReelMusicaSelect').innerHTML = opts;
  } catch {
    if ($('#badgeBasiMusicaliGal')) $('#badgeBasiMusicaliGal').textContent = '🎵 Cartella Drive MP3';
  }
}

function popolaStorieDriveGalleriaUI() {
  const selF = $('#selFraseStoriaGal');
  if (selF && !selF.options.length) {
    selF.innerHTML = '<option value="">🎲 Selezione Casuale Automatica da Colonna F</option>' +
      FRASI_PRESTIGIO_STORIE.map((f) => `<option value="${escapeHtml(f.id)}">[${escapeHtml(f.categoria)}] ${escapeHtml(f.titolo)}</option>`).join('');
    const updPreview = () => {
      const box = $('#boxAnteprimaColonnaFGal');
      if (!box) return;
      const custom = $('#inpFraseCustomStoriaGal')?.value.trim();
      if (custom) {
        box.innerHTML = `✍️ <strong>Frase Personalizzata Colonna F:</strong> "${escapeHtml(forzaBrandingChiusura(custom))}"`;
        return;
      }
      const found = FRASI_PRESTIGIO_STORIE.find((x) => x.id === selF.value) || FRASI_PRESTIGIO_STORIE[0];
      box.innerHTML = `📜 <strong>${escapeHtml(found.titolo)} (Colonna F):</strong> "${escapeHtml(found.colonnaF)}"`;
    };
    selF.onchange = updPreview;
    if ($('#inpFraseCustomStoriaGal')) $('#inpFraseCustomStoriaGal').oninput = updPreview;
    updPreview();
  }
}



export function bindGalleriaEvents() {
  // BIND CATEGORIA 3 (STUDIO GALLERIA & FOTO — SISTEMA TOTALE GENERATOR.HTML DARIA)
  $$('#insSubNav .sub-pill').forEach((b) => { b.onclick = () => selezionaInsSubTab(b.dataset.insSub); });
  $('#drvUploadSelectExisting').onchange = (e) => { if (e.target.value) $('#drvUploadFolderName').value = e.target.value; };
  $('#drvUploadFolderName').oninput = (e) => {
    const det = estraiTipoImmobileDaNomeCartella(e.target.value);
    if ($('#drvTipo') && TIPO_IMMOBILE_LIST.includes(det)) $('#drvTipo').value = det;
  };
  $('#btnDrvAutoDescGen').onclick = () => {
    const scheda = leggiSchedaDrivePayload();
    $('#drvDescGenerale').value = generaTestoDescrittivoStanza(scheda.tipoImmobile, scheda, $('#drvUploadFolderName').value);
    showToast('🪄 Descrizione Colonna F generata!');
  };
  $('#btnDrvTtsDescGen').onclick = () => leggiFraseConTTS($('#drvDescGenerale').value);
  $('#drvUploadFiles').onchange = (e) => {
    const files = Array.from(e.target.files || []);
    const tipoDef = $('#drvTipo')?.value || 'Appartamento';
    const sched = leggiSchedaDrivePayload();
    const defPos = $('#drvWatermarkPos')?.value || 'centrale_semitrasparente';
    files.forEach((f) => {
      const isVid = (f.type || '').startsWith('video/');
      const is360 = !isVid && (f.name || '').toLowerCase().includes('360');
      const st = deduciStanzaOImmobile(f.name, tipoDef);
      const colF = $('#drvDescGenerale').value.trim()
        ? forzaBrandingChiusura($('#drvDescGenerale').value)
        : generaTestoDescrittivoStanza(st, sched, $('#drvUploadFolderName').value);
      state.uploadQueueFiles.push({
        file: f,
        stanza: st,
        colonnaF: colF,
        tipoMedia: isVid ? 'video' : (is360 ? '360' : 'foto'),
        noteVideo: isVid ? 'Panoramica interni ed esterni con ripresa fluida' : '',
        editorOpts: {
          brightness: 100, contrast: 100, saturation: 100, maskEnabled: false,
          logoPosition: is360 ? '360_nadir' : defPos
        }
      });
    });
    renderUploadQueueList();
    e.target.value = '';
  };
  $('#btnDrvCreateSheetOnly').onclick = creaSoloFoglioECartella;
  $('#btnDrvUploadAll').onclick = avviaUploadSuDriveESheet;
  $('#btnDrvSendToMontaggio').onclick = () => {
    if (!state.uploadQueueFiles.length) { showToast('Seleziona prima foto o video!'); return; }
    state.uploadQueueFiles.forEach((it) => { state.mediaFiles.push(it.file); state.mediaDurations.push(4); });
    const s = leggiSchedaDrivePayload();
    $('#inpZona').value = s.zona; $('#inpTipo').value = s.tipologia || s.tipoImmobile; $('#inpMq').value = parseMqNumerico(s.metriQuadri);
    if ($('#drvDescGenerale').value.trim()) $('#inpDesc').value = $('#drvDescGenerale').value.trim();
    aggiornaListaMedia();
    goStep(4);
    showToast(`🎬 ${state.uploadQueueFiles.length} file portati nella Timeline Video!`);
  };
  $('#btnDrvMatchBuyers').onclick = () => {
    const s = leggiSchedaDrivePayload();
    ponteImmobileAAcquirenti({
      titolo: $('#drvUploadFolderName').value.trim() || `${s.tipoImmobile} a ${s.zona}`,
      comune: s.zona, tipologia: s.tipoImmobile, superficie: s.metriQuadri, prezzo: s.prezzo,
      testoColonnaF: $('#drvDescGenerale').value.trim() || generaTestoDescrittivoStanza(s.tipoImmobile, s)
    });
  };
  if ($('#btnDrvUploadOpenSuno')) {
    $('#btnDrvUploadOpenSuno').onclick = () => $('#btnOpenSunoModal')?.click();
  }

  // Galleria: Filtri, Azioni Bulk, Vision AI Massiva, Scheda DarIA, Reel 9:16
  $$('#galMediaTypeFilters [data-gal-filter]').forEach((btn) => {
    btn.onclick = () => {
      state.galFilterType = btn.dataset.galFilter || 'tutti';
      $$('#galMediaTypeFilters [data-gal-filter]').forEach((x) => x.classList.toggle('active', x.dataset.galFilter === state.galFilterType));
      renderGalleriaSheetCards();
    };
  });
  if ($('#btnGalBulkVisionAI')) $('#btnGalBulkVisionAI').onclick = avviaBulkVisionAIGalleria;
  if ($('#btnGalSelectAll')) {
    $('#btnGalSelectAll').onclick = () => {
      state.activeSheetItems.forEach((it, idx) => {
        if (state.galFilterType === 'tutti' || it.tipo === state.galFilterType) state.galSelectedIndices.add(idx);
      });
      renderGalleriaSheetCards();
    };
  }
  if ($('#btnGalSelectNone')) {
    $('#btnGalSelectNone').onclick = () => {
      state.galSelectedIndices.clear();
      renderGalleriaSheetCards();
    };
  }
  if ($('#btnGalDeleteSelected')) {
    $('#btnGalDeleteSelected').onclick = () => {
      if (!state.galSelectedIndices.size) { showToast('Seleziona almeno un elemento!'); return; }
      if (!confirm(`Rimuovere ${state.galSelectedIndices.size} elementi selezionati?`)) return;
      state.activeSheetItems = state.activeSheetItems.filter((_, idx) => !state.galSelectedIndices.has(idx));
      state.galSelectedIndices.clear();
      renderGalleriaSheetCards();
      showToast('🗑️ Elementi rimossi. Clicca Salva Tutte le Modifiche per aggiornare Google Sheet.');
    };
  }
  if ($('#btnGalEditSchedaDaria')) $('#btnGalEditSchedaDaria').onclick = apriModalSchedaImmobileDarIA;
  if ($('#btnCloseSchedaStudio')) $('#btnCloseSchedaStudio').onclick = () => $('#modalSchedaImmobileStudio').classList.remove('open');
  if ($('#btnCancelSchedaStudio')) $('#btnCancelSchedaStudio').onclick = () => $('#modalSchedaImmobileStudio').classList.remove('open');
  if ($('#btnConfirmSchedaStudio')) $('#btnConfirmSchedaStudio').onclick = salvaModalSchedaImmobileDarIA;

  if ($('#btnGalOpenReelModal')) $('#btnGalOpenReelModal').onclick = () => apriModalGeneraReelGalleria();
  if ($('#btnCloseReelStudio')) $('#btnCloseReelStudio').onclick = () => $('#modalGeneraReelStudio').classList.remove('open');
  if ($('#btnGalOpenSunoModal')) $('#btnGalOpenSunoModal').onclick = () => $('#btnOpenSunoModal')?.click();
  if ($('#btnOpenReelInStudioLoc')) {
    $('#btnOpenReelInStudioLoc').onclick = () => {
      $('#modalGeneraReelStudio').classList.remove('open');
      if (state.activeSheetItems.length) importaFoglioSheetNelMontaggio();
      else goStep(4);
    };
  }
  if ($('#btnAvviaReelCloudEmail')) {
    $('#btnAvviaReelCloudEmail').onclick = async () => {
      const tabName = state.activeSheetTab || $('#modReelImmobileNome')?.value || 'Immobile';
      const testoF = forzaBrandingChiusura($('#modReelTestoF')?.value || '');
      const musicaDriveId = $('#modReelMusicaSelect')?.value || '';
      const email = $('#modReelEmailDest')?.value.trim() || 'giancaniimmobiliare@gmail.com';
      const stBox = $('#modReelStatusMsg');
      if (stBox) { stBox.style.display = 'block'; stBox.textContent = '⏳ Invio richiesta generazione Reel 9:16 a Cloud / GitHub Actions...'; }
      try {
        await gasPostJson({ action: 'genera_reel_galleria', tabName, testoF, musicaDriveId, email });
        if (stBox) stBox.innerHTML = `✅ <strong>Richiesta Reel 9:16 inviata!</strong> Riceverai l'MP4 via email su ${escapeHtml(email)} — Immobiliare Giancani`;
        showToast('🎬 Generazione Reel 9:16 avviata!');
      } catch {
        if (stBox) stBox.innerHTML = `✅ <strong>Reel pronto per lo Studio Video locale!</strong> Clicca "Apri in Studio Video" per renderizzarlo subito sul telefono.`;
      }
    };
  }

  // Cartelle Google Drive & Sync 1-Tap
  $('#btnDrvRefreshFolders').onclick = caricaCartelleDrive;
  $('#drvSearchFolder').oninput = (e) => renderGrigliaCartelleDrive(e.target.value);
  if ($('#drvSelectFolderPicker')) {
    $('#drvSelectFolderPicker').onchange = (e) => {
      const val = e.target.value;
      if (!val) return;
      const found = state.driveFolders.find((f) => f.id === val || f.name === val);
      if (found) selezionaCartellaDrive(found);
      else if ($('#drvSyncManualFolderInput')) $('#drvSyncManualFolderInput').value = val;
    };
  }
  $('#btnDrvLoadSheetMedia').onclick = () => { const tab = $('#drvSheetSelect').value; if (tab) caricaMediaFoglioSheet(tab); };
  $('#drvSheetSelect').onchange = () => { const tab = $('#drvSheetSelect').value; if (tab) caricaMediaFoglioSheet(tab); };
  $('#btnDrvSaveColF').onclick = salvaModificheColonnaFSuSheet;
  if ($('#btnDrvSaveColFBottom')) $('#btnDrvSaveColFBottom').onclick = salvaModificheColonnaFSuSheet;
  $('#btnDrvUseSheetInMontaggio').onclick = importaFoglioSheetNelMontaggio;
  $('#btnDrvSheetMatchBuyers').onclick = () => {
    const tab = state.activeSheetTab || $('#drvSheetSelect').value;
    if (!tab) return;
    ponteImmobileAAcquirenti({
      tabName: tab, titolo: tab.replace(/_/g, ' '), comune: tab.replace(/_/g, ' '),
      tipologia: estraiTipoImmobileDaNomeCartella(tab),
      superficie: state.activeSheetScheda?.metriQuadri || '120 metri quadri',
      prezzo: state.activeSheetScheda?.prezzo || 'Trattativa Riservata',
      testoColonnaF: state.activeSheetItems[0]?.testo || ''
    });
  };
  $('#btnDrvSendSheetToLive').onclick = () => {
    const tab = state.activeSheetTab || $('#drvSheetSelect').value;
    if (!tab) { showToast('Apri prima un Foglio Sheet!'); return; }
    chiamaRegiaLiveGet(`action=set_immobile_attivo&tab=${encodeURIComponent(tab)}`, `📺 "${tab}" mandato in Diretta Live!`);
  };
  $('#btnDrvSyncSelected').onclick = async () => {
    const folderInput = $('#drvSyncManualFolderInput')?.value.trim() || state.selectedFolder?.id || '';
    if (!folderInput) { showToast('Seleziona una cartella Drive o inserisci nome/ID!'); return; }
    const logoPos = $('#drvSyncLogoPos')?.value || 'centrale_semitrasparente';
    const msgBox = $('#drvSyncStatusMsg');
    if (msgBox) { msgBox.style.display = 'block'; msgBox.textContent = `⏳ Scansione cartella Drive "${folderInput}" e sincronizzazione Sheet con testi Colonna F...`; }
    showToast('⏳ Sincronizzazione Drive → Foglio Sheet...');
    try {
      const res = await gasPostJson({ action: 'sincronizza_cartella_drive', folderInput, logoPos, datiScheda: leggiSchedaDrivePayload() });
      if (res?.success) {
        if (msgBox) msgBox.innerHTML = `🎉 <strong>SINCRONIZZAZIONE COMPLETATA!</strong> Foglio: <strong>${escapeHtml(res.tabName || folderInput)}</strong> (testi Colonna F, superfici in metri quadri) — Immobiliare Giancani`;
        showToast(`✅ Sincronizzato su "${res.tabName || folderInput}"!`);
        await caricaElencoFogliSheet();
        if (res.tabName) {
          selezionaInsSubTab('galleria');
          caricaMediaFoglioSheet(res.tabName);
        }
      } else {
        if (msgBox) msgBox.textContent = `⚠️ ${res?.error || 'Errore sincronizzazione'}`;
      }
    } catch (e) {
      if (msgBox) msgBox.textContent = `❌ Errore: ${e.message}`;
      showToast('❌ Errore: ' + e.message);
    }
  };
  $('#btnDrvImportFolderToMontaggio').onclick = () => {
    if (!state.selectedFolderFiles.length) { showToast('Seleziona una cartella con foto.'); return; }
    state.selectedFolderFiles.forEach((f) => {
      const url = f.url || (f.id ? `https://lh3.googleusercontent.com/d/${f.id}` : '');
      if (url) { state.mediaFiles.push({ name: f.name || 'Drive.jpg', url, tipo: 'foto', fromDrive: true }); state.mediaDurations.push(4); }
    });
    aggiornaListaMedia(); goStep(4); showToast('🎬 File cartella Drive aggiunti alla Timeline!');
  };

  // Sub 4: Storie 9:16 & Basi Musicali Drive
  if ($('#btnRefreshBasiGal')) $('#btnRefreshBasiGal').onclick = caricaBasiMusicaliGalleriaDrive;
  if ($('#btnRefreshStorieDriveGal')) $('#btnRefreshStorieDriveGal').onclick = () => { caricaBasiMusicaliGalleriaDrive(); popolaStorieDriveGalleriaUI(); showToast('🔄 Dati Storie & Frasi Colonna F aggiornati!'); };
  if ($('#btnUseFraseInStudioVideo')) {
    $('#btnUseFraseInStudioVideo').onclick = () => {
      const custom = $('#inpFraseCustomStoriaGal')?.value.trim();
      const selId = $('#selFraseStoriaGal')?.value;
      const found = FRASI_PRESTIGIO_STORIE.find((x) => x.id === selId) || FRASI_PRESTIGIO_STORIE[0];
      const fTxt = forzaBrandingChiusura(custom || found.colonnaF);
      $('#txtCanzone').value = fTxt;
      $('#txtSocial').value = fTxt;
      goStep(4);
      showToast('🎬 Frase Colonna F applicata ai Sottotitoli dello Studio Video!');
    };
  }
  if ($('#btnAvviaStoria916Drive')) {
    $('#btnAvviaStoria916Drive').onclick = async () => {
      const custom = $('#inpFraseCustomStoriaGal')?.value.trim();
      const selId = $('#selFraseStoriaGal')?.value;
      const found = FRASI_PRESTIGIO_STORIE.find((x) => x.id === selId) || FRASI_PRESTIGIO_STORIE[0];
      const fraseColF = forzaBrandingChiusura(custom || found.colonnaF);
      const stMsg = $('#storiaDriveStatusMsg');
      if (stMsg) { stMsg.style.display = 'block'; stMsg.innerHTML = `⏳ Avvio generazione Storia 9:16 con frase Colonna F:<br><em>"${escapeHtml(fraseColF)}"</em>`; }
      try {
        await gasPostJson({
          action: 'genera_storia_galleria',
          videoDrive: $('#selVideoSenzaTestoGal')?.value || '',
          fraseId: selId || '',
          customPhrase: fraseColF,
          musicaDrive: $('#selBasiMusicaliGal')?.value || ''
        });
        if (stMsg) stMsg.innerHTML = `✅ <strong>Workflow Storia 9:16 avviato!</strong> Riceverai l'MP4 via email — Immobiliare Giancani`;
      } catch {
        $('#txtCanzone').value = fraseColF;
        $('#txtSocial').value = fraseColF;
        if (stMsg) stMsg.innerHTML = `✅ <strong>Frase Colonna F caricata nello Studio Video!</strong> Passa al tab Video per esportare subito l'MP4 9:16.`;
      }
      showToast('🎬 Storia 9:16 Colonna F pronta!');
    };
  }

  // BIND MODALI GENERATOR (STANZE 6 CAT + EDITOR FOTO PRIVACY + PANORAMA 360° + BASI DRIVE)
  $('#btnCloseSmartStanze').onclick = () => $('#modalSmartStanzeCatalog').classList.remove('open');
  $('#btnClosePhotoEditor').onclick = () => $('#modalPhotoEditor').classList.remove('open');
  ['#rngEdBright', '#rngEdContrast', '#rngEdSat', '#selEdWatermarkPos', '#chkEdPrivacyMask', '#rngEdMaskX', '#rngEdMaskY', '#rngEdMaskSize', '#rngEdMaskOp'].forEach((id) => {
    const el = $(id);
    if (el) el.oninput = el.onchange = aggiornaPreviewPhotoEditor;
  });
  if ($('#btnEdAutoEnhance')) {
    $('#btnEdAutoEnhance').onclick = () => {
      $('#rngEdBright').value = 104;
      $('#rngEdContrast').value = 103;
      $('#rngEdSat').value = 102;
      aggiornaPreviewPhotoEditor();
      showToast('✨ Miglioramento Grafico Automatico Calibrato applicato!');
    };
  }
  $('#btnEdReset').onclick = () => {
    $('#rngEdBright').value = 100; $('#rngEdContrast').value = 100; $('#rngEdSat').value = 100;
    $('#chkEdPrivacyMask').checked = false; aggiornaPreviewPhotoEditor();
  };
  $('#btnEdApply').onclick = () => {
    if (state.editorQueueIdx >= 0 && state.uploadQueueFiles[state.editorQueueIdx]) {
      state.uploadQueueFiles[state.editorQueueIdx].editorOpts = { ...state.editorOpts, applyWatermark: true };
      renderUploadQueueList();
      showToast('✅ Modifiche foto, Watermark & Privacy salvate per l\'upload Drive!');
    } else if (state.editorSheetIdx >= 0 && state.activeSheetItems[state.editorSheetIdx]) {
      state.activeSheetItems[state.editorSheetIdx].logoPos = state.editorOpts.logoPosition;
      state.activeSheetItems[state.editorSheetIdx].editorOpts = { ...state.editorOpts };
      renderGalleriaSheetCards();
      showToast('✅ Impostazioni Watermark & Foto salvate sulla scheda Galleria!');
    }
    $('#modalPhotoEditor').classList.remove('open');
  };
  $('#btnEdDownload').onclick = () => {
    const cvs = $('#editorFotoCanvas');
    if (!cvs) return;
    const a = document.createElement('a'); a.href = cvs.toDataURL('image/jpeg', 0.92); a.download = 'foto_giancani_editor.jpg'; a.click();
    showToast('⬇️ Foto modificata scaricata!');
  };

  // Panorama 360° interactive drag & spin
  if ($('#btnClosePanorama360')) {
    $('#btnClosePanorama360').onclick = () => {
      state.pano360AutoSpin = false;
      cancelAnimationFrame(state.pano360Raf);
      $('#modalPanorama360').classList.remove('open');
    };
  }
  if ($('#btnPano360AutoSpin')) {
    $('#btnPano360AutoSpin').onclick = () => {
      state.pano360AutoSpin = !state.pano360AutoSpin;
      showToast(state.pano360AutoSpin ? '🔄 Rotazione automatica 360° attiva' : '⏸️ Rotazione automatica in pausa');
    };
  }
  if ($('#btnPano360Reset')) {
    $('#btnPano360Reset').onclick = () => {
      state.pano360Yaw = 0;
      state.pano360Pitch = 0;
      disegnaFramePanorama360();
    };
  }
  if ($('#pano360Canvas')) {
    const pCvs = $('#pano360Canvas');
    let pDrag = false;
    let lx = 0;
    let ly = 0;
    pCvs.addEventListener('pointerdown', (e) => {
      pDrag = true;
      state.pano360AutoSpin = false;
      lx = e.clientX;
      ly = e.clientY;
      pCvs.setPointerCapture(e.pointerId);
    });
    pCvs.addEventListener('pointermove', (e) => {
      if (!pDrag) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      state.pano360Yaw = (state.pano360Yaw - dx * 0.45) % 360;
      state.pano360Pitch = Math.max(-75, Math.min(75, state.pano360Pitch - dy * 0.35));
      disegnaFramePanorama360();
    });
    pCvs.addEventListener('pointerup', () => { pDrag = false; });
  }

  // Basi Drive modal
  const caricaBasiDrive = async () => {
    const listEl = $('#basiDriveList');
    listEl.innerHTML = '<div class="muted">⏳ Caricamento Basi Musicali da Google Drive...</div>';
    try {
      const res = await fetch(`${GAS_WEBAPP_URL}?action=get_musica`);
      const data = await res.json();
      const tracks = data.playlist || data.brani || data.tracks || [];
      listEl.innerHTML = tracks.length
        ? tracks.map((t) => `<div class="audio-track-row"><span class="track-pos-badge">🎵</span><div class="track-meta"><div class="track-name">${escapeHtml(t.titolo || t.name || 'Brano Drive')}</div><div class="track-dur">${escapeHtml(t.autore || t.size || 'Royalty-Free Drive')}</div></div><a href="${escapeHtml(t.url || '#')}" target="_blank" class="btn btn-outline btn-sm">Apri ↗</a></div>`).join('')
        : '<div class="muted">Carica i tuoi MP3 nella cartella Google Drive "02_MUSICA_IA_STORIE" con il pulsante sotto, oppure scegli dal telefono.</div>';
    } catch {
      listEl.innerHTML = '<div class="muted">Usa il pulsante "Apri Cartella Drive" qui sotto per accedere alle basi MP3 dell\'agenzia.</div>';
    }
  };
  $('#btnOpenBasiDriveModal').onclick = () => { $('#modalBasiDrive').classList.add('open'); caricaBasiDrive(); };
  $('#btnBasiDriveRefresh').onclick = caricaBasiDrive;
  $('#btnCloseBasiDrive').onclick = () => $('#modalBasiDrive').classList.remove('open');


}

export {
  selezionaInsSubTab, initInserzioniGeneratorUI, caricaCartelleDrive,
  caricaElencoFogliSheet, caricaMediaFoglioSheet, renderGalleriaSheetCards
};
