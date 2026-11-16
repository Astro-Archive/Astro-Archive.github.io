import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

const OTHER_PROJECT_URL = 'https://astroarchive.earth/astro-archive/';

type CameraMode = 'chase' | 'cinematic' | 'cockpit';

/* ---------------- 3D ENVIRONMENT & ATMOSPHERE ---------------- */

/** Starfield that fades in when ascending past the stratosphere into space */
function DynamicStarfield({ altitude }: { altitude: number }) {
  const [geo, mat] = useMemo(() => {
    const count = 2400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 350 + Math.random() * 150;
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
      // Fade in stars as atmosphere thins (20 km -> 80 km)
      const starAlpha = Math.min(1, Math.max(0, (altitude - 20) / 60));
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
      // Clouds drop down as shuttle climbs
      cloudsRef.current.position.y = -altitude * 10 + 35;
      cloudsRef.current.visible = altitude < 35;
    }
  });

  return (
    <group ref={cloudsRef}>
      {/* Cloud layer discs around the Florida coast */}
      <mesh position={[-60, 0, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[95, 32]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>
      <mesh position={[80, 8, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[120, 32]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>
      <mesh position={[-40, 16, -70]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[85, 32]} />
        <primitive object={cloudMat} attach="material" />
      </mesh>
    </group>
  );
}

/** Earth Curved Horizon & Atmospheric Halo */
function CurvedEarthHorizon({ altitude, pitch }: { altitude: number; pitch: number }) {
  const earthMeshRef = useRef<THREE.Mesh>(null);

  const earthMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1d4ed8',
        roughness: 0.85,
        metalness: 0.1,
      }),
    []
  );

  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    []
  );

  useFrame(() => {
    if (earthMeshRef.current) {
      // Horizon drops and curves gracefully beneath the shuttle as it ascends into orbit
      const earthCenterY = -480 - altitude * 2.2;
      earthMeshRef.current.position.set(0, earthCenterY, -140);
      earthMeshRef.current.rotation.x = ((90 - pitch) * Math.PI) / 180 * 0.4;
    }
  });

  return (
    <mesh ref={earthMeshRef} position={[0, -480, -140]}>
      <sphereGeometry args={[420, 64, 64]} />
      <primitive object={earthMat} attach="material" />
      {/* Cyan Atmospheric Glow Shell */}
      <mesh scale={[1.018, 1.018, 1.018]}>
        <sphereGeometry args={[420, 48, 48]} />
        <primitive object={haloMat} attach="material" />
      </mesh>
    </mesh>
  );
}

/** Cockpit Interior Canopy (shown in 'cockpit' mode) */
function CockpitCanopyFrame() {
  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#151922',
        roughness: 0.8,
        metalness: 0.7,
      }),
    []
  );

  return (
    <group position={[0, 0, -1.2]}>
      {/* Lower Instrument Glare Shield */}
      <mesh material={frameMat} position={[0, -0.7, 0.2]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[3.4, 0.8, 0.8]} />
      </mesh>
      {/* Left Frame Pillar */}
      <mesh material={frameMat} position={[-1.3, 0.4, 0.1]} rotation={[0, 0.25, -0.45]}>
        <boxGeometry args={[0.15, 2.2, 0.2]} />
      </mesh>
      {/* Right Frame Pillar */}
      <mesh material={frameMat} position={[1.3, 0.4, 0.1]} rotation={[0, -0.25, 0.45]}>
        <boxGeometry args={[0.15, 2.2, 0.2]} />
      </mesh>
      {/* Overhead Console */}
      <mesh material={frameMat} position={[0, 1.35, 0.1]}>
        <boxGeometry args={[2.6, 0.2, 0.3]} />
      </mesh>
    </group>
  );
}

/* ---------------- MAIN LAUNCH SCENE ---------------- */

interface LaunchSceneProps {
  state: LaunchState;
  cameraMode: CameraMode;
  srbSeparated: boolean;
  etSeparated: boolean;
  srbOffset: number;
  etOffset: number;
  orbitAngle: number;
}

