# Retratos del RPG

Arte generado con IA a partir de los prompts de `docs/RPG.md`, sección 5. Los masters
en JPG de 2048×2048 viven en `assets/retratos-fuente/`; en producción se sirven
WebP de 1024×1024.

## Archivos publicados

```
portrait-archivist.webp
portrait-eagle.webp
portrait-opportunity.webp
portrait-ingenuity.webp
portrait-dawn.webp
```

El componente `src/rpg/Portrait.tsx` intenta `.webp`, luego `.png`, luego el SVG
placeholder y, si todo falla, un monograma. No hay que tocar código para cambiar el arte.

## Especificación

- 1:1, mínimo 1024×1024
- Fondo `#0A0E18` plano, sin viñeta ni marco
- Sujeto centrado, 60 % de la altura, ojos a 1/3 desde arriba
- Mirando ligeramente a la derecha
- ≤180 KB por imagen (los actuales pesan 28–44 KB)

## Regenerar los WebP

```bash
magick assets/retratos-fuente/Eagle.jpg -resize 1024x1024 -strip -quality 85 public/rpg/portrait-eagle.webp
magick assets/retratos-fuente/Opportunity.jpg -resize 1024x1024 -strip -quality 85 public/rpg/portrait-opportunity.webp
magick assets/retratos-fuente/Ingenuity.jpg -resize 1024x1024 -strip -quality 85 public/rpg/portrait-ingenuity.webp
magick assets/retratos-fuente/dawn.jpg -resize 1024x1024 -strip -quality 85 public/rpg/portrait-dawn.webp
magick "assets/retratos-fuente/La archivista.jpg" -resize 1024x1024 -strip -quality 85 public/rpg/portrait-archivist.webp
```
