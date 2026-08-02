import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { DevicesModule } from './modules/devices/devices.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PlansModule } from './modules/plans/plans.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { VpnModule } from './modules/vpn/vpn.module';
import { VpnConfigsModule } from './modules/vpn/vpn-configs.module';
import { ServersModule } from './modules/servers/servers.module';
import { TrafficModule } from './modules/traffic/traffic.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { HealthModule } from './modules/health/health.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    SessionsModule,
    DevicesModule,
    SubscriptionsModule,
    PlansModule,
    PaymentsModule,
    InvoicesModule,
    VpnModule,
    VpnConfigsModule,
    ServersModule,
    TrafficModule,
    NotificationsModule,
    ReferralsModule,
    CouponsModule,
    HealthModule,
    EmailModule,
  ],
})
export class AppModule {}
