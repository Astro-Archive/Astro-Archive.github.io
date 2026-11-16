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

  // 2. High-resolution authentic satellite aerial photo of Cape Canaveral Pad 39
  const aerialTex = useTexture('textures/cape-canaveral-aerial.jpg');
  aerialTex.colorSpace = THREE.SRGBColorSpace;
  aerialTex.wrapS = THREE.ClampToEdgeWrapping;
  aerialTex.wrapT = THREE.ClampToEdgeWrapping;
  aerialTex.anisotropy = 8;

  // Fade out pad when very high up to save fill-rate
  if (altitude > 45) return null;

  // The tower is ~246 units native height. Scaled by 0.46, it reaches ~115m real-world height.
  const padScale = 0.46;

  return (
    <group position={[0, -altitude * 10, 0]}>
      {/* 3D Mobile Launcher & Umbilical Tower Model */}
      <group position={[-6.5, 0, 0]} scale={padScale}>
        <primitive object={padScene} />
      </group>

      {/* Flat Aerial Satellite Imagery Ground Terrain (Aligned with Pad 39) */}
      <mesh position={[12, -0.2, -8]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[750, 750]} />
        <meshStandardMaterial
          map={aerialTex}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Extended Atlantic Ocean Horizon Plane beyond the pad */}
      <mesh position={[600, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1400, 2200]} />
        <meshStandardMaterial color="#0c4a6e" roughness={0.3} metalness={0.3} />
      </mesh>

      {/* Pad Perimeter Floodlights for dramatic night/dusk launch illumination */}
      <pointLight color="#fef08a" intensity={45} distance={140} position={[-30, 22, 30]} />
      <pointLight color="#fef08a" intensity={45} distance={140} position={[30, 22, 30]} />
      <pointLight color="#bae6fd" intensity={30} distance={120} position={[0, 45, -20]} />
    </group>
  );
}

useGLTF.preload('models/cape-canaveral-pad.glb');
