/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Lógica Principal
   ══════════════════════════════════════════ */

/* ─── CONTADOR DE DÍAS ─── */
const STORAGE_KEY = 'nuestrosRecuerdos_startDate';

function getSavedDate() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

function saveDate(dateStr) {
  localStorage.setItem(STORAGE_KEY, dateStr);
}

function calcDiff(dateStr) {
  const start = new Date(dateStr + 'T00:00:00');
  const now   = new Date();
  const diffMs = now - start;
  if (diffMs < 0) return { years: 0, months: 0, days: 0, total: 0 };

  let years  = now.getFullYear() - start.getFullYear();
  let months = now.getMonth()    - start.getMonth();
  let days   = now.getDate()     - start.getDate();

  if (days   < 0) { months--; const prev = new Date(now.getFullYear(), now.getMonth(), 0); days += prev.getDate(); }
  if (months < 0) { years--;  months += 12; }

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return { years, months, days, total: totalDays };
}

function pad(n) { return String(n).padStart(2, '0'); }

function updateCounter() {
  const dateStr = getSavedDate();
  const el      = document.getElementById('counter-section');

  if (!dateStr) {
    // Sin fecha configurada: mostrar CTA
    el.innerHTML = `
      <div class="counter-left">
        <div class="counter-label">💞 Nuestro Contador</div>
        <div class="counter-title">¿Desde cuándo <span>estamos juntos</span>?</div>
        <div class="counter-subtitle">Configura la fecha para ver cuánto tiempo llevamos.</div>
      </div>
      <div class="counter-edit-btn">
        <button class="btn btn-red" onclick="openDateModal()">♥ Configurar Fecha</button>
      </div>
    `;
    return;
  }

  const d      = calcDiff(dateStr);
  const date   = new Date(dateStr + 'T00:00:00');
  const opts   = { day: 'numeric', month: 'long', year: 'numeric' };
  const since  = date.toLocaleDateString('es-ES', opts);

  el.innerHTML = `
    <div class="counter-left">
      <div class="counter-label">💞 Llevamos juntos</div>
      <div class="counter-title">Nuestra <span>Historia de Amor</span></div>
      <div class="counter-subtitle">${d.total.toLocaleString('es-ES')} días de pura felicidad ✨</div>
      <div class="counter-since">
        Desde el <span>${since}</span>
        <button
          onclick="openDateModal()"
          style="background:none;border:none;color:#555;cursor:pointer;font-size:0.75rem;padding:0 4px;transition:color 0.2s"
          onmouseover="this.style.color='#aaa'"
          onmouseout="this.style.color='#555'"
          title="Cambiar fecha">✏️</button>
      </div>
    </div>

    <div class="counter-digits">
      ${d.years > 0 ? `
      <div class="counter-unit">
        <div class="counter-num" id="cnt-years">${pad(d.years)}</div>
        <div class="counter-unit-label">Año${d.years !== 1 ? 's' : ''}</div>
      </div>
      <div class="counter-separator">:</div>
      ` : ''}

      <div class="counter-unit">
        <div class="counter-num" id="cnt-months">${pad(d.months)}</div>
        <div class="counter-unit-label">Mes${d.months !== 1 ? 'es' : ''}</div>
      </div>
      <div class="counter-separator">:</div>

      <div class="counter-unit">
        <div class="counter-num" id="cnt-days">${pad(d.days)}</div>
        <div class="counter-unit-label">Días</div>
      </div>
    </div>
  `;
}

/* ─── MODAL DE FECHA ─── */
function openDateModal() {
  const overlay = document.getElementById('date-modal');
  const input   = document.getElementById('date-input');
  const saved   = getSavedDate();
  if (saved) input.value = saved;
  overlay.classList.add('open');
}

function closeDateModal() {
  document.getElementById('date-modal').classList.remove('open');
}

function saveDateAndClose() {
  const val = document.getElementById('date-input').value;
  if (!val) return;
  saveDate(val);
  closeDateModal();
  updateCounter();
  spawnHearts(document.querySelector('.counter-section'), 8);
}

/* ─── RENDER HERO ─── */
function renderHero() {
  const bg = document.querySelector('.hero-bg');
  if (HERO.image) bg.style.backgroundImage =
    `linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.1) 100%),
     linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%),
     url('${HERO.image}')`;

  document.querySelector('.hero-badge').textContent          = HERO.badge;
  document.querySelector('.hero-meta .match').textContent    = HERO.match;
  document.querySelector('.hero-meta .year').textContent     = HERO.year;
  document.querySelector('.hero-description').textContent    = HERO.description;

  // Título con parte en cursiva rosa
  const t = HERO.title;
  const e = HERO.titleEm;
  document.querySelector('.hero-title').innerHTML =
    t.replace(e, `<em>${e}</em>`);
}

