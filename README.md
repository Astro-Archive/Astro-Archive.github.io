# Still Listening · Los que siguen escuchando

> Cuatro máquinas que la NASA dejó en la Luna, en Marte y en el espacio profundo.
> Ya no transmiten. Sus historias sí.

Web app 3D interactiva para el **2026 NASA Space Apps Challenge**, reto
*"Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars"*.

Público objetivo: **10 a 14 años** y aficionados casuales al espacio.

---

## Qué es

Un museo orbital que se recorre con scroll. La cámara viaja entre cuatro dioramas
low-poly y cada artefacto es un capítulo con cuatro tiempos fijos:

| Capa | Contenido |
|---|---|
| **Qué es** | Masa, energía, instrumentos, año |
| **Por qué fue** | La pregunta científica que iba a responder |
| **Qué encontró** | El descubrimiento que cambió un libro de texto |
| **Qué es ahora** | Última transmisión, estado, dónde descansa |

Más una **voz ficcionalizada** (monólogo en primera persona, siempre etiquetado como
tal) y un **medidor de señal**: `activo → durmiente → silencioso → perdido`.

La separación explícita entre **HECHO** y **VOZ** es una decisión de diseño: el relato
emociona, el dato responde. Cada capítulo enlaza sus fuentes.

### Los cuatro artefactos

| # | Artefacto | Lugar | Año |
|---|---|---|---|
| 01 | **Eagle** — módulo lunar Apolo 11 (etapa de descenso) | Mar de la Tranquilidad, Luna | 1969 |
| 02 | **Opportunity** — rover MER-B | Cráter Endeavour, Marte | 2004–2018 |
| 03 | **Ingenuity** — helicóptero | Cráter Jezero, Marte | 2021–2024 |
| 04 | **Dawn** — sonda de propulsión iónica | Órbita de Ceres | 2007–2018 |

---

