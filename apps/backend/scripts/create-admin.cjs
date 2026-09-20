require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { randomUUID } = require('node:crypto');
const argon2 = require('argon2');
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !password || password.length < 16) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 16 characters) in your private environment.');
  }
  if (await db.user.findUnique({ where: { email } })) throw new Error('Account exists; refusing to promote or replace credentials. Review it directly in the database.');
  await db.user.create({ data: { email, passwordHash: await argon2.hash(password, { type: argon2.argon2id }), role: 'ADMIN', emailVerified: true, referralCode: randomUUID() } });
  console.log('Administrator created. Remove ADMIN_PASSWORD from the environment.');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => db.$disconnect());
