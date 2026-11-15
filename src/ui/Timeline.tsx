import { artifactsFor } from '../data/artifacts';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';

interface TimelineProps {
  station: number;
  progress: number;
  onSelect: (index: number) => void;
}

export function Timeline({ station, progress, onSelect }: TimelineProps) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const artifacts = artifactsFor(lang);

  return (
    <nav className="timeline" aria-label={t.timelineAria}>
      <div className="timeline-track" aria-hidden="true">
        <span className="timeline-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <ul>
        {artifacts.map((artifact, i) => (
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
