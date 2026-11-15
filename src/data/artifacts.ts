export type SignalStatus = 'durmiente' | 'silencioso' | 'perdido';

export interface Source {
  label: string;
  url: string;
}

export interface Artifact {
  id: string;
  index: string;
  name: string;
  alias: string;
  machine: string;
  place: string;
  year: string;
  status: SignalStatus;
  statusLabel: string;
  model: string;
  /** tamaño de la dimensión mayor, en unidades de mundo */
  fit: number;
  /** rotación de presentación en radianes */
  yaw: number;
  /** centro de la estación en el mundo */
  station: [number, number, number];
  camera: [number, number, number];
  target: [number, number, number];
  palette: {
    top: string;
    bottom: string;
    ground: string;
    rock: string;
    fog: string;
    dust: string;
    accent: string;
    stars: boolean;
  };
  facts: {
    what: string;
    why: string;
    found: string;
    now: string;
  };
  voice: string;
  note?: string;
  sources: Source[];
}

export const ARTIFACTS: Artifact[] = [
  {
    id: 'eagle',
    index: '01',
    name: 'Eagle',
    alias: 'Apollo Lunar Module',
    machine: 'Módulo lunar · etapa de descenso',
    place: 'Mar de la Tranquilidad, Luna',
    year: '1969',
    status: 'durmiente',
    statusLabel: 'Durmiente — una ventana sigue respondiendo',
    model: 'models/lunar-module.glb',
    fit: 6.2,
    yaw: 0.6,
    station: [0, 0, 0],
    camera: [2.2, 4.6, 11.6],
    target: [-1.5, 2.0, 0],
    palette: {
      top: '#070a12',
      bottom: '#20263a',
      ground: '#7b7d84',
      rock: '#63666e',
      fog: '#151a26',
      dust: '#c9cbd4',
      accent: '#ff6b35',
      stars: false,
    },
    facts: {
      what:
        'Siete metros de alto con las patas desplegadas y unas quince toneladas al despegar de la Tierra. La mitad de abajo era la base: el motor que frenó la caída y el depósito que alimentó el regreso. Arriba iba la cabina donde viajaban dos personas.',
      why:
        'Llevar a dos personas a la superficie de la Luna y devolverlas vivas. La etapa de descenso pesaba demasiado para volver, así que el plan era dejarla ahí desde el primer día: se convirtió en la plataforma de lanzamiento de la mitad de arriba.',
      found:
        'Volvió a casa con 21,5 kg de rocas y polvo lunar. Y dejó algo que sigue trabajando: un retrorreflector de cuarzo que todavía hoy devuelve los láseres que le disparamos desde la Tierra. Su sismómetro se apagó a las pocas semanas por sobrecalentamiento; los que dejaron las misiones siguientes escucharon la Luna hasta 1977.',
      now:
        'Sigue en el Mar de la Tranquilidad, donde se posó el 20 de julio de 1969. La etapa de ascenso despegó, volvió a orbitar y después chocó contra la Luna. La de descenso nunca se movió.',
    },
    voice:
      'Fui el pedestal del primer paso humano. Cuando Armstrong bajó, yo ya estaba aquí, y aquí sigo. Mi motor se apagó para siempre, pero una de mis ventanas de cuarzo todavía les devuelve la luz. Cada tanto alguien me apunta con un láser desde la Tierra. Es lo más parecido a una conversación que tengo.',
    note:
      'El modelo que ves es el módulo completo. En la Luna solo quedó la mitad inferior: la de arriba se fue y chocó contra la superficie.',
    sources: [
      {
        label: 'NSSDCA — Apollo 11 Lunar Module / EASEP',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
      },
      { label: 'NASA — Apollo 11', url: 'https://www.nasa.gov/mission/apollo-11/' },
      { label: 'NASA 3D Resources', url: 'https://science.nasa.gov/3d-resources/' },
    ],
  },
  {
    id: 'opportunity',
    index: '02',
    name: 'Opportunity',
    alias: 'MER-B',
    machine: 'Rover · energía solar · seis ruedas',
    place: 'Valle Perseverance, cráter Endeavour, Marte',
    year: '2004 — 2018',
    status: 'silencioso',
    statusLabel: 'Silenciosa desde junio de 2018',
    model: 'models/opportunity.glb',
    fit: 3.4,
    yaw: -0.9,
    station: [0, 0, -40],
    camera: [-4.4, 3.0, -33.6],
    target: [1.5, 1.35, -40],
    palette: {
      top: '#120806',
      bottom: '#5c2c16',
      ground: '#c06334',
      rock: '#8f4522',
      fog: '#3a1a0d',
      dust: '#e2a97e',
      accent: '#ffb46b',
      stars: false,
    },
    facts: {
      what:
        'Un rover de 185 kg, del tamaño de un carrito de golf, con seis ruedas y paneles solares. Aterrizó en enero de 2004 dentro de una bolsa de aire que rebotó unas veintiséis veces antes de detenerse.',
      why:
        'Buscar pruebas de que Marte tuvo agua líquida en el pasado. No buscar vida: buscar los minerales que solo se forman cuando hay agua quieta, durante mucho tiempo.',
      found:
        'Encontró "arándanos" de hematita y cristales de jarosita: minerales que necesitan agua para formarse. Recorrió 45,16 kilómetros —más que un maratón— en un planeta donde estaba diseñado para andar 600 metros.',
      now:
        'Está en el valle Perseverance, en el borde del cráter Endeavour. Su última comunicación llegó el 10 de junio de 2018, durante una tormenta de polvo global que cubrió el Sol. La NASA la llamó más de mil veces hasta febrero de 2019. Nunca respondió.',
    },
    voice:
      'Me construyeron para noventa días marcianos. Trabajé casi quince años. Aprendí a sobrevivir tormentas de polvo, a subir colinas, a cruzar un cráter entero. La última tormenta fue demasiado grande: el sol dejó de llegar a mis paneles. No me apagué de golpe. Me quedé quieta, con las ruedas apuntando al horizonte, esperando luz.',
    note:
      'La frase "mi batería está baja y está oscureciendo" no fue un mensaje suyo: es cómo un ingeniero del JPL tradujo su última telemetría.',
    sources: [
      {
        label: 'NSSDCA — Mars Exploration Rover B (Opportunity)',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A',
      },
      {
        label: 'NASA Science — Mars Exploration Rovers',
        url: 'https://science.nasa.gov/mission/mer-opportunity/',
      },
    ],
  },
  {
    id: 'ingenuity',
    index: '03',
    name: 'Ingenuity',
    alias: 'Mars Helicopter',
    machine: 'Helicóptero · cuatro palas · 1,8 kg',
    place: 'Cráter Jezero, Marte',
    year: '2021 — 2024',
    status: 'silencioso',
    statusLabel: 'En tierra desde enero de 2024',
    model: 'models/ingenuity.glb',
    fit: 2.6,
    yaw: 0.35,
    station: [0, 0, -80],
    camera: [4.2, 3.3, -74.4],
    target: [1.4, 1.45, -80],
    palette: {
      top: '#0b0a14',
      bottom: '#4f2513',
      ground: '#b95a2c',
      rock: '#7d3c1e',
      fog: '#31170c',
      dust: '#d99a6c',
      accent: '#4fd1c5',
      stars: false,
    },
    facts: {
      what:
        'Un helicóptero de 1,8 kg con cuatro palas de fibra de carbono que giran a unas 2.400 revoluciones por minuto. Viajó a Marte doblado bajo el vientre del rover Perseverance, dentro de una carcasa protectora.',
      why:
        'Demostrar algo que parecía imposible: volar en una atmósfera que es el 1 % de la terrestre. En Marte hay que girar las palas mucho más rápido que en la Tierra solo para sostener el mismo peso.',
      found:
        'Hizo 72 vuelos, recorrió 17 kilómetros y estuvo en el aire casi 129 minutos. El 19 de abril de 2021 se convirtió en la primera aeronave de la historia en volar en otro mundo.',
      now:
        'Está en el cráter Jezero. En su vuelo 72, durante un aterrizaje de emergencia, una de sus palas se dañó contra el suelo. Ya no vuela, pero sigue de pie, con las cuatro patas apoyadas en Marte.',
    },
    voice:
      'Me llamaron "el demostrador". Nadie esperaba que volara más de cinco veces. Volé setenta y dos. Cuando se rompió una pala no me caí: me quedé de pie. Ahora soy el único objeto en Marte que proyecta la sombra de un helicóptero.',
    note:
      'No se estrelló: un aterrizaje forzoso dañó una pala del rotor. La NASA lo anunció en enero de 2024.',
    sources: [
      {
        label: 'NASA — Mars Helicopter (Ingenuity)',
        url: 'https://mars.nasa.gov/technology/helicopter/',
      },
      {
        label: 'NSSDCA — Mars 2020 / Perseverance',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2020-052A',
      },
    ],
  },
  {
    id: 'dawn',
    index: '04',
    name: 'Dawn',
    alias: 'Dawn Mission',
    machine: 'Sonda · propulsión iónica · 1.200 kg',
    place: 'Órbita de Ceres, cinturón de asteroides',
    year: '2007 — 2018',
    status: 'perdido',
    statusLabel: 'Sin combustible, sin señal, en órbita',
    model: 'models/dawn.glb',
    fit: 6.6,
    yaw: -0.4,
    station: [0, 0, -120],
    camera: [-5.8, 4.4, -110.2],
    target: [2.1, 1.9, -120],
    palette: {
      top: '#04050c',
      bottom: '#101828',
      ground: '#3a3f4d',
      rock: '#2d3240',
      fog: '#080b14',
      dust: '#8fa6c8',
      accent: '#8fb3ff',
      stars: true,
    },
    facts: {
      what:
        'Una nave de 1.200 kg con un motor iónico. En vez de quemar combustible, acelera iones de xenón y los expulsa a unos 110.000 km/h. Empuja muy poco, pero puede hacerlo durante años sin parar.',
      why:
        'Visitar los dos objetos más grandes del cinturón de asteroides, Vesta y Ceres, y entender cómo se formaron los planetas. Nadie había orbitado dos mundos distintos con la misma nave.',
      found:
        'Vesta resultó ser un protoplaneta: un planeta que casi llegó a serlo. En Ceres encontró agua helada, sales y un interior con capas. Dawn fue la primera nave de la historia en orbitar dos cuerpos del sistema solar.',
      now:
        'Desde 2018 está en una órbita estable alrededor de Ceres, sin combustible y sin señal. No se estrelló ni regresó: se quedó dando vueltas, como un satélite de un mundo que nunca tuvo mar.',
    },
    voice:
      'Nunca aterricé en ningún sitio. Pasé de largo, miré, y seguí. Ahora giro alrededor de Ceres, sin motor y con la antena apagada. Nadie va a venir a buscarme. Pero sigo dando vueltas, y eso, para una máquina, es una forma de quedarse.',
    sources: [
      {
        label: 'NSSDCA — Dawn',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-043A',
      },
      { label: 'NASA Science — Dawn', url: 'https://science.nasa.gov/mission/dawn/' },
    ],
  },
];

export const ARTIFACT_COUNT = ARTIFACTS.length;
