import { useEffect, useRef } from 'react';
import { ARTIFACTS } from '../data/artifacts';
import { INTERVIEWS } from './interviews';
import { completedInterviews, fragmentsFor, resetCatalog, totalFragments, useCatalog } from './catalog';
import { Portrait } from './Portrait';

interface CatalogProps {
  onClose: () => void;
  onInterview: (artifactId: string) => void;
}

export function Catalog({ onClose, onInterview }: CatalogProps) {
  const data = useCatalog();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const recovered = Object.values(data).reduce((sum, entry) => sum + entry.fragments.length, 0);
  const total = totalFragments();
  const done = completedInterviews(data);

  return (
    <div
      className="game catalog"
      role="dialog"
      aria-modal="true"
      aria-label="Catálogo de memoria"
      tabIndex={-1}
      ref={rootRef}
    >
      <header className="game-bar">
        <div>
          <p className="game-kicker">Catálogo de memoria</p>
          <h2 className="game-title">
            {recovered} de {total} fragmentos
          </h2>
          <p className="interview-subtitle">
            {done} de {ARTIFACTS.length} artefactos entrevistados
          </p>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          Volver al museo
        </button>
      </header>

      <div className="catalog-body">
        <ul className="catalog-list">
          {ARTIFACTS.map((artifact) => {
            const entry = data[artifact.id];
            const found = entry?.fragments ?? [];
            const possible = fragmentsFor(artifact.id);
            const interview = INTERVIEWS[artifact.id];

            return (
              <li key={artifact.id} className={`catalog-item ${found.length > 0 ? 'is-found' : ''}`}>
                <Portrait id={artifact.id} name={interview.speaker} />

                <div className="catalog-item-body">
                  <p className="catalog-item-name">{interview.entryTitle}</p>
                  <p className="catalog-item-count">
                    {found.length} de {possible} fragmentos
                  </p>

                  {found.length > 0 ? (
                    <ul className="catalog-fragments">
                      {found.map((fragment) => (
                        <li key={fragment}>{fragment}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="catalog-empty">Aún no has conectado con esta máquina.</p>
                  )}

                  <button
                    type="button"
                    className="catalog-connect"
                    onClick={() => onInterview(artifact.id)}
                  >
                    {found.length > 0 ? 'Volver a conectar' : 'Conectar'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="catalog-footer">
          <p>
            Cada conversación gasta cuatro unidades de señal. Lo que no se pregunta no se puede
            recuperar; el catálogo guarda lo que sí.
          </p>
          <button
            type="button"
            className="catalog-reset"
            onClick={() => {
              if (window.confirm('¿Borrar todo el catálogo de memoria?')) resetCatalog();
            }}
          >
            Borrar progreso
          </button>
        </div>
      </div>
    </div>
  );
}
