import { useState } from 'react';

/**
 * Presupuesto de energía de Opportunity durante la tormenta de 2018.
 * Los vatios-hora y el tau son los reales de cada sol.
 * No se puede ganar: la tormenta era más grande que cualquier presupuesto.
 * Lo que se juega es cuánta ciencia llega a casa antes del silencio.
 */

const SOLS = [
  { label: 'Sol 5105', date: '3 de junio de 2018', wh: 468, tau: 1.0 },
  { label: 'Sol 5106', date: '4 de junio de 2018', wh: 345, tau: 2.1 },
  { label: 'Sol 5107', date: '6 de junio de 2018', wh: 133, tau: 3.0 },
  { label: 'Sol 5111', date: '10 de junio de 2018', wh: 22, tau: 10.8 },
];

const COST = { heat: 80, measure: 70, transmit: 90 } as const;
type Action = keyof typeof COST;

const ACTION_LABEL: Record<Action, string> = {
  heat: 'Calentar la batería',
  measure: 'Tomar una medición',
  transmit: 'Transmitir a la Tierra',
};

export function EnergyGame({ onClose }: { onClose: () => void }) {
  const [sol, setSol] = useState(0);
  const [budget, setBudget] = useState(SOLS[0].wh);
  const [pending, setPending] = useState(0);
  const [sent, setSent] = useState(0);
  const [cold, setCold] = useState(0);
  const [used, setUsed] = useState<Action[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [over, setOver] = useState(false);

  const spent = used.reduce((sum, action) => sum + COST[action], 0);
  const left = budget - spent;
  const can = (action: Action) => left >= COST[action] && !used.includes(action);

  const act = (action: Action) => {
    if (!can(action)) return;
    setUsed((u) => [...u, action]);
    if (action === 'measure') {
      setPending((p) => p + 1);
      setLog((l) => [...l, `${SOLS[sol].label}: medición guardada en memoria.`]);
    }
    if (action === 'transmit') {
      const sending = pending;
      setSent((s) => s + sending);
      setPending(0);
      setLog((l) => [
        ...l,
        sending > 0
          ? `${SOLS[sol].label}: ${sending} dato${sending > 1 ? 's' : ''} enviado${sending > 1 ? 's' : ''} a la Tierra.`
          : `${SOLS[sol].label}: la antena se encendió, pero no había nada que enviar.`,
      ]);
    }
    if (action === 'heat') {
      setLog((l) => [...l, `${SOLS[sol].label}: batería caliente, los instrumentos aguantan.`]);
    }
  };

  const endSol = () => {
    const heated = used.includes('heat');
    const nextCold = heated ? 0 : cold + 1;
    setCold(nextCold);
    setUsed([]);

    if (nextCold >= 2) {
      setOver(true);
      return;
    }
    if (sol + 1 >= SOLS.length) {
      setOver(true);
      return;
    }
    setSol(sol + 1);
    setBudget(SOLS[sol + 1].wh);
  };

  if (over) {
    const total = sent + pending;
    return (
      <div className="game game-energy" role="dialog" aria-modal="true" aria-label="El último invierno de Opportunity">
        <header className="game-bar">
          <div>
            <p className="game-kicker">Fin de la misión</p>
            <h2 className="game-title">Silencio</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Volver al museo
          </button>
        </header>

        <div className="game-panel game-result is-loss energy-result">
          <p className="game-result-title">
            Enviaste <strong>{sent}</strong> de {Math.max(total, 1)} datos a casa.
          </p>

          <p className="game-lead">
            No había forma de ganar y eso es lo importante: la tormenta era más grande que cualquier
            presupuesto de energía. Con 22 vatios-hora no se calienta una batería ni se enciende una
            antena.
          </p>

          <p className="game-lesson">
            El 10 de junio de 2018, Opportunity transmitió por última vez. En ese mensaje iba una
            medición: la opacidad de la atmósfera marciana había llegado a <strong>10,8</strong>, el
            valor más alto jamás medido en Marte. La NASA la llamó más de mil veces durante ocho meses.
            Nunca respondió.
          </p>

          <div className="game-actions">
            <button type="button" className="game-cta" onClick={onClose}>
              Volver al capítulo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = SOLS[sol];

  return (
    <div className="game game-energy" role="dialog" aria-modal="true" aria-label="El último invierno de Opportunity">
      <header className="game-bar">
        <div>
          <p className="game-kicker">El último invierno</p>
          <h2 className="game-title">Presupuesto de energía</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          Volver al museo
        </button>
      </header>

      <div className="game-panel energy-panel">
        <div className="energy-sol">
          <div>
            <span className="energy-sol-label">{current.label}</span>
            <span className="energy-date">{current.date}</span>
          </div>
          <div className="energy-numbers">
            <span>
              <strong>{left}</strong> Wh disponibles
            </span>
            <span>
              opacidad <strong>{current.tau}</strong>
            </span>
          </div>
        </div>

        <div className="energy-actions">
          {(Object.keys(COST) as Action[]).map((action) => (
            <button
              key={action}
              type="button"
              className={`energy-action ${used.includes(action) ? 'is-done' : ''}`}
              onClick={() => act(action)}
              disabled={!can(action)}
            >
              <span className="energy-action-name">{ACTION_LABEL[action]}</span>
              <span className="energy-cost">{COST[action]} Wh</span>
            </button>
          ))}
        </div>

        <div className="energy-state">
          <span>
            Batería: <strong>{cold === 0 ? 'templada' : 'fría'}</strong>
          </span>
          <span>
            Datos sin enviar: <strong>{pending}</strong>
          </span>
          <span>
            Enviados: <strong>{sent}</strong>
          </span>
        </div>

        <div className="energy-log">
          {log.slice(-4).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <button type="button" className="game-cta" onClick={endSol}>
          Terminar el sol
        </button>

        <p className="game-foot">
          Si pasas un sol sin calentar la batería, el frío la daña. Dos soles seguidos y la misión
          termina.
        </p>
      </div>
    </div>
  );
}
