# Plan de implementación — modo RPG educativo conversacional

## Problema y objetivo

Ampliar **Still Listening** con un modo RPG educativo conversacional que aproveche el
recorrido 3D existente y convierta una estación en una misión jugable: explorar una
zona, interactuar con un artefacto/personaje placeholder, tomar decisiones mediante
textboxes, completar objetivos científicos, resolver un reto corto y obtener progreso
o una insignia.

El MVP será **una misión completa para un solo artefacto**, con diálogos ramificados
preescritos. Los personajes finales todavía no están disponibles, por lo que la
integración usará placeholders y contratos de datos estables; las voces actuales de
los artefactos podrán servir como contenido temporal, pero no se acoplará la solución
a assets finales.

## Estado actual relevante

- La aplicación es Vite + React 19 + TypeScript + React Three Fiber.
- `App.tsx` coordina el museo, el scroll, el modo lectura y los dos minijuegos.
- `artifacts.ts` concentra el contenido factual, fuentes, modelos, cámaras, paletas y
  los identificadores de minijuego.
- `Experience.tsx`, `World.tsx` y `Station.tsx` ya ofrecen Canvas fijo, terreno
  procedural continuo, estaciones 3D, iluminación, partículas y postprocesado.
- `ChapterCard.tsx` ya presenta hechos, voz ficcionalizada, fuentes y CTA de minijuego.
- El bloqueo de scroll, cierre con Escape y fallback de lectura/WebGL ya existen y
  deben conservarse.
- El árbol de trabajo contiene cambios locales no relacionados; no deben revertirse.
- Otro agente está trabajando en paralelo: la implementación debe hacerse únicamente en
  una rama nueva de este repositorio, nunca directamente sobre `main`.

## Alcance del MVP

### Incluido

1. **Entrada al modo RPG**
   - CTA desde el capítulo seleccionado, sin romper el museo scroll-driven.
   - Overlay/modal de juego con cierre por Escape y retorno al capítulo.
   - Estado de sesión reiniciable para demo.

2. **Exploración 3D de una misión**
   - Reutilizar `World`/`Station` y añadir una escena o submodo de misión local.
   - Movimiento simple por puntos de interés o navegación guiada, no física libre.
   - Interacciones accesibles equivalentes en DOM para teclado y móvil.
   - Destacar un único artefacto/objetivo del MVP y dejar la API lista para más zonas.

3. **Conversación educativa**
   - Textbox con nombre, rol, avatar placeholder, texto y avance.
   - Nodos de diálogo con opciones; las elecciones pueden cambiar la explicación,
     objetivo activo, pista o resultado, sin IA generativa externa.
   - Separar en datos el contenido factual, la voz narrativa y las consecuencias.
   - Mantener etiquetas claras para no presentar ficción como transmisión real.

4. **Misión, quiz y progreso**
   - Objetivos estructurados con estados `locked`, `active`, `completed`.
   - Al menos un quiz/decisión científica relacionado con el artefacto elegido.
   - Feedback inmediato, explicación de la respuesta y oportunidad de reintento.
   - Progreso persistido durante la sesión y recompensa visual tipo insignia.
   - Preparar persistencia local opcional sin convertirla en dependencia del MVP.

5. **Internacionalización preparada**
   - No traducir todo en esta iteración.
   - Evitar textos dispersos en componentes nuevos; usar claves/contenido estructurado
     para poder añadir inglés después.

6. **Accesibilidad y rendimiento**
   - Textbox en HTML real, foco gestionado, botones navegables por teclado y labels.
   - `prefers-reduced-motion`, fallback sin WebGL y experiencia usable en móvil.
   - Mantener el presupuesto actual: sin nuevo motor, router o dependencia pesada.

### Fuera de alcance

- IA generativa, backend, cuentas, multijugador o sincronización remota.
- Assets finales de personajes, lip-sync, actuación compleja o animaciones articuladas.
- Mundo abierto, combate, inventario complejo, economía o física libre.
- Completar las cuatro misiones antes del MVP.
- Reescribir el museo 3D actual o sustituir los minijuegos existentes.

## Diseño técnico propuesto

### Modelo de datos

