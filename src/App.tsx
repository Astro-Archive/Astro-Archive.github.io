import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { ARTIFACT_COUNT, artifactsFor, type GameId } from './data/artifacts';
import { Experience } from './scene/Experience';
import { cameraT, usePrefersReducedMotion, useScroll, hasWebGL } from './lib/useScroll';
import { ChapterCard } from './ui/ChapterCard';
import { Timeline } from './ui/Timeline';
import { ReadingMode } from './ui/ReadingMode';
import { Loader } from './ui/Loader';
import { Epilogue } from './ui/Epilogue';
import { LanguageSwitch } from './ui/LanguageSwitch';
import { useLang } from './i18n/lang';
import { uiFor } from './i18n/ui';
import { DescentGame } from './game/DescentGame';
import { EnergyGame } from './game/EnergyGame';
import { LaunchGame } from './game/LaunchGame';
import { InterviewGame } from './rpg/InterviewGame';
import { CatalogModal as Catalog } from './rpg/CatalogModal';
import { completedInterviews, useCatalog } from './rpg/catalog';

const EPILOGUE_AT = 4.6; // índice de paso, no progreso: la ficha de Dawn queda legible antes

// Simulador interactivo: Astro Archive, el museo 3D hermano del mismo reto.
const OTHER_PROJECT_URL = 'https://astroarchive.earth/astro-archive/';

export default function App() {
  const { lang } = useLang();
  const t = uiFor(lang);
  const artifacts = artifactsFor(lang);
  const { ref, progress, scaled, station, card, goTo } = useScroll(ARTIFACT_COUNT);
  const prefersReduced = usePrefersReducedMotion();
  // ?capture fuerza cámara seca: sirve para grabar frames deterministas.
  const capture = typeof window !== 'undefined' && window.location.search.includes('capture');
  const reduced = prefersReduced || capture;
  const { progress: loadProgress } = useProgress();

  const [reading, setReading] = useState(() => !hasWebGL());
  const [ready, setReady] = useState(false);
  const [game, setGame] = useState<GameId | null>(null);
  const [interview, setInterview] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const catalog = useCatalog();
  const interviewed = completedInterviews(catalog);

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
    const locked = game !== null || reading || interview !== null || catalogOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [game, reading, interview, catalogOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setReading(false);
        setGame(null);
      }
      if (reading || game || interview || catalogOpen) return;
      if (event.key === 'ArrowRight') goTo(Math.min(ARTIFACT_COUNT - 1, station + 1));
      if (event.key === 'ArrowLeft') goTo(Math.max(0, station - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, reading, station, game, interview, catalogOpen]);

  const heroVisible = scaled < 0.5;
  const cardVisible = card !== null && scaled < EPILOGUE_AT && !reading;
  const epilogueVisible = scaled >= EPILOGUE_AT && !reading && game === null;
  const activeArtifact = artifacts[lastIndex.current];
  const overlayOpen = game !== null || interview !== null || catalogOpen || reading;

  const restart = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // al cerrar un minijuego, el foco vuelve de manera segura sin saltos de scroll
  const closeGame = () => {
    setGame(null);
    requestAnimationFrame(() => {
      const btn = document.querySelector<HTMLButtonElement>('.play-button, .hero-tour-button');
      if (btn) btn.focus({ preventScroll: true });
    });
  };

  const closeInterview = () => {
    setInterview(null);
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('.interview-button')?.focus();
    });
  };

  const openCatalog = () => {
    setInterview(null);
    setCatalogOpen(true);
  };

  const startInterview = (artifactId: string) => {
    setCatalogOpen(false);
    setInterview(artifactId);
  };

  return (
    <div className="app">
      {/* el fondo se vuelve inerte cuando hay un overlay abierto: el foco no se escapa */}
      <div className="app-main" inert={overlayOpen}>
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
          <span className="brand-sub">{t.brandSub}</span>
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => setCatalogOpen(true)}
            aria-label={t.openCatalog(interviewed)}
          >
            {t.catalog(interviewed)}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setReading((value) => !value)}
            aria-pressed={reading}
          >
            {reading ? t.readingOff : t.readingOn}
          </button>
          <button
            type="button"
            className="ghost-button hud-launch"
            onClick={() => setGame('launch')}
            style={{
              borderColor: 'rgba(56, 189, 248, 0.6)',
              color: '#38bdf8',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
            }}
            aria-label={lang === 'es' ? 'Despegar al Espacio' : 'Launch to Space'}
          >
            {lang === 'es' ? 'Despegar al Espacio' : 'Launch to Space'}
          </button>
          <LanguageSwitch />
          <a
            className="ghost-button hud-external"
            href={OTHER_PROJECT_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t.openSimulator}
          >
            <span className="hud-external-label">{t.simulator}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <div className={`hero ${heroVisible && !reading ? 'is-visible' : ''}`} aria-hidden={!heroVisible}>
        <p className="hero-kicker">{t.heroKicker}</p>
        <h1 className="hero-title">
          Still
          <br />
          Listening
        </h1>
        <p className="hero-sub">
          {t.heroLine1}
          <br />
          {t.heroLine2}
        </p>
        <p className="hero-hint">{t.heroHint}</p>
        <div style={{ marginTop: '20px' }}>
          <button
            type="button"
            className="ghost-button hero-tour-button"
            onClick={() => goTo(0)}
            style={{
              padding: '11px 24px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'rgba(255, 107, 53, 0.15)',
              borderColor: 'rgba(255, 107, 53, 0.6)',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(255, 107, 53, 0.22)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            aria-label={lang === 'es' ? 'Iniciar recorrido' : 'Start tour'}
          >
            <span>{lang === 'es' ? 'Iniciar recorrido' : 'Start tour'}</span>
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>

      <ChapterCard
        artifact={activeArtifact}
        visible={cardVisible}
        onPlay={setGame}
        onInterview={startInterview}
      />

      <Epilogue
        visible={epilogueVisible}
        onRestart={restart}
        onReading={() => setReading(true)}
      />

      <Timeline station={station} progress={cameraT(progress, ARTIFACT_COUNT)} onSelect={goTo} />

      <footer className="credits">{t.credits}</footer>

      </div>

      <Loader progress={loadProgress} done={ready} />

      {reading && <ReadingMode onClose={() => setReading(false)} />}
      {game === 'descent' && <DescentGame onClose={closeGame} />}
      {game === 'energy' && <EnergyGame onClose={closeGame} />}
      {game === 'launch' && (
        <LaunchGame
          onClose={closeGame}
          onComplete={() => {
            window.location.href = OTHER_PROJECT_URL;
          }}
        />
      )}
      {interview && (
        <InterviewGame
          artifact={artifacts.find((a) => a.id === interview) ?? artifacts[0]}
          reduced={reduced}
          onClose={closeInterview}
          onCatalog={openCatalog}
        />
      )}
      {catalogOpen && (
        <Catalog onClose={() => setCatalogOpen(false)} onInterview={startInterview} />
      )}
    </div>
  );
}
