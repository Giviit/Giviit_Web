import axios from 'axios';
import { mockHandlers } from './mockApi';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

if (MOCK_MODE) {
  // Intercept requests and return mock data
  api.interceptors.request.use(async (config) => {
    // Find matching mock handler
    const method = config.method?.toUpperCase();
    const url = config.url?.replace(api.defaults.baseURL, '').replace(/^\/api/, '') || '';

    // Try exact match first, then parameterized match
    const key = `${method} ${url}`;
    let handler = mockHandlers[key];
    let param = null;

    if (!handler) {
      // Try parameterized routes
      for (const [pattern, fn] of Object.entries(mockHandlers)) {
        const [pMethod, pPath] = pattern.split(' ');
        if (pMethod !== method) continue;
        const regex = new RegExp('^' + pPath.replace(/:[\w]+/g, '([^/]+)') + '$');
        const match = url.match(regex);
        if (match) {
          handler = fn;
          param = match[1];
          break;
        }
      }
    }

    if (handler) {
      // Cancel the real request and return mock data
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      const body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
      const params = config.params || {};

      try {
        const data = await handler({ ...params, ...body }, param, body);
        source.cancel({ __mock: true, data });
      } catch (err) {
        source.cancel({ __mock: true, data: err });
      }
    }

    return config;
  });

  api.interceptors.response.use(
    res => res,
    err => {
      if (axios.isCancel(err) && err.message?.__mock) {
        return Promise.resolve({ data: err.message.data, status: 200 });
      }
      return Promise.reject(err);
    }
  );
} else {
  // Access tokens expire in ~1h. Without this, any request made after expiry
  // (e.g. a page refresh hours later) looks identical to a real logout — there
  // was no attempt to use the refresh_token Supabase already issued alongside it.
  let isRefreshing = false;
  let refreshSubscribers = [];

  function onRefreshed(newToken) {
    refreshSubscribers.forEach(cb => cb(newToken));
    refreshSubscribers = [];
  }

  function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
  }

  api.interceptors.response.use(
    res => res,
    async (err) => {
      const originalRequest = err.config;
      if (err.response?.status !== 401 || originalRequest?._retry) {
        return Promise.reject(err);
      }

      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        clearSession();
        return Promise.reject(err);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((newToken) => {
            if (!newToken) { reject(err); return; }
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refreshTokenValue });
        const { token: newToken, refresh_token: newRefreshToken } = res.data;
        localStorage.setItem('token', newToken);
        if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        isRefreshing = false;
        onRefreshed(newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        onRefreshed(null);
        clearSession();
        return Promise.reject(err);
      }
    }
  );
}

export default api;
