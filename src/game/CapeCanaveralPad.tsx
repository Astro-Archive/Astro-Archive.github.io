import { useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface CapeCanaveralPadProps {
  altitude: number;
}

export function CapeCanaveralPad({ altitude }: CapeCanaveralPadProps) {
  // 1. Official NASA 3D Mobile Launcher Pad 39B model
  const padGltf = useGLTF('models/cape-canaveral-pad.glb');
  const padScene = useMemo(() => padGltf.scene.clone(true), [padGltf]);

  // 2. High-resolution authentic satellite aerial photo of Cape Canaveral Pad 39, crawlerway and coast
  const [aerialTex, alphaMaskTex] = useTexture([
    'textures/cape-canaveral-wide.jpg',
    'textures/cape-canaveral-alpha.png',
  ]);

  useMemo(() => {
    aerialTex.colorSpace = THREE.SRGBColorSpace;
    aerialTex.wrapS = THREE.ClampToEdgeWrapping;
    aerialTex.wrapT = THREE.ClampToEdgeWrapping;
    aerialTex.anisotropy = 8;

    alphaMaskTex.wrapS = THREE.ClampToEdgeWrapping;
    alphaMaskTex.wrapT = THREE.ClampToEdgeWrapping;
  }, [aerialTex, alphaMaskTex]);

  // Tower scale ~115m real-world height
  const padScale = 0.46;

  // Seamless altitude progression: ground smoothly drops beneath the ascending shuttle
  const groundY = useMemo(() => {
    if (altitude <= 2) return -altitude * 10;
    return -20 - (altitude - 2) * 8.5;
  }, [altitude]);

  return (
    <group position={[0, groundY, 0]}>
      {/* 1. 3D Mobile Launcher & Umbilical Tower Model (up close during launch) */}
      {altitude < 30 && (
        <group position={[-6.5, 0, 0]} scale={padScale}>
          <primitive object={padScene} />
        </group>
      )}

      {/* 2. High-Resolution Satellite Aerial Photography of LC-39B Pad, Coast & Ocean */}
      {/* Aspect ratio 1024x678 = 1.5103. Large seamless scale, no coplanar layering to eliminate Z-fighting */}
      <mesh position={[-42, -0.2, 24]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7200, 4767, 1, 1]} />
        <meshStandardMaterial
          map={aerialTex}
          roughness={0.92}
          metalness={0.06}
          depthWrite={true}
          depthTest={true}
        />
      </mesh>

      {/* 3. Vast Unified Coastal Horizon Disc (placed 12 units below to strictly prevent any Z-fighting) */}
      <mesh position={[0, -12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[48000, 64]} />
        <meshStandardMaterial
          color="#092232"
          roughness={0.7}
          metalness={0.2}
          depthWrite={true}
          depthTest={true}
        />
      </mesh>

      {/* 4. Pad Perimeter Floodlights for liftoff lighting */}
      {altitude < 10 && (
        <>
          <pointLight color="#fef08a" intensity={45} distance={140} position={[-30, 22, 30]} />
          <pointLight color="#fef08a" intensity={45} distance={140} position={[30, 22, 30]} />
          <pointLight color="#bae6fd" intensity={30} distance={120} position={[0, 45, -20]} />
        </>
      )}
    </group>
  );
}

useGLTF.preload('models/cape-canaveral-pad.glb');
