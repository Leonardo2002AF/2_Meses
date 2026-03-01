/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Subida a Cloudinary
   ══════════════════════════════════════════ */

const CLOUDINARY_CLOUD  = "dwtqq0c7y";
const CLOUDINARY_PRESET = "2 Meses";
const CLOUDINARY_API_KEY = "779436443365798";

/* ─── Categorías disponibles ─── */
const UPLOAD_CATEGORIES = [
  { id: "c1", label: "▶ Seguir Viendo"       },
  { id: "c2", label: "⭐ Momentos Destacados" },
  { id: "c4", label: "✈ Viajes Juntos"        },
  { id: "c5", label: "🎂 Fechas Especiales"   },
  { id: "c6", label: "🏠 Momentos en Casa"    },
];

/* ─── Estado del modal ─── */
let uploadState = {
  file:     null,
  type:     null,
  preview:  null,
  category: UPLOAD_CATEGORIES[0].id,
};

/* ════════════════════
   ABRIR / CERRAR MODAL
════════════════════ */
function openUploadModal() {
  resetUploadModal();
  document.getElementById('upload-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
  document.getElementById('upload-modal').classList.remove('open');
  document.body.style.overflow = '';
  resetUploadModal();
}

function resetUploadModal() {
  uploadState = { file: null, type: null, preview: null, category: UPLOAD_CATEGORIES[0].id };

  const dropzone = document.getElementById('um-dropzone');
  if (dropzone) {
    dropzone.innerHTML = `
      <div class="um-drop-icon">📁</div>
      <p class="um-drop-label">Toca para elegir una foto o video</p>
      <p class="um-drop-sub">JPG, PNG, MP4, MOV · Máx. 100 MB</p>
      <button class="btn btn-outline um-choose-btn" onclick="triggerFileInput()">
        📷 Elegir archivo
      </button>
    `;
  }

  // Input FIJO fuera del dropzone para que no se destruya en iOS
  let input = document.getElementById('um-file-input-fixed');
  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.id = 'um-file-input-fixed';
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/mov,video/quicktime';
    input.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;width:1px;height:1px;';
    input.addEventListener('change', onFileSelected);
    document.body.appendChild(input);
  } else {
    input.value = '';
  }

  const titleInput = document.getElementById('um-title');
  if (titleInput) titleInput.value = '';
  const descInput = document.getElementById('um-desc');
  if (descInput) descInput.value = '';

  setUploadStep(1);
}

/* ════════════════════
   PASOS DEL MODAL
════════════════════ */
function setUploadStep(step) {
  document.querySelectorAll('.um-step').forEach((el, i) => {
    el.classList.toggle('um-step-active', i + 1 === step);
  });
  document.querySelectorAll('.um-step-dot').forEach((el, i) => {
    el.classList.toggle('active', i + 1 <= step);
  });
}

/* ════════════════════
   SELECCIÓN DE ARCHIVO
════════════════════ */
function onFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 100 * 1024 * 1024) {
    showUploadError('El archivo supera los 100 MB. Elige uno más pequeño.');
    return;
  }

  const isHEIC = file.type === 'image/heic'
              || file.type === 'image/heif'
              || file.name.toLowerCase().endsWith('.heic')
              || file.name.toLowerCase().endsWith('.heif');

  if (isHEIC) {
    showUploadError('Formato HEIC no soportado. Ve a Ajustes → Cámara → Formato → "Más compatible".');
    return;
  }

  uploadState.file = file;
  uploadState.type = file.type.startsWith('video/') ? 'video' : 'image';

  const reader = new FileReader();
  reader.onload = (ev) => {
    uploadState.preview = ev.target.result;
    showPreview(uploadState.type, ev.target.result, file.name);
    setUploadStep(2);
  };
  reader.onerror = () => {
    showUploadError('No se pudo leer el archivo. Intenta con otra foto.');
  };
  reader.readAsDataURL(file);
}

function showPreview(type, src, name) {
  const dropzone = document.getElementById('um-dropzone');
  if (type === 'video') {
    dropzone.innerHTML = `
      <video src="${src}" controls class="um-preview-media"></video>
      <p class="um-preview-name">🎬 ${name}</p>
      <button class="btn btn-outline um-change-btn" onclick="triggerFileInput()">🔄 Cambiar archivo</button>
    `;
  } else {
    dropzone.innerHTML = `
      <img src="${src}" alt="preview" class="um-preview-media"/>
      <p class="um-preview-name">🖼️ ${name}</p>
      <button class="btn btn-outline um-change-btn" onclick="triggerFileInput()">🔄 Cambiar archivo</button>
    `;
  }
}

