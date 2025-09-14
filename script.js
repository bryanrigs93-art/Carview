document.addEventListener('DOMContentLoaded', () => {
  /* ========= Helpers ========= */
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* ========= Toast ========= */
  function showToast(msg, ms=2200){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    getComputedStyle(t).opacity; // paint
    t.classList.add('show');
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 250); }, ms);
  }

  /* ========= Flujo móvil: mostrar intro primero ========= */
  if (window.innerWidth <= 980) {
    document.getElementById('intro')?.scrollIntoView({behavior:'auto', block:'start'});
  }

  /* ========= Mostrar prototipo al pulsar “Empezar” ========= */
  $('#startProto')?.addEventListener('click', () => {
    $('#protoWrap')?.classList.remove('is-hidden-mobile');   // mostrar prototipo
    $('#survey')?.classList.add('is-hidden-mobile');         // mantener encuesta oculta
    $('#iphone-home')?.scrollIntoView({ behavior:'smooth', block:'start', inline:'center' });
  });

  /* ========= Botón “Comenzar encuesta” desde el prototipo ========= */
  $('#btnStartSurvey')?.addEventListener('click', () => {
    $('#survey')?.classList.remove('is-hidden-mobile');
    $('#survey')?.scrollIntoView({ behavior:'smooth', block:'start' });
  });

  /* ========= Puntos verdes sobre fotos (indicador clic) ========= */
  $$('.card.js-open-detail .thumb').forEach(t=>{
    const dot = document.createElement('span');
    dot.className = 'hot-dot';
    dot.setAttribute('aria-hidden','true');
    t.appendChild(dot);
  });

  /* ========= iPhone Detalle ========= */
  const detailPhone = $('#iphone-detail');
  const backBtn     = $('#backBtn');
  const dImg   = $('#d-img');
  const dTitle = $('#d-title');
  const dPrice = $('#d-price');
  const dLoc   = $('#d-location');
  const dKm    = $('#d-km');

  function hideCoaches(){ ['coach1','coach2'].forEach(id=>{ const el = document.getElementById(id); if(el) el.style.display='none'; }); }

  // Mejora visual del botón “Regresar”: texto + bolita verde
  if (backBtn) {
    backBtn.classList.add('proto-hot');
    const dot = document.createElement('span');
    dot.className = 'hot-indicator';
    backBtn.appendChild(dot);

    const label = document.createElement('span');
    label.textContent = 'Regresar';
    label.style.fontWeight = '800';
    label.style.fontSize = '0.9rem';
    label.style.marginLeft = '6px';
    backBtn.appendChild(label);

    // layout rápido
    backBtn.style.width = 'auto';
    backBtn.style.padding = '0 12px 0 10px';
    backBtn.style.display = 'flex';
    backBtn.style.alignItems = 'center';
    backBtn.style.gap = '6px';
  }

  let selectionMode = false;
  const cardsGrid = $('#cards');

  function openDetailFromCard(card){
    if(selectionMode){
      const cb = card.querySelector('.car-select');
      if(cb){ cb.checked = !cb.checked; updateCompareUI(); }
      return;
    }
    const d = card.dataset;
    const thumb = card.querySelector('.thumb img');
    const imgUrl = d.img || (thumb ? thumb.src : "");
    if(dImg) dImg.src   = imgUrl;
    if(dImg) dImg.alt   = d.title || (thumb ? thumb.alt : "Foto vehículo");
    if(dTitle) dTitle.textContent = d.title || '—';
    if(dPrice) dPrice.textContent = d.price || '—';
    if(dLoc) dLoc.textContent   = d.location || '—';
    if(dKm) dKm.textContent    = d.km || '—';

    detailPhone?.classList.remove('hidden');
    hideCoaches();

    // mover vista al segundo iPhone
    setTimeout(()=>{ detailPhone?.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'}); }, 60);

    // quitar puntito verde al visitar
    card.querySelector('.hot-dot')?.remove();
  }

  function closeDetail(){
    detailPhone?.classList.add('hidden');
    // volver visualmente al iPhone 1 (home)
    $('#iphone-home')?.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
  }

  $$('.js-open-detail').forEach(c => c.addEventListener('click', ()=>openDetailFromCard(c)));
  backBtn?.addEventListener('click', closeDetail);

  /* ========= Botones no implementados → Toast ========= */
  $$('.proto-disabled').forEach(el => el.addEventListener('click', ()=>showToast('Botón no disponible en prototipo de app')));

  /* ========= Overlays helper ========= */
  function closeOverlay(ov){ ov.classList.remove('open'); setTimeout(()=>ov.remove(), 200); }

  /* ========= IA: Comparar (demo) con modo selección ========= */
  const btnCompare   = $('#btnCompare');
  const compareLabel = $('#compareLabel');
  const compareHint  = $('#compareHint');

  function getSelectedCars(){
    return $$('.card .car-select:checked').map(cb => cb.closest('.card'));
  }

  function enterSelectionMode(){
    selectionMode = true;
    cardsGrid?.classList.add('selection-mode');
    $$('.card .car-select').forEach(cb=>cb.checked=false);
    if(compareHint){ compareHint.hidden = false; compareHint.textContent = 'Selecciona los autos que deseas comparar (marca 2).'; }
    if(compareLabel) compareLabel.textContent = 'Comparar ahora (0/2)';
    btnCompare?.setAttribute('disabled', 'true');
    showToast('Selecciona los autos que deseas comparar (marca 2).');
  }

  function exitSelectionMode(){
    selectionMode = false;
    cardsGrid?.classList.remove('selection-mode');
    if(compareHint) compareHint.hidden = true;
    if(compareLabel) compareLabel.textContent = 'IA: Comparar (demo)';
    btnCompare?.removeAttribute('disabled');
  }

  function updateCompareUI(){
    const sel = getSelectedCars().length;
    if(selectionMode){
      if(compareLabel) compareLabel.textContent = `Comparar ahora (${sel}/2)`;
      if(sel >= 2){ btnCompare?.removeAttribute('disabled'); }
      else{ btnCompare?.setAttribute('disabled','true'); }
    }
  }

  btnCompare?.addEventListener('click', ()=>{
    if(!selectionMode){ enterSelectionMode(); return; }
    const selected = getSelectedCars();
    if(selected.length < 2){ showToast('Selecciona al menos 2 autos para comparar.'); return; }
    const pick = selected.slice(0,2).map(card => ({
      id: card.dataset.id || '',
      title: card.dataset.title || card.querySelector('h3')?.textContent || 'Auto',
      price: card.dataset.price || card.querySelector('.price')?.textContent || '-',
      km: card.dataset.km || '-',
      img: (card.querySelector('.thumb img')||{}).src || ''
    }));
    exitSelectionMode();
    openAIModal(pick[0], pick[1]);
  });

  // Evitar burbujeo del checkbox y actualizar contador
  $$('.select-box, .car-select').forEach(el=>{
    ['click','mousedown','touchstart'].forEach(evt=>{
      el.addEventListener(evt, ev=>ev.stopPropagation(), {passive:true});
    });
  });
  $$('.car-select').forEach(cb => cb.addEventListener('change', updateCompareUI));

  /* ========= Pista de scroll (botón abajo centrado) ========= */
  function addScrollHint(container){
    if(!container || window.innerWidth > 980) return; // solo móvil
    const need = container.scrollHeight > container.clientHeight + 8;
    if(!need) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label','Desliza hacia abajo');
    Object.assign(btn.style, {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(255,255,255,.95)',
      border: '1px solid #e1e4ea',
      borderRadius: '999px',
      padding: '8px 12px',
      fontWeight: '800',
      fontSize: '.9rem',
      color: '#334155',
      boxShadow: '0 6px 16px rgba(0,0,0,.12)',
      zIndex: '5',
    });
    const chev = document.createElement('span');
    Object.assign(chev.style, {
      width:'14px', height:'14px',
      border: '3px solid currentColor',
      borderLeftColor: 'transparent',
      borderTopColor: 'transparent',
      transform: 'rotate(45deg)',
      opacity: '.9',
      display: 'inline-block',
      marginTop: '2px',
      animation: 'downNudge 1.2s ease-in-out infinite'
    });
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes downNudge{
        0%{ transform:rotate(45deg) translateY(0) }
        50%{ transform:rotate(45deg) translateY(6px) }
        100%{ transform:rotate(45deg) translateY(0) }
      }
    `;
    document.head.appendChild(styleTag);

    const text = document.createElement('span');
    text.textContent = 'Desliza hacia abajo';

    btn.appendChild(chev);
    btn.appendChild(text);
    container.appendChild(btn);

    const hide = () => { btn.remove(); container.removeEventListener('scroll', hide); };
    container.addEventListener('scroll', hide, {passive:true});
    setTimeout(hide, 6000);

    btn.addEventListener('click', ()=>{
      container.scrollBy({top: Math.min(240, container.scrollHeight), behavior:'smooth'});
    });
  }

  /* ========= Modal IA (demo) ========= */
  function openAIModal(a, b){
    function bulletsFor(car){
      const pros=[], cons=[];
      if(/Corolla/i.test(car.title)){ pros.push('Alta confiabilidad y buena reventa','Costos de mantenimiento contenidos'); cons.push('Precio de entrada mayor'); }
      if(/Elantra/i.test(car.title)){ pros.push('Precio más accesible; equipamiento competitivo'); cons.push('Depreciación más pronunciada'); if(/145,?000|145000|km/i.test(car.km)) cons.push('Kilometraje alto detectado (~145,000 km)'); }
      return {pros, cons};
    }
    const A = bulletsFor(a), B = bulletsFor(b);
    let reco = /Corolla/i.test(a.title) ? a.title : b.title;

    const ov = document.createElement('div');
    ov.className = 'ov';
    ov.innerHTML = `
      <div class="card-lg">
        <header>
          <span class="pill">IA (demo)</span>
          <button class="x" aria-label="Cerrar">✕</button>
        </header>
        <h3>Comparación seleccionada</h3>
        <p class="muted">Generado a partir de los autos marcados con checkbox en el prototipo.</p>

        <div class="ai-grid">
          <div class="ai-col">
            <h4>🚗 ${escapeHTML(a.title)} — <b>${escapeHTML(a.price)}</b></h4>
            <ul>${A.pros.map(p=>`<li><b>Pro:</b> ${escapeHTML(p)}</li>`).join('')}
                ${A.cons.map(c=>`<li><b>Con:</b> ${escapeHTML(c)}</li>`).join('')}</ul>
          </div>
          <div class="ai-col">
            <h4>🚗 ${escapeHTML(b.title)} — <b>${escapeHTML(b.price)}</b></h4>
            <ul>${B.pros.map(p=>`<li><b>Pro:</b> ${escapeHTML(p)}</li>`).join('')}
                ${B.cons.map(c=>`<li><b>Con:</b> ${escapeHTML(c)}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="ai-reco">🔎 <b>Recomendación:</b> <b>${escapeHTML(reco)}</b> se perfila como la opción más segura según el análisis de ejemplo.</div>

        <div class="ai-cta-row">
          <button class="btn pro pulsing proto-hot" id="btnPro">
            <span class="hot-indicator" aria-hidden="true"></span>
            Ver detalles de la versión Pro
          </button>
          <button class="btn outline" id="btnClose">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add('open'));

    // Pista de scroll en móviles
    addScrollHint(ov.querySelector('.card-lg'));

    ov.addEventListener('click', e => { if(e.target === ov) closeOverlay(ov); });
    ov.querySelector('.x')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnClose')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnPro')?.addEventListener('click', ()=>{ closeOverlay(ov); openProModal(); });
  }

  /* ========= Versión Pro (demo) ========= */
  function openProModal(){
    const ov = document.createElement('div');
    ov.className = 'ov';
    ov.innerHTML = `
      <div class="card-lg">
        <header>
          <span class="pill">Versión Pro (demo)</span>
          <button class="x" aria-label="Cerrar">✕</button>
        </header>
        <h3>Suscripción mensual Pro – Asesoría y red de servicios</h3>
        <p class="muted">Ejemplo de beneficios al lanzar la app.</p>
        <ul>
          <li>📍 <b>Network tipo Uber</b> de profesionales verificados: sugerimos los <b>más cercanos</b> y con mejor <b>rating</b>.</li>
          <li>👨‍💼 <b>Asesor experto humano</b> para compra y <b>trámites</b>.</li>
          <li>🔧 Acceso a <b>talleres aliados</b> de nuestra red.</li>
          <li>🪝 <b>Servicio de grúa</b> 24/7 por emergencias.</li>
          <li>🧰 <b>Mecánicos de emergencia</b> a domicilio con <b>tarifas preferenciales</b>.</li>
          <li>💬 Soporte prioritario en chat.</li>
        </ul>
        <div class="ai-reco">💡 Precio de ejemplo: <b>$9.99/mes</b>. Cancela cuando quieras.</div>
        <div class="ai-cta-row">
          <button class="btn brand" id="btnStartPro">Probar Pro (demo)</button>
          <button class="btn outline" id="btnClosePro">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add('open'));

    // Pista de scroll en móviles
    addScrollHint(ov.querySelector('.card-lg'));

    ov.addEventListener('click', e => { if(e.target === ov) closeOverlay(ov); });
    ov.querySelector('.x')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnClosePro')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnStartPro')?.addEventListener('click', ()=>showToast('Alta Pro (prototipo)…'));
  }

  /* ========= Historial del vehículo (demo) ========= */
  $('#btnHistory')?.addEventListener('click', openHistoryModal);

  function openHistoryModal(){
    const title = $('#d-title')?.textContent || 'Vehículo';
    const km    = $('#d-km')?.textContent || '—';
    const ov = document.createElement('div');
    ov.className = 'ov';
    ov.innerHTML = `
      <div class="card-lg">
        <header>
          <span class="pill">Historial (demo)</span>
          <button class="x" aria-label="Cerrar">✕</button>
        </header>
        <h3>${escapeHTML(title)} — Historial resumido</h3>
        <p class="muted">Datos ficticios para el prototipo · Kilometraje reportado: <b>${escapeHTML(km)}</b></p>

        <div class="ai-grid">
          <div class="ai-col">
            <h4>🧾 Resumen</h4>
            <ul>
              <li>Dueños registrados: <b>2</b></li>
              <li>Estado legal: <b>sin reporte de robo</b></li>
              <li>Uso anterior: <b>particular</b></li>
              <li>ITV/inspecciones: <b>al día</b></li>
            </ul>
          </div>
          <div class="ai-col">
            <h4>🛠️ Mantenimientos</h4>
            <ul>
              <li>2023-09: Cambio de frenos y balanceo</li>
              <li>2022-12: Cambio de batería</li>
              <li>2022-06: Servicio mayor (aceite, filtros, bujías)</li>
            </ul>
          </div>
        </div>

        <div class="ai-reco">ℹ️ <b>Nota:</b> Verifica facturas y que el VIN coincida con documentos físicos antes de comprar.</div>

        <div class="ai-cta-row">
          <button class="btn brand" id="btnHistoryClose">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add('open'));

    // Pista de scroll en móviles
    addScrollHint(ov.querySelector('.card-lg'));

    ov.addEventListener('click', e => { if(e.target === ov) closeOverlay(ov); });
    ov.querySelector('.x')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnHistoryClose')?.addEventListener('click', ()=>closeOverlay(ov));
  }

  /* ========= Encuesta + Foro ========= */
  const surveyForm   = $('#surveyForm');
  const likertLogo   = $('#logoScore');
  const logoHidden   = surveyForm?.elements['logo'];
  const likertEase   = $('#easeScore');
  const easeHidden   = surveyForm?.elements['ease'];
  const help         = $('#helpScore');
  const helpHidden   = surveyForm?.elements['help'];
  const feedItems    = $('#feedItems');

  function bindLikert(container, hiddenInput){
    container?.addEventListener('click', e=>{
      const b = e.target.closest('button[data-v]'); if(!b) return;
      if(hiddenInput) hiddenInput.value = b.dataset.v;
      container.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
    });
  }
  bindLikert(likertLogo, logoHidden);
  bindLikert(likertEase, easeHidden);
  bindLikert(help, helpHidden);

  surveyForm?.addEventListener('submit', e=>{
    e.preventDefault();

    const nombre      = surveyForm.elements['nombre'].value.trim();
    const recomendo   = surveyForm.elements['recomendo'].value;
    const atractivos  = [...surveyForm.querySelectorAll('input[name="atractivo"]:checked')].map(i=>i.value);

    // Campo "premium" puede no existir en esta versión; por seguridad:
    const premium     = (surveyForm.elements['premium'] ? surveyForm.elements['premium'].value : '');

    const featuresAdd = [...surveyForm.querySelectorAll('input[name="featuresAdd"]:checked')].map(i=>i.value);
    const featuresExt = surveyForm.elements['features_otros'].value.trim();
    const logo        = surveyForm.elements['logo'].value;
    const easeScore   = surveyForm.elements['ease'].value;
    const helpScore   = surveyForm.elements['help'].value;
    const sugerencia  = surveyForm.elements['sugerencia'].value.trim();

    if(!nombre){ showToast('Escribe tu nombre para participar.'); return; }
    if(!recomendo){ showToast('Selecciona quién te recomendó la encuesta.'); return; }
    if(atractivos.length===0){ showToast('Selecciona al menos un aspecto atractivo.'); return; }
    if(!surveyForm.elements['consent'].checked){ showToast('Debes aceptar participar para entrar en la rifa.'); return; }

    appendPost({ nombre, recomendo, atractivos, premium, featuresAdd, featuresExt, logo, ease: easeScore, help: helpScore, sugerencia });

    showToast('¡Gracias! Respuestas registradas (prototipo).');
    surveyForm.reset();
    if(logoHidden) logoHidden.value = '3';
    likertLogo?.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.v==='3'));
    if(easeHidden) easeHidden.value = '3';
    likertEase?.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.v==='3'));
    if(helpHidden) helpHidden.value = '3';
    help?.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.v==='3'));
  });

  function appendPost(d){
    if(!feedItems) return;
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <div class="post-head">
        <div>
          <span class="name">Usuario ${escapeHTML(d.nombre)}</span>
          <span class="tag">ha subido la encuesta</span>
        </div>
      </div>
      <div class="post-body">
        <div>🎓 <b>Estudiante que te compartio la encuesta:</b> ${escapeHTML(d.recomendo)}</div>
        <div>📢 <b>Contacto:</b> No es necesario (proyecto universitario).</div>
        <div>⭐ <b>Atractivo(s):</b> ${d.atractivos.length ? d.atractivos.map(escapeHTML).join(', ') : '—'}</div>
        <div>💎 <b>Premium dispuesto a pagar:</b> ${escapeHTML(d.premium || '—')}</div>
        <div>🧩 <b>Características que agregaría:</b>
          ${ (d.featuresAdd && d.featuresAdd.length) ? escapeHTML(d.featuresAdd.join(', ')) : '—' }
          ${ d.featuresExt ? `<br><b>Otras:</b> ${escapeHTML(d.featuresExt)}` : '' }
        </div>
        <div>🏁 <b>Valoración del logo:</b> ${escapeHTML(d.logo)}/5</div>
        <div>🧭 <b>Facilidad de seguir instrucciones:</b> ${escapeHTML(d.ease)}/5</div>
        <div>🛡️ <b>Utilidad como guía (seguridad/transparencia):</b> ${escapeHTML(d.help)}/5</div>
        ${ d.sugerencia ? `<div>📝 <b>Sugerencia:</b> ${escapeHTML(d.sugerencia)}</div>` : '' }
      </div>
    `;
    feedItems.prepend(div);
  }

  /* ========= Asegurar bolita verde pulsante en “Comenzar encuesta” ========= */
  (function ensureStartSurveyDot(){
    const b = document.getElementById('btnStartSurvey');
    if (b && !b.querySelector('.hot-indicator')) {
      const dot = document.createElement('span');
      dot.className = 'hot-indicator';
      dot.setAttribute('aria-hidden','true');
      b.appendChild(dot);
    }
  })();
});