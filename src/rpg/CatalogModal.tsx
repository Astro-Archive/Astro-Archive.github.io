import { useEffect, useRef } from 'react';
import { artifactsFor } from '../data/artifacts';
import { interviewsFor } from './interviews';
import { completedInterviews, fragmentsFor, resetCatalog, totalFragments, useCatalog } from './catalog';
import { Portrait } from './Portrait';
import { LanguageSwitch } from '../ui/LanguageSwitch';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';

interface CatalogProps {
  onClose: () => void;
  onInterview: (artifactId: string) => void;
}

export function CatalogModal({ onClose, onInterview }: CatalogProps) {
  const { lang } = useLang();
  const t = uiFor(lang);
  const artifacts = artifactsFor(lang);
  const interviews = interviewsFor(lang);
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
      aria-label={t.catalogAria}
      tabIndex={-1}
      ref={rootRef}
    >
      <header className="game-bar">
        <div>
          <p className="game-kicker">{t.catalogKicker}</p>
          <h2 className="game-title">{t.catalogTitle(recovered, total)}</h2>
          <p className="interview-subtitle">{t.catalogSubtitle(done, artifacts.length)}</p>
        </div>
        <div className="game-bar-actions">
          <LanguageSwitch />
          <button type="button" className="ghost-button" onClick={onClose}>
            {t.backToMuseum}
          </button>
        </div>
      </header>

      <div className="catalog-body">
        <ul className="catalog-list">
          {artifacts.map((artifact) => {
            const entry = data[artifact.id];
            const found = entry?.fragments ?? [];
            const possible = fragmentsFor(artifact.id);
            const interview = interviews[artifact.id];

            return (
              <li key={artifact.id} className={`catalog-item ${found.length > 0 ? 'is-found' : ''}`}>
                <Portrait id={artifact.id} name={interview.speaker} />

                <div className="catalog-item-body">
                  <p className="catalog-item-name">{interview.entryTitle}</p>
                  <p className="catalog-item-count">{t.catalogCount(found.length, possible)}</p>

                  {found.length > 0 ? (
                    <ul className="catalog-fragments">
                      {found.map((fragmentId) => (
                        <li key={fragmentId}>
                          {interview.questions.find((q) => q.id === fragmentId)?.fragment?.text ??
                            fragmentId}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="catalog-empty">{t.catalogEmpty}</p>
                  )}

                  <button
                    type="button"
                    className="catalog-connect"
                    onClick={() => onInterview(artifact.id)}
                  >
                    {found.length > 0 ? t.catalogReconnect : t.catalogConnect}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="catalog-footer">
          <p>{t.catalogFooter}</p>
          <button
            type="button"
            className="catalog-reset"
            onClick={() => {
              if (window.confirm(t.catalogResetConfirm)) resetCatalog();
            }}
          >
            {t.catalogReset}
          </button>
        </div>
      </div>
    </div>
  );
}
