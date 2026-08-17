const { PrismaClient } = require('@prisma/client');
const c = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } }, log: [] });
(async () => {
  try {
    await c.$connect();
    const before = await c.$queryRawUnsafe(`SELECT pid, state, wait_event FROM pg_stat_activity WHERE usename = 'postgres' AND pid <> pg_backend_pid()`);
    console.log('before:', before.length);
    const killed = await c.$queryRawUnsafe(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE usename = 'postgres'
        AND pid <> pg_backend_pid()
        AND state IS DISTINCT FROM 'active'
    `);
    console.log('terminated:', killed.length);
    await new Promise((r) => setTimeout(r, 1500));
    const after = await c.$queryRawUnsafe(`SELECT pid, state, wait_event FROM pg_stat_activity WHERE usename = 'postgres' AND pid <> pg_backend_pid()`);
    console.log('after:', after.length);
  } catch (e) {
    console.log('FAIL:', e.message.split('\n')[0]);
  } finally {
    try { await c.$disconnect(); } catch {}
  }
})();