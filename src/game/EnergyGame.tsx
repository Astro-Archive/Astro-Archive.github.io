import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';

/**
 * Power budget for Opportunity during the 2018 storm.
 * Watt-hours and tau are the real values for each sol.
 * It cannot be won: the storm was bigger than any budget.
 * What is played is how much science gets home before the silence.
 */

const SOLS = [
  { label: 'Sol 5105', wh: 468, tau: 1.0 },
  { label: 'Sol 5106', wh: 345, tau: 2.1 },
  { label: 'Sol 5107', wh: 133, tau: 3.0 },
  { label: 'Sol 5111', wh: 22, tau: 10.8 },
];

const COST = { heat: 80, measure: 70, transmit: 90 } as const;
type Action = keyof typeof COST;

export function EnergyGame({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.focus();
  }, []);

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

  const ACTION_LABEL: Record<Action, string> = {
    heat: t.actionHeat,
    measure: t.actionMeasure,
    transmit: t.actionTransmit,
  };

  const act = (action: Action) => {
    if (!can(action)) return;
    setUsed((u) => [...u, action]);
    if (action === 'measure') {
      setPending((p) => p + 1);
      setLog((l) => [...l, t.logMeasured(SOLS[sol].label)]);
    }
    if (action === 'transmit') {
      const sending = pending;
      setSent((s) => s + sending);
      setPending(0);
      setLog((l) => [
        ...l,
        sending > 0 ? t.logTransmitted(SOLS[sol].label, sending) : t.logNothing(SOLS[sol].label),
      ]);
    }
    if (action === 'heat') {
      setLog((l) => [...l, t.logHeated(SOLS[sol].label)]);
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
      <div className="game game-energy" role="dialog" aria-modal="true" aria-label={t.energyAria}
      tabIndex={-1}
      ref={rootRef}>
        <header className="game-bar">
          <div>
            <p className="game-kicker">{t.endKicker}</p>
            <h2 className="game-title">{t.silenceTitle}</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            {t.backToMuseum}
          </button>
        </header>

        <div className="game-panel game-result is-loss energy-result">
          <p className="game-result-title">
            {t.energyResultTitle(sent, Math.max(total, 1))}
          </p>

          <p className="game-lead">{t.energyNoWay}</p>

          <p className="game-lesson">{t.energyLesson}</p>

          <div className="game-actions">
            <button type="button" className="game-cta" onClick={onClose}>
              {t.backToChapter}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = SOLS[sol];

  return (
    <div className="game game-energy" role="dialog" aria-modal="true" aria-label={t.energyAria}
      tabIndex={-1}
      ref={rootRef}>
      <header className="game-bar">
        <div>
          <p className="game-kicker">{t.energyKicker}</p>
          <h2 className="game-title">{t.energyTitle}</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          {t.backToMuseum}
        </button>
      </header>

      <div className="game-panel energy-panel">
        <div className="energy-sol">
          <div>
            <span className="energy-sol-label">{current.label}</span>
            <span className="energy-date">{t.solDates[sol]}</span>
          </div>
          <div className="energy-numbers">
            <span>{t.availableWh(left)}</span>
            <span>{t.opacity(current.tau)}</span>
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
            {t.battery}: <strong>{cold === 0 ? t.warm : t.cold}</strong>
          </span>
          <span>
            {t.unsent}: <strong>{pending}</strong>
          </span>
          <span>
            {t.sent}: <strong>{sent}</strong>
          </span>
        </div>

        <div className="energy-log">
          {log.slice(-4).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <button type="button" className="game-cta" onClick={endSol}>
          {t.endSol}
        </button>

        <p className="game-foot">{t.energyFoot}</p>
      </div>
    </div>
  );
}
