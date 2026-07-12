import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from '../../database/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => PaymentsModule),
    forwardRef(() => CouponsModule),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
