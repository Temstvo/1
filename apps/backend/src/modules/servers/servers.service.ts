import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ServerStatus, Protocol } from '@prisma/client';

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { country?: string; protocol?: string; status?: ServerStatus }) {
    const where: any = {};

    if (filters?.country) {
      where.country = filters.country;
    }

    if (filters?.protocol) {
      where.protocols = { has: filters.protocol as Protocol };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.server.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const server = await this.prisma.server.findUnique({
      where: { id },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    return server;
  }

  async findRecommended(userId: string) {
    const servers = await this.prisma.server.findMany({
      where: { status: 'ONLINE' },
      orderBy: { load: 'asc' },
      take: 5,
    });

    if (servers.length === 0) {
      throw new NotFoundException('No servers available');
    }

    return servers[0];
  }

  async getCountries() {
    const countries = await this.prisma.server.groupBy({
      by: ['country'],
      where: { status: 'ONLINE' },
      _count: { id: true },
    });

    return countries.map((c) => ({
      country: c.country,
      serverCount: c._count.id,
    }));
  }

  async create(data: {
    name: string;
    country: string;
    city: string;
    ip: string;
    protocols: Protocol[];
    maxUsers?: number;
  }) {
    return this.prisma.server.create({
      data: {
        name: data.name,
        country: data.country,
        city: data.city,
        ip: data.ip,
        protocols: data.protocols,
        maxUsers: data.maxUsers || 1000,
        status: 'OFFLINE',
      },
    });
  }

  async update(id: string, data: {
    name?: string;
    country?: string;
    city?: string;
    protocols?: Protocol[];
    maxUsers?: number;
    status?: ServerStatus;
  }) {
    await this.findById(id);

    return this.prisma.server.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.server.delete({
      where: { id },
    });
  }

  async updateHealth(id: string, data: {
    cpu: number;
    ram: number;
    disk: number;
    load: number;
    latency: number;
    packetLoss: number;
    bandwidth: number;
  }) {
    return this.prisma.server.update({
      where: { id },
      data: {
        ...data,
        lastHealthCheck: new Date(),
        status: 'ONLINE',
      },
    });
  }

  async getServerUsers(id: string) {
    const connections = await this.prisma.connection.findMany({
      where: {
        serverId: id,
        disconnectedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return connections;
  }

  async getServerStats(id: string) {
    const server = await this.findById(id);

    const connections = await this.prisma.connection.count({
      where: {
        serverId: id,
        disconnectedAt: null,
      },
    });

    const todayTraffic = await this.prisma.trafficUsage.aggregate({
      where: {
        serverId: id,
        date: new Date(new Date().setHours(0, 0, 0, 0)),
      },
      _sum: {
        download: true,
        upload: true,
      },
    });

    return {
      ...server,
      activeConnections: connections,
      todayTraffic: {
        download: todayTraffic._sum.download || 0,
        upload: todayTraffic._sum.upload || 0,
      },
    };
  }

  async seedServersAndPlans() {
    const serversData = [
      { name: 'Frankfurt', country: 'Germany', city: 'Frankfurt', ip: '185.212.60.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'], maxUsers: 500 },
      { name: 'Berlin', country: 'Germany', city: 'Berlin', ip: '185.212.60.2', protocols: ['WIREGUARD', 'VLESS'], maxUsers: 300 },
      { name: 'Amsterdam', country: 'Netherlands', city: 'Amsterdam', ip: '185.212.61.1', protocols: ['WIREGUARD', 'OPENVPN', 'VLESS'], maxUsers: 500 },
      { name: 'London', country: 'United Kingdom', city: 'London', ip: '185.212.62.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'], maxUsers: 500 },
      { name: 'Paris', country: 'France', city: 'Paris', ip: '185.212.63.1', protocols: ['WIREGUARD', 'VLESS'], maxUsers: 400 },
      { name: 'Riga', country: 'Latvia', city: 'Riga', ip: '185.212.64.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'], maxUsers: 300 },
      { name: 'Stockholm', country: 'Sweden', city: 'Stockholm', ip: '185.212.65.1', protocols: ['WIREGUARD', 'VLESS'], maxUsers: 300 },
      { name: 'Tallinn', country: 'Estonia', city: 'Tallinn', ip: '185.212.66.1', protocols: ['WIREGUARD', 'XRAY_REALITY', 'VLESS'], maxUsers: 200 },
      { name: 'Belgrade', country: 'Serbia', city: 'Belgrade', ip: '185.212.67.1', protocols: ['WIREGUARD', 'VLESS'], maxUsers: 200 },
      { name: 'New York', country: 'United States', city: 'New York', ip: '198.51.100.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'], maxUsers: 800 },
      { name: 'Los Angeles', country: 'United States', city: 'Los Angeles', ip: '198.51.100.2', protocols: ['WIREGUARD', 'OPENVPN', 'VLESS'], maxUsers: 600 },
      { name: 'San Francisco', country: 'United States', city: 'San Francisco', ip: '198.51.100.3', protocols: ['WIREGUARD', 'VLESS'], maxUsers: 400 },
      { name: 'Toronto', country: 'Canada', city: 'Toronto', ip: '198.51.101.1', protocols: ['WIREGUARD', 'OPENVPN', 'VLESS'], maxUsers: 400 },
      { name: 'Tokyo', country: 'Japan', city: 'Tokyo', ip: '198.51.102.1', protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'], maxUsers: 600 },
      { name: 'Singapore', country: 'Singapore', city: 'Singapore', ip: '198.51.103.1', protocols: ['WIREGUARD', 'OPENVPN', 'VLESS'], maxUsers: 500 },
    ];

    const created = { servers: 0, plans: 0, skipped: 0 };
    for (const s of serversData) {
      try {
        await this.prisma.server.upsert({
          where: { ip: s.ip },
          update: {},
          create: {
            name: s.name, country: s.country, city: s.city, ip: s.ip,
            protocols: s.protocols as any, status: 'ONLINE', maxUsers: s.maxUsers,
            bandwidth: BigInt(10 * 1024 * 1024 * 1024),
          },
        });
        created.servers++;
      } catch { created.skipped++; }
    }

    const plansData = [
      { name: 'Starter', description: 'For personal use', price: 499, currency: 'RUB', duration: 30, trafficLimit: BigInt(50 * 1024 * 1024 * 1024), deviceLimit: 3, protocols: ['WIREGUARD', 'OPENVPN'], regions: ['EU', 'US'], features: ['All servers', 'Email support'], priority: 1 },
      { name: 'Pro', description: 'For power users', price: 1199, currency: 'RUB', duration: 90, trafficLimit: BigInt(200 * 1024 * 1024 * 1024), deviceLimit: 5, protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'], regions: ['ALL'], features: ['All protocols', 'Priority support'], priority: 2 },
      { name: 'Business', description: 'For teams', price: 3999, currency: 'RUB', duration: 365, trafficLimit: BigInt(BigInt(1024) * BigInt(1024) * BigInt(1024) * BigInt(1024)), deviceLimit: 10, protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'], regions: ['ALL'], features: ['Dedicated IP', '24/7 support'], priority: 3 },
    ];

    for (const p of plansData) {
      try {
        const existing = await this.prisma.plan.findFirst({ where: { name: p.name } });
        if (!existing) {
          await this.prisma.plan.create({ data: p as any });
          created.plans++;
        }
      } catch { created.skipped++; }
    }

    return created;
  }
}
