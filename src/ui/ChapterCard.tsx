import type { Artifact, GameId } from '../data/artifacts';
import { SignalMeter } from './SignalMeter';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';

interface ChapterCardProps {
  artifact: Artifact;
  visible: boolean;
  onPlay: (game: GameId) => void;
  onInterview: (artifactId: string) => void;
}

export function ChapterCard({ artifact, visible, onPlay, onInterview }: ChapterCardProps) {
  const { lang } = useLang();
  const t = uiFor(lang);

  const GAME_LABEL: Record<GameId, { title: string; cta: string }> = {
    descent: { title: t.gameTitleDescent, cta: t.gameCtaDescent },
    energy: { title: t.gameTitleEnergy, cta: t.gameCtaEnergy },
    launch: {
      title: lang === 'es' ? 'Despegue a Órbita' : 'Launch to Orbit',
      cta: lang === 'es' ? 'Pilotar el cohete' : 'Pilot the rocket',
    },
  };

  const BEATS: Array<{ key: keyof Artifact['facts']; label: string }> = [
    { key: 'what', label: t.factWhat },
    { key: 'why', label: t.factWhy },
    { key: 'found', label: t.factFound },
    { key: 'now', label: t.factNow },
  ];

  return (
    <aside
      className={`card ${visible ? 'is-visible' : ''}`}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="card-scroll">
        <header className="card-head">
          <span className="card-index">{artifact.index}</span>
          <div>
            <h2 className="card-title">{artifact.name}</h2>
            <p className="card-machine">{artifact.machine}</p>
          </div>
        </header>

        <div className="card-meta">
          <span>{artifact.place}</span>
          <span className="card-year">{artifact.year}</span>
        </div>

        <SignalMeter status={artifact.status} />
        <p className="card-status">{artifact.statusLabel}</p>

        {artifact.game && (
          <div className="play-block">
            <span className="play-tag">{t.minigameTag}</span>
            <p className="play-title">{GAME_LABEL[artifact.game].title}</p>
            <button type="button" className="play-button" onClick={() => onPlay(artifact.game!)}>
              {GAME_LABEL[artifact.game].cta}
            </button>
          </div>
        )}

        <dl className="facts">
          {BEATS.map((beat) => (
            <div className="fact" key={beat.key}>
              <dt>{beat.label}</dt>
              <dd>{artifact.facts[beat.key]}</dd>
            </div>
          ))}
        </dl>

        <blockquote className="voice">
          <span className="voice-tag">{t.voiceTag}</span>
          {artifact.voice}
        </blockquote>

        <button type="button" className="interview-button" onClick={() => onInterview(artifact.id)}>
          {t.connect}
        </button>

        {artifact.note && (
          <p className="note">
            <span className="note-tag">{t.noteTag}</span>
            {artifact.note}
          </p>
        )}

        <div className="sources">
          <span className="sources-title">{t.sources}</span>
          <ul>
            {artifact.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer noopener">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
