import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface CapeCanaveralPadProps {
  altitude: number;
}

export function CapeCanaveralPad({ altitude }: CapeCanaveralPadProps) {
  const padGltf = useGLTF('models/cape-canaveral-pad.glb');
  const padScene = useMemo(() => padGltf.scene.clone(true), [padGltf]);

  // If altitude is high, hide pad for max performance
  if (altitude > 40) return null;

  // The tower is ~246 units native height. Scaled by 0.46, it reaches ~115m height.
  // The launch mount platform deck is at y ~ 12m, perfectly under the shuttle stack!
  const padScale = 0.46;

  return (
    <group position={[0, -altitude * 10, 0]}>
      {/* 1. Official NASA Mobile Launcher Pad 39B Model */}
      <group position={[-6.5, 0, 0]} scale={padScale}>
        <primitive object={padScene} />
      </group>

      {/* 2. Concrete Launch Pad Foundation Mound (LC-39B Pad) */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[75, 110, 4, 32]} />
        <meshStandardMaterial color="#64748b" roughness={0.92} metalness={0.1} />
      </mesh>

      {/* 3. Flame Exhaust Trench */}
      <mesh position={[0, -3.5, 0]}>
        <boxGeometry args={[26, 3, 60]} />
        <meshStandardMaterial color="#334155" roughness={0.95} />
      </mesh>

      {/* 4. Florida Coastline & Atlantic Ocean Terrain */}
      <mesh position={[0, -4.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1800, 1800, 16, 16]} />
        <meshStandardMaterial color="#0f766e" roughness={0.88} />
      </mesh>
      {/* Atlantic Ocean Deep Water */}
      <mesh position={[400, -4.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1800]} />
        <meshStandardMaterial color="#0369a1" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Sandy Beach Shoreline */}
      <mesh position={[-100, -3.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 1800]} />
        <meshStandardMaterial color="#d97706" roughness={0.95} />
      </mesh>

      {/* 5. Pad Perimeter Floodlights */}
      <pointLight color="#fef08a" intensity={40} distance={120} position={[-35, 15, 35]} />
      <pointLight color="#fef08a" intensity={40} distance={120} position={[35, 15, 35]} />
      <pointLight color="#fef08a" intensity={35} distance={120} position={[0, 15, -45]} />
    </group>
  );
}

useGLTF.preload('models/cape-canaveral-pad.glb');
