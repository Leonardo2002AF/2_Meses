/* ══════════════════════════════════════════
   NUESTROS RECUERDOS — Datos de Recuerdos
   ══════════════════════════════════════════
   
   👉 CÓMO PERSONALIZAR:
   
   Cada recuerdo tiene:
     title:    Nombre del recuerdo
     emoji:    Emoji representativo
     sub:      Descripción corta (subtítulo)
     desc:     Descripción larga (para el modal)
     gradient: Fondo de la tarjeta (mientras no haya imagen)
     image:    Ruta a la imagen  → "assets/images/cards/nombre.jpg"
     video:    Ruta al video     → "assets/videos/nombre.mp4"
   
   Si dejas image o video en "" (vacío), se mostrará el emoji.
   ══════════════════════════════════════════ */

const HERO = {
  badge:       "💫 Recuerdo del Día",
  title:       "La Primera Vez que te Vi",
  titleEm:     "te Vi",
  match:       "💖 99% Amor",
  year:        "2024",
  description: "Ese momento mágico donde todo cambió. La luz, tu sonrisa, esa sensación de que algo increíble estaba por comenzar. Un recuerdo que vale para toda la vida.",
  image:       "assets/images/hero/Primera vez.jpeg",   // ← cambia por tu foto
  video:       "assets/videos/Video 1.mp4",         // ← o pon tu video
};

