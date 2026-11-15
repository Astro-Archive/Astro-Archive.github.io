# RPG educativo — La última entrevista

Módulo de entrevistas para *Still Listening*. Se implementa como **overlay aislado**, igual
que los minijuegos: no toca el scroll, ni la escena del museo, ni el estado existente.

---

## 1. Concepto

El museo cuenta las máquinas. El RPG te deja **hablar con ellas antes de que se apaguen**.

Eres un técnico de recuperación de memoria. Te conectas a un artefacto y te quedan **4
unidades de señal**. Hay 7 preguntas posibles. No alcanzan para todas. Al llegar a cero, la
máquina calla y lo que no preguntaste se pierde.

**Por qué es un RPG y no un cuestionario:**

- **Recurso escaso** (señal), no una lista de preguntas.
- **Elección con consecuencia**: cada pregunta que haces es una que no harás.
- **Progresión persistente**: el catálogo de memoria se llena entre partidas.

Cumple el criterio más difícil del brief: *"your audience might walk away feeling a
personal connection to these forgotten robotic explorers"*.

---

## 2. Mecánica

```
Entrevista
  ├─ 4 pips de señal
  ├─ 7 preguntas en 3 categorías: CIENCIA · FALLO · ÚLTIMAS HORAS
  ├─ cada respuesta consume 1 pip
  ├─ 4 de las 7 preguntas entregan un fragmento de catálogo (no se sabe cuáles de antemano)
  └─ al llegar a 0: la luz del artefacto se apaga en 4 s y se genera la entrada
```

- No se puede perder la partida; se puede **perder información**.
- Cada artefacto aporta hasta 4 fragmentos; el catálogo muestra `2/4`.
- Completar los cuatro desbloquea una línea extra en el epílogo.

**Decisiones de diseño tomadas:**

| Decisión | Elección | Motivo |
|---|---|---|
| Alcance | Una entrevista **por artefacto** (1-2 min) | Respeta a quien entra cinco minutos |
| Avatar | **Sin avatar 3D**: la archivista es retrato y voz | Rigging + animación = 3 días; el mayor riesgo del proyecto |
| Preguntas | **7 disponibles, 4 de señal** | Con 5 de 7 no hay elección; con 3 de 7 se siente arbitrario |

---

## 3. Arquitectura

```
src/rpg/
  interviews.ts        contenido: nodos, fragmentos, fuentes
  catalog.ts           store persistente (localStorage + useSyncExternalStore)
  InterviewGame.tsx    overlay: escena + caja de diálogo
  InterviewScene.tsx   diorama low-poly (reusa ArtifactModel)
  Catalog.tsx          catálogo de memoria
  portraits.ts         mapa id → imagen + fallback
  useTypewriter.ts     texto progresivo, saltable
```

**Punto de entrada:** el bloque *Voz ficcionalizada* de cada ficha pasa a tener un botón
*"Conectar con la máquina"*. No añade un botón suelto a la tarjeta y le da sentido narrativo.

**Contextos WebGL:** máximo 2 simultáneos (museo + overlay). El RPG desmonta su canvas al
cerrar, como el descenso.

---

## 4. Contenido

- 4 entrevistas × 7 preguntas = **28 respuestas**.
- Cada afirmación sale de `docs/DATOS.md`. Si un dato no está verificado, no entra.
- 3 categorías por entrevista: `ciencia`, `fallo`, `ultimas`.
- 4 fragmentos por artefacto → 16 fragmentos de catálogo en total.

Tono: primera persona, frases cortas, sin épica. La máquina no se queja: constata.

---

## 5. Dirección de arte: retratos

Los retratos los genera el equipo con IA. Especificación **no negociable** para que acoplen:

| Regla | Valor | Por qué |
|---|---|---|
| Formato | 1:1, 1024×1024 mínimo | El recorte a 4:5 no debe cortar la cabeza |
| Encuadre | Sujeto centrado, **60 % de la altura** | Deja aire para el recorte |
| Punto focal | Ojos a **1/3 desde arriba** | Un recorte circular sigue mostrando la mirada |
| Fondo | `#0A0E18` plano, sin viñeta ni marco | El CSS lo funde con una máscara radial |
| Dirección | Mirando ligeramente a la **derecha** | El retrato va a la izquierda y mira al texto |

**Entrega:** `public/rpg/portrait-{eagle|opportunity|ingenuity|dawn|archivist}.webp`
(o `.png`), ≤180 KB cada uno. Los masters en JPG quedan en `assets/retratos-fuente/`.

**Fallback:** si falta el WebP se prueba el PNG, luego el SVG placeholder y, por
último, un monograma (`onError`), sin romper nada.

### Bloque de estilo (idéntico en los cinco prompts)

```
low-poly stylized 3D character portrait, flat-shaded faceted geometry, visible
triangular facets, matte clay materials, no textures, video game dialogue portrait,
head and shoulders, three-quarter view facing slightly to the right, subject
centered and occupying 60% of the frame height, flat dark navy background #0A0E18
with a subtle radial falloff, warm bone-white key light from upper left, burnt-orange
rim light #FF6B35 from lower right, faint teal fill #4FD1C5 from below, soft contact
shadow, clean silhouette, 1:1 square composition, no text, no logos, no frame,
no vignette
```

### Negativo (idéntico en los cinco)

```
photorealistic, smooth shading, high-poly, subsurface scattering, glossy plastic,
text, watermark, signature, logo, interface, frame, border, vignette, collage,
multiple characters, blurry, noisy, deformed, extra limbs
```

