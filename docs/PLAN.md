# Still Listening — Plan de proyecto

> **Reto:** *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars*
> **Evento:** 2026 NASA Space Apps Challenge · Dificultad: Intermediate / Beginner-Youth
> **Entregable:** web app 3D interactiva, scroll-driven, en español, para público de 10–14 años.

---

## 1. Concepto

**"Still Listening" (Los que siguen escuchando)** es un museo orbital en scroll. La cámara
viaja entre cuatro dioramas low-poly y cada artefacto es un capítulo con cuatro tiempos fijos.

El título juega con InSight, que escuchó marsismos hasta apagarse: el hardware ya no
transmite, pero nosotros seguimos escuchando su historia.

### Las cuatro capas de cada capítulo

| Capa | Contenido | Naturaleza |
|---|---|---|
| **QUÉ ES** | Masa, potencia, instrumentos, año | Dato duro |
| **POR QUÉ FUE** | La pregunta científica que iba a responder | Dato duro |
| **QUÉ ENCONTRÓ** | El descubrimiento que cambió un libro de texto | Dato duro |
| **QUÉ ES AHORA** | Última transmisión, estado, dónde descansa | Dato duro |

Más una **voz ficcionalizada** (monólogo en primera persona del artefacto), siempre
etiquetada como tal, y un **medidor de señal**:
`activo → durmiente → silencioso → perdido`.

La separación explícita **HECHO / VOZ** es la decisión de diseño que protege el criterio
de *accuracy* del reto: el relato emociona, el dato responde.

---

## 2. Roster congelado (4 artefactos)

Pesos verificados contra `github.com/nasa/NASA-3D-Resources`.

| # | Artefacto | GLB | Peso | Lugar | Año | Aporte científico | Gancho narrativo |
|---|---|---|---|---|---|---|---|
| 1 | **Apollo Lunar Module** (etapa de descenso) | ✅ | 717 KB | Luna | 1969 | Primer alunizaje tripulado; sismómetros del ALSEP | "Fui el pedestal del primer paso humano, y me quedé ahí." |
| 2 | **Opportunity (MER-B)** | ✅ | 37 KB | Marte | 2004–2018 | Evidencia de agua líquida antigua; 45,16 km recorridos | "Estaba diseñada para 90 días. Trabajé 15 años." |
| 3 | **Ingenuity** | ✅ | 2,0 MB | Marte | 2021–2024 | Primer vuelo motorizado en otro mundo; 72 vuelos | "Fui la primera cosa que voló en otro mundo." |
| 4 | **Dawn** | ✅ | 927 KB | Ceres | 2007–2018 | Propulsión iónica; mapas de Vesta y Ceres; agua en Ceres | "Ya no me oyen. Sigo en órbita, y nadie va a venir." |

**Total crudo: 3,7 MB.** Tras optimización: ~2,5 MB. Presupuesto de la app: **< 6 MB**.

**Arco:** Luna (1969) → perseverancia (2004-2018) → primer vuelo (2021-2024) → soledad del
espacio profundo. Cubre Luna + Marte + espacio profundo, las tres localizaciones del brief.

### Alternos

- `Viking Lander.glb` (1,8 MB) — primer lander de EE.UU. en Marte, 1976.
- `InSight Cruise Lander (panels deployed).glb` (3,9 MB) — ojo: incluye etapa de crucero.

**Descartados:** Curiosity y MER Spirit/Opportunity solo existen como `.blend`, lo que
obligaría a instalar Blender para convertirlos. No vale el costo en un sprint de un día.

---

## 3. Stack

```
Vite + React 19 + TypeScript
three.js + @react-three/fiber + @react-three/drei
@react-three/postprocessing   (Bloom + Vignette únicamente)
CSS puro + scroll nativo       (sin router, sin GSAP, sin Lenis)
Deploy: Vercel / Netlify (drag & drop)
```

**Por qué no Godot/Unity/Blender:** el reto pide explícitamente *"interactive web-based
experience using HTML, CSS, or JavaScript"* y la accesibilidad es criterio de evaluación.
2,5 MB de GLB optimizados + ~600 KB de JS le gana a 15–30 MB de wasm en carga, SEO,
lectores de pantalla y en un jurado que abre el link desde el móvil.

**Blender no es necesario.** Blender ya es gratuito (GPLv3), pero ningún paso del pipeline
lo requiere: los modelos ya existen como GLB y la optimización se hace con
`@gltf-transform/cli`. Si en el futuro hace falta modelar o bakear, la vía correcta es
`blender -b --python script.py` (headless, reproducible), no un MCP con GUI.

