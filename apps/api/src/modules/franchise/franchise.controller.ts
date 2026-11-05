import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FranchiseService } from './franchise.service';
import { WhatsAppBotService } from '../notifications/whatsapp-bot.service';
import { UpdateLeadPipelineDto, CreateFranchiseLeadDto } from './dto/franchise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Franquias Regionais')
@Controller('franchise')
export class FranchiseController {
  constructor(
    private readonly franchiseService: FranchiseService,
    private readonly whatsAppBot: WhatsAppBotService,
  ) {}

  @Post('lead')
  @ApiOperation({ summary: 'Enviar candidatura e interesse para abertura de nova franquia regional (Público)' })
  createLead(@Body() dto: CreateFranchiseLeadDto) {
    return this.franchiseService.createFranchiseLead(dto);
  }

  @Get('leads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar candidaturas de novos franqueados para moderação e expansão' })
  getLeads() {
    return this.franchiseService.getFranchiseLeads();
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FRANCHISEE, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Visão geral da franquia da cidade (estabelecimentos, faturamento e comissão)' })
  getOverview(@CurrentUser() user: any, @Query('cityId') cityId?: string) {
    return this.franchiseService.getFranchiseOverview(user.id, cityId);
  }

  @Get('merchants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FRANCHISEE, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar comércios e anunciantes da cidade da franquia' })
  getMerchants(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('cityId') cityId?: string,
  ) {
    return this.franchiseService.getFranchiseMerchants(user.id, {
      search,
      status,
      requestedCityId: cityId,
    });
  }

  @Patch('merchants/:listingId/pipeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FRANCHISEE, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar estágio do lead no funil de prospecção do franqueado' })
  updateLeadPipeline(
    @CurrentUser() user: any,
    @Param('listingId') listingId: string,
    @Body() dto: UpdateLeadPipelineDto,
  ) {
    return this.franchiseService.updateLeadPipeline(user.id, listingId, dto);
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FRANCHISEE, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Histórico de assinaturas e split da cidade da franquia' })
  getSubscriptions(@CurrentUser() user: any, @Query('cityId') cityId?: string) {
    return this.franchiseService.getFranchiseSubscriptions(user.id, cityId);
  }

  @Post('test-whatsapp-alert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FRANCHISEE, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disparar teste de alerta de novo lead para o WhatsApp do franqueado' })
  async testWhatsAppAlert(@CurrentUser() user: any, @Body('phone') phone?: string) {
    const targetPhone = phone || user.phone || '77999999999';
    const result = await this.whatsAppBot.sendFranchiseeTestAlert(
      targetPhone,
      user.name || 'Franqueado Parceiro',
      'Praça Regional',
    );
    return {
      success: true,
      message: `Mensagem de teste enviada para +${result.phone}!`,
      result,
    };
  }

}