/* ─── RENDER CARRUSELES ─── */
function renderCarousels() {
  SECTIONS.forEach(sec => {
    const container = document.getElementById(sec.id);
    if (!container) return;

    sec.items.forEach(m => {
      const card = document.createElement('div');
      card.className = 'card';

      let thumbHTML = '';
      if (m.image) {
        thumbHTML = `<img class="card-thumb-placeholder" src="${m.image}" alt="${m.title}"
                          style="height:120px;object-fit:cover;" onerror="this.parentElement.innerHTML=buildEmojiThumb('${m.gradient}','${m.emoji}')">`;
      } else {
        thumbHTML = `<div class="card-thumb-placeholder" style="background:${m.gradient}">
                       <span style="font-size:2.5rem">${m.emoji}</span>
                     </div>`;
      }

      card.innerHTML = `
        ${thumbHTML}
        <div class="card-info">
          <div class="card-title">${m.title}</div>
          <div class="card-sub">${m.sub}</div>
        </div>
        <div class="card-overlay"><div class="card-play">▶</div></div>
      `;
      card.onclick = () => openModal(m);
      container.appendChild(card);
    });
  });
}

function buildEmojiThumb(gradient, emoji) {
  return `<div class="card-thumb-placeholder" style="background:${gradient}">
            <span style="font-size:2.5rem">${emoji}</span>
          </div>`;
}

/* ─── RENDER TOP 10 ─── */
function renderTop10() {
  const container = document.getElementById('c3');
  if (!container) return;

  TOP10.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'top10-card';
    card.innerHTML = `
      <div class="top10-img" style="background:${m.gradient}">${m.emoji}</div>
      <div class="top10-num">${i + 1}</div>
    `;
    card.onclick = () => openModal({ ...m, sub: `Top ${i+1} de nuestros favoritos`, desc: `Un recuerdo que merece estar en el top 10. Único e irrepetible.` });
    container.appendChild(card);
  });
}

/* ─── MODAL DE RECUERDO ─── */
function openModal(m) {
  document.getElementById('modal-title').textContent  = m.title;
  document.getElementById('modal-desc').textContent   = m.desc || m.sub || '';
  document.getElementById('modal-emoji-inner').textContent = m.emoji;
  document.getElementById('modal-hero-bg').style.background = m.gradient || '#111';

  // Video o imagen en el modal
  const mediaArea = document.getElementById('modal-media');
  if (m.video) {
    mediaArea.innerHTML = `<video controls src="${m.video}" style="width:100%;height:100%;border-radius:6px;"></video>`;
  } else if (m.image) {
    mediaArea.innerHTML = `<img src="${m.image}" alt="${m.title}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">`;
  } else {
    mediaArea.innerHTML = `<span>🎬</span><p>Agrega aquí tu video o foto del recuerdo</p><small>assets/videos/ · assets/images/cards/</small>`;
  }

  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── SCROLL CARRUSEL ─── */
function scrollCarousel(id, dir) {
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: dir * 700, behavior: 'smooth' });
}

/* ─── CORAZONES FLOTANTES ─── */
function spawnHearts(anchor, count = 6) {
  const hearts = ['♥','💖','💗','💕','💓','❤️'];
  const rect   = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0 };

  for (let i = 0; i < count; i++) {
    const h     = document.createElement('div');
    h.className = 'floating-heart';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.cssText = `
      left: ${rect.left + rect.width/2 + (Math.random()-0.5)*80}px;
      top:  ${rect.top  + rect.height/2}px;
      font-size: ${0.8 + Math.random()*1}rem;
      animation-delay: ${i*0.12}s;
    `;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 2400);
  }
}

function addHeart(e) {
  spawnHearts(e.currentTarget, 7);
}

/* ─── NAVBAR SCROLL ─── */
function initNavbar() {
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ─── CERRAR MODALS AL HACER CLIC AFUERA ─── */
function initOutsideClose() {
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });
  document.getElementById('date-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('date-modal')) closeDateModal();
  });
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  renderHero();
  renderCarousels();
  renderTop10();
  updateCounter();
  initNavbar();
  initOutsideClose();
});
