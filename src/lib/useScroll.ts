import { useEffect, useRef, useState } from 'react';

export interface ScrollState {
  /** progreso 0..1, para el render loop (sin re-render) */
  ref: React.RefObject<number>;
  /** progreso 0..1, con re-render */
  progress: number;
  /** índice de la estación más cercana */
  station: number;
  /** índice de la estación cuya tarjeta debe verse, o null */
  card: number | null;
  goTo: (index: number) => void;
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

  const scaled = progress * (count - 1);
  const station = Math.round(scaled);
  const card = Math.abs(scaled - station) < 0.18 ? station : null;

  const goTo = (index: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const top = ((max * index) / (count - 1)) | 0;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return { ref, progress, station, card, goTo };
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
