import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';
import {
  createInitialLaunchState,
  stepLaunchPhysics,
  type LaunchInput,
  type LaunchState,
} from './launchPhysics';
import {
  playCountdownBeep,
  playOrbitalInsertionChime,
  playSonicBoom,
  playStageSeparationSound,
  startRocketEngine,
  stopRocketEngine,
  updateEngineAcoustics,
} from './launchAudio';
import { ShuttleStack } from './ShuttleStack';
import { CapeCanaveralPad } from './CapeCanaveralPad';
import { ShuttleGalleryModal } from './ShuttleGalleryModal';

const OTHER_PROJECT_URL = 'https://astroarchive.earth/astro-archive/';

type ViewPreset = 'chase' | 'top' | 'profile' | 'front';

/* ---------------- 3D ENVIRONMENT & ATMOSPHERE ---------------- */

/** Starfield that fades in when ascending past the stratosphere into space */
function DynamicStarfield({ altitude }: { altitude: number }) {
  const [geo, mat] = useMemo(() => {
    const count = 2500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 380 + Math.random() * 150;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 15;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const m = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 1.6,
      transparent: true,
      opacity: 0,
    });
    return [g, m];
  }, []);

  useFrame(() => {
    if (mat) {
      const starAlpha = Math.min(1, Math.max(0, (altitude - 18) / 60));
      mat.opacity = starAlpha;
    }
  });

  return <primitive object={new THREE.Points(geo, mat)} />;
}

