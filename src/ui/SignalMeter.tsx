import type { Artifact } from '../data/artifacts';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';

const LEVELS: Record<Artifact['status'], number> = {
  durmiente: 1,
  silencioso: 2,
  perdido: 3,
};

export function SignalMeter({ status }: { status: Artifact['status'] }) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const level = LEVELS[status];
  const words = t.signalWords;

  return (
    <div className="signal" role="img" aria-label={t.signalAria(words[level])}>
      <div className="signal-bars">
        {words.map((word, i) => (
          <span
            key={word}
            className={`signal-bar ${i <= level ? 'is-on' : ''} ${i === 3 ? 'is-lost' : ''}`}
          />
        ))}
      </div>
      <div className="signal-words">
        {words.map((word, i) => (
          <span key={word} className={i === level ? 'is-current' : ''}>
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
