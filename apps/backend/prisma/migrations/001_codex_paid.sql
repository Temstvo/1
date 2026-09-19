-- 001_codex_paid: incremental changes from paid-service rework (idempotent).
-- Apply order matters: ALTER TYPE ... ADD VALUE cannot run inside a transaction block.

-- 1) New table for durable VPN desired state
CREATE TABLE IF NOT EXISTS "vpn_access" (
    "user_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "traffic_limit" BIGINT NOT NULL DEFAULT 0,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "synced_revision" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "encrypted_config" TEXT,
    "last_error" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "vpn_access_pkey" PRIMARY KEY ("user_id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "vpn_access_username_key" ON "vpn_access"("username");
CREATE INDEX IF NOT EXISTS "vpn_access_status_next_attempt_at_idx" ON "vpn_access"("status", "next_attempt_at");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vpn_access_user_id_fkey') THEN
    ALTER TABLE "vpn_access" ADD CONSTRAINT "vpn_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 2) Session-bound refresh tokens
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "refresh_token_hash" TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_refresh_token_hash_key') THEN
    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_refresh_token_hash_key" UNIQUE ("refresh_token_hash");
  END IF;
END $$;

-- 3) Payment idempotency + checkout fields
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "idempotency_key" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "checkout_url" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP(3);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_user_idempotency_key') THEN
    ALTER TABLE "payments" ADD CONSTRAINT "payments_user_idempotency_key" UNIQUE ("user_id", "idempotency_key");
  END IF;
END $$;

-- 4) New enum value (run outside transaction)
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';
