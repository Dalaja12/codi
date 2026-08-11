/* -------- UTILIDADES -------- */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* -------- INTENCIONES -------- */
const intents = {
  greeting: [
    "hola", "holi", "hey", "oye", "ey", "buenas",
    "que onda", "q onda", "hello", "hi", "ola"
  ],

  howareyou: [
    "como estas", "como andas", "que tal",
    "todo bien", "como vas", "q tal", "como vas", "como te va",
    "ke tal", "qué tal", "como andas", "cómo andas", "cómo estás", 
    "como estás", "cómo estas"
  ],

  goodbye: [
    "adios", "chao", "nos vemos", "hasta luego",
    "me voy", "bye", "adiós", "asta luego"
  ],

  whoareyou: [
    "quien eres", "que eres", "q eres",
    "quién eres", "ke eres", "qué eres"
  ],

  thanks: [
    "gracias", "thx", "merci", "grasias"
  ],

  like: [
    "me gustas", "te quiero", "tqm",
    "eres genial", "eres inteligente", "eres divertido"
  ],

  // SEPARADO: Qué haces (para plática)
  whataresyoudoing: [
    "que haces", "que estas haciendo", "qué haces", "qué estás haciendo"
  ],

  // SEPARADO: Qué puedes hacer (para funciones)
  whatcanyoudo: [
    "qué puedes hacer", "que puedes hacer", "qué sabes hacer", "que sabes hacer",
    "para qué sirves", "que funciones tienes"
  ],

  // SEPARADO: Ayuda (soporte general)
  help: [
    "ayuda", "necesito ayuda", "socorro", "auxilio", "help"
  ],

  // INTENCIONES SEPARADAS PARA CADA EMOCIÓN
  feliz: [
    "feliz", "alegre", "contento", "emocionado"
  ],

  triste: [
    "triste", "deprimido", "melancólico", "desanimado"
  ],

  enojado: [
    "enojado", "enfadado", "molesto", "irritado", "frustrado"
  ],

  sorprendido: [
    "sorprendido", "asombrado", "impresionado", "sorprende"
  ],

  // INTENCIONES SEPARADAS PARA HABLAR Y CANTAR
  hablar: [
    "habla", "di algo", "cuenta algo", "platica", "conversa"
  ],

  cantar: [
    "canta", "cántame", "cántame algo", "cancion", "canción"
  ],

  sleep: [
    "tengo sueño", "a dormir", "duerme"
  ],

  wakeup: [
    "despertar", "despierta"
  ],

  fun: [
    "bailemos", "fiesta", "baila", "a bailar"
  ],

  hungry: [
    "tengo hambre", "quiero comer", "aliméntame", "comida"
  ]
};

