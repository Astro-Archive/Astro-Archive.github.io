import { ARTIFACTS } from '../data/artifacts';

interface ReadingModeProps {
  onClose: () => void;
}

export function ReadingMode({ onClose }: ReadingModeProps) {
  return (
    <div className="reading" role="dialog" aria-modal="true" aria-label="Modo lectura">
      <div className="reading-bar">
        <span className="reading-kicker">Modo lectura · sin 3D</span>
        <button type="button" className="ghost-button" onClick={onClose} autoFocus>
          Volver al recorrido
        </button>
      </div>

      <article className="reading-body">
        <header className="reading-head">
          <h1>Still Listening</h1>
          <p className="reading-sub">Los que siguen escuchando</p>
          <p className="reading-intro">
            Desde 1969, la NASA ha dejado máquinas en la Luna, en Marte y en el espacio profundo.
            Algunas todavía responden. Otras llevan décadas en silencio. Estas son cuatro de sus
            historias: qué eran, por qué fueron y qué descubrieron.
          </p>
        </header>

        {ARTIFACTS.map((artifact) => (
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
              <dt>Qué es</dt>
              <dd>{artifact.facts.what}</dd>
              <dt>Por qué fue</dt>
              <dd>{artifact.facts.why}</dd>
              <dt>Qué encontró</dt>
              <dd>{artifact.facts.found}</dd>
              <dt>Qué es ahora</dt>
              <dd>{artifact.facts.now}</dd>
            </dl>

            <blockquote className="reading-voice">
              <span className="voice-tag">Voz ficcionalizada</span>
              {artifact.voice}
            </blockquote>

            {artifact.note && (
              <p className="note">
                <span className="note-tag">Ojo con el dato</span>
                {artifact.note}
              </p>
            )}

            <p className="reading-sources">
              Fuentes:{' '}
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

        <footer className="reading-footer">
          <p>
            Modelos 3D: <strong>NASA 3D Resources</strong>. Datos: <strong>NSSDCA</strong> y páginas
            de misión de NASA Science. Los textos de la sección &laquo;Voz ficcionalizada&raquo; son
            recreaciones literarias, no transmisiones reales.
          </p>
          <p>
            NASA no patrocina ni respalda este proyecto. NASA es la fuente de los modelos y de los
            datos citados.
          </p>
        </footer>
      </article>
    </div>
  );
}
