import { useState } from 'react';

interface ShuttleDossier {
  id: string;
  name: string;
  callsign: string;
  designation: string;
  image: string;
  flights: number;
  timeInSpace: string;
  distance: string;
  firstFlight: string;
  lastFlight: string;
  summary: { en: string; es: string };
  highlights: { en: string[]; es: string[] };
}

const FLEET: ShuttleDossier[] = [
  {
    id: 'atlantis',
    name: 'Atlantis',
    callsign: 'OV-104',
    designation: 'Space Shuttle Atlantis',
    image: 'textures/shuttle-atlantis.jpg',
    flights: 33,
    timeInSpace: '306d 14h 12m',
    distance: '202,673,974 km',
    firstFlight: 'STS-51-J (03/10/1985)',
    lastFlight: 'STS-135 (08/07/2011) · Final Program Mission',
    summary: {
      en: 'The definitive space shuttle. Atlantis flew the historic final mission of the 30-year Space Shuttle Program (STS-135), delivering critical cargo to the ISS and concluding an era of reusable winged spaceplanes.',
      es: 'El transbordador definitivo. Atlantis protagonizó el histórico vuelo final de los 30 años del Programa del Transbordador Espacial (STS-135), reabasteciendo la Estación Espacial Internacional y cerrando una era legendaria de exploración tripulada.',
    },
    highlights: {
      en: [
        'Launched Magellan probe to Venus and Galileo to Jupiter (1989)',
        'First shuttle to dock with the Russian Mir space station (STS-71, 1995)',
        'Delivered the European Columbus laboratory and US Destiny lab to the ISS',
        'Flew the final Hubble servicing mission (STS-125, 2009)',
      ],
      es: [
        'Lanzó las sondas interplanetarias Magallanes (Venus) y Galileo (Júpiter) en 1989',
        'Primer transbordador en acoplarse a la estación espacial rusa Mir (STS-71, 1995)',
        'Instaló el laboratorio europeo Columbus y el laboratorio estadounidense Destiny en la ISS',
        'Realizó la última y triunfal misión de reparación del Telescopio Hubble (STS-125, 2009)',
      ],
    },
  },
  {
    id: 'discovery',
    name: 'Discovery',
    callsign: 'OV-103',
    designation: 'Space Shuttle Discovery',
    image: 'textures/shuttle-discovery.jpg',
    flights: 39,
    timeInSpace: '365d 22h 39m',
    distance: '238,539,663 km',
    firstFlight: 'STS-41-D (30/08/1984)',
    lastFlight: 'STS-133 (24/02/2011)',
    summary: {
      en: 'The champion workhorse of the fleet. Discovery flew more spaceflights (39) and carried more astronauts to orbit than any other spacecraft in human history.',
      es: 'El corcel invicto de la flota. Discovery ostenta el récord absoluto de la historia espacial: 39 misiones orbitales exitosas, habiendo transportado a más astronautas que cualquier otra nave espacial jamás construida.',
    },
    highlights: {
      en: [
        'Deployed the revolutionary Hubble Space Telescope into orbit (STS-31, 1990)',
        'Returned legendary astronaut John Glenn to orbit at age 77 (STS-95, 1998)',
        'Served as the return-to-flight vehicle after both Challenger and Columbia tragedies',
        'Docked with Mir and delivered the Japanese Kibo laboratory module to the ISS',
      ],
      es: [
        'Desplegó el revolucionario Telescopio Espacial Hubble en órbita (STS-31, 1990)',
        'Llevó al legendario pionero John Glenn de regreso al cosmos a sus 77 años (STS-95, 1998)',
        'Elegido como vehículo de retorno seguro tras las tragedias de Challenger y Columbia',
        'Completó el ensamblaje de la ISS transportando el gigantesco módulo japonés Kibo',
      ],
    },
  },
  {
    id: 'columbia',
    name: 'Columbia',
    callsign: 'OV-102',
    designation: 'Space Shuttle Columbia',
    image: 'textures/shuttle-columbia.jpg',
    flights: 28,
    timeInSpace: '300d 17h 40m',
    distance: '201,497,772 km',
    firstFlight: 'STS-1 (12/04/1981) · Maiden Flight',
    lastFlight: 'STS-107 (16/01/2003)',
    summary: {
      en: 'The pioneer that proved reusable spaceflight was possible. Columbia was the first space-rated orbiter to fly into the cosmos, debuting with the iconic white-painted External Tank.',
      es: 'La pionera que demostró que el vuelo espacial reutilizable era una realidad. Columbia fue la primera nave en volar al cosmos el 12 de abril de 1981, inaugurando la era con su recordado Tanque Externo blanco.',
    },
    highlights: {
      en: [
        'First manned spaceflight test of the Space Transportation System (STS-1)',
        'Carried Spacelab science modules for dedicated microgravity biology & physics research',
        'Deployed the Chandra X-Ray Observatory into high Earth orbit (STS-93, 1999)',
        'First flight commanded by a woman, Colonel Eileen Collins',
      ],
      es: [
        'Primer vuelo tripulado de prueba orbital de la historia del Shuttle (STS-1, John Young y Bob Crippen)',
        'Transportó el laboratorio Spacelab para cientos de experimentos biológicos y físicos en gravedad cero',
        'Puso en órbita el Observatorio Espacial de Rayos X Chandra (STS-93, 1999)',
        'Primer transbordador comandado por una mujer en el espacio (Coronel Eileen Collins)',
      ],
    },
  },
  {
    id: 'fleet',
    name: 'The 5 Orbiters',
    callsign: 'FLEET',
    designation: 'The Complete NASA Space Shuttle Fleet',
    image: 'textures/shuttle-fleet.jpg',
    flights: 135,
    timeInSpace: '1,334 days in orbit',
    distance: '872,906,370 km',
    firstFlight: '1981 (STS-1 Columbia)',
    lastFlight: '2011 (STS-135 Atlantis)',
    summary: {
      en: 'A side-by-side comparison of all five space-flown orbiters: Columbia, Challenger, Discovery, Atlantis, and Endeavour. Each possessed unique thermal tile patterns, payload capabilities, and wing insignias.',
      es: 'Comparativa visual directa de los 5 transbordadores que volaron al espacio: Columbia, Challenger, Discovery, Atlantis y Endeavour. Cada uno poseía variantes únicas en sus baldosas térmicas, rótulos de alas y bahías de carga.',
    },
    highlights: {
      en: [
        'Together launched 355 individual astronauts representing 16 nations',
        'Constructed the International Space Station module by module in orbit',
        'Maintained and upgraded the Hubble Space Telescope over five dedicated missions',
        'Achieved 133 successful returns from orbital velocity (28,000 km/h) through re-entry heat',
      ],
      es: [
        'En conjunto llevaron a 355 astronautas individuales de 16 naciones al cosmos',
        'Construyeron la Estación Espacial Internacional pieza a pieza en gravedad cero',
        'Mantuvieron vivo y actualizaron el Telescopio Hubble en 5 misiones heroicas de caminata espacial',
        'Lograron 133 reingresos atmosféricos hipersónicos exitosos a más de 28,000 km/h y 1,600°C',
      ],
    },
  },
];