### Pipeline de assets

```bash
npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp
```

Objetivo: ≤ 1,5 MB por artefacto. Si un modelo no encaja visualmente, se reemplaza por un
proxy low-poly de primitivas generado en código (más rápido que modelar).

---

## 4. Arquitectura de la experiencia

```
[Canvas fijo a pantalla completa]  +  [HTML overlay: cards, timeline, HUD]
                ↑
        scroll nativo de 4 secciones (400vh)
                ↓
progreso 0..1 → curva de cámara (CatmullRom) → 4 estaciones
```

### Escena

- **Terreno procedural por zona:** `PlaneGeometry` 32×32 → `toNonIndexed()` →
  desplazamiento por ruido de valor + fBm → `flatShading` (look facetado low-poly).
  Cero modelado manual.
- **Paletas por zona:** Luna gris-azul · Marte óxido · Ceres negro-azul.
- **Atmósfera:** `Stars` de drei, partículas de polvo, `fog` por zona, fondo que
  interpola color según el progreso.
- **Escaparate de producto:** `<Center>` + auto-escala a altura objetivo +
  `ContactShadows` + rotación lenta + `Float` suave.
- **Normalización de modelos:** cada GLB se centra y se escala a una altura objetivo
  calculada con `Box3`, así los cuatro se ven coherentes sin ajustes manuales.

### Navegación

- Scroll nativo → `progress` en un hook con `requestAnimationFrame`.
- Cámara: `CatmullRomCurve3` de 4 waypoints + `lookAt` interpolado y amortiguado.
- Timeline inferior clicable → `scrollTo` con `behavior: smooth`.
- Teclado: flechas ←/→ saltan de estación.

### UI

| Elemento | Función |
|---|---|
| Hero | Título + subtítulo + "desliza" |
| Chapter card | Las 4 capas + voz + estado + fuentes |
| Timeline | 4 puntos, año, nombre, salto directo |
| Signal meter | Barras animadas según estado del artefacto |
| Loading | Progreso real de `useProgress` |
| Modo lectura | Oculta el 3D y muestra todo como artículo (a11y) |

### Accesibilidad

- Todo el texto vive en DOM real (no en canvas): legible por lectores de pantalla.
- `prefers-reduced-motion`: sin partículas, sin deriva de cámara, transiciones a 0.
- Navegación completa por teclado, foco visible.
- Contrastes AA sobre fondo oscuro.
- Modo lectura sin WebGL como fallback.
- `dpr` limitado y `frameloop` controlado para móviles modestos.

---

## 5. Presupuesto de rendimiento

| Métrica | Objetivo |
|---|---|
| Peso inicial (JS + GLB) | < 6 MB |
| GLB total | < 4 MB |
| Draw calls | < 60 |
| Sombras | solo `ContactShadows` |
| PostFX | Bloom + Vignette |
| `dpr` | `[1, 1.75]` |
| Time to interactive en 4G | < 6 s |

---

## 6. Fuentes de datos

- **NSSDCA** (`nssdc.gsfc.nasa.gov`) — catálogo definitivo de naves e instrumentos.
- Páginas de misión de NASA Science (`science.nasa.gov/mission/…`).
- NASA 3D Resources (`science.nasa.gov/3d-resources`) — modelos y texturas.
- JPL Photojournal — imágenes de contexto.

Cada capítulo enlaza su fuente. El dato sin fuente no entra.

### Advertencias de precisión

- *"My battery is low and it's getting dark"* **no fue una transmisión de Opportunity**:
  es una paráfrasis de Jacob Margolis (JPL) sobre la telemetría. Si se usa, se etiqueta
  como tal.
- **Ingenuity** quedó en tierra por daño en una pala del rotor (anunciado enero 2024);
  no se estrelló.
- **Dawn** sigue en órbita alrededor de Ceres sin propelente desde 2018; no se estrelló
  ni regresó.
- **Apollo 11**: en la superficie quedó la etapa de **descenso**; la de ascenso despegó y
  luego impactó la Luna. El modelo de NASA muestra el LM completo: decirlo.
- Material de NASA: generalmente sin copyright en EE.UU., uso comercial permitido,
  **sin implicar endorsement**, acreditando la fuente y revisando ítems de terceros.

---

## 7. Plan de ejecución (sprint de un día)

