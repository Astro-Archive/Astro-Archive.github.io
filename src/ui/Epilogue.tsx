import { EPILOGUE } from '../data/epilogue';

interface EpilogueProps {
  visible: boolean;
  onRestart: () => void;
  onReading: () => void;
}

export function Epilogue({ visible, onRestart, onReading }: EpilogueProps) {
  return (
    <section className={`epilogue ${visible ? 'is-visible' : ''}`} aria-hidden={!visible} inert={!visible}>
      <div className="epilogue-inner">
        <p className="epilogue-kicker">Epílogo</p>

        <h2 className="epilogue-title">{EPILOGUE.title}</h2>

        <div className="epilogue-text">
          {EPILOGUE.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <div className="epilogue-stats">
          {EPILOGUE.stats.map((stat) => (
            <div key={stat.label}>
              <span className="epilogue-number">{stat.value}</span>
              <span className="epilogue-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="epilogue-actions">
          <button type="button" className="game-cta" onClick={onRestart}>
            Volver al principio
          </button>
          <button type="button" className="ghost-button" onClick={onReading}>
            Leer sin 3D
          </button>
        </div>

        <p className="epilogue-credit">
          Modelos 3D: NASA 3D Resources · Datos: NSSDCA y NASA Science · NASA no patrocina ni
          respalda este proyecto.
        </p>
      </div>
    </section>
  );
}
