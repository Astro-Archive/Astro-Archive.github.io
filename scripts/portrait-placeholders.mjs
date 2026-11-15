import fs from 'node:fs';
import path from 'node:path';

/**
 * Genera los retratos de relleno del RPG.
 * Se reemplazan por los PNG generados con IA sin tocar código:
 * el componente intenta `portrait-<id>.png` y cae a estos SVG si no existe.
 */

const OUT = 'public/rpg';
fs.mkdirSync(OUT, { recursive: true });

const PORTRAITS = [
  { id: 'archivist', mono: 'A', label: 'ARCHIVISTA', accent: '#ece7db' },
  { id: 'eagle', mono: 'E', label: 'EAGLE', accent: '#ff6b35' },
  { id: 'opportunity', mono: 'O', label: 'OPPORTUNITY', accent: '#ffb46b' },
  { id: 'ingenuity', mono: 'I', label: 'INGENUITY', accent: '#4fd1c5' },
  { id: 'dawn', mono: 'D', label: 'DAWN', accent: '#8fb3ff' },
];

for (const p of PORTRAITS) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 640" width="512" height="640" role="img" aria-label="Retrato pendiente de ${p.label}">
  <rect width="512" height="640" fill="#0A0E18"/>
  <g>
    <polygon points="256,120 372,268 256,430 140,268" fill="${p.accent}" opacity="0.16"/>
    <polygon points="256,120 372,268 256,268" fill="${p.accent}" opacity="0.3"/>
    <polygon points="256,120 140,268 256,268" fill="${p.accent}" opacity="0.1"/>
    <polygon points="140,268 256,430 256,268" fill="${p.accent}" opacity="0.22"/>
    <polygon points="372,268 256,430 256,268" fill="${p.accent}" opacity="0.13"/>
  </g>
  <text x="256" y="300" text-anchor="middle" font-family="'Space Grotesk', system-ui, sans-serif" font-size="132" font-weight="300" fill="#ECE7DB" opacity="0.9">${p.mono}</text>
  <text x="256" y="520" text-anchor="middle" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="15" letter-spacing="6" fill="#96A0B1">${p.label}</text>
  <text x="256" y="556" text-anchor="middle" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="10" letter-spacing="3" fill="#4F5665">RETRATO PENDIENTE</text>
</svg>
`;
  fs.writeFileSync(path.join(OUT, `portrait-${p.id}.svg`), svg);
}

fs.writeFileSync(
  path.join(OUT, 'README.md'),
  `# Retratos del RPG

Estos SVG son **placeholders**. Para reemplazarlos, deja los archivos con este nombre:

\`\`\`
portrait-archivist.png   (o .webp)
portrait-eagle.png
portrait-opportunity.png
portrait-ingenuity.png
portrait-dawn.png
\`\`\`

El componente intenta el \`.png\` primero y, si falla, cae al \`.svg\`. No hay que tocar código.

## Especificación

- 1:1, mínimo 1024×1024
- Fondo \`#0A0E18\` plano, sin viñeta ni marco
- Sujeto centrado, 60 % de la altura, ojos a 1/3 desde arriba
- Mirando ligeramente a la derecha
- ≤180 KB por imagen

Los prompts completos están en \`docs/RPG.md\`, sección 5.
`,
);

console.log(`listo: ${PORTRAITS.length} placeholders en ${OUT}`);