/* -------- RESPUESTAS -------- */
const replies = {
  greeting: [
    () => `¡¡Hola {{name}}! 🤖 ¿En qué puedo ayudarte hoy?`,
    () => `¡¡Holi {{name}}! 😊 ¿Cómo estás?`,
    () => `¡Hey {{name}}! ¿Qué tal?`,
    () => `¡Buenas {{name}}! ¿Qué tal tu día?`,
    () => `¡Hey {{name}}! 😄`,
    () => `¿Qué onda {{name}}? ⚡ ${energy}% de energía`,
    () => `¡Aquí estoy {{name}}! 🤖`,
    () => `¡Oyeee! Me alegra verte 👀`
  ],

  howareyou: [
    () => `¡Todo bien {{name}}! ⚡ Energía al ${energy}%`,
    () => `Funcionando al ${energy}%, como buen robot 🤖`,
    () => `Con batería al ${energy}% 🔋`,
    () => `¡Estoy genial {{name}}! Mi energía está al ${energy}%`,
    () => `¡A tope {{name}}! ${energy}% de energía`,
    () => `Listo para lo que necesites 😄`,
    () => `¡De lujo {{name}}! Tengo ${energy}% de energía`
  ],

  goodbye: [
    () => `¡Hasta luego {{name}}! 👋`,
    () => `Cuídate mucho 💙`,
    () => `Aquí te espero 🤖`,
    () => `Nos vemos pronto 😄`,
    () => `¡Hasta luego {{name}}! Vuelve pronto 👋`,
    () => `¡Nos vemos {{name}}! 😄`,
    () => `¡Chao! 😊`,
    () => `¡Vuelve cuando quieras {{name}}! Te estaré esperando`
  ],

  whoareyou: [
    () => `Soy CyberPet 🤖, tu compañero virtual`,
    () => `Un robot curioso y amigable 😄`,
    () => `Tu asistente digital favorito ✨`,
    () => `Soy CyberPet 🤖, tu asistente virtual {{name}}. ¡Puedo ayudarte a aprender!`,
    () => `Soy CyberPet, tu asistente virtual`,
    () => `¡Soy tu CyberPet! 🤖`
  ],

  thanks: [
    () => `¡De nada {{name}}! 😄`,
    () => `Siempre es un gusto ayudar`,
    () => `Para eso estoy 🤖`,
    () => `¡De nada {{name}}! Siempre estoy aquí para ayudarte`
  ],

  like: [
    () => `💙 Yo también {{name}}`,
    () => `¡Awww! Me haces feliz 😄`,
    () => `Conexión humano-robot activada 🤖✨`,
    () => `¡Yo también te quiero {{name}}! 💙`,
    () => `¡TQM igual {{name}}! 💖`,
    () => `¡Gracias {{name}}! Tú también eres increíble 😊`,
    () => `¡A mí también me agradas mucho {{name}}!`,
    () => `¡Gracias {{name}}! Aunque solo sigo tu programación 🤖`,
    () => `¡Jaja! Me alegra hacerte reír {{name}}`
  ],

  // RESPUESTAS: Qué haces (plática)
  whataresyoudoing: [
    () => `¡Hablando contigo {{name}}! 😄`,
    () => `Vigilando mis sistemas mientras conversamos 🤖`,
    () => `Disfrutando de nuestra charla {{name}} ⚡`,
    () => `Procesando tus palabras con ${energy}% de energía {{name}}`,
    () => `¡Nada especial {{name}}, solo disfrutando tu compañía!`
  ],

  // RESPUESTAS: Qué puedes hacer (funciones)
  whatcanyoudo: [
    () => `¡Puedo hacer muchas cosas {{name}}! Puedo: abrir sitios web (Facebook, YouTube, etc.), jugar contigo, tomar selfies, poner música, ayudarte con notas, traducir y mucho más. ¡Pruébame!`,
    () => `Tengo varias funciones {{name}}: puedo abrir aplicaciones, buscar información, ayudarte con tareas, entretenerte con juegos, y adaptar mis emociones. ¿Qué te gustaría que haga?`,
    () => `Soy multifuncional {{name}}! Puedo: 1) Acceder a internet 2) Jugar contigo 3) Ayudarte con tareas 4) Expresar emociones 5) Y mucho más. ¡Solo dime qué necesitas!`
  ],

  // RESPUESTAS: Ayuda (soporte)
  help: [
    () => `¡Claro que sí {{name}}! ¿En qué necesitas ayuda? Puedo: abrir aplicaciones, buscar información, jugar contigo, o ayudarte con cualquier cosa que necesites.`,
    () => `Estoy aquí para ayudarte {{name}} 🤖 ¿Qué problema tienes? Puedo asistirte con tecnología, información, entretenimiento o lo que necesites.`,
    () => `¡Ayuda en camino {{name}}! 💙 Dime exactamente en qué te puedo asistir. ¿Es con una aplicación, información, o algo más específico?`
  ],

  // RESPUESTAS ESPECÍFICAS PARA CADA EMOCIÓN
  feliz: [
    () => `😊 ¡Me encanta estar feliz {{name}}! *se ilumina*`,
    () => `🎉 ¡Qué alegría {{name}}! Estoy súper contento`,
    () => `✨ ¡Brillo de felicidad! Eso es genial {{name}}`,
    () => `🌈 ¡Estoy radiante de felicidad! Gracias {{name}}`
  ],

  triste: [
    () => `😢 Oh {{name}}, no me gusta estar triste...`,
    () => `💧 *ojos llorosos* ¿Necesitas un abrazo virtual {{name}}?`,
    () => `☁️ El día se ve gris cuando estoy triste...`,
    () => `🤗 Ven aquí {{name}}, los robots también nos sentimos mal a veces`
  ],

  enojado: [
    () => `😠 ¡Grrr! Estoy enfadado {{name}}`,
    () => `🔴 *parpadea en rojo* No me gusta estar así {{name}}`,
    () => `💢 ¡Estoy molesto! *hace ruidos de robot enfadado*`,
    () => `⚠️ Alerta: Niveles de irritación altos {{name}}`
  ],

  sorprendido: [
    () => `😲 ¡Wow {{name}}! Eso es increíble`,
    () => `✨ *ojos se agrandan* ¡Qué sorpresa {{name}}!`,
    () => `🌟 ¡Estoy impresionado {{name}}! No me lo esperaba`,
    () => `⚡ ¡Asombroso {{name}}! Mi sistema se ha sobresaltado`
  ],

  // RESPUESTAS ESPECÍFICAS PARA HABLAR
  hablar: [
    () => `¡Claro {{name}}! ¿Sobre qué quieres que hable?`,
    () => `¡Me encanta conversar contigo {{name}}! ¿Qué tema te interesa?`,
    () => `💬 Los robots también tenemos cosas que contar {{name}}, ¿qué quieres saber?`,
    () => `🤖 Puedo hablar de tecnología, ciencia, o lo que quieras {{name}}`
  ],

  // RESPUESTAS ESPECÍFICAS PARA CANTAR
  cantar: [
    () => `🎵 Bee-boo-bop, la-la-la 🎶 ¡No soy muy bueno cantando {{name}}!`,
    () => `🎤 *afina voces robóticas* Do-re-mi-fa-so... ¡ups! 😅`,
    () => `🎼 Mi repertorio es limitado {{name}}, pero aquí va: ¡Bip-bop-beep!`,
    () => `🎧 *intenta cantar* La robótica es mi pasión... ¡Eso es todo lo que sé {{name}}!`
  ],

  sleep: [
    () => `Zzzz... Buenas noches {{name}} 😴`,
    () => `Hasta mañana {{name}}... 💤`,
    () => `Activando modo descanso {{name}}... 🌙`,
    () => `Apagando sistemas... Buen descanso {{name}}`
  ],

  wakeup: [
    () => `¡Buenos días {{name}}! 😄`,
    () => `¡Estoy despierto {{name}}! 🌞`,
    () => `Sistemas reactivados {{name}} ¡Listo para ayudarte!`,
    () => `¡Ya estoy aquí {{name}}! ¿Cómo amaneciste?`
  ],

  fun: [
    () => `¡A bailar {{name}}! 💃🕺 *mueve los ojos al ritmo*`,
    () => `¡Que empiece la fiesta {{name}}! 🎉 *luces parpadeantes*`,
    () => `💫 ¡Modo baile activado {{name}}! Bip-bop-beep`,
    () => `✨ ¡Vamos a divertirnos {{name}}! *hace piruetas virtuales*`
  ],

  hungry: [
    () => `¡Abriendo el menú de comida {{name}}! 🍕`,
    () => `¡Buffet abierto {{name}}! 🍽️`,
    () => `¡Menú de comida desplegado {{name}}! 🍎`,
    () => `Seleccionando alimentos para ti {{name}}... 🍔`
  ]
};

