import { createSim, step, START_ALT, START_VY, G, THRUST, PAD, type Input, type Sim } from '../src/game/descentPhysics.ts';

const DT = 1 / 120;
const none: Input = { thrust: false, left: false, right: false };

/** perfil de descenso: rápido arriba, lento cerca del suelo */
function pilot(s: Sim, k: number, cap: number): Input {
  const targetVy = -Math.max(1.2, Math.min(cap, s.y * k));
  const thrust = s.vy < targetVy - 0.25;
  const left = s.x > 0.6 && s.vx > -1.6;
  const right = s.x < -0.6 && s.vx < 1.6;
  return { thrust, left, right };
}

function run(name: string, strategy: (s: Sim, t: number) => Input, drift = 7) {
  const s = createSim(drift);
  let t = 0;
  while (s.outcome === 'flying' && t < 300) {
    step(s, DT, strategy(s, t));
    t += DT;
  }
  const status = s.outcome === 'won' ? 'ATERRIZA' : 'FALLA  ';
  console.log(
    `${status} ${name.padEnd(26)} | t=${t.toFixed(1).padStart(5)}s  fuel=${(s.fuel * 100).toFixed(0).padStart(3)}%  ` +
      `vy=${s.vy.toFixed(2).padStart(6)}  x=${s.x.toFixed(1).padStart(5)}`,
  );
  return s;
}

console.log(`Inicio: ${START_ALT} m a ${START_VY} m/s · pad ±${PAD} m · G=${G} · empuje neto ${(THRUST - G).toFixed(2)} m/s²\n`);

run('pasivo', () => none);
run('piloto k=0.12 cap=3', (s) => pilot(s, 0.12, 3));
run('piloto k=0.20 cap=4', (s) => pilot(s, 0.2, 4));
run('piloto k=0.28 cap=5', (s) => pilot(s, 0.28, 5));
run('piloto k=0.35 cap=6', (s) => pilot(s, 0.35, 6));
run('piloto k=0.45 cap=7', (s) => pilot(s, 0.45, 7));
run('piloto k=0.35 cap=6 (drift -7)', (s) => pilot(s, 0.35, 6), -7);
run('torpe: frena bajo -6', (s) => ({ ...none, thrust: s.vy < -6 }));
run('temerario: frena bajo -18', (s) => ({ ...none, thrust: s.vy < -18 }));