const SECTIONS = [
  {
    id:    "c1",
    title: "▶ Seguir Viendo",
    items: [
      { title: "Primera Cita",    emoji: "🌹", sub: "El comienzo de todo",       desc: "El día que todo comenzó. Esa primera cita que nos dejó sin palabras y con el corazón latiendo a mil.", gradient: "linear-gradient(135deg,#4a0015,#c0396e)", image: "", video: "" },
      { title: "Primer Beso",     emoji: "💋", sub: "Un momento eterno",         desc: "El instante que quedará grabado para siempre. El primero de muchos.",                                  gradient: "linear-gradient(135deg,#1a0030,#7b2d9e)", image: "", video: "" },
      { title: "Nuestro Parque",  emoji: "🌿", sub: "Tarde de domingo",          desc: "Esas tardes de domingo en el parque, sin apuro, solo disfrutando el momento juntos.",                 gradient: "linear-gradient(135deg,#002a0f,#1a6b3c)", image: "", video: "" },
      { title: "Cine Juntos",     emoji: "🎬", sub: "Nuestra película favorita", desc: "Más que la película, lo que importó fue estar ahí, juntos, compartiendo palomitas y risas.",           gradient: "linear-gradient(135deg,#001a2a,#1a5276)", image: "", video: "" },
      { title: "La Llamada",      emoji: "📞", sub: "3 horas hablando",          desc: "Aquella llamada que empezó en '5 minutitos' y terminó 3 horas después. No queríamos colgar.",         gradient: "linear-gradient(135deg,#2a1a00,#c0800e)", image: "", video: "" },
      { title: "Sorpresa Especial",emoji: "🎁", sub: "Nunca olvidaré tu cara",   desc: "La cara que pusiste cuando viste la sorpresa... no tiene precio. Ese momento es uno de mis favoritos.",gradient: "linear-gradient(135deg,#1a0a0a,#8b0000)", image: "", video: "" },
      { title: "Concierto",       emoji: "🎵", sub: "Bailamos toda la noche",    desc: "La música, las luces, y tú. Bailamos sin parar y cada canción se convirtió en nuestra canción.",      gradient: "linear-gradient(135deg,#0a0a2a,#4040c0)", image: "", video: "" },
      { title: "Tu Cumpleaños",   emoji: "🎂", sub: "Tu día especial",           desc: "Cada cumpleaños contigo es una nueva razón para celebrar la vida. ¡Feliz de estar aquí contigo!",     gradient: "linear-gradient(135deg,#2a1a00,#e5a80e)", image: "", video: "" },
    ]
  },
  {
    id:    "c2",
    title: "⭐ Momentos Destacados",
    items: [
      { title: "Playa Hermosa",   emoji: "🏖️", sub: "Atardecer mágico",         desc: "El sol cayendo sobre el mar mientras nos tomábamos de la mano. Perfectamente imperfecto.",           gradient: "linear-gradient(135deg,#002040,#e5840e)", image: "", video: "" },
      { title: "Montaña Nevada",  emoji: "⛄",  sub: "Primer invierno juntos",   desc: "Frío afuera, calidez adentro. Ese primer invierno juntos lo recordaré siempre.",                     gradient: "linear-gradient(135deg,#101040,#4080c0)", image: "", video: "" },
      { title: "Cena Romántica",  emoji: "🍷", sub: "Cena perfecta",            desc: "Luz de velas, música suave y tú frente a mí. Una noche que no hubiera cambiado por nada.",           gradient: "linear-gradient(135deg,#1a0010,#8b1040)", image: "", video: "" },
      { title: "Nuestro Café",    emoji: "☕", sub: "Sábados de lluvia",        desc: "Esos sábados con lluvia en la ventana, un café caliente y horas de conversación sin fin.",           gradient: "linear-gradient(135deg,#1a1000,#704010)", image: "", video: "" },
      { title: "La Foto Perfecta",emoji: "📸", sub: "La favorita de los dos",   desc: "De todas las fotos juntos, esta es la favorita. Captura exactamente cómo nos sentimos.",             gradient: "linear-gradient(135deg,#001010,#106060)", image: "", video: "" },
      { title: "Cocinar Juntos",  emoji: "🍳", sub: "El desastre más lindo",    desc: "Prometimos hacer una receta sencilla. Terminó siendo un hermoso desastre que nos hizo reír horas.",  gradient: "linear-gradient(135deg,#1a0a00,#c0600e)", image: "", video: "" },
      { title: "Bailar en Casa",  emoji: "💃", sub: "Sin música, solo nosotros", desc: "Sin playlist, sin ensayar, solo nosotros bailando en la sala. Uno de mis momentos favoritos.",      gradient: "linear-gradient(135deg,#1a0020,#9010a0)", image: "", video: "" },
      { title: "Primer Viaje",    emoji: "🧳", sub: "La aventura comenzó aquí", desc: "El primer viaje juntos fue el primero de muchos. Desde ese día supe que quería recorrer el mundo contigo.", gradient: "linear-gradient(135deg,#001520,#108060)", image: "", video: "" },
    ]
  },
  {
    id:    "c4",
    title: "✈ Viajes Juntos",
    items: [
      { title: "Playa & Sol",    emoji: "🏝️", sub: "Aguas cristalinas",       desc: "Arena blanca, agua turquesa y los dos solos en el mundo. El viaje de nuestros sueños.",             gradient: "linear-gradient(135deg,#002040,#00a0b0)", image: "", video: "" },
      { title: "Montañas 🏔️",   emoji: "⛺", sub: "Camping bajo las estrellas", desc: "Dormir bajo un cielo lleno de estrellas contigo fue una de las experiencias más bonitas de mi vida.", gradient: "linear-gradient(135deg,#101010,#305060)", image: "", video: "" },
      { title: "Ciudad Nueva",   emoji: "🏙️", sub: "Explorando juntos",       desc: "Perderse en una ciudad nueva juntos, sin mapa ni plan. La mejor forma de descubrir el mundo.",       gradient: "linear-gradient(135deg,#0a0a1a,#204080)", image: "", video: "" },
      { title: "Pueblo Mágico",  emoji: "🏘️", sub: "Perdidos y felices",      desc: "Nos perdimos entre callecitas adoquinadas y no quisimos encontrar el camino de vuelta.",              gradient: "linear-gradient(135deg,#1a1000,#804000)", image: "", video: "" },
      { title: "El Gran Vuelo",  emoji: "✈️", sub: "Tomados de la mano",      desc: "El nerviosismo del despegue, tu mano en la mía. Todo viaje contigo es el mejor.",                   gradient: "linear-gradient(135deg,#000a1a,#104080)", image: "", video: "" },
      { title: "Road Trip",      emoji: "🚗", sub: "Música y carretera",       desc: "Ventanas abajo, música a todo volumen y una carretera sin fin. El mejor road trip de la historia.", gradient: "linear-gradient(135deg,#0a1000,#204010)", image: "", video: "" },
    ]
  },
  {
    id:    "c5",
    title: "🎂 Fechas Especiales",
    items: [
      { title: "Aniversario 1",  emoji: "💍", sub: "Un año juntos",           desc: "Un año lleno de aventuras, risas, aprendizajes y amor. El primero de muchos aniversarios.",         gradient: "linear-gradient(135deg,#1a0a0a,#c03060)", image: "", video: "" },
      { title: "San Valentín",   emoji: "💝", sub: "Lleno de sorpresas",      desc: "Un San Valentín que superó todas las expectativas. Gracias por hacerlo tan especial.",              gradient: "linear-gradient(135deg,#2a0010,#e03060)", image: "", video: "" },
      { title: "Navidad Juntos", emoji: "🎄", sub: "Primera navidad",         desc: "La primera navidad que pasamos juntos. Luces, villancicos y la mejor compañía del mundo.",          gradient: "linear-gradient(135deg,#001a00,#206040)", image: "", video: "" },
      { title: "Año Nuevo",      emoji: "🎆", sub: "Brindamos por nosotros",  desc: "A las 12 en punto, brindamos por nosotros, por este año y por todos los que vendrán.",              gradient: "linear-gradient(135deg,#1a1a00,#c09000)", image: "", video: "" },
      { title: "Tu Cumple ❤️",  emoji: "🎂", sub: "Festejamos todo el día",  desc: "Tu cumpleaños se convirtió en uno de mis días favoritos del año. Me encanta celebrarte.",          gradient: "linear-gradient(135deg,#1a0020,#9020c0)", image: "", video: "" },
      { title: "Mi Cumple ❤️",  emoji: "🥳", sub: "Me hiciste sentir especial", desc: "Hiciste que mi cumpleaños fuera el más especial de todos. Gracias por cada detallito.",         gradient: "linear-gradient(135deg,#1a1000,#c06000)", image: "", video: "" },
    ]
  },
  {
    id:    "c6",
    title: "🏠 Momentos en Casa",
    items: [
      { title: "Día de Lluvia",   emoji: "🌧️", sub: "Películas y café",       desc: "La lluvia golpeando la ventana, una peli, café caliente y tú a mi lado. Perfección absoluta.",    gradient: "linear-gradient(135deg,#101010,#204060)", image: "", video: "" },
      { title: "Nuestra Pizza",   emoji: "🍕", sub: "La pizza más especial",   desc: "Decidimos hacer pizza casera. Quedó rara, pero fue la más rica que he comido en mi vida.",        gradient: "linear-gradient(135deg,#1a0a00,#c04000)", image: "", video: "" },
      { title: "Mañana Lenta",    emoji: "☀️", sub: "Desayuno en cama",        desc: "Esas mañanas sin prisa, con desayuno en cama y horas de conversación bajo las cobijas.",          gradient: "linear-gradient(135deg,#1a1000,#c09020)", image: "", video: "" },
      { title: "Noche de Series", emoji: "📺", sub: "Quedamos dormidos",        desc: "Pusimos una serie, dijimos 'solo un capítulo' y amanecimos en el sillón. Clásico nuestro.",      gradient: "linear-gradient(135deg,#0a000a,#3a0060)", image: "", video: "" },
      { title: "Jardín en Flor",  emoji: "🌸", sub: "Primavera en casa",       desc: "Ver cómo florecen las plantas que sembramos juntos es una pequeña metáfora de lo nuestro.",       gradient: "linear-gradient(135deg,#100a10,#c03060)", image: "", video: "" },
      { title: "Domingo Perfecto",emoji: "🛋️", sub: "Sin planes, felices",    desc: "A veces el mejor plan es no tener plan. Solo estar juntos, sin apuro y con todo el tiempo del mundo.", gradient: "linear-gradient(135deg,#0a0a00,#605020)", image: "", video: "" },
    ]
  },
];