/** Tropospheric Cloud Layers (0-12 km) that the shuttle passes through */
function CloudDeck({ altitude }: { altitude: number }) {
  const cloudsRef = useRef<THREE.Group>(null);

  const cloudMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        transparent: true,
        opacity: 0.72,
        roughness: 0.95,
        depthWrite: false,
      }),
    []
  );

  useFrame(() => {
    if (cloudsRef.current) {
      cloudsRef.current.position.y = -altitude * 10 + 35;
      cloudsRef.current.visible = altitude < 35;
    }
  });

  return (
    <group ref={cloudsRef}>
      <mesh position={[-60, 0, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[110, 32]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>
      <mesh position={[80, 8, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[130, 32]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>
      <mesh position={[-40, 16, -70]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[95, 32]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>
    </group>
  );
}



/* ---------------- MAIN LAUNCH SCENE ---------------- */

interface LaunchSceneProps {
  state: LaunchState;
  srbSeparated: boolean;
  etSeparated: boolean;
  srbOffset: number;
  etOffset: number;
  orbitControlsRef: React.RefObject<any>;
}

function LaunchScene({
  state,
  srbSeparated,
  etSeparated,
  srbOffset,
  etOffset,
  orbitControlsRef,
}: LaunchSceneProps) {
  const { scene } = useThree();
  const vaporConeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const alt = state.altitude;

    // Dynamic Atmosphere Sky Color
    let skyR = 0.22, skyG = 0.74, skyB = 0.97;
    if (alt < 15) {
      const k = alt / 15;
      skyR = THREE.MathUtils.lerp(0.22, 0.11, k);
      skyG = THREE.MathUtils.lerp(0.74, 0.31, k);
      skyB = THREE.MathUtils.lerp(0.97, 0.85, k);
    } else if (alt < 45) {
      const k = (alt - 15) / 30;
      skyR = THREE.MathUtils.lerp(0.11, 0.04, k);
      skyG = THREE.MathUtils.lerp(0.31, 0.08, k);
      skyB = THREE.MathUtils.lerp(0.85, 0.25, k);
    } else if (alt < 85) {
      const k = (alt - 45) / 40;
      skyR = THREE.MathUtils.lerp(0.04, 0.008, k);
      skyG = THREE.MathUtils.lerp(0.08, 0.015, k);
      skyB = THREE.MathUtils.lerp(0.25, 0.04, k);
    } else {
      skyR = 0.004;
      skyG = 0.008;
      skyB = 0.015;
    }

    scene.background = new THREE.Color(skyR, skyG, skyB);

    // Transonic Mach Shock Vapor Cone
    if (vaporConeRef.current) {
      const inVaporRange = alt >= 10 && alt <= 18;
      vaporConeRef.current.visible = inVaporRange;
      if (inVaporRange) {
        const pulse = 0.95 + Math.sin(Date.now() * 0.04) * 0.12;
        vaporConeRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  const pitchRad = ((90 - state.pitch) * Math.PI) / 180;
  const rollRad = state.corridorOffset * -0.18;

  return (
    <>
      <ambientLight intensity={state.altitude > 80 ? 0.35 : 0.85} />
      <directionalLight position={[25, 45, 30]} intensity={state.altitude > 80 ? 3.8 : 2.0} color="#fffef4" />

      {/* Free 360-degree Orbit Controls (enables top view, bottom view, side view, and zoom) */}
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        target={[0, 6, 0]}
        minDistance={15}
        maxDistance={280}
        maxPolarAngle={Math.PI}
      />

      {/* SPACE SHUTTLE STACK IN 3D */}
      <group rotation={[pitchRad, 0, rollRad]}>
        <Suspense fallback={null}>
          <ShuttleStack
            stage={state.stage}
            throttle={state.throttle}
            srbSeparated={srbSeparated}
            etSeparated={etSeparated}
            srbOffset={srbOffset}
            etOffset={etOffset}
          />
        </Suspense>

        {/* Transonic Mach 1 Vapor Cone */}
        <mesh ref={vaporConeRef} position={[0, 6, 4]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <coneGeometry args={[14, 18, 32, 1, true]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.38}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* CAPE CANAVERAL PAD LC-39B & AERIAL SATELLITE TERRAIN */}
      <Suspense fallback={null}>
        <CapeCanaveralPad altitude={state.altitude} />
      </Suspense>

      {/* CLOUDS IN TROPOSPHERE */}
      <CloudDeck altitude={state.altitude} />

      {/* DYNAMIC STARFIELD */}
      <DynamicStarfield altitude={state.altitude} />


    </>
  );
}

/* ---------------- MAIN EXPORT COMPONENT ---------------- */

interface LaunchGameProps {
  onClose: () => void;
  onComplete?: () => void;
}

export function LaunchGame({ onClose, onComplete }: LaunchGameProps) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const rootRef = useRef<HTMLDivElement>(null);
  const orbitControlsRef = useRef<any>(null);

  const [state, setState] = useState<LaunchState>(createInitialLaunchState);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [timeWarp, setTimeWarp] = useState<number>(1.0);
  const [autoRedirectSec, setAutoRedirectSec] = useState<number | null>(null);

  // Separation animation progress
  const [srbSeparated, setSrbSeparated] = useState(false);
  const [etSeparated, setEtSeparated] = useState(false);
  const srbOffsetRef = useRef(0);
  const etOffsetRef = useRef(0);
  const [srbOffset, setSrbOffset] = useState(0);
  const [etOffset, setEtOffset] = useState(0);

  const stateRef = useRef(state);
  stateRef.current = state;

  const inputRef = useRef<LaunchInput>({
    throttleUp: false,
    throttleDown: false,
    steerLeft: false,
    steerRight: false,
    separateStage: false,
  });

  // Focus lock
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  // Update time warp on stateRef
  const changeTimeWarp = (warp: number) => {
    setTimeWarp(warp);
    stateRef.current.timeWarp = warp;
  };

  // Camera presets
  const applyViewPreset = (preset: ViewPreset) => {
    const controls = orbitControlsRef.current;
    if (!controls) return;
    if (preset === 'top') {
      // Direct Top-Down View
      controls.object.position.set(0, 68, 0.1);
      controls.target.set(0, 6, 0);
    } else if (preset === 'chase') {
      // Classic Chase Cam
      controls.object.position.set(0, -14, 48);
      controls.target.set(0, 10, -5);
    } else if (preset === 'profile') {
      // Side Profile View
      controls.object.position.set(52, 4, 12);
      controls.target.set(0, 6, 0);
    } else if (preset === 'front') {
      // Front View
      controls.object.position.set(0, 8, -50);
      controls.target.set(0, 6, 0);
    }
    controls.update();
  };

  // Countdown T-3, 2, 1, LIFTOFF
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      playCountdownBeep(false);
      const timer = setTimeout(() => {
        setCountdown((c) => (c !== null ? c - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      playCountdownBeep(true);
      startRocketEngine();
      setStarted(true);
      const timer = setTimeout(() => {
        setCountdown(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Main simulation physics & staging animation loop (120 Hz)
  useEffect(() => {
    let raf = 0;
    let lastTime = performance.now();
    let acc = 0;
    let hudClock = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      acc += dt;

      while (acc >= 1 / 120) {
        stateRef.current = stepLaunchPhysics(stateRef.current, 1 / 120, inputRef.current, started);
        acc -= 1 / 120;
      }

      // Animate SRB separation drift
      if (srbSeparated && srbOffsetRef.current < 1.0) {
        srbOffsetRef.current = Math.min(1.0, srbOffsetRef.current + dt * 0.4 * (stateRef.current.timeWarp || 1));
        setSrbOffset(srbOffsetRef.current);
      }

      // Animate External Tank separation drift
      if (etSeparated && etOffsetRef.current < 1.0) {
        etOffsetRef.current = Math.min(1.0, etOffsetRef.current + dt * 0.3 * (stateRef.current.timeWarp || 1));
        setEtOffset(etOffsetRef.current);
      }

      hudClock += dt;
      if (hudClock > 0.05) {
        hudClock = 0;
        const cur = stateRef.current;
        setState({ ...cur });
        if (!muted && started) {
          updateEngineAcoustics(cur.throttle, cur.altitude, cur.stage);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      stopRocketEngine();
    };
  }, [started, muted, srbSeparated, etSeparated]);

  // Detect Milestones
  const prevAlt = useRef(0);
  const prevStage = useRef<1 | 2 | 'orbit'>(1);

  useEffect(() => {
    if (!started) return;

    if (prevAlt.current < 11 && state.altitude >= 11) {
      playSonicBoom();
    }

    if (prevStage.current === 1 && state.stage === 2 && !srbSeparated) {
      setSrbSeparated(true);
      playStageSeparationSound();
    }

    if (state.altitude >= 115 && !etSeparated) {
      setEtSeparated(true);
      playStageSeparationSound();
    }

    if (prevStage.current !== 'orbit' && state.stage === 'orbit') {
      playOrbitalInsertionChime();
      setAutoRedirectSec(5);
    }

    prevAlt.current = state.altitude;
    prevStage.current = state.stage;
  }, [state.altitude, state.stage, started, srbSeparated, etSeparated]);

  // Auto-redirect countdown once in orbit
  useEffect(() => {
    if (autoRedirectSec === null) return;
    if (autoRedirectSec > 0) {
      const timer = setTimeout(() => setAutoRedirectSec((s) => (s !== null ? s - 1 : null)), 1000);
      return () => clearTimeout(timer);
    }
    if (autoRedirectSec === 0) {
      redirectToSimulator();
    }
  }, [autoRedirectSec]);

  const redirectToSimulator = () => {
    stopRocketEngine();
    if (onComplete) {
      onComplete();
    } else {
      window.location.href = OTHER_PROJECT_URL;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (galleryOpen) setGalleryOpen(false);
        else onClose();
      }
      if (e.key === '1') changeTimeWarp(0.5);
      if (e.key === '2') changeTimeWarp(1.0);
      if (e.key === '3') changeTimeWarp(2.0);
      if (e.key === '4') changeTimeWarp(4.0);
      if (e.key === 't' || e.key === 'T') applyViewPreset('top');
      if (e.key === 'c' || e.key === 'C') applyViewPreset('chase');
      if (e.key === 'p' || e.key === 'P') applyViewPreset('profile');

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.steerLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.steerRight = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inputRef.current.throttleUp = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') inputRef.current.throttleDown = true;
      if (e.key === ' ' || e.key === 'Enter') {
        if (stateRef.current.readyToSeparate) {
          inputRef.current.separateStage = true;
        } else {
          inputRef.current.throttleUp = true;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current.steerLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current.steerRight = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inputRef.current.throttleUp = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') inputRef.current.throttleDown = false;
      if (e.key === ' ') {
        inputRef.current.throttleUp = false;
        inputRef.current.separateStage = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onClose, galleryOpen]);

  // Touch steer helpers
  const handleSteer = (dir: 'left' | 'right', pressed: boolean) => {
    if (dir === 'left') inputRef.current.steerLeft = pressed;
    if (dir === 'right') inputRef.current.steerRight = pressed;
  };

  const handleThrottle = (pressed: boolean) => {
    inputRef.current.throttleUp = pressed;
  };

  const triggerSeparation = () => {
    inputRef.current.separateStage = true;
    setTimeout(() => {
      inputRef.current.separateStage = false;
    }, 200);
  };

  const isEs = lang === 'es';
  const siteLabel = isEs ? 'CABO CAÑAVERAL, FL // PLATAFORMA 39B' : 'CAPE CANAVERAL, FL // PAD 39B';
  const titleText = isEs ? 'TRANSBORDADOR ESPACIAL ATLANTIS' : 'SPACE SHUTTLE ATLANTIS';

  // Current atmospheric layer info
  const alt = state.altitude;
  let layerBadge = isEs ? 'TROPOSFERA · 0 - 12 KM' : 'TROPOSPHERE · 0 - 12 KM';
  let layerDesc = isEs ? 'Atmósfera densa · Costa de Florida' : 'Dense Atmosphere · Florida Coast';

  if (alt >= 12 && alt < 50) {
    layerBadge = isEs ? 'ESTRATOSFERA · 12 - 50 KM (MAX-Q)' : 'STRATOSPHERE · 12 - 50 KM (MAX-Q)';
    layerDesc = isEs ? `Transónico · Mach ${state.mach.toFixed(1)} · Presión Q: ${state.dynamicPressure.toFixed(1)} kPa` : `Transonic · Mach ${state.mach.toFixed(1)} · Dynamic Q: ${state.dynamicPressure.toFixed(1)} kPa`;
  } else if (alt >= 50 && alt < 85) {
    layerBadge = isEs ? 'MESOSFERA · 50 - 85 KM' : 'MESOSPHERE · 50 - 85 KM';
    layerDesc = isEs ? 'Separación de Propulsores Sólidos (SRB)' : 'Solid Rocket Booster (SRB) Separation';
  } else if (alt >= 85 && alt < 120) {
    layerBadge = isEs ? 'TERMOSFERA · LÍNEA DE KÁRMÁN (100 KM)' : 'THERMOSPHERE · KÁRMÁN LINE (100 KM)';
    layerDesc = isEs ? 'Frontera del Espacio Exterior · Separación ET' : 'Boundary of Space · External Tank Separation';
  } else if (alt >= 120) {
    layerBadge = isEs ? 'EXOSFERA · ÓRBITA BAJA (LEO)' : 'EXOSPHERE · LOW EARTH ORBIT (LEO)';
    layerDesc = isEs ? 'Microgravedad (0.0 G) · Inserción Orbital' : 'Microgravity (0.0 G) · Orbital Insertion';
  }

  return (
    <div
      className="game launch-game"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={rootRef}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#020617', userSelect: 'none' }}
    >
      {/* 3D Viewport with OrbitControls */}
      <div className="game-stage" style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          dpr={[1, 1.75]}
          camera={{ fov: 58, near: 0.2, far: 50000, position: [0, -14, 48] }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <LaunchScene
            state={state}
            srbSeparated={srbSeparated}
            etSeparated={etSeparated}
            srbOffset={srbOffset}
            etOffset={etOffset}
            orbitControlsRef={orbitControlsRef}
          />
        </Canvas>
      </div>

      {/* Header bar */}
      <header
        className="game-bar"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'linear-gradient(180deg, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0) 100%)',
        }}
      >
        <div>
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.15em', color: '#38bdf8' }}>
            {siteLabel}
          </p>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
            {titleText}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Historical Fleet Gallery Button */}
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              background: 'rgba(2, 132, 199, 0.25)',
              border: '1px solid #0284c7',
              borderRadius: '6px',
              color: '#38bdf8',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
            }}
          >
            [ {isEs ? 'FLOTA HISTÓRICA' : 'SHUTTLE ARCHIVE'} ]
          </button>

          {/* Camera View Preset Buttons */}
          <button
            type="button"
            onClick={() => applyViewPreset('top')}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              cursor: 'pointer',
            }}
            title="Vista Superior [T]"
          >
            TOP
          </button>
          <button
            type="button"
            onClick={() => applyViewPreset('chase')}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              cursor: 'pointer',
            }}
            title="Cámara Trasera [C]"
          >
            CHASE
          </button>
          <button
            type="button"
            onClick={() => applyViewPreset('profile')}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              cursor: 'pointer',
            }}
            title="Perfil Lateral [P]"
          >
            SIDE
          </button>

          {/* Time Warp Speed Controls */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid #334155',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {[0.5, 1.0, 2.0, 4.0].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => changeTimeWarp(w)}
                style={{
                  padding: '5px 8px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  fontWeight: timeWarp === w ? 800 : 500,
                  background: timeWarp === w ? '#0284c7' : 'transparent',
                  color: timeWarp === w ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {w}X
              </button>
            ))}
          </div>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => {
              setMuted(!muted);
              if (!muted) stopRocketEngine();
              else if (started) startRocketEngine();
            }}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: muted ? '#94a3b8' : '#38bdf8',
              cursor: 'pointer',
            }}
          >
            {muted ? 'AUDIO OFF' : 'AUDIO ON'}
          </button>

          {/* Exit / Back to Museum */}
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: 'transparent',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            {t.backToMuseum}
          </button>
        </div>
      </header>

      {/* Atmospheric Layer Tracker Pill (Top Center) */}
      {started && !state.orbitalInsertion && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 20px',
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '0.12em' }}>
            {layerBadge}
          </span>
          <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>
            {layerDesc}
          </span>
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 20,
            pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.3em', color: '#38bdf8', marginBottom: '8px' }}>
            // STS-135 LAUNCH SEQUENCE · PAD 39B //
          </div>
          <div
            style={{
              fontSize: '5.5rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: countdown === 0 ? '#10b981' : '#f8fafc',
              textShadow: '0 0 26px rgba(56,189,248,0.8)',
            }}
          >
            {countdown === 0 ? 'LIFTOFF!' : `T-${countdown}`}
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>
            Kennedy Space Center · Cape Canaveral, FL
          </div>
        </div>
      )}

      {/* Comprehensive Aerospace Telemetry Panel (Left) */}
      {started && !state.orbitalInsertion && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '20px',
            zIndex: 10,
            padding: '14px 18px',
            background: 'rgba(11, 17, 32, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            fontFamily: 'monospace',
            color: '#e2e8f0',
            width: '240px',
            pointerEvents: 'none',
          }}
        >
          {/* Header & Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>
              T+{(state.missionTime).toFixed(1)}s
            </span>
            <span style={{ fontSize: '10px', color: srbSeparated ? '#38bdf8' : '#10b981', fontWeight: 'bold' }}>
              {srbSeparated ? 'ET + SSME' : 'SRB BOOST'}
            </span>
          </div>

          {/* Altitude & Speed */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>ALTITUDE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {state.altitude.toFixed(1)} <span style={{ fontSize: '10px', color: '#38bdf8' }}>km</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>SPEED</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {Math.round(state.velocity).toLocaleString()} <span style={{ fontSize: '9px', color: '#64748b' }}>km/h</span>
              </div>
              <div style={{ fontSize: '10px', color: state.mach > 1 ? '#38bdf8' : '#64748b' }}>
                Mach {state.mach.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Downrange & Apogee */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>DOWNRANGE</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
                {state.downrangeDistance.toFixed(1)} km
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>EST. APOGEE</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                {state.projectedApogee.toFixed(0)} km
              </div>
            </div>
          </div>

          {/* Dynamic Pressure Q & G-Force */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>DYNAMIC Q</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: state.dynamicPressure > 28 ? '#f59e0b' : '#38bdf8' }}>
                {state.dynamicPressure.toFixed(1)} kPa
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>G-FORCE</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: state.gForce > 3.0 ? '#ef4444' : '#10b981' }}>
                {state.gForce.toFixed(2)} G ({state.acceleration.toFixed(1)} m/s²)
              </div>
            </div>
          </div>

          {/* Chamber Pressure Pc & Propellant Mass */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>SSME Pc</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
                {state.chamberPressure.toFixed(0)}% RPL
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>PROP. MASS</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
                {Math.round(state.propellantMass)} t
              </div>
            </div>
          </div>

          {/* Fuel Gauges */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginBottom: '3px' }}>
              <span>{srbSeparated ? 'EXTERNAL TANK (LH2/LOX)' : 'SOLID ROCKET BOOSTERS (SRB)'}</span>
              <span>{Math.round((srbSeparated ? state.stage2Fuel : state.stage1Fuel) * 100)}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(srbSeparated ? state.stage2Fuel : state.stage1Fuel) * 100}%`,
                  background: !srbSeparated && state.stage1Fuel < 0.15 ? '#ef4444' : '#10b981',
                  transition: 'width 0.08s linear',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Free View Hint (Top Right) */}
      {started && !state.orbitalInsertion && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            zIndex: 10,
            padding: '8px 14px',
            background: 'rgba(11, 17, 32, 0.75)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#94a3b8',
            pointerEvents: 'none',
            textAlign: 'right',
          }}
        >
          <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '2px' }}>
            {isEs ? '// VISTA LIBRE 360° ACTIVA //' : '// 360° FREE ORBIT ACTIVE //'}
          </div>
          <div>{isEs ? 'Arrastra para rotar · Rueda para zoom' : 'Click & drag to rotate · Scroll to zoom'}</div>
          <div>{isEs ? 'Presiona [T] para Vista Superior' : 'Press [T] for Top View'}</div>
        </div>
      )}

      {/* Flight Corridor Trajectory Indicator */}
      {started && !state.orbitalInsertion && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '260px',
              height: '26px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '6px',
              position: 'relative',
              background: 'rgba(2, 6, 23, 0.55)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '35%',
                width: '30%',
                background: 'rgba(16, 185, 129, 0.25)',
                borderLeft: '1px dashed #10b981',
                borderRight: '1px dashed #10b981',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${50 + state.corridorOffset * 45}%`,
                transform: 'translate(-50%, -50%)',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: Math.abs(state.corridorOffset) > 0.4 ? '#ef4444' : '#38bdf8',
                boxShadow: '0 0 10px #38bdf8',
                transition: 'left 0.08s ease-out',
              }}
            />
          </div>
          <div style={{ marginTop: '5px', fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.1em' }}>
            {isEs ? 'CORREDOR DE TRAYECTORIA [A / D]' : 'TRAJECTORY CORRIDOR [A / D]'}
          </div>
        </div>
      )}

      {/* Stage Separation Prompt */}
      {state.readyToSeparate && !srbSeparated && (
        <div
          style={{
            position: 'absolute',
            bottom: '140px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={triggerSeparation}
            style={{
              padding: '14px 34px',
              fontSize: '1.05rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
              border: '2px solid #fca5a5',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(239, 68, 68, 0.7)',
            }}
          >
            [ {isEs ? 'SEPARAR PROPULSORES SRB (ESPACIO)' : 'SEPARATE SRB BOOSTERS (SPACE)'} ]
          </button>
        </div>
      )}

      {/* Orbit Insertion Victory Screen */}
      {state.orbitalInsertion && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 30,
            background: 'radial-gradient(circle, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.94) 100%)',
            backdropFilter: 'blur(8px)',
            color: '#f8fafc',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.3em', color: '#10b981', marginBottom: '8px' }}>
            // LOW EARTH ORBIT (LEO) INSERTION CONFIRMED //
          </div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              margin: '0 0 16px',
              letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'monospace',
            }}
          >
            {isEs ? '¡HAS ALCANZADO EL ESPACIO!' : 'ORBIT INSERTION ACHIEVED!'}
          </h1>
          <p style={{ maxWidth: '560px', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 24px', fontFamily: 'monospace' }}>
            {isEs
              ? 'El Transbordador Espacial Atlantis ha superado todas las capas atmosféricas desde Cabo Cañaveral y alcanzado una velocidad orbital de 28,140 km/h en microgravedad.'
              : 'Space Shuttle Atlantis has traversed all atmospheric layers from Cape Canaveral and achieved a stable orbital speed of 28,140 km/h in microgravity.'}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              maxWidth: '520px',
              width: '100%',
              marginBottom: '32px',
              fontFamily: 'monospace',
            }}
          >
            <div style={{ padding: '12px', background: 'rgba(15,23,42,0.85)', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>ALTITUDE</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>135.2 km</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(15,23,42,0.85)', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>VELOCITY</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>28,140 km/h</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(15,23,42,0.85)', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>G-FORCE</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>0.00 G</div>
            </div>
          </div>

          <button
            type="button"
            onClick={redirectToSimulator}
            style={{
              padding: '16px 36px',
              fontSize: '1.1rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              color: '#020617',
              background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.6)',
            }}
          >
            [ {isEs
              ? `ENTRAR AL SIMULADOR ESPACIAL 3D (${autoRedirectSec ?? 5}s)`
              : `ENTER 3D SPACE SIMULATOR (${autoRedirectSec ?? 5}s)`} ]
          </button>
        </div>
      )}

      {/* Flight Controls (Bottom) */}
      {started && !state.orbitalInsertion && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
            zIndex: 15,
            pointerEvents: 'auto',
          }}
        >
          {/* Tactical Steering Pads */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="ctrl"
              onPointerDown={() => handleSteer('left', true)}
              onPointerUp={() => handleSteer('left', false)}
              onPointerLeave={() => handleSteer('left', false)}
              style={{
                width: '54px',
                height: '54px',
                fontSize: '18px',
                fontFamily: 'monospace',
                fontWeight: 800,
                borderRadius: '8px',
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(56,189,248,0.4)',
                color: '#38bdf8',
                cursor: 'pointer',
              }}
            >
              &lt;
            </button>
            <button
              type="button"
              className="ctrl"
              onPointerDown={() => handleSteer('right', true)}
              onPointerUp={() => handleSteer('right', false)}
              onPointerLeave={() => handleSteer('right', false)}
              style={{
                width: '54px',
                height: '54px',
                fontSize: '18px',
                fontFamily: 'monospace',
                fontWeight: 800,
                borderRadius: '8px',
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(56,189,248,0.4)',
                color: '#38bdf8',
                cursor: 'pointer',
              }}
            >
              &gt;
            </button>
          </div>

          {/* Status Message Ticker */}
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#38bdf8',
              letterSpacing: '0.1em',
              textAlign: 'center',
              maxWidth: '420px',
              padding: '6px 16px',
              background: 'rgba(2,6,23,0.8)',
              borderRadius: '20px',
              border: '1px solid rgba(56,189,248,0.25)',
            }}
          >
            {state.statusText}
          </div>

          {/* Throttle Boost Button */}
          <div>
            <button
              type="button"
              className="ctrl"
              onPointerDown={() => handleThrottle(true)}
              onPointerUp={() => handleThrottle(false)}
              onPointerLeave={() => handleThrottle(false)}
              style={{
                padding: '0 26px',
                height: '54px',
                fontSize: '13px',
                fontWeight: 800,
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: '1px solid #38bdf8',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(56,189,248,0.3)',
              }}
            >
              [ {isEs ? 'EMPUJE / BOOST' : 'BOOST / THRUST'} ]
            </button>
          </div>
        </div>
      )}

      {/* Shuttle Fleet Historic Dossier Modal */}
      {galleryOpen && (
        <ShuttleGalleryModal onClose={() => setGalleryOpen(false)} lang={lang} />
      )}
    </div>
  );
}
