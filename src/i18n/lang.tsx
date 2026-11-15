import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_LANG, type Lang } from './types';

const STORAGE_KEY = 'still-listening:lang';

const META: Record<Lang, { title: string; description: string; locale: string }> = {
  en: {
    title: 'Still Listening — The ones who keep listening',
    description:
      'Four machines NASA left on the Moon, Mars and deep space. They no longer transmit. Their stories do.',
    locale: 'en_US',
  },
  es: {
    title: 'Still Listening — Los que siguen escuchando',
    description:
      'Cuatro máquinas que la NASA dejó en la Luna, Marte y el espacio profundo. Ya no transmiten. Sus historias sí.',
    locale: 'es_ES',
  },
};

function readLang(): Lang {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'es' ? 'es' : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

/** Inglés por defecto; el español se guarda entre visitas. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = META[lang].title;
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute('content', META[lang].locale);

    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', META[lang].description);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', META[lang].description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', META[lang].title);
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute('content', META[lang].title);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute('content', META[lang].description);

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* modo privado: la preferencia dura la sesión */
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageValue {
  return useContext(LanguageContext);
}
