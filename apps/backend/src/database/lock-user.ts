import { Prisma } from '@prisma/client';

// Shared across API instances and workers. Values are bound parameters.
export async function lockUser(tx: Prisma.TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))::text`;
}
