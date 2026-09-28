import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { YooKassaService } from './providers/yookassa.service';
import { CryptoBotService } from './providers/cryptobot.service';
@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, YooKassaService, CryptoBotService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
