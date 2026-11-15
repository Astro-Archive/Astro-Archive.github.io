import type { Artifact } from '../data/artifacts';

const LEVELS: Record<Artifact['status'], number> = {
  durmiente: 1,
  silencioso: 2,
  perdido: 3,
};

const WORDS = ['activo', 'durmiente', 'silencioso', 'perdido'];

export function SignalMeter({ status }: { status: Artifact['status'] }) {
  const level = LEVELS[status];

  return (
    <div className="signal" role="img" aria-label={`Estado de la señal: ${status}`}>
      <div className="signal-bars">
        {WORDS.map((word, i) => (
          <span
            key={word}
            className={`signal-bar ${i <= level ? 'is-on' : ''} ${i === 3 ? 'is-lost' : ''}`}
          />
        ))}
      </div>
      <div className="signal-words">
        {WORDS.map((word, i) => (
          <span key={word} className={i === level ? 'is-current' : ''}>
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
