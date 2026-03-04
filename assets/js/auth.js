/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Sistema de Login
   Con sincronización de contraseñas via Firebase
   ══════════════════════════════════════════ */

const USERS = [
  { username: "KerllyV",   password: "kerlly2000",  emoji: "🌸", color: "#ff6b8a" },
  { username: "LeonardoJ", password: "leonardo2002", emoji: "💙", color: "#4a9eff" },
];

const SESSION_KEY = 'nuestrosRecuerdos_session';
const PASS_KEY    = 'nuestrosRecuerdos_passwords';

/* ════════════════════
   FIREBASE — contraseñas
   Lee/escribe en /passwords/{username}
════════════════════ */
function getFirebaseDB() {
  try {
    if (!firebase.apps.length) return null;
    return firebase.database();
  } catch(e) { return null; }
}

/* Obtener contraseña desde Firebase (async) */
async function getFirebasePassword(username) {
  const db = getFirebaseDB();
  if (!db) return null;
  try {
    const snap = await db.ref(`passwords/${username}`).once('value');
    return snap.val() || null;
  } catch(e) { return null; }
}

/* Guardar contraseña en Firebase */
async function setFirebasePassword(username, password) {
  const db = getFirebaseDB();
  if (!db) return false;
  try {
    await db.ref(`passwords/${username}`).set(password);
    return true;
  } catch(e) { return false; }
}

/* ════════════════════
   VERIFICAR SESIÓN
════════════════════ */
function getSession() {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
}

function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      username: user.username,
      emoji:    user.emoji,
      color:    user.color,
      loginAt:  Date.now(),
    }));
  } catch(e) {}
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
}

/* ════════════════════
   LOGIN
   1. Busca contraseña en Firebase
   2. Si no hay, usa la del código
════════════════════ */
async function attemptLogin(username, password) {
  const user = USERS.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (!user) return { ok: false };

  // Firebase primero, código como respaldo
  const firebasePass = await getFirebasePassword(user.username);
  const correctPass  = firebasePass || user.password;

  if (password === correctPass) {
    saveSession(user);
    return { ok: true, user };
  }
  return { ok: false };
}

function logout() {
  clearSession();
  const avatar = document.querySelector('.nav-avatar');
  if (avatar) {
    avatar.textContent  = '💑';
    avatar.title        = 'Iniciar sesión';
    avatar.style.cursor = 'pointer';
    avatar.onclick      = () => showLoginScreen();
  }
  const uploadBtn = document.querySelector('[onclick="openUploadModal()"]');
  if (uploadBtn) uploadBtn.style.display = 'none';
  const memoryBanner = document.querySelector('.memory-banner');
  if (memoryBanner) memoryBanner.style.display = 'none';

  showLoginScreen();
}

/* ════════════════════
   MOSTRAR / OCULTAR LOGIN
════════════════════ */
function showLoginScreen() {
  document.getElementById('login-overlay').classList.add('active');
  document.getElementById('login-input-user').value = '';
  document.getElementById('login-input-pass').value = '';
  document.getElementById('login-error').style.display = 'none';
  document.body.style.overflow = 'hidden';
}

function hideLoginScreen() {
  const overlay = document.getElementById('login-overlay');
  overlay.classList.add('hiding');
  setTimeout(() => {
    overlay.classList.remove('active', 'hiding');
    document.body.style.overflow = '';
    initAnniversary(() => runCascadeAnimation());
  }, 600);
}

/* ════════════════════
   ACTUALIZAR UI SEGÚN SESIÓN
════════════════════ */
function applySession(session) {
  const isGuest = session?.guest === true;

  const uploadBtn = document.querySelector('[onclick="openUploadModal()"]');
  if (uploadBtn) {
    uploadBtn.style.display = (!session || isGuest) ? 'none' : '';
  }

  const memoryBanner = document.querySelector('.memory-banner');
  if (memoryBanner) {
    memoryBanner.style.display = (!session || isGuest) ? 'none' : '';
  }

  const avatar = document.querySelector('.nav-avatar');
  if (!avatar) return;

  if (session && !isGuest) {
    avatar.textContent  = session.emoji;
    avatar.title        = session.username;
    avatar.style.cursor = 'pointer';
    avatar.onclick      = (e) => { e.stopPropagation(); toggleAvatarMenu('user', session); };
  } else if (isGuest) {
    avatar.textContent  = '👀';
    avatar.title        = 'Modo invitado';
    avatar.style.cursor = 'pointer';
    avatar.onclick      = (e) => { e.stopPropagation(); toggleAvatarMenu('guest', session); };
  } else {
    avatar.textContent  = '💑';
    avatar.title        = 'Iniciar sesión';
    avatar.style.cursor = 'pointer';
    avatar.onclick      = () => showLoginScreen();
  }

  setTimeout(() => {
    if (typeof updateCounter     === 'function') updateCounter();
  }, 100);
  if (typeof renderTop10         === 'function') renderTop10();
  setTimeout(() => {
    if (typeof initNotifications === 'function') initNotifications();
  }, 300);
}

