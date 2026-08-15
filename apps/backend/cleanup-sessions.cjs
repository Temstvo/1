const { PrismaClient } = require('@prisma/client');
const c = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } }, log: [] });
(async () => {
  try {
    await c.$connect();
    await c.$queryRawUnsafe(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE usename = 'postgres'
        AND pid <> pg_backend_pid()
        AND state = 'idle'
    `);
    const r = await c.$queryRawUnsafe(`SELECT pid FROM pg_stat_activity WHERE usename = 'postgres' AND pid <> pg_backend_pid()`);
    console.log('sessions after cleanup:', r.length);
  } catch (e) {
    console.log('FAIL:', e.message.split('\n')[0]);
  } finally {
    try { await c.$disconnect(); } catch {}
  }
})();