### Personajes

**La archivista** (generar primero: es la referencia de luz y material)
```
a young field archivist in her early thirties, short dark hair, worn cream flight
suit with an orange utility harness and a small amber display on the chest, holding
a slate tablet, dust on the shoulders, tired but warm half-smile, expressive faceted
face
```

**Eagle**
```
the Apollo Lunar Module personified: faceted gold-foil body, four spidery landing
legs, a single square window reading as an eye, white ceramic panels, hatch and
ladder, one thin antenna, dust settled on the top surfaces, dignified and slightly
weary posture
```

**Opportunity**
```
a six-wheeled Mars rover: dark blue-violet solar panel deck reading as a hat, camera
mast rising like a head with two round lenses as eyes, dusty panels with visible
facets, one front wheel slightly raised, rocker-bogie suspension, tired but proud
stance
```

**Ingenuity**
```
a small Mars helicopter: four thin carbon-fiber blades folded slightly like a crown,
two dark solar cells reading as eyes on a faceted cream body, four spindly legs, a
tiny antenna, brave and slightly fragile stance
```

**Dawn**
```
an ion-propulsion probe: two enormous silver solar wings cropped by the frame edges,
a dark faceted high-gain dish reading as a face, a faint cyan ion glow at its base,
slender xenon tanks, serene and distant posture
```

### Consistencia entre las cinco

1. Generar **la archivista primero**.
2. Usar esa imagen como **referencia de estilo** para las cuatro máquinas (`--sref` en
   Midjourney, image prompt en Flux, IP-Adapter en SDXL).
3. **No reescribir el bloque de estilo**: cambiar solo el párrafo del personaje.
4. Misma semilla o misma familia de semillas, y las cinco en la misma sesión.

### Checklist de aceptación

- [ ] 1:1 y ≥1024 px
- [ ] Fondo `#0A0E18`, sin viñeta ni degradado visible
- [ ] Sujeto centrado, ojos a ~1/3 desde arriba
- [ ] Mira a la derecha
- [ ] Sin texto, marca de agua ni marco
- [ ] Misma dirección de luz que las otras cuatro

---

## 6. Animación

Nada de rigging. Cinco capas baratas que juntas se sienten caras:

| Elemento | Animación | Coste |
|---|---|---|
| Texto | Máquina de escribir a 28 ms/carácter, saltable | 15 líneas |
| Retrato | Flotación ±3 px cada 6 s + brillo al hablar | CSS |
| Opciones | Aparición escalonada de 60 ms | CSS |
| Escena | Deriva de cámara sinusoidal + polvo en suspensión | `useFrame` |
| Artefacto | Anillo de señal que pulsa al ritmo de la voz | `useFrame` |
| **Final** | La luz baja a cero en 4 s y el polvo se detiene | 1 interpolación |

La última es la que se recuerda: **cuando se acaba la señal, la escena se apaga**.
Todo detrás de `prefers-reduced-motion`.

### Sonido de escritura

`public/sfx/text-blip.mp3` (0,31 s) suena con cada carácter no blanco mientras el
texto se escribe; al saltar la línea no suena nada. `src/rpg/blip.ts` lo decodifica
una vez con Web Audio y limita la cadencia a un blip cada 75 ms, con ±4 % de tono,
volumen 0,4 y un recorte de 90 ms (salta los ~48 ms de silencio inicial del MP3)
para que no se solape consigo mismo ni se convierta en un zumbido.

El botón **Sonido on/off** del HUD lo silencia y guarda la preferencia en
`localStorage` (`still-listening:sfx`). El MP3 se descarga al abrir la entrevista y
se desbloquea con el primer clic o tecla; si el navegador bloquea el audio, la
entrevista sigue igual y el fallo es silencioso.

---

## 7. Fases

| Fase | Entregable | Est. |
|---|---|---|
| F0 | Contenido: 28 respuestas + 16 fragmentos con fuente | 2,5 h |
| F1 | Vertical slice: Opportunity jugable con placeholder | 2 h |
| F2 | Escena 3D + reacciones + apagado final | 1,5 h |
| F3 | Catálogo persistente + entrada desde las 4 fichas | 1,5 h |
| F4 | Las otras 3 entrevistas (contenido) | 1,5 h |
| F5 | Retratos reales + máscara CSS + fallback | 0,5 h |
| F6 | QA: teclado, foco, móvil, reduced-motion, contextos | 1,5 h |

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| El contenido es lo caro, no el código | Se escribe antes de tocar React |
| Retratos inconsistentes | Bloque de estilo + referencia + checklist |
| Una imagen no acopla | Máscara radial + fallback de monograma |
| Romper la app que ya funciona | Overlay aislado; no se toca scroll ni escena |
| Texto que inventa datos | Cada respuesta sale de `docs/DATOS.md` |
| Peso | 5 retratos ≤900 KB, carga diferida al abrir |

---

## 9. Criterios de aceptación

- Se inicia una entrevista desde cualquiera de las cuatro fichas.
- 4 pips de señal, 7 opciones, sin repetir pregunta.
- Al llegar a 0 se apaga la luz, aparece el texto de silencio y la entrada de catálogo.
- El catálogo persiste entre recargas y muestra `n/4` por artefacto.
- Teclado: se puede jugar entero sin ratón; Escape cierra y devuelve el foco.
- `prefers-reduced-motion`: sin flotación ni deriva; el texto aparece completo.
- Cero errores de consola y ningún contexto WebGL filtrado.
