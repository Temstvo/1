import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VpnConfigSyncService } from './vpn-config-sync.service';
import * as net from 'net';

interface HealthResult {
  configId: string;
  protocol: string;
  server: string;
  reachable: boolean;
  latencyMs: number | null;
  error: string | null;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private consecutiveFailures = new Map<string, number>();
  private deadByHealthCheck = new Set<string>();
  private lastCheckResult: { total: number; alive: number; dead: number; timestamp: Date } | null = null;

  constructor(
    private prisma: PrismaService,
    private syncService: VpnConfigSyncService,
  ) {}

  async runHealthCheck() {
    try {
      await this.performHealthCheck();
    } catch (error: any) {
      this.logger.error(`Health check crashed: ${error?.message || error}`);
      this.lastCheckResult = {
        total: 0,
        alive: 0,
        dead: 0,
        timestamp: new Date(),
      };
    }
  }

  private async performHealthCheck() {
    this.logger.log('Starting VPN config health check...');

    const configs = await this.prisma.vpnConfig.findMany({
      where: { isActive: true },
      select: { id: true, protocol: true, server: true, country: true },
      orderBy: { lastChecked: 'asc' },
      take: 100,
    });

    if (configs.length === 0) {
      this.logger.log('No active configs to check');
      return;
    }

    const results: HealthResult[] = [];
    const batchSize = 10;

    for (let i = 0; i < configs.length; i += batchSize) {
      const batch = configs.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((c) => this.checkConfig(c)),
      );

      for (const r of batchResults) {
        if (r.status === 'fulfilled') results.push(r.value);
      }
    }

    const alive = results.filter((r) => r.reachable).length;
    const dead = results.filter((r) => !r.reachable).length;

    this.lastCheckResult = {
      total: results.length,
      alive,
      dead,
      timestamp: new Date(),
    };

    this.logger.log(`Health check complete: ${alive} alive, ${dead} dead out of ${results.length}`);

    // Mark dead configs
    for (const result of results) {
      if (!result.reachable) {
        const fails = (this.consecutiveFailures.get(result.configId) || 0) + 1;
        this.consecutiveFailures.set(result.configId, fails);

        if (fails >= 3) {
          await this.markConfigDead(result.configId, fails);
        }
      } else {
        this.consecutiveFailures.delete(result.configId);

        // Re-activate only configs that were deactivated by health check itself,
        // not ones removed from sources by the sync
        if (this.deadByHealthCheck.has(result.configId)) {
          await this.prisma.vpnConfig.update({
            where: { id: result.configId },
            data: { isActive: true, lastChecked: new Date() },
          });
          this.deadByHealthCheck.delete(result.configId);
          this.logger.log(`Re-activated config ${result.configId} (${result.server})`);
        }
      }
    }

    // If more than 30% dead, trigger re-sync
    if (results.length > 0 && dead / results.length > 0.3) {
      this.logger.warn(`High failure rate: ${dead}/${results.length} dead. Triggering re-sync...`);
      try {
        const syncResult = await this.syncService.syncAll();
        this.logger.log(`Emergency re-sync completed: ${JSON.stringify(syncResult)}`);
      } catch (e: any) {
        this.logger.error(`Emergency re-sync failed: ${e.message}`);
      }
    }

    // Cleanup old failure counts for configs not in current check
    const checkedIds = new Set(results.map((r) => r.configId));
    for (const [id] of this.consecutiveFailures) {
      if (!checkedIds.has(id)) {
        this.consecutiveFailures.delete(id);
      }
    }
  }

  private async checkConfig(config: { id: string; protocol: string; server: string; country: string }): Promise<HealthResult> {
    const start = Date.now();
    const [host, portStr] = config.server.split(':');
    const port = parseInt(portStr || '443', 10);

    try {
      const reachable = await this.tcpProbe(host, port, 5000);
      const latencyMs = reachable ? Date.now() - start : null;

      return {
        configId: config.id,
        protocol: config.protocol,
        server: config.server,
        reachable,
        latencyMs,
        error: reachable ? null : 'Connection refused or timeout',
      };
    } catch (e: any) {
      return {
        configId: config.id,
        protocol: config.protocol,
        server: config.server,
        reachable: false,
        latencyMs: null,
        error: e.message,
      };
    }
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

  private async markConfigDead(configId: string, failCount: number) {
    await this.prisma.vpnConfig.update({
      where: { id: configId },
      data: { isActive: false, lastChecked: new Date() },
    });

    this.deadByHealthCheck.add(configId);
    this.logger.warn(`Marked config ${configId} as dead after ${failCount} consecutive failures`);
    this.consecutiveFailures.delete(configId);
  }

  async getHealthStatus() {
    return {
      lastCheck: this.lastCheckResult,
      activeConfigs: await this.prisma.vpnConfig.count({ where: { isActive: true } }),
    };
  }

  async forceCheck() {
    await this.runHealthCheck();
    return this.lastCheckResult;
  }
}
