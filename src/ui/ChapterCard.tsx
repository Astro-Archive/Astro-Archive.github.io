import type { Artifact, GameId } from '../data/artifacts';
import { SignalMeter } from './SignalMeter';

interface ChapterCardProps {
  artifact: Artifact;
  visible: boolean;
  onPlay: (game: GameId) => void;
  onStartRpg: () => void;
}

const GAME_LABEL: Record<GameId, { title: string; cta: string }> = {
  descent: { title: 'Pilota el descenso', cta: 'Intentar el aterrizaje' },
  energy: { title: 'El último invierno', cta: 'Repartir la energía' },
};

const BEATS: Array<{ key: keyof Artifact['facts']; label: string }> = [
  { key: 'what', label: 'Qué es' },
  { key: 'why', label: 'Por qué fue' },
  { key: 'found', label: 'Qué encontró' },
  { key: 'now', label: 'Qué es ahora' },
];

export function ChapterCard({ artifact, visible, onPlay, onStartRpg }: ChapterCardProps) {
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
            <span className="play-tag">Minijuego · 20 segundos</span>
            <p className="play-title">{GAME_LABEL[artifact.game].title}</p>
            <button type="button" className="play-button" onClick={() => onPlay(artifact.game!)}>
              {GAME_LABEL[artifact.game].cta}
            </button>
          </div>
        )}

        {artifact.id === 'eagle' && (
          <div className="play-block rpg-entry">
            <span className="play-tag">Modo RPG educativo</span>
            <p className="play-title">El primer paso</p>
            <button type="button" className="play-button" onClick={onStartRpg}>
              Comenzar misión
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
          <span className="voice-tag">Voz ficcionalizada</span>
          {artifact.voice}
        </blockquote>

        {artifact.note && (
          <p className="note">
            <span className="note-tag">Ojo con el dato</span>
            {artifact.note}
          </p>
        )}

        <div className="sources">
          <span className="sources-title">Fuentes</span>
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
