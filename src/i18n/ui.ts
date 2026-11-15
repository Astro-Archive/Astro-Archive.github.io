import type { Lang } from './types';

const en = {
  // HUD / chrome
  brandSub: 'Those who keep listening',
  catalog: (n: number) => `Catalog ${n}/4`,
  openCatalog: (n: number) => `Open the memory catalog, ${n} of 4 machines interviewed`,
  readingOn: 'Reading mode',
  readingOff: 'View 3D tour',
  simulator: 'Interactive simulator',
  openSimulator: 'Open the interactive simulator',
  credits: 'Models: NASA 3D Resources · Data: NSSDCA',
  language: 'Language',
  english: 'English',
  spanish: 'Spanish',

  heroKicker: '2026 NASA Space Apps Challenge',
  heroLine1: 'Four machines that no longer transmit.',
  heroLine2: 'Their stories still do.',
  heroHint: 'Scroll to start the tour',

  loaderKicker: 'Establishing link',
  loaderNote: '4 artifacts · Moon, Mars and deep space',

  // chapter card
  minigameTag: 'Minigame · 20 seconds',
  gameTitleDescent: 'Pilot the descent',
  gameCtaDescent: 'Attempt the landing',
  gameTitleEnergy: 'The last winter',
  gameCtaEnergy: 'Share the power',
  factWhat: 'What it is',
  factWhy: 'Why it flew',
  factFound: 'What it found',
  factNow: 'What it is now',
  voiceTag: 'Fictionalized voice',
  connect: 'Connect with the machine',
  noteTag: 'Watch the fact',
  sources: 'Sources',

  // signal meter / timeline
  signalAria: (label: string) => `Signal status: ${label}`,
  signalWords: ['active', 'dormant', 'silent', 'lost'],
  timelineAria: 'Tour of the artifacts',

  // epilogue
  epilogueKicker: 'Epilogue',
  restart: 'Back to the start',
  readWithout3d: 'Read without 3D',
  epilogueCredit:
    '3D models: NASA 3D Resources · Data: NSSDCA and NASA Science · NASA does not sponsor or endorse this project.',

  // reading mode
  readingAria: 'Reading mode',
  readingKicker: 'Reading mode · no 3D',
  backToTour: 'Back to the tour',
  readingIntro:
    'Since 1969, NASA has left machines on the Moon, on Mars and in deep space. Some still answer. Others have been silent for decades. These are four of their stories: what they were, why they flew and what they discovered.',
  gameAvailable: 'Minigame available in 3D',
  readingGameDescent:
    'Piloting the descent teaches that the descent stage could not return to lunar orbit: even with fuel to spare, going back needed another engine and another tank.',
  readingGameEnergy:
    'Sharing power through the last sols teaches that the 2018 storm was not a breakdown but a budget that ran out: 468, 345, 133 and 22 watt-hours.',
  readingSources: 'Sources:',
  readingFooter1:
    '3D models: NASA 3D Resources. Data: NSSDCA and NASA Science mission pages. The texts under "Fictionalized voice" are literary recreations, not real transmissions.',
  readingFooter2:
    'NASA does not sponsor or endorse this project. NASA is the source of the models and the cited data.',

  // catalog
  catalogAria: 'Memory catalog',
  catalogKicker: 'Memory catalog',
  catalogTitle: (recovered: number, total: number) => `${recovered} of ${total} fragments`,
  catalogSubtitle: (done: number, total: number) => `${done} of ${total} machines interviewed`,
  backToMuseum: 'Back to the museum',
  catalogCount: (found: number, possible: number) => `${found} of ${possible} fragments`,
  catalogEmpty: 'You have not connected with this machine yet.',
  catalogConnect: 'Connect',
  catalogReconnect: 'Reconnect',
  catalogFooter:
    'Each conversation spends four signal units. What is not asked cannot be recovered; the catalog keeps what is.',
  catalogReset: 'Erase progress',
  catalogResetConfirm: 'Erase the whole memory catalog?',

  // interview
  interviewAria: (name: string) => `Interview with ${name}`,
  interviewKicker: (signal: number) => `Interview · signal ${signal}/4`,
  pipsAria: (signal: number) => `${signal} of 4 signal units`,
  soundWord: 'Sound',
  soundShort: 'SFX',
  soundOnState: 'on',
  soundOffState: 'off',
  soundAriaOn: 'Typing sound on',
  soundAriaOff: 'Typing sound off',
  you: 'You',
  asking: 'What do you ask? Each question spends one signal unit.',
  linkOver: 'The link is over.',
  entryCount: (asked: number, total: number, found: number, possible: number) =>
    `You asked ${asked} of ${total}. You recovered ${found} of ${possible} fragments.`,
  entryEmpty: 'You did not recover anything. What is not asked is lost.',
  reconnect: 'Reconnect',
  viewCatalog: 'View catalog',
  hintAsking: 'Choose a question · keys 1-7',
  hintContinue: 'Click or Space to continue',
  portraitAlt: (name: string) => `Portrait of ${name}`,

  // descent game
  descentAria: 'Lunar descent simulator',
  descentKicker: 'Simplified simulation',
  descentTitle: 'Lunar descent',
  altitude: 'Altitude',
  vertical: 'Vertical',
  drift: 'Drift',
  lateral: 'Lateral',
  fuel: 'Fuel',
  lowFuel: 'Low fuel',
  engineWord: 'ENGINE',
  controlsAria: 'Controls',
  pushLeft: 'Push left',
  pushRight: 'Push right',
  turnEngineOn: 'Turn the engine on',
  descentLead:
    'You are 70 meters above the Sea of Tranquility. Descend to less than 1.5 m/s and inside the circle.',
  tipThrustRest: 'or the space bar to brake. It burns fuel.',
  tipDriftPre: '← →',
  tipDriftRest: 'to correct the drift.',
  tipGravity: 'Lunar gravity is 1.62 m/s²: six times less than on Earth.',
  startDescent: 'Start the descent',
  descentFoot: 'About 20 seconds. You can try again.',
  landing: 'Landing',
  impact: 'Impact',
  touchedDown: 'You touched down softly.',
  didNotMakeIt: 'You did not make it.',
  reasonOutside: 'You ended up outside the circle: rough terrain, a broken leg.',
  reasonHard: (vy: string) => `You touched down at ${vy} m/s. The landing gear cannot take that.`,
  reasonSoft: (vy: string) => `You touched down at ${vy} m/s, inside the circle.`,
  wonFuel: (fuel: number) =>
    `You had ${fuel}% of the fuel left. Apollo 11 had 4.2%: 770 pounds out of 18,184. Later analyses calculated that was about 45 seconds of flight, and 20 of those seconds were reserved for an abort.`,
  wonLesson:
    'And here is the key to the artifact: even if you had 100% left, you could not have lifted off. Returning to lunar orbit needed another engine and another tank. That is why the descent stage stayed on the Moon: it did not break, it could not go up.',
  retry: 'Try again',

  // energy game
  energyAria: "Opportunity's last winter",
  solDates: ['June 3, 2018', 'June 4, 2018', 'June 6, 2018', 'June 10, 2018'],
  energyKicker: 'The last winter',
  energyTitle: 'Power budget',
  endKicker: 'End of mission',
  silenceTitle: 'Silence',
  energyResultTitle: (sent: number, total: number) =>
    `You sent ${sent} of ${total} data points home.`,
  energyNoWay:
    'There was no way to win, and that is the point: the storm was bigger than any power budget. With 22 watt-hours you cannot warm a battery or turn on an antenna.',
  energyLesson:
    'On June 10, 2018, Opportunity transmitted for the last time. That message carried a measurement: the opacity of the Martian atmosphere had reached 10.8, the highest value ever measured on Mars. NASA called it more than a thousand times over eight months. It never answered.',
  backToChapter: 'Back to the chapter',
  availableWh: (wh: number) => `${wh} Wh available`,
  opacity: (tau: number) => `opacity ${tau}`,
  actionHeat: 'Warm the battery',
  actionMeasure: 'Take a measurement',
  actionTransmit: 'Transmit to Earth',
  battery: 'Battery',
  warm: 'warm',
  cold: 'cold',
  unsent: 'Data unsent',
  sent: 'Sent',
  endSol: 'End the sol',
  energyFoot:
    'If you spend a sol without warming the battery, the cold damages it. Two sols in a row and the mission ends.',
  logMeasured: (label: string) => `${label}: measurement stored in memory.`,
  logTransmitted: (label: string, n: number) =>
    `${label}: ${n} data point${n > 1 ? 's' : ''} sent to Earth.`,
  logNothing: (label: string) => `${label}: the antenna turned on, but there was nothing to send.`,
  logHeated: (label: string) => `${label}: battery warm, the instruments hold.`,
};

