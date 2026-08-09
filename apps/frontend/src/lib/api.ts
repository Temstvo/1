import axios from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'https://appi-api-proxy.appivpn.workers.dev').replace(/\/+$/, '');
const api = axios.create({
  baseURL: baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      typeof originalRequest?.url === 'string' &&
      originalRequest.url.includes('/auth/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              { refreshToken },
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            processQueue(null, accessToken);
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function apiErrorMessage(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (Array.isArray(data?.message)) {
    return data.message.join(' ');
  }
  if (data?.message) return data.message;
  if (!err?.response || err?.code === 'ERR_NETWORK' || err?.code === 'ECONNABORTED') {
    return 'Сервер временно недоступен. Проверьте интернет или попробуйте позже.';
  }
  return fallback;
}

export default api;
