# Texto de entrega — 2026 NASA Space Apps Challenge

Copiar y pegar en el formulario del evento. Ajustar el link cuando esté desplegado.

---

## Nombre del proyecto

**Still Listening · Los que siguen escuchando**

## Una línea

Un museo orbital en 3D, recorrible con scroll, que cuenta la historia de cuatro máquinas
que la NASA dejó en la Luna, en Marte y en el espacio profundo.

## Descripción corta (para la tarjeta)

Cuatro artefactos. Cuatro lugares. Cincuenta y cinco años de ciencia. *Still Listening*
convierte el hardware abandonado de la NASA en una experiencia 3D navegable para
chicos de 10 a 14 años: cada máquina cuenta qué era, por qué fue, qué descubrió y qué
es ahora.

## Descripción larga

Desde 1969, la NASA ha dejado hardware en la Luna, en Marte y en el espacio profundo.
Los libros escolares hablan de las misiones activas; casi nunca de las que ya callaron.

*Still Listening* es una web app 3D que se recorre con scroll. La cámara viaja entre
cuatro dioramas low-poly y se detiene en cada artefacto:

1. **Eagle**, la etapa de descenso del módulo lunar del Apolo 11, todavía en el Mar de la
   Tranquilidad, con un retrorreflector que sigue devolviendo láseres desde la Tierra.
2. **Opportunity**, diseñada para 90 días marcianos, que trabajó casi 15 años y recorrió
   45,16 km antes de que una tormenta de polvo la dejara sin sol.
3. **Ingenuity**, la primera aeronave en volar en otro mundo: 72 vuelos hasta que una pala
   se dañó contra el suelo de Jezero.
4. **Dawn**, en órbita alrededor de Ceres desde 2018, sin combustible y sin señal.

Cada capítulo tiene la misma estructura —**qué es**, **por qué fue**, **qué encontró**,
**qué es ahora**— y una **voz ficcionalizada** en primera persona, siempre etiquetada
como tal. Los datos duros están separados del relato y cada ficha enlaza sus fuentes
(NSSDCA y páginas de misión de NASA).

Un **medidor de señal** (`activo → durmiente → silencioso → perdido`) recorre toda la
experiencia como motivo visual y recuerda, sin decirlo, que estas máquinas ya no
transmiten.

### Dos minijuegos, no dos juegos

El brief pide *"mostrar cómo operaban estas misiones, no enumerar datos"*. Por eso dos
capítulos incluyen una mecánica de veinte segundos:

- **Descenso lunar** (Eagle): pilotas la última fase del aterrizaje con gravedad lunar real
  (1,62 m/s²) y combustible finito. Al terminar entiendes por qué la etapa de descenso se
  quedó: aunque te sobre combustible, volver a la órbita necesitaba otro motor y otro tanque.
- **El último invierno** (Opportunity): repartes los vatios-hora reales de los últimos
  cuatro soles (468, 345, 133 y 22 Wh) entre calentar, medir y transmitir. No se puede
  ganar: la tormenta era más grande que cualquier presupuesto. Se juega cuánta ciencia
  llega a casa antes del silencio.

### La última entrevista

Cada artefacto se puede **entrevistar**. Cuatro unidades de señal, siete preguntas
posibles: no alcanzan para todas. Cada respuesta gasta una unidad y revela un fragmento
de memoria; al llegar a cero la luz del artefacto se apaga y se guarda lo que alcanzaste
a oír. Lo que no preguntaste se pierde.

Es la pieza que convierte la visita en algo personal: el visitante no recibe la historia,
la **rescata**.

### Cierre

El epílogo conecta el pasado con el presente: en 1969 dejamos un módulo porque no podía
volver; en 2021 dejamos tubos de muestra a propósito, para que alguien vuelva a buscarlos.
Lo que separa la basura del patrimonio es si alguien recuerda dónde está.

### Por qué funciona para 10-14 años

- Una idea por capítulo. Sin muros de texto.
- El dato llega después de la emoción, no antes.
- Navegación por scroll, timeline clicable y teclado: no hay que aprender nada.
- Modo lectura sin 3D para quien no puede o no quiere usar WebGL.

### Rigor

El proyecto evita activamente los errores habituales de este tema:

- *"My battery is low and it's getting dark"* **no fue una transmisión de Opportunity**;
  es una paráfrasis de un ingeniero del JPL, y así se indica en la ficha.
- Ingenuity no se estrelló: un aterrizaje de emergencia dañó una pala del rotor.
- Dawn no regresó ni impactó: sigue en órbita alrededor de Ceres.
- El modelo de Apolo 11 muestra el módulo completo; la ficha aclara que en la superficie
  quedó solo la etapa de descenso.

### Tecnología

Vite + React + TypeScript + three.js (react-three-fiber). Todos los modelos son GLB
oficiales de **NASA 3D Resources**. El terreno, las rocas, el cielo y las sombras están
generados por código: sin modelado manual y sin dependencias pesadas. 4,9 MB totales,
sin WebGL obligatorio.

## Categoría / dificultad

Intermediate · Beginner/Youth

## Temas

Astrophysics · Planets & Moons · Space Exploration

## Link del proyecto

_(pegar URL pública)_

## Repositorio

_(pegar URL del repo)_

## Video

_(pegar link del video de 60 s)_

## Créditos

- Modelos 3D: **NASA 3D Resources / NASA**.
- Datos: **NSSDCA** y páginas de misión de **NASA Science**.
- NASA no patrocina ni respalda este proyecto. NASA es la fuente de los modelos y de los
  datos citados.
