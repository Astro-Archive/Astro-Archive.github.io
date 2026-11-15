import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ArtifactModel } from '../scene/ArtifactModel';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';
import {
  createSim,
  step,
  PAD,
  START_ALT,
  START_VY,
  type Input,
  type Outcome,
  type Reason,
  type Sim,
} from './descentPhysics';

/* ---------- escena ---------- */

/** Llama pintada en canvas: degradado vertical con forma de pluma. Sin shaders. */
function useFlameTexture() {
  return useMemo(() => {
    const w = 96;
    const h = 192;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(255, 252, 232, 1)');
    gradient.addColorStop(0.18, 'rgba(255, 226, 150, 1)');
    gradient.addColorStop(0.45, 'rgba(255, 160, 60, 0.85)');
    gradient.addColorStop(0.78, 'rgba(255, 96, 20, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 70, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.bezierCurveTo(w * 0.96, h * 0.18, w * 0.9, h * 0.72, w / 2, h);
    ctx.bezierCurveTo(w * 0.1, h * 0.72, w * 0.04, h * 0.18, w / 2, 0);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function LunarScene({ sim, input }: { sim: React.RefObject<Sim>; input: React.RefObject<Input> }) {
  const craft = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);
  const camera = useThree((s) => s.camera);
  const flameMap = useFlameTexture();

  useFrame(() => {
    // la cámara se acerca a medida que el módulo baja: el aterrizaje se ve de cerca
    const k = 1 - Math.min(1, Math.max(0, sim.current ? sim.current.y / 70 : 1));
    camera.position.set(0, 42 - k * 18, 110 - k * 40);
    camera.lookAt(0, 30 - k * 12, 0);
    const s = sim.current;
    if (!s) return;
    if (craft.current) craft.current.position.set(s.x, s.y, 0);
    if (flame.current) {
      const on = input.current.thrust && s.fuel > 0 && s.outcome === 'flying';
      flame.current.visible = on;
      if (glow.current) glow.current.intensity = on ? 26 : 0;
      if (on) {
        const flicker = 0.85 + Math.random() * 0.3;
        flame.current.scale.set(flicker, flicker, flicker);
      }
    }
  });

  return (
    <>
      <color attach="background" args={['#080b14']} />
      <fog attach="fog" args={['#080b14', 160, 320]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#8fa6c8', '#2a2018', 0.8]} />
      <directionalLight position={[40, 60, 40]} intensity={2.4} color="#fff2dd" />
      <directionalLight position={[-30, 20, -20]} intensity={0.8} color="#6f8fd0" />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[600, 600, 60, 60]} />
        <meshStandardMaterial color="#7b7d84" roughness={0.98} flatShading />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[PAD - 0.18, PAD, 96]} />
        <meshBasicMaterial color="#4fd1c5" transparent opacity={0.9} side={2} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[PAD, 64]} />
        <meshBasicMaterial color="#4fd1c5" transparent opacity={0.07} depthWrite={false} />
      </mesh>

      {[
        [15, 8, 2.2],
        [-19, -6, 1.6],
        [10, -15, 1.2],
        [-12, 13, 1.0],
      ].map(([x, z, s], i) => (
        <mesh key={i} position={[x, s * 0.35, z]}>
          <dodecahedronGeometry args={[s, 0]} />
          <meshStandardMaterial color="#63666e" roughness={0.95} flatShading />
        </mesh>
      ))}

      <group ref={craft}>
        <ArtifactModel url="models/lunar-module.glb" fit={10} yaw={0.5} reduced />
        <mesh ref={flame} position={[0, -1.0, 0.4]} visible={false}>
          <planeGeometry args={[2.4, 5.6]} />
          <meshBasicMaterial
            map={flameMap}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <pointLight ref={glow} position={[0, -0.4, 0]} color="#ffb46b" distance={34} decay={2} intensity={0} />
      </group>
    </>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="gauge">
      <span style={{ transform: `scaleX(${Math.max(0, Math.min(1, value))})`, background: color }} />
    </div>
  );
}

/* ---------- juego ---------- */

export function DescentGame({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const sim = useRef<Sim>(createSim(7));
  const input = useRef<Input>({ thrust: false, left: false, right: false });
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<{
    outcome: Outcome;
    reason: Reason | null;
    fuel: number;
    impact: number;
  }>({
    outcome: 'flying',
    reason: null,
    fuel: 1,
    impact: 0,
  });
  const [hud, setHud] = useState({ y: START_ALT, vy: START_VY, x: 7, vx: 0, fuel: 1 });

  const press = useCallback((key: keyof Input, down: boolean) => {
    if (sim.current.outcome !== 'flying') return;
    input.current[key] = down;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (!started) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setStarted(true);
        }
        return;
      }
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        press('thrust', true);
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') press('left', true);
      if (e.key === 'ArrowRight' || e.key === 'd') press('right', true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') press('thrust', false);
      if (e.key === 'ArrowLeft' || e.key === 'a') press('left', false);
      if (e.key === 'ArrowRight' || e.key === 'd') press('right', false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onClose, press, started]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let hudClock = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;
      while (acc >= 1 / 120) {
        step(sim.current, 1 / 120, input.current);
        acc -= 1 / 120;
      }
      hudClock += dt;
      if (hudClock > 0.08) {
        hudClock = 0;
        const s = sim.current;
        setHud({ y: s.y, vy: s.vy, x: s.x, vx: s.vx, fuel: s.fuel });
        if (s.outcome !== 'flying') {
          setResult({ outcome: s.outcome, reason: s.reason, fuel: s.fuel, impact: s.impact });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [started]);

  const restart = () => {
    sim.current = createSim(Math.random() > 0.5 ? 7 : -7);
    input.current = { thrust: false, left: false, right: false };
    setResult({ outcome: 'flying', reason: null, fuel: 1, impact: 0 });
    setHud({ y: START_ALT, vy: START_VY, x: sim.current.x, vx: 0, fuel: 1 });
    setStarted(true);
  };

  const fuelPct = Math.round(hud.fuel * 100);
  const lowFuel = hud.fuel < 0.2;
  const playing = started && result.outcome === 'flying';
  const reasonText =
    result.reason === 'outside'
      ? t.reasonOutside
      : result.reason === 'hard'
        ? t.reasonHard(result.impact.toFixed(1))
        : result.reason === 'soft'
          ? t.reasonSoft(result.impact.toFixed(1))
          : '';

  return (
    <div className="game" role="dialog" aria-modal="true" aria-label={t.descentAria}
      tabIndex={-1}
      ref={rootRef}>
      <div className="game-stage">
        <Canvas
          dpr={[1, 1.6]}
          camera={{ fov: 58, near: 0.1, far: 600, position: [0, 42, 110] }}
          gl={{ antialias: true, alpha: false }}
          shadows={false}
        >
          <LunarScene sim={sim} input={input} />
        </Canvas>
      </div>

      <header className="game-bar">
        <div>
          <p className="game-kicker">{t.descentKicker}</p>
          <h2 className="game-title">{t.descentTitle}</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          {t.backToMuseum}
        </button>
      </header>

      {started && (
        <div className="game-hud">
          <div className="hud-row">
            <span className="hud-label">{t.altitude}</span>
            <span className="hud-value">{Math.max(0, hud.y).toFixed(0)} m</span>
          </div>
          <div className="hud-row">
            <span className="hud-label">{t.vertical}</span>
            <span className={`hud-value ${hud.vy < -8 ? 'is-danger' : ''}`}>{hud.vy.toFixed(1)} m/s</span>
          </div>
          <div className="hud-row">
            <span className="hud-label">{t.drift}</span>
            <span className={`hud-value ${Math.abs(hud.x) > PAD - 1 ? 'is-danger' : ''}`}>
              {hud.x > 0 ? '+' : ''}
              {hud.x.toFixed(1)} m
            </span>
          </div>
          <div className="hud-row">
            <span className="hud-label">{t.lateral}</span>
            <span className="hud-value">{hud.vx.toFixed(1)} m/s</span>
          </div>
          <div className="hud-row">
            <span className="hud-label">{lowFuel ? t.lowFuel : t.fuel}</span>
            <span className={`hud-value ${lowFuel ? 'is-danger' : ''}`}>{fuelPct} %</span>
          </div>
          <Bar value={hud.fuel} color={lowFuel ? '#ff6b35' : '#4fd1c5'} />
        </div>
      )}

      {playing && (
        <div className="game-controls" aria-label={t.controlsAria}>
          <button
            type="button"
            className="ctrl"
            onPointerDown={() => press('left', true)}
            onPointerUp={() => press('left', false)}
            onPointerLeave={() => press('left', false)}
            aria-label={t.pushLeft}
          >
            ←
          </button>
          <button
            type="button"
            className="ctrl ctrl-main"
            onPointerDown={() => press('thrust', true)}
            onPointerUp={() => press('thrust', false)}
            onPointerLeave={() => press('thrust', false)}
            aria-label={t.turnEngineOn}
          >
            {t.engineWord}
          </button>
          <button
            type="button"
            className="ctrl"
            onPointerDown={() => press('right', true)}
            onPointerUp={() => press('right', false)}
            onPointerLeave={() => press('right', false)}
            aria-label={t.pushRight}
          >
            →
          </button>
        </div>
      )}

      {!started && (
        <div className="game-panel">
          <p className="game-lead">{t.descentLead}</p>
          <ul className="game-list">
            <li>
              <strong>{t.engineWord}</strong> {t.tipThrustRest}
            </li>
            <li>
              <strong>{t.tipDriftPre}</strong> {t.tipDriftRest}
            </li>
            <li>{t.tipGravity}</li>
          </ul>
          <button type="button" className="game-cta" onClick={() => setStarted(true)}>
            {t.startDescent}
          </button>
          <p className="game-foot">{t.descentFoot}</p>
        </div>
      )}

      {started && result.outcome !== 'flying' && (
        <div className={`game-panel game-result ${result.outcome === 'won' ? 'is-win' : 'is-loss'}`}>
          <p className="game-kicker">{result.outcome === 'won' ? t.landing : t.impact}</p>
          <h3 className="game-result-title">
            {result.outcome === 'won' ? t.touchedDown : t.didNotMakeIt}
          </h3>
          <p className="game-lead">{reasonText}</p>

          {result.outcome === 'won' && (
            <>
              <p className="game-lead">{t.wonFuel(Math.round(result.fuel * 100))}</p>
              <p className="game-lesson">{t.wonLesson}</p>
            </>
          )}

          <div className="game-actions">
            <button type="button" className="game-cta" onClick={restart}>
              {t.retry}
            </button>
            <button type="button" className="ghost-button" onClick={onClose}>
              {t.backToMuseum}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
