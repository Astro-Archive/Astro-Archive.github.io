import { memo, Suspense } from 'react';
import { Environment, Lightformer, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { ARTIFACTS } from '../data/artifacts';
import { CameraRig } from './CameraRig';
import { Cosmos } from './Cosmos';
import { Station } from './Station';
import { World } from './World';

interface ExperienceProps {
  progress: React.RefObject<number>;
  reduced: boolean;
}

export const Experience = memo(function Experience({ progress, reduced }: ExperienceProps) {
  return (
    <>
      <CameraRig progress={progress} reduced={reduced} />
      <Cosmos progress={progress} />

      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#93a9cc', '#2a1e14', 0.7]} />
      <directionalLight position={[9, 14, 7]} intensity={2.4} color="#fff4e2" />
      <directionalLight position={[-9, 7, -9]} intensity={0.9} color="#6f8fd0" />

      <Suspense fallback={null}>
        <Environment resolution={96} frames={1}>
          <Lightformer form="rect" intensity={2.4} position={[0, 7, -7]} scale={[9, 9, 1]} color="#c2d4ff" />
          <Lightformer form="rect" intensity={1.5} position={[7, 2, 5]} scale={[6, 3, 1]} color="#ffd9b0" />
          <Lightformer form="circle" intensity={1.8} position={[-7, 5, 3]} scale={4} color="#ffffff" />
        </Environment>

        {ARTIFACTS.map((artifact) => (
          <Station key={artifact.id} artifact={artifact} reduced={reduced} />
        ))}

        <World />

        <Preload all />
      </Suspense>

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.5} luminanceThreshold={0.62} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette offset={0.32} darkness={0.72} />
      </EffectComposer>
    </>
  );
});
