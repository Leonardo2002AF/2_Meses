/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Editar Recuerdo
   Netlify Function → Cloudinary context
   ══════════════════════════════════════════ */

/* ─── Abrir modal de edición ─── */
function openEditModal(card) {
  document.getElementById('edit-title').value = card.title  || '';
  document.getElementById('edit-desc').value  = card.desc   || card.sub || '';
  document.getElementById('edit-fecha').value = card.fecha  ? convertFechaToInput(card.fecha) : '';

  // Poblar categorías
  const sel = document.getElementById('edit-category');
  sel.innerHTML = '';
  if (typeof UPLOAD_CATEGORIES !== 'undefined') {
    UPLOAD_CATEGORIES.forEach(cat => {
      const opt       = document.createElement('option');
      opt.value       = cat.id;
      opt.textContent = cat.label;
      if (card._categoryId === cat.id) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  // Limpiar mensajes
  const err = document.getElementById('edit-error');
  const suc = document.getElementById('edit-success');
  if (err) err.style.display = 'none';
  if (suc) suc.style.display = 'none';

  // Guardar referencia al card
  window._editingCard = card;

  // Mostrar modal
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

/* ─── Cerrar modal ─── */
function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
  window._editingCard = null;
}

/* ─── Guardar cambios ─── */
async function saveEditChanges() {
  const card = window._editingCard;
  if (!card) return;

  const newTitle = document.getElementById('edit-title').value.trim();
  const newDesc  = document.getElementById('edit-desc').value.trim();
  const newFecha = document.getElementById('edit-fecha').value;
  const newCat   = document.getElementById('edit-category').value;

  if (!newTitle) {
    showEditError('El título no puede estar vacío.');
    return;
  }

  const btn = document.getElementById('edit-save-btn');
  btn.disabled    = true;
  btn.textContent = 'Guardando...';

  const fechaFormatted = newFecha ? formatFechaDisplay(newFecha) : (card.fecha || '');

  try {
    // Obtener publicId correctamente — elimina versión y extensión
    const mediaUrl = card.image || card.video || '';
    const publicId = mediaUrl.includes('/upload/')
      ? mediaUrl.split('/upload/').pop()
          .replace(/^v\d+\//, '')     // elimina v1234567/
          .replace(/\.[^.]+$/, '')    // elimina extensión .jpg .mp4 etc
      : '';

    console.log('publicId enviado:', publicId);

    if (!publicId) throw new Error('No se pudo obtener el publicId');

    const res = await fetch('/.netlify/functions/update-memory', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        publicId,
        title: newTitle,
        desc:  newDesc,
        fecha: fechaFormatted,
        catId: newCat,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errData.error || 'Error en servidor');
    }

    // Actualizar card en memoria
    card.title       = newTitle;
    card.desc        = newDesc;
    card.sub         = newDesc;
    card.fecha       = fechaFormatted;
    card._categoryId = newCat;

    // Actualizar modal abierto
    const titleEl = document.getElementById('modal-title');
    const descEl  = document.getElementById('modal-desc');
    const fechaEl = document.getElementById('modal-year');
    if (titleEl) titleEl.textContent = newTitle;
    if (descEl)  descEl.textContent  = newDesc;
    if (fechaEl) fechaEl.textContent = fechaFormatted ? `📅 ${fechaFormatted}` : '';

    // Actualizar tarjeta en carrusel
    updateCardInCarousel(card);

    showEditSuccess('¡Cambios guardados! ✨');
    setTimeout(closeEditModal, 1200);

  } catch(e) {
    console.warn('Error guardando:', e);
    showEditError('Error al guardar: ' + e.message);
  }

  btn.disabled    = false;
  btn.textContent = '💾 Guardar';
}

/* ─── Actualizar tarjeta en carrusel ─── */
function updateCardInCarousel(card) {
  document.querySelectorAll('.card').forEach(el => {
    const titleEl = el.querySelector('.card-title');
    if (titleEl && titleEl.textContent === card.title) {
      const subEl  = el.querySelector('.card-sub');
      const dateEl = el.querySelector('.card-date');
      if (subEl)  subEl.textContent  = card.desc || '';
      if (dateEl) dateEl.textContent = card.fecha ? `📅 ${card.fecha}` : '';
    }
  });
}

/* ─── Helpers de fecha ─── */
function convertFechaToInput(fecha) {
  const meses = {
    'enero':1,'febrero':2,'marzo':3,'abril':4,'mayo':5,'junio':6,
    'julio':7,'agosto':8,'septiembre':9,'octubre':10,'noviembre':11,'diciembre':12
  };
  const parts = fecha.toLowerCase().split(' ');
  if (parts.length === 3) {
    const d = parts[0].padStart(2,'0');
    const m = String(meses[parts[1]] || 1).padStart(2,'0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }
  return '';
}

function formatFechaDisplay(inputDate) {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const [y, m, d] = inputDate.split('-');
  return `${parseInt(d)} ${meses[parseInt(m)-1]} ${y}`;
}

/* ─── Mensajes ─── */
function showEditError(msg) {
  const el = document.getElementById('edit-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  const suc = document.getElementById('edit-success');
  if (suc) suc.style.display = 'none';
}

function showEditSuccess(msg) {
  const el = document.getElementById('edit-success');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  const err = document.getElementById('edit-error');
  if (err) err.style.display = 'none';
}