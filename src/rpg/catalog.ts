import { useSyncExternalStore } from 'react';
import { INTERVIEWS } from './interviews';

/**
 * Catálogo de memoria: lo que el visitante alcanzó a oír de cada artefacto.
 * Persiste en localStorage y se sincroniza entre componentes sin prop drilling.
 */

const KEY = 'still-listening:catalog:v1';

export interface Entry {
  /** ids de pregunta con fragmento recuperado (antes eran textos) */
  fragments: string[];
  /** preguntas que llegó a hacer */
  asked: number;
  /** última vez que la abrió, en ms */
  last: number;
}

export type CatalogData = Record<string, Entry>;

/** Guardados viejos: el texto en español se convierte al id de su pregunta. */
const LEGACY_IDS: Record<string, string> = {};
for (const interview of Object.values(INTERVIEWS)) {
  for (const question of interview.questions) {
    if (question.fragment) LEGACY_IDS[question.fragment.text] = question.id;
  }
}

function read(): CatalogData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CatalogData;
    if (!parsed || typeof parsed !== 'object') return {};
    for (const entry of Object.values(parsed)) {
      if (entry && Array.isArray(entry.fragments)) {
        entry.fragments = entry.fragments.map((fragment) => LEGACY_IDS[fragment] ?? fragment);
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

let cache: CatalogData = read();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useCatalog(): CatalogData {
  return useSyncExternalStore(
    subscribe,
    () => cache,
    () => ({}),
  );
}

export function recordInterview(artifactId: string, fragments: string[], asked: number) {
  const previous = cache[artifactId];
  const merged = Array.from(new Set([...(previous?.fragments ?? []), ...fragments]));
  cache = {
    ...cache,
    [artifactId]: { fragments: merged, asked: Math.max(asked, previous?.asked ?? 0), last: Date.now() },
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* sin almacenamiento: la sesión sigue funcionando */
  }
  emit();
}

export function resetCatalog() {
  cache = {};
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nada */
  }
  emit();
}

/** total de fragmentos posibles por artefacto */
export function fragmentsFor(artifactId: string): number {
  return INTERVIEWS[artifactId]?.questions.filter((q) => q.fragment).length ?? 0;
}

export function totalFragments(): number {
  return Object.values(INTERVIEWS).reduce(
    (sum, interview) => sum + interview.questions.filter((q) => q.fragment).length,
    0,
  );
}

export function completedInterviews(data: CatalogData): number {
  return Object.keys(INTERVIEWS).filter((id) => (data[id]?.fragments.length ?? 0) > 0).length;
}