const TOP10 = [
  { title: "Primera Cita",     emoji: "🌹", gradient: "linear-gradient(135deg,#4a0015,#c0396e)" },
  { title: "Primer Beso",      emoji: "💋", gradient: "linear-gradient(135deg,#1a0030,#7b2d9e)" },
  { title: "Playa & Atardecer",emoji: "🏖️", gradient: "linear-gradient(135deg,#002040,#e5840e)" },
  { title: "Aniversario",      emoji: "💍", gradient: "linear-gradient(135deg,#1a0a0a,#c03060)" },
  { title: "Viaje Juntos",     emoji: "✈️", gradient: "linear-gradient(135deg,#1a1000,#c0800e)" },
  { title: "San Valentín",     emoji: "💝", gradient: "linear-gradient(135deg,#2a0010,#e03060)" },
  { title: "La Sorpresa",      emoji: "🎁", gradient: "linear-gradient(135deg,#1a0a0a,#8b0000)" },
  { title: "El Concierto",     emoji: "🎵", gradient: "linear-gradient(135deg,#0a0a2a,#4040c0)" },
  { title: "Navidad",          emoji: "🎄", gradient: "linear-gradient(135deg,#001a00,#206040)" },
  { title: "Año Nuevo",        emoji: "🎆", gradient: "linear-gradient(135deg,#1a1a00,#c09000)" },
];
