import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { WebPushService, PushSubscriptionDto } from './web-push.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notificações')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly webPushService: WebPushService,
  ) {}

  @Get('mine')
  @ApiOperation({ summary: 'Listar notificações do usuário autenticado e contagem de não lidas' })
  getUserNotifications(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? parseInt(limit, 10) : 20;
    return this.notificationsService.getUserNotifications(user.id, take);
  }

  @Get('push/vapid-key')
  @ApiOperation({ summary: 'Obter chave pública VAPID para registro do Service Worker' })
  getVapidPublicKey() {
    return this.webPushService.getPublicKey();
  }

  @Post('push/subscribe')
  @ApiOperation({ summary: 'Registrar assinatura de notificação Web Push do navegador' })
  subscribePush(
    @CurrentUser() user: any,
    @Body() body: PushSubscriptionDto,
  ) {
    return this.webPushService.saveSubscription(user.id, body);
  }

  @Post('push/unsubscribe')
  @ApiOperation({ summary: 'Cancelar assinatura de notificação Web Push' })
  unsubscribePush(
    @CurrentUser() user: any,
    @Body('endpoint') endpoint: string,
  ) {
    return this.webPushService.removeSubscription(user.id, endpoint);
  }

  @Post('push/test')
  @ApiOperation({ summary: 'Disparar notificação push de teste para o usuário' })
  sendTestPush(@CurrentUser() user: any) {
    return this.webPushService.sendTestNotification(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação específica como lida' })
  markAsRead(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir notificação' })
  deleteNotification(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.notificationsService.deleteNotification(user.id, id);
  }
}

