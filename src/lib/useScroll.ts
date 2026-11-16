import { useEffect, useRef, useState } from 'react';

/**
 * Mapa del recorrido:
 *   índice -1 ...... portada
 *   índice  0..3 ... estaciones
 *   índice  4 ...... epílogo
 *
 * Cada paso ocupa una pantalla de scroll, así la portada y el epílogo no
 * se comen las estaciones (antes, la tarjeta de Eagle era inalcanzable).
 */
export const HERO_STEP = 1;

export function cameraT(progress: number, count: number): number {
  const steps = count + 1;
  return Math.min(1, Math.max(0, (progress * steps - HERO_STEP) / (count - 1)));
}

export interface ScrollState {
  /** progreso 0..1, para el render loop (sin re-render) */
  ref: React.RefObject<number>;
  /** progreso 0..1, con re-render */
  progress: number;
  /** posición en pasos: -1 portada, 0..n-1 estaciones, n epílogo */
  scaled: number;
  station: number;
  card: number | null;
  goTo: (index: number) => void;
  goEnd: () => void;
}

export function useScroll(count: number): ScrollState {
  const ref = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      ref.current = p;
      setProgress(p);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const steps = count + 1;
  const scaled = progress * steps;
  const index = scaled - HERO_STEP;
  const station = Math.min(count - 1, Math.max(0, Math.round(index)));
  // La tarjeta permanece visible de forma estable mientras el usuario navega por las estaciones
  // (evita que desaparezca al detener el scroll o en dispositivos móviles)
  const inTourRange = scaled >= 0.45 && scaled < count + 0.6;
  const card = inTourRange ? station : null;

  const jump = (progressTarget: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.round(max * progressTarget), behavior: 'smooth' });
  };

  const goTo = (stationIndex: number) => jump((stationIndex + HERO_STEP) / steps);
  const goEnd = () => jump(1);

  return { ref, progress, scaled, station, card, goTo, goEnd };
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}
