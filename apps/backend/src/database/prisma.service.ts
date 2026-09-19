import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 10 }),
      log: ['error'],
    });
  }
  async onModuleInit() {
    await this.$connect();
    await this.$queryRaw`SELECT 1`;
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
