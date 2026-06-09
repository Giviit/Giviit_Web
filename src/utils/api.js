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
  api.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }
      return Promise.reject(err);
    }
  );
}

export default api;
