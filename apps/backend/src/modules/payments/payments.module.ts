import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { YooKassaService } from './providers/yookassa.service';
@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, YooKassaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
