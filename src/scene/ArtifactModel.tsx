import { useMemo } from 'react';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

interface ArtifactModelProps {
  url: string;
  fit: number;
  yaw: number;
  reduced: boolean;
}

/**
 * Centra el modelo, lo escala a una altura objetivo y lo apoya en el suelo.
 * Así los cuatro artefactos se ven coherentes sin ajustes manuales.
 */
export function ArtifactModel({ url, fit, yaw, reduced }: ArtifactModelProps) {
  const gltf = useGLTF(url);

  const object = useMemo(() => {
    const root = gltf.scene.clone(true);

    // Los GLB de NASA traen cámaras y luces del archivo original: fuera.
    const junk: THREE.Object3D[] = [];
    root.traverse((child) => {
      if ((child as THREE.Light).isLight || (child as THREE.Camera).isCamera) junk.push(child);
    });
    junk.forEach((child) => child.parent?.remove(child));

    root.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    // Normaliza por la dimensión MAYOR: si no, Dawn (20 m de paneles) se sale del encuadre.
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0.001 ? fit / maxDim : 1;
    root.scale.setScalar(scale);

    root.updateWorldMatrix(true, true);
    const box2 = new THREE.Box3().setFromObject(root);
    const center = box2.getCenter(new THREE.Vector3());
    root.position.set(-center.x, -box2.min.y, -center.z);

    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        const std = mat as THREE.MeshStandardMaterial;
        if (std) {
          std.side = THREE.FrontSide;
          // Evita que la niebla de fondo opaque el artefacto en exhibición
          std.fog = false;
          if ('envMapIntensity' in std) std.envMapIntensity = 1.35;
          if ('roughness' in std && typeof std.roughness === 'number') {
            std.roughness = Math.min(std.roughness, 0.72);
          }
        }
      }
    });

    return root;
  }, [gltf.scene, fit]);

  return (
    <group rotation={[0, yaw, 0]}>
      <Float
        speed={reduced ? 0 : 1.1}
        rotationIntensity={reduced ? 0 : 0.12}
        floatIntensity={reduced ? 0 : 0.35}
        floatingRange={[-0.04, 0.04]}
      >
        <primitive object={object} />
      </Float>
    </group>
  );
}
