import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { themeReducer } from './themeReducer.js';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, dispatch] = useReducer(
    themeReducer,
    document.documentElement.dataset.theme || 'light',
  );

  const toggleTheme = useCallback(() => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('civiclens-theme', next);
    dispatch({ type: 'set-theme', theme: next });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