Crear un módulo de contenido RPG separado de `artifacts.ts`, por ejemplo:

- `RpgMission`: id, artefacto asociado, intro, puntos de interés, objetivos, diálogo,
  quiz y recompensa.
- `RpgCharacter`: id, nombre, rol, avatar opcional, estilo y fuente de contenido.
- `DialogueNode` / `DialogueChoice`: texto por clave, opciones, condición y efectos.
- `QuestObjective`: id, tipo, descripción, requisito, estado y explicación educativa.
- `RpgProgress`: nodo actual, objetivos completados, quiz, insignia y visita.

El contenido debe referenciar `artifact.id` en vez de duplicar datos científicos.
Las fuentes seguirán viviendo en el artefacto o se enlazarán explícitamente desde la
misión.

### Componentes

- `src/rpg/` para tipos, datos y lógica pura de transición/progreso.
- `src/rpg/RpgMode.tsx` como coordinador del modo.
- Componentes separados para `RpgScene`, `DialogueBox`, `QuestTracker`,
  `ScienceQuiz` y `Badge/Progress`.
- `App.tsx` solo abrirá/cerrará el modo y pasará el `artifact.id`/misión activa.
- `styles.css` recibirá estilos acotados al overlay RPG, estados de foco y responsive.

### Integración 3D

Preferir una escena de misión reutilizable que reciba una definición de zona y puntos
de interés, en lugar de duplicar un Canvas completo por misión. El modelo actual puede
seguir siendo el centro visual; los puntos interactivos se representarán con anillos,
marcadores o hotspots de bajo costo. La cámara y el desplazamiento del museo deben
quedar pausados mientras el RPG está abierto.

### Flujo del jugador

1. El usuario abre la misión desde una tarjeta.
2. Ve una introducción breve y un objetivo.
3. Explora el punto de interés y activa una conversación.
4. Elige respuestas; el diálogo entrega contexto y actualiza la misión.
5. Completa un quiz o decisión científica.
6. Recibe explicación, progreso/insignia y CTA para volver al capítulo.

## Secuencia de trabajo

1. Definir tipos, estado y contenido de una misión piloto.
2. Implementar máquina de diálogo y objetivos como lógica testeable/pura.
3. Crear overlay accesible de diálogo, tracker y quiz.
4. Integrar entrada/salida desde `App` y bloqueo de scroll/teclado.
5. Añadir escena 3D de misión y hotspots reutilizables.
6. Conectar placeholder de personaje sin asumir assets definitivos.
7. Añadir estilos responsive, reduced-motion y estado de recompensa.
8. Verificar build, navegación por teclado, reinicio, cierre con Escape y flujo móvil.

## Coordinación Git

Antes de modificar archivos del repositorio:

1. Crear y cambiar a una rama dedicada, por ejemplo `feat/rpg-educational-mode`,
   partiendo del estado disponible sin tocar `main`.
2. Confirmar que la rama activa es la dedicada y conservar cualquier cambio previo del
   árbol de trabajo.
3. Crear en esa rama `docs/plan-a-evaluar.md` con este plan para revisión.
4. Implementar y validar solo dentro de esa rama; no hacer reset, checkout destructivo,
   amend ni revertir trabajo del otro agente.

## Decisiones pendientes de contenido

- Elegir el artefacto piloto; la opción más natural es **Eagle** por su minijuego de
  descenso y su explicación clara de gravedad, combustible y etapa de descenso.
- Definir el nombre/rol temporal del personaje placeholder.
- Seleccionar 3–5 hechos verificables que el diálogo y el quiz enseñarán, manteniendo
  sus fuentes NASA/NSSDCA visibles.

## Criterios de aceptación

- Se puede abrir una misión desde el museo y volver sin perder el estado del museo.
- Una misión completa puede terminarse con mouse/touch y teclado.
- El diálogo tiene al menos una bifurcación real y el quiz explica respuestas.
- Los objetivos y la insignia reflejan el progreso de la sesión.
- No se usan personajes finales ni se bloquea su futura integración.
- `npm/bun run build` sigue pasando y no aparecen errores de TypeScript.
- La experiencia conserva modo lectura/fallback y respeta reduced motion.
