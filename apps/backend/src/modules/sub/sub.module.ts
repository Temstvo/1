import { Module } from '@nestjs/common';
import { SubService } from './sub.service';
import { SubController } from './sub.controller';

@Module({
  controllers: [SubController],
  providers: [SubService],
  exports: [SubService],
})
export class SubModule {}
