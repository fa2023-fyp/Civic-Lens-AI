import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('civic_user') || 'null'));
  async function login(email, password) {
    const result = await api.post('/auth/login', { email, password });
    localStorage.setItem('civic_token', result.data.token);
    localStorage.setItem('civic_user', JSON.stringify(result.data.user));
    setUser(result.data.user);
  }
  function logout() { localStorage.removeItem('civic_token'); localStorage.removeItem('civic_user'); setUser(null); }
  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
