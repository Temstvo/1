import axios from 'axios';
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
let refreshing: Promise<unknown> | null = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !request.url?.startsWith('/auth/')
    ) {
      request._retry = true;
      if (!refreshing)
        refreshing = axios.post('/api/auth/refresh', {}, { timeout: 15000 }).finally(() => {
          refreshing = null;
        });
      try {
        await refreshing;
        return await api(request);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
export function apiErrorMessage(error: unknown, fallback = 'Не удалось выполнить запрос'): string {
  const data = axios.isAxiosError(error) ? error.response?.data : undefined;
  return Array.isArray(data?.message) ? data.message.join(' ') : data?.message || fallback;
}
export default api;
