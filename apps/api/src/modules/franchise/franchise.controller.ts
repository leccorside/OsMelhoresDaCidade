import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FranchiseService } from './franchise.service';
import { UpdateLeadPipelineDto } from './dto/franchise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Franquias Regionais')
@Controller('franchise')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.FRANCHISEE, Role.ADMIN)
@ApiBearerAuth()
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Visão geral da franquia da cidade (estabelecimentos, faturamento e comissão)' })
  getOverview(@CurrentUser() user: any, @Query('cityId') cityId?: string) {
    return this.franchiseService.getFranchiseOverview(user.id, cityId);
  }

  @Get('merchants')
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
  @ApiOperation({ summary: 'Atualizar estágio do lead no funil de prospecção do franqueado' })
  updateLeadPipeline(
    @CurrentUser() user: any,
    @Param('listingId') listingId: string,
    @Body() dto: UpdateLeadPipelineDto,
  ) {
    return this.franchiseService.updateLeadPipeline(user.id, listingId, dto);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Histórico de assinaturas e split da cidade da franquia' })
  getSubscriptions(@CurrentUser() user: any, @Query('cityId') cityId?: string) {
    return this.franchiseService.getFranchiseSubscriptions(user.id, cityId);
  }
}
