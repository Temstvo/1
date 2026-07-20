import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const statements = [
      `CREATE TABLE IF NOT EXISTS free_vpn_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        protocol TEXT NOT NULL,
        uri TEXT NOT NULL,
        label TEXT NOT NULL,
        country TEXT NOT NULL,
        country_code TEXT NOT NULL,
        server TEXT NOT NULL,
        list_type TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_checked TIMESTAMPTZ,
        latency INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_free_vpn_configs_protocol ON free_vpn_configs(protocol)`,
      `CREATE INDEX IF NOT EXISTS idx_free_vpn_configs_country ON free_vpn_configs(country)`,
      `CREATE INDEX IF NOT EXISTS idx_free_vpn_configs_list_type ON free_vpn_configs(list_type)`,
      `CREATE INDEX IF NOT EXISTS idx_free_vpn_configs_is_active ON free_vpn_configs(is_active)`,
    ];

    for (const sql of statements) {
      try {
        await this.prisma.$executeRawUnsafe(sql);
      } catch (error: any) {
        this.logger.warn(`Migration statement failed: ${error.message}`);
      }
    }
    this.logger.log('Migration: free_vpn_configs table ensured');
  }
}
