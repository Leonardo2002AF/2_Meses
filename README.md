# 💕 Nuestros Recuerdos

Página web estilo Netflix para revivir tus recuerdos más especiales.

---

## 📁 Estructura del Proyecto

```
nuestros-recuerdos/
│
├── index.html                   ← Página principal (abre esto en el navegador)
│
├── assets/
│   ├── css/
│   │   └── styles.css           ← Todos los estilos
│   │
│   ├── js/
│   │   ├── data.js              ← ✏️ EDITA AQUÍ: títulos, descripciones y rutas de archivos
│   │   └── app.js               ← Lógica de la página (no necesitas tocar esto)
│   │
│   ├── images/
│   │   ├── hero/
│   │   │   └── hero.jpg         ← 📷 Pon aquí la foto del Hero (fondo principal)
│   │   └── cards/
│   │       ├── primera-cita.jpg ← 📷 Fotos de cada recuerdo
│   │       ├── primer-beso.jpg
│   │       └── ...
│   │
│   └── videos/
│       ├── hero.mp4             ← 🎬 Video principal (opcional)
│       ├── primera-cita.mp4     ← 🎬 Videos de cada recuerdo
│       └── ...
│
└── README.md                    ← Este archivo
```

---

## 🛠️ Cómo Personalizar

### 1. Cambiar el Hero (portada principal)
En `assets/js/data.js`, edita el objeto `HERO`:
```js
const HERO = {
  title:       "El día que te conocí",   // Título grande
  titleEm:     "te conocí",              // La parte en rosa
  description: "Tu descripción aquí...",
  image:       "assets/images/hero/hero.jpg",  // Tu foto
  video:       "assets/videos/hero.mp4",        // O tu video
};
```

### 2. Agregar imágenes o videos a las tarjetas
En `assets/js/data.js`, en cada recuerdo dentro de `SECTIONS`, cambia:
```js
{ 
  title: "Primera Cita",
  emoji: "🌹",
  image: "assets/images/cards/primera-cita.jpg",  // ← pon la ruta de tu foto
  video: "assets/videos/primera-cita.mp4",          // ← o la ruta de tu video
  desc:  "Aquí va tu descripción del recuerdo..."
}
```
Si dejas `image` y `video` en `""`, se mostrará el emoji como fondo.

### 3. Cambiar los títulos de las secciones
Modifica las propiedades `title` de cada objeto en `SECTIONS`.

### 4. Contador de días juntos
Al abrir la página verás el contador. Haz clic en **"♥ Configurar Fecha"** e ingresa el día que comenzó tu relación. Se guarda automáticamente en el navegador.

---

## 🚀 Subir a GitHub Pages

1. Crea un repositorio en GitHub (puede ser privado o público)
2. Sube **toda la carpeta** tal cual (index.html + assets/)
3. Ve a **Settings → Pages**
4. En "Source" elige `main` y carpeta `/ (root)`
5. ¡Listo! Tu página estará en `https://tu-usuario.github.io/tu-repo/`

---

## 🎨 Colores Principales

| Variable            | Color       | Uso                        |
|---------------------|-------------|----------------------------|
| `--netflix-red`     | `#e50914`   | Botones principales, badges|
| `--pink`            | `#ff6b8a`   | Accentos románticos        |
| `--rose`            | `#c0396e`   | Degradados oscuros         |
| `--dark`            | `#141414`   | Fondo de tarjetas          |
| `--darker`          | `#0a0a0a`   | Fondo general              |

---

Hecho con ♥
