import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { ARTIFACTS, ARTIFACT_COUNT, type GameId } from './data/artifacts';
import { Experience } from './scene/Experience';
import { cameraT, usePrefersReducedMotion, useScroll, hasWebGL } from './lib/useScroll';
import { ChapterCard } from './ui/ChapterCard';
import { Timeline } from './ui/Timeline';
import { ReadingMode } from './ui/ReadingMode';
import { Loader } from './ui/Loader';
import { Epilogue } from './ui/Epilogue';
import { DescentGame } from './game/DescentGame';
import { EnergyGame } from './game/EnergyGame';
import { RpgMode } from './rpg/RpgMode';

const EPILOGUE_AT = 3.75; // índice de paso, no progreso

export default function App() {
  const { ref, progress, scaled, station, card, goTo } = useScroll(ARTIFACT_COUNT);
  const prefersReduced = usePrefersReducedMotion();
  // ?capture fuerza cámara seca: sirve para grabar frames deterministas.
  const capture = typeof window !== 'undefined' && window.location.search.includes('capture');
  const reduced = prefersReduced || capture;
  const { progress: loadProgress } = useProgress();

  const [reading, setReading] = useState(() => !hasWebGL());
  const [ready, setReady] = useState(false);
  const [game, setGame] = useState<GameId | null>(null);
  const [rpg, setRpg] = useState(false);

  // Mantiene la última tarjeta visible mientras la cámara viaja entre estaciones.
  const lastIndex = useRef(0);
  if (card !== null) lastIndex.current = card;

  useEffect(() => {
    if (loadProgress < 100) return;
    const timer = window.setTimeout(() => setReady(true), 500);
    return () => window.clearTimeout(timer);
  }, [loadProgress]);

  // Red de seguridad: si un modelo falla, la app no se queda en la pantalla de carga.
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 14000);
    return () => window.clearTimeout(timer);
  }, []);

  // Bloquea el scroll del museo mientras hay un minijuego o el modo lectura abierto.
  useEffect(() => {
    const locked = game !== null || reading || rpg;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [game, reading, rpg]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setReading(false);
        setGame(null);
        setRpg(false);
      }
      if (reading || game || rpg) return;
      if (event.key === 'ArrowRight') goTo(Math.min(ARTIFACT_COUNT - 1, station + 1));
      if (event.key === 'ArrowLeft') goTo(Math.max(0, station - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, reading, station, game, rpg]);

  const heroVisible = scaled < 0.5;
  const cardVisible = card !== null && scaled < EPILOGUE_AT && !reading && !rpg;
  const epilogueVisible = scaled >= EPILOGUE_AT && !reading && game === null && !rpg;
  const activeArtifact = ARTIFACTS[lastIndex.current];

  const restart = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // al cerrar un minijuego, el foco vuelve al botón que lo abrió
  const closeGame = () => {
    setGame(null);
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('.play-button')?.focus();
    });
  };

  return (
    <div className="app">
      {/* el fondo se vuelve inerte cuando hay un overlay abierto: el foco no se escapa */}
      <div className="app-main" inert={game !== null || reading}>
      <div className={`stage ${reading ? 'is-hidden' : ''}`} aria-hidden="true">
        <Canvas
          dpr={[1, 1.75]}
          camera={{ fov: 42, near: 0.1, far: 400, position: [6.5, 4.6, 9.5] }}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
          shadows={false}
        >
          <Suspense fallback={null}>
            <Experience progress={ref} reduced={reduced} />
          </Suspense>
        </Canvas>
      </div>

      <div className="progress-rail" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className="scroll-space" aria-hidden="true">
        {Array.from({ length: ARTIFACT_COUNT + 2 }).map((_, i) => (
          <section key={i} className="anchor" />
        ))}
      </div>

      <header className="hud">
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-name">Still Listening</span>
          <span className="brand-sub">Los que siguen escuchando</span>
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => setReading((value) => !value)}
            aria-pressed={reading}
          >
            {reading ? 'Ver recorrido 3D' : 'Modo lectura'}
          </button>
        </div>
      </header>

      <div className={`hero ${heroVisible && !reading ? 'is-visible' : ''}`} aria-hidden={!heroVisible}>
        <p className="hero-kicker">2026 NASA Space Apps Challenge</p>
        <h1 className="hero-title">
          Still
          <br />
          Listening
        </h1>
        <p className="hero-sub">
          Cuatro máquinas que ya no transmiten.
          <br />
          Sus historias sí.
        </p>
        <p className="hero-hint">Desliza para empezar el recorrido</p>
      </div>

      <ChapterCard
        artifact={activeArtifact}
        visible={cardVisible}
        onPlay={setGame}
        onStartRpg={() => setRpg(true)}
      />

      <Epilogue
        visible={epilogueVisible}
        onRestart={restart}
        onReading={() => setReading(true)}
      />

      <Timeline station={station} progress={cameraT(progress, ARTIFACT_COUNT)} onSelect={goTo} />

      <footer className="credits">Modelos: NASA 3D Resources · Datos: NSSDCA</footer>

      </div>

      <Loader progress={loadProgress} done={ready} />

      {reading && <ReadingMode onClose={() => setReading(false)} />}
      {game === 'descent' && <DescentGame onClose={closeGame} />}
      {game === 'energy' && <EnergyGame onClose={closeGame} />}
      {rpg && <RpgMode onClose={() => setRpg(false)} />}
    </div>
  );
}
