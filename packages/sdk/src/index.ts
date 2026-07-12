import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  User,
  Plan,
  Subscription,
  Server,
  Payment,
  Invoice,
  TrafficUsage,
  ApiResponse,
  PaginatedResponse,
} from './types';

export class AppiSdk {
  private client: AxiosInstance;

  constructor(config: { baseUrl: string; token?: string }) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
    });
  }

  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  private async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  private async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  private async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  auth = {
    register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
      this.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/register', data),

    login: (data: { email: string; password: string }) =>
      this.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', data),

    logout: () => this.post<ApiResponse<void>>('/auth/logout'),

    refresh: (refreshToken: string) =>
      this.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken }),

    verifyEmail: (token: string) =>
      this.post<ApiResponse<void>>('/auth/verify-email', { token }),

    forgotPassword: (email: string) =>
      this.post<ApiResponse<void>>('/auth/forgot-password', { email }),

    resetPassword: (token: string, password: string) =>
      this.post<ApiResponse<void>>('/auth/reset-password', { token, password }),
  };

  users = {
    me: () => this.get<ApiResponse<User>>('/users/me'),

    update: (data: Partial<User>) =>
      this.patch<ApiResponse<User>>('/users/me', data),

    delete: () => this.delete<ApiResponse<void>>('/users/me'),

    devices: () => this.get<ApiResponse<any[]>>('/users/devices'),

    removeDevice: (id: string) =>
      this.delete<ApiResponse<void>>(`/users/devices/${id}`),
  };

  subscriptions = {
    current: () => this.get<ApiResponse<Subscription>>('/subscriptions/current'),

    plans: () => this.get<ApiResponse<Plan[]>>('/subscriptions/plans'),

    create: (data: { planId: string; paymentMethod: string }) =>
      this.post<ApiResponse<Subscription>>('/subscriptions/create', data),

    cancel: () => this.post<ApiResponse<void>>('/subscriptions/cancel'),

    changePlan: (planId: string) =>
      this.post<ApiResponse<Subscription>>('/subscriptions/change-plan', { planId }),
  };

  vpn = {
    servers: (params?: { country?: string; protocol?: string }) =>
      this.get<ApiResponse<Server[]>>('/vpn/servers', { params }),

    recommended: () => this.get<ApiResponse<Server>>('/vpn/recommended'),

    generateConfig: (data: { serverId: string; protocol: string }) =>
      this.post<ApiResponse<any>>('/vpn/config/generate', data),

    configs: () => this.get<ApiResponse<any[]>>('/vpn/configs'),

    deleteConfig: (id: string) =>
      this.delete<ApiResponse<void>>(`/vpn/config/${id}`),
  };

  payments = {
    create: (data: { planId: string; provider: string }) =>
      this.post<ApiResponse<any>>('/payments/create', data),

    history: (params?: { page?: number; limit?: number }) =>
      this.get<ApiResponse<PaginatedResponse<Payment>>>('/payments/history', { params }),

    get: (id: string) => this.get<ApiResponse<Payment>>(`/payments/${id}`),
  };

  invoices = {
    list: (params?: { page?: number; limit?: number }) =>
      this.get<ApiResponse<PaginatedResponse<Invoice>>>('/invoices', { params }),

    get: (id: string) => this.get<ApiResponse<Invoice>>(`/invoices/${id}`),
  };

  traffic = {
    current: () => this.get<ApiResponse<TrafficUsage>>('/traffic/current'),

    history: (params?: { startDate?: string; endDate?: string }) =>
      this.get<ApiResponse<TrafficUsage[]>>('/traffic/history', { params }),
  };
}

export type { User, Plan, Subscription, Server, Payment, Invoice, TrafficUsage };
