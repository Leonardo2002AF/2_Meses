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
  const bg = document.querySelector('.hero-bg');
  if (HERO.image && bg) bg.style.backgroundImage =
    `linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.1) 100%),
     linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%),
     url('${HERO.image}')`;

  document.querySelector('.hero-badge').textContent       = HERO.badge;
  document.querySelector('.hero-meta .match').textContent = HERO.match;
  document.querySelector('.hero-meta .year').textContent  = HERO.year;
  document.querySelector('.hero-description').textContent = HERO.description;

  const t = HERO.title;
  const e = HERO.titleEm;
  document.querySelector('.hero-title').innerHTML = t.replace(e, `<em>${e}</em>`);
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
                          style="height:120px;object-fit:cover;"
                          onerror="this.parentElement.innerHTML=buildEmojiThumb('${m.gradient}','${m.emoji}')">`;
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
    card.onclick = () => openModal({
      ...m,
      sub:  `Top ${i + 1} de nuestros favoritos`,
      desc: `Un recuerdo que merece estar en el top 10. Único e irrepetible.`,
    });
    container.appendChild(card);
  });
}

/* ════════════════════
   MODAL DE RECUERDO
   ✅ Usa IDs fijos: modal-play-btn / modal-fav-btn
════════════════════ */
function openModal(card) {
  const session  = (typeof getSession === 'function') ? getSession() : null;
  const isGuest  = session?.guest === true;
  const username = session?.username || null;

  // ── Fondo hero ──
  const heroBg = document.getElementById('modal-hero-bg');
  if (heroBg) {
    heroBg.style.background = card.image
      ? `url(${card.image}) center/cover no-repeat`
      : (card.gradient || 'linear-gradient(135deg,#4a0015,#c0396e)');
  }

  // ── Emoji ──
  const emojiEl = document.getElementById('modal-emoji-inner');
  if (emojiEl) emojiEl.textContent = card.image ? '' : (card.emoji || '💫');

  // ── Título ──
  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = card.title || '';

  // ── Descripción ──
  const descEl = document.getElementById('modal-desc');
  if (descEl) descEl.textContent = card.desc || card.sub || '';

  // ── Área multimedia ──
  const mediaEl = document.getElementById('modal-media');
  if (mediaEl) {
    if (card.video) {
      mediaEl.innerHTML = `
        <video id="modal-video-player"
               src="${card.video}"
               style="width:100%;max-height:280px;border-radius:8px;display:block;"
               controls playsinline preload="metadata">
        </video>`;
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

  // ── Botón REPRODUCIR — pantalla completa para videos ──
  const playBtn = document.getElementById('modal-play-btn');
  if (playBtn) {
    if (card.video) {
      playBtn.style.display = '';
      playBtn.onclick = () => {
        const vid = document.getElementById('modal-video-player');
        if (!vid) return;
        vid.play();
        if      (vid.requestFullscreen)            vid.requestFullscreen();
        else if (vid.webkitRequestFullscreen)      vid.webkitRequestFullscreen();
        else if (vid.webkitEnterFullscreen)        vid.webkitEnterFullscreen();
      };
    } else {
      playBtn.style.display = 'none';
    }
  }

  // ── Botón ME ENCANTA — favoritos ──
  const favBtn = document.getElementById('modal-fav-btn');
  if (favBtn) {
    if (!isGuest && username) {
      favBtn.style.display = '';
      const favKey = `favs_${username}`;
      const favs   = JSON.parse(localStorage.getItem(favKey) || '[]');
      const isFav  = favs.some(f =>
        (f.image || f.video) === (card.image || card.video)
      );
      favBtn.textContent      = isFav ? '💖 En favoritos' : '♥ Me Encanta';
      favBtn.style.background = isFav ? '#c0396e' : '';
      favBtn.onclick          = () => toggleFavorite(card, favBtn);
    } else {
      favBtn.style.display = 'none';
    }
  }

  // ── Abrir modal ──
  const overlay = document.getElementById('modal');
  if (overlay) {
    overlay.classList.add('active');
    overlay.classList.add('open');
  }
  document.body.style.overflow = 'hidden';

function closeModal() {
  const overlay = document.getElementById('modal');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.classList.remove('open');
  }
  document.body.style.overflow = '';
}

/* ════════════════════
   FAVORITOS
════════════════════ */
function toggleFavorite(card, btn) {
  const session = (typeof getSession === 'function') ? getSession() : null;
  if (!session || session.guest) return;

  const favKey = `favs_${session.username}`;
  const favs   = JSON.parse(localStorage.getItem(favKey) || '[]');
  const idx    = favs.findIndex(f =>
    (f.image || f.video) === (card.image || card.video)
  );

  if (idx === -1) {
    favs.push(card);
    localStorage.setItem(favKey, JSON.stringify(favs));
    btn.textContent      = '💖 En favoritos';
    btn.style.background = '#c0396e';
    spawnHearts(null, 6);
  } else {
    favs.splice(idx, 1);
    localStorage.setItem(favKey, JSON.stringify(favs));
    btn.textContent      = '♥ Me Encanta';
    btn.style.background = '';
  }
}

function getFavorites() {
  const session = (typeof getSession === 'function') ? getSession() : null;
  if (!session || session.guest) return [];
  const favKey = `favs_${session.username}`;
  return JSON.parse(localStorage.getItem(favKey) || '[]');
}

function openFavoritesModal() {
  const favs  = getFavorites();
  const grid  = document.getElementById('favs-grid');
  const empty = document.getElementById('favs-empty');
  const modal = document.getElementById('favs-modal');
  if (!grid || !empty || !modal) return;

  grid.innerHTML = '';

  if (favs.length === 0) {
    grid.style.display  = 'none';
    empty.style.display = 'block';
  } else {
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

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
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
  const hearts = ['♥','💖','💗','💕','💓','❤️'];
  const rect   = anchor
    ? anchor.getBoundingClientRect()
    : { left: window.innerWidth / 2 - 40, top: window.innerHeight / 2, width: 80, height: 0 };

  for (let i = 0; i < count; i++) {
    const h       = document.createElement('div');
    h.className   = 'floating-heart';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.cssText = `
      left: ${rect.left + rect.width / 2 + (Math.random() - 0.5) * 80}px;
      top:  ${rect.top  + rect.height / 2}px;
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
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ─── CERRAR MODALES AL HACER CLIC AFUERA ─── */
function initOutsideClose() {
  const dateMod = document.getElementById('date-modal');
  if (dateMod) dateMod.addEventListener('click', e => {
    if (e.target === dateMod) closeDateModal();
  });
  // El modal principal se cierra con su propio botón ✕
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
