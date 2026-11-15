export function Loader({ progress, done }: { progress: number; done: boolean }) {
  return (
    <div className={`loader ${done ? 'is-done' : ''}`} aria-live="polite">
      <div className="loader-inner">
        <p className="loader-kicker">Estableciendo enlace</p>
        <h1 className="loader-title">Still Listening</h1>
        <p className="loader-sub">Los que siguen escuchando</p>

        <div className="loader-track">
          <span style={{ transform: `scaleX(${Math.min(1, progress / 100)})` }} />
        </div>
        <p className="loader-count">{Math.round(progress)}%</p>

        <p className="loader-note">4 artefactos · Luna, Marte y espacio profundo</p>
      </div>
    </div>
  );
}
