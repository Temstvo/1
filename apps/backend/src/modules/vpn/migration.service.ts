import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  async onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL || '';
    const params: string[] = [];
    if (!databaseUrl.includes('connection_limit=')) params.push('connection_limit=2');
    if (!databaseUrl.includes('pool_timeout=')) params.push('pool_timeout=10');
    if (!databaseUrl.includes('pgbouncer=')) params.push('pgbouncer=true');
    const sep = databaseUrl.includes('?') ? '&' : '?';
    const url = params.length > 0 ? `${databaseUrl}${sep}${params.join('&')}` : databaseUrl;

    const client = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        max: 1,
        idleTimeoutMillis: 1,
        connectionTimeoutMillis: 15000,
      }),
      log: ['error'],
    });
    try {
      await this.runMigrations(client);
    } catch (error: any) {
      this.logger.error(`Migration failed: ${error?.message || error}`);
    } finally {
      try {
        await Promise.race([
          client.$disconnect(),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);
      } catch {
        /* noop */
      }
    }
    this.logger.log('Migration: free_vpn_configs table ensured');
  }

  private async runMigrations(client: PrismaClient) {
    try {
      const exists = await client.$queryRawUnsafe(
        `SELECT to_regclass('public.free_vpn_configs') IS NOT NULL AS exists`,
      );
      if (exists && (exists as any)[0]?.exists === true) {
        this.logger.log('Migration: schema already present, skipping DDL');
        return;
      }
    } catch {
      /* fall through to DDL */
    }

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
      `DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_hash TEXT;
      EXCEPTION WHEN duplicate_column THEN null; END $$`,
      `DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_hash TEXT;
      EXCEPTION WHEN duplicate_column THEN null; END $$`,
    ];

    let attempts = 0;
    while (attempts < 10) {
      attempts += 1;
      let ok = true;
      for (const sql of statements) {
        try {
          await Promise.race([
            client.$executeRawUnsafe(sql),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('statement timeout')), 20000),
            ),
          ]);
        } catch (error: any) {
          ok = false;
          this.logger.warn(`Migration statement failed (pass ${attempts}/10): ${error.message}`);
          break;
        }
      }
      if (ok) break;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}
