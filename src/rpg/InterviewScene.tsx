import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ArtifactModel } from '../scene/ArtifactModel';
import { TerrainPatch } from '../scene/TerrainPatch';
import { SkyDome } from '../scene/SkyDome';
import { useBlobShadowTexture } from '../scene/blobShadow';
import type { Artifact } from '../data/artifacts';

interface SceneProps {
  artifact: Artifact;
  /** false cuando la señal llega a cero: la luz se apaga en ~4 s */
  alive: boolean;
  speaking: boolean;
  reduced: boolean;
}

function Diorama({ artifact, alive, speaking, reduced }: SceneProps) {
  const body = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const ring = useRef<THREE.Mesh>(null);
  const camera = useThree((s) => s.camera);
  const charge = useRef(0);
  const shadowMap = useBlobShadowTexture();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    charge.current = alive
      ? Math.min(1, charge.current + delta * 2)
      : Math.max(0, charge.current - delta * 0.22);

    if (!reduced) {
      camera.position.x = Math.sin(t * 0.17) * 0.6;
      camera.position.y = 2.4 + Math.sin(t * 0.13) * 0.09;
    } else {
      camera.position.x = 0;
      camera.position.y = 2.4;
    }
    camera.lookAt(0, 1.6, 0);

    if (body.current) {
      body.current.position.y = reduced ? 0 : Math.sin(t * 0.85) * 0.07;
      if (!reduced) body.current.rotation.y += delta * 0.11;
    }

    if (light.current) {
      const pulse = speaking ? 1 + Math.sin(t * 6.5) * 0.18 : 1;
      light.current.intensity = 16 * charge.current * pulse;
    }

    if (ring.current) {
      const material = ring.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 * charge.current * (speaking ? 1.35 : 1);
    }
  });

  return (
    <>
      <color attach="background" args={[artifact.palette.top]} />
      <fog attach="fog" args={[artifact.palette.bottom, 14, 34]} />
      <SkyDome top={artifact.palette.top} bottom={artifact.palette.bottom} />

      {artifact.palette.stars && (
        <Stars radius={80} depth={30} count={500} factor={2.6} saturation={0.2} fade speed={0.2} />
      )}
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#8fa6c8', '#241a12', 0.7]} />
      <directionalLight position={[5, 8, 6]} intensity={2.2} color="#fff1da" />
      <directionalLight position={[-6, 3, -4]} intensity={0.8} color="#6f8fd0" />

      <TerrainPatch
        kind={artifact.terrain}
        seed={artifact.seed}
        ground={artifact.palette.ground}
        rock={artifact.palette.rock}
      />

      {/* sombra de contacto: asienta el artefacto sobre el relieve */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.6, 5.6]} />
        <meshBasicMaterial map={shadowMap} transparent opacity={0.45} depthWrite={false} />
      </mesh>

      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.15, 3.22, 96]} />
        <meshBasicMaterial
          color={artifact.palette.accent}
          transparent
          opacity={0.3}
          side={2}
          depthWrite={false}
        />
      </mesh>

      <group ref={body}>
        <ArtifactModel url={artifact.model} fit={4.8} yaw={artifact.yaw} reduced />
      </group>

      <Sparkles
        count={40}
        scale={[16, 7, 16]}
        position={[0, 3, 0]}
        size={1.5}
        speed={reduced ? 0 : 0.14}
        opacity={0.3}
        color={artifact.palette.dust}
        noise={0.6}
      />

      <pointLight
        ref={light}
        position={[2.6, 3.4, 2.6]}
        color={artifact.palette.accent}
        distance={18}
        decay={2}
        intensity={16}
      />
    </>
  );
}

export function InterviewScene(props: SceneProps) {
  const { artifact, reduced } = props;
  const camera = useMemo(
    () => ({ fov: 38, near: 0.1, far: 120, position: [0, 2.55, 10.5] as [number, number, number] }),
    [],
  );

  return (
    <Canvas dpr={[1, 1.6]} camera={camera} gl={{ antialias: true, alpha: false }} shadows={false}>
      <Diorama {...props} artifact={artifact} reduced={reduced} />
    </Canvas>
  );
}
