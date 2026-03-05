/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Timeline Netflix Style
   ══════════════════════════════════════════ */

const MESES_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const CAT_LABELS = {
  c1: '▶ Seguir Viendo',
  c2: '⭐ Momentos Destacados',
  c4: '✈ Viajes Juntos',
  c5: '🎂 Fechas Especiales',
  c6: '🏠 Momentos en Casa',
};

let _tlAllCards     = [];
let _tlActiveFilter = 'all';

/* ─── Abrir ─── */
async function openTimeline() {
  const modal = document.getElementById('timeline-modal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const body = document.getElementById('tl-body');
  if (body) body.innerHTML = '<div class="tl-loading">💫 Cargando recuerdos...</div>';

  _tlActiveFilter = 'all';
  await loadTimelineCards();
  updateTlStats();
  renderTimeline();
}

/* ─── Cerrar ─── */
function closeTimeline() {
  const modal = document.getElementById('timeline-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── Estadísticas ─── */
function updateTlStats() {
  const totalEl  = document.getElementById('tl-stat-total');
  const monthsEl = document.getElementById('tl-stat-months');
  if (totalEl)  totalEl.textContent  = _tlAllCards.length;
  if (monthsEl) {
    const months = new Set(_tlAllCards.map(c => getMonthKey(c)).filter(k => k !== 'sin-fecha'));
    monthsEl.textContent = months.size;
  }
}

/* ─── Cargar cards ─── */
async function loadTimelineCards() {
  _tlAllCards = [];

  try {
    const bust = `?ts=${Date.now()}`;
    const [imgRes, vidRes] = await Promise.all([
      fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/list/recuerdos.json${bust}`),
      fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/list/recuerdos.json${bust}`),
    ]);

    const imgData = imgRes.ok ? await imgRes.json() : { resources: [] };
    const vidData = vidRes.ok ? await vidRes.json() : { resources: [] };

    const all = [
      ...(imgData.resources || []).map(r => ({ ...r, resourceType: 'image' })),
      ...(vidData.resources || []).map(r => ({ ...r, resourceType: 'video' })),
    ];

    all.forEach(r => {
      const ctx      = r.context?.custom || {};
      const tagCat   = (r.tags || []).find(t => t.startsWith('cat_'));
      const category = ctx.category || (tagCat ? tagCat.replace('cat_', '') : 'c1');
      const type     = ctx.type || r.resourceType || 'image';
      const fecha    = ctx.fecha ? decodeURIComponent(ctx.fecha) : '';

      _tlAllCards.push({
        title:    decodeURIComponent(ctx.title    || r.public_id.split('/').pop() || 'Recuerdo'),
        sub:      decodeURIComponent(ctx.sub      || ''),
        desc:     decodeURIComponent(ctx.desc     || ''),
        emoji:    decodeURIComponent(ctx.emoji    || '📸'),
        gradient: decodeURIComponent(ctx.gradient || 'linear-gradient(135deg,#4a0015,#c0396e)'),
        fecha,
        category,
        image: type === 'image' ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${r.public_id}` : '',
        video: type === 'video' ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/${r.public_id}` : '',
        _ts: parseFechaToTs(fecha),
      });
    });

  } catch(e) {
    console.warn('Timeline error:', e);
  }

  // localStorage como respaldo
  try {
    const ls = JSON.parse(localStorage.getItem('nuestrosRecuerdos_cards') || '{}');
    const existing = new Set(_tlAllCards.map(c => c.image || c.video));
    Object.entries(ls).forEach(([catId, cards]) => {
      cards.forEach(card => {
        const key = card.image || card.video || '';
        if (!existing.has(key)) {
          _tlAllCards.push({ ...card, category: catId, _ts: parseFechaToTs(card.fecha || '') });
        }
      });
    });
  } catch(e) {}

  _tlAllCards.sort((a, b) => b._ts - a._ts);
}

/* ─── Parsear fecha ─── */
function parseFechaToTs(fecha) {
  if (!fecha) return 0;
  const mesesMap = {
    'enero':0,'febrero':1,'marzo':2,'abril':3,'mayo':4,'junio':5,
    'julio':6,'agosto':7,'septiembre':8,'octubre':9,'noviembre':10,'diciembre':11
  };
  const parts = fecha.toLowerCase().split(' ');
  if (parts.length === 3) {
    const d = parseInt(parts[0]);
    const m = mesesMap[parts[1]];
    const y = parseInt(parts[2]);
    if (!isNaN(d) && m !== undefined && !isNaN(y)) return new Date(y, m, d).getTime();
  }
  return 0;
}

/* ─── Clave mes ─── */
function getMonthKey(card) {
  if (!card.fecha) return 'sin-fecha';
  const parts = card.fecha.toLowerCase().split(' ');
  if (parts.length === 3) {
    const mesesMap = {
      'enero':'01','febrero':'02','marzo':'03','abril':'04','mayo':'05','junio':'06',
      'julio':'07','agosto':'08','septiembre':'09','octubre':'10','noviembre':'11','diciembre':'12'
    };
    return `${parts[2]}-${mesesMap[parts[1]] || '00'}`;
  }
  return 'sin-fecha';
}

/* ─── Formato mes ─── */
function formatMonthKey(key) {
  const [y, m] = key.split('-');
  return `${MESES_ES[parseInt(m) - 1] || '?'} ${y}`;
}

/* ─── Render ─── */
function renderTimeline() {
  buildFilters();

  const filtered = _tlActiveFilter === 'all'
    ? _tlAllCards
    : _tlAllCards.filter(c => getMonthKey(c) === _tlActiveFilter);

  const body = document.getElementById('tl-body');
  if (!body) return;

  if (filtered.length === 0) {
    body.innerHTML = `
      <div class="tl-empty">
        <div class="tl-empty-icon">📭</div>
        <div class="tl-empty-text">No hay recuerdos en este período</div>
      </div>`;
    return;
  }

  // Agrupar por mes
  const groups = {};
  filtered.forEach(card => {
    const key = getMonthKey(card);
    if (!groups[key]) groups[key] = [];
    groups[key].push(card);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === 'sin-fecha') return 1;
    if (b === 'sin-fecha') return -1;
    return b.localeCompare(a);
  });

  body.innerHTML = '';

  // Separadores de año
  let lastYear = null;

  sortedKeys.forEach((key, idx) => {
    const cards = groups[key];
    const year  = key !== 'sin-fecha' ? key.split('-')[0] : null;

    // Separador de año
    if (year && year !== lastYear) {
      lastYear = year;
      const sep = document.createElement('div');
      sep.className = 'tl-year-separator';
      sep.innerHTML = `
        <span class="tl-year-label">${year}</span>
        <div class="tl-year-line"></div>
      `;
      body.appendChild(sep);
    }

    const label = key === 'sin-fecha' ? 'Sin fecha' : formatMonthKey(key);
    const [mesName, anio] = label.split(' ');

    const group = document.createElement('div');
    group.className = 'tl-month-group';
    group.style.animationDelay = `${idx * 0.05}s`;

    group.innerHTML = `
      <div class="tl-month-header">
        <div class="tl-month-dot-wrap">
          <div class="tl-month-dot"></div>
        </div>
        <h3 class="tl-month-title"><em>${mesName}</em> ${anio || ''}</h3>
        <span class="tl-month-count">${cards.length} recuerdo${cards.length !== 1 ? 's' : ''}</span>
        <div class="tl-month-line"></div>
      </div>
      <div class="tl-grid"></div>
    `;

    const grid = group.querySelector('.tl-grid');
    cards.forEach(card => grid.appendChild(buildTlCard(card)));
    body.appendChild(group);
  });
}

/* ─── Tarjeta ─── */
function buildTlCard(card) {
  const el = document.createElement('div');
  el.className = 'tl-card';

  let thumbHTML = '';
  if (card.image) {
    thumbHTML = `<img class="tl-card-thumb" src="${card.image}" alt="${card.title}"
      onerror="this.style.display='none';this.parentElement.style.background='${card.gradient}'"/>`;
  } else if (card.video) {
    const afterUpload = card.video.split('/upload/')[1] || '';
    const pubId = afterUpload.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
    const thumb = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/w_300,h_200,c_fill,so_2/${pubId}.jpg`;
    thumbHTML = `
      <img class="tl-card-thumb" src="${thumb}" alt="${card.title}"
        onerror="this.style.display='none';this.parentElement.style.background='${card.gradient}'"/>
      <span class="tl-video-badge">VIDEO</span>`;
  } else {
    thumbHTML = `<div class="tl-card-thumb-placeholder" style="background:${card.gradient}">${card.emoji}</div>`;
  }

  const catLabel = CAT_LABELS[card.category] || '';

  el.innerHTML = `
    ${thumbHTML}
    <div class="tl-card-play">▶</div>
    <div class="tl-card-info">
      <div class="tl-card-title">${card.title}</div>
      ${card.fecha ? `<div class="tl-card-fecha">📅 ${card.fecha}</div>` : ''}
      ${catLabel ? `<div class="tl-card-cat">${catLabel}</div>` : ''}
    </div>
  `;

  el.onclick = () => {
    closeTimeline();
    setTimeout(() => openModal(card), 200);
  };

  return el;
}

/* ─── Filtros ─── */
function buildFilters() {
  const container = document.getElementById('tl-filter-scroll');
  if (!container) return;

  const monthKeys = [...new Set(_tlAllCards.map(c => getMonthKey(c)))]
    .filter(k => k !== 'sin-fecha')
    .sort((a, b) => b.localeCompare(a));

  container.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = `tl-filter-btn ${_tlActiveFilter === 'all' ? 'active' : ''}`;
  allBtn.textContent = `Todos (${_tlAllCards.length})`;
  allBtn.onclick = () => { _tlActiveFilter = 'all'; renderTimeline(); };
  container.appendChild(allBtn);

  monthKeys.forEach(key => {
    const count = _tlAllCards.filter(c => getMonthKey(c) === key).length;
    const btn   = document.createElement('button');
    btn.className   = `tl-filter-btn ${_tlActiveFilter === key ? 'active' : ''}`;
    btn.textContent = `${formatMonthKey(key)} (${count})`;
    btn.onclick     = () => { _tlActiveFilter = key; renderTimeline(); };
    container.appendChild(btn);
  });

  const sinFecha = _tlAllCards.filter(c => getMonthKey(c) === 'sin-fecha');
  if (sinFecha.length > 0) {
    const btn = document.createElement('button');
    btn.className   = `tl-filter-btn ${_tlActiveFilter === 'sin-fecha' ? 'active' : ''}`;
    btn.textContent = `Sin fecha (${sinFecha.length})`;
    btn.onclick     = () => { _tlActiveFilter = 'sin-fecha'; renderTimeline(); };
    container.appendChild(btn);
  }
}