export type UIStrings = typeof en;

const es: UIStrings = {
  brandSub: 'Los que siguen escuchando',
  catalog: (n) => `Catálogo ${n}/4`,
  openCatalog: (n) => `Abrir catálogo de memoria, ${n} de 4 artefactos entrevistados`,
  readingOn: 'Modo lectura',
  readingOff: 'Ver recorrido 3D',
  simulator: 'Simulador interactivo',
  openSimulator: 'Abrir el simulador interactivo',
  credits: 'Modelos: NASA 3D Resources · Datos: NSSDCA',
  language: 'Idioma',
  english: 'Inglés',
  spanish: 'Español',

  heroKicker: '2026 NASA Space Apps Challenge',
  heroLine1: 'Cuatro máquinas que ya no transmiten.',
  heroLine2: 'Sus historias sí.',
  heroHint: 'Desliza para empezar el recorrido',

  loaderKicker: 'Estableciendo enlace',
  loaderNote: '4 artefactos · Luna, Marte y espacio profundo',

  minigameTag: 'Minijuego · 20 segundos',
  gameTitleDescent: 'Pilota el descenso',
  gameCtaDescent: 'Intentar el aterrizaje',
  gameTitleEnergy: 'El último invierno',
  gameCtaEnergy: 'Repartir la energía',
  factWhat: 'Qué es',
  factWhy: 'Por qué fue',
  factFound: 'Qué encontró',
  factNow: 'Qué es ahora',
  voiceTag: 'Voz ficcionalizada',
  connect: 'Conectar con la máquina',
  noteTag: 'Ojo con el dato',
  sources: 'Fuentes',

  signalAria: (label) => `Estado de la señal: ${label}`,
  signalWords: ['activo', 'durmiente', 'silencioso', 'perdido'],
  timelineAria: 'Recorrido por los artefactos',

  epilogueKicker: 'Epílogo',
  restart: 'Volver al principio',
  readWithout3d: 'Leer sin 3D',
  epilogueCredit:
    'Modelos 3D: NASA 3D Resources · Datos: NSSDCA y NASA Science · NASA no patrocina ni respalda este proyecto.',

  readingAria: 'Modo lectura',
  readingKicker: 'Modo lectura · sin 3D',
  backToTour: 'Volver al recorrido',
  readingIntro:
    'Desde 1969, la NASA ha dejado máquinas en la Luna, en Marte y en el espacio profundo. Algunas todavía responden. Otras llevan décadas en silencio. Estas son cuatro de sus historias: qué eran, por qué fueron y qué descubrieron.',
  gameAvailable: 'Minijuego disponible en 3D',
  readingGameDescent:
    'Pilotar el descenso enseña que la etapa de descenso no podía volver a la órbita lunar: aunque sobrara combustible, el regreso necesitaba otro motor y otro tanque.',
  readingGameEnergy:
    'Repartir la energía de los últimos soles enseña que la tormenta de 2018 no fue una avería, sino un presupuesto que se agotó: 468, 345, 133 y 22 vatios-hora.',
  readingSources: 'Fuentes:',
  readingFooter1:
    'Modelos 3D: NASA 3D Resources. Datos: NSSDCA y páginas de misión de NASA Science. Los textos de la sección «Voz ficcionalizada» son recreaciones literarias, no transmisiones reales.',
  readingFooter2:
    'NASA no patrocina ni respalda este proyecto. NASA es la fuente de los modelos y de los datos citados.',

  catalogAria: 'Catálogo de memoria',
  catalogKicker: 'Catálogo de memoria',
  catalogTitle: (recovered, total) => `${recovered} de ${total} fragmentos`,
  catalogSubtitle: (done, total) => `${done} de ${total} artefactos entrevistados`,
  backToMuseum: 'Volver al museo',
  catalogCount: (found, possible) => `${found} de ${possible} fragmentos`,
  catalogEmpty: 'Aún no has conectado con esta máquina.',
  catalogConnect: 'Conectar',
  catalogReconnect: 'Volver a conectar',
  catalogFooter:
    'Cada conversación gasta cuatro unidades de señal. Lo que no se pregunta no se puede recuperar; el catálogo guarda lo que sí.',
  catalogReset: 'Borrar progreso',
  catalogResetConfirm: '¿Borrar todo el catálogo de memoria?',

  interviewAria: (name) => `Entrevista con ${name}`,
  interviewKicker: (signal) => `Entrevista · señal ${signal}/4`,
  pipsAria: (signal) => `${signal} de 4 unidades de señal`,
  soundWord: 'Sonido',
  soundShort: 'SFX',
  soundOnState: 'on',
  soundOffState: 'off',
  soundAriaOn: 'Sonido de escritura activado',
  soundAriaOff: 'Sonido de escritura desactivado',
  you: 'Tú',
  asking: '¿Qué le preguntas? Cada pregunta gasta una unidad de señal.',
  linkOver: 'Se acabó el enlace.',
  entryCount: (asked, total, found, possible) =>
    `Preguntaste ${asked} de ${total}. Recuperaste ${found} de ${possible} fragmentos.`,
  entryEmpty: 'No alcanzaste a recuperar nada. Lo que no se pregunta, se pierde.',
  reconnect: 'Volver a conectar',
  viewCatalog: 'Ver catálogo',
  hintAsking: 'Elige una pregunta · teclas 1-7',
  hintContinue: 'Clic o Espacio para continuar',
  portraitAlt: (name) => `Retrato de ${name}`,

  descentAria: 'Simulador de descenso lunar',
  descentKicker: 'Simulación simplificada',
  descentTitle: 'Descenso lunar',
  altitude: 'Altitud',
  vertical: 'Vertical',
  drift: 'Deriva',
  lateral: 'Lateral',
  fuel: 'Combustible',
  lowFuel: 'Combustible bajo',
  engineWord: 'MOTOR',
  controlsAria: 'Controles',
  pushLeft: 'Empujar a la izquierda',
  pushRight: 'Empujar a la derecha',
  turnEngineOn: 'Encender el motor',
  descentLead:
    'Estás a 70 metros sobre el Mar de la Tranquilidad. Baja a menos de 1,5 m/s y dentro del círculo.',
  tipThrustRest: 'o la barra espaciadora para frenar. Consume combustible.',
  tipDriftPre: '← →',
  tipDriftRest: 'para corregir la deriva.',
  tipGravity: 'La gravedad lunar es 1,62 m/s²: seis veces menos que en la Tierra.',
  startDescent: 'Empezar el descenso',
  descentFoot: 'Unos 20 segundos. Se puede repetir.',
  landing: 'Aterrizaje',
  impact: 'Impacto',
  touchedDown: 'Tocaste suave.',
  didNotMakeIt: 'No llegaste.',
  reasonOutside: 'Te quedaste fuera del círculo: terreno irregular, una pata rota.',
  reasonHard: (vy) => `Tocaste a ${vy} m/s. El tren de aterrizaje no aguanta eso.`,
  reasonSoft: (vy) => `Tocaste a ${vy} m/s, dentro del círculo.`,
  wonFuel: (fuel) =>
    `Te quedó el ${fuel} % del combustible. En el Apolo 11 quedaba el 4,2 %: 770 libras de 18.184. Los análisis posteriores calcularon que era combustible para unos 45 segundos de vuelo, y 20 de esos segundos estaban reservados para abortar.`,
  wonLesson:
    'Y aquí está la clave del artefacto: aunque te hubiera quedado el 100 %, no habrías podido despegar. Volver a la órbita lunar necesitaba otro motor y otro tanque. Por eso la etapa de descenso se quedó en la Luna: no se averió, no podía subir.',
  retry: 'Repetir',

  energyAria: 'El último invierno de Opportunity',
  solDates: ['3 de junio de 2018', '4 de junio de 2018', '6 de junio de 2018', '10 de junio de 2018'],
  energyKicker: 'El último invierno',
  energyTitle: 'Presupuesto de energía',
  endKicker: 'Fin de la misión',
  silenceTitle: 'Silencio',
  energyResultTitle: (sent, total) => `Enviaste ${sent} de ${total} datos a casa.`,
  energyNoWay:
    'No había forma de ganar y eso es lo importante: la tormenta era más grande que cualquier presupuesto de energía. Con 22 vatios-hora no se calienta una batería ni se enciende una antena.',
  energyLesson:
    'El 10 de junio de 2018, Opportunity transmitió por última vez. En ese mensaje iba una medición: la opacidad de la atmósfera marciana había llegado a 10,8, el valor más alto jamás medido en Marte. La NASA la llamó más de mil veces durante ocho meses. Nunca respondió.',
  backToChapter: 'Volver al capítulo',
  availableWh: (wh) => `${wh} Wh disponibles`,
  opacity: (tau) => `opacidad ${tau}`,
  actionHeat: 'Calentar la batería',
  actionMeasure: 'Tomar una medición',
  actionTransmit: 'Transmitir a la Tierra',
  battery: 'Batería',
  warm: 'templada',
  cold: 'fría',
  unsent: 'Datos sin enviar',
  sent: 'Enviados',
  endSol: 'Terminar el sol',
  energyFoot:
    'Si pasas un sol sin calentar la batería, el frío la daña. Dos soles seguidos y la misión termina.',
  logMeasured: (label) => `${label}: medición guardada en memoria.`,
  logTransmitted: (label, n) =>
    `${label}: ${n} dato${n > 1 ? 's' : ''} enviado${n > 1 ? 's' : ''} a la Tierra.`,
  logNothing: (label) => `${label}: la antena se encendió, pero no había nada que enviar.`,
  logHeated: (label) => `${label}: batería caliente, los instrumentos aguantan.`,
};

export const UI: Record<Lang, UIStrings> = { en, es };

export function uiFor(lang: Lang): UIStrings {
  return UI[lang];
}
