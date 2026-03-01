/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Sistema de Login
   ══════════════════════════════════════════ */

const USERS = [
  { username: "KerllyV",   password: "kerlly2000",  emoji: "🌸", color: "#ff6b8a" },
  { username: "LeonardoJ", password: "leonardo2002", emoji: "💙", color: "#4a9eff" },
];

const SESSION_KEY = 'nuestrosRecuerdos_session';

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
════════════════════ */
function attemptLogin(username, password) {
  const user = USERS.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase()
      && u.password === password
  );
  if (user) {
    saveSession(user);
    return { ok: true, user };
  }
  return { ok: false };
}

function logout() {
  clearSession();
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
  }, 600);
}

/* ════════════════════
   ACTUALIZAR UI SEGÚN SESIÓN
════════════════════ */
function applySession(session) {
  const isGuest = session?.guest === true;

  // Botón de subida
  const uploadBtn = document.querySelector('[onclick="openUploadModal()"]');
  if (uploadBtn) {
    uploadBtn.style.display = (!session || isGuest) ? 'none' : '';
  }

  // Banner álbum
  const memoryBanner = document.querySelector('.memory-banner');
  if (memoryBanner) {
    memoryBanner.style.display = (!session || isGuest) ? 'none' : '';
  }

  // Avatar
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
}

