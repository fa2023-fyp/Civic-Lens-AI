import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { themeReducer } from './themeReducer.js';

const ThemeContext = createContext(null);
const themes = ['light', 'dark', 'system'];

function getPreference(value) {
  return themes.includes(value) ? value : 'light';
}

function resolveTheme(preference, systemDark) {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}

function applyTheme(preference, systemDark) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolveTheme(preference, systemDark);
}

export function ThemeProvider({ children }) {
  const [preference, dispatch] = useReducer(themeReducer, null, () => {
    const storedPreference = getPreference(
      document.documentElement.dataset.themePreference ||
        localStorage.getItem('civiclens-theme'),
    );
    applyTheme(storedPreference, window.matchMedia('(prefers-color-scheme: dark)').matches);
    return storedPreference;
  });
  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const resolvedTheme = resolveTheme(preference, systemDark);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => {
      setSystemDark(mediaQuery.matches);
      applyTheme(preference, mediaQuery.matches);
    };
    updateSystemTheme();

    if (preference !== 'system') return undefined;
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateSystemTheme);
    } else {
      mediaQuery.addListener(updateSystemTheme);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateSystemTheme);
      } else {
        mediaQuery.removeListener(updateSystemTheme);
      }
    };
  }, [preference]);

  const setTheme = useCallback((nextTheme) => {
    if (!themes.includes(nextTheme)) {
      throw new RangeError('Theme must be light, dark, or system.');
    }
    localStorage.setItem('civiclens-theme', nextTheme);
    applyTheme(nextTheme, window.matchMedia('(prefers-color-scheme: dark)').matches);
    dispatch({ type: 'set-theme', theme: nextTheme });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({ theme: resolvedTheme, resolvedTheme, preference, setTheme, toggleTheme }),
    [resolvedTheme, preference, setTheme, toggleTheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
