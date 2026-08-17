import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL || '';
    const params: string[] = [];
    if (!databaseUrl.includes('connection_limit=')) params.push('connection_limit=5');
    if (!databaseUrl.includes('pool_timeout=')) params.push('pool_timeout=10');
    if (!databaseUrl.includes('pgbouncer=')) params.push('pgbouncer=true');
    const sep = databaseUrl.includes('?') ? '&' : '?';
    const url = params.length > 0 ? `${databaseUrl}${sep}${params.join('&')}` : databaseUrl;
    const adapter = new PrismaPg({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 1,
      connectionTimeoutMillis: 15000,
    });
    super({
      adapter,
      log: ['error', 'warn'],
    });
    this.logger.log(`Connecting to database: ${url.replace(/:[^:@]+@/, ':***@')}`);
  }

  async onModuleInit() {
    try {
      await Promise.race([
        this.$queryRawUnsafe('SELECT 1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('connect timeout')), 10000)),
      ]);
      this.logger.log('Database connected');
    } catch (error: any) {
      this.logger.warn(`Database connection delayed: ${error?.message || error}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'production') {
      const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

      return Promise.all(
        models.map((modelKey) => {
          const model = this[modelKey as keyof typeof this];
          if (typeof model === 'object' && model !== null && 'deleteMany' in model) {
            return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
          }
          return null;
        }),
      );
    }
  }
}
