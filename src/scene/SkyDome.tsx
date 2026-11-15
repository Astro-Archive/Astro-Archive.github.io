import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SKY_FRAG, SKY_VERT } from './skyShader';

interface SkyDomeProps {
  top: string;
  bottom: string;
  radius?: number;
}

/**
 * Cielo degradado de una sola estación, como el del museo: arriba oscuro y
 * abajo del color del suelo. Se centra en la cámara para que no haya costuras.
 */
export function SkyDome({ top, bottom, radius = 110 }: SkyDomeProps) {
  const dome = useRef<THREE.Mesh>(null);
  const camera = useThree((s) => s.camera);

  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(top) },
      uBottom: { value: new THREE.Color(bottom) },
    }),
    [top, bottom],
  );

  useFrame(() => {
    dome.current?.position.copy(camera.position);
  });

  return (
    <mesh ref={dome} renderOrder={-1}>
      <sphereGeometry args={[radius, 32, 20]} />
      <shaderMaterial
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
