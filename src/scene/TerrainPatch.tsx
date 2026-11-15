import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { fbm, heightAt, type TerrainKind } from '../lib/noise';

interface TerrainPatchProps {
  kind: TerrainKind;
  seed: number;
  /** color base del suelo */
  ground: string;
  /** color de las rocas y de las zonas altas */
  rock: string;
  /** lado del parche en unidades de mundo */
  size?: number;
  segments?: number;
  rocks?: number;
  /** amplitud del relieve: 1 es la del museo, menos para no tapar el artefacto */
  relief?: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Suelo con relieve para las escenas de entrevista: el mismo ruido del museo,
 * pero en un parche acotado y con el centro aplanado para que el artefacto apoye.
 */
export function TerrainPatch({
  kind,
  seed,
  ground,
  rock,
  size = 72,
  segments = 72,
  rocks = 30,
  relief = 0.62,
}: TerrainPatchProps) {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(size, size, segments, segments);
    plane.rotateX(-Math.PI / 2);

    const flat = plane.toNonIndexed();
    plane.dispose();

    const pos = flat.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.Color(ground);
    const stone = new THREE.Color(rock);
    const color = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const height = heightAt(x, z, kind, seed) * relief;
      pos.setY(i, height);

      const shade = 0.8 + 0.4 * fbm(x * 0.16, z * 0.16, 5, 3);
      // manchas de roca: el mismo tipo de variación que el terreno del museo
      const mix = clamp01(fbm(x * 0.08 + 11, z * 0.08 - 7, seed + 21, 3) * 1.4 - 0.25);
      const lift = 0.94 + 0.12 * clamp01(height * 0.8 + 0.5);
      color.copy(base).lerp(stone, mix * 0.5).multiplyScalar(shade * lift);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    flat.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pos.needsUpdate = true;
    flat.computeVertexNormals();
    flat.computeBoundingSphere();
    return flat;
  }, [kind, seed, ground, rock, size, segments, relief]);

  const rockData = useMemo(() => {
    let state = seed * 7919 + 17;
    const rand = () => {
      state = (state * 48271) % 2147483647;
      return state / 2147483647;
    };
    const stone = new THREE.Color(rock);

    return Array.from({ length: rocks }, () => {
      // fuera de la meseta central: el artefacto y su anillo quedan despejados
      const angle = rand() * Math.PI * 2;
      const radius = 10 + rand() * size * 0.3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.14 + rand() * 0.55;
      const y = heightAt(x, z, kind, seed) * relief - scale * 0.24;

      return {
        position: [x, y, z] as [number, number, number],
        scale: [scale, scale * (0.5 + rand() * 0.8), scale] as [number, number, number],
        rotation: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI] as [
          number,
          number,
          number,
        ],
        color: stone.clone().multiplyScalar(0.72 + rand() * 0.5),
      };
    });
  }, [rocks, kind, seed, rock, size, relief]);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.98} metalness={0.03} flatShading />
      </mesh>

      <Instances limit={rocks} range={rocks}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.96} metalness={0.05} flatShading />
        {rockData.map((item, index) => (
          <Instance
            key={index}
            position={item.position}
            scale={item.scale}
            rotation={item.rotation}
            color={item.color}
          />
        ))}
      </Instances>
    </group>
  );
}
