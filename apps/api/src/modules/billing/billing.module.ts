import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SubscriptionCronService } from './subscription-cron.service';
import { AsaasService } from './asaas.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [BillingController],
  providers: [BillingService, SubscriptionCronService, AsaasService],
  exports: [BillingService, SubscriptionCronService, AsaasService],
})
export class BillingModule {}



