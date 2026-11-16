import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const OTHER_PROJECT_URL = 'https://astroarchive.earth/astro-archive/';

/* ---------------- 3D COCKPIT & SCENE ---------------- */

function CockpitFrame({ gForce, throttle, stage }: { gForce: number; throttle: number; stage: 1 | 2 | 'orbit' }) {
  // Procedural cockpit structure: canopy pillars, window frame, and illuminated dashboard
  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#111622',
        roughness: 0.75,
        metalness: 0.85,
      }),
    []
  );

  const dashGlowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: stage === 'orbit' ? '#10b981' : '#00f0ff',
        transparent: true,
        opacity: 0.85,
      }),
    [stage]
  );

  return (
    <group position={[0, -0.6, -1.1]}>
      {/* Lower Dashboard */}
      <mesh material={frameMat} position={[0, -0.65, 0.2]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[3.2, 0.7, 0.8]} />
      </mesh>

      {/* Illuminated HUD Dashboard Console Strips */}
      <mesh material={dashGlowMat} position={[0, -0.32, 0.48]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[2.4, 0.04, 0.05]} />
      </mesh>

      {/* Left Canopy Pillar */}
      <mesh material={frameMat} position={[-1.25, 0.5, 0.1]} rotation={[0, 0.25, -0.42]}>
        <boxGeometry args={[0.16, 2.4, 0.2]} />
      </mesh>

      {/* Right Canopy Pillar */}
      <mesh material={frameMat} position={[1.25, 0.5, 0.1]} rotation={[0, -0.25, 0.42]}>
        <boxGeometry args={[0.16, 2.4, 0.2]} />
      </mesh>

      {/* Top Arch Canopy Beam */}
      <mesh material={frameMat} position={[0, 1.45, 0.05]}>
        <boxGeometry args={[2.5, 0.14, 0.2]} />
      </mesh>

      {/* Subtle Canopy Glass Tint */}
      <mesh position={[0, 0.35, -0.05]}>
        <planeGeometry args={[2.4, 2.0]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.92}
          opacity={0.12}
          transparent
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

/** Starfield that fades in when ascending past the stratosphere into space */
function DynamicStarfield({ altitude }: { altitude: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, mat] = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 250 + Math.random() * 100;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 10; // keep above horizon
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const m = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 1.4,
      transparent: true,
      opacity: 0,
    });
    return [g, m];
  }, []);

  useFrame(() => {
    if (mat) {
      // Fade in stars as atmosphere thins (25 km -> 85 km)
      const starAlpha = Math.min(1, Math.max(0, (altitude - 25) / 55));
      mat.opacity = starAlpha;
    }
  });

  return <primitive object={new THREE.Points(geo, mat)} ref={pointsRef} />;
}

