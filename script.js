/* script.js — CarView proto (Firebase + UI fixed) */
document.addEventListener('DOMContentLoaded', () => {
  // Evitar doble inicialización si el HTML incluye el script dos veces
  if (window.__carviewInit) return;
  window.__carviewInit = true;

  /* ========= Helpers ========= */
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function showToast(msg, ms=2200){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    getComputedStyle(t).opacity;
    t.classList.add('show');
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 250); }, ms);
  }

  /* ========= Flujo móvil: intro primero ========= */
  if (window.innerWidth <= 980) {
    document.getElementById('intro')?.scrollIntoView({behavior:'auto', block:'start'});
  }

  /* ========= Mostrar prototipo al pulsar “Empezar” ========= */
  $('#startProto')?.addEventListener('click', () => {
    $('#protoWrap')?.classList.remove('is-hidden-mobile');
    $('#survey')?.classList.add('is-hidden-mobile');
    $('#iphone-home')?.scrollIntoView({ behavior:'smooth', block:'start', inline:'center' });
  });

  /* ========= Botón “Comenzar encuesta” ========= */
  $('#btnStartSurvey')?.addEventListener('click', () => {
    $('#survey')?.classList.remove('is-hidden-mobile');
    $('#survey')?.scrollIntoView({ behavior:'smooth', block:'start' });
  });

  /* ========= Puntos verdes sobre fotos (reponer si faltan) ========= */
  $$('.card.js-open-detail .thumb').forEach(t=>{
    if (!t.querySelector('.hot-dot')) {
      const dot = document.createElement('span');
      dot.className = 'hot-dot';
      dot.setAttribute('aria-hidden','true');
      t.appendChild(dot);
    }
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

  // Botón “Regresar”: añadir label y bolita solo si NO están
  if (backBtn) {
    backBtn.classList.add('proto-hot');
    if (!backBtn.querySelector('.hot-indicator')) {
      const dot = document.createElement('span');
      dot.className = 'hot-indicator';
      dot.setAttribute('aria-hidden','true');
      backBtn.appendChild(dot);
    }
    if (!backBtn.querySelector('.back-label')) {
      const label = document.createElement('span');
      label.className = 'back-label';
      label.textContent = 'Regresar';
      label.style.fontWeight = '800';
      label.style.fontSize = '0.9rem';
      label.style.marginLeft = '6px';
      backBtn.appendChild(label);
    }
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
    setTimeout(()=>{ detailPhone?.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'}); }, 60);
    card.querySelector('.hot-dot')?.remove();
  }

  function closeDetail(){
    detailPhone?.classList.add('hidden');
    $('#iphone-home')?.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
  }

  $$('.js-open-detail').forEach(c => c.addEventListener('click', ()=>openDetailFromCard(c)));
  backBtn?.addEventListener('click', closeDetail);

  /* ========= Botones no implementados → Toast ========= */
  $$('.proto-disabled').forEach(el => el.addEventListener('click', ()=>showToast('Botón no disponible en prototipo de app')));

  /* ========= Overlays helper ========= */
  function closeOverlay(ov){ ov.classList.remove('open'); setTimeout(()=>ov.remove(), 200); }

  /* ========= IA: Comparar (demo) ========= */
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

  /* ========= Pista de scroll (btn hint en móviles) ========= */
  function addScrollHint(container){
    if(!container || window.innerWidth > 980) return;
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

    btn.appendChild(chev); btn.appendChild(text);
    container.appendChild(btn);

    const hide = () => { btn.remove(); container.removeEventListener('scroll', hide); };
    container.addEventListener('scroll', hide, {passive:true});
    setTimeout(hide, 6000);

    btn.addEventListener('click', ()=>{
      container.scrollBy({top: Math.min(240, container.scrollHeight), behavior:'smooth'});
    });
  }

  /* ========= Modales (IA, Pro, Historial) ========= */
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
        <p class="muted">Generado a partir de los autos marcados en el prototipo.</p>

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

        <div class="ai-reco">🔎 <b>Recomendación:</b> <b>${escapeHTML(reco)}</b> se perfila como la opción más segura según este ejemplo.</div>

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
    addScrollHint(ov.querySelector('.card-lg'));

    ov.addEventListener('click', e => { if(e.target === ov) closeOverlay(ov); });
    ov.querySelector('.x')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnClose')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnPro')?.addEventListener('click', ()=>{ closeOverlay(ov); openProModal(); });
  }

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
          <li>📍 <b>Network</b> de profesionales verificados (cercanía + rating).</li>
          <li>👨‍💼 <b>Asesor experto humano</b> para compra y <b>trámites</b>.</li>
          <li>🔧 <b>Talleres aliados</b> y precios preferenciales.</li>
          <li>🪝 <b>Grúas 24/7</b> y atención prioritaria.</li>
        </ul>
        <div class="ai-reco">💡 Precio de ejemplo: <b>$9.99/mes</b>.</div>
        <div class="ai-cta-row">
          <button class="btn brand" id="btnStartPro">Probar Pro (demo)</button>
          <button class="btn outline" id="btnClosePro">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add('open'));
    addScrollHint(ov.querySelector('.card-lg'));
    ov.addEventListener('click', e => { if(e.target === ov) closeOverlay(ov); });
    ov.querySelector('.x')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnClosePro')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnStartPro')?.addEventListener('click', ()=>showToast('Alta Pro (prototipo)…'));
  }

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
        <p class="muted">Kilometraje reportado: <b>${escapeHTML(km)}</b></p>
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
              <li>2022-06: Servicio mayor</li>
            </ul>
          </div>
        </div>
        <div class="ai-cta-row">
          <button class="btn brand" id="btnHistoryClose">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add('open'));
    addScrollHint(ov.querySelector('.card-lg'));
    ov.addEventListener('click', e => { if(e.target === ov) closeOverlay(ov); });
    ov.querySelector('.x')?.addEventListener('click', ()=>closeOverlay(ov));
    ov.querySelector('#btnHistoryClose')?.addEventListener('click', ()=>closeOverlay(ov));
  }

  /* ========= Encuesta + Foro (Firestore tiempo real) ========= */
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

  // ===== Firebase (dinámico, no necesita type="module" en HTML) =====
  let db = null;
  let fsCollection = null;
  let onSnapshotUnsub = null;

  (async function initFirebase(){
    try{
      const [{ initializeApp }, { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, orderBy, query, deleteDoc, doc, enableIndexedDbPersistence }]
        = await Promise.all([
          import('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js'),
          import('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js')
        ]);

      const firebaseConfig = {
        apiKey: "AIzaSyAsbtZAiwAS1uDvJfQ9jbJLp2P9Z2LefUc",
        authDomain: "carview-proto.firebaseapp.com",
        projectId: "carview-proto",
        storageBucket: "carview-proto.firebasestorage.app",
        messagingSenderId: "374557512796",
        appId: "1:374557512796:web:582e6e72c1db49d9e78299",
        measurementId: "G-SRVQ66GBEF"
      };

      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      // Cache offline opcional
      try { await enableIndexedDbPersistence(db); } catch {}

      // Colección
      fsCollection = (...path)=>collection(db, ...path);

      // Live feed
      const q = query(fsCollection('surveys'), orderBy('createdAt','desc'));
      onSnapshotUnsub = onSnapshot(q, (snap)=>{
        if (!feedItems) return;
        feedItems.innerHTML = '';
        snap.forEach(d=>{
          const data = d.data() || {};
          const el = createPostEl({ id: d.id, ...data });
          feedItems.appendChild(el);
        });
      });

      // submit → addDoc
      surveyForm?.addEventListener('submit', async (e)=>{
        e.preventDefault();
        if (!surveyForm.reportValidity()) return;

        const nombre      = surveyForm.elements['nombre'].value.trim();
        const recomendo   = surveyForm.elements['recomendo'].value;
        const atractivos  = [...surveyForm.querySelectorAll('input[name="atractivo"]:checked')].map(i=>i.value);
        const plan        = (surveyForm.elements['plan_import']?.value) || '';
        const premium     = (surveyForm.elements['pro_price']?.value) || (surveyForm.elements['premium']?.value) || '';
        const featuresAdd = [...surveyForm.querySelectorAll('input[name="featuresAdd"]:checked')].map(i=>i.value);
        const featuresExt = surveyForm.elements['features_otros'].value.trim();
        const logo        = surveyForm.elements['logo'].value;
        const easeScore   = surveyForm.elements['ease'].value;
        const helpScore   = surveyForm.elements['help'].value;
        const sugerencia  = surveyForm.elements['sugerencia'].value.trim();

        if(!nombre){ showToast('Escribe tu nombre para participar.'); return; }
        if(!recomendo){ showToast('Selecciona quién te recomendó la encuesta.'); return; }
        if(atractivos.length===0){ showToast('Selecciona al menos un aspecto atractivo.'); return; }
        if(!surveyForm.elements['consent'].checked){ showToast('Debes aceptar participar para enviar.'); return; }

        try{
          await addDoc(fsCollection('surveys'), {
            nombre, recomendo, atractivos, plan, premium,
            featuresAdd, featuresExt, logo,
            ease: easeScore, help: helpScore, sugerencia,
            createdAt: serverTimestamp()
          });
          showToast('¡Gracias por su ayuda!');
          // Reset visual
          surveyForm.reset();
          if(logoHidden) logoHidden.value = '3';
          likertLogo?.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.v==='3'));
          if(easeHidden) easeHidden.value = '3';
          likertEase?.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.v==='3'));
          if(helpHidden) helpHidden.value = '3';
          help?.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.v==='3'));
        }catch(err){
          console.error(err);
          showToast('No se pudo enviar. Revisa tu conexión.');
        }
      });

      // Delegación: eliminar post en Firestore
      feedItems?.addEventListener('click', async (e)=>{
        const del = e.target.closest('.post-delete');
        if (!del) return;
        const card = del.closest('.post');
        const id = card?.dataset.id;
        if (!id) return;
        try{
          await deleteDoc(doc(db, 'surveys', id));
          showToast('Encuesta eliminada.');
        }catch(err){
          console.error(err);
          showToast('No se pudo eliminar.');
        }
      });

    }catch(err){
      console.error('Firebase no pudo iniciar:', err);
      showToast('Error conectando con la base de datos.');
      // Aun así deja usable el prototipo (UI, modales, etc.)
    }
  })();

  // Render tarjeta (común a Firestore)
  function createPostEl(d){
    const div = document.createElement('div');
    div.className = 'post';
    div.dataset.id = d.id || '';
    div.innerHTML = `
      <div class="post-head">
        <div>
          <span class="name">Usuario ${escapeHTML(d.nombre || '—')}</span>
          <span class="tag">ha subido la encuesta</span>
        </div>
        <button class="post-delete" aria-label="Eliminar encuesta">Eliminar</button>
      </div>
      <div class="post-body">
        <div>🎓 <b>Estudiante que te compartió la encuesta:</b> ${escapeHTML(d.recomendo || '—')}</div>
        <div>📢 <b>Contacto:</b> No es necesario (proyecto universitario).</div>
        <div>⭐ <b>Atractivo(s):</b> ${Array.isArray(d.atractivos)&&d.atractivos.length ? d.atractivos.map(escapeHTML).join(', ') : '—'}</div>
        ${ d.plan ? `<div>📦 <b>Plan elegido:</b> ${escapeHTML(d.plan)}</div>` : '' }
        <div>💎 <b>Presupuesto Pro (mensual):</b> ${escapeHTML(d.premium || '—')}</div>
        <div>🧩 <b>Características que agregaría:</b>
          ${ Array.isArray(d.featuresAdd)&&d.featuresAdd.length ? escapeHTML(d.featuresAdd.join(', ')) : '—' }
          ${ d.featuresExt ? `<br><b>Otras:</b> ${escapeHTML(d.featuresExt)}` : '' }
        </div>
        <div>🏁 <b>Valoración del logo:</b> ${escapeHTML(d.logo || '—')}/5</div>
        <div>🧭 <b>Facilidad de seguir instrucciones:</b> ${escapeHTML(d.ease || '—')}/5</div>
        <div>🛡️ <b>Utilidad como guía:</b> ${escapeHTML(d.help || '—')}/5</div>
        ${ d.sugerencia ? `<div>📝 <b>Sugerencia:</b> ${escapeHTML(d.sugerencia)}</div>` : '' }
      </div>
    `;
    return div;
  }

  /* ========= Bolita verde en “Comenzar encuesta” ========= */
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

