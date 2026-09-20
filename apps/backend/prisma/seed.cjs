require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const catalogue = [
  { id: 'b7d6c710-69c4-4a21-b401-000000000001', name: 'Starter', duration: 30, price: 499, deviceLimit: 3, trafficLimit: 50n * 1024n ** 3n },
  { id: 'b7d6c710-69c4-4a21-b401-000000000002', name: 'Pro', duration: 90, price: 1199, deviceLimit: 5, trafficLimit: 200n * 1024n ** 3n },
  { id: 'b7d6c710-69c4-4a21-b401-000000000003', name: 'Business', duration: 365, price: 3999, deviceLimit: 10, trafficLimit: 1024n ** 4n },
];
async function main() {
  // Preserve existing business prices. Never overwrite operator-edited plans.
  for (const plan of catalogue) {
    if (await db.plan.findFirst({ where: { name: plan.name } })) continue;
    await db.plan.create({ data: { ...plan, currency: 'RUB', description: 'Персональный доступ VLESS Reality',
      protocols: ['VLESS'], regions: [], features: ['Персональная конфигурация', 'Продление с сохранением остатка'], isActive: true } });
  }
  console.log('Plan catalogue seeded; existing plans preserved. No VPN servers or users invented.');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => db.$disconnect());
