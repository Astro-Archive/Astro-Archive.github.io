# Verificación de datos

Cada afirmación de la app, con su fuente. Si un dato no aparece aquí, no entra en el relato.

Fuentes primarias:

- **NSSDCA** — `https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=<ID>`
- **NASA Science / NASA.gov** — páginas de misión.

---

## 01 · Eagle — Apolo 11, etapa de descenso

| Afirmación en la app | Valor | Fuente |
|---|---|---|
| Altura con patas desplegadas | 7,04 m | NSSDCA, Apollo 11 LM |
| Masa al despegar de la Tierra | ~15.100 kg (ascenso + descenso) | NSSDCA, Apollo 11 LM |
| Fecha y lugar del alunizaje | 20 jul 1969, Mar de la Tranquilidad | NASA, Apollo 11 |
| Muestras devueltas | 21,55 kg | NASA, Apollo 11 |
| Retrorreflector aún en uso | Sí — láseres desde estaciones terrestres | NASA, Lunar Laser Ranging |
| Sismómetro del Apolo 11 | Falló a las ~3 semanas por sobrecalentamiento | NASA, EASEP |
| Sismómetros posteriores | Operaron hasta 1977 | NASA, ALSEP |
| Destino de la etapa de ascenso | Despegó y luego impactó la Luna | NASA |

**Nota de la ficha:** el modelo GLB muestra el módulo completo; en la superficie solo quedó
la etapa de descenso.

---

## 02 · Opportunity — MER-B

| Afirmación en la app | Valor | Fuente |
|---|---|---|
| Masa | 185 kg | NASA, MER |
| Aterrizaje | Enero 2004, bolsa de aire, ~26 rebotes | NASA, MER |
| Distancia recorrida | 45,16 km | NASA/JPL, odometría final |
| Distancia de diseño | 600 m | NASA, MER |
| Minerales hallados | Hematita ("arándanos") y jarosita | NASA, MER |
| Última comunicación | 10 jun 2018 | NASA |
| Intentos de recuperación | Más de mil comandos hasta feb 2019 | NASA |

**Nota de la ficha:** *"My battery is low and it's getting dark"* **no fue una transmisión**.
Es una paráfrasis de Jacob Margolis (JPL) sobre la telemetría. Aparece citada como
advertencia, nunca como cita del rover.

---

## 03 · Ingenuity — Mars Helicopter

| Afirmación en la app | Valor | Fuente |
|---|---|---|
| Masa | 1,8 kg | NASA |
| Régimen del rotor | ~2.400 rpm | NASA |
| Primer vuelo | 19 abr 2021 | NASA |
| Vuelos totales | 72 | NASA |
| Distancia total | 17 km | NASA |
| Tiempo total de vuelo | 128,8 min | NASA |
| Densidad atmosférica marciana | ~1 % de la terrestre | NASA |
| Último vuelo | 18 ene 2024 | NASA |
| Daño | Pala del rotor dañada en aterrizaje de emergencia | NASA, anuncio 25 ene 2024 |

**Nota de la ficha:** no se estrelló. Un aterrizaje forzoso dañó una pala.

---

## 04 · Dawn

| Afirmación en la app | Valor | Fuente |
|---|---|---|
| Masa al lanzamiento | 1.217,7 kg | NSSDCA, Dawn |
| Velocidad de escape de iones | ~30,7 km/s ≈ 110.000 km/h | NASA, propulsión iónica NSTAR |
| Cuerpos orbitados | Vesta y Ceres — primera nave en orbitar dos | NASA, Dawn |
| Vesta | Protoplaneta | NASA, Dawn |
| Ceres | Agua helada, sales, interior diferenciado | NASA, Dawn |
| Fin de misión | 1 nov 2018, sin propelente | NASA, Dawn |
| Estado actual | Órbita estable alrededor de Ceres | NASA, Dawn |

**Nota de la ficha:** no se estrelló ni regresó.

---

## Errores que el proyecto evita a propósito

| Error frecuente | Realidad |
|---|---|
| "Opportunity transmitió *mi batería está baja y está oscureciendo*" | Es una paráfrasis humana de la telemetría, no un mensaje del rover. |
| "Ingenuity se estrelló" | Aterrizaje de emergencia con daño de pala; quedó entero y de pie. |
| "Dawn se estrelló en Ceres" | Sigue en órbita, sin combustible, desde 2018. |
| "Apolo 11 dejó el módulo lunar completo" | Solo la etapa de descenso; la de ascenso despegó y luego impactó. |
| "Los sismómetros del Apolo escucharon la Luna desde 1969" | El del Apolo 11 falló a las semanas; los de las misiones siguientes operaron hasta 1977. |
| "Surveyor 3 fue visitado por Apolo 12" (dato cierto, no usado) | Se descartó por falta de modelo 3D oficial. |

---

## Modelos 3D

Todos de **NASA 3D Resources** (`science.nasa.gov/3d-resources`), espejo en
`github.com/nasa/NASA-3D-Resources`:

| Archivo local | Ruta en el repositorio de NASA | Tamaño |
|---|---|---|
| `lunar-module.glb` | `3D Models/Apollo Lunar Module/` | 717 KB |
| `opportunity.glb` | `3D Models/Mars Exploration Rover - Opportunity (MER-B)/` | 37 KB |
| `ingenuity.glb` | `3D Models/Ingenuity Mars Helicopter/` | 2,0 MB |
| `dawn.glb` | `3D Models/Dawn/` | 927 KB |

Uso permitido con acreditación y sin sugerir endorsement de NASA.
