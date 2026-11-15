import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ARTIFACTS } from '../data/artifacts';
import { SKY_FRAG, SKY_VERT } from './skyShader';

const TOP = ARTIFACTS.map((a) => new THREE.Color(a.palette.top));
const BOTTOM = ARTIFACTS.map((a) => new THREE.Color(a.palette.bottom));

/** Cielo degradado + estrellas, siempre centrados en la cámara. */
export function Cosmos({ progress }: { progress: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const stars = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);

  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(ARTIFACTS[0].palette.top) },
      uBottom: { value: new THREE.Color(ARTIFACTS[0].palette.bottom) },
    }),
    [],
  );

  const fog = useMemo(() => new THREE.Fog(ARTIFACTS[0].palette.bottom, 14, 62), []);
  scene.fog = fog;

  const tmpA = useMemo(() => new THREE.Color(), []);
  const tmpB = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const p = Math.min(1, Math.max(0, progress.current ?? 0));
    const scaled = p * (ARTIFACTS.length - 1);
    const i = Math.min(ARTIFACTS.length - 2, Math.floor(scaled));
    const f = THREE.MathUtils.smoothstep(scaled - i, 0, 1);

    tmpA.copy(TOP[i]).lerp(TOP[i + 1], f);
    tmpB.copy(BOTTOM[i]).lerp(BOTTOM[i + 1], f);
    uniforms.uTop.value.copy(tmpA);
    uniforms.uBottom.value.copy(tmpB);
    fog.color.copy(BOTTOM[i]).lerp(BOTTOM[i + 1], f);

    if (group.current) group.current.position.copy(camera.position);
    if (stars.current) stars.current.visible = p > 0.66;
  });

  return (
    <>
      <group ref={group} renderOrder={-1}>
        <mesh>
          <sphereGeometry args={[180, 32, 20]} />
          <shaderMaterial
            vertexShader={SKY_VERT}
            fragmentShader={SKY_FRAG}
            uniforms={uniforms}
            side={THREE.BackSide}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      </group>
      <group ref={stars} visible={false}>
        <Stars radius={120} depth={50} count={900} factor={3.4} saturation={0.2} fade speed={0.35} />
      </group>
    </>
  );
}
