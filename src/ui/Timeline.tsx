import { ARTIFACTS } from '../data/artifacts';

interface TimelineProps {
  station: number;
  progress: number;
  onSelect: (index: number) => void;
}

export function Timeline({ station, progress, onSelect }: TimelineProps) {
  return (
    <nav className="timeline" aria-label="Recorrido por los artefactos">
      <div className="timeline-track" aria-hidden="true">
        <span className="timeline-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <ul>
        {ARTIFACTS.map((artifact, i) => (
          <li key={artifact.id}>
            <button
              type="button"
              className={`timeline-item ${i === station ? 'is-active' : ''}`}
              onClick={() => onSelect(i)}
              aria-current={i === station ? 'true' : undefined}
            >
              <span className="timeline-dot" />
              <span className="timeline-year">{artifact.year}</span>
              <span className="timeline-name">{artifact.name}</span>
              <span className="timeline-where">{artifact.place.split(',')[0]}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