/* ════════════════════
   MENÚ DROPDOWN AVATAR
════════════════════ */
function toggleAvatarMenu(type, session) {
  // Eliminar menú existente si ya hay uno
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
        .av-menu-header {
          padding: 0.6rem 0.8rem 0.8rem;
          border-bottom: 1px solid #222;
          margin-bottom: 0.4rem;
        }
        .av-menu-name {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          color: white;
        }
        .av-menu-role {
          font-size: 0.72rem;
          color: #e50914;
          font-family: 'Lato', sans-serif;
          letter-spacing: 0.5px;
        }
        .av-menu-item {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.6rem 0.8rem;
          border-radius: 7px;
          cursor: pointer;
          font-family: 'Lato', sans-serif;
          font-size: 0.88rem;
          color: #ccc;
          transition: background 0.15s, color 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .av-menu-item:hover { background: #222; color: white; }
        .av-menu-item.danger:hover { background: rgba(229,9,20,0.1); color: #e50914; }
        .av-menu-divider { height: 1px; background: #222; margin: 0.3rem 0; }
      </style>
      <div class="av-menu-header">
        <div class="av-menu-name">${session.emoji} ${session.username}</div>
        <div class="av-menu-role">✦ Miembro</div>
      </div>
      <button class="av-menu-item" onclick="closeAvatarMenu();openChangePasswordModal()">
        🔑 Cambiar contraseña
      </button>
      <div class="av-menu-divider"></div>
      <button class="av-menu-item danger" onclick="closeAvatarMenu();logout()">
        🚪 Cerrar sesión
      </button>
    `;
  } else {
    menu.innerHTML = `
      <style>
        @keyframes menuIn {
          from { transform: translateY(-8px) scale(0.96); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        .av-menu-header {
          padding: 0.6rem 0.8rem 0.8rem;
          border-bottom: 1px solid #222;
          margin-bottom: 0.4rem;
        }
        .av-menu-name {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          color: white;
        }
        .av-menu-role {
          font-size: 0.72rem;
          color: #666;
          font-family: 'Lato', sans-serif;
        }
        .av-menu-item {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.6rem 0.8rem;
          border-radius: 7px;
          cursor: pointer;
          font-family: 'Lato', sans-serif;
          font-size: 0.88rem;
          color: #ccc;
          transition: background 0.15s, color 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .av-menu-item:hover { background: #222; color: white; }
        .av-menu-divider { height: 1px; background: #222; margin: 0.3rem 0; }
      </style>
      <div class="av-menu-header">
        <div class="av-menu-name">👀 Invitado</div>
        <div class="av-menu-role">Solo lectura</div>
      </div>
      <button class="av-menu-item" onclick="closeAvatarMenu();clearSession();showLoginScreen()">
        🔐 Iniciar sesión
      </button>
    `;
  }

  document.body.appendChild(menu);

  // Cerrar al hacer clic fuera
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
════════════════════ */
function handleLoginSubmit() {
  const username = document.getElementById('login-input-user').value;
  const password = document.getElementById('login-input-pass').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-submit-btn');

  if (!username || !password) {
    showLoginError('Completa todos los campos.');
    return;
  }

  // Animación de carga
  btn.disabled    = true;
  btn.textContent = '...';

  setTimeout(() => {
    const result = attemptLogin(username, password);
    if (result.ok) {
      btn.textContent = '♥';
      errEl.style.display = 'none';
      applySession(result.user);
      setTimeout(() => hideLoginScreen(), 400);
    } else {
      btn.disabled    = false;
      btn.textContent = 'Entrar';
      showLoginError('Usuario o contraseña incorrectos.');
      // Shake animation
      document.querySelector('.login-box').classList.add('shake');
      setTimeout(() => document.querySelector('.login-box').classList.remove('shake'), 500);
    }
  }, 600);
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent    = msg;
  el.style.display  = 'block';
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

  // Enter key en los inputs
  ['login-input-user', 'login-input-pass'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleLoginSubmit();
    });
  });
});
/* ════════════════════
   CAMBIO DE CONTRASEÑA
════════════════════ */
const PASS_KEY = 'nuestrosRecuerdos_passwords';

function getSavedPasswords() {
  try {
    return JSON.parse(localStorage.getItem(PASS_KEY) || '{}');
  } catch(e) { return {}; }
}

function getUserPassword(username) {
  const saved = getSavedPasswords();
  // Si tiene contraseña guardada la usa, si no la del código
  const defaultUser = USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
  return saved[username] || defaultUser?.password || '';
}

// Sobrescribir attemptLogin para usar contraseña guardada
function attemptLogin(username, password) {
  const user = USERS.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (!user) return { ok: false };

  const correctPassword = getUserPassword(user.username);
  if (password === correctPassword) {
    saveSession(user);
    return { ok: true, user };
  }
  return { ok: false };
}

function changePassword(newPassword, confirmPassword) {
  const session = getSession();
  if (!session) return { ok: false, msg: 'No hay sesión activa.' };
  if (!newPassword || newPassword.length < 6)
    return { ok: false, msg: 'La contraseña debe tener al menos 6 caracteres.' };
  if (newPassword !== confirmPassword)
    return { ok: false, msg: 'Las contraseñas no coinciden.' };

  const saved = getSavedPasswords();
  saved[session.username] = newPassword;
  localStorage.setItem(PASS_KEY, JSON.stringify(saved));
  return { ok: true };
}

function openChangePasswordModal() {
  document.getElementById('change-pass-modal').classList.add('open');
  document.getElementById('cp-new').value     = '';
  document.getElementById('cp-confirm').value = '';
  document.getElementById('cp-error').style.display   = 'none';
  document.getElementById('cp-success').style.display = 'none';
}

function closeChangePasswordModal() {
  document.getElementById('change-pass-modal').classList.remove('open');
}

function handleChangePassword() {
  const newPass     = document.getElementById('cp-new').value;
  const confirmPass = document.getElementById('cp-confirm').value;
  const errEl       = document.getElementById('cp-error');
  const successEl   = document.getElementById('cp-success');
  const btn         = document.getElementById('cp-submit-btn');
  const session     = getSession();

  const result = changePassword(newPass, confirmPass);

  if (result.ok) {
    errEl.style.display     = 'none';
    successEl.style.display = 'block';
    successEl.textContent   = `✅ Contraseña de ${session.username} actualizada. Úsala la próxima vez que inicies sesión.`;
    btn.disabled = true;
    setTimeout(() => {
      closeChangePasswordModal();
      btn.disabled = false;
    }, 2500);
  } else {
    errEl.style.display  = 'block';
    errEl.textContent    = result.msg;
    successEl.style.display = 'none';
  }
}

// Enter en los inputs del modal
document.addEventListener('DOMContentLoaded', () => {
  ['cp-new', 'cp-confirm'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleChangePassword();
    });
  });
});