// Firebase v12: App + Auth + Firestore (CDN ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc,
  onSnapshot, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ⬇️ tu config
const firebaseConfig = {
  apiKey: "AIzaSyAsbtZAiwAS1uDvJfQ9jbJLp2P9Z2LefUc",
  authDomain: "carview-proto.firebaseapp.com",
  projectId: "carview-proto",
  storageBucket: "carview-proto.firebasestorage.app",
  messagingSenderId: "374557512796",
  appId: "1:374557512796:web:582e6e72c1db49d9e78299",
  measurementId: "G-SRVQ66GBEF"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// login anónimo (necesario para las reglas)
signInAnonymously(auth).catch(err => console.error("[Auth]", err));

// cuando estemos logueados, arranca el resto de tu app (lo que ya te pasé)
onAuthStateChanged(auth, user => {
  if (!user) return;
  // …aquí sigue tu código existente que:
  // - hace onSnapshot(query(collection(db,'posts'), orderBy('createdAt','desc')))
  // - usa addDoc/deleteDoc para crear/eliminar encuestas
});


/* =========================
   Firebase (ESM desde CDN)
   ========================= */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import {
  getFirestore, collection, addDoc, deleteDoc, doc,
  onSnapshot, serverTimestamp, query, orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

/* 👉 Reemplaza con tu configuración de Firebase */
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const postsCol   = collection(db, 'posts');
const postsQuery = query(postsCol, orderBy('createdAt','desc'));

/* =========================
   App
   ========================= */
if (window.__carviewInit) {
  // evita doble carga si se inserta el script más de una vez
} else {
  window.__carviewInit = true;

  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const feedItems  = $('#feedItems');
  const surveyForm = $('#surveyForm');

  /* ========= Toast ========= */
  function showToast(msg, ms=2200){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    getComputedStyle(t).opacity;
    t.classList.add('show');
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 250); }, ms);
  }

  /* ========= Flujo básico ========= */
  if (window.innerWidth <= 980) {
    document.getElementById('intro')?.scrollIntoView({behavior:'auto', block:'start'});
  }
  $('#startProto')?.addEventListener('click', () => {
    $('#protoWrap')?.classList.remove('is-hidden-mobile');
    $('#survey')?.classList.add('is-hidden-mobile');
    $('#iphone-home')?.scrollIntoView({ behavior:'smooth', block:'start', inline:'center' });
  });
  $('#btnStartSurvey')?.addEventListener('click', () => {
    $('#survey')?.classList.remove('is-hidden-mobile');
    $('#survey')?.scrollIntoView({ behavior:'smooth', block:'start' });
  });

  /* ========= Puntos verdes en cards ========= */
  $$('.card.js-open-detail .thumb').forEach(t=>{
    if (!t.querySelector('.hot-dot')) {
      const dot = document.createElement('span');
      dot.className = 'hot-dot';
      dot.setAttribute('aria-hidden','true');
      t.appendChild(dot);
    }
  });

  /* ========= iPhone: detalle y Regresar (sin duplicados) ========= */
  const detailPhone = $('#iphone-detail');
  const backBtn     = $('#backBtn');
  const dImg   = $('#d-img');
  const dTitle = $('#d-title');
  const dPrice = $('#d-price');
  const dLoc   = $('#d-location');
  const dKm    = $('#d-km');

  function hideCoaches(){ ['coach1','coach2'].forEach(id=>{ const el = document.getElementById(id); if(el) el.style.display='none'; }); }

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

  $$('.proto-disabled').forEach(el => el.addEventListener('click', ()=>showToast('Botón no disponible en prototipo de app')));

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
    exitSelectionMode();
    showToast('Comparación demo generada.');
  });
  $$('.select-box, .car-select').forEach(el=>{
    ['click','mousedown','touchstart'].forEach(evt=>{
      el.addEventListener(evt, ev=>ev.stopPropagation(), {passive:true});
    });
  });
  $$('.car-select').forEach(cb => cb.addEventListener('change', updateCompareUI));

  /* ========= Encuesta + Foro — FIRESTORE REALTIME ========= */
  const likertLogo   = $('#logoScore');
  const logoHidden   = surveyForm?.elements['logo'];
  const likertEase   = $('#easeScore');
  const easeHidden   = surveyForm?.elements['ease'];
  const help         = $('#helpScore');
  const helpHidden   = surveyForm?.elements['help'];

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

  // Render helpers
  const createPostEl = (d) => {
    const div = document.createElement('div');
    div.className = 'post';
    div.dataset.id = d.id;
    div.innerHTML = `
      <div class="post-head">
        <div>
          <span class="name">Usuario ${escapeHTML(d.nombre)}</span>
          <span class="tag">ha subido la encuesta</span>
        </div>
        <button class="post-delete" aria-label="Eliminar encuesta">Eliminar</button>
      </div>
      <div class="post-body">
        <div>🎓 <b>Estudiante que te compartió la encuesta:</b> ${escapeHTML(d.recomendo)}</div>
        <div>📢 <b>Contacto:</b> No es necesario (proyecto universitario).</div>
        <div>⭐ <b>Atractivo(s):</b> ${d.atractivos?.length ? d.atractivos.map(escapeHTML).join(', ') : '—'}</div>
        ${ d.plan ? `<div>📦 <b>Plan elegido:</b> ${escapeHTML(d.plan)}</div>` : '' }
        <div>💎 <b>Presupuesto Pro (mensual):</b> ${escapeHTML(d.premium || '—')}</div>
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
    return div;
  };

  const renderPosts = (arr) => {
    if (!feedItems) return;
    feedItems.innerHTML = '';
    arr.forEach(p => feedItems.appendChild(createPostEl(p)));
  };

  // 🔔 suscripción en tiempo real: todos los dispositivos ven cambios al instante
  onSnapshot(postsQuery, (snap) => {
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderPosts(posts);
  });

  // Crear encuesta
  async function appendPost(d){
    await addDoc(postsCol, { ...d, createdAt: serverTimestamp() });
  }

  // Enviar formulario
  surveyForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if (!surveyForm.reportValidity()) return;

    const nombre      = surveyForm.elements['nombre'].value.trim();
    const recomendo   = surveyForm.elements['recomendo'].value;
    const atractivos  = [...surveyForm.querySelectorAll('input[name="atractivo"]:checked')].map(i=>i.value);
    const plan        = (surveyForm.elements['plan_import']?.value) || '';
    const premium     = (surveyForm.elements['pro_price']?.value) || '';
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

    await appendPost({ nombre, recomendo, atractivos, plan, premium, featuresAdd, featuresExt, logo, ease: easeScore, help: helpScore, sugerencia });

    showToast('¡Gracias por su ayuda!');

    // Reset visual
    surveyForm.reset();
    surveyForm.elements['logo'].value = '3';
    $('#logoScore')?.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.v==='3'));
    surveyForm.elements['ease'].value = '3';
    $('#easeScore')?.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.v==='3'));
    surveyForm.elements['help'].value = '3';
    $('#helpScore')?.querySelectorAll('button').forEach(b=>b.classList.toggle('active', b.dataset.v==='3'));
  });

  // Eliminar encuesta (delegación)
  feedItems?.addEventListener('click', async (e) => {
    const del = e.target.closest('.post-delete');
    if (!del) return;
    const card = del.closest('.post');
    const id = card?.dataset.id;
    if (!id) return;
    await deleteDoc(doc(db, 'posts', id));
    showToast('Encuesta eliminada.');
  });

  // Asegurar bolita en “Comenzar encuesta”
  (function ensureStartSurveyDot(){
    const b = document.getElementById('btnStartSurvey');
    if (b && !b.querySelector('.hot-indicator')) {
      const dot = document.createElement('span');
      dot.className = 'hot-indicator';
      dot.setAttribute('aria-hidden','true');
      b.appendChild(dot);
    }
  })();
}
