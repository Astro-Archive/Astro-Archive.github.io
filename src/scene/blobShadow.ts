import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Sombra de contacto falsa: un degradado radial pintado en canvas.
 * Sustituye a ContactShadows, que a ras de suelo estiraba las sombras de patas y antenas.
 */
export function useBlobShadowTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(0,0,0,0.9)');
    gradient.addColorStop(0.38, 'rgba(0,0,0,0.55)');
    gradient.addColorStop(0.72, 'rgba(0,0,0,0.16)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);
}
