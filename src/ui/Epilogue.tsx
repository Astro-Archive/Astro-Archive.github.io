import { epilogueFor } from '../data/epilogue';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';

interface EpilogueProps {
  visible: boolean;
  onRestart: () => void;
  onReading: () => void;
}

export function Epilogue({ visible, onRestart, onReading }: EpilogueProps) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const epilogue = epilogueFor(lang);

  return (
    <section className={`epilogue ${visible ? 'is-visible' : ''}`} aria-hidden={!visible} inert={!visible}>
      <div className="epilogue-inner">
        <p className="epilogue-kicker">{t.epilogueKicker}</p>

        <h2 className="epilogue-title">{epilogue.title}</h2>

        <div className="epilogue-text">
          {epilogue.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <div className="epilogue-stats">
          {epilogue.stats.map((stat) => (
            <div key={stat.label}>
              <span className="epilogue-number">{stat.value}</span>
              <span className="epilogue-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="epilogue-actions">
          <button type="button" className="game-cta" onClick={onRestart}>
            {t.restart}
          </button>
          <button type="button" className="ghost-button" onClick={onReading}>
            {t.readWithout3d}
          </button>
        </div>

        <p className="epilogue-credit">{t.epilogueCredit}</p>
      </div>
    </section>
  );
}
