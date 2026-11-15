import { useState } from 'react';

/**
 * Retratos del RPG.
 * Se intenta el PNG generado con IA; si no existe, el SVG placeholder; si tampoco,
 * un monograma. Para cambiar el arte basta con dejar `portrait-<id>.png` en `public/rpg/`.
 */

const MONOGRAM: Record<string, string> = {
  archivist: 'A',
  eagle: 'E',
  opportunity: 'O',
  ingenuity: 'I',
  dawn: 'D',
};

type Stage = 'png' | 'svg' | 'mono';

interface PortraitProps {
  id: string;
  name: string;
  speaking?: boolean;
}

export function Portrait({ id, name, speaking = false }: PortraitProps) {
  const [stage, setStage] = useState<Stage>('png');

  const src = stage === 'png' ? `rpg/portrait-${id}.png` : `rpg/portrait-${id}.svg`;

  return (
    <figure className={`portrait ${speaking ? 'is-speaking' : ''}`}>
      {stage === 'mono' ? (
        <div className="portrait-mono" aria-hidden="true">
          {MONOGRAM[id] ?? name.slice(0, 1)}
        </div>
      ) : (
        <img
          key={stage}
          src={src}
          alt={`Retrato de ${name}`}
          loading="lazy"
          decoding="async"
          onError={() => setStage(stage === 'png' ? 'svg' : 'mono')}
        />
      )}
      <figcaption className="visually-hidden">{name}</figcaption>
    </figure>
  );
}
