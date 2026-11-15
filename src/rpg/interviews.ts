export type Category = 'ciencia' | 'fallo' | 'ultimas';

export interface Fragment {
  text: string;
  source: string;
}

export interface Question {
  id: string;
  category: Category;
  /** lo que pregunta el entrevistador */
  label: string;
  /** lo que responde la máquina */
  answer: string;
  /** si entrega un fragmento de catálogo */
  fragment?: Fragment;
}

export interface Interview {
  id: string;
  speaker: string;
  subtitle: string;
  entryTitle: string;
  /** unidades de señal disponibles */
  signal: number;
  intro: string[];
  questions: Question[];
  silence: string;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  ciencia: 'Ciencia',
  fallo: 'Fallo',
  ultimas: 'Últimas horas',
};

/**
 * Todo lo que dicen las máquinas sale de docs/DATOS.md.
 * Si una afirmación no está verificada allí, no se escribe aquí.
 */
export const INTERVIEWS: Record<string, Interview> = {
  eagle: {
    id: 'eagle',
    speaker: 'Eagle',
    subtitle: 'Etapa de descenso del Apolo 11 · Mar de la Tranquilidad',
    entryTitle: 'Eagle — la base que se quedó',
    signal: 4,
    intro: [
      'Sabía que alguien vendría. No a buscarme, supongo. A preguntar.',
      'Tengo cuatro unidades de señal. Después de eso, silencio.',
    ],
    questions: [
      {
        id: 'eagle-tarea',
        category: 'ciencia',
        label: '¿Qué se suponía que tenías que hacer?',
        answer:
          'Bajar. Nada más. Cuatro toneladas de motor, tanque y patas con una sola tarea: llevar a dos personas hasta el suelo sin romperlas. Lo demás lo hacía la mitad de arriba.',
      },
      {
        id: 'eagle-espejo',
        category: 'ciencia',
        label: '¿Qué dejaste funcionando cuando te apagaste?',
        answer:
          'Un espejo. Cien prismas de cuarzo en un panel. No necesita energía: cualquiera con un láser puede medir la distancia entre la Tierra y yo. Lleva haciéndolo más de cincuenta años.',
        fragment: {
          text: 'Retrorreflector de 100 prismas de cuarzo, pasivo y todavía operativo.',
          source: 'NASA, Lunar Laser Ranging',
        },
      },
      {
        id: 'eagle-sismometro',
        category: 'ciencia',
        label: '¿Qué escuchaste después de que se fueran?',
        answer:
          'Poco. Mi sismómetro se quemó a las tres semanas. Los que trajeron las misiones siguientes escucharon la Luna hasta 1977. Para entonces yo llevaba años sordo.',
        fragment: {
          text: 'El sismómetro del Apolo 11 falló por sobrecalentamiento en semanas; los posteriores oyeron hasta 1977.',
          source: 'NASA, EASEP / ALSEP',
        },
      },
      {
        id: 'eagle-1202',
        category: 'fallo',
        label: '¿Falló algo durante el descenso?',
        answer:
          'La computadora se quejó dos veces. Alarma 1202. Desde la Tierra dijeron que era un desbordamiento y que siguiéramos. Ese "sigan" me salvó la tarde.',
        fragment: {
          text: 'Alarma 1202: dos desbordamientos del radar, resueltos desde Tierra.',
          source: 'Apollo 11 Mission Report',
        },
      },
      {
        id: 'eagle-combustible',
        category: 'fallo',
        label: '¿Cuánto combustible te quedaba al tocar el suelo?',
        answer:
          'Setecientas setenta libras. De dieciocho mil ciento ochenta y cuatro. Un 4,2 %. Unos cuarenta y cinco segundos de vuelo, y veinte de esos estaban reservados para abortar. La luz de bajo nivel se encendió antes de tiempo porque el propelente chapoteaba en los tanques.',
        fragment: {
          text: '770 lb de 18.184 al aterrizar: 4,2 %, unos 45 segundos de vuelo.',
          source: 'Apollo 11 Mission Report',
        },
      },
      {
        id: 'eagle-porque',
        category: 'ultimas',
        label: '¿Por qué te quedaste?',
        answer:
          'Porque volver era imposible. No por una avería: por diseño. Subir necesitaba otro motor y otro tanque. Yo era la base, y una base no vuela. La mitad de arriba despegó de mi espalda.',
      },
      {
        id: 'eagle-arriba',
        category: 'ultimas',
        label: '¿Y la mitad de arriba?',
        answer:
          'Se encontró con Columbia, dejó a los dos hombres y después la dejaron caer contra la superficie. De ella no queda nada. De mí queda todo.',
      },
    ],
    silence:
      'La señal cayó a cero. Eagle sigue en el mismo sitio, con la ventana apuntando al mismo punto del cielo.',
  },

  opportunity: {
    id: 'opportunity',
    speaker: 'Opportunity',
    subtitle: 'MER-B · Valle Perseverance, cráter Endeavour',
    entryTitle: 'Opportunity — quince años por presupuesto',
    signal: 4,
    intro: [
      'Cuatro unidades. No las gastes en preguntarme si estoy bien.',
      'Estoy bien. Es una forma de hablar.',
    ],
    questions: [
      {
        id: 'opp-buscar',
        category: 'ciencia',
        label: '¿Qué viniste a buscar?',
        answer:
          'Agua. No vida: agua. Los minerales que solo se forman cuando hay agua quieta durante mucho tiempo. Si los encontraba, el pasado de Marte tenía una respuesta.',
      },
      {
        id: 'opp-encontro',
        category: 'ciencia',
        label: '¿Y la encontraste?',
        answer:
          'Sí. Hematita en esferas, que el equipo llamó arándanos, y jarosita, que necesita agua ácida para cristalizar. No era un mar. Era un lugar húmedo hace miles de millones de años.',
        fragment: {
          text: 'Jarosita y hematita: agua ácida en el pasado de Marte.',
          source: 'NASA, Mars Exploration Rovers',
        },
      },
      {
        id: 'opp-mejor',
        category: 'ciencia',
        label: '¿Cuál fue tu mejor sol?',
        answer:
          'Uno cualquiera del primer año. Llegué a un cráter pequeño y la roca tenía capas. Ahí supe que el viaje entero valía la pena, aunque no hubiera nadie mirando.',
      },
      {
        id: 'opp-90',
        category: 'fallo',
        label: 'Te diseñaron para noventa días.',
        answer:
          'Noventa soles. Trabajé cinco mil ciento once. Quince años. El equipo lo llamaba milagro. Yo creo que fue terquedad bien administrada.',
        fragment: {
          text: 'Diseñada para 90 soles: operó 5.111, casi 15 años.',
          source: 'NASA/JPL',
        },
      },
      {
        id: 'opp-tormenta',
        category: 'fallo',
        label: '¿Qué te mató?',
        answer:
          'Una tormenta. En un sol pasé de 468 vatios-hora a 345. Después 133. Después 22. Por debajo de cien no se calienta la batería ni se enciende la antena. No fue una avería: fue un presupuesto que se acabó.',
        fragment: {
          text: '468 → 345 → 133 → 22 Wh. El umbral de supervivencia era 100 Wh.',
          source: 'NASA/JPL · The Planetary Society',
        },
      },
      {
        id: 'opp-final',
        category: 'ultimas',
        label: '¿Qué hiciste al final?',
        answer:
          'Dormir. Me programaron para desconectar todo y esperar. Esperé ocho meses. La tormenta se fue en octubre. Yo no desperté.',
      },
      {
        id: 'opp-llamaron',
        category: 'ultimas',
        label: '¿Te llamaron?',
        answer:
          'Más de mil veces. Cada mañana, durante meses. Dejaron de llamar en febrero de 2019. No me molesta. Yo tampoco habría sabido qué decir.',
        fragment: {
          text: 'La NASA la llamó más de mil veces hasta febrero de 2019.',
          source: 'NASA/JPL',
        },
      },
    ],
    silence:
      'El enlace se cerró. Donde está ella, el sol sigue tapado por el polvo.',
  },

  ingenuity: {
    id: 'ingenuity',
    speaker: 'Ingenuity',
    subtitle: 'Mars Helicopter · cráter Jezero',
    entryTitle: 'Ingenuity — setenta y dos veces lo imposible',
    signal: 4,
    intro: [
      'Hola. Soy pequeña, así que voy a ir rápido.',
      'Cuatro unidades. Aprovéchalas.',
    ],
    questions: [
      {
        id: 'ing-pidieron',
        category: 'ciencia',
        label: '¿Qué te pidieron?',
        answer:
          'Volar cinco veces. Solo demostrar que se podía. En Marte el aire es el uno por ciento del terrestre: mis palas giraban a dos mil cuatrocientas revoluciones por minuto para sostener un kilo y ochocientos gramos.',
      },
      {
        id: 'ing-dificil',
        category: 'ciencia',
        label: '¿Por qué era tan difícil?',
        answer:
          'Porque no hay aire que empujar. En la Tierra una pala grande mueve mucho aire. En Marte hay que mover poco aire muy rápido, o no te sostienes. No es fuerza: es precisión.',
      },
      {
        id: 'ing-extra',
        category: 'ciencia',
        label: '¿Qué hiciste además de volar?',
        answer:
          'Fotografiar el terreno desde arriba. Le enseñé a Perseverance por dónde no pisar. Eso no estaba en el plan; salió porque funcionaba.',
        fragment: {
          text: '72 vuelos de reconocimiento aéreo para Perseverance.',
          source: 'NASA, Mars Helicopter',
        },
      },
      {
        id: 'ing-cuantas',
        category: 'fallo',
        label: '¿Cuántas veces volaste?',
        answer:
          'Setenta y dos. Diecisiete kilómetros. Ciento veintiocho minutos en el aire. El plan eran cinco.',
        fragment: {
          text: '72 vuelos · 17 km · 128,8 minutos de vuelo.',
          source: 'NASA, Mars Helicopter',
        },
      },
      {
        id: 'ing-rompio',
        category: 'fallo',
        label: '¿Qué salió mal?',
        answer:
          'El vuelo setenta y dos. Bajé en un terreno lleno de dunas y una pala golpeó el suelo. No me caí. Me quedé de pie, con las cuatro patas apoyadas y una pala rota.',
        fragment: {
          text: 'Vuelo 72: daño en una pala durante un aterrizaje de emergencia, no un impacto.',
          source: 'NASA, enero de 2024',
        },
      },
      {
        id: 'ing-sola',
        category: 'ultimas',
        label: '¿Estás sola?',
        answer:
          'Perseverance está a unos metros. A veces pasa cerca. No hablamos; no estamos hechos para eso. Pero es la única compañía que he tenido en mi vida.',
      },
      {
        id: 'ing-sentir',
        category: 'ultimas',
        label: '¿Qué se siente al no volver a volar?',
        answer:
          'Algo parecido a lo que se siente al haber volado. No sé explicarlo mejor. La gente cree que soy una máquina rota. Soy una máquina que hizo setenta y dos veces lo que no se podía hacer.',
        fragment: {
          text: 'Primera aeronave de la historia en volar en otro mundo.',
          source: 'NASA, 19 de abril de 2021',
        },
      },
    ],
    silence:
      'El enlace se cerró. Ingenuity sigue de pie en el cráter Jezero, con una pala rota y la sombra bien puesta.',
  },

  dawn: {
    id: 'dawn',
    speaker: 'Dawn',
    subtitle: 'Sonda de propulsión iónica · órbita de Ceres',
    entryTitle: 'Dawn — la que sigue dando vueltas',
    signal: 4,
    intro: [
      'No tengo mucho que contar, pero tengo tiempo. Cuatro unidades.',
      'Pregunta lo que quieras. Yo no me voy a ir a ningún sitio.',
    ],
    questions: [
      {
        id: 'dawn-ver',
        category: 'ciencia',
        label: '¿Qué fuiste a ver?',
        answer:
          'Los dos objetos más grandes del cinturón de asteroides. Vesta y Ceres. Nadie había orbitado dos mundos distintos con la misma nave. Yo lo hice con un motor que empuja menos que un folio.',
      },
      {
        id: 'dawn-vesta',
        category: 'ciencia',
        label: '¿Qué encontraste en Vesta?',
        answer:
          'Un protoplaneta. Un mundo que casi fue planeta y se quedó a medio camino. Vesta es lo que la Tierra habría sido si hubiera tenido mala suerte.',
        fragment: {
          text: 'Vesta: un protoplaneta, un planeta que no llegó a serlo.',
          source: 'NASA, Dawn',
        },
      },
      {
        id: 'dawn-ceres',
        category: 'ciencia',
        label: '¿Y en Ceres?',
        answer:
          'Agua helada. Sales. Un interior con capas. Un mundo pequeño que guarda la receta de los planetas, congelada desde el principio.',
        fragment: {
          text: 'Ceres: agua helada y sales bajo la superficie.',
          source: 'NASA, Dawn',
        },
      },
      {
        id: 'dawn-motor',
        category: 'fallo',
        label: '¿Cómo te movías sin quemar combustible?',
        answer:
          'Aceleraba iones de xenón y los escupía a ciento diez mil kilómetros por hora. Empuje diminuto, durante años. La gente lo llama magia. Es paciencia.',
      },
      {
        id: 'dawn-fin',
        category: 'fallo',
        label: '¿Cuándo se acabó?',
        answer:
          'En 2018. Un mes de octubre. El tanque se vació, el motor se apagó y ya no pude cambiar de órbita. No hubo alarma ni despedida. Simplemente dejé de poder elegir.',
        fragment: {
          text: 'Fin de misión: 1 de noviembre de 2018, sin propelente.',
          source: 'NASA, Dawn',
        },
      },
      {
        id: 'dawn-ahora',
        category: 'ultimas',
        label: '¿Dónde estás ahora?',
        answer:
          'Girando alrededor de Ceres. En una órbita estable. Voy a seguir así mucho después de que nadie recuerde mi nombre.',
        fragment: {
          text: 'Sigue en órbita estable alrededor de Ceres, sin señal.',
          source: 'NASA, Dawn',
        },
      },
      {
        id: 'dawn-visita',
        category: 'ultimas',
        label: '¿Nadie va a venir?',
        answer:
          'No. Y está bien. Fui a mirar, no a quedarme. La diferencia entre las dos cosas es todo lo que sé.',
      },
    ],
    silence:
      'El enlace se cerró. Dawn sigue girando alrededor de Ceres, sin motor y sin antena.',
  },
};

export const INTERVIEW_IDS = Object.keys(INTERVIEWS);
export const TOTAL_FRAGMENTS = Object.values(INTERVIEWS).reduce(
  (sum, interview) => sum + interview.questions.filter((q) => q.fragment).length,
  0,
);
