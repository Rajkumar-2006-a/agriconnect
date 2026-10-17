import axios from 'axios';

// Reads VITE_API_URL from .env (e.g. https://your-backend.vercel.app/api)
// Falls back to local dev server when not set
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');

const api = axios.create({ baseURL });

// Attach JWT Bearer token to every protected request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Resolve a stored image path to a full URL.
 * - Cloudinary images already return https:// URLs → returned as-is.
 * - Local uploads are prefixed with the backend origin.
 */
export const imageUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  const origin = baseURL.replace(/\/api\/?$/, '');
  return `${origin}${p.startsWith('/') ? p : `/${p}`}`;
};

export default api;
