import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private prisma: PrismaService) {}

  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'unknown' as string,
      uptime: process.uptime(),
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      checks.status = 'degraded';
      this.logger.error('Database health check failed');
      throw new ServiceUnavailableException(checks);
    }

    return checks;
  }
}
