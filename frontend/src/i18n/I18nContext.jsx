import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './en.json';
import ur from './ur.json';
const messages = { en, ur };
const Context = createContext(null);
export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('civic_language') || 'en');
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);
  function changeLanguage(value) {
    localStorage.setItem('civic_language', value);
    setLanguage(value);
  }
  const value = useMemo(() => ({ language, t: key => messages[language][key] || key, changeLanguage }), [language]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useI18n = () => useContext(Context);
