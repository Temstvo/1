require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  const price = Number(process.env.PILOT_PRICE_RUB || 499);
  const gb = Number(process.env.PILOT_TRAFFIC_GB || 50);
  if (
    !Number.isInteger(price) ||
    price < 1 ||
    price > 100000 ||
    !Number.isInteger(gb) ||
    gb < 1 ||
    gb > 10000
  )
    throw new Error('Invalid PILOT_PRICE_RUB or PILOT_TRAFFIC_GB');
  const id = 'b7d6c710-69c4-4a21-b401-000000000001';
  await db.$transaction(async (tx) => {
    const data = {
      name: 'Appi',
      description: 'Персональный VPN на 30 дней',
      price,
      currency: 'RUB',
      duration: 30,
      trafficLimit: BigInt(gb) * 1024n ** 3n,
      deviceLimit: 1,
      protocols: ['VLESS'],
      regions: [],
      features: [
        'Персональный ключ',
        'Продление без потери оставшегося срока',
        'Поддержка в кабинете',
      ],
      isActive: true,
    };
    await tx.plan.upsert({ where: { id }, create: { id, ...data }, update: data });
    await tx.plan.updateMany({ where: { id: { not: id } }, data: { isActive: false } });
  });
  console.log(
    `Pilot plan ready: ${price} RUB / 30 days / ${gb} GiB. Other plans hidden; existing subscriptions and orders preserved.`,
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
