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
  // along with a smooth feathered alpha mask that eliminates any hard rectangular borders
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
      {/* 1. 3D Mobile Launcher & Umbilical Tower Model (detailed up close) */}
      {altitude < 30 && (
        <group position={[-6.5, 0, 0]} scale={padScale}>
          <primitive object={padScene} />
        </group>
      )}

      {/* 2. High-Resolution Satellite Aerial Photography of LC-39B Pad & Coast */}
      {/* Feathered with alphaMap so the outer borders dissolve into the landscape with 0 seams */}
      <mesh position={[-38, -0.15, 22]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <planeGeometry args={[3400, 2251, 16, 16]} />
        <meshStandardMaterial
          map={aerialTex}
          alphaMap={alphaMaskTex}
          transparent={true}
          roughness={0.92}
          metalness={0.05}
          depthWrite={false}
          polygonOffset={true}
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>

      {/* 3. Vast Florida Continent & Merritt Island Wetlands Plane (West) */}
      <mesh position={[-22000, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[44000, 52000]} />
        <meshStandardMaterial
          color="#1e2c1c"
          roughness={0.94}
          metalness={0.06}
          polygonOffset={true}
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>

      {/* 4. Vast Atlantic Ocean Plane extending to the horizon (East) */}
      <mesh position={[22000, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[44000, 52000]} />
        <meshStandardMaterial
          color="#0c384e"
          roughness={0.25}
          metalness={0.25}
          polygonOffset={true}
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>

      {/* 5. Sandy Beach Coastline Strip matching the Florida coast angle */}
      <mesh position={[580, -1.2, 0]} rotation={[-Math.PI / 2, 0, -0.61]} renderOrder={2}>
        <planeGeometry args={[180, 52000]} />
        <meshStandardMaterial
          color="#b09f7a"
          roughness={0.95}
          polygonOffset={true}
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
      </mesh>

      {/* 6. Enormous Horizon Ground Ring so the world is never cut off */}
      <mesh position={[0, -8.0, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={0}>
        <ringGeometry args={[0, 48000, 64]} />
        <meshStandardMaterial
          color="#0b2c3d"
          roughness={0.5}
          polygonOffset={true}
          polygonOffsetFactor={4}
          polygonOffsetUnits={4}
        />
      </mesh>

      {/* 7. Pad Perimeter Floodlights for dramatic liftoff lighting */}
      {altitude < 12 && (
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
