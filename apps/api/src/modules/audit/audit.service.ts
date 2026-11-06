import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateAuditLogParams {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface GetAuditLogsQuery {
  action?: string;
  entity?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra uma ação administrativa de forma segura e não bloqueante.
   */
  async log(params: CreateAuditLogParams): Promise<any> {
    try {
      const record = await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          userName: params.userName,
          userEmail: params.userEmail,
          userRole: params.userRole,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          details: params.details ? (typeof params.details === 'object' ? params.details : { message: params.details }) : undefined,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });

      this.logger.log(`[AUDIT] Ação registrada: ${params.action} em ${params.entity} por ${params.userName || params.userEmail || 'Sistema'}`);
      return record;
    } catch (err: any) {
      this.logger.error(`[AUDIT ERROR] Falha ao registrar log de auditoria: ${err.message}`, err.stack);
      return null;
    }
  }

  /**
   * Consulta os registros de auditoria com suporte a filtros e busca textual.
   */
  async getAuditLogs(query: GetAuditLogsQuery = {}) {
    const limit = Math.min(Number(query.limit) || 50, 100);
    const offset = Number(query.offset) || 0;

    const where: any = {};

    if (query.action && query.action !== 'ALL') {
      where.action = query.action;
    }

    if (query.entity && query.entity !== 'ALL') {
      where.entity = query.entity;
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { userName: { contains: s, mode: 'insensitive' } },
        { userEmail: { contains: s, mode: 'insensitive' } },
        { entityId: { contains: s, mode: 'insensitive' } },
        { action: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }

  /**
   * Retorna estatísticas gerais da trilha de auditoria para o dashboard administrativo.
   */
  async getAuditStats() {
    const totalCount = await this.prisma.auditLog.count();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24hCount = await this.prisma.auditLog.count({
      where: { createdAt: { gte: oneDayAgo } },
    });

    const recentPayouts = await this.prisma.auditLog.count({
      where: { action: { contains: 'PAYOUT' } },
    });

    const recentConfigChanges = await this.prisma.auditLog.count({
      where: { action: { in: ['UPDATE_CITY_SPLIT', 'COUPON_CREATED', 'CITY_CREATED'] } },
    });

    return {
      totalCount,
      last24hCount,
      recentPayouts,
      recentConfigChanges,
    };
  }

  /**
   * Exporta logs de auditoria formatados em CSV para controle contábil e fiscal.
   */
  async exportAuditLogsCsv(query: GetAuditLogsQuery = {}): Promise<string> {
    const where: any = {};

    if (query.action && query.action !== 'ALL') {
      where.action = query.action;
    }

    if (query.entity && query.entity !== 'ALL') {
      where.entity = query.entity;
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { userName: { contains: s, mode: 'insensitive' } },
        { userEmail: { contains: s, mode: 'insensitive' } },
        { entityId: { contains: s, mode: 'insensitive' } },
        { action: { contains: s, mode: 'insensitive' } },
      ];
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 2000,
    });

    // Cabeçalhos compatíveis com Excel em pt-BR (separador ponto-e-vírgula)
    const header = [
      'Data e Hora (ISO)',
      'Data Formatada',
      'Acao',
      'Entidade',
      'ID da Entidade',
      'Operador',
      'E-mail',
      'Papel / Perfil',
      'IP de Origem',
      'Detalhes Estruturados',
    ].map((col) => `"${col}"`).join(';');

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${s}"`;
    };

    const rows = logs.map((l) => {
      const dateIso = l.createdAt.toISOString();
      const dateFormatted = new Date(l.createdAt).toLocaleString('pt-BR');
      const detailsStr = l.details ? JSON.stringify(l.details) : '';

      return [
        escapeCsv(dateIso),
        escapeCsv(dateFormatted),
        escapeCsv(l.action),
        escapeCsv(l.entity),
        escapeCsv(l.entityId || ''),
        escapeCsv(l.userName || 'Sistema'),
        escapeCsv(l.userEmail || ''),
        escapeCsv(l.userRole || ''),
        escapeCsv(l.ipAddress || ''),
        escapeCsv(detailsStr),
      ].join(';');
    });

    // Byte Order Mark (BOM) UTF-8 para garantir abertura correta no Microsoft Excel
    return `\uFEFF${header}\n${rows.join('\n')}`;
  }
}