function LaunchScene({
  state,
  cameraMode,
  srbSeparated,
  etSeparated,
  srbOffset,
  etOffset,
  orbitAngle,
}: LaunchSceneProps) {
  const camera = useThree((s) => s.camera);
  const { scene } = useThree();

  const vaporConeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const alt = state.altitude;

    // 1. Dynamic Atmosphere Sky Dome Lighting & Color
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

    // 2. Camera Vibration / Rumble
    const shakeIntensity =
      state.stage === 'orbit'
        ? 0.001
        : Math.min(0.05, 0.003 + state.gForce * 0.007 * state.throttle);
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;

    // 3. Camera Position according to selected Mode
    const pitchRad = ((90 - state.pitch) * Math.PI) / 180;
    const rollAngle = state.corridorOffset * -0.12;

    if (cameraMode === 'chase') {
      // Third-Person Chase Camera: positioned behind and below the Space Shuttle
      const baseDist = 44 + (state.velocity / 28000) * 12;
      const camY = -14 + Math.sin(pitchRad) * 6;
      const camZ = baseDist * Math.cos(pitchRad * 0.4);

      camera.position.set(
        state.corridorOffset * -4 + shakeX,
        camY + shakeY,
        camZ
      );
      camera.lookAt(0, 10, -5);
    } else if (cameraMode === 'cinematic') {
      // Cinematic Orbit Camera: slowly sweeps around the shuttle stack to appreciate Earth curvature
      const radius = 55;
      const camX = Math.cos(orbitAngle) * radius;
      const camZ = Math.sin(orbitAngle) * radius;
      camera.position.set(camX + shakeX, -4 + shakeY, camZ);
      camera.lookAt(0, 8, 0);
    } else {
      // First-Person Cockpit Camera
      camera.position.set(shakeX, 6 + shakeY, 8.5);
      camera.rotation.set(pitchRad * 0.4, 0, rollAngle);
    }

    // 4. Transonic Mach Shock Vapor Cone (10-18 km)
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

        {/* Cockpit Canopy (only in cockpit mode) */}
        {cameraMode === 'cockpit' && <CockpitCanopyFrame />}
      </group>

      {/* CAPE CANAVERAL PAD LC-39B & FLORIDA TERRAIN */}
      <Suspense fallback={null}>
        <CapeCanaveralPad altitude={state.altitude} />
      </Suspense>

      {/* CLOUDS IN TROPOSPHERE */}
      <CloudDeck altitude={state.altitude} />

      {/* DYNAMIC STARFIELD */}
      <DynamicStarfield altitude={state.altitude} />

      {/* CURVED EARTH HORIZON */}
      <CurvedEarthHorizon altitude={state.altitude} pitch={state.pitch} />
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

  const [state, setState] = useState<LaunchState>(createInitialLaunchState);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase'); // Third person default!
  const [autoRedirectSec, setAutoRedirectSec] = useState<number | null>(null);

  // Separation animation progress
  const [srbSeparated, setSrbSeparated] = useState(false);
  const [etSeparated, setEtSeparated] = useState(false);
  const srbOffsetRef = useRef(0);
  const etOffsetRef = useRef(0);
  const [srbOffset, setSrbOffset] = useState(0);
  const [etOffset, setEtOffset] = useState(0);

  const [orbitAngle, setOrbitAngle] = useState(0.4);

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
        srbOffsetRef.current = Math.min(1.0, srbOffsetRef.current + dt * 0.4);
        setSrbOffset(srbOffsetRef.current);
      }

      // Animate External Tank separation drift
      if (etSeparated && etOffsetRef.current < 1.0) {
        etOffsetRef.current = Math.min(1.0, etOffsetRef.current + dt * 0.3);
        setEtOffset(etOffsetRef.current);
      }

      // Slow cinematic camera orbit rotation
      setOrbitAngle((a) => a + dt * 0.15);

      hudClock += dt;
      if (hudClock > 0.06) {
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

  // Detect Staging and Sound Milestones
  const prevAlt = useRef(0);
  const prevStage = useRef<1 | 2 | 'orbit'>(1);

  useEffect(() => {
    if (!started) return;

    // Transonic sonic boom
    if (prevAlt.current < 11 && state.altitude >= 11) {
      playSonicBoom();
    }

    // SRB Separation at Stage 1 burnout
    if (prevStage.current === 1 && state.stage === 2 && !srbSeparated) {
      setSrbSeparated(true);
      playStageSeparationSound();
    }

    // External Tank separation when nearing orbit (altitude > 115 km)
    if (state.altitude >= 115 && !etSeparated) {
      setEtSeparated(true);
      playStageSeparationSound();
    }

    // Orbital insertion triumph chord
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
      if (e.key === 'Escape') onClose();
      if (e.key === 'v' || e.key === 'V') {
        setCameraMode((c) => (c === 'chase' ? 'cinematic' : c === 'cinematic' ? 'cockpit' : 'chase'));
      }
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
  }, [onClose]);

  // Touch / pointer steer helpers
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

  // Translations & Layer Identification
  const isEs = lang === 'es';
  const siteLabel = isEs ? 'CABO CAÑAVERAL, FL · PLATAFORMA 39B' : 'CAPE CANAVERAL, FL · PAD 39B';
  const titleText = isEs ? 'TRANSBORDADOR ESPACIAL ATLANTIS' : 'SPACE SHUTTLE ATLANTIS';

  // Get current atmospheric layer info
  const alt = state.altitude;
  let layerBadge = isEs ? 'TROPOSFERA · 0 - 12 KM' : 'TROPOSPHERE · 0 - 12 KM';
  let layerDesc = isEs ? 'Atmósfera densa · Costa de Florida' : 'Dense Atmosphere · Florida Coast';

  if (alt >= 12 && alt < 50) {
    layerBadge = isEs ? 'ESTRATOSFERA · 12 - 50 KM (MAX-Q)' : 'STRATOSPHERE · 12 - 50 KM (MAX-Q)';
    layerDesc = isEs ? 'Transónico · Mach ' + state.mach.toFixed(1) : 'Transonic · Mach ' + state.mach.toFixed(1);
  } else if (alt >= 50 && alt < 85) {
    layerBadge = isEs ? 'MESOSFERA · 50 - 85 KM' : 'MESOSPHERE · 50 - 85 KM';
    layerDesc = isEs ? 'Separación de Propulsores Sólidos (SRB)' : 'Solid Rocket Booster (SRB) Separation';
  } else if (alt >= 85 && alt < 120) {
    layerBadge = isEs ? 'TERMOSFERA · LÍNEA DE KÁRMÁN (100 KM)' : 'THERMOSPHERE · KÁRMÁN LINE (100 KM)';
    layerDesc = isEs ? 'Frontera del Espacio Exterior' : 'Boundary of Outer Space';
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
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#020617' }}
    >
      {/* 3D Viewport */}
      <div className="game-stage" style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          dpr={[1, 1.75]}
          camera={{ fov: 60, near: 0.1, far: 1200, position: [0, -14, 48] }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <LaunchScene
            state={state}
            cameraMode={cameraMode}
            srbSeparated={srbSeparated}
            etSeparated={etSeparated}
            srbOffset={srbOffset}
            etOffset={etOffset}
            orbitAngle={orbitAngle}
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
          background: 'linear-gradient(180deg, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0) 100%)',
        }}
      >
        <div>
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.15em', color: '#38bdf8' }}>
            {siteLabel}
          </p>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.04em' }}>
            {titleText}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Camera View Switcher */}
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              setCameraMode((c) => (c === 'chase' ? 'cinematic' : c === 'cinematic' ? 'cockpit' : 'chase'));
            }}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderColor: '#38bdf8',
              color: '#38bdf8',
              background: 'rgba(56,189,248,0.12)',
            }}
          >
            🎥 {cameraMode === 'chase' ? (isEs ? '3ª Persona [V]' : 'Chase Cam [V]') : cameraMode === 'cinematic' ? (isEs ? 'Cinemática [V]' : 'Cinematic [V]') : (isEs ? 'Cabina [V]' : 'Cockpit [V]')}
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              setMuted(!muted);
              if (!muted) stopRocketEngine();
              else if (started) startRocketEngine();
            }}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {muted ? '🔇 MUTE' : '🔊 AUDIO'}
          </button>

          {/* Exit / Back to Museum */}
          <button
            type="button"
            className="ghost-button"
            onClick={onClose}
            style={{ padding: '6px 14px', fontSize: '12px', borderColor: '#475569' }}
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
            padding: '8px 18px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '24px',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8', letterSpacing: '0.12em' }}>
            🌍 {layerBadge}
          </span>
          <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
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
          <div style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.3em', color: '#38bdf8', marginBottom: '8px' }}>
            {isEs ? 'SECUENCIA DE IGNICIÓN · CABO CAÑAVERAL' : 'IGNITION SEQUENCE · CAPE CANAVERAL'}
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
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#94a3b8' }}>
            {isEs ? 'Space Shuttle Atlantis · Pad 39B' : 'Space Shuttle Atlantis · Pad 39B'}
          </div>
        </div>
      )}

      {/* Tactical Telemetry HUD */}
      {started && !state.orbitalInsertion && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '24px',
            zIndex: 10,
            padding: '16px 20px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            fontFamily: 'monospace',
            color: '#e2e8f0',
            minWidth: '220px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8' }}>
              T+{(state.missionTime).toFixed(1)}s
            </span>
            <span style={{ fontSize: '11px', color: srbSeparated ? '#38bdf8' : '#10b981', fontWeight: 'bold' }}>
              {srbSeparated ? 'ET + SSME' : 'SRB BOOST'}
            </span>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>ALTITUDE</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ffffff' }}>
              {state.altitude.toFixed(2)} <span style={{ fontSize: '12px', color: '#38bdf8' }}>km</span>
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>SPEED</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff' }}>
              {Math.round(state.velocity).toLocaleString()} <span style={{ fontSize: '11px', color: '#94a3b8' }}>km/h</span>
            </div>
            <div style={{ fontSize: '11px', color: state.mach > 1 ? '#38bdf8' : '#64748b' }}>
              Mach {state.mach.toFixed(2)}
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
              <span>G-FORCE</span>
              <span style={{ color: state.gForce > 3.0 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                {state.gForce.toFixed(2)} G
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '3px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (state.gForce / 4.2) * 100)}%`,
                  background: state.gForce > 3.0 ? '#ef4444' : '#38bdf8',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          </div>

          {/* SRB & Tank Gauges */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
              <span>{srbSeparated ? 'EXTERNAL TANK' : 'SOLID BOOSTERS (SRB)'}</span>
              <span>{Math.round((srbSeparated ? state.stage2Fuel : state.stage1Fuel) * 100)}%</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
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
              height: '28px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '6px',
              position: 'relative',
              background: 'rgba(2, 6, 23, 0.5)',
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
          <div style={{ marginTop: '6px', fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.1em' }}>
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
              padding: '16px 36px',
              fontSize: '1.1rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
              border: '2px solid #fca5a5',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(239, 68, 68, 0.7)',
              animation: 'pulse 1s infinite alternate',
            }}
          >
            {isEs ? '⚡ SEPARAR PROPULSORES SRB [ESPACIO]' : '⚡ SEPARATE SRB BOOSTERS [SPACE]'}
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
          <div style={{ fontSize: '12px', fontFamily: 'monospace', letterSpacing: '0.3em', color: '#10b981', marginBottom: '8px' }}>
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
            }}
          >
            {isEs ? '¡HAS ALCANZADO EL ESPACIO!' : 'ORBIT INSERTION ACHIEVED!'}
          </h1>
          <p style={{ maxWidth: '560px', fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 24px' }}>
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
            <div style={{ padding: '12px', background: 'rgba(15,23,42,0.8)', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>ALTITUDE</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>135.2 km</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(15,23,42,0.8)', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>VELOCITY</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>28,140 km/h</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(15,23,42,0.8)', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>G-FORCE</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>0.00 G</div>
            </div>
          </div>

          <button
            type="button"
            onClick={redirectToSimulator}
            style={{
              padding: '16px 36px',
              fontSize: '1.15rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              color: '#020617',
              background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.6)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isEs
              ? `🚀 ENTRAR AL SIMULADOR ESPACIAL 3D (${autoRedirectSec ?? 5}s)`
              : `🚀 ENTER 3D SPACE SIMULATOR (${autoRedirectSec ?? 5}s)`}
          </button>
        </div>
      )}

      {/* Mobile Touch Flight Controls */}
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
          {/* Steering arrows */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="ctrl"
              onPointerDown={() => handleSteer('left', true)}
              onPointerUp={() => handleSteer('left', false)}
              onPointerLeave={() => handleSteer('left', false)}
              style={{
                width: '56px',
                height: '56px',
                fontSize: '22px',
                borderRadius: '12px',
                background: 'rgba(15,23,42,0.85)',
                border: '1px solid rgba(56,189,248,0.4)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              ←
            </button>
            <button
              type="button"
              className="ctrl"
              onPointerDown={() => handleSteer('right', true)}
              onPointerUp={() => handleSteer('right', false)}
              onPointerLeave={() => handleSteer('right', false)}
              style={{
                width: '56px',
                height: '56px',
                fontSize: '22px',
                borderRadius: '12px',
                background: 'rgba(15,23,42,0.85)',
                border: '1px solid rgba(56,189,248,0.4)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              →
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
              maxWidth: '380px',
              padding: '6px 14px',
              background: 'rgba(2,6,23,0.7)',
              borderRadius: '20px',
              border: '1px solid rgba(56,189,248,0.2)',
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
                padding: '0 24px',
                height: '56px',
                fontSize: '14px',
                fontWeight: 800,
                fontFamily: 'monospace',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: '1px solid #38bdf8',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(56,189,248,0.3)',
              }}
            >
              🔥 {isEs ? 'EMPUJE' : 'BOOST'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
