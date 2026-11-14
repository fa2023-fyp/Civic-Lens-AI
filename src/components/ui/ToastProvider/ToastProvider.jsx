import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react';
import { Toast } from '../Toast/Toast.jsx';
import './ToastProvider.css';

const ToastContext = createContext(null);

function reducer(state, action) {
  if (action.type === 'add') return [...state, action.toast];
  if (action.type === 'dismiss') return state.filter((toast) => toast.id !== action.id);
  return state;
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const nextId = useRef(0);

  const toast = useCallback((message, type = 'info', options = {}) => {
    const id = `toast-${++nextId.current}`;
    dispatch({
      type: 'add',
      toast: { id, message, type, duration: options.duration ?? 4500 },
    });
    return id;
  }, []);

  const dismiss = useCallback((id) => dispatch({ type: 'dismiss', id }), []);
  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ui-toast-viewport">
        {toasts.map((item) => (
          <Toast key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
