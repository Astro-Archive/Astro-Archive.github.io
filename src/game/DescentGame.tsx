import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ArtifactModel } from '../scene/ArtifactModel';
import {
  createSim,
  step,
  PAD,
  START_ALT,
  START_VY,
  type Input,
  type Outcome,
  type Sim,
} from './descentPhysics';

/* ---------- escena ---------- */

function LunarScene({ sim, input }: { sim: React.RefObject<Sim>; input: React.RefObject<Input> }) {
  const craft = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);
  const camera = useThree((s) => s.camera);

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
        <mesh ref={flame} position={[0, 0.8, 0]} rotation={[Math.PI, 0, 0]} visible={false}>
          <coneGeometry args={[1.25, 4.2, 12, 1, true]} />
          <meshBasicMaterial color="#ffc48a" transparent opacity={0.75} side={2} depthWrite={false} />
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
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const sim = useRef<Sim>(createSim(7));
  const input = useRef<Input>({ thrust: false, left: false, right: false });
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<{ outcome: Outcome; reason: string; fuel: number }>({
    outcome: 'flying',
    reason: '',
    fuel: 1,
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
          setResult({ outcome: s.outcome, reason: s.reason, fuel: s.fuel });
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
    setResult({ outcome: 'flying', reason: '', fuel: 1 });
    setHud({ y: START_ALT, vy: START_VY, x: sim.current.x, vx: 0, fuel: 1 });
    setStarted(true);
  };

  const fuelPct = Math.round(hud.fuel * 100);
  const lowFuel = hud.fuel < 0.2;
  const playing = started && result.outcome === 'flying';

  return (
    <div className="game" role="dialog" aria-modal="true" aria-label="Simulador de descenso lunar"
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
          <p className="game-kicker">Simulación simplificada</p>
          <h2 className="game-title">Descenso lunar</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          Volver al museo
        </button>
      </header>

      {started && (
        <div className="game-hud">
          <div className="hud-row">
            <span className="hud-label">Altitud</span>
            <span className="hud-value">{Math.max(0, hud.y).toFixed(0)} m</span>
          </div>
          <div className="hud-row">
            <span className="hud-label">Vertical</span>
            <span className={`hud-value ${hud.vy < -8 ? 'is-danger' : ''}`}>{hud.vy.toFixed(1)} m/s</span>
          </div>
          <div className="hud-row">
            <span className="hud-label">Deriva</span>
            <span className={`hud-value ${Math.abs(hud.x) > PAD - 1 ? 'is-danger' : ''}`}>
              {hud.x > 0 ? '+' : ''}
              {hud.x.toFixed(1)} m
            </span>
          </div>
          <div className="hud-row">
            <span className="hud-label">Lateral</span>
            <span className="hud-value">{hud.vx.toFixed(1)} m/s</span>
          </div>
          <div className="hud-row">
            <span className="hud-label">{lowFuel ? 'Combustible bajo' : 'Combustible'}</span>
            <span className={`hud-value ${lowFuel ? 'is-danger' : ''}`}>{fuelPct} %</span>
          </div>
          <Bar value={hud.fuel} color={lowFuel ? '#ff6b35' : '#4fd1c5'} />
        </div>
      )}

      {playing && (
        <div className="game-controls" aria-label="Controles">
          <button
            type="button"
            className="ctrl"
            onPointerDown={() => press('left', true)}
            onPointerUp={() => press('left', false)}
            onPointerLeave={() => press('left', false)}
            aria-label="Empujar a la izquierda"
          >
            ←
          </button>
          <button
            type="button"
            className="ctrl ctrl-main"
            onPointerDown={() => press('thrust', true)}
            onPointerUp={() => press('thrust', false)}
            onPointerLeave={() => press('thrust', false)}
            aria-label="Encender el motor"
          >
            MOTOR
          </button>
          <button
            type="button"
            className="ctrl"
            onPointerDown={() => press('right', true)}
            onPointerUp={() => press('right', false)}
            onPointerLeave={() => press('right', false)}
            aria-label="Empujar a la derecha"
          >
            →
          </button>
        </div>
      )}

      {!started && (
        <div className="game-panel">
          <p className="game-lead">
            Estás a 70 metros sobre el Mar de la Tranquilidad. Baja a menos de 1,5 m/s y dentro del
            círculo.
          </p>
          <ul className="game-list">
            <li>
              <strong>MOTOR</strong> o la barra espaciadora para frenar. Consume combustible.
            </li>
            <li>
              <strong>← →</strong> para corregir la deriva.
            </li>
            <li>La gravedad lunar es 1,62 m/s²: seis veces menos que en la Tierra.</li>
          </ul>
          <button type="button" className="game-cta" onClick={() => setStarted(true)}>
            Empezar el descenso
          </button>
          <p className="game-foot">Unos 20 segundos. Se puede repetir.</p>
        </div>
      )}

      {started && result.outcome !== 'flying' && (
        <div className={`game-panel game-result ${result.outcome === 'won' ? 'is-win' : 'is-loss'}`}>
          <p className="game-kicker">{result.outcome === 'won' ? 'Aterrizaje' : 'Impacto'}</p>
          <h3 className="game-result-title">
            {result.outcome === 'won' ? 'Tocaste suave.' : 'No llegaste.'}
          </h3>
          <p className="game-lead">{result.reason}</p>

          {result.outcome === 'won' && (
            <>
              <p className="game-lead">
                Te quedó el <strong>{Math.round(result.fuel * 100)} %</strong> del combustible. En el
                Apolo 11 quedaba el <strong>4,2 %</strong>: 770 libras de 18.184. Los análisis
                posteriores calcularon que era combustible para unos 45 segundos de vuelo, y 20 de
                esos segundos estaban reservados para abortar.
              </p>
              <p className="game-lesson">
                Y aquí está la clave del artefacto: aunque te hubiera quedado el 100 %,{' '}
                <strong>no habrías podido despegar</strong>. Volver a la órbita lunar necesitaba otro
                motor y otro tanque. Por eso la etapa de descenso se quedó en la Luna: no se averió,
                no podía subir.
              </p>
            </>
          )}

          <div className="game-actions">
            <button type="button" className="game-cta" onClick={restart}>
              Repetir
            </button>
            <button type="button" className="ghost-button" onClick={onClose}>
              Volver al museo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
