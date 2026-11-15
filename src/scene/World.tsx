import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { ARTIFACTS } from '../data/artifacts';
import { fbm, heightAt, type TerrainKind } from '../lib/noise';

const KINDS: TerrainKind[] = ARTIFACTS.map((a) => a.terrain);
const SEEDS = ARTIFACTS.map((a) => a.seed);
const ZS = ARTIFACTS.map((a) => a.station[2]);
const GROUND = ARTIFACTS.map((a) => new THREE.Color(a.palette.ground));
const ROCK = ARTIFACTS.map((a) => new THREE.Color(a.palette.rock));

const lerp = THREE.MathUtils.lerp;

/** Mezcla de altura y color a lo largo del recorrido. Un solo terreno, sin costuras. */
function blendAt(z: number) {
  const clamped = Math.min(0, Math.max(ZS[ZS.length - 1], z));
  let i = ZS.length - 2;
  for (let k = 0; k < ZS.length - 1; k++) {
    if (clamped <= ZS[k] && clamped >= ZS[k + 1]) {
      i = k;
      break;
    }
  }
  const span = ZS[i + 1] - ZS[i];
  const raw = (clamped - ZS[i]) / span;
  const f = THREE.MathUtils.smoothstep(raw, 0.62, 0.93);
  return { i, f };
}

function sampleHeight(x: number, z: number): number {
  const { i, f } = blendAt(z);
  const a = heightAt(x, z - ZS[i], KINDS[i], SEEDS[i]);
  const b = heightAt(x, z - ZS[i + 1], KINDS[i + 1], SEEDS[i + 1]);
  return lerp(a, b, f);
}

const tmpColor = new THREE.Color();

function sampleColor(z: number, out: THREE.Color): THREE.Color {
  const { i, f } = blendAt(z);
  return out.copy(GROUND[i]).lerp(GROUND[i + 1], f);
}

interface WorldProps {
  width?: number;
  depth?: number;
  segmentsX?: number;
  segmentsZ?: number;
  rocks?: number;
}

export function World({ width = 96, depth = 236, segmentsX = 48, segmentsZ = 118, rocks = 64 }: WorldProps) {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ);
    plane.rotateX(-Math.PI / 2);
    plane.translate(0, 0, -58);

    const flat = plane.toNonIndexed();
    plane.dispose();

    const pos = flat.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, sampleHeight(x, z));
      sampleColor(z, tmpColor);
      const shade = 0.82 + 0.36 * fbm(x * 0.16, z * 0.16, 5, 3);
      colors[i * 3] = tmpColor.r * shade;
      colors[i * 3 + 1] = tmpColor.g * shade;
      colors[i * 3 + 2] = tmpColor.b * shade;
    }

    flat.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pos.needsUpdate = true;
    flat.computeVertexNormals();
    flat.computeBoundingSphere();
    return flat;
  }, [width, depth, segmentsX, segmentsZ]);

  const rockData = useMemo(() => {
    let seed = 2024;
    const rand = () => {
      seed = (seed * 48271) % 2147483647;
      return seed / 2147483647;
    };
    return Array.from({ length: rocks }, () => {
      const z = 10 - rand() * 145;
      const x = (rand() - 0.5) * 54;
      // deja libre el pasillo central de cada estación
      const nearStation = ZS.some((zs) => Math.abs(z - zs) < 9 && Math.abs(x) < 8);
      const scale = (0.2 + rand() * 1.15) * (nearStation ? 0.6 : 1);
      const y = sampleHeight(x, z) - scale * 0.22;
      const { i, f } = blendAt(z);
      const color = new THREE.Color().copy(ROCK[i]).lerp(ROCK[i + 1], f);
      return {
        position: [x, y, z] as [number, number, number],
        scale: [scale, scale * (0.5 + rand() * 0.7), scale] as [number, number, number],
        rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI] as [number, number, number],
        color,
      };
    });
  }, [rocks]);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.98} metalness={0.03} flatShading />
      </mesh>

      <Instances limit={rocks} range={rocks}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.96} metalness={0.05} flatShading />
        {rockData.map((r, i) => (
          <Instance
            key={i}
            position={r.position}
            scale={r.scale}
            rotation={r.rotation}
            color={r.color}
          />
        ))}
      </Instances>
    </group>
  );
}
