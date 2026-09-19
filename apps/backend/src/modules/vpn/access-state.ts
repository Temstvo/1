import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';

// Caller holds lockUser. Explicit admin revocation survives purchases until restored.
export async function queueAccess(
  tx: Prisma.TransactionClient,
  userId: string,
  expiresAt: Date,
  trafficLimit: bigint,
) {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  const previous = await tx.vpnAccess.findUnique({ where: { userId } });
  const enabled = user.status === 'ACTIVE' && !previous?.revoked && expiresAt > new Date();
  return tx.vpnAccess.upsert({
    where: { userId },
    create: {
      userId,
      username: 'appi_' + createHash('sha256').update(userId).digest('hex').slice(0, 26),
      expiresAt,
      trafficLimit,
      enabled,
    },
    update: {
      expiresAt,
      trafficLimit,
      enabled,
      revision: { increment: 1 },
      status: 'PENDING',
      nextAttemptAt: new Date(),
      lastError: null,
      attempts: 0,
    },
  });
}
