import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VpnService } from './vpn.service';
import { HealthCheckService } from './health-check.service';
import { Protocol } from '@prisma/client';
import * as net from 'net';

export interface NodeCandidate {
  source: 'FREE' | 'OWN';
  id: string;
  protocol: string;
  country: string;
  countryCode: string;
  endpoint: string;
  score: number;
  uri?: string;
  serverId?: string;
}

interface AssignOptions {
  protocol?: string;
  country?: string;
  fallbackCount?: number;
  exclude?: string;
}

@Injectable()
export class NodeRegistryService {
  private readonly logger = new Logger(NodeRegistryService.name);

  constructor(
    private prisma: PrismaService,
    private vpnService: VpnService,
    private healthCheckService: HealthCheckService,
  ) {}

  async getCandidates(filters?: { protocol?: string; country?: string }): Promise<NodeCandidate[]> {
    const [freeConfigs, ownServers] = await Promise.all([
      this.prisma.vpnConfig.findMany({
        where: { isActive: true },
        select: {
          id: true,
          protocol: true,
          country: true,
          countryCode: true,
          server: true,
          latency: true,
          lastChecked: true,
        },
        orderBy: [
          { latency: { sort: 'asc', nulls: 'last' } },
          { lastChecked: { sort: 'desc', nulls: 'last' } },
        ],
        take: 60,
      }),
      this.prisma.server.findMany({
        where: { status: 'ONLINE' },
        select: {
          id: true,
          protocols: true,
          country: true,
          ip: true,
          load: true,
          latency: true,
          packetLoss: true,
          lastHealthCheck: true,
        },
      }),
    ]);

    const candidates: NodeCandidate[] = [];

    for (const c of freeConfigs) {
      candidates.push({
        source: 'FREE',
        id: c.id,
        protocol: c.protocol,
        country: c.country,
        countryCode: c.countryCode,
        endpoint: c.server,
        score: this.scoreFree(c.latency ?? null, c.lastChecked),
      });
    }

    for (const s of ownServers) {
      for (const protocol of s.protocols) {
        candidates.push({
          source: 'OWN',
          id: s.id,
          protocol: protocol.toLowerCase(),
          country: s.country,
          countryCode: '',
          endpoint: `${s.ip}:${this.defaultPort(protocol)}`,
          score: this.scoreOwn(s.load, s.latency, s.packetLoss, s.lastHealthCheck),
          serverId: s.id,
        });
      }
    }

    const filtered = candidates.filter((c) => {
      if (filters?.protocol && c.protocol.toLowerCase() !== filters.protocol.toLowerCase())
        return false;
      if (filters?.country && !c.country.toLowerCase().includes(filters.country.toLowerCase()))
        return false;
      return true;
    });

    return filtered.sort((a, b) => b.score - a.score);
  }

  async assignBest(userId: string, opts: AssignOptions = {}) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const hasSubscription = user.subscriptions.some(
      (s) => s.status === 'ACTIVE' || s.status === 'GRACE_PERIOD',
    );

    const candidates = await this.getCandidates({
      protocol: opts.protocol,
      country: opts.country,
    });

    if (candidates.length === 0) {
      throw new NotFoundException('Нет доступных узлов');
    }

    const fallbackCount = Math.min(opts.fallbackCount ?? 3, 5);
    let pool = candidates;

    if (opts.exclude) {
      pool = pool.filter((c) => c.id !== opts.exclude);
    }

    if (hasSubscription) {
      const own = pool.filter((c) => c.source === 'OWN');
      const free = pool.filter((c) => c.source === 'FREE');
      pool = own.length > 0 ? [...own, ...free] : free;
    } else {
      pool = pool.filter((c) => c.source === 'FREE');
      if (pool.length === 0) {
        throw new NotFoundException('Нет доступных бесплатных узлов');
      }
    }

    // Probe candidates on the fly so dead configs are replaced with live ones
    const probeLimit = Math.min(pool.length, 12);
    const probed = await Promise.all(
      pool.slice(0, probeLimit).map(async (c) => {
        const [host, portStr] = c.endpoint.split(':');
        const port = parseInt(portStr || '443', 10);
        const alive = await this.tcpProbe(host, port, 3500);
        if (!alive && c.source === 'FREE') {
          this.healthCheckService.reportFailure(c.id).catch(() => {});
        }
        return { candidate: c, alive };
      }),
    );

    const alive = probed.filter((p) => p.alive).map((p) => p.candidate);
    const best = alive.length > 0 ? alive[0] : pool[0];
    const fallbackSource = alive.length > 1 ? alive : pool;
    const fallbacks = fallbackSource
      .filter((c) => c.id !== best.id)
      .slice(0, fallbackCount)
      .map((c) => ({
        id: c.id,
        source: c.source,
        protocol: c.protocol,
        country: c.country,
        endpoint: c.endpoint,
        score: c.score,
      }));

    if (best.source === 'OWN') {
      const protocol = best.protocol.toUpperCase() as Protocol;
      const config = await this.vpnService.generateConfig(userId, best.serverId!, protocol);
      return {
        node: {
          id: best.id,
          source: best.source,
          protocol: best.protocol,
          country: best.country,
          endpoint: best.endpoint,
          score: best.score,
        },
        ...config,
        fallbacks,
      };
    }

    const full = await this.prisma.vpnConfig.findUnique({ where: { id: best.id } });
    return {
      node: {
        id: best.id,
        source: best.source,
        protocol: best.protocol,
        country: best.country,
        endpoint: best.endpoint,
        score: best.score,
      },
      uri: full?.uri ?? null,
      configId: best.id,
      fallbacks,
    };
  }

  async getRegistryStatus() {
    const candidates = await this.getCandidates();
    const byProtocol: Record<string, number> = {};
    const bySource = { free: 0, own: 0 };

    for (const c of candidates) {
      byProtocol[c.protocol] = (byProtocol[c.protocol] || 0) + 1;
      if (c.source === 'FREE') bySource.free++;
      else bySource.own++;
    }

    return {
      total: candidates.length,
      bySource,
      byProtocol,
      best: candidates.slice(0, 5),
    };
  }

  private tcpProbe(host: string, port: number, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let settled = false;

      const done = (result: boolean) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(result);
      };

      socket.setTimeout(timeoutMs);
      socket.on('connect', () => done(true));
      socket.on('timeout', () => done(false));
      socket.on('error', () => done(false));

      socket.connect(port, host);
    });
  }

  private scoreFree(latency: number | null, lastChecked: Date | null): number {
    let score = 50;
    const lat = latency && latency > 0 ? latency : 200;
    score += Math.max(0, 100 - lat / 5);
    if (lastChecked) {
      const hours = (Date.now() - lastChecked.getTime()) / 3_600_000;
      score += Math.max(0, 20 - hours);
    }
    return Math.round(score);
  }

  private scoreOwn(
    load: number,
    latency: number,
    packetLoss: number,
    lastHealthCheck: Date | null,
  ): number {
    let score = 60;
    score += Math.max(0, (1 - load / 100) * 40);
    if (latency > 0) score += Math.max(0, 100 - latency / 5);
    score += Math.max(0, (1 - packetLoss) * 20);
    if (lastHealthCheck) {
      const hours = (Date.now() - lastHealthCheck.getTime()) / 3_600_000;
      if (hours > 24) score -= 30;
      else score += Math.max(0, 15 - hours);
    }
    return Math.round(score);
  }

  private defaultPort(protocol: Protocol | string): number {
    switch (protocol.toUpperCase()) {
      case 'WIREGUARD':
        return 51820;
      case 'OPENVPN':
        return 1194;
      default:
        return 443;
    }
  }
}
