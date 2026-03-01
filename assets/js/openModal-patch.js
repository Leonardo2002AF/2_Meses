/* ════════════════════
   OPEN MODAL — versión corregida
   Reemplaza la función openModal existente en app.js
════════════════════ */
function openModal(card) {
  const session  = (typeof getSession === 'function') ? getSession() : null;
  const isGuest  = session?.guest === true;
  const username = session?.username || null;

  // ── Fondo del hero ──
  const heroBg = document.getElementById('modal-hero-bg');
  if (heroBg) {
    heroBg.style.background = card.image
      ? `url(${card.image}) center/cover no-repeat`
      : card.gradient || 'linear-gradient(135deg,#4a0015,#c0396e)';
  }

  // ── Emoji (ocultar si hay imagen) ──
  const emojiEl = document.getElementById('modal-emoji-inner');
  if (emojiEl) {
    emojiEl.textContent = card.image ? '' : (card.emoji || '💫');
  }

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
        <img src="${card.image}" alt="${card.title}"
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
      favBtn.textContent       = isFav ? '💖 En favoritos' : '♥ Me Encanta';
      favBtn.style.background  = isFav ? '#c0396e' : '';
      favBtn.onclick           = () => toggleFavorite(card, favBtn);
    } else {
      favBtn.style.display = 'none';
    }
  }

  // ── Abrir modal ──
  const overlay = document.getElementById('modal');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* ════════════════════
   TOGGLE FAVORITO
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
    if (typeof addHeart === 'function') {
      addHeart({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
    }
  } else {
    favs.splice(idx, 1);
    localStorage.setItem(favKey, JSON.stringify(favs));
    btn.textContent      = '♥ Me Encanta';
    btn.style.background = '';
  }
}

/* ════════════════════
   OBTENER FAVORITOS
════════════════════ */
function getFavorites() {
  const session = (typeof getSession === 'function') ? getSession() : null;
  if (!session || session.guest) return [];
  const favKey = `favs_${session.username}`;
  return JSON.parse(localStorage.getItem(favKey) || '[]');
}

/* ════════════════════
   MODAL FAVORITOS
════════════════════ */
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
        const cloudName    = (typeof CLOUDINARY_CLOUD !== 'undefined') ? CLOUDINARY_CLOUD : '';
        const afterUpload  = card.video.split('/upload/')[1] || '';
        const pubId        = afterUpload.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
        const thumbUrl     = `https://res.cloudinary.com/${cloudName}/video/upload/w_300,h_180,c_fill,so_2/${pubId}.jpg`;
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
