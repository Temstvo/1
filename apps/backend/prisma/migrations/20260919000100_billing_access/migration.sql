-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "refresh_token_hash" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "checkout_url" TEXT,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "idempotency_key" TEXT;

-- CreateTable
CREATE TABLE "vpn_access" (
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

-- CreateIndex
CREATE UNIQUE INDEX "vpn_access_username_key" ON "vpn_access"("username");

-- CreateIndex
CREATE INDEX "vpn_access_status_next_attempt_at_idx" ON "vpn_access"("status", "next_attempt_at");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_hash_key" ON "sessions"("refresh_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "payments_user_id_idempotency_key_key" ON "payments"("user_id", "idempotency_key");

-- AddForeignKey
ALTER TABLE "vpn_access" ADD CONSTRAINT "vpn_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
