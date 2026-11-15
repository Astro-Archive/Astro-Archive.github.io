import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';

export function Loader({ progress, done }: { progress: number; done: boolean }) {
  const { lang } = useLang();
  const t = uiFor(lang);

  return (
    <div className={`loader ${done ? 'is-done' : ''}`} aria-live="polite">
      <div className="loader-inner">
        <p className="loader-kicker">{t.loaderKicker}</p>
        <h1 className="loader-title">Still Listening</h1>
        <p className="loader-sub">{t.brandSub}</p>

        <div className="loader-track">
          <span style={{ transform: `scaleX(${Math.min(1, progress / 100)})` }} />
        </div>
        <p className="loader-count">{Math.round(progress)}%</p>

        <p className="loader-note">{t.loaderNote}</p>
      </div>
    </div>
  );
}
