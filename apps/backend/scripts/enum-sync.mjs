import { PrismaClient } from '@prisma/client';

const required = {
  PaymentProvider: ['STRIPE', 'LEMON_SQUEEZY', 'TELEGRAM', 'CRYPTOMUS', 'YOOKASSA'],
  PaymentStatus: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'],
  SubscriptionStatus: [
    'PENDING', 'ACTIVE', 'TRIAL', 'GRACE_PERIOD', 'EXPIRED', 'CANCELLED',
    'PAST_DUE', 'SUSPENDED', 'REFUNDED',
  ],
  Protocol: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'],
  UserRole: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  UserStatus: ['ACTIVE', 'INACTIVE', 'BANNED', 'SUSPENDED'],
};

const missing = [];

for (const [enumName, values] of Object.entries(required)) {
  const prisma = new PrismaClient();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT unnest(enum_range(NULL::"${enumName}"))::text AS v`,
  );
  const existing = new Set(rows.map((r) => r.v));
  for (const value of values) {
    if (!existing.has(value)) missing.push({ enumName, value });
  }
  await prisma.$disconnect();
}

for (const { enumName, value } of missing) {
  const prisma = new PrismaClient();
  await prisma.$executeRawUnsafe(
    `ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS '${value}'`,
  );
  console.log(`ADDED ${enumName}.${value}`);
  await prisma.$disconnect();
}

console.log(missing.length === 0 ? 'ALL ENUMS IN SYNC' : `ADDED ${missing.length} values`);
process.exit(0);