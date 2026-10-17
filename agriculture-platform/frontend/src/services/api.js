import axios from 'axios';

// Normalize the backend API URL:
// 1. Read VITE_API_URL or default to localhost
// 2. Strip any trailing slash
// 3. Ensure it ends with /api so calls like api.post('/auth/login') or api.get('/products') route correctly
let rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
if (!rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}

const baseURL = rawUrl;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Interceptor:
// - Attach JWT token if present
// - Prevent accidental double '/api' (e.g. if a component calls api.get('/api/agri-doctors'))
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.url && config.url.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '');
  }
  return config;
});

/**
 * Resolve an image URL:
 * - Full http(s) URLs (e.g., Cloudinary or Unsplash) are returned directly
 * - Local /uploads/... paths are prepended with the backend origin
 */
export const imageUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  const origin = baseURL.replace(/\/api\/?$/, '');
  return `${origin}${p.startsWith('/') ? p : `/${p}`}`;
};

export default api;
