/**
 * Física del descenso lunar. Módulo puro: lo usa el juego y lo usa el script
 * de balance, así los números están en un solo sitio.
 *
 * Datos reales que sostienen la simulación:
 *  - gravedad lunar 1,62 m/s²
 *  - motor de descenso con empuje variable; a tope rinde ~6,4 m/s² sobre la masa del LM
 *  - tren de aterrizaje diseñado para contacto suave (~1,5 m/s)
 */

export const G = 1.62;
export const THRUST = 6.4;
export const BURN = 0.08;
export const SIDE = 2.2;
export const SIDE_BURN = 0.05;
export const START_ALT = 70;
export const START_VY = -11;
export const PAD = 6;
export const SAFE_VY = 1.5;

export type Outcome = 'flying' | 'won' | 'lost';
export type Reason = 'outside' | 'hard' | 'soft';

export interface Sim {
  y: number;
  vy: number;
  x: number;
  vx: number;
  fuel: number;
  outcome: Outcome;
  reason: Reason | null;
  /** velocidad vertical absoluta en el momento del contacto */
  impact: number;
}

export interface Input {
  thrust: boolean;
  left: boolean;
  right: boolean;
}

export function createSim(drift: number): Sim {
  return {
    y: START_ALT,
    vy: START_VY,
    x: drift,
    vx: 0,
    fuel: 1,
    outcome: 'flying',
    reason: null,
    impact: 0,
  };
}

export function step(s: Sim, dt: number, input: Input): void {
  if (s.outcome !== 'flying') return;

  s.vy -= G * dt;
  if (input.thrust && s.fuel > 0) {
    s.vy += THRUST * dt;
    s.fuel = Math.max(0, s.fuel - BURN * dt);
  }
  if (input.left && s.fuel > 0) {
    s.vx -= SIDE * dt;
    s.fuel = Math.max(0, s.fuel - SIDE_BURN * dt);
  }
  if (input.right && s.fuel > 0) {
    s.vx += SIDE * dt;
    s.fuel = Math.max(0, s.fuel - SIDE_BURN * dt);
  }

  s.y += s.vy * dt;
  s.x += s.vx * dt;

  if (s.y <= 0) {
    s.y = 0;
    s.impact = Math.abs(s.vy);
    const soft = s.impact <= SAFE_VY;
    const inside = Math.abs(s.x) <= PAD;
    if (!inside) {
      s.outcome = 'lost';
      s.reason = 'outside';
    } else if (!soft) {
      s.outcome = 'lost';
      s.reason = 'hard';
    } else {
      s.outcome = 'won';
      s.reason = 'soft';
    }
  }
}
