import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../../database/prisma.module';
import { YooKassaService } from './providers/yookassa.service';
import { CryptomusService } from './providers/cryptomus.service';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [PrismaModule, InvoicesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, YooKassaService, CryptomusService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
