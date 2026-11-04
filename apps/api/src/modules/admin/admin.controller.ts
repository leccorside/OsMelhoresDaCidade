import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ListingStatus } from '@prisma/client';

export class UpdateStatusDto {
  status: ListingStatus;
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

  @Get('listings/pending')
  @ApiOperation({ summary: 'Listar estabelecimentos aguardando moderação' })
  async getPendingListings() {
    return this.adminService.getPendingListings();
  }

  @Patch('listings/:id/status')
  @ApiOperation({ summary: 'Aprovar, rejeitar ou suspender um estabelecimento' })
  async updateListingStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.adminService.updateListingStatus(id, dto.status);
  }
}

