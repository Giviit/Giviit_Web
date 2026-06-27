import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import { MOCK_CREATOR_USER, MOCK_ADMIN_USER } from '../mocks/data';

const AuthContext = createContext(null);

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

// No server-side account locking — if the stored session is older than this,
// the frontend itself drops it from localStorage and sends the user back to
// login. Simpler than a dormancy/reactivation flow, and the backend's
// last_active_at tracking still exists for visibility if that's ever needed.
const INACTIVITY_LIMIT_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('last_active_at');
  delete api.defaults.headers.common['Authorization'];
}

function markActive() {
  localStorage.setItem('last_active_at', Date.now().toString());
}

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
    const lastActiveAt = Number(localStorage.getItem('last_active_at') || 0);
    if (token && lastActiveAt && Date.now() - lastActiveAt > INACTIVITY_LIMIT_MS) {
      clearSession();
      setLoading(false);
      return;
    }

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      markActive();
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => clearSession())
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
    const { token, refresh_token, user: userData } = res.data;
    localStorage.setItem('token', token);
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
    markActive();
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
    const { token, refresh_token, user: userData, message, email } = res.data;
    if (!token) {
      // No session yet — either a pending email-verification (message+email
      // present) or a rare sign-in failure right after account creation.
      // Caller routes accordingly instead of going straight to /dashboard.
      return message ? { pendingVerification: true, email } : null;
    }
    localStorage.setItem('token', token);
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
    markActive();
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const loginWithGoogle = async (agreed) => {
    if (MOCK_MODE) {
      const mockUser = { ...MOCK_CREATOR_USER, email: 'google@demo.com', full_name: 'Google User' };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const query = agreed ? '?agreed=true' : '';
    window.location.href = `${apiUrl}/auth/google${query}`;
  };

  const logout = async () => {
    if (MOCK_MODE) {
      localStorage.removeItem('mock_user');
      setUser(null);
      return;
    }
    try { await api.post('/auth/logout'); } catch {}
    clearSession();
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
