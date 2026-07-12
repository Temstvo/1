import { Module } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { TrafficController } from './traffic.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [TrafficController],
  providers: [TrafficService, PrismaService],
  exports: [TrafficService],
})
export class TrafficModule {}
