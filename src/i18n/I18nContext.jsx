import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import en from './en.json';
import ur from './ur.json';
import { i18nReducer } from './i18nReducer.js';

const dictionaries = { en, ur };
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [state, dispatch] = useReducer(i18nReducer, null, () => {
    const savedLanguage = localStorage.getItem('civiclens-language') || 'en';
    const language = dictionaries[savedLanguage] ? savedLanguage : 'en';
    const direction = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    return { language, direction };
  });
  const { language, direction } = state;

  const changeLanguage = useCallback((nextLanguage) => {
    const next = dictionaries[nextLanguage] ? nextLanguage : 'en';
    localStorage.setItem('civiclens-language', next);
    const nextDirection = next === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
    document.documentElement.dir = nextDirection;
    dispatch({ type: 'language', language: next, direction: nextDirection });
  }, []);

  const changeDirection = useCallback((nextDirection) => {
    const next = nextDirection === 'rtl' ? 'rtl' : 'ltr';
    document.documentElement.dir = next;
    dispatch({ type: 'direction', direction: next });
  }, []);

  const t = useCallback(
    (key, vars = {}) => {
      const message = key.split('.').reduce((value, part) => value?.[part], dictionaries[language]);
      if (typeof message !== 'string') return key;
      return message.replace(/\{\{(\w+)\}\}/g, (_match, name) => String(vars[name] ?? ''));
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, direction, changeLanguage, changeDirection, t }),
    [language, direction, changeLanguage, changeDirection, t],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
