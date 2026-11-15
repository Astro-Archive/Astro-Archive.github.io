import { useState } from 'react';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';

/**
 * Retratos del RPG.
 * Se intenta primero el WebP generado con IA; si no existe, el PNG, luego el SVG
 * placeholder y, como último recurso, un monograma. Para cambiar el arte basta con
 * dejar `portrait-<id>.webp` en `public/rpg/`.
 */

const MONOGRAM: Record<string, string> = {
  archivist: 'A',
  eagle: 'E',
  opportunity: 'O',
  ingenuity: 'I',
  dawn: 'D',
};

type Stage = 'webp' | 'png' | 'svg' | 'mono';

const NEXT_STAGE: Record<Stage, Stage> = {
  webp: 'png',
  png: 'svg',
  svg: 'mono',
  mono: 'mono',
};

interface PortraitProps {
  id: string;
  name: string;
  speaking?: boolean;
}

export function Portrait({ id, name, speaking = false }: PortraitProps) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const [stage, setStage] = useState<Stage>('webp');

  const src = `rpg/portrait-${id}.${stage}`;

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
          alt={t.portraitAlt(name)}
          loading="lazy"
          decoding="async"
          onError={() => setStage(NEXT_STAGE[stage])}
        />
      )}
      <figcaption className="visually-hidden">{name}</figcaption>
    </figure>
  );
}