| Bloque | T | Entregable | Done cuando… |
|---|---|---|---|
| **0. Congelar** | 45 m | Scaffold Vite + deps + 4 GLB en `public/models/` | `dev` abre y los 4 archivos existen |
| **1. Hola 3D** | 90 m | Canvas, cámara, luces, `Environment`, `ContactShadows`, loader; solo el LM | El LM gira en pantalla |
| **2. Pipeline** | 45 m | `gltf-transform` + `artifacts.ts` | 4 modelos cargan, < 4 MB, consola limpia |
| **3. Escena** | 120 m | Terreno procedural, 3 zonas, polvo, estrellas | Se distinguen Luna / Marte / espacio profundo |
| **4. Navegación** | 90 m | Scroll → curva de cámara, waypoints, hotspots | El scroll recorre los 4 sin glitches |
| **5. Narrativa** | 120 m | Chapter card (4 capas + voz + fuentes), signal meter | Un capítulo completo legible sin salir del 3D |
| **6. Pulido** | 90 m | Bloom, viñeta, tipografía, hero, transiciones | Se ve de escaparate, no de demo técnica |
| **7. QA + deploy** | 60 m | Build, peso, móvil 4G, reduced-motion, deploy | URL pública abre en móvil en < 6 s |
| **8. Entrega** | 30 m | README, créditos, texto de submission | Link + descripción entregados |

### Reglas de fallback

- **+4 h sin GLB cargando** → proxies low-poly de primitivas (20 min).
- **+7 h sin navegación fluida** → botones siguiente/anterior, sin scroll cinematográfico.
- **+8 h sin cards** → panel lateral fijo. El contenido es lo que se evalúa.

### Fuera de alcance

Audio narrado · bilingüe · más de 4 artefactos · física · VR · tests automatizados ·
modo museo libre · animaciones articuladas.

---

## 8. Checklist de entrega

- [ ] URL pública que abre en móvil
- [ ] 4 artefactos con hecho verificado + fuente citada
- [ ] Capa VOZ marcada como ficcionalizada
- [ ] Créditos "NASA 3D Resources / NASA", sin logo ni endorsement
- [ ] Declaración de accesibilidad (teclado, reduced-motion, contraste, modo lectura)
- [ ] README con stack, comandos y fuentes
- [ ] Texto de submission: título, one-liner, el porqué, público, stack

---

## 9. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| GLB pesados o con materiales raros | Media | Alto | `gltf-transform` + proxy de primitivas |
| GPU móvil débil | Media | Medio | `dpr` limitado, sin shadow maps, LOD visual |
| Ficcionalizar y perder rigor | Media | Alto | capa HECHO/VOZ + fuentes por tarjeta |
| Scope creep | **Alta** | **Alto** | roster congelado, lista de "fuera de alcance" |
| Modelo erróneo (LM completo en superficie) | Baja | Medio | nota explícita en la ficha |

---

## 10. Estado de ejecución

**Terminado.** Los cuatro capítulos funcionan, el build es limpio y no hay errores de
consola en escritorio, móvil ni modo lectura.

### Desvíos respecto al plan (y por qué)

| Plan | Implementado | Motivo |
|---|---|---|
| 4 terrenos locales, uno por estación | **Un solo terreno continuo** con mezcla de altura y color por vértice | Los parches se solapaban: Marte se veía en el horizonte de la Luna |
| `ContactShadows` de drei | **Sombra de contacto falsa** (degradado radial en canvas) | A ras de suelo, las sombras de patas y antenas se estiraban como garras |
| `CatmullRomCurve3` + GSAP/Lenis | Curva CatmullRom + **scroll nativo** | Dos dependencias menos y cero riesgo de conflicto con el scroll del navegador |
| Normalizar por altura (`height`) | Normalizar por **dimensión mayor** (`fit`) | Dawn mide 20 m de panel solar: por altura se salía del encuadre |
| Cámara fija | Cámara con **retroceso según el aspecto** y objetivo desplazado | En vertical el artefacto se salía de cuadro y quedaba bajo la tarjeta |
| `Environment preset` de drei | `Environment` construido con `Lightformer` | El preset descarga un HDR de un CDN: dependencia de red innecesaria en un hackathon |

### Lo que quedó fuera (y no se echó de menos)

Audio narrado, bilingüe, física, VR, tests automatizados, más de cuatro artefactos.

### Pendiente al cierre

1. **Deploy** de `dist/` (Netlify Drop o Vercel) para tener URL pública.
2. **Video narrado de 90 s** — ver `docs/GUION-VIDEO.md`. El archivo
   `docs/still-listening-demo.mp4` es material de apoyo de 10,6 s, no la presentación.
3. Probar en un móvil real (la verificación fue con Chromium emulando 390×844).
