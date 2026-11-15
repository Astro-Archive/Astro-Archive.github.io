/** Ruido de valor determinista. Sin dependencias, sin texturas. */

function hash2(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export function valueNoise(x: number, y: number, seed = 1): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  const u = smooth(fx);
  const v = smooth(fy);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

export function fbm(x: number, y: number, seed = 1, octaves = 4): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise(x * freq, y * freq, seed + i * 17);
    freq *= 2.07;
    amp *= 0.5;
  }
  return value;
}

/** Círculos de impacto suaves, para los cráteres lunares. */
function crater(x: number, z: number, cx: number, cz: number, r: number): number {
  const d = Math.hypot(x - cx, z - cz) / r;
  if (d >= 1) return 0;
  const bowl = -(Math.cos((d * Math.PI) / 2) ** 2);
  return bowl * 0.9;
}

const CRATERS: Array<[number, number, number]> = [
  [-9, 6, 4.2],
  [11, -7, 5.5],
  [-14, -12, 6.5],
  [16, 13, 3.6],
];

export type TerrainKind = 'luna' | 'marte' | 'ceres';

/** Altura del terreno. Se aplana cerca del origen para que el artefacto apoye bien. */
export function heightAt(x: number, z: number, kind: TerrainKind, seed: number): number {
  let h = 0;

  if (kind === 'luna') {
    h = (fbm(x * 0.09, z * 0.09, seed) - 0.5) * 2.4;
    for (const [cx, cz, r] of CRATERS) h += crater(x, z, cx, cz, r) * 1.25;
  } else if (kind === 'marte') {
    h = (fbm(x * 0.07, z * 0.07, seed + 3) - 0.5) * 3.2;
    h += Math.sin(x * 0.22 + z * 0.12) * 0.4;
    h += (fbm(x * 0.5, z * 0.5, seed + 9) - 0.5) * 0.4;
  } else {
    h = (fbm(x * 0.12, z * 0.12, seed + 7) - 0.5) * 3.8;
    h += (fbm(x * 0.6, z * 0.6, seed + 13) - 0.5) * 0.7;
  }

  // Meseta central: garantiza apoyo limpio bajo el pedestal.
  const d = Math.hypot(x, z);
  const flat = smooth(Math.min(1, Math.max(0, (d - 2.6) / 5)));
  return h * flat;
}
