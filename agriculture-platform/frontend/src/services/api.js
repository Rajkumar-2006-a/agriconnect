import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export const imageUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${api.defaults.baseURL.replace('/api', '')}${p}`;
};

export default api;