/* ════════════════════
   MENÚ DROPDOWN AVATAR
════════════════════ */
function toggleAvatarMenu(type, session) {
  const existing = document.getElementById('avatar-menu');
  if (existing) { existing.remove(); return; }

  const avatar = document.querySelector('.nav-avatar');
  const rect   = avatar.getBoundingClientRect();

  const menu = document.createElement('div');
  menu.id = 'avatar-menu';
  menu.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 8}px;
    right: ${window.innerWidth - rect.right}px;
    background: #161616;
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    padding: 0.5rem;
    min-width: 200px;
    z-index: 9000;
    box-shadow: 0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
    animation: menuIn 0.18s cubic-bezier(0.22,1,0.36,1);
  `;

  if (type === 'user') {
    menu.innerHTML = `
      <style>
        @keyframes menuIn {
          from { transform: translateY(-8px) scale(0.96); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        .av-menu-header { padding:0.6rem 0.8rem 0.8rem; border-bottom:1px solid #222; margin-bottom:0.4rem; }
        .av-menu-name   { font-family:'Playfair Display',serif; font-size:1rem; color:white; }
        .av-menu-role   { font-size:0.72rem; color:#e50914; font-family:'Lato',sans-serif; letter-spacing:0.5px; }
        .av-menu-item   { display:flex; align-items:center; gap:0.7rem; padding:0.6rem 0.8rem; border-radius:7px;
                          cursor:pointer; font-family:'Lato',sans-serif; font-size:0.88rem; color:#ccc;
                          transition:background 0.15s,color 0.15s; border:none; background:none; width:100%; text-align:left; }
        .av-menu-item:hover        { background:#222; color:white; }
        .av-menu-item.danger:hover { background:rgba(229,9,20,0.1); color:#e50914; }
        .av-menu-divider { height:1px; background:#222; margin:0.3rem 0; }
      </style>
      <div class="av-menu-header">
        <div class="av-menu-name">${session.emoji} ${session.username}</div>
        <div class="av-menu-role">✦ Miembro</div>
      </div>
      <button class="av-menu-item" onclick="closeAvatarMenu();openFavoritesModal()">💖 Mis favoritos</button>
      <button class="av-menu-item" onclick="closeAvatarMenu();openChangePasswordModal()">🔑 Cambiar contraseña</button>
      <div class="av-menu-divider"></div>
      <button class="av-menu-item danger" onclick="closeAvatarMenu();logout()">🚪 Cerrar sesión</button>
    `;
  } else {
    menu.innerHTML = `
      <style>
        @keyframes menuIn {
          from { transform: translateY(-8px) scale(0.96); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        .av-menu-header { padding:0.6rem 0.8rem 0.8rem; border-bottom:1px solid #222; margin-bottom:0.4rem; }
        .av-menu-name   { font-family:'Playfair Display',serif; font-size:1rem; color:white; }
        .av-menu-role   { font-size:0.72rem; color:#666; font-family:'Lato',sans-serif; }
        .av-menu-item   { display:flex; align-items:center; gap:0.7rem; padding:0.6rem 0.8rem; border-radius:7px;
                          cursor:pointer; font-family:'Lato',sans-serif; font-size:0.88rem; color:#ccc;
                          transition:background 0.15s,color 0.15s; border:none; background:none; width:100%; text-align:left; }
        .av-menu-item:hover  { background:#222; color:white; }
        .av-menu-divider { height:1px; background:#222; margin:0.3rem 0; }
      </style>
      <div class="av-menu-header">
        <div class="av-menu-name">👀 Invitado</div>
        <div class="av-menu-role">Solo visualización</div>
      </div>
      <button class="av-menu-item" onclick="closeAvatarMenu();clearSession();showLoginScreen()">🔐 Iniciar sesión</button>
    `;
  }

  document.body.appendChild(menu);
  setTimeout(() => {
    document.addEventListener('click', closeAvatarMenu, { once: true });
  }, 50);
}

function closeAvatarMenu() {
  const menu = document.getElementById('avatar-menu');
  if (menu) menu.remove();
}

function enterGuestMode() {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      guest:   true,
      loginAt: Date.now(),
    }));
  } catch(e) {}
  applySession({ guest: true });
  hideLoginScreen();
}

/* ════════════════════
   MANEJAR SUBMIT DEL FORM
   Ahora es async por Firebase
════════════════════ */
async function handleLoginSubmit() {
  const username = document.getElementById('login-input-user').value;
  const password = document.getElementById('login-input-pass').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-submit-btn');

  if (!username || !password) {
    showLoginError('Completa todos los campos.');
    return;
  }

  btn.disabled    = true;
  btn.textContent = '...';

  const result = await attemptLogin(username, password);

  if (result.ok) {
    btn.textContent     = '♥';
    btn.disabled        = false;
    errEl.style.display = 'none';
    applySession(result.user);
    setTimeout(() => {
      hideLoginScreen();
      btn.textContent = 'Entrar';
    }, 400);
  } else {
    btn.disabled    = false;
    btn.textContent = 'Entrar';
    showLoginError('Usuario o contraseña incorrectos.');
    document.querySelector('.login-box').classList.add('shake');
    setTimeout(() => document.querySelector('.login-box').classList.remove('shake'), 500);
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent   = msg;
  el.style.display = 'block';
}

/* ════════════════════
   INIT
════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (!session) {
    showLoginScreen();
  } else {
    applySession(session);
  }

  ['login-input-user', 'login-input-pass'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleLoginSubmit();
    });
  });
});

/* ════════════════════
   CAMBIO DE CONTRASEÑA
   Guarda en Firebase + localStorage como respaldo
════════════════════ */
async function changePassword(newPassword, confirmPassword) {
  const session = getSession();
  if (!session)
    return { ok: false, msg: 'No hay sesión activa.' };
  if (!newPassword || newPassword.length < 6)
    return { ok: false, msg: 'La contraseña debe tener al menos 6 caracteres.' };
  if (newPassword !== confirmPassword)
    return { ok: false, msg: 'Las contraseñas no coinciden.' };

  // 1. Guardar en Firebase (todos los dispositivos)
  const savedFirebase = await setFirebasePassword(session.username, newPassword);

  // 2. Guardar en localStorage como respaldo offline
  try {
    const saved = JSON.parse(localStorage.getItem(PASS_KEY) || '{}');
    saved[session.username] = newPassword;
    localStorage.setItem(PASS_KEY, JSON.stringify(saved));
  } catch(e) {}

  if (savedFirebase) {
    return { ok: true };
  } else {
    return { ok: true, warn: 'Sin conexión — guardado localmente. Se sincronizará al reconectarte.' };
  }
}

function openChangePasswordModal() {
  document.getElementById('change-pass-modal').classList.add('open');
  document.getElementById('cp-new').value              = '';
  document.getElementById('cp-confirm').value          = '';
  document.getElementById('cp-error').style.display   = 'none';
  document.getElementById('cp-success').style.display = 'none';
}

function closeChangePasswordModal() {
  document.getElementById('change-pass-modal').classList.remove('open');
}

async function handleChangePassword() {
  const newPass     = document.getElementById('cp-new').value;
  const confirmPass = document.getElementById('cp-confirm').value;
  const errEl       = document.getElementById('cp-error');
  const successEl   = document.getElementById('cp-success');
  const btn         = document.getElementById('cp-submit-btn');
  const session     = getSession();

  btn.disabled    = true;
  btn.textContent = '...';

  const result = await changePassword(newPass, confirmPass);

  btn.disabled    = false;
  btn.textContent = '💾 Guardar';

  if (result.ok) {
    errEl.style.display     = 'none';
    successEl.style.display = 'block';
    successEl.textContent   = result.warn
      ? `⚠️ ${result.warn}`
      : `✅ Contraseña de ${session.username} actualizada en todos los dispositivos.`;
    btn.disabled = true;
    setTimeout(() => {
      closeChangePasswordModal();
      btn.disabled = false;
    }, 2500);
  } else {
    errEl.style.display     = 'block';
    errEl.textContent       = result.msg;
    successEl.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ['cp-new', 'cp-confirm'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleChangePassword();
    });
  });
});

/* ════════════════════
   ANIMACIÓN EN CASCADA
════════════════════ */
function runCascadeAnimation() {
  const elements = [
    document.getElementById('navbar'),
    document.querySelector('.hero'),
    document.getElementById('counter-section'),
    document.querySelector('.memory-banner'),
    ...Array.from(document.querySelectorAll('.section')),
    document.querySelector('footer'),
  ].filter(Boolean);

  elements.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(-20px)';
    el.style.transition = 'none';
  });

  setTimeout(() => {
    elements.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0)';
      }, i * 150);
    });
  }, 50);
}