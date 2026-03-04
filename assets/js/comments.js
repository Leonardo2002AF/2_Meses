/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Comentarios
   localStorage (inmediato) + Firebase (sync)
   ══════════════════════════════════════════ */

const COMMENT_EMOJIS = ['❤️','😂','😢','😍','🔥','👏','🥰','💖'];
const ADMIN_USER     = 'LeonardoJ';

/* ─── ID por título ─── */
function getRecuerdoId(card) {
  return (card.title || 'recuerdo')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 40);
}

/* ─── Leer comentarios (Firebase primero, localStorage como respaldo) ─── */
async function getComments(rid) {
  try {
    const snap = await firebase.database()
      .ref(`comments/${rid}`)
      .orderByChild('ts')
      .once('value');
    const comments = [];
    snap.forEach(child => comments.push({ key: child.key, ...child.val() }));
    localStorage.setItem(`comments_${rid}`, JSON.stringify(comments));
    return comments;
  } catch(e) {
    try { return JSON.parse(localStorage.getItem(`comments_${rid}`) || '[]'); }
    catch(e2) { return []; }
  }
}

/* ─── Leer comentarios solo desde localStorage ─── */
function getCommentsLocal(rid) {
  try { return JSON.parse(localStorage.getItem(`comments_${rid}`) || '[]'); }
  catch(e) { return []; }
}

/* ════════════════════
   RENDERIZAR SECCIÓN
════════════════════ */
async function renderCommentsSection(card, containerEl) {
  const session  = (typeof getSession === 'function') ? getSession() : null;
  const isGuest  = session?.guest === true;
  const username = session?.username || null;
  const isAdmin  = username === ADMIN_USER;
  const rid      = getRecuerdoId(card);

  containerEl.innerHTML = `
    <div class="comments-section">
      <div class="comments-title">💬 Comentarios</div>
      <div class="comments-list" id="comments-list-${rid}"></div>
      ${!isGuest && username ? `
        <div class="comment-input-wrap">
          <div class="comment-emoji-row" id="comment-emoji-row-${rid}"></div>
          <div class="comment-input-row">
            <textarea class="comment-input" id="comment-input-${rid}"
              placeholder="Escribe algo bonito... 💖" rows="1"
              oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
            <button class="comment-send-btn" id="comment-send-btn-${rid}"
              onclick="sendComment('${rid}', '${username}')">
              Enviar ♥
            </button>
          </div>
        </div>
      ` : `<div class="comments-empty">Inicia sesión para comentar.</div>`}
    </div>
  `;

  // Emojis
  const emojiRow = document.getElementById(`comment-emoji-row-${rid}`);
  if (emojiRow) {
    COMMENT_EMOJIS.forEach(emoji => {
      const btn = document.createElement('button');
      btn.className   = 'comment-emoji-opt';
      btn.textContent = emoji;
      btn.type        = 'button';
      btn.onclick     = () => {
        const input = document.getElementById(`comment-input-${rid}`);
        if (input) { input.value += emoji; input.focus(); }
      };
      emojiRow.appendChild(btn);
    });
  }

  // Mostrar localStorage inmediatamente
  // renderCommentListFromData(rid, getCommentsLocal(rid), isAdmin, username);

  // Luego sincronizar con Firebase
  // Cargar SOLO desde Firebase, sin localStorage
  try {
    const snap = await firebase.database()
      .ref(`comments/${rid}`)
      .orderByChild('ts')
      .once('value');
    const comments = [];
    snap.forEach(child => comments.push({ key: child.key, ...child.val() }));
    console.log('Firebase comments:', comments.length);
    renderCommentListFromData(rid, comments, isAdmin, username);
  } catch(e) {
    console.warn('Error:', e);
  }
}

/* ─── Renderizar lista desde datos ─── */
function renderCommentListFromData(rid, comments, isAdmin, username) {
  const list = document.getElementById(`comments-list-${rid}`);
  if (!list) return;

  console.log('Comentarios:', comments.length);
  list.innerHTML = '';

  if (comments.length === 0) {
    list.innerHTML = '<div class="comments-empty">Sé el primero en comentar 💖</div>';
    return;
  }

  comments.forEach(c => list.appendChild(buildCommentEl(c, rid, isAdmin, username)));
  list.scrollTop = list.scrollHeight;
}

/* ─── Enviar comentario ─── */
function sendComment(rid, username) {
  const input = document.getElementById(`comment-input-${rid}`);
  const btn   = document.getElementById(`comment-send-btn-${rid}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  btn.disabled = true;

  const newComment = {
    key:    Date.now().toString(),
    author: username,
    text:   text,
    ts:     Date.now(),
  };

  // Guardar en localStorage inmediatamente y mostrar
  const comments = getCommentsLocal(rid);
  comments.push(newComment);
  localStorage.setItem(`comments_${rid}`, JSON.stringify(comments));

  const session = (typeof getSession === 'function') ? getSession() : null;
  const isAdmin = session?.username === ADMIN_USER;
  renderCommentListFromData(rid, comments, isAdmin, username);

  // Guardar en Firebase en segundo plano
  firebase.database().ref(`comments/${rid}`).push({
    author: username,
    text:   text,
    ts:     newComment.ts,
  }).catch(e => console.warn('Firebase error:', e));

  input.value        = '';
  input.style.height = 'auto';
  btn.disabled = false;
  input.focus();
}

/* ─── Enter para enviar ─── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    const active = document.activeElement;
    if (active && active.classList.contains('comment-input')) {
      e.preventDefault();
      const rid      = active.id.replace('comment-input-', '');
      const session  = (typeof getSession === 'function') ? getSession() : null;
      const username = session?.username;
      if (username) sendComment(rid, username);
    }
  }
});

/* ─── Eliminar comentario ─── */
async function deleteComment(rid, commentKey) {
  const session = (typeof getSession === 'function') ? getSession() : null;
  if (!session || session.username !== ADMIN_USER) return;

  // Eliminar de localStorage
  const comments = getCommentsLocal(rid).filter(c => c.key !== commentKey);
  localStorage.setItem(`comments_${rid}`, JSON.stringify(comments));

  // Eliminar de Firebase
  try {
    await firebase.database().ref(`comments/${rid}/${commentKey}`).remove();
  } catch(e) { console.warn('Firebase delete error:', e); }

  renderCommentListFromData(rid, comments, true, session.username);
}

/* ─── Construir elemento ─── */
function buildCommentEl(c, rid, isAdmin, currentUser) {
  const item = document.createElement('div');
  item.className = 'comment-item';

  const timeAgo     = formatCommentTime(c.ts);
  const authorEmoji = c.author === 'KerllyV' ? '🌸' : '💙';

  item.innerHTML = `
    <div class="comment-header">
      <span class="comment-author">${authorEmoji} ${c.author}</span>
      <div style="display:flex;align-items:center;gap:0.4rem;">
        <span class="comment-time">${timeAgo}</span>
        ${isAdmin ? `<button class="comment-delete-btn" title="Eliminar"
          onclick="deleteComment('${rid}', '${c.key}')">🗑️</button>` : ''}
      </div>
    </div>
    <div class="comment-text">${escapeHTML(c.text)}</div>
  `;

  return item;
}

/* ─── Helpers ─── */
function formatCommentTime(ts) {
  const diff = Date.now() - ts;
  const m    = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const d    = Math.floor(diff / 86400000);
  if (m < 1)  return 'Ahora';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 7)  return `${d}d`;
  return new Date(ts).toLocaleDateString('es-ES', { day:'numeric', month:'short' });
}

function escapeHTML(str) {
  return (str || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/\n/g,'<br>');
}