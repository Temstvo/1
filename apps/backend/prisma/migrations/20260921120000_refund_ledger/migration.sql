CREATE TABLE "refunds" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "payment_id" UUID NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "amount" DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  "currency" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");
