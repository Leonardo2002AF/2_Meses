/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Lógica Principal
   Favoritos sincronizados via Firebase
   ══════════════════════════════════════════ */

/* ════════════════════
   FIREBASE — FAVORITOS
   Lee/escribe en /favorites/{username}/
════════════════════ */
function getFavDB() {
  try {
    if (!firebase.apps.length) return null;
    return firebase.database();
  } catch(e) { return null; }
}

/* Cargar favoritos desde Firebase */
async function loadFavoritesFromFirebase(username) {
  const db = getFavDB();
  if (!db) return null;
  try {
    const snap = await db.ref(`favorites/${username}`).once('value');
    const data = snap.val();
    if (!data) return [];
    // Firebase guarda como objeto {key: card} → convertir a array
    return Object.values(data);
  } catch(e) { return null; }
}

/* Guardar favorito en Firebase */
async function addFavoriteToFirebase(username, card) {
  const db = getFavDB();
  if (!db) return false;
  try {
    // Usar URL como clave única (sin caracteres especiales)
    const key = btoa(card.image || card.video || card.title)
      .replace(/[.#$/\[\]]/g, '_').substring(0, 40);
    await db.ref(`favorites/${username}/${key}`).set(card);
    return true;
  } catch(e) { return false; }
}

/* Eliminar favorito de Firebase */
async function removeFavoriteFromFirebase(username, card) {
  const db = getFavDB();
  if (!db) return false;
  try {
    const key = btoa(card.image || card.video || card.title)
      .replace(/[.#$/\[\]]/g, '_').substring(0, 40);
    await db.ref(`favorites/${username}/${key}`).remove();
    return true;
  } catch(e) { return false; }
}

/* Cache local para no recargar Firebase en cada clic */
let _favsCache = {};   // { username: [cards] }
let _favsLoaded = {};  // { username: true }

async function getFavoritesForUser(username) {
  if (_favsLoaded[username]) return _favsCache[username] || [];
  const favs = await loadFavoritesFromFirebase(username);
  if (favs !== null) {
    _favsCache[username]  = favs;
    _favsLoaded[username] = true;
    return favs;
  }
  // Firebase falló → usar localStorage como respaldo
  try {
    return JSON.parse(localStorage.getItem(`favs_${username}`) || '[]');
  } catch(e) { return []; }
}

function invalidateFavsCache(username) {
  _favsLoaded[username] = false;
}

/* ─── CONTADOR DE DÍAS ─── */
const STORAGE_KEY = 'nuestrosRecuerdos_startDate';

function getSavedDate() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

function saveDate(dateStr) {
  localStorage.setItem(STORAGE_KEY, dateStr);
}

function calcDiff(dateStr) {
  const start  = new Date(dateStr + 'T00:00:00');
  const now    = new Date();
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
  if (!el) return;

  if (!dateStr) {
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

  const d    = calcDiff(dateStr);
  const date = new Date(dateStr + 'T00:00:00');
  const opts = { day: 'numeric', month: 'long', year: 'numeric' };
  const since = date.toLocaleDateString('es-ES', opts);

  el.innerHTML = `
    <div class="counter-left">
      <div class="counter-label">💞 Llevamos juntos</div>
      <div class="counter-title">Nuestra <span>Historia de Amor</span></div>
      <div class="counter-subtitle">${d.total.toLocaleString('es-ES')} días de pura felicidad ✨</div>
      <div class="counter-since">
        Desde el <span>${since}</span>
        <button onclick="openDateModal()"
          style="background:none;border:none;color:#555;cursor:pointer;font-size:0.75rem;padding:0 4px;transition:color 0.2s"
          onmouseover="this.style.color='#aaa'" onmouseout="this.style.color='#555'"
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
  if (typeof HERO === 'undefined') { setTimeout(renderHero, 100); return; }

  const bg = document.querySelector('.hero-bg');
  if (HERO.image && bg) {
    bg.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.1) 100%),
                                 linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%),
                                 url('${HERO.image}')`;
  }

  const badgeEl = document.querySelector('.hero-badge');
  if (badgeEl) badgeEl.textContent = HERO.badge || '💫 Recuerdo del Día';

  const matchEl = document.querySelector('.hero-meta .match');
  if (matchEl) matchEl.textContent = HERO.match || '💖 99% Amor';

  const yearEl = document.querySelector('.hero-meta .year');
  if (yearEl) yearEl.textContent = HERO.year || '';

  const descEl = document.querySelector('.hero-description');
  if (descEl) descEl.textContent = HERO.description || '';

  const titleEl = document.querySelector('.hero-title');
  if (titleEl && HERO.title) {
    const t = HERO.title;
    const e = HERO.titleEm || 'Te Vi';
    titleEl.innerHTML = t.replace(e, `<em>${e}</em>`);
  }
}

/* ─── RENDER CARRUSELES ─── */
function renderCarousels() {
  if (typeof SECTIONS === 'undefined') { setTimeout(renderCarousels, 100); return; }

  SECTIONS.forEach(sec => {
    const container = document.getElementById(sec.id);
    if (!container) return;

    sec.items.forEach(m => {
      const card = document.createElement('div');
      card.className = 'card';

      let thumbHTML = '';
      if (m.image) {
        thumbHTML = `<img class="card-thumb-placeholder" src="${m.image}" alt="${m.title}"
                          style="height:120px;object-fit:cover;"
                          onerror="this.parentElement.innerHTML=buildEmojiThumb('${m.gradient}','${m.emoji}')">`;
      } else {
        thumbHTML = `<div class="card-thumb-placeholder" style="background:${m.gradient}">
                       <span style="font-size:2.5rem">${m.emoji}</span>
                     </div>`;
      }

      const fechaHTML = m.fecha ? `<div class="card-date">📅 ${m.fecha}</div>` : '';

      card.innerHTML = `
        ${thumbHTML}
        <div class="card-info">
          <div class="card-title">${m.title}</div>
          <div class="card-sub">${m.sub}</div>
          ${fechaHTML}
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
async function renderTop10() {
  if (typeof getSession !== 'function') { setTimeout(renderTop10, 100); return; }

  const container = document.getElementById('c3');
  if (!container) return;

  const session = getSession();
  const isGuest = session?.guest === true;
  const section = container.closest('.section');

  if (!session || isGuest) {
    if (section) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = '';

  // Cargar desde Firebase
  const favs  = await getFavoritesForUser(session.username);
  const top10 = favs.slice(0, 10);

  container.innerHTML = '';

  if (top10.length === 0) {
    container.innerHTML = `
      <div style="padding:2rem 0;color:#444;font-family:'Lato',sans-serif;
        font-size:0.85rem;text-align:center;width:100%;">
        💔 Aún no tienes favoritos — dale ♥ Me Encanta a tus recuerdos favoritos
      </div>`;
    return;
  }

  top10.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'top10-card';

    let thumbHTML = '';
    if (m.image) {
      thumbHTML = `<img src="${m.image}"
        style="width:100%;height:110px;object-fit:cover;border-radius:6px;display:block;"/>`;
    } else if (m.video) {
      const cloudName = (typeof CLOUDINARY_CLOUD !== 'undefined') ? CLOUDINARY_CLOUD : '';
      const afterUpload = m.video.split('/upload/')[1] || '';
      const pubId = afterUpload.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
      const thumbUrl = `https://res.cloudinary.com/${cloudName}/video/upload/w_300,h_180,c_fill,so_2/${pubId}.jpg`;
      thumbHTML = `
        <div style="position:relative;width:100%;height:110px;border-radius:6px;overflow:hidden;">
          <img src="${thumbUrl}"
               style="width:100%;height:100%;object-fit:cover;display:block;"
               onerror="this.parentElement.style.background='${m.gradient}';this.style.display='none'"/>
        </div>`;
    } else {
      thumbHTML = `<div class="top10-img" style="background:${m.gradient}">${m.emoji}</div>`;
    }

    card.innerHTML = `${thumbHTML}<div class="top10-num">${i + 1}</div>`;
    card.onclick = () => openModal({
      ...m,
      sub:  `Top ${i + 1} de tus favoritos`,
      desc: m.desc || m.sub || 'Un recuerdo que merece estar en el top 10.',
    });
    container.appendChild(card);
  });
}

/* ════════════════════
   MODAL DE RECUERDO
════════════════════ */
async function openModal(card) {
  const session  = (typeof getSession === 'function') ? getSession() : null;
  const isGuest  = session?.guest === true;
  const username = session?.username || null;

  const heroBg = document.getElementById('modal-hero-bg');
  if (heroBg) {
    heroBg.style.background = card.image
      ? `url(${card.image}) center/cover no-repeat`
      : (card.gradient || 'linear-gradient(135deg,#4a0015,#c0396e)');
  }

  const emojiEl = document.getElementById('modal-emoji-inner');
  if (emojiEl) emojiEl.textContent = card.image ? '' : (card.emoji || '💫');

  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = card.title || '';

  const descEl = document.getElementById('modal-desc');
  if (descEl) descEl.textContent = card.desc || card.sub || '';

  const fechaSpan = document.getElementById('modal-year');
  if (fechaSpan) fechaSpan.textContent = card.fecha ? `📅 ${card.fecha}` : '';

  const mediaEl = document.getElementById('modal-media');
  if (mediaEl) {
    if (card.video) {
      mediaEl.innerHTML = `
        <video id="modal-video-player" src="${card.video}"
               style="width:100%;max-height:280px;border-radius:8px;display:block;"
               controls playsinline preload="metadata"></video>`;
    } else if (card.image) {
      mediaEl.innerHTML = `
        <img src="${card.image}" alt="${card.title || ''}"
             style="width:100%;max-height:280px;object-fit:contain;border-radius:8px;display:block;"/>`;
    } else {
      mediaEl.innerHTML = `
        <div style="text-align:center;padding:2rem;color:#555;">
          <span style="font-size:3rem">🎬</span>
          <p style="font-size:0.85rem;margin-top:0.5rem;">Sin contenido multimedia</p>
        </div>`;
    }
  }

  const playBtn = document.getElementById('modal-play-btn');
  if (playBtn) {
    if (card.video) {
      playBtn.style.display = '';
      playBtn.onclick = () => {
        const vid = document.getElementById('modal-video-player');
        if (!vid) return;
        vid.play();
        if (vid.requestFullscreen)           vid.requestFullscreen();
        else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
        else if (vid.webkitEnterFullscreen)   vid.webkitEnterFullscreen();
      };
    } else {
      playBtn.style.display = 'none';
    }
  }

  const favBtn = document.getElementById('modal-fav-btn');
  if (favBtn) {
    if (!isGuest && username) {
      favBtn.style.display = '';

      // Verificar si ya es favorito en Firebase
      const favs  = await getFavoritesForUser(username);
      const isFav = favs.some(f => (f.image || f.video) === (card.image || card.video));

      favBtn.textContent      = isFav ? '💖 En favoritos' : '♥ Me Encanta';
      favBtn.style.background = isFav ? '#c0396e' : '';
      favBtn.onclick          = () => toggleFavorite(card, favBtn);
    } else {
      favBtn.style.display = 'none';
    }
  }

  const overlay = document.getElementById('modal');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

/* ════════════════════
   FAVORITOS — Firebase
════════════════════ */
async function toggleFavorite(card, btn) {
  if (typeof getSession !== 'function') return;

  const session = getSession();
  if (!session || session.guest) return;

  const username = session.username;
  const favs     = await getFavoritesForUser(username);
  const idx      = favs.findIndex(f => (f.image || f.video) === (card.image || card.video));

  if (idx === -1) {
    // ── Agregar ──
    favs.push(card);
    _favsCache[username] = favs;

    btn.textContent      = '💖 En favoritos';
    btn.style.background = '#c0396e';
    spawnHearts(null, 6);

    await addFavoriteToFirebase(username, card);
    // Respaldo localStorage
    try { localStorage.setItem(`favs_${username}`, JSON.stringify(favs)); } catch(e) {}

  } else {
    // ── Quitar ──
    favs.splice(idx, 1);
    _favsCache[username] = favs;

    btn.textContent      = '♥ Me Encanta';
    btn.style.background = '';

    await removeFavoriteFromFirebase(username, card);
    // Respaldo localStorage
    try { localStorage.setItem(`favs_${username}`, JSON.stringify(favs)); } catch(e) {}
  }

  // Refrescar Top 10
  renderTop10();
}

async function getFavorites() {
  if (typeof getSession !== 'function') return [];
  const session = getSession();
  if (!session || session.guest) return [];
  return await getFavoritesForUser(session.username);
}

async function openFavoritesModal() {
  const session = (typeof getSession === 'function') ? getSession() : null;
  if (!session || session.guest) return;

  const grid  = document.getElementById('favs-grid');
  const empty = document.getElementById('favs-empty');
  const modal = document.getElementById('favs-modal');
  if (!grid || !empty || !modal) return;

  // Mostrar loading mientras carga Firebase
  grid.innerHTML    = `<div style="padding:2rem;text-align:center;color:#555;
    font-family:'Lato',sans-serif;font-size:0.85rem;grid-column:1/-1;">
    Cargando favoritos... ⏳</div>`;
  grid.style.display  = 'grid';
  empty.style.display = 'none';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Invalidar cache para obtener datos frescos de Firebase
  invalidateFavsCache(session.username);
  const favs = await getFavoritesForUser(session.username);

  grid.innerHTML = '';

  if (favs.length === 0) {
    grid.style.display  = 'none';
    empty.style.display = 'block';
    return;
  }

  grid.style.display  = 'grid';
  empty.style.display = 'none';

  favs.forEach(card => {
    const el = document.createElement('div');
    el.style.cssText = `cursor:pointer;border-radius:8px;overflow:hidden;
      background:#1a1a1a;border:1px solid #222;transition:border-color 0.2s;`;
    el.onmouseenter = () => el.style.borderColor = '#e50914';
    el.onmouseleave = () => el.style.borderColor = '#222';

    let thumb = '';
    if (card.image) {
      thumb = `<img src="${card.image}"
                    style="width:100%;height:100px;object-fit:cover;display:block;"/>`;
    } else if (card.video) {
      const cloudName   = (typeof CLOUDINARY_CLOUD !== 'undefined') ? CLOUDINARY_CLOUD : '';
      const afterUpload = card.video.split('/upload/')[1] || '';
      const pubId       = afterUpload.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
      const thumbUrl    = `https://res.cloudinary.com/${cloudName}/video/upload/w_300,h_180,c_fill,so_2/${pubId}.jpg`;
      thumb = `
        <div style="position:relative;width:100%;height:100px;overflow:hidden;">
          <img src="${thumbUrl}"
               style="width:100%;height:100px;object-fit:cover;display:block;"
               onerror="this.parentElement.style.background='${card.gradient}';this.style.display='none'"/>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
            <div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.85);
              display:flex;align-items:center;justify-content:center;font-size:0.8rem;">▶</div>
          </div>
        </div>`;
    } else {
      thumb = `<div style="width:100%;height:100px;background:${card.gradient};
        display:flex;align-items:center;justify-content:center;font-size:2rem;">${card.emoji}</div>`;
    }

    el.innerHTML = `
      ${thumb}
      <div style="padding:0.5rem 0.6rem;">
        <div style="font-size:0.78rem;font-weight:700;color:white;font-family:'Lato',sans-serif;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${card.title}</div>
        <div style="font-size:0.65rem;color:#c0396e;font-family:'Lato',sans-serif;margin-top:2px;">💖 Favorito</div>
      </div>`;

    el.onclick = () => {
      closeFavoritesModal();
      setTimeout(() => openModal(card), 200);
    };
    grid.appendChild(el);
  });
}

function closeFavoritesModal() {
  const modal = document.getElementById('favs-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── SCROLL CARRUSEL ─── */
function scrollCarousel(id, dir) {
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: dir * 700, behavior: 'smooth' });
}

/* ─── CORAZONES FLOTANTES ─── */
function spawnHearts(anchor, count = 6) {
  const hearts = ['♥', '💖', '💗', '💕', '💓', '❤️'];
  const rect = anchor
    ? anchor.getBoundingClientRect()
    : { left: window.innerWidth / 2 - 40, top: window.innerHeight / 2, width: 80, height: 0 };

  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className   = 'floating-heart';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.cssText = `
      left: ${rect.left + rect.width / 2 + (Math.random() - 0.5) * 80}px;
      top: ${rect.top + rect.height / 2}px;
      font-size: ${0.8 + Math.random() * 1}rem;
      animation-delay: ${i * 0.12}s;
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
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ─── CERRAR MODALES AL HACER CLIC AFUERA ─── */
function initOutsideClose() {
  const modal   = document.getElementById('modal');
  const dateMod = document.getElementById('date-modal');
  if (modal)   modal.addEventListener('click',   e => { if (e.target === modal)   closeModal(); });
  if (dateMod) dateMod.addEventListener('click', e => { if (e.target === dateMod) closeDateModal(); });
}

/* ─── INIT ─── */
function initApp() {
  renderHero();
  renderCarousels();
  renderTop10();
  updateCounter();
  initNavbar();
  initOutsideClose();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}