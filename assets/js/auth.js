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

  // Botón de subida — solo si está logueado y NO es invitado
  const uploadBtn = document.querySelector('[onclick="openUploadModal()"]');
  if (uploadBtn) {
    uploadBtn.style.display = (!session || isGuest) ? 'none' : '';
  }

  // Ocultar botón "Ver Todo" del banner si es invitado
  const bannerBtns = document.querySelectorAll('.memory-banner-actions .btn');
  bannerBtns.forEach(btn => {
    if (btn.textContent.includes('Ver Todo')) {
      // este sí puede verlo
    }
  });

  // Avatar en navbar
  const avatar = document.querySelector('.nav-avatar');
  if (avatar) {
    if (session && !isGuest) {
      avatar.textContent  = session.emoji;
      avatar.title        = session.username;
      avatar.style.cursor = 'pointer';
      avatar.onclick = () => {
        const action = confirm(
          `👤 ${session.username}\n\n¿Qué deseas hacer?\n\nAcepta = Cerrar sesión\nCancela = Cambiar contraseña`
        );
        if (action) logout();
        else openChangePasswordModal();
      };
    } else if (isGuest) {
      avatar.textContent  = '👀';
      avatar.title        = 'Modo invitado';
      avatar.style.cursor = 'pointer';
      avatar.onclick = () => {
        if (confirm('¿Deseas iniciar sesión con tu cuenta?')) {
          clearSession();
          showLoginScreen();
        }
      };
    } else {
      avatar.textContent  = '💑';
      avatar.title        = 'Iniciar sesión';
      avatar.style.cursor = 'pointer';
      avatar.onclick      = () => showLoginScreen();
    }
  }
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