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

        <h2 className="epilogue-title">
          La diferencia entre basura
          <br />y patrimonio es la memoria.
        </h2>

        <div className="epilogue-text">
          <p>
            En 1969 dejamos un módulo lunar en la Luna porque no podía volver. En 2021 dejamos tubos
            de muestra en Marte <em>a propósito</em>, para que alguien vuelva a buscarlos. Si la misión
            de retorno sale bien, serán los primeros objetos fabricados por humanos recogidos de otro
            planeta.
          </p>
          <p>
            Lo que separa una cosa de la otra no es el material ni la tecnología. Es si alguien sabe
            dónde está y por qué se dejó ahí.
          </p>
        </div>

        <div className="epilogue-stats">
          <div>
            <span className="epilogue-number">4</span>
            <span className="epilogue-label">máquinas contadas</span>
          </div>
          <div>
            <span className="epilogue-number">3</span>
            <span className="epilogue-label">mundos</span>
          </div>
          <div>
            <span className="epilogue-number">55</span>
            <span className="epilogue-label">años de historia</span>
          </div>
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