/** Earth limb curve and Florida ground launchpad */
function WorldEnvironment({ altitude, pitch }: { altitude: number; pitch: number }) {
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const padGroupRef = useRef<THREE.Group>(null);
  const vaporConeRef = useRef<THREE.Mesh>(null);

  // Cape Canaveral Pad 39A service tower and platform
  const padTowerMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#78350f', metalness: 0.6, roughness: 0.8 }),
    []
  );

  // Earth horizon curved surface
  const earthMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e3a8a',
        roughness: 0.9,
      }),
    []
  );

  const atmoGlowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    []
  );

  useFrame(() => {
    // As altitude increases, pad drops down rapidly
    if (padGroupRef.current) {
      const padY = -altitude * 12;
      padGroupRef.current.position.y = padY;
      padGroupRef.current.visible = altitude < 30;
    }

    // Earth curve horizon: scales and positions down to show Earth limb curvature
    if (earthMeshRef.current) {
      const earthCenterY = -280 - (altitude * 1.5);
      earthMeshRef.current.position.set(0, earthCenterY, -120);
      earthMeshRef.current.rotation.x = (90 - pitch) * 0.015;
    }

    // Transonic vapor cone effect around Mach 1 (10-18 km)
    if (vaporConeRef.current) {
      const inVaporRange = altitude >= 10 && altitude <= 17;
      vaporConeRef.current.visible = inVaporRange;
      if (inVaporRange) {
        const pulse = 0.9 + Math.sin(Date.now() * 0.03) * 0.15;
        vaporConeRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  return (
    <>
      {/* Launch Pad at Cape Canaveral (visible at low altitude) */}
      <group ref={padGroupRef} position={[0, -2, -6]}>
        {/* Concrete Pad Platform */}
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[25, 30, 2, 32]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {/* Kennedy LC-39A Service Tower */}
        <mesh material={padTowerMat} position={[8, 14, -2]}>
          <boxGeometry args={[4, 32, 4]} />
        </mesh>
        {/* Tower service boom arm */}
        <mesh material={padTowerMat} position={[4, 22, -2]}>
          <boxGeometry args={[5, 1.2, 1.2]} />
        </mesh>
        {/* Floodlights */}
        <pointLight color="#fed7aa" intensity={25} distance={60} position={[0, 4, 0]} />
      </group>

      {/* Earth Curved Horizon Sphere */}
      <mesh ref={earthMeshRef} position={[0, -320, -120]}>
        <sphereGeometry args={[260, 64, 64]} />
        <primitive object={earthMat} attach="material" />
        {/* Atmosphere Cyan Glow Shell */}
        <mesh scale={[1.025, 1.025, 1.025]}>
          <sphereGeometry args={[260, 48, 48]} />
          <primitive object={atmoGlowMat} attach="material" />
        </mesh>
      </mesh>

      {/* Transonic Mach Shock Vapor Cone */}
      <mesh ref={vaporConeRef} position={[0, 0, -4]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <coneGeometry args={[2.8, 4, 32, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

function LaunchScene({
  state,
  input,
}: {
  state: LaunchState;
  input: React.RefObject<LaunchInput>;
}) {
  const camera = useThree((s) => s.camera);
  const { scene } = useThree();

  useFrame((_, delta) => {
    // Dynamic Sky Color based on altitude
    // 0 km: Sky Blue -> 20 km: Deep Azure -> 60 km: Indigo -> 100 km: Pure Cosmic Space Black
    const alt = state.altitude;
    let skyR = 0.22, skyG = 0.74, skyB = 0.97; // Day Sky Blue #38bdf8

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
    } else if (alt < 90) {
      const k = (alt - 45) / 45;
      skyR = THREE.MathUtils.lerp(0.04, 0.01, k);
      skyG = THREE.MathUtils.lerp(0.08, 0.02, k);
      skyB = THREE.MathUtils.lerp(0.25, 0.05, k);
    } else {
      skyR = 0.005;
      skyG = 0.01;
      skyB = 0.02; // Pure Void of Space
    }

    scene.background = new THREE.Color(skyR, skyG, skyB);

    // Camera cockpit rumble & vibration based on G-Force & Rocket Engine Throttle
    const shakeIntensity =
      state.stage === 'orbit'
        ? 0.001
        : Math.min(0.06, 0.004 + (state.gForce * 0.008) * state.throttle);
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;

    // Pilot steering roll / pitch bias
    const rollAngle = state.corridorOffset * -0.15;
    const pitchOffset = ((90 - state.pitch) * Math.PI) / 180 * 0.35;

    camera.position.set(shakeX, shakeY, 0);
    camera.rotation.set(pitchOffset, 0, rollAngle);
  });

  return (
    <>
      <ambientLight intensity={state.altitude > 80 ? 0.3 : 0.8} />
      <directionalLight position={[10, 30, 20]} intensity={state.altitude > 80 ? 3.5 : 1.8} color="#fffef0" />

      <CockpitFrame gForce={state.gForce} throttle={state.throttle} stage={state.stage} />
      <DynamicStarfield altitude={state.altitude} />
      <WorldEnvironment altitude={state.altitude} pitch={state.pitch} />
    </>
  );
}

/* ---------------- MAIN LAUNCH COMPONENT ---------------- */

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
  const [autoRedirectSec, setAutoRedirectSec] = useState<number | null>(null);

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

  // Main simulation physics loop (120 Hz)
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
  }, [started, muted]);

  // Sound triggers on milestones
  const prevAlt = useRef(0);
  const prevStage = useRef<1 | 2 | 'orbit'>(1);

  useEffect(() => {
    if (!started) return;

    // Sonic boom when Mach 1 is crossed
    if (prevAlt.current < 11 && state.altitude >= 11) {
      playSonicBoom();
    }
    // Stage separation sound
    if (prevStage.current === 1 && state.stage === 2) {
      playStageSeparationSound();
    }
    // Orbital insertion chime
    if (prevStage.current !== 'orbit' && state.stage === 'orbit') {
      playOrbitalInsertionChime();
      setAutoRedirectSec(5);
    }

    prevAlt.current = state.altitude;
    prevStage.current = state.stage;
  }, [state.altitude, state.stage, started]);

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

  // Translations
  const isEs = lang === 'es';
  const siteLabel = isEs ? 'CABO CAÑAVERAL, FL · PLATAFORMA 39A' : 'CAPE CANAVERAL, FL · PAD 39A';
  const titleText = isEs ? 'DESPEGUE Y ASCENSO A ÓRBITA' : 'LAUNCH & ASCENT TO ORBIT';
  const altitudeLabel = isEs ? 'ALTITUD' : 'ALTITUDE';
  const speedLabel = isEs ? 'VELOCIDAD' : 'SPEED';
  const gforceLabel = isEs ? 'FUERZA G' : 'G-FORCE';
  const corridorLabel = isEs ? 'CORREDOR' : 'CORRIDOR';
  const stage1Label = isEs ? 'ETAPA 1 (BOOSTER)' : 'STAGE 1 (BOOSTER)';
  const stage2Label = isEs ? 'ETAPA 2 (VACÍO)' : 'STAGE 2 (VACUUM)';

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
          camera={{ fov: 62, near: 0.1, far: 800, position: [0, 0, 0] }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <LaunchScene state={state} input={inputRef} />
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            {muted ? (isEs ? '🔇 AUDIO OFF' : '🔇 AUDIO OFF') : (isEs ? '🔊 AUDIO ON' : '🔊 AUDIO ON')}
          </button>
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
            background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.3em', color: '#38bdf8', marginBottom: '8px' }}>
            {isEs ? 'SECUENCIA DE IGNICIÓN' : 'IGNITION SEQUENCE'}
          </div>
          <div
            style={{
              fontSize: '5.5rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: countdown === 0 ? '#10b981' : '#f8fafc',
              textShadow: '0 0 24px rgba(56,189,248,0.8)',
            }}
          >
            {countdown === 0 ? 'LIFTOFF!' : `T-${countdown}`}
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8' }}>
            {isEs ? 'Kennedy Space Center · Cabo Cañaveral' : 'Kennedy Space Center · Cape Canaveral'}
          </div>
        </div>
      )}

      {/* Tactical Cockpit HUD Overlay */}
      {started && !state.orbitalInsertion && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '24px',
            zIndex: 10,
            padding: '16px 20px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            fontFamily: 'monospace',
            color: '#e2e8f0',
            minWidth: '220px',
            pointerEvents: 'none',
          }}
        >
          {/* Mission Timer & Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8' }}>
              T+{(state.missionTime).toFixed(1)}s
            </span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>
              {state.stage === 1 ? 'STAGE 1' : 'STAGE 2'}
            </span>
          </div>

          {/* Altitude */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{altitudeLabel}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ffffff' }}>
              {state.altitude.toFixed(2)} <span style={{ fontSize: '12px', color: '#38bdf8' }}>km</span>
            </div>
          </div>

          {/* Speed & Mach */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{speedLabel}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff' }}>
              {Math.round(state.velocity).toLocaleString()} <span style={{ fontSize: '11px', color: '#94a3b8' }}>km/h</span>
            </div>
            <div style={{ fontSize: '11px', color: state.mach > 1 ? '#38bdf8' : '#64748b' }}>
              Mach {state.mach.toFixed(2)}
            </div>
          </div>

          {/* G-Force */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
              <span>{gforceLabel}</span>
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

          {/* Fuel Gauges */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
              <span>{state.stage === 1 ? stage1Label : stage2Label}</span>
              <span>{Math.round((state.stage === 1 ? state.stage1Fuel : state.stage2Fuel) * 100)}%</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(state.stage === 1 ? state.stage1Fuel : state.stage2Fuel) * 100}%`,
                  background: state.stage === 1 && state.stage1Fuel < 0.15 ? '#ef4444' : '#10b981',
                  transition: 'width 0.08s linear',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Flight Corridor Trajectory HUD (Center reticle guidance) */}
      {started && !state.orbitalInsertion && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Corridor bar */}
          <div
            style={{
              width: '260px',
              height: '32px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '6px',
              position: 'relative',
              background: 'rgba(2, 6, 23, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {/* Center target safe zone */}
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
            {/* Rocket Attitude Marker */}
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
            {corridorLabel} [A / D]
          </div>
        </div>
      )}

      {/* Stage Separation Prompt / Button */}
      {state.readyToSeparate && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
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
            {isEs ? '⚡ SEPARAR ETAPA 1 [ESPACIO]' : '⚡ SEPARATE STAGE 1 [SPACE]'}
          </button>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#fca5a5', fontFamily: 'monospace' }}>
            {isEs ? '¡Agotamiento de propulsor detectado!' : 'Booster burnout detected!'}
          </div>
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
            background: 'radial-gradient(circle, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.92) 100%)',
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
              fontSize: '2.4rem',
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
          <p style={{ maxWidth: '540px', fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 24px' }}>
            {isEs
              ? 'Has despegado desde Cabo Cañaveral, superado la atmósfera terrestre y alcanzado una velocidad orbital estable de 28,140 km/h en microgravedad.'
              : 'You have launched from Cape Canaveral, conquered the atmosphere, and established a stable orbital velocity of 28,140 km/h in microgravity.'}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              maxWidth: '500px',
              width: '100%',
              marginBottom: '32px',
              fontFamily: 'monospace',
            }}
          >
            <div style={{ padding: '12px', background: 'rgba(15,23,42,0.8)', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>ALTITUDE</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>135 km</div>
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
