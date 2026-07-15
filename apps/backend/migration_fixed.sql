-- APPI VPN - Database Migration
-- Generated from Prisma schema with @db.Uuid on all foreign keys

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'SUSPENDED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'PAST_DUE', 'SUSPENDED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'LEMON_SQUEEZY', 'TELEGRAM', 'CRYPTOMUS');
CREATE TYPE "ServerStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'DISABLED');
CREATE TYPE "Protocol" AS ENUM ('WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS');
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED', 'FREE_DAYS', 'UNLIMITED');
CREATE TYPE "NotificationType" AS ENUM ('SUBSCRIPTION_EXPIRING', 'SUBSCRIPTION_EXPIRED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'NEW_DEVICE_LOGIN', 'SUSPICIOUS_LOGIN', 'SERVER_MAINTENANCE', 'NEW_FEATURE', 'SECURITY_ALERT', 'GENERAL');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'PASSWORD_CHANGED', 'TWO_FA_ENABLED', 'TWO_FA_DISABLED', 'SUSPICIOUS_ACTIVITY', 'BRUTE_FORCE_DETECTED', 'TOKEN_REFRESH', 'SESSION_REVOKED');

-- ============================================
-- TABLES
-- ============================================

-- Users
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "last_login_at" TIMESTAMPTZ,
    "last_login_ip" TEXT,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ,
    "referral_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Profiles
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar" TEXT,
    "country" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "phone" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- Sessions
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT,
    "device_name" TEXT,
    "device_type" TEXT,
    "country" TEXT,
    "city" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_active_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Devices
CREATE TABLE "devices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "os_version" TEXT,
    "app_version" TEXT,
    "last_ip" TEXT,
    "last_seen" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- Plans
CREATE TABLE "plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "duration" INTEGER NOT NULL,
    "traffic_limit" BIGINT NOT NULL,
    "device_limit" INTEGER NOT NULL,
    "protocols" TEXT[] NOT NULL,
    "regions" TEXT[] NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT[] NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "stripe_price_id" TEXT,
    "lemon_squeezy_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- Subscriptions
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "expires_at" TIMESTAMPTZ NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "trial_ends_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "cancel_reason" TEXT,
    "payment_method" TEXT,
    "external_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- Payments
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "subscription_id" UUID,
    "provider" "PaymentProvider" NOT NULL,
    "transaction_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "metadata" JSONB,
    "webhook_verified" BOOLEAN NOT NULL DEFAULT false,
    "refunded_at" TIMESTAMPTZ,
    "refund_amount" DECIMAL(10,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Invoices
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "pdf_url" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "due_date" TIMESTAMPTZ NOT NULL,
    "paid_at" TIMESTAMPTZ,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- Servers
CREATE TABLE "servers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "protocols" "Protocol"[] NOT NULL,
    "status" "ServerStatus" NOT NULL DEFAULT 'OFFLINE',
    "cpu" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ram" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "disk" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bandwidth" BIGINT NOT NULL DEFAULT 0,
    "max_users" INTEGER NOT NULL DEFAULT 1000,
    "current_users" INTEGER NOT NULL DEFAULT 0,
    "load" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "latency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "packet_loss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_health_check" TIMESTAMPTZ,
    "config" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "servers_pkey" PRIMARY KEY ("id")
);

-- VPN Configs
CREATE TABLE "vpn_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "server_id" UUID NOT NULL,
    "protocol" "Protocol" NOT NULL,
    "config" JSONB NOT NULL,
    "public_key" TEXT,
    "private_key" TEXT,
    "ip_address" TEXT,
    "port" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "vpn_configs_pkey" PRIMARY KEY ("id")
);

-- Connections
CREATE TABLE "connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "server_id" UUID NOT NULL,
    "device_id" UUID,
    "protocol" "Protocol" NOT NULL,
    "ip_address" TEXT,
    "connected_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "disconnected_at" TIMESTAMPTZ,
    "bytes_received" BIGINT NOT NULL DEFAULT 0,
    "bytes_sent" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- Traffic Usages
CREATE TABLE "traffic_usages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "server_id" UUID,
    "download" BIGINT NOT NULL DEFAULT 0,
    "upload" BIGINT NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "hour" INTEGER,

    CONSTRAINT "traffic_usages_pkey" PRIMARY KEY ("id")
);

-- Coupons
CREATE TABLE "coupons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "max_uses" INTEGER,
    "current_uses" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ,
    "min_amount" DECIMAL(10,2),
    "plan_ids" TEXT[] NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- Referrals
CREATE TABLE "referrals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- Notifications
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Tickets
CREATE TABLE "tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- Ticket Messages
CREATE TABLE "ticket_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- Audit Logs
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resource_id" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "country" TEXT,
    "metadata" JSONB,
    "result" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Security Events
