import { artifactsFor } from '../data/artifacts';
import { epilogueFor } from '../data/epilogue';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';
import { LanguageSwitch } from './LanguageSwitch';

interface ReadingModeProps {
  onClose: () => void;
}

export function ReadingMode({ onClose }: ReadingModeProps) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const artifacts = artifactsFor(lang);
  const epilogue = epilogueFor(lang);

  return (
    <div className="reading" role="dialog" aria-modal="true" aria-label={t.readingAria}>
      <div className="reading-bar">
        <span className="reading-kicker">{t.readingKicker}</span>
        <div className="reading-actions">
          <LanguageSwitch />
          <button type="button" className="ghost-button" onClick={onClose} autoFocus>
            {t.backToTour}
          </button>
        </div>
      </div>

      <article className="reading-body">
        <header className="reading-head">
          <h1>Still Listening</h1>
          <p className="reading-sub">{t.brandSub}</p>
          <p className="reading-intro">{t.readingIntro}</p>
        </header>

        {artifacts.map((artifact) => (
          <section className="reading-chapter" key={artifact.id} id={`lectura-${artifact.id}`}>
            <div className="reading-chapter-head">
              <span className="reading-index">{artifact.index}</span>
              <div>
                <h2>{artifact.name}</h2>
                <p className="reading-machine">
                  {artifact.machine} · {artifact.place} · {artifact.year}
                </p>
              </div>
            </div>

            <p className="reading-status">{artifact.statusLabel}</p>

            <dl className="reading-facts">
              <dt>{t.factWhat}</dt>
              <dd>{artifact.facts.what}</dd>
              <dt>{t.factWhy}</dt>
              <dd>{artifact.facts.why}</dd>
              <dt>{t.factFound}</dt>
              <dd>{artifact.facts.found}</dd>
              <dt>{t.factNow}</dt>
              <dd>{artifact.facts.now}</dd>
            </dl>

            <blockquote className="reading-voice">
              <span className="voice-tag">{t.voiceTag}</span>
              {artifact.voice}
            </blockquote>

            {artifact.game && (
              <p className="reading-game">
                <span className="voice-tag">{t.gameAvailable}</span>
                {artifact.game === 'descent' ? t.readingGameDescent : t.readingGameEnergy}
              </p>
            )}

            {artifact.note && (
              <p className="note">
                <span className="note-tag">{t.noteTag}</span>
                {artifact.note}
              </p>
            )}

            <p className="reading-sources">
              {t.readingSources}{' '}
              {artifact.sources.map((source, i) => (
                <span key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer noopener">
                    {source.label}
                  </a>
                  {i < artifact.sources.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          </section>
        ))}

        <section className="reading-chapter reading-epilogue">
          <p className="reading-index">{t.epilogueKicker}</p>
          <h2>{epilogue.title}</h2>
          {epilogue.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <div className="reading-stats">
            {epilogue.stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong> {stat.label}
              </div>
            ))}
          </div>
        </section>

        <footer className="reading-footer">
          <p>{t.readingFooter1}</p>
          <p>{t.readingFooter2}</p>
        </footer>
      </article>
    </div>
  );
}
