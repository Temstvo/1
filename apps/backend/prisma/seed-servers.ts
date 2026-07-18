import { PrismaClient, Protocol, ServerStatus } from '@prisma/client';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const servers = [
  { name: 'Frankfurt', country: 'Germany', city: 'Frankfurt', ip: '185.212.60.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 500 },
  { name: 'Berlin', country: 'Germany', city: 'Berlin', ip: '185.212.60.2', protocols: ['WIREGUARD', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 300 },
  { name: 'Amsterdam', country: 'Netherlands', city: 'Amsterdam', ip: '185.212.61.1', protocols: ['WIREGUARD', 'OPENVPN', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 500 },
  { name: 'London', country: 'United Kingdom', city: 'London', ip: '185.212.62.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 500 },
  { name: 'Paris', country: 'France', city: 'Paris', ip: '185.212.63.1', protocols: ['WIREGUARD', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 400 },
  { name: 'Riga', country: 'Latvia', city: 'Riga', ip: '185.212.64.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 300 },
  { name: 'Stockholm', country: 'Sweden', city: 'Stockholm', ip: '185.212.65.1', protocols: ['WIREGUARD', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 300 },
  { name: 'Tallinn', country: 'Estonia', city: 'Tallinn', ip: '185.212.66.1', protocols: ['WIREGUARD', 'XRAY_REALITY', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 200 },
  { name: 'Belgrade', country: 'Serbia', city: 'Belgrade', ip: '185.212.67.1', protocols: ['WIREGUARD', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 200 },
  { name: 'New York', country: 'United States', city: 'New York', ip: '198.51.100.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 800 },
  { name: 'Los Angeles', country: 'United States', city: 'Los Angeles', ip: '198.51.100.2', protocols: ['WIREGUARD', 'OPENVPN', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 600 },
  { name: 'San Francisco', country: 'United States', city: 'San Francisco', ip: '198.51.100.3', protocols: ['WIREGUARD', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 400 },
  { name: 'Toronto', country: 'Canada', city: 'Toronto', ip: '198.51.101.1', protocols: ['WIREGUARD', 'OPENVPN', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 400 },
  { name: 'Tokyo', country: 'Japan', city: 'Tokyo', ip: '198.51.102.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 600 },
  { name: 'Singapore', country: 'Singapore', city: 'Singapore', ip: '198.51.103.1', protocols: ['WIREGUARD', 'OPENVPN', 'VLESS'] as string[], status: 'ONLINE' as const, maxUsers: 500 },
];

const plans = [
  { name: 'Starter', description: 'For personal use', price: 499, currency: 'RUB', duration: 30, trafficLimit: BigInt(50 * 1024 * 1024 * 1024), deviceLimit: 3, protocols: ['WIREGUARD', 'OPENVPN'], regions: ['EU', 'US'], features: ['All servers', 'Email support'], priority: 1 },
  { name: 'Pro', description: 'For power users', price: 1199, currency: 'RUB', duration: 90, trafficLimit: BigInt(200 * 1024 * 1024 * 1024), deviceLimit: 5, protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'], regions: ['ALL'], features: ['All protocols', 'Priority support'], priority: 2 },
  { name: 'Business', description: 'For teams', price: 3999, currency: 'RUB', duration: 365, trafficLimit: BigInt(BigInt(1024) * BigInt(1024) * BigInt(1024) * BigInt(1024)), deviceLimit: 10, protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'], regions: ['ALL'], features: ['Dedicated IP', '24/7 support'], priority: 3 },
];

async function main() {
  for (const server of servers) {
    try {
      await prisma.server.create({
        data: {
          name: server.name,
          country: server.country,
          city: server.city,
          ip: server.ip,
          protocols: server.protocols as any,
          status: server.status as any,
          maxUsers: server.maxUsers,
          bandwidth: BigInt(10 * 1024 * 1024 * 1024),
        },
      });
      console.log(`Created server: ${server.name}`);
    } catch (e: any) {
      if (e.code === 'P2002') {
        console.log(`Server ${server.name} already exists, skipping`);
      } else {
        console.error(`Error creating ${server.name}:`, e.message);
      }
    }
  }

  for (const plan of plans) {
    try {
      await prisma.plan.create({ data: plan as any });
      console.log(`Created plan: ${plan.name}`);
    } catch (e: any) {
      if (e.code === 'P2002') {
        console.log(`Plan ${plan.name} already exists, skipping`);
      } else {
        console.error(`Error creating ${plan.name}:`, e.message);
      }
    }
  }

  await prisma.$disconnect();
  console.log('Done!');
}

main().catch((e) => { console.error(e); process.exit(1); });
