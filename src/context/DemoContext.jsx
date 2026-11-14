import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { demoReducer, initialDemoState } from './demoReducer.js';

const DemoContext = createContext(null);

export function DemoProvider({ children }) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const toast = useCallback((message) => dispatch({ type: 'toast', message }), []);
  const clearToast = useCallback(() => dispatch({ type: 'clear-toast' }), []);
  const value = useMemo(() => ({ state, toast, clearToast }), [state, toast, clearToast]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
}
