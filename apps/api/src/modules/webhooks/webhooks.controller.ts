import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookEndpointDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Integrações Externas & Webhooks')
@Controller('admin/webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os webhooks cadastrados para integrações externas' })
  findAll() {
    return this.webhooksService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo webhook de integração externa' })
  create(@Body() dto: CreateWebhookEndpointDto) {
    return this.webhooksService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover webhook de integração' })
  delete(@Param('id') id: string) {
    return this.webhooksService.delete(id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Disparar ping de teste para o webhook' })
  test(@Param('id') id: string) {
    return this.webhooksService.testWebhook(id);
  }
}