interface ShuttleGalleryModalProps {
  onClose: () => void;
  lang: 'en' | 'es';
}

export function ShuttleGalleryModal({ onClose, lang }: ShuttleGalleryModalProps) {
  const [selectedId, setSelectedId] = useState<string>('atlantis');
  const isEs = lang === 'es';

  const item = FLEET.find((s) => s.id === selectedId) || FLEET[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(12px)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          background: '#090d16',
          border: '1px solid #0284c7',
          borderRadius: '12px',
          boxShadow: '0 0 35px rgba(2, 132, 199, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'monospace',
          color: '#e2e8f0',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '1px solid #1e293b',
            background: 'linear-gradient(90deg, #0f172a 0%, #0369a1 100%)',
          }}
        >
          <div>
            <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#38bdf8', textTransform: 'uppercase' }}>
              // NASA ARCHIVES · SPACE TRANSPORTATION SYSTEM (STS) //
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
              {isEs ? 'ARCHIVO HISTÓRICO DE TRANSBORDADORES' : 'HISTORIC SHUTTLE FLEET DOSSIER'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: 'transparent',
              border: '1px solid #64748b',
              borderRadius: '6px',
              color: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            [ CERRAR / ESC ]
          </button>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #1e293b',
            background: '#0b1120',
            overflowX: 'auto',
          }}
        >
          {FLEET.map((s) => {
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                style={{
                  padding: '12px 20px',
                  fontSize: '12px',
                  fontWeight: active ? 800 : 600,
                  fontFamily: 'monospace',
                  letterSpacing: '0.08em',
                  background: active ? '#0284c7' : 'transparent',
                  color: active ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.name.toUpperCase()} {s.callsign ? `(${s.callsign})` : ''}
              </button>
            );
          })}
        </div>

        {/* Dossier Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: '24px',
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          {/* Left: Authentic Photo */}
          <div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #1e293b',
                background: '#000000',
                aspectRatio: item.id === 'fleet' ? '16/9' : '3/4',
                maxHeight: '420px',
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: item.id === 'fleet' ? 'contain' : 'cover',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '8px 12px',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  fontSize: '11px',
                  color: '#e2e8f0',
                }}
              >
                {item.designation} · Kennedy Space Center
              </div>
            </div>
          </div>

          {/* Right: Technical Stats & History */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>{item.callsign}</span>
              <h4 style={{ margin: '2px 0 8px', fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                {item.name}
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                {isEs ? item.summary.es : item.summary.en}
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginBottom: '18px',
              }}
            >
              <div style={{ padding: '8px 12px', background: '#0b1120', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{isEs ? 'MISIONES VOLADAS' : 'MISSIONS'}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>{item.flights}</div>
              </div>
              <div style={{ padding: '8px 12px', background: '#0b1120', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{isEs ? 'TIEMPO EN ÓRBITA' : 'TIME IN ORBIT'}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>{item.timeInSpace}</div>
              </div>
              <div style={{ padding: '8px 12px', background: '#0b1120', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{isEs ? 'PRIMER VUELO' : 'FIRST FLIGHT'}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9' }}>{item.firstFlight}</div>
              </div>
              <div style={{ padding: '8px 12px', background: '#0b1120', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{isEs ? 'DISTANCIA TOTAL' : 'TOTAL DISTANCE'}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9' }}>{item.distance}</div>
              </div>
            </div>

            {/* Key Historical Milestones */}
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                {isEs ? '// HITOS PRINCIPALES' : '// KEY MILESTONES'}
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.7' }}>
                {(isEs ? item.highlights.es : item.highlights.en).map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
