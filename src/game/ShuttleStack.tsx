import { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShuttleStackProps {
  stage: 1 | 2 | 'orbit';
  throttle: number;
  srbSeparated: boolean;
  etSeparated: boolean;
  srbOffset: number; // progress of SRB separation drift
  etOffset: number;  // progress of ET separation drift
}

/** Procedural flame texture for the massive rocket exhaust plumes */
function useRocketFlameTexture(colorType: 'srb' | 'ssme') {
  return useMemo(() => {
    const w = 128;
    const h = 512;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (colorType === 'srb') {
      // Violent solid rocket booster fire: dazzling white core -> fiery orange -> smoky red
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.12, 'rgba(255, 230, 130, 0.95)');
      grad.addColorStop(0.35, 'rgba(249, 115, 22, 0.85)');
      grad.addColorStop(0.70, 'rgba(220, 38, 38, 0.45)');
      grad.addColorStop(1, 'rgba(120, 20, 0, 0)');
    } else {
      // Space Shuttle Main Engine (SSME): hot hydrogen/oxygen clean cyan/violet plasma
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.15, 'rgba(56, 189, 248, 0.95)');
      grad.addColorStop(0.40, 'rgba(14, 165, 233, 0.7)');
      grad.addColorStop(0.75, 'rgba(99, 102, 241, 0.35)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.bezierCurveTo(w * 0.95, h * 0.15, w * 0.85, h * 0.75, w / 2, h);
    ctx.bezierCurveTo(w * 0.15, h * 0.75, w * 0.05, h * 0.15, w / 2, 0);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [colorType]);
}

export function ShuttleStack({
  stage,
  throttle,
  srbSeparated,
  etSeparated,
  srbOffset,
  etOffset,
}: ShuttleStackProps) {
  // Load official NASA 3D models from public/models
  const orbiterGltf = useGLTF('models/space-shuttle-orbiter.glb');
  const tankGltf = useGLTF('models/shuttle-external-tank.glb');
  const srbGltf = useGLTF('models/shuttle-srb.glb');

  // Clone scenes so multiple instances / transforms don't conflict
  const orbiter = useMemo(() => orbiterGltf.scene.clone(true), [orbiterGltf]);
  const tank = useMemo(() => tankGltf.scene.clone(true), [tankGltf]);
  const srbLeft = useMemo(() => srbGltf.scene.clone(true), [srbGltf]);
  const srbRight = useMemo(() => srbGltf.scene.clone(true), [srbGltf]);

  const srbFlameTex = useRocketFlameTexture('srb');
  const ssmeFlameTex = useRocketFlameTexture('ssme');

  const srbFlameLRef = useRef<THREE.Mesh>(null);
  const srbFlameRRef = useRef<THREE.Mesh>(null);
  const ssmeFlameRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Animate exhaust fire flicker
  useFrame(() => {
    const flicker = 0.85 + Math.random() * 0.3;
    const hasThrust = throttle > 0.05 && stage !== 'orbit';

    if (srbFlameLRef.current && srbFlameRRef.current) {
      const showSRB = !srbSeparated && hasThrust;
      srbFlameLRef.current.visible = showSRB;
      srbFlameRRef.current.visible = showSRB;
      if (showSRB) {
        const s = flicker * throttle * 1.1;
        srbFlameLRef.current.scale.set(s, s * 1.2, s);
        srbFlameRRef.current.scale.set(s, s * 1.2, s);
      }
    }

    if (ssmeFlameRef.current) {
      const showSSME = !etSeparated && hasThrust;
      ssmeFlameRef.current.visible = showSSME;
      if (showSSME) {
        const s = flicker * throttle;
        ssmeFlameRef.current.scale.set(s, s, s);
      }
    }

    if (lightRef.current) {
      lightRef.current.intensity = hasThrust ? (srbSeparated ? 25 : 75) * flicker : 0;
    }
  });

  // Authentic scaling factors:
  // External Tank: length 1879 inches * 0.0254 = 47.7 meters.
  // SRBs: length 1781 inches * 0.0254 = 45.2 meters.
  // Orbiter: length 37.2 meters (modeled natively in meters).
  const inchToMeter = 0.0254;

  return (
    <group>
      {/* 1. SPACE SHUTTLE ORBITER (Atlantis) */}
      <group
        position={[0, 4.5, 4.6]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <primitive object={orbiter} />

        {/* 3 SSME Main Engine Exhaust Plumes */}
        <group ref={ssmeFlameRef} position={[0, -0.6, 17.5]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Top Engine */}
          <mesh position={[0, 2.2, -6]}>
            <planeGeometry args={[1.6, 14]} />
            <meshBasicMaterial
              map={ssmeFlameTex}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Bottom Left Engine */}
          <mesh position={[-1.2, 0.4, -6]}>
            <planeGeometry args={[1.5, 13]} />
            <meshBasicMaterial
              map={ssmeFlameTex}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Bottom Right Engine */}
          <mesh position={[1.2, 0.4, -6]}>
            <planeGeometry args={[1.5, 13]} />
            <meshBasicMaterial
              map={ssmeFlameTex}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>

      {/* 2. EXTERNAL TANK (Orange ET) */}
      {!etSeparated ? (
        <group position={[0, 4.0, 0]} rotation={[0, 0, Math.PI / 2]} scale={inchToMeter}>
          <primitive object={tank} />
        </group>
      ) : (
        /* Detached ET drifting away backward into space */
        <group
          position={[0, 4.0 - etOffset * 120, -etOffset * 90]}
          rotation={[etOffset * 0.4, etOffset * 0.2, Math.PI / 2 + etOffset * 0.5]}
          scale={inchToMeter}
        >
          <primitive object={tank} />
        </group>
      )}

      {/* 3. SOLID ROCKET BOOSTERS (Twin White SRBs) */}
      {!srbSeparated ? (
        <>
          {/* Left SRB */}
          <group position={[-5.8, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} scale={inchToMeter}>
            <primitive object={srbLeft} />
          </group>
          {/* Left SRB Flame */}
          <mesh
            ref={srbFlameLRef}
            position={[-5.8, -26, 0]}
            rotation={[Math.PI, 0, 0]}
          >
            <planeGeometry args={[4.2, 28]} />
            <meshBasicMaterial
              map={srbFlameTex}
              transparent
              opacity={0.92}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Right SRB */}
          <group position={[5.8, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} scale={inchToMeter}>
            <primitive object={srbRight} />
          </group>
          {/* Right SRB Flame */}
          <mesh
            ref={srbFlameRRef}
            position={[5.8, -26, 0]}
            rotation={[Math.PI, 0, 0]}
          >
            <planeGeometry args={[4.2, 28]} />
            <meshBasicMaterial
              map={srbFlameTex}
              transparent
              opacity={0.92}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </>
      ) : (
        /* Detached SRBs tumbling outward and backward into clouds below */
        <>
          {/* Left SRB tumbling away */}
          <group
            position={[-5.8 - srbOffset * 55, 1.8 - srbOffset * 95, -srbOffset * 40]}
            rotation={[srbOffset * 0.8, -srbOffset * 0.5, Math.PI / 2 - srbOffset * 1.2]}
            scale={inchToMeter}
          >
            <primitive object={srbLeft} />
          </group>
          {/* Right SRB tumbling away */}
          <group
            position={[5.8 + srbOffset * 55, 1.8 - srbOffset * 95, -srbOffset * 40]}
            rotation={[-srbOffset * 0.8, srbOffset * 0.5, Math.PI / 2 + srbOffset * 1.2]}
            scale={inchToMeter}
          >
            <primitive object={srbRight} />
          </group>
        </>
      )}

      {/* Dynamic Rocket Fire PointLight */}
      <pointLight ref={lightRef} color="#f97316" intensity={60} distance={120} position={[0, -18, 2]} />
    </group>
  );
}

// Preload models
useGLTF.preload('models/space-shuttle-orbiter.glb');
useGLTF.preload('models/shuttle-external-tank.glb');
useGLTF.preload('models/shuttle-srb.glb');
