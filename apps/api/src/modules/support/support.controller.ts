import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateSupportTicketDto, ReplySupportTicketDto } from './dto/support.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Suporte & Atendimento ao Lojista')
@Controller('support/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiOperation({ summary: 'Abrir novo chamado de suporte (Comerciante)' })
  createTicket(@CurrentUser() user: any, @Body() dto: CreateSupportTicketDto) {
    return this.supportService.createTicket(user, dto);
  }

  @Get('my')
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiOperation({ summary: 'Listar chamados do lojista logado' })
  getMyTickets(@CurrentUser() user: any) {
    return this.supportService.getMerchantTickets(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Visualizar detalhes e histórico de mensagens de um chamado' })
  getTicketDetails(@CurrentUser() user: any, @Param('id') id: string) {
    return this.supportService.getTicketDetails(user, id);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Enviar mensagem de resposta em um chamado' })
  replyTicket(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ReplySupportTicketDto,
  ) {
    return this.supportService.replyTicket(user, id, dto);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Marcar chamado como resolvido / concluído' })
  resolveTicket(@CurrentUser() user: any, @Param('id') id: string) {
    return this.supportService.resolveTicket(user, id);
  }
}
