/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Aniversario Mensual
   Se activa el día 07 de cada mes
   ══════════════════════════════════════════ */

const ANNIV_KEY = 'nuestrosRecuerdos_anniversaryShown';

/* ─── Verificar si hoy es día de aniversario ─── */
function isTodayAnniversary() {
  const today = new Date();
  return today.getDate() === 7;
}

/* ─── Verificar si ya se mostró hoy ─── */
function wasShownToday() {
  try {
    const val = localStorage.getItem(ANNIV_KEY);
    if (!val) return false;
    const { date } = JSON.parse(val);
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  } catch(e) { return false; }
}

function markShownToday() {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(ANNIV_KEY, JSON.stringify({ date: today }));
  } catch(e) {}
}

/* ─── Calcular cuántos meses llevamos ─── */
function getMonthsTogether() {
  const startDate = localStorage.getItem('nuestrosRecuerdos_startDate');
  if (!startDate) return null;
  const start = new Date(startDate + 'T00:00:00');
  const now   = new Date();
  const years  = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  const total  = years * 12 + months;
  return total > 0 ? total : null;
}

/* ─── Mensajes románticos para el aniversario ─── */
const ANNIV_MESSAGES = [
  { title: "¡Feliz Mensiversario!", sub: "Cada mes a tu lado es un regalo 🌹" },
  { title: "Un mes más juntos", sub: "Y así quiero que sea por siempre ♥" },
  { title: "¡Hoy es nuestro día!", sub: "Gracias por existir en mi vida 💖" },
  { title: "Otro mes de amor", sub: "Cada día contigo vale para siempre ✨" },
  { title: "¡Feliz Mensiversario amor!", sub: "Eres lo mejor que me ha pasado 🌸" },
];

/* ─── Crear partículas de confeti y corazones ─── */
function createParticles(container) {
  const items = ['💖','💗','💕','♥','🌹','✨','💫','🥰','💝','❤️','🌸','⭐'];
  const colors = ['#c0396e','#e50914','#ff6b8a','#ff4466','#ffaacc','#ffffff'];

  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'anniv-particle';

    const isEmoji = Math.random() > 0.4;
    if (isEmoji) {
      p.textContent = items[Math.floor(Math.random() * items.length)];
      p.style.fontSize = (0.8 + Math.random() * 1.5) + 'rem';
    } else {
      // Confeti rectangular
      p.style.width    = (6 + Math.random() * 8) + 'px';
      p.style.height   = (10 + Math.random() * 12) + 'px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.borderRadius = '2px';
    }

    p.style.left             = (Math.random() * 100) + '%';
    p.style.top              = '-30px';
    p.style.animationDuration = (3 + Math.random() * 5) + 's';
    p.style.animationDelay   = (Math.random() * 4) + 's';

    container.appendChild(p);
  }
}

/* ─── Mostrar pantalla de aniversario ─── */
function showAnniversaryScreen(onClose) {
  const months  = getMonthsTogether();
  const msgData = ANNIV_MESSAGES[Math.floor(Math.random() * ANNIV_MESSAGES.length)];

  const monthsText = months
    ? `¡Llevamos <span>${months} ${months === 1 ? 'mes' : 'meses'}</span> juntos!`
    : '¡Un mes más de amor! 💞';

  // Crear overlay
  const overlay = document.createElement('div');
  overlay.id = 'anniversary-overlay';

  overlay.innerHTML = `
    <div class="anniv-glow"></div>
    <div class="anniv-box">
      <span class="anniv-emoji">💖</span>
      <div class="anniv-month">✦ Mensiversario ✦</div>
      <h1 class="anniv-title">${msgData.title.replace('¡', '¡<em>').replace('!', '</em>!')}</h1>
      <p class="anniv-subtitle">${msgData.sub}</p>
      <p class="anniv-counter-text">${monthsText}</p>
      <div class="anniv-close-wrap">
        <div class="anniv-timer-bar-wrap">
          <div class="anniv-timer-bar" id="anniv-timer-bar"></div>
        </div>
        <button class="anniv-close-btn" id="anniv-close-btn"
          onclick="closeAnniversaryScreen()">
          ♥ ¡Celebrar juntos!
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  createParticles(overlay);

  // Guardar callback para cuando se cierre
  window._anniversaryOnClose = onClose;

  // Animar entrada
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('visible'));
  });

  // Mostrar botón de cerrar tras 5 segundos
  setTimeout(() => {
    const btn = document.getElementById('anniv-close-btn');
    if (btn) btn.classList.add('visible');
  }, 5000);

  markShownToday();
}

/* ─── Cerrar pantalla de aniversario ─── */
function closeAnniversaryScreen() {
  const overlay = document.getElementById('anniversary-overlay');
  if (!overlay) return;

  overlay.classList.add('hiding');
  setTimeout(() => {
    overlay.remove();
    // Ejecutar callback (normalmente continuar con el login/cascada)
    if (typeof window._anniversaryOnClose === 'function') {
      window._anniversaryOnClose();
      window._anniversaryOnClose = null;
    }
  }, 700);
}

/* ─── Inicializar — llamar después del login ─── */
function initAnniversary(onClose) {
  if (!isTodayAnniversary()) {
    if (typeof onClose === 'function') onClose();
    return;
  }
  if (wasShownToday()) {
    if (typeof onClose === 'function') onClose();
    return;
  }

  // Pequeña pausa para que el login ya haya desaparecido
  setTimeout(() => showAnniversaryScreen(onClose), 300);
}
