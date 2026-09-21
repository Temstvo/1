import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PaymentsModule } from '../payments/payments.module';
import { TrialService } from './trial.service';
@Module({
  imports: [PaymentsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, TrialService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
