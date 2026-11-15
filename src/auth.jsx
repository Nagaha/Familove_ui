import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { get, post, refreshSession, setAccessToken, hasSessionCookie } from './api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // On first load, try to pick the session back up from the refresh cookie.
  useEffect(() => {
    let cancelled = false;
    if (!hasSessionCookie()) {
      setReady(true);
      return undefined;
    }
    refreshSession()
      .then((data) => !cancelled && setUser(data.user))
      .catch(() => {})
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    await post('/auth/register', { name, email, password });
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await post('/auth/logout');
    } catch {
      // The cookie may already be gone; log out locally either way.
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const reloadUser = useCallback(async () => {
    const data = await get('/users/me');
    setUser(data.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}
