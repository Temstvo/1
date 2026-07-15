import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL || '';
    const url = databaseUrl.includes('sslmode=') ? databaseUrl : `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}sslmode=require`;
    super({
      datasourceUrl: url,
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected');
    } catch (error) {
      this.logger.error('Database connection failed', error);
      throw error;
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