function triggerFileInput() {
  const input = document.getElementById('um-file-input-fixed');
  if (input) {
    input.value = '';
    input.click();
  }
}

/* ════════════════════
   SUBIR A CLOUDINARY
════════════════════ */
async function startUpload() {
  const title    = document.getElementById('um-title').value.trim();
  const desc     = document.getElementById('um-desc').value.trim();
  const emoji    = document.getElementById('um-emoji').value || '📸';
  const category = document.getElementById('um-category').value;

  if (!uploadState.file) { showUploadError('Primero elige un archivo.');           return; }
  if (!title)             { showUploadError('Escribe un título para el recuerdo.'); return; }

  setUploadStep(3);
  showProgress(0);

  const gradient = randomGradient();

  const contextStr = [
    `title=${encodeURIComponent(title)}`,
    `sub=${encodeURIComponent(desc || title)}`,
    `desc=${encodeURIComponent(desc || 'Un recuerdo especial: ' + title)}`,
    `emoji=${encodeURIComponent(emoji)}`,
    `category=${category}`,
    `gradient=${encodeURIComponent(gradient)}`,
    `type=${uploadState.type}`,
  ].join('|');

  try {
    // ✅ category se pasa a uploadToCloudinary para el tag compartido
    const url = await uploadToCloudinary(
      uploadState.file,
      contextStr,
      category,
      (pct) => showProgress(pct)
    );

    const card = {
      title,
      emoji,
      sub:      desc || title,
      desc:     desc || `Un recuerdo especial: ${title}`,
      gradient,
      image:    uploadState.type === 'image' ? url : '',
      video:    uploadState.type === 'video' ? url : '',
    };

    saveToLocalStorage(category, card);
    addCardToCarousel(category, card);
    showUploadSuccess(title);
    setUploadStep(4);

    // Recargar desde Cloudinary tras 3s para sincronizar otros dispositivos
    setTimeout(() => loadSavedCards(), 3000);

  } catch (err) {
    console.error(err);
    showUploadError('Error al subir. Revisa tu conexión e intenta de nuevo.');
    setUploadStep(2);
  }
}

