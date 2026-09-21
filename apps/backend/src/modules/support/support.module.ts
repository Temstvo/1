import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';

@Module({
  imports: [],
  controllers: [SupportController],
  providers: [],
  exports: [],
})
export class SupportModule {}
