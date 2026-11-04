import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notificações')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('mine')
  @ApiOperation({ summary: 'Listar notificações do usuário autenticado e contagem de não lidas' })
  getUserNotifications(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? parseInt(limit, 10) : 20;
    return this.notificationsService.getUserNotifications(user.id, take);
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

