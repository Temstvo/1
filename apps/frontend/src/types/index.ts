export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

export type UserRole = 'USER' | 'MODERATOR' | 'SUPPORT' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED';

export interface Profile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  country?: string;
  language: string;
  phone?: string;
  timezone: string;
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
  priority: number;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  trialEndsAt?: string;
  cancelledAt?: string;
  plan?: Plan;
}

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIAL'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'PAST_DUE'
  | 'SUSPENDED'
  | 'REFUNDED';

export interface Server {
  id: string;
  name: string;
  country: string;
  city: string;
  ip: string;
  protocols: Protocol[];
  status: ServerStatus;
  cpu: number;
  ram: number;
  bandwidth: number;
  maxUsers: number;
  currentUsers: number;
  load: number;
  latency: number;
}

export type ServerStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'DISABLED';
export type Protocol = 'WIREGUARD' | 'OPENVPN' | 'XRAY_REALITY' | 'VLESS';

export interface Device {
  id: string;
  name: string;
  platform: string;
  osVersion?: string;
  appVersion?: string;
  lastIP?: string;
  lastSeen: string;
  isActive: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  provider: PaymentProvider;
  transactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  createdAt: string;
}

export type PaymentProvider = 'STRIPE' | 'LEMON_SQUEEZY' | 'TELEGRAM' | 'CRYPTOMUS';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface Invoice {
  id: string;
  number: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
}

export interface TrafficUsage {
  id: string;
  download: number;
  upload: number;
  date: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'SUBSCRIPTION_EXPIRING'
  | 'SUBSCRIPTION_EXPIRED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'NEW_DEVICE_LOGIN'
  | 'SUSPICIOUS_LOGIN'
  | 'SERVER_MAINTENANCE'
  | 'NEW_FEATURE'
  | 'SECURITY_ALERT'
  | 'GENERAL';

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  createdAt: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
