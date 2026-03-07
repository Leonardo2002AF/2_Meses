/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Sistema de Puntos + Ruleta
   IA: Claude API para calificar recuerdos
   Firebase: guardar puntos por usuario
   ══════════════════════════════════════════ */

const POINTS_THRESHOLD = 20;
const CLAUDE_API_URL   = 'https://api.anthropic.com/v1/messages';

// ⚠️ Reemplaza con tu API key de console.anthropic.com
const CLAUDE_API_KEY   = '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';

const RULETA_PREMIOS = [
  { emoji: '🎧', texto: 'Ser DJ por una hora' },
  { emoji: '🌙', texto: 'Cita sorpresa' },
  { emoji: '📸', texto: 'Sesión de fotos divertida' },
  { emoji: '🍰', texto: 'Postre obligatorio' },
  { emoji: '🎮', texto: 'Noche de juego juntos' },
  { emoji: '📝', texto: 'Vale por un favor' },
  { emoji: '💬', texto: 'Preguntas profundas' },
  { emoji: '🎁', texto: 'Mini regalo sorpresa' },
  { emoji: '🍔', texto: 'Antojo nocturno' },
  { emoji: '🧑‍🍳', texto: 'Chef personal' },
  { emoji: '💃', texto: 'Baile improvisado' },
  { emoji: '📱', texto: 'Control del celular 10 min' },
  { emoji: '🧸', texto: 'Abrazo eterno 5 minutos' },
  { emoji: '🗺', texto: 'Mini aventura juntos' },
  { emoji: '💋', texto: 'Reto romántico (20 besos)' },
  { emoji: '🔥', texto: 'Beso de 1 minuto' },
  { emoji: '👀', texto: 'Mirarse sin reír 1 minuto' },
  { emoji: '💌', texto: 'Confesión secreta' },
  { emoji: '💃', texto: 'Baile sensual 30 segundos' },
  { emoji: '🫣', texto: 'Reto romántico al oído' },
  { emoji: '🔥', texto: 'Beso en cámara lenta' },
  { emoji: '💑', texto: '5 besos donde quieras' },
];

/* ─── Obtener puntos de Firebase ─── */
async function getUserPoints(username) {
  return new Promise((resolve) => {
    firebase.database().ref(`puntos/${username}`).once('value')
      .then(snap => resolve(snap.val() || 0))
      .catch(() => resolve(0));
  });
}

/* ─── Guardar puntos en Firebase ─── */
async function setUserPoints(username, points) {
  try {
    await firebase.database().ref(`puntos/${username}`).set(points);
  } catch(e) { console.warn('Error guardando puntos:', e); }
}

