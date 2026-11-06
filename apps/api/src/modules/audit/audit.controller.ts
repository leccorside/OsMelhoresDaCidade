import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Auditoria')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar registros e trilha de auditoria do sistema' })
  getAuditLogs(
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.auditService.getAuditLogs({
      action,
      entity,
      search,
      limit,
      offset,
    });
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar logs de auditoria em formato CSV / Planilha Excel' })
  async exportAuditCsv(
    @Res() res: Response,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('search') search?: string,
  ) {
    const csvData = await this.auditService.exportAuditLogsCsv({
      action,
      entity,
      search,
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="trilha_auditoria_${dateStr}.csv"`,
    );
    return res.status(200).send(csvData);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter resumo e métricas de auditoria' })
  getAuditStats() {
    return this.auditService.getAuditStats();
  }
}
