export interface User {
  id: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'SUPPORT' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED';
  emailVerified: boolean;
  referralCode: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration: number;
  trafficLimit: number;
  deviceLimit: number;
  protocols: string[];
  regions: string[];
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  plan?: Plan;
}

export interface Server {
  id: string;
  name: string;
  country: string;
  city: string;
  ip: string;
  protocols: string[];
  status: string;
  load: number;
  latency: number;
  currentUsers: number;
  maxUsers: number;
}

export interface Payment {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface TrafficUsage {
  download: number;
  upload: number;
  date: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
