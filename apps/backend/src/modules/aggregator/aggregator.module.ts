import { Module } from '@nestjs/common';
import { AggregatorService } from './aggregator.service';
import { AggregatorScheduler } from './aggregator.scheduler';
import { AggregatorController } from './aggregator.controller';

@Module({
  controllers: [AggregatorController],
  providers: [AggregatorService, AggregatorScheduler],
  exports: [AggregatorService],
})
export class AggregatorModule {}
