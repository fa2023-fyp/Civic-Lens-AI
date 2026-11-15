import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button.jsx';
import { Modal } from '../components/ui/Modal/Modal.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { api } from '../services/api.js';
import { authReducer, initialAuthState } from './authReducer.js';

const AuthContext = createContext(null);
const sessionStorageKey = 'civiclens-session';
const validRoles = new Set(['citizen', 'officer', 'supervisor', 'admin']);

function readInitialState(pathname) {
  const storedSession = localStorage.getItem(sessionStorageKey);
  if (!storedSession) return initialAuthState;

  try {
    const session = JSON.parse(storedSession);
    if (
      typeof session?.token !== 'string' ||
      typeof session.user?.id !== 'string' ||
      !validRoles.has(session.user.role) ||
      !Number.isFinite(session.expiresAt)
    ) {
      throw new TypeError('Stored demo session is incomplete.');
    }

    if (session.expiresAt <= Date.now()) {
      localStorage.removeItem(sessionStorageKey);
      return {
        ...initialAuthState,
        sessionExpired: true,
        expiredPath: pathname,
        expiredRole: session.user.role,
        expiredUserId: session.user.id,
      };
    }

    return {
      ...initialAuthState,
      user: session.user,
      token: session.token,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    localStorage.removeItem(sessionStorageKey);
    console.error('Stored demo session could not be restored.', error);
    return initialAuthState;
  }
}

function SessionExpiredDialog({ open, onClose }) {
  const { t } = useI18n();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('auth.sessionExpiredTitle')}
      description={t('auth.sessionExpiredBody')}
      closeOnBackdrop={false}
      footer={
        <Button onClick={onClose}>{t('auth.keepPageOpen')}</Button>
      }
    >
      <p>{t('auth.sessionExpiredHint')}</p>
    </Modal>
  );
}

export function AuthProvider({ children }) {
  const location = useLocation();
  const [state, dispatch] = useReducer(authReducer, location.pathname, readInitialState);

  const persistSession = useCallback((session) => {
    if (!validRoles.has(session.user?.role)) {
      throw new TypeError('The authentication service returned an unsupported role.');
    }
    localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    dispatch({ type: 'session', session });
    return session.user;
  }, []);

  const login = useCallback(
    async (credentials, password) => {
      const input =
        typeof credentials === 'string' ? { email: credentials, password } : credentials;
      return persistSession(await api.login(input));
    },
    [persistSession],
  );

  const register = useCallback(
    async (input) => persistSession(await api.register(input)),
    [persistSession],
  );

  const expireSession = useCallback(() => {
    localStorage.removeItem(sessionStorageKey);
    dispatch({
      type: 'session-expired',
      path: location.pathname,
      role: state.user?.role ?? state.expiredRole,
      userId: state.user?.id ?? state.expiredUserId,
    });
  }, [location.pathname, state.user?.role, state.user?.id, state.expiredRole, state.expiredUserId]);

  const refresh = useCallback(async () => {
    if (!state.user || !state.token || !state.expiresAt) {
      throw new Error('There is no active demo session to refresh.');
    }
    try {
      const session = await api.refresh({
        user: state.user,
        token: state.token,
        expiresAt: state.expiresAt,
      });
      persistSession(session);
      return session.user;
    } catch (error) {
      if (error.code === 'AUTH_SESSION_EXPIRED') expireSession();
      throw error;
    }
  }, [state.user, state.token, state.expiresAt, persistSession, expireSession]);

  const logout = useCallback(async () => {
    await api.logout(state.token);
    localStorage.removeItem(sessionStorageKey);
    dispatch({ type: 'logout' });
  }, [state.token]);

  const dismissExpiredDialog = useCallback(
    () => dispatch({ type: 'dismiss-expired-dialog' }),
    [],
  );

  useEffect(() => {
    if (!state.user || !state.expiresAt || state.sessionExpired) return undefined;

    const expireIfNeeded = () => {
      if (Date.now() >= state.expiresAt) expireSession();
    };
    const timeout = window.setTimeout(
      expireIfNeeded,
      Math.max(0, state.expiresAt - Date.now()),
    );
    window.addEventListener('focus', expireIfNeeded);
    document.addEventListener('visibilitychange', expireIfNeeded);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('focus', expireIfNeeded);
      document.removeEventListener('visibilitychange', expireIfNeeded);
    };
  }, [state.user, state.expiresAt, state.sessionExpired, expireSession]);

  const value = useMemo(
    () => ({
      state,
      user: state.user,
      role: state.user?.role ?? null,
      isAuthenticated: Boolean(state.user && state.token && state.expiresAt > Date.now()),
      sessionExpired: state.sessionExpired,
      expiredPath: state.expiredPath,
      expiredRole: state.expiredRole,
      expiredUserId: state.expiredUserId,
      login,
      logout,
      register,
      refresh,
      dismissExpiredDialog,
    }),
    [state, login, logout, register, refresh, dismissExpiredDialog],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredDialog
        open={state.sessionExpired && !state.expiredDialogDismissed}
        onClose={dismissExpiredDialog}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
