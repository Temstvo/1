require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  const { validateEnvironment } = require('../dist/config/validate');
  validateEnvironment(process.env);
  await db.$queryRaw`SELECT 1`;
  const errors = await db.vpnAccess.count({ where: { status: 'ERROR' } });
  const overdue = await db.vpnAccess.count({
    where: { enabled: true, nextAttemptAt: { lt: new Date(Date.now() - 300000) } },
  });
  console.log(
    JSON.stringify(
      {
        database: 'ok',
        vpnErrors: errors,
        overdueSync: overdue,
        checkout: process.env.ENABLE_CHECKOUT === 'true',
        testPayments: process.env.YOOKASSA_TEST_MODE !== 'false',
        mailConfigured: !!process.env.RESEND_API_KEY,
        vpnConfigured: !!process.env.MARZBAN_URL,
      },
      null,
      2,
    ),
  );
  if (errors || overdue) process.exitCode = 1;
}
main()
  .catch(() => {
    console.error(
      'Readiness failed. Check configuration, database and VPN worker. No credentials printed.',
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
