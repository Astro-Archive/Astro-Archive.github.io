import type { Lang } from '../i18n/types';

export interface EpilogueCopy {
  title: string;
  paragraphs: string[];
  stats: Array<{ value: string; label: string }>;
}

export const EPILOGUE: Record<Lang, EpilogueCopy> = {
  en: {
    title: 'What remains also tells a story.',
    paragraphs: [
      'In 1969 we left a lunar module on the Moon because it could not return. In 2021 we left sample tubes on Mars on purpose, so someone would come back for them. If the return mission succeeds, they will be the first human-made objects collected from another planet.',
      'What turns these objects into history is not the material or the technology: it is that someone knows where they are and why they were left there.',
    ],
    stats: [
      { value: '4', label: 'machines told' },
      { value: '3', label: 'worlds' },
      { value: '55', label: 'years of history' },
    ],
  },
  es: {
    title: 'Lo que queda también cuenta la historia.',
    paragraphs: [
      'En 1969 dejamos un módulo lunar en la Luna porque no podía volver. En 2021 dejamos tubos de muestra en Marte a propósito, para que alguien vuelva a buscarlos. Si la misión de retorno sale bien, serán los primeros objetos fabricados por humanos recogidos de otro planeta.',
      'Lo que convierte estos objetos en historia no es el material ni la tecnología: es que alguien sepa dónde están y por qué se dejaron ahí.',
    ],
    stats: [
      { value: '4', label: 'máquinas contadas' },
      { value: '3', label: 'mundos' },
      { value: '55', label: 'años de historia' },
    ],
  },
};

export function epilogueFor(lang: Lang): EpilogueCopy {
  return EPILOGUE[lang];
}
