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

// Response Interceptor:
// - If 401 Invalid/Expired token, clear stale token so it doesn't break subsequent calls
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const msg = String(error.response?.data?.message || '');
      if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('expire') || msg.toLowerCase().includes('authorized')) {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export const DEFAULT_EQUIPMENT_IMAGE =
  'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=900&q=80';

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

/**
 * Resolve an image URL:
 * - Full http(s) URLs (e.g., Cloudinary or Unsplash) are returned directly
 * - Local /uploads/... paths are prepended with the backend origin
 * - Returns fallback if url is empty or invalid
 */
export const imageUrl = (p, fallback = '') => {
  if (!p || typeof p !== 'string') return fallback;
  const trimmed = p.trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const origin = baseURL.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.replace(/^[/\\]+/, '').replace(/\\/g, '/');
  return `${origin}/${cleanPath}`;
};

export default api;
