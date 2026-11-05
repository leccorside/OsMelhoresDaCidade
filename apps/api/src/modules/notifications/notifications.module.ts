import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { WebPushService } from './web-push.service';
import { WhatsAppBotService } from './whatsapp-bot.service';
import { NotificationsController } from './notifications.controller';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, WebPushService, WhatsAppBotService],
  exports: [NotificationsService, WebPushService, WhatsAppBotService],
})
export class NotificationsModule {}