/* ─── Calificar recuerdo con IA ─── */
async function calificarRecuerdoConIA(titulo, descripcion) {
  const prompt = `Eres un evaluador romántico. Califica este recuerdo de pareja del 1 al 5 según qué tan detalloso, cariñoso y especial es.

Título: "${titulo}"
Descripción: "${descripcion}"

Criterios:
- 1 punto: muy básico, sin detalle ni cariño
- 2 puntos: algo de detalle pero poco cariño
- 3 puntos: buen detalle o buen cariño
- 4 puntos: muy detalloso y cariñoso
- 5 puntos: extraordinariamente especial, lleno de amor y detalle

Responde SOLO con un JSON así (sin texto extra):
{"puntos": 3, "mensaje": "Un recuerdo lindo que muestra cariño 💕"}`;

  try {
    const res = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '{"puntos":1,"mensaje":"Recuerdo guardado 💖"}';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch(e) {
    console.warn('Error IA:', e);
    return { puntos: 1, mensaje: 'Recuerdo guardado 💖' };
  }
}

/* ─── Mostrar notificación de puntos ganados ─── */
function mostrarNotificacionPuntos(resultado, puntosAnteriores, puntosNuevos, username) {
  const notif = document.createElement('div');
  notif.id = 'points-notif';
  notif.innerHTML = `
    <div class="points-notif-content">
      <div class="points-notif-stars">${'⭐'.repeat(resultado.puntos)}</div>
      <div class="points-notif-title">¡+${resultado.puntos} puntos ganados!</div>
      <div class="points-notif-msg">${resultado.mensaje}</div>
      <div class="points-notif-total">
        ${username}: <strong>${puntosNuevos} puntos</strong>
        ${puntosNuevos >= POINTS_THRESHOLD ? '<br>🎡 ¡Puedes girar la ruleta!' : `<br>${POINTS_THRESHOLD - puntosNuevos} puntos para la ruleta`}
      </div>
      <button onclick="document.getElementById('points-notif').remove()">¡Genial! 💖</button>
    </div>
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 8000);
}

/* ─── Procesar nuevo recuerdo (llamar desde upload) ─── */
async function procesarNuevoRecuerdo(titulo, descripcion, username) {
  if (!username || !titulo) return;

  // Calificar con IA
  const resultado = await calificarRecuerdoConIA(titulo, descripcion || '');

  // Obtener puntos actuales y sumar
  const puntosActuales = await getUserPoints(username);
  const puntosNuevos   = puntosActuales + resultado.puntos;
  await setUserPoints(username, puntosNuevos);

  // Mostrar notificación
  mostrarNotificacionPuntos(resultado, puntosActuales, puntosNuevos, username);
}

/* ══════════════════════════════
   RULETA
══════════════════════════════ */
async function abrirRuleta() {
  const session  = (typeof getSession === 'function') ? getSession() : null;
  const username = session?.username;
  if (!username) return;

  // Leer puntos frescos directo de Firebase
  const snap   = await firebase.database().ref(`puntos/${username}`).once('value');
  const puntos = snap.val() || 0;

  // Leer historial de premios ganados
  const histSnap   = await firebase.database().ref(`historial_ruleta/${username}`).once('value');
  const historialRaw = histSnap.val() || {};
  const historial  = Object.values(historialRaw).sort((a, b) => b.ts - a.ts);

  // Crear modal ruleta
  const overlay = document.createElement('div');
  overlay.id = 'ruleta-overlay';

  const numSegmentos = RULETA_PREMIOS.length;
  const angulo       = 360 / numSegmentos;
  const colores = ['#c0392b','#922b21','#e74c3c','#7b241c','#cb4335','#a93226'];

  function polarToCartesian(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function segmentoPath(cx, cy, r, startDeg, endDeg) {
    const s = polarToCartesian(cx, cy, r, startDeg);
    const e = polarToCartesian(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
  }

  let svgSegments = '';
  let svgTexts    = '';

  RULETA_PREMIOS.forEach((premio, i) => {
    const startDeg = i * angulo;
    const endDeg   = startDeg + angulo;
    const midDeg   = startDeg + angulo / 2;
    const color    = colores[i % colores.length];

    svgSegments += `<path d="${segmentoPath(250,250,240,startDeg,endDeg)}" fill="${color}" stroke="#1a0000" stroke-width="1.5"/>`;
    svgTexts    += `
      <g transform="rotate(${midDeg}, 250, 250)">
        <text x="250" y="${250 - 130}" text-anchor="middle" fill="white"
          font-size="18" font-family="sans-serif">${premio.emoji}</text>
      </g>`;
  });

  // Historial HTML
  const historialHTML = historial.length === 0
    ? '<div class="historial-empty">Aún no has girado la ruleta 🎡</div>'
    : historial.map(h => `
        <div class="historial-item">
          <span class="historial-emoji">${h.emoji}</span>
          <div class="historial-info">
            <div class="historial-texto">${h.texto}</div>
            <div class="historial-fecha">${new Date(h.ts).toLocaleDateString('es-ES', {day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
          <span class="historial-estado ${h.cumplido ? 'cumplido' : 'pendiente'}">
            ${h.cumplido ? '✅ Cumplido' : '⏳ Pendiente'}
          </span>
        </div>
      `).join('');

  // Botón girar — bloqueado si no hay puntos suficientes
  const puedeGirar = puntos >= POINTS_THRESHOLD;
  const btnGirarHTML = puedeGirar
    ? `<button id="ruleta-girar-btn" onclick="girarRuleta(${puntos}, '${username}')">
         🎡 ¡Girar! (−${POINTS_THRESHOLD} pts)
       </button>`
    : `<button id="ruleta-girar-btn" disabled>
         🔒 Faltan ${POINTS_THRESHOLD - puntos} pts para girar
       </button>`;

  overlay.innerHTML = `
    <div class="ruleta-modal">
      <div class="ruleta-header">
        <h2>🎡 Ruleta de Premios</h2>
        <p>Tus puntos: <strong id="ruleta-puntos-display">${puntos}</strong>
          ${puedeGirar
            ? `— <span style="color:#e74c3c">¡Puedes girar!</span>`
            : `— Necesitas <strong>${POINTS_THRESHOLD}</strong> para girar`}
        </p>
      </div>

      <div class="ruleta-container">
        <div class="ruleta-pointer">▼</div>
        <div class="ruleta-wheel-wrap" id="ruleta-wheel-wrap">
          <svg id="ruleta-svg" viewBox="0 0 500 500" width="340" height="340">
            ${svgSegments}
            ${svgTexts}
            <circle cx="250" cy="250" r="30" fill="#1a0000" stroke="#e74c3c" stroke-width="3"/>
            <text x="250" y="256" text-anchor="middle" fill="white" font-size="16">❤️</text>
          </svg>
        </div>
      </div>

      <div id="ruleta-resultado" class="ruleta-resultado"></div>

      <div class="ruleta-btns">
        ${btnGirarHTML}
        <button onclick="document.getElementById('ruleta-overlay').remove()" class="ruleta-cerrar-btn">
          Cerrar
        </button>
      </div>

      <!-- Historial de premios -->
      <div class="historial-section">
        <div class="historial-title">🏆 Premios ganados</div>
        <div class="historial-list" id="historial-list">
          ${historialHTML}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

let _ruletaGirando = false;

async function girarRuleta(puntosActuales, username) {
  if (_ruletaGirando) return;

  // Verificar puntos frescos antes de girar
  const snapVerify = await firebase.database().ref(`puntos/${username}`).once('value');
  const puntosReales = snapVerify.val() || 0;
  if (puntosReales < POINTS_THRESHOLD) {
    alert(`No tienes suficientes puntos. Tienes ${puntosReales}.`);
    return;
  }

  _ruletaGirando = true;

  const btn = document.getElementById('ruleta-girar-btn');
  if (btn) btn.disabled = true;

  // Descontar puntos
  const puntosNuevos = puntosReales - POINTS_THRESHOLD;
  await setUserPoints(username, puntosNuevos);

  // Elegir premio aleatorio
  const ganadorIdx = Math.floor(Math.random() * RULETA_PREMIOS.length);
  const premio     = RULETA_PREMIOS[ganadorIdx];

  // Guardar en historial Firebase
  await firebase.database().ref(`historial_ruleta/${username}`).push({
    emoji:    premio.emoji,
    texto:    premio.texto,
    ts:       Date.now(),
    cumplido: false,
  });

  // Calcular rotación
  const angulo        = 360 / RULETA_PREMIOS.length;
  const vueltasExtra  = 5;
  const anguloDestino = 360 - (ganadorIdx * angulo + angulo / 2);
  const rotacionTotal = vueltasExtra * 360 + anguloDestino;

  const svg = document.getElementById('ruleta-svg');
  if (svg) {
    svg.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 1.0)';
    svg.style.transformOrigin = 'center';
    svg.style.transform = `rotate(${rotacionTotal}deg)`;
  }

  setTimeout(async () => {
    _ruletaGirando = false;

    const resultado = document.getElementById('ruleta-resultado');
    if (resultado) {
      resultado.innerHTML = `
        <div class="ruleta-premio-ganado">
          <div class="ruleta-premio-emoji">${premio.emoji}</div>
          <div class="ruleta-premio-texto">${premio.texto}</div>
          <div class="ruleta-premio-sub">¡La otra persona debe cumplirlo! 💖</div>
          <div class="ruleta-puntos-restantes">Te quedan ${puntosNuevos} puntos</div>
        </div>
      `;
    }

    // Actualizar display de puntos
    const display = document.getElementById('ruleta-puntos-display');
    if (display) display.textContent = puntosNuevos;

    // Recargar historial
    const histSnap = await firebase.database().ref(`historial_ruleta/${username}`).once('value');
    const historialRaw = histSnap.val() || {};
    const historial = Object.values(historialRaw).sort((a, b) => b.ts - a.ts);
    const listEl = document.getElementById('historial-list');
    if (listEl) {
      listEl.innerHTML = historial.map(h => `
        <div class="historial-item">
          <span class="historial-emoji">${h.emoji}</span>
          <div class="historial-info">
            <div class="historial-texto">${h.texto}</div>
            <div class="historial-fecha">${new Date(h.ts).toLocaleDateString('es-ES', {day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
          <span class="historial-estado ${h.cumplido ? 'cumplido' : 'pendiente'}">
            ${h.cumplido ? '✅ Cumplido' : '⏳ Pendiente'}
          </span>
        </div>
      `).join('');
    }

    // Actualizar botón girar
    if (btn) {
      if (puntosNuevos >= POINTS_THRESHOLD) {
        btn.disabled = false;
        btn.textContent = `🎡 ¡Girar! (−${POINTS_THRESHOLD} pts)`;
        btn.onclick = () => girarRuleta(puntosNuevos, username);
      } else {
        btn.textContent = `🔒 Faltan ${POINTS_THRESHOLD - puntosNuevos} pts para girar`;
      }
    }

    // Actualizar botón navbar
    if (typeof actualizarBotonRuleta === 'function') actualizarBotonRuleta();

  }, 5200);
}
/* ─── Mostrar botón de ruleta en navbar o donde convenga ─── */
async function actualizarBotonRuleta() {
  const session  = (typeof getSession === 'function') ? getSession() : null;
  const username = session?.username;
  if (!username || session?.guest) return;

  const puntos = await getUserPoints(username);

  let btn = document.getElementById('ruleta-nav-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id      = 'ruleta-nav-btn';
    btn.onclick = abrirRuleta;

    // Insertar ANTES del primer icono del navbar
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
      navRight.insertBefore(btn, navRight.firstChild);
    }
  }

  btn.innerHTML = puntos >= POINTS_THRESHOLD
    ? `🎡 <span class="ruleta-badge">${puntos}pts ✨</span>`
    : `🎡 <span class="ruleta-badge">${puntos}/${POINTS_THRESHOLD}</span>`;
  btn.className = puntos >= POINTS_THRESHOLD
    ? 'ruleta-btn ruleta-btn-ready'
    : 'ruleta-btn';
}
