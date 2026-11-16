import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ARTIFACTS } from '../data/artifacts';
import { cameraT } from '../lib/useScroll';

interface CameraRigProps {
  progress: React.RefObject<number>;
  reduced: boolean;
}

export function CameraRig({ progress, reduced }: CameraRigProps) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const initialized = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

  const positionCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        ARTIFACTS.map((a) => new THREE.Vector3(...a.camera)),
        false,
        'centripetal',
        0.5,
      ),
    [],
  );

  const targetCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        ARTIFACTS.map((a) => new THREE.Vector3(...a.target)),
        false,
        'centripetal',
        0.5,
      ),
    [],
  );

  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpTarget = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(...ARTIFACTS[0].target), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    const t = cameraT(progress.current ?? 0, ARTIFACTS.length);

    positionCurve.getPoint(t, tmpPos);
    targetCurve.getPoint(t, tmpTarget);

    // En pantallas verticales la cámara se aleja para que el artefacto quepa a lo ancho.
    const aspect = size.width / Math.max(1, size.height);
    const isPortrait = aspect < 1.05;
    const pullback = Math.min(1.75, Math.max(1, 1.35 / Math.max(0.6, aspect)));
    tmpPos.sub(tmpTarget).multiplyScalar(pullback).add(tmpTarget);

    // Vertical: centra el modelo en pantallas móviles y evita que se desplace fuera del marco
    if (isPortrait) {
      // En la portada el modelo queda centrado; en las estaciones se ajusta suavemente hacia arriba
      if (t > 0.06) {
        tmpTarget.y -= 0.8;
      }
      tmpTarget.x *= 0.35;
      tmpPos.x *= 0.35;
    }

    if (!reduced && !isPortrait) {
      tmpPos.x += pointer.current.x * 0.7;
      tmpPos.y -= pointer.current.y * 0.45;
    }

    if (!initialized.current) {
      camera.position.copy(tmpPos);
      look.copy(tmpTarget);
      initialized.current = true;
    } else {
      const k = reduced ? 1 : 1 - Math.exp(-delta * 4);
      camera.position.lerp(tmpPos, k);
      look.lerp(tmpTarget, k);
    }

    camera.lookAt(look);
  });

  return null;
}
