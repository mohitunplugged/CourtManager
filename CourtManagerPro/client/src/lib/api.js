const normalizeBase = (value) => {
  if (!value) return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const apiBase =
  normalizeBase(import.meta.env.VITE_API_URL) ||
  (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const buildApiUrl = (path) => {
  if (!path) return apiBase;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${normalized}`;
};