// Abrir/cerrar dashboard
document.getElementById('dashboard-btn').addEventListener('click', function() {
  const dashboard = document.getElementById('dashboard');
  dashboard.classList.toggle('active');
  
  // Cambiar estado del botón
  this.textContent = dashboard.classList.contains('active') 
    ? 'Cerrar Panel' 
    : 'Ver Panel Ejecutivo';
});

// Cerrar al hacer clic fuera (opcional)
document.addEventListener('click', function(e) {
  const dashboard = document.getElementById('dashboard');
  if (dashboard.classList.contains('active') && !dashboard.contains(e.target)) {
    dashboard.classList.remove('active');
    document.getElementById('dashboard-btn').textContent = 'Ver Panel Ejecutivo';
  }
});

// Ejemplo de carga de datos reales
async function loadSurveyData() {
  // Simulación de carga de datos
  const metrics = [
    { name: 'Satisfacción', value: '88%', color: 'var(--success)' },
    { name: 'Recomendación', value: '75%', color: 'var(--accent)' },
    { name: 'Experiencia', value: '92%', color: 'var(--warning)' }
  ];
  
  // Actualizar el dashboard (en un caso real, aquí iría la lógica de carga)
  const metricsContainer = document.querySelector('.metrics-container');
  metricsContainer.innerHTML = metrics.map(metric => `
    <div class="metric-card">
      <h2>${metric.name}</h2>
      <div style="font-size: 2.5rem; color: ${metric.color}">${metric.value}</div>
    </div>
  `).join('');
}

// Cargar datos al abrir el dashboard
document.getElementById('dashboard').addEventListener('DOMNodeInserted', loadSurveyData);
