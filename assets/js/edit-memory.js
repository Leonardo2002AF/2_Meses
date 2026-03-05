/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Editar Recuerdo
   Cloudinary: actualiza tags con metadata
   ══════════════════════════════════════════ */

/* ─── Abrir modal de edición ─── */
function openEditModal(card) {
  // Rellenar campos con datos actuales
  document.getElementById('edit-title').value    = card.title  || '';
  document.getElementById('edit-desc').value     = card.desc   || card.sub || '';
  document.getElementById('edit-fecha').value    = card.fecha  ? convertFechaToInput(card.fecha) : '';

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

  // Guardar referencia al card actual
  window._editingCard = card;

  // Mostrar modal
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

/* ─── Cerrar modal de edición ─── */
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
  btn.disabled     = true;
  btn.textContent  = 'Guardando...';

  // Convertir fecha a formato DD Mes YYYY
  const fechaFormatted = newFecha ? formatFechaDisplay(newFecha) : '';

  // Actualizar en Cloudinary via upload.js si existe la función
  try {
    if (typeof updateCardInCloudinary === 'function') {
      await updateCardInCloudinary(card, {
        title: newTitle,
        desc:  newDesc,
        fecha: fechaFormatted,
        catId: newCat,
      });
    }
  } catch(e) {
    console.warn('Error actualizando Cloudinary:', e);
  }

  // Actualizar el card en memoria y en el DOM
  card.title        = newTitle;
  card.desc         = newDesc;
  card.sub          = newDesc;
  card.fecha        = fechaFormatted;
  card._categoryId  = newCat;

  // Actualizar modal abierto si corresponde
  const titleEl = document.getElementById('modal-title');
  const descEl  = document.getElementById('modal-desc');
  const fechaEl = document.getElementById('modal-year');
  if (titleEl) titleEl.textContent = newTitle;
  if (descEl)  descEl.textContent  = newDesc;
  if (fechaEl) fechaEl.textContent = fechaFormatted ? `📅 ${fechaFormatted}` : '';

  // Actualizar tarjeta en carrusel
  updateCardInCarousel(card);

  // Guardar en localStorage como respaldo
  saveEditToLocalStorage(card);

  btn.disabled    = false;
  btn.textContent = '💾 Guardar';

  showEditSuccess('¡Cambios guardados! ✨');
  setTimeout(closeEditModal, 1200);
}

/* ─── Actualizar tarjeta en el carrusel ─── */
function updateCardInCarousel(card) {
  // Buscar todas las tarjetas y actualizar la que coincide
  document.querySelectorAll('.card').forEach(el => {
    const titleEl = el.querySelector('.card-title');
    const subEl   = el.querySelector('.card-sub');
    const dateEl  = el.querySelector('.card-date');
    if (titleEl && titleEl.textContent === card.title) {
      if (subEl)  subEl.textContent  = card.desc || card.sub || '';
      if (dateEl) dateEl.textContent = card.fecha ? `📅 ${card.fecha}` : '';
    }
  });
}

/* ─── Guardar en localStorage ─── */
function saveEditToLocalStorage(card) {
  try {
    const key  = `edit_${btoa(card.image || card.video || card.title).substring(0, 20)}`;
    const data = { title: card.title, desc: card.desc, fecha: card.fecha, catId: card._categoryId };
    localStorage.setItem(key, JSON.stringify(data));
  } catch(e) {}
}

/* ─── Helpers de fecha ─── */
function convertFechaToInput(fecha) {
  // "20 Febrero 2026" → "2026-02-20"
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
  // "2026-02-20" → "20 Febrero 2026"
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const [y, m, d] = inputDate.split('-');
  return `${parseInt(d)} ${meses[parseInt(m)-1]} ${y}`;
}

/* ─── Mensajes ─── */
function showEditError(msg) {
  const el = document.getElementById('edit-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showEditSuccess(msg) {
  const el = document.getElementById('edit-success');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  const err = document.getElementById('edit-error');
  if (err) err.style.display = 'none';
}
