import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ListingStatus, CouponStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(ListingStatus)
  status: ListingStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCouponStatusAdminDto {
  @IsEnum(CouponStatus)
  status: CouponStatus;
}

export class BroadcastNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  targetRole?: string;
}

@ApiTags('Administrador Master')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Obter indicadores e métricas globais da plataforma' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('moderation/stats')
  @ApiOperation({ summary: 'Obter indicadores da fila de moderação editorial' })
  async getModerationStats() {
    return this.adminService.getModerationStats();
  }

  @Get('listings/pending')
  @ApiOperation({ summary: 'Listar estabelecimentos aguardando moderação' })
  async getPendingListings() {
    return this.adminService.getPendingListings();
  }

  @Patch('listings/:id/status')
  @ApiOperation({ summary: 'Aprovar, rejeitar ou suspender um estabelecimento' })
  async updateListingStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.adminService.updateListingStatus(id, dto.status, dto.notes);
  }

  // --- MODERAÇÃO DE CUPONS ---

  @Get('coupons')
  @ApiOperation({ summary: 'Listar todos os cupons da plataforma para moderação' })
  async getAdminCoupons(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.findAllCoupons({ status, search });
  }

  @Patch('coupons/:id/status')
  @ApiOperation({ summary: 'Alterar status de um cupom promocional como admin' })
  async updateCouponStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCouponStatusAdminDto,
  ) {
    return this.adminService.updateCouponStatusAdmin(id, dto.status);
  }

  // --- COMUNICADOS EM MASSA ---

  @Post('notifications/broadcast')
  @ApiOperation({ summary: 'Enviar notificação em massa para lojistas ou usuários' })
  async broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    return this.adminService.broadcastNotification(dto);
  }
}

