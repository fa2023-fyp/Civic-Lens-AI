import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import en from './en.json';
import ur from './ur.json';
import { i18nReducer } from './i18nReducer.js';

const dictionaries = { en, ur };
const locales = { en: 'en-US', ur: 'ur-PK' };
const urduNumbers = ['صفر', 'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو', 'دس'];
const I18nContext = createContext(null);

function getLanguage(value) {
  return Object.hasOwn(dictionaries, value) ? value : 'en';
}

function applyDocumentLanguage(language, direction = language === 'ur' ? 'rtl' : 'ltr') {
  const root = document.documentElement;
  root.lang = language;
  root.dir = direction;
  root.classList.toggle('font-urdu', language === 'ur');
  root.classList.toggle('font-latin', language === 'en');
}

function toValidDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError('A valid date is required.');
  return date;
}

function makeFormatter(locale, options) {
  return new Intl.NumberFormat(locale, options);
}

export function I18nProvider({ children }) {
  const [state, dispatch] = useReducer(i18nReducer, null, () => {
    const language = getLanguage(localStorage.getItem('civiclens-language'));
    const direction = language === 'ur' ? 'rtl' : 'ltr';
    applyDocumentLanguage(language, direction);
    return { language, direction };
  });
  const { language, direction } = state;
  const locale = locales[language];

  const changeLanguage = useCallback((nextLanguage) => {
    const next = getLanguage(nextLanguage);
    const nextDirection = next === 'ur' ? 'rtl' : 'ltr';
    localStorage.setItem('civiclens-language', next);
    applyDocumentLanguage(next, nextDirection);
    dispatch({ type: 'language', language: next, direction: nextDirection });
  }, []);

  const changeDirection = useCallback(
    (nextDirection) => {
      const next = nextDirection === 'rtl' ? 'rtl' : 'ltr';
      applyDocumentLanguage(language, next);
      dispatch({ type: 'direction', direction: next });
    },
    [language],
  );

  const t = useCallback(
    (key, vars = {}) => {
      const message = key.split('.').reduce((value, part) => value?.[part], dictionaries[language]);
      if (typeof message !== 'string') return key;
      return message.replace(/\{\{(\w+)\}\}/g, (_match, name) => String(vars[name] ?? ''));
    },
    [language],
  );

  const formatNumber = useCallback(
    (value, options = {}) => makeFormatter(locale, options).format(value),
    [locale],
  );

  const formatDate = useCallback(
    (value, options = { dateStyle: 'medium' }) =>
      new Intl.DateTimeFormat(locale, options).format(toValidDate(value)),
    [locale],
  );

  const formatRelativeTime = useCallback(
    (value, baseDate = new Date()) => {
      const difference = (toValidDate(value).getTime() - toValidDate(baseDate).getTime()) / 1000;
      const units = [
        ['year', 60 * 60 * 24 * 365],
        ['month', 60 * 60 * 24 * 30],
        ['day', 60 * 60 * 24],
        ['hour', 60 * 60],
        ['minute', 60],
        ['second', 1],
      ];
      const [unit, secondsPerUnit] = units.find(([, seconds]) => Math.abs(difference) >= seconds) ?? [
        'second',
        1,
      ];
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
        Math.round(difference / secondsPerUnit),
        unit,
      );
    },
    [locale],
  );

  const formatDuration = useCallback(
    (days) => {
      if (!Number.isFinite(days) || days < 0) {
        throw new RangeError('Duration must be a non-negative number of days.');
      }
      const count = makeFormatter('en', { maximumFractionDigits: 2 }).format(days);
      if (language === 'ur') {
        const wholeDays = Number.isInteger(days) ? urduNumbers[days] : null;
        return wholeDays
          ? t('common.duration.daysUrdu', { count, urduNumber: wholeDays })
          : t('common.duration.daysUrduNumeric', { count });
      }
      return t(days === 1 ? 'common.duration.day' : 'common.duration.days', { count });
    },
    [language, t],
  );

  const value = useMemo(
    () => ({
      lang: language,
      language,
      dir: direction,
      direction,
      changeLanguage,
      setLanguage: changeLanguage,
      changeDirection,
      t,
      formatNumber,
      formatDate,
      formatRelativeTime,
      formatDuration,
    }),
    [
      language,
      direction,
      changeLanguage,
      changeDirection,
      t,
      formatNumber,
      formatDate,
      formatRelativeTime,
      formatDuration,
    ],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