CREATE TABLE "security_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "SecurityEventType" NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "country" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- UNIQUE CONSTRAINTS
-- ============================================

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");
CREATE UNIQUE INDEX "invoices_payment_id_key" ON "invoices"("payment_id");
CREATE UNIQUE INDEX "servers_ip_key" ON "servers"("ip");
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
CREATE UNIQUE INDEX "referrals_user_id_key" ON "referrals"("user_id");

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "users_referral_code_idx" ON "users"("referral_code");
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX "sessions_token_hash_idx" ON "sessions"("token_hash");
CREATE INDEX "sessions_is_active_idx" ON "sessions"("is_active");
CREATE INDEX "devices_user_id_idx" ON "devices"("user_id");
CREATE INDEX "plans_is_active_idx" ON "plans"("is_active");
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX "subscriptions_expires_at_idx" ON "subscriptions"("expires_at");
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");
CREATE INDEX "payments_transaction_id_idx" ON "payments"("transaction_id");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "invoices_user_id_idx" ON "invoices"("user_id");
CREATE INDEX "invoices_number_idx" ON "invoices"("number");
CREATE INDEX "servers_country_idx" ON "servers"("country");
CREATE INDEX "servers_status_idx" ON "servers"("status");
CREATE INDEX "vpn_configs_user_id_idx" ON "vpn_configs"("user_id");
CREATE INDEX "vpn_configs_server_id_idx" ON "vpn_configs"("server_id");
CREATE INDEX "connections_user_id_idx" ON "connections"("user_id");
CREATE INDEX "connections_server_id_idx" ON "connections"("server_id");
CREATE INDEX "connections_connected_at_idx" ON "connections"("connected_at");
CREATE INDEX "traffic_usages_user_id_idx" ON "traffic_usages"("user_id");
CREATE INDEX "traffic_usages_date_idx" ON "traffic_usages"("date");
CREATE INDEX "coupons_code_idx" ON "coupons"("code");
CREATE INDEX "coupons_is_active_idx" ON "coupons"("is_active");
CREATE INDEX "referrals_owner_id_idx" ON "referrals"("owner_id");
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_read_idx" ON "notifications"("read");
CREATE INDEX "tickets_user_id_idx" ON "tickets"("user_id");
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE INDEX "ticket_messages_ticket_id_idx" ON "ticket_messages"("ticket_id");
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
CREATE INDEX "security_events_user_id_idx" ON "security_events"("user_id");
CREATE INDEX "security_events_type_idx" ON "security_events"("type");
CREATE INDEX "security_events_created_at_idx" ON "security_events"("created_at");

-- ============================================
-- UNIQUE CONSTRAINT (composite)
-- ============================================

CREATE UNIQUE INDEX "traffic_usages_user_id_server_id_date_hour_key" ON "traffic_usages"("user_id", "server_id", "date", "hour");

-- ============================================
-- FOREIGN KEYS
-- ============================================

ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vpn_configs" ADD CONSTRAINT "vpn_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vpn_configs" ADD CONSTRAINT "vpn_configs_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "connections" ADD CONSTRAINT "connections_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "connections" ADD CONSTRAINT "connections_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "traffic_usages" ADD CONSTRAINT "traffic_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "traffic_usages" ADD CONSTRAINT "traffic_usages_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- SEED DATA: Plans
-- ============================================

INSERT INTO "plans" ("id", "name", "description", "price", "currency", "duration", "traffic_limit", "device_limit", "protocols", "regions", "priority", "features", "is_active") VALUES
('a0000000-0000-0000-0000-000000000001', 'Free Trial', '7-day free trial with full access', 0.00, 'USD', 7, 10737418240, 2, ARRAY['WIREGUARD', 'OPENVPN']::"Protocol"[], ARRAY['US', 'EU']::text[], 0, ARRAY['Basic VPN', '5 Servers', 'Email Support']::text[], true),
('a0000000-0000-0000-0000-000000000002', 'Starter', 'Perfect for personal use', 4.99, 'USD', 30, 53687091200, 3, ARRAY['WIREGUARD', 'OPENVPN']::"Protocol"[], ARRAY['US', 'EU', 'ASIA']::text[], 1, ARRAY['All Servers', 'Kill Switch', 'Email Support']::text[], true),
('a0000000-0000-0000-0000-000000000003', 'Pro', 'Best value for power users', 9.99, 'USD', 30, 214748364800, 5, ARRAY['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS']::"Protocol"[], ARRAY['US', 'EU', 'ASIA', 'OCEANIA']::text[], 2, ARRAY['All Servers', 'Kill Switch', 'Ad Blocker', 'Priority Support', 'Dedicated IP']::text[], true),
('a0000000-0000-0000-0000-000000000004', 'Business', 'For teams and businesses', 19.99, 'USD', 30, 1099511627776, 10, ARRAY['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS']::"Protocol"[], ARRAY['US', 'EU', 'ASIA', 'OCEANIA', 'SA', 'AF']::text[], 3, ARRAY['All Servers', 'Kill Switch', 'Ad Blocker', 'Dedicated IP', '24/7 Support', 'Team Management', 'Custom Configs']::text[], true);
