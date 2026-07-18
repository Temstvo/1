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

}
