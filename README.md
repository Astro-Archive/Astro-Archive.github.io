# Still Listening · Those Who Still Listen

> Four machines that NASA left on the Moon, on Mars, and in deep space.  
> They no longer transmit. Their stories still do.

An interactive 3D web experience built for the **2026 NASA Space Apps Challenge**, addressing the challenge:  
*"Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars"*.

Target audience: **Ages 10 to 14** and casual space enthusiasts worldwide.

---

## 👥 Development Team — Team Eclipse

Developed with dedication and passion for the **2026 NASA Space Apps Challenge**:

- **Leonardo Franco Vergaray Guarniz** ([@LeoFraaan](https://github.com/LeoFraaan))
- **Giovanni Silva** ([@GiovanniSilva14](https://github.com/GiovanniSilva14))
- **César Quiroz** ([@cesarquiroz9297](https://github.com/cesarquiroz9297))
- **Jose Francisco Arce Gonzalez** ([@0xincainsider](https://github.com/0xincainsider))

- **Event:** Universal Event — NASA Space Apps Challenge 2026
- **Challenge:** *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars*

---

## What It Is

An orbital museum traversed via interactive 3D navigation and timelines. The camera travels between four curated low-poly dioramas, where each machine is presented as a chapter structured into four distinct informational layers:

| Layer | Content |
|---|---|
| **What It Is** | Mass, power source, science instruments, launch & landing year |
| **Why It Went** | The primary scientific questions it set out to answer |
| **What It Found** | Groundbreaking discoveries that rewrote textbooks |
| **What It Is Now** | Final transmission, status, and where it rests today |

Each chapter features a **fictionalized voice** (a first-person monologue, explicitly labeled as such) and a real-time **signal meter**: `active → dormant → silent → lost`.

The strict boundary between **FACT** and **VOICE** is an intentional design choice: the narrative provides emotional connection, while verified telemetry and scientific records ground the facts. Each chapter cites its primary scientific sources.

### The Four Featured Relics

| # | Artifact | Location | Operational Span |
|---|---|---|---|
| 01 | **Eagle** — Apollo 11 Lunar Module (Descent Stage) | Sea of Tranquility, Moon | 1969 |
| 02 | **Opportunity** — MER-B Rover | Endeavour Crater, Mars | 2004–2018 |
| 03 | **Ingenuity** — Mars Helicopter | Jezero Crater, Mars | 2021–2024 |
| 04 | **Dawn** — Ion-Propelled Spacecraft | Ceres Orbit | 2007–2018 |

### Interactive Experiences & Minigames

1. **Space Shuttle Launch to Space (Cape Canaveral Pad 39B):**
   - Take the pilot controls of Space Shuttle Atlantis lifting off from Kennedy Space Center Pad 39B.
   - Ascend through atmospheric layers (Troposphere, Stratosphere, Mesosphere, Thermosphere, Exosphere).
   - Dynamic stage separations: Solid Rocket Boosters (SRBs) jettison at Max-Q and External Tank (ET) separation at MECO.
   - Multiple real-time camera views (`Cinematic Chase`, `Side Tracking`, `Top-Down Nadir`, and full `360° Free Look`).
   - Authentic NASA countdown and launch audio, real-time dynamic flight telemetry (altitude, velocity, dynamic pressure Q, G-forces), and historical fleet gallery (Atlantis, Discovery, Columbia, Endeavour, Challenger).
2. **Lunar Descent (Eagle):**
   - Teaches why the descent stage could never return to orbit: even with reserve propellant, returning requires a completely distinct ascent engine and dedicated fuel tanks.
3. **The Final Martian Winter (Opportunity):**
   - Teaches that the 2018 global dust storm was not a mechanical failure, but a depletion of the solar energy budget. The goal is managing available power to transmit as much science back home before shutdown.
4. **The Final Interview (Machine Dialogue RPG):**
   - Connect directly with each spacecraft with limited signal strength (4 signal units). Choose from 7 questions per relic; unspoken questions are lost forever. Surviving logs persist in the user's local memory catalog (`localStorage`).

---

## Languages (Bilingual Support)

The application starts in **English** by default. The **EN / ES** toggle located on the top HUD (and inside all overlay dialogs) immediately switches all UI labels, artifact dossiers, transcripts, dialogues, minigames, catalog entries, and reading mode text.  
User language preference is saved persistently in `localStorage` (`still-listening:lang`).

---

## How to Run

### Local Development

```bash
# Clone the repository
git clone https://github.com/Astro-Archive/Astro-Archive.github.io.git
cd Astro-Archive.github.io

# Install dependencies
npm install

# Start local dev server (default: http://localhost:5173)
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Deployment

The generated `dist/` folder is completely static and uses relative asset paths (`base: './'`), allowing deployment on any hosting service or subpath.

- **GitHub Pages:** Automatically deployed from the `main` branch via `.github/workflows/deploy.yml`. Served at the root organization domain: **https://astroarchive.earth/**.
- **Netlify:** Drag and drop the `dist/` directory into `app.netlify.com/drop`, or link to repository.
- **Vercel:** Run `npx vercel --prod` from the project root.

---

## Tech Stack & Architecture

```
Vite + React 19 + TypeScript
Three.js + @react-three/fiber + @react-three/drei
@react-three/postprocessing (Bloom + Vignette)
Pure modular CSS, zero heavy animation libraries (no GSAP, no Lenis)
Web Audio API with persistent sound toggles
```

- **Procedural Continuous Terrain:** An 11,520-polygon single continuous terrain mesh displaced via Value Noise + Fractional Brownian Motion (fBm) with vertex-blended transitions across lunar regolith, Martian oxide sands, and dark asteroidal rock.
- **Optimized Instanced Geometry:** 64 instanced dodecahedrons rendered in a single draw call.
- **Dynamic Dithered Sky:** Custom vertex and fragment sky shaders projecting smooth gradients onto a camera-following sphere.
- **Contact Shadows:** Procedural radial gradients painted onto canvases avoiding artifact shadow stretching.
- **Asset Normalization:** NASA GLB models are scaled, centered, and aligned to their respective ground contact planes automatically.

---

## Project Structure

```
docs/PLAN.md              Project roadmap and architectural decisions
docs/DATOS.md             Scientific figures and primary NASA citations
docs/QA.md                Verification checklists and test plans
public/models/*.glb       Authentic 3D models from NASA 3D Resources
public/sfx/               Digitized NASA audio transcripts, countdowns, and UI sound effects
src/
  i18n/
    lang.tsx              Language context provider (EN / ES) and metadata sync
    ui.ts                 Bilingual user interface strings
  data/
    artifacts.ts          Core dataset: coordinates, telemetry, cameras, and biographies
    artifacts.en.ts       English localized text layer
    epilogue.ts           Bilingual epilogue narrative
  game/
    LaunchGame.tsx        Space Shuttle launch simulator (Pad 39B to Orbit)
    CapeCanaveralPad.tsx  Satellite-mapped launchpad environment
    SpaceShuttleModel.tsx Modular 3D shuttle stack (Orbiter, External Tank, SRBs)
    DescentGame.tsx       Apollo 11 lunar descent simulator
    EnergyGame.tsx        Opportunity solar budget simulator
  rpg/
    InterviewGame.tsx     Spacecraft interactive dialogue RPG
    InterviewScene.tsx    Focused low-poly relic diorama
    catalog.ts            Persistent memory archive (localStorage)
  scene/
    Experience.tsx        Main Three.js scene composer and lighting
    CameraRig.tsx         Catmull-Rom spline camera rig with responsive aspect ratio adaptors
    Cosmos.tsx            Atmospheric horizon, fog, and starfield
    World.tsx             Continuous seamless terrain with procedural rocks
    Station.tsx           Exhibition lighting, dust motes, and pedestal rings
    ArtifactModel.tsx     GLB loader, bounding normalizer, and realistic PBR materials
  ui/
    ChapterCard.tsx       Interactive chapter dossier card
    Timeline.tsx          Bottom timeline controller
    ReadingMode.tsx       Accessible non-WebGL editorial layout
    LanguageSwitch.tsx    Persistent EN / ES selector
    SignalMeter.tsx       Status indicator
```

---

## Data Sources & Accuracy

All telemetry and historical context are sourced from official archives:

- **NASA NSSDCA** (`nssdc.gsfc.nasa.gov`) — Master catalog of spacecraft and experiments.
- **NASA Science & Mission Archives** (`science.nasa.gov`) — Primary mission logs and findings.
- **NASA 3D Resources** (`science.nasa.gov/3d-resources`) — Official spacecraft models.

### Historical Precision Notes

- *"My battery is low and it's getting dark"* was **not** an automated transmission from Opportunity: it was a poetic paraphrasing of the rover's final power telemetry by science journalist Jacob Margolis (JPL). The project explicitly highlights this distinction.
- **Ingenuity** did not crash: a forced emergency landing in low-texture terrain caused a rotor tip strike (confirmed January 2024).
- **Dawn** did not crash into Ceres: it remains in an uncontrolled, stable perpetual orbit around the dwarf planet following hydrazine fuel depletion in 2018.
- **Apollo 11**: Only the **descent stage** remains on the lunar surface. The ascent stage lifted off with the crew and later impacted the Moon.

---

## Accessibility & Performance

- **Semantic DOM:** All text, numbers, and narratives exist in real semantic DOM elements for full screen reader accessibility.
- **Non-WebGL Reading Mode:** Full article-style reading mode that operates cleanly without WebGL and serves as an automatic graceful fallback.
- **`prefers-reduced-motion`:** Respects user operating system preferences by disabling camera drift, floating animations, and particle sparkle loops.
- **Full Keyboard Navigation:** Complete navigation via `ArrowLeft` / `ArrowRight` and `Tab` with visible focus rings. Focus is safely trapped inside modal dialogs and restored on exit.
- **Adaptive Camera Rig:** Intelligently zooms and reframes vertical viewports on mobile devices so models and text cards remain in clear view.

---

## Credits & License

- **3D Models & Audio:** Courtesy of NASA 3D Resources and NASA open public archives.
- **Code & Creative Writing:** Developed by **Team Eclipse** for the 2026 NASA Space Apps Challenge.
- **License:** Licensed under the [MIT License](LICENSE).