## Cómo se usa

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # genera dist/
bun run preview
```

### Publicar

`dist/` es estático y usa rutas relativas (`base: './'`), así que funciona en cualquier
host, incluido un subdirectorio.

- **Netlify**: arrastrar la carpeta `dist/` a `app.netlify.com/drop`.
- **Vercel**: `npx vercel --prod` (o arrastrar `dist/`).
- **GitHub Pages**: subir el contenido de `dist/` a la rama `gh-pages`.

`public/_headers` aplica cache largo a los assets con hash y cabeceras de seguridad
(Netlify lo copia a `dist/` en cada build).

### Dominio propio (opcional)

Si registras un dominio, conéctalo a Netlify y compila con la URL absoluta: Open Graph
exige URLs absolutas para la imagen y no todos los scrapers resuelven rutas relativas.

```bash
SITE_URL=https://tu-dominio.space bun run build
```

Sin la variable, el build funciona igual, pero `og:image` queda como ruta relativa.
En Netlify, define `SITE_URL` en las variables de entorno del sitio.

- **Scroll** para viajar entre estaciones.
- **Timeline inferior** para saltar a un capítulo.
- **← / →** navegación por teclado.
- **Modo lectura** (arriba a la derecha): oculta el 3D y muestra todo como artículo.
- **Esc** cierra el modo lectura.

### Minijuegos

Dos capítulos incluyen una mecánica de veinte segundos que se abre desde la ficha del
artefacto y devuelve al museo al terminar.

| Juego | Artefacto | Qué enseña |
|---|---|---|
| **Descenso lunar** | Eagle | Que la etapa de descenso no podía volver a la órbita: aunque te sobre combustible, necesitas otro motor y otro tanque. |
| **El último invierno** | Opportunity | Que la tormenta de 2018 no fue una avería, sino un presupuesto de energía que se agotó. No se puede ganar; se juega cuánta ciencia llega a casa. |

Ambos usan cifras reales (18.184 lb de propelente, 770 lb al aterrizar, 468 → 22 Wh) y
están documentados en `docs/DATOS.md`.

### Entrevistas: la última entrevista

Cada ficha tiene un botón **"Conectar con la máquina"**. Se abre un RPG de diálogo con
cuatro unidades de señal y siete preguntas posibles: no alcanzan para todas, y lo que no
preguntas se pierde. Al llegar a cero, la luz del artefacto se apaga y se genera una
entrada en el **catálogo de memoria**, que persiste entre visitas (`localStorage`).

- 4 entrevistas × 7 preguntas = 28 respuestas, todas con fuente en `docs/DATOS.md`.
- 16 fragmentos de catálogo, 4 por artefacto.
- Los retratos son WebP generados con IA (masters JPG en `assets/retratos-fuente/`):
  el componente intenta `portrait-<id>.webp`, luego `.png` y cae al SVG sin tocar código.
- Plan completo, dirección de arte y prompts: `docs/RPG.md`.

---

## Stack

```
Vite + React 19 + TypeScript
three.js + @react-three/fiber + @react-three/drei
@react-three/postprocessing (Bloom + Vignette)
CSS puro, scroll nativo, cero librerías de animación
```

Sin router, sin GSAP, sin Lenis, sin framework de UI. Todo lo visual está generado:

- **Terreno**: un solo mesh de 11.520 triángulos, desplazado con ruido de valor y
  coloreado por vértice. Se mezcla de gris lunar a óxido marciano a roca oscura a lo
  largo del recorrido, así que no hay costuras entre zonas.
- **Rocas**: 64 instancias de dodecaedro, una sola draw call.
- **Cielo**: shader de degradado con dithering, montado en una esfera que sigue a la cámara.
- **Sombra de contacto**: degradado radial pintado en canvas (no `ContactShadows`:
  a ras de suelo estiraba las sombras de patas y antenas).
- **Modelos**: normalizados por su dimensión mayor, centrados y apoyados en el suelo
  automáticamente.

---

## Estructura

```
docs/PLAN.md              plan de proyecto y decisiones
docs/DATOS.md             cada cifra con su fuente
docs/QA.md                qué se verificó y qué no
docs/GUION-VIDEO.md       guion del video de 100 s
public/models/*.glb       4 modelos de NASA 3D Resources
scripts/check.mjs         verificación con Chromium headless (capturas + errores)
src/
  data/artifacts.ts       todo el contenido: textos, fuentes, paletas, terreno y cámaras
  lib/noise.ts            ruido de valor + fBm + cráteres
  lib/useScroll.ts        progreso de scroll, reduced-motion, detección de WebGL
  rpg/
    interviews.ts         las 28 respuestas, con fuente
    catalog.ts            catálogo persistente (localStorage)
    InterviewGame.tsx     overlay de la entrevista
    InterviewScene.tsx    diorama low-poly del artefacto
    Catalog.tsx           catálogo de memoria
  game/
    DescentGame.tsx       minijuego de descenso (overlay 3D)
    descentPhysics.ts     física pura, compartida con el script de balance
    EnergyGame.tsx        minijuego de presupuesto de energía
  scene/
    Experience.tsx        contenido del canvas
    CameraRig.tsx         cámara sobre curva CatmullRom
    Cosmos.tsx            cielo, estrellas, niebla
    SkyDome.tsx           cielo degradado de una sola estación
    skyShader.ts          shader compartido del cielo
    World.tsx             terreno continuo + rocas
    TerrainPatch.tsx      relieve acotado para el diorama de entrevista
    Station.tsx           artefacto, anillo, sombra, polvo
    ArtifactModel.tsx     carga y normalización de GLB
  ui/
    ChapterCard.tsx       tarjeta del capítulo
    Timeline.tsx          navegación inferior
    ReadingMode.tsx       versión artículo, sin 3D
    Epilogue.tsx          cierre: lo que estamos dejando ahora
    SignalMeter.tsx       medidor de señal
```

Añadir un artefacto = añadir un objeto a `src/data/artifacts.ts` y un `.glb` a
`public/models/`. No hay nada cableado a mano en la escena.

---

## Datos y fuentes

Toda la información proviene de:

- **NSSDCA** (`nssdc.gsfc.nasa.gov`) — catálogo definitivo de naves e instrumentos.
- **NASA Science** y **NASA.gov** — páginas de misión.
- **NASA 3D Resources** (`science.nasa.gov/3d-resources`) — modelos GLB.

### Notas de precisión

Estas son las trampas que el proyecto evita a propósito:

- *"My battery is low and it's getting dark"* **no fue una transmisión de Opportunity**:
  es una paráfrasis de Jacob Margolis (JPL) sobre su telemetría. Aparece citada como
  advertencia, no como dato.
- **Ingenuity** no se estrelló: un aterrizaje de emergencia dañó una pala del rotor
  (anunciado en enero de 2024).
- **Dawn** no se estrelló ni regresó: sigue en órbita alrededor de Ceres, sin propelente,
  desde 2018.
- **Apolo 11**: en la superficie quedó la etapa de **descenso**. La de ascenso despegó y
  después impactó la Luna. El modelo de NASA muestra el módulo completo y la ficha lo dice.
- El sismómetro del Apolo 11 falló a las pocas semanas por sobrecalentamiento; fueron los
  de las misiones siguientes los que escucharon la Luna hasta 1977.

---

## Accesibilidad

- Todo el texto vive en **DOM real**, no en el canvas: legible por lectores de pantalla.
- **Modo lectura** completo sin WebGL, también usado como fallback automático si el
  navegador no soporta WebGL.
- `prefers-reduced-motion`: sin partículas, sin deriva de cámara, sin transiciones.
- Navegación completa por teclado con foco visible.
- Los overlays atrapan el foco: el fondo queda `inert` y al cerrar el foco vuelve al botón
  que los abrió.
- Contraste AA sobre fondo oscuro.
- La cámara se adapta al aspecto de la pantalla: en móvil se aleja y encuadra el
  artefacto por encima de la tarjeta.

---

## Rendimiento

| Métrica | Valor |
|---|---|
| Modelos | 3,6 MB (4 GLB) |
| JS | ~390 KB gzip |
| CSS | ~3 KB gzip |
| Triángulos de escena | ~12.000 + modelos |
| PostFX | Bloom + Vignette |
| `dpr` | `[1, 1.75]` |

---

## Créditos y licencias

- **Modelos 3D**: NASA 3D Resources / NASA.
  Material de NASA generalmente sin copyright en EE.UU.; se acredita la fuente y no se
  sugiere endorsement. NASA no patrocina ni respalda este proyecto.
- **Datos**: NSSDCA y NASA Science, citados capítulo por capítulo.
- **Código y textos**: proyecto del 2026 NASA Space Apps Challenge.

Las secciones marcadas como *Voz ficcionalizada* son recreaciones literarias, no
transmisiones reales.
