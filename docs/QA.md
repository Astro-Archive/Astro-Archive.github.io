# Registro de verificación

Qué se probó, cómo y con qué resultado. Todo reproducible con los scripts de `scripts/`.

**Entorno:** Chromium headless con render por software (`swiftshader`), Node 26, Arch Linux.
El render por software va a ~1,7 fps: sirve para verificar corrección, **no rendimiento**.

---

## 1. Build

| Comprobación | Comando | Resultado |
|---|---|---|
| Tipos | `npx tsc --noEmit` | 0 errores |
| Build de producción | `npx vite build` | correcto |
| Peso total de `dist/` | `du -sh dist` | 5,1 MB (3,6 MB son los GLB) |
| JS | — | 394 KB gzip |
| CSS | — | 4,9 KB gzip |

## 2. Navegación

`scripts/check.mjs` recorre las cuatro estaciones y lee la tarjeta visible.

| Viewport | Resultado |
|---|---|
| 1440×900 | `Eagle → Opportunity → Ingenuity → Dawn` ✓ |
| 390×844 (móvil) | `Eagle → Opportunity → Ingenuity → Dawn` ✓ |

Sin desbordamiento horizontal en ninguno de los dos (`scrollWidth <= innerWidth`).

## 3. Modo lectura

`check.mjs` abre el modo lectura y cuenta capítulos.

- 5 secciones: cuatro artefactos + epílogo. ✓
- Cada capítulo con minijuego incluye una explicación textual de lo que enseña,
  para que el contenido no dependa del 3D.

## 4. Minijuegos

`scripts/games.mjs` abre cada juego desde su tarjeta, interactúa y cierra.

| Comprobación | Resultado |
|---|---|
| Botón visible en la ficha de Eagle | ✓ `Intentar el aterrizaje` |
| Botón visible en la ficha de Opportunity | ✓ `Repartir la energía` |
| HUD del descenso (altitud, vertical, deriva, lateral, combustible) | ✓ 5 filas |
| Controles táctiles (← MOTOR →) | ✓ 3 botones |
| Acciones del juego de energía | ✓ calentar / medir / transmitir |
| Salto de sol con presupuesto real | ✓ Sol 5105 (468 Wh) → Sol 5106 (345 Wh) |
| Epílogo visible al final del scroll | ✓ |

## 5. Balance de la física

`scripts/balance.ts` simula estrategias con el **mismo módulo** que usa el juego
(`src/game/descentPhysics.ts`).

| Estrategia | Resultado | Combustible |
|---|---|---|
| No hacer nada | Falla (18,7 m/s) | 100 % |
| Frenar bajo −4 m/s | Falla (sin combustible) | 0 % |
| Frenar bajo −6 m/s | Falla (6,0 m/s) | 67 % |
| Perfil k=0,28 cap 5 | **Aterriza** | 10 % |
| Perfil k=0,35 cap 6 | **Aterriza** | 22 % |
| Perfil k=0,45 cap 7 | **Aterriza** | 31 % |
| Frenar bajo −18 m/s | Falla (18,0 m/s) | 99 % |

La banda ganable existe y las estrategias malas fallan. La primera versión de los
números hacía el juego **imposible**: lo detectó este script, no una persona jugando.

## 6. Partida completa de extremo a extremo

`scripts/pilot.mjs` juega leyendo el HUD y pulsando teclas reales.

```
FINAL {"alt":0,"vy":-1.1,"x":0.8,"vx":-1.3,"fuel":31,"result":"Tocaste suave."}
```

Aterrizó a −1,1 m/s dentro del círculo, con 31 % de combustible. El juego se puede
ganar con el teclado, no solo en la simulación.

## 7. Teclado y foco

`scripts/a11y.mjs` navega solo con teclado.

| Comprobación | Resultado |
|---|---|
| El botón del minijuego se alcanza con Tab | ✓ |
| Enter abre el minijuego | ✓ |
| El foco entra en el diálogo al abrir | ✓ |
| El fondo queda `inert` mientras el diálogo está abierto | ✓ |
| Tabulaciones que caen en el fondo inerte | **0 de 14** |
| Escape cierra y devuelve el foco al botón | ✓ `play-button` |

## 8. Consola

Cero errores en todas las ejecuciones: escritorio, móvil, modo lectura, minijuego de
descenso, minijuego de energía y epílogo.

> Nota: en una captura aislada el canvas salió negro. Se repitió tres veces y no volvió
> a ocurrir: es un artefacto del render por software al capturar entre frames, no del
> código.

## 9. Datos y assets

| Comprobación | Resultado |
|---|---|
| URLs de fuentes citadas (9) | todas devuelven `200` |
| GLB de NASA (4) | descargan y abren; 3,6 MB en total |
| Cifras del minijuego de descenso | verificadas contra el Apollo 11 Mission Report |
| Cifras del minijuego de energía | verificadas contra NASA/JPL y el equipo MER |

Detalle en `docs/DATOS.md`.

## 10. Límites de esta verificación

Sé lo que **no** está probado, y conviene decirlo antes de que lo pregunte el jurado:

- **No hay prueba en GPU real.** El render por software confirma corrección, no
  rendimiento. El presupuesto (`dpr` limitado, sin shadow maps, una sola pasada de
  postproceso) está pensado para móviles modestos, pero no se midió en uno.
- **No hay prueba en un teléfono físico.** El layout se verificó emulando 390×844.
- **El contenido está solo en español.** Es una decisión de alcance, no un olvido.
- **El video es material de apoyo**, no la presentación narrada: ver `docs/GUION-VIDEO.md`.
