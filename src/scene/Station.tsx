import { Sparkles } from '@react-three/drei';
import type { Artifact } from '../data/artifacts';
import { ArtifactModel } from './ArtifactModel';
import { useBlobShadowTexture } from './blobShadow';

interface StationProps {
  artifact: Artifact;
  reduced: boolean;
}

export function Station({ artifact, reduced }: StationProps) {
  const shadowMap = useBlobShadowTexture();
  const ring = Math.max(1.6, artifact.fit * 0.62);

  return (
    <group position={artifact.station}>
      {/* sombra de contacto */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[artifact.fit * 1.55, artifact.fit * 1.55]} />
        <meshBasicMaterial map={shadowMap} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      {/* marca de museo: señala que esto está en exposición */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ring, ring + 0.05, 96]} />
        <meshBasicMaterial
          color={artifact.palette.accent}
          transparent
          opacity={0.24}
          side={2}
          depthWrite={false}
        />
      </mesh>

      <ArtifactModel url={artifact.model} fit={artifact.fit} yaw={artifact.yaw} reduced={reduced} />

      {/* polvo en suspensión: da profundidad y atmósfera */}
      <Sparkles
        count={34}
        scale={[26, 7, 26]}
        position={[0, 3, 0]}
        size={1.6}
        speed={0.16}
        opacity={0.32}
        color={artifact.palette.dust}
        noise={0.5}
      />

      {/* Luz principal de museo: ilumina el modelo para que destaque con nitidez */}
      <pointLight
        position={[2.4, 4.6, 2.8]}
        intensity={22}
        distance={20}
        decay={1.8}
        color="#fff9f2"
      />
      <pointLight
        position={[-2.8, 3.2, 1.8]}
        intensity={14}
        distance={18}
        decay={2}
        color={artifact.palette.accent}
      />
    </group>
  );
}
