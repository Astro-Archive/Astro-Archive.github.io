import { useEffect, useState } from 'react';
import { playTextBlip } from './blip';

/**
 * Texto progresivo. `skip` completa la línea; `done` indica que ya se mostró entera.
 * Con movimiento reducido aparece completo desde el principio.
 */
export function useTypewriter(text: string, speed = 26) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [count, setCount] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      // el blip suena con la letra, no con los espacios; el propio módulo limita la cadencia
      if (text[i - 1] && !/\s/.test(text[i - 1])) playTextBlip();
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed, reduced]);

  return {
    shown: text.slice(0, count),
    done: count >= text.length,
    skip: () => setCount(text.length),
  };
}