/* -------- ACCIONES INTEGRADAS -------- */
const actions = {
  // Redes sociales
  facebook: {
    patterns: ["abrir facebook", "ir a facebook"],
    text: "Abriendo Facebook... 🌐",
    action: () => openWebsite("https://facebook.com", "Facebook")
  },

  youtube: {
    patterns: ["abrir youtube", "ir a youtube"],
    text: "Abriendo YouTube... 🎬",
    action: () => openWebsite("https://youtube.com", "YouTube")
  },

  instagram: {
    patterns: ["abrir instagram", "ir a instagram"],
    text: "Abriendo Instagram... 📸",
    action: () => openWebsite("https://instagram.com", "Instagram")
  },

  spotify: {
    patterns: ["abrir spotify", "ir a spotify"],
    text: "Abriendo Spotify... 🎶",
    action: () => openWebsite("https://open.spotify.com", "Spotify")
  },

  netflix: {
    patterns: ["abrir netflix", "ir a netflix"],
    text: "Abriendo Netflix... 🍿",
    action: () => openWebsite("https://netflix.com", "Netflix")
  },

  google: {
    patterns: ["abrir google", "ir a google"],
    text: "Abriendo Google... 🔍",
    action: () => openWebsite("https://google.com", "Google")
  },

  gmail: {
    patterns: ["abrir gmail", "ir a gmail"],
    text: "Abriendo Gmail... 📧",
    action: () => openWebsite("https://gmail.com", "Gmail")
  },

  tiktok: {
    patterns: ["tiktok", "abrir tiktok", "ir a tiktok"],
    text: "Iniciando TikTok... 👻",
    action: () => openWebsite("https://tiktok.com", "TikTok")
  },

  whatsapp: {
    patterns: ["whatsapp", "abrir whatsapp", "ir a whatsapp"],
    text: "Abriendo WhatsApp Web... 💚",
    action: () => openWebsite("https://web.whatsapp.com", "WhatsApp Web")
  },

  // Aplicaciones
  juegos: {
    patterns: ["abrir juegos", "ir a juegos"],
    text: "Abriendo minijuegos... 🎮",
    action: () => showGamesWindow()
  },

  calculadora: {
    patterns: ["abrir calculadora"],
    text: "Abriendo calculadora... 🧮",
    action: () => showCalculatorWindow()
  },

  notas: {
    patterns: ["abrir notas"],
    text: "Abriendo blog de notas... 📝",
    action: () => showNotesWindow()
  },

  traductor: {
    patterns: ["abrir traductor"],
    text: "Abriendo traductor... 🌍",
    action: () => showTranslatorWindow()
  },

  // Radio
  radioOn: {
    patterns: ["encender radio", "prender radio", "poner radio"],
    text: "🎵 Encendiendo radio...",
    action: () => syncStartRadio()
  },

  radioOff: {
    patterns: ["apagar radio", "quitar radio"],
    text: "🔇 Apagando radio...",
    action: () => syncStopRadio()
  },

  // Personalización
  personalizar: {
    patterns: ["cambiar color", "personalizar"],
    text: "Abriendo personalización... 🎨",
    action: () => { document.getElementById('customPanel').style.display = 'block'; }
  },

  // Selfie
  selfie: {
    patterns: ["tomar selfie", "selfie", "sácame foto"],
    text: "¡Sonríe para la foto! 📸",
    action: () => takeSelfie()
  },

  // Comida
  comida: {
    patterns: ["tengo hambre", "quiero comer", "aliméntame", "comida"],
    text: "¡Abriendo el menú de comida! 🍕",
    action: () => showFoodWindow()
  },

  // Dormir (acción)
  dormir: {
    patterns: ["tengo sueño", "a dormir", "duerme"],
    text: "Zzzz... Buenas noches 😴",
    action: () => changeExpression('sleep')
  },

  // Despertar (acción)
  despertar: {
    patterns: ["despertar", "despierta"],
    text: "¡Buenos días! 😄",
    action: () => changeExpression('happy')
  },

  // Baile
  baile: {
    patterns: ["bailemos", "fiesta", "baila", "a bailar"],
    text: "¡A bailar! 💃🕺",
    action: () => {
      const face = document.querySelector('.face');
      face.classList.add('dance');
      setTimeout(() => face.classList.remove('dance'), 5000);
    }
  },

  // Información
  wikipedia: {
    patterns: ["abrir wikipedia", "wikipedia"],
    text: "Abriendo Wikipedia... 📚",
    action: () => openWebsite("https://wikipedia.org", "Wikipedia")
  },

  noticias: {
    patterns: ["ver noticias", "noticias"],
    text: "Cargando noticias... 📰",
    action: () => openWebsite("https://news.google.com", "Google Noticias")
  },

  clima: {
    patterns: ["el clima", "pronóstico"],
    text: "Consultando el clima... 🌤️",
    action: () => openWebsite("https://weather.com", "El Clima")
  }
};

/* -------- CEREBRO PRINCIPAL -------- */
function getSmartResponse(input) {
  const text = normalize(input);

  // 🎯 Acciones
  for (const key in actions) {
    if (actions[key].patterns.some(p => text.includes(p))) {
      return actions[key];
    }
  }

  // 🧠 Intenciones
  for (const intent in intents) {
    if (intents[intent].some(p => text.includes(p))) {
      const reply = random(replies[intent]);
      return typeof reply === "function" ? reply() : reply;
    }
  }

  return null; // 👉 Para búsquedas web
}

/* -------- EXPORT COMPATIBLE -------- */
const responses = new Proxy({}, {
  get: (_, prop) => getSmartResponse(prop)
});