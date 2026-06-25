import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import { MOCK_CREATOR_USER, MOCK_ADMIN_USER } from '../mocks/data';

const AuthContext = createContext(null);

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (MOCK_MODE) {
      const saved = localStorage.getItem('mock_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch {}
      }
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (MOCK_MODE) {
      // Demo credentials
      if (email === 'admin@demo.com') {
        localStorage.setItem('mock_user', JSON.stringify(MOCK_ADMIN_USER));
        setUser(MOCK_ADMIN_USER);
        return MOCK_ADMIN_USER;
      }
      // Any other email → creator login
      const mockUser = { ...MOCK_CREATOR_USER, email, full_name: email.split('@')[0] };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }

    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    if (MOCK_MODE) {
      const mockUser = { ...MOCK_CREATOR_USER, email: data.email, full_name: data.full_name, phone: data.phone };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
    const res = await api.post('/auth/register', data);
    const { token, user: userData } = res.data;
    if (!token) {
      // Backend created the account but couldn't auto-sign-in (rare) — caller
      // should route to /login instead of /dashboard in this case.
      return null;
    }
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const loginWithGoogle = async () => {
    if (MOCK_MODE) {
      const mockUser = { ...MOCK_CREATOR_USER, email: 'google@demo.com', full_name: 'Google User' };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }

    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  const logout = async () => {
    if (MOCK_MODE) {
      localStorage.removeItem('mock_user');
      setUser(null);
      return;
    }
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, loginWithGoogle, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
