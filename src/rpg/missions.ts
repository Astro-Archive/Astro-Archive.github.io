import type { RpgMission } from './types';

export const EAGLE_MISSION: RpgMission = {
  id: 'eagle-first-step',
  artifactId: 'eagle',
  title: 'El primer paso',
  intro:
    'Ayuda a la etapa de descenso del Eagle a preparar una explicación para una nueva generación de exploradores.',
  character: {
    name: 'ECHO-11',
    role: 'Guía de misión · personaje provisional',
    avatar: 'E',
  },
  objectives: [
    {
      id: 'learn-gravity',
      label: 'Entender la gravedad lunar',
      detail: 'Descubre por qué el descenso podía ser más lento que en la Tierra.',
    },
    {
      id: 'learn-stage',
      label: 'Reconocer la etapa de descenso',
      detail: 'Averigua por qué la base del módulo se quedó en la Luna.',
    },
    {
      id: 'answer-quiz',
      label: 'Resolver el reto científico',
      detail: 'Usa lo aprendido para desbloquear tu insignia.',
    },
  ],
  dialogue: {
    start: {
      id: 'start',
      speaker: 'ECHO-11',
      role: 'Guía de misión · personaje provisional',
      text: 'Bienvenido al Mar de la Tranquilidad. ¿Qué quieres investigar primero?',
      choices: [
        {
          id: 'gravity',
          label: '¿Cómo funciona la gravedad aquí?',
          next: 'gravity',
          effect: { type: 'complete-objective', objectiveId: 'learn-gravity' },
        },
        {
          id: 'module',
          label: '¿Por qué una parte del Eagle se quedó atrás?',
          next: 'module',
          effect: { type: 'complete-objective', objectiveId: 'learn-stage' },
        },
      ],
    },
    gravity: {
      id: 'gravity',
      speaker: 'ECHO-11',
      role: 'Guía de misión · personaje provisional',
      text:
        'La Luna tiene una gravedad seis veces menor que la Tierra. Eso ayuda a frenar, pero no elimina el peligro: una velocidad vertical demasiado alta todavía puede dañar el módulo.',
      next: 'follow-up',
    },
    module: {
      id: 'module',
      speaker: 'ECHO-11',
      role: 'Guía de misión · personaje provisional',
      text:
        'La etapa de descenso llevaba el motor y el combustible para llegar al suelo. La etapa de ascenso despegó después; la base era demasiado pesada para volver.',
      next: 'follow-up',
    },
    'follow-up': {
      id: 'follow-up',
      speaker: 'ECHO-11',
      role: 'Guía de misión · personaje provisional',
      text:
        'Ya tienes una pista importante. Puedes explorar la otra pregunta o pasar al reto cuando hayas completado ambos objetivos.',
      choices: [
        { id: 'gravity-again', label: 'Repasar la gravedad', next: 'gravity' },
        { id: 'module-again', label: 'Repasar la etapa', next: 'module' },
        {
          id: 'quiz',
          label: 'Ir al reto científico',
          next: 'quiz',
          effect: { type: 'set-quiz-ready' },
        },
      ],
    },
    quiz: {
      id: 'quiz',
      speaker: 'ECHO-11',
      role: 'Guía de misión · personaje provisional',
      text: 'Elige la respuesta que explica mejor por qué la etapa de descenso quedó en la Luna.',
    },
  },
  quiz: {
    prompt: '¿Por qué la etapa de descenso no regresó a la órbita lunar?',
    options: [
      'Porque se quedó sin señal de radio.',
      'Porque era la base pesada con el motor y el combustible del aterrizaje.',
      'Porque la gravedad lunar la mantuvo pegada al suelo.',
    ],
    answer: 1,
    explanation:
      'La etapa de descenso fue diseñada para frenar y sostener el aterrizaje. La etapa de ascenso era otra nave, más ligera, que despegó desde esa base.',
  },
  badge: 'Explorador de la primera huella',
};