/* ════════════════════
   UPLOAD A CLOUDINARY
   ✅ Tag "nuestros-recuerdos" = compartido
   ✅ Tag "cat_xx" = categoría del carrusel
════════════════════ */
function uploadToCloudinary(file, contextStr, category, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file',          file);
    form.append('upload_preset', CLOUDINARY_PRESET);
    form.append('folder',        'nuestros-recuerdos');
    form.append('context',       contextStr);
    // ✅ Tag global para que aparezca en TODOS los dispositivos
    form.append('tags',          `nuestros-recuerdos,cat_${category || 'c1'}`);

    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        console.error('Cloudinary response:', xhr.responseText);
        reject(new Error(`Cloudinary error: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });
}

/* ════════════════════
   RESPALDO EN LOCALSTORAGE
════════════════════ */
const LS_KEY = 'nuestrosRecuerdos_cards';

function saveToLocalStorage(categoryId, card) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    if (!all[categoryId]) all[categoryId] = [];
    const exists = all[categoryId].some(c =>
      c.title === card.title && (c.image === card.image || c.video === card.video)
    );
    if (!exists) all[categoryId].unshift(card);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch(e) {}
}

/* ════════════════════
   CARGAR DESDE CLOUDINARY
   ✅ Imágenes y videos compartidos
   ✅ Categoría desde context o tag
   ✅ Cache busting para ver siempre lo nuevo
════════════════════ */
async function loadSavedCards() {
  let loaded = false;
  const bust = `?ts=${Date.now()}`;

  try {
    const [imgRes, vidRes] = await Promise.all([
      fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/list/nuestros-recuerdos.json${bust}`),
      fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/list/nuestros-recuerdos.json${bust}`),
    ]);

    const imgData = imgRes.ok ? await imgRes.json() : { resources: [] };
    const vidData = vidRes.ok ? await vidRes.json() : { resources: [] };

    if (!imgRes.ok && !vidRes.ok) {
      console.info('Aún no hay recuerdos en Cloudinary.');
      try {
        const all = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        Object.entries(all).forEach(([catId, cards]) => {
          cards.forEach(card => addCardToCarousel(catId, card, false));
        });
      } catch(e) {}
      return;
    }

    const all = [
      ...(imgData.resources || []).map(r => ({ ...r, resourceType: 'image' })),
      ...(vidData.resources || []).map(r => ({ ...r, resourceType: 'video' })),
    ];

    if (all.length > 0) {
      all.forEach(r => {
        const ctx = r.context?.custom || {};

        // ✅ Categoría desde context, si no desde tag cat_xx
        const tagCat   = (r.tags || []).find(t => t.startsWith('cat_'));
        const category = ctx.category || (tagCat ? tagCat.replace('cat_', '') : 'c1');
        const type     = ctx.type || r.resourceType || 'image';

        const card = {
          // ✅ Título desde context, si no usa nombre del archivo
          title:    decodeURIComponent(ctx.title    || r.display_name || r.public_id.split('/').pop() || 'Recuerdo'),
          sub:      decodeURIComponent(ctx.sub      || ''),
          desc:     decodeURIComponent(ctx.desc     || ''),
          emoji:    decodeURIComponent(ctx.emoji    || '📸'),
          gradient: decodeURIComponent(ctx.gradient || randomGradient()),
          image:    type === 'image' ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${r.public_id}` : '',
          video:    type === 'video' ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/${r.public_id}` : '',
        };

        addCardToCarousel(category, card, false);
        saveToLocalStorage(category, card);
      });
      loaded = true;
    }

  } catch (err) {
    console.warn('Cloudinary list no disponible:', err);
  }

  // Respaldo localStorage si Cloudinary falla
  if (!loaded) {
    try {
      const all = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      Object.entries(all).forEach(([catId, cards]) => {
        cards.forEach(card => addCardToCarousel(catId, card, false));
      });
    } catch(e) {}
  }
}

/* ════════════════════
   AGREGAR TARJETA AL CARRUSEL
════════════════════ */
function addCardToCarousel(categoryId, card, prepend = false) {
  const container = document.getElementById(categoryId);
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'card';

  let thumbHTML = '';
  if (card.image) {
    thumbHTML = `<img src="${card.image}" alt="${card.title}"
                      style="width:100%;height:120px;object-fit:cover;"
                      onerror="this.style.display='none'">`;
  } else if (card.video) {
    thumbHTML = `<div class="card-thumb-placeholder" style="background:${card.gradient};position:relative;">
                   <span style="font-size:2rem">▶</span>
                   <span style="font-size:0.65rem;position:absolute;bottom:4px;right:6px;
                         background:rgba(0,0,0,0.6);padding:1px 5px;border-radius:3px;">VIDEO</span>
                 </div>`;
  } else {
    thumbHTML = `<div class="card-thumb-placeholder" style="background:${card.gradient}">
                   <span style="font-size:2.5rem">${card.emoji}</span>
                 </div>`;
  }

  el.innerHTML = `
    ${thumbHTML}
    <div class="card-info">
      <div class="card-title">${card.title}</div>
      <div class="card-sub">${card.sub}</div>
    </div>
    <div class="card-overlay"><div class="card-play">▶</div></div>
  `;

  el.onclick = () => openModal(card);

  if (prepend && container.firstChild) {
    container.insertBefore(el, container.firstChild);
  } else {
    container.prepend(el);
  }
}

/* ════════════════════
   PROGRESO
════════════════════ */
function showProgress(pct) {
  const bar   = document.getElementById('um-progress-bar');
  const label = document.getElementById('um-progress-label');
  if (bar)   bar.style.width   = pct + '%';
  if (label) label.textContent = pct < 100 ? `Subiendo... ${pct}%` : '✅ ¡Listo!';
}

function showUploadError(msg) {
  const el = document.getElementById('um-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  setTimeout(() => { if (el) el.style.display = 'none'; }, 4000);
}

function showUploadSuccess(title) {
  const el = document.getElementById('um-success-title');
  if (el) el.textContent = `"${title}" fue agregado 💖`;
}

/* ════════════════════
   HELPERS
════════════════════ */
function randomGradient() {
  const pairs = [
    ['#4a0015','#c0396e'], ['#001a2a','#1a5276'], ['#002a0f','#1a6b3c'],
    ['#1a0030','#7b2d9e'], ['#2a1a00','#c0800e'], ['#0a0a2a','#4040c0'],
  ];
  const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
  return `linear-gradient(135deg,${a},${b})`;
}

/* ════════════════════
   INIT
════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadSavedCards();
});