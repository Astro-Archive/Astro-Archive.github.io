import { useId } from 'react';
import { useLang } from '../i18n/lang';
import { uiFor } from '../i18n/ui';
import type { Lang } from '../i18n/types';

const LANGS: Array<{ code: Lang; short: string }> = [
  { code: 'en', short: 'EN' },
  { code: 'es', short: 'ES' },
];

/**
 * Selector de idioma. Inglés por defecto y español a un clic, con radios
 * reales para que funcione con teclado y lectores de pantalla.
 */
export function LanguageSwitch() {
  const { lang, setLang } = useLang();
  const t = uiFor(lang);
  const group = useId();

  return (
    <fieldset className="lang-switch">
      <legend className="visually-hidden">{t.language}</legend>
      {LANGS.map(({ code, short }) => (
        <label key={code} className={`lang-option ${lang === code ? 'is-on' : ''}`}>
          <input
            type="radio"
            name={`site-language-${group}`}
            value={code}
            checked={lang === code}
            onChange={() => setLang(code)}
            aria-label={code === 'en' ? t.english : t.spanish}
          />
          <span aria-hidden="true">{short}</span>
        </label>
      ))}
    </fieldset>
  );
}
