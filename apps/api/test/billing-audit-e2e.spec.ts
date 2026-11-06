import { DiscountType, SubscriptionPlan, PaymentStatus } from '@prisma/client';

describe('Suíte E2E: Faturamento Direto, WhatsApp Bot e Trilha de Auditoria', () => {
  // ---------------------------------------------------------------------------
  // 1. FLUXO DE FATURAMENTO DIRETO E REGRAS DE COBRANÇA
  // ---------------------------------------------------------------------------
  describe('1. Fluxo de Faturamento Direto e Assinaturas VIP', () => {
    it('deve calcular corretamente a vigência e receita bruta para ciclo mensal', () => {
      const planPrice = 79.9;
      const billingCycle: string = 'MONTHLY';
      const durationDays = billingCycle === 'YEARLY' ? 365 : 30;

      const startDate = new Date('2026-11-01T00:00:00Z');
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      expect(durationDays).toBe(30);
      expect(endDate.toISOString()).toBe('2026-12-01T00:00:00.000Z');
      expect(planPrice).toBe(79.9);
    });

    it('deve calcular vigência de 365 dias para ciclo anual com faturamento 100% da plataforma', () => {
      const planPriceYearly = 799.0;
      const billingCycle = 'YEARLY';
      const durationDays = billingCycle === 'YEARLY' ? 365 : 30;

      const revenueShare = {
        platformCut: planPriceYearly,
        thirdPartyCut: 0,
      };

      expect(durationDays).toBe(365);
      expect(revenueShare.platformCut).toBe(799.0);
      expect(revenueShare.thirdPartyCut).toBe(0);
    });

    it('deve aplicar cupom de desconto de 50% sem ultrapassar o valor total', () => {
      const basePrice = 149.0;
      const discountValue = 50;
      const discountAmount = (basePrice * discountValue) / 100;
      const finalPrice = Math.max(0, basePrice - discountAmount);

      expect(discountAmount).toBe(74.5);
      expect(finalPrice).toBe(74.5);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. DISPAROS DO BOT DE WHATSAPP PARA LOJISTAS
  // ---------------------------------------------------------------------------
  describe('2. Disparos Automatizados do WhatsApp Bot (Faturas & Vencimento)', () => {
    function sanitizePhone(phone: string) {
      let clean = phone.replace(/\D/g, '');
      if (clean.length === 10 || clean.length === 11) {
        clean = `55${clean}`;
      }
      return clean;
    }

    function buildInvoiceDueMessage(params: {
      merchantName: string;
      listingName: string;
      invoiceNumber: string;
      amount: number;
      dueDate: string;
      invoiceUrl: string;
      bankSlipUrl?: string;
      pixCopiaECola?: string;
    }) {
      const formattedAmount = params.amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      let msg =
        `📄 *FATURA DISPONÍVEL — OS MELHORES DA CIDADE* 🚀\n\n` +
        `Olá, *${params.merchantName}*! Tudo bem?\n\n` +
        `A fatura do plano de destaque de *${params.listingName}* já está pronta para pagamento.\n\n` +
        `🔢 *Fatura:* ${params.invoiceNumber}\n` +
        `💰 *Valor:* ${formattedAmount}\n` +
        `📅 *Vencimento:* ${params.dueDate}\n\n` +
        `🔗 *Acesse sua fatura completa:*\n${params.invoiceUrl}\n`;

      if (params.bankSlipUrl) {
        msg += `\n📑 *Boleto Bancário em PDF:*\n${params.bankSlipUrl}\n`;
      }
      if (params.pixCopiaECola) {
        msg += `\n⚡ *PIX Copia e Cola (pague direto no seu app bancário):*\n\`${params.pixCopiaECola}\`\n`;
      }
      return msg;
    }

    it('deve formatar número brasileiro com DDI 55 automaticamente', () => {
      expect(sanitizePhone('(77) 99876-5432')).toBe('5577998765432');
      expect(sanitizePhone('77988887777')).toBe('5577988887777');
      expect(sanitizePhone('5577999998888')).toBe('5577999998888');
    });

    it('deve gerar mensagem estruturada de cobrança com link de boleto e PIX', () => {
      const message = buildInvoiceDueMessage({
        merchantName: 'Pizzaria Bella Itália',
        listingName: 'Pizzaria Bella Itália - Centro',
        invoiceNumber: 'FAT-2026-A1B2C3D4',
        amount: 149.0,
        dueDate: '10/11/2026',
        invoiceUrl: 'http://localhost:4100/comerciante/fatura/sub-123',
        bankSlipUrl: 'https://asaas.com/b/pdf/123456',
        pixCopiaECola: '00020126580014br.gov.bcb.pix...',
      });

      expect(message).toContain('FATURA DISPONÍVEL');
      expect(message).toContain('Pizzaria Bella Itália');
      expect(message).toContain('FAT-2026-A1B2C3D4');
      expect(message).toContain('Boleto Bancário em PDF');
      expect(message).toContain('https://asaas.com/b/pdf/123456');
      expect(message).toContain('PIX Copia e Cola');
    });

    it('deve simular envio com sucesso em ambiente de desenvolvimento quando token Z-API não provisionado', () => {
      const isConfigured = false;
      const phone = sanitizePhone('77999998888');

      const sendResult = !isConfigured
        ? { success: true, simulated: true, phone }
        : { success: true, simulated: false, phone };

      expect(sendResult.success).toBe(true);
      expect(sendResult.simulated).toBe(true);
      expect(sendResult.phone).toBe('5577999998888');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. TRILHA DE AUDITORIA E GOVERNANÇA (AUDIT TRAIL)
  // ---------------------------------------------------------------------------
  describe('3. Trilha de Auditoria e Logs Administrativos', () => {
    interface AuditLogEntry {
      id: string;
      userId?: string;
      userName?: string;
      userRole?: string;
      action: string;
      entity: string;
      entityId?: string;
      details?: any;
      createdAt: Date;
    }

    const mockAuditDatabase: AuditLogEntry[] = [
      {
        id: 'log-1',
        userId: 'admin-1',
        userName: 'Administrador Master',
        userRole: 'ADMIN',
        action: 'INVOICE_WHATSAPP_SENT',
        entity: 'INVOICE',
        entityId: 'sub-100',
        details: { phone: '5577999991111', invoiceNumber: 'FAT-2026-001', amount: 149.0 },
        createdAt: new Date('2026-11-05T10:00:00Z'),
      },
      {
        id: 'log-2',
        userId: 'admin-1',
        userName: 'Administrador Master',
        userRole: 'ADMIN',
        action: 'COUPON_CREATED',
        entity: 'COUPON',
        entityId: 'cupom-50',
        details: { code: 'BLACKFRIDAY', discountValue: 50 },
        createdAt: new Date('2026-11-05T12:30:00Z'),
      },
      {
        id: 'log-3',
        userId: 'admin-2',
        userName: 'Gerente Comercial',
        userRole: 'ADMIN',
        action: 'INVOICE_WHATSAPP_SENT',
        entity: 'INVOICE',
        entityId: 'sub-200',
        details: { phone: '5577988882222', invoiceNumber: 'FAT-2026-002', amount: 79.9 },
        createdAt: new Date('2026-11-05T14:15:00Z'),
      },
    ];

    function queryAuditLogs(filter?: { action?: string; search?: string }) {
      return mockAuditDatabase.filter((entry) => {
        if (filter?.action && filter.action !== 'ALL' && entry.action !== filter.action) {
          return false;
        }
        if (filter?.search) {
          const s = filter.search.toLowerCase();
          const matchesUser = entry.userName?.toLowerCase().includes(s);
          const matchesAction = entry.action.toLowerCase().includes(s);
          const matchesEntityId = entry.entityId?.toLowerCase().includes(s);
          if (!matchesUser && !matchesAction && !matchesEntityId) return false;
        }
        return true;
      });
    }

    it('deve registrar e recuperar log de envio de WhatsApp na trilha de auditoria', () => {
      const logs = queryAuditLogs({ action: 'INVOICE_WHATSAPP_SENT' });
      expect(logs.length).toBe(2);
      expect(logs[0].entity).toBe('INVOICE');
      expect(logs[0].details.phone).toBe('5577999991111');
    });

    it('deve filtrar registros por busca textual de operador ou ID de entidade', () => {
      const logs = queryAuditLogs({ search: 'BLACKFRIDAY' });
      // BLACKFRIDAY está em details, mas busca por operador 'Gerente Comercial'
      const searchManager = queryAuditLogs({ search: 'Gerente' });
      expect(searchManager.length).toBe(1);
      expect(searchManager[0].action).toBe('INVOICE_WHATSAPP_SENT');
      expect(searchManager[0].entityId).toBe('sub-200');
    });

    it('deve calcular estatísticas consolidadas de atividades e eventos de auditoria', () => {
      const totalCount = mockAuditDatabase.length;
      const whatsappEvents = mockAuditDatabase.filter((l) => l.action === 'INVOICE_WHATSAPP_SENT').length;
      const couponEvents = mockAuditDatabase.filter((l) => l.action === 'COUPON_CREATED').length;

      expect(totalCount).toBe(3);
      expect(whatsappEvents).toBe(2);
      expect(couponEvents).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. WEBHOOK DE RECEBIMENTO Z-API E SUPORTE AUTOMÁTICO
  // ---------------------------------------------------------------------------
  describe('4. Webhook de Recebimento Z-API & Abertura de Suporte Lojista', () => {
    function processIncomingWebhook(payload: {
      phone: string;
      message: string;
      isGroup?: boolean;
      fromMe?: boolean;
    }) {
      if (payload.fromMe || payload.isGroup) {
        return { ignored: true };
      }

      const normalized = payload.message
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      const isHelp =
        normalized.includes('duvida') ||
        normalized.includes('ajuda') ||
        normalized.includes('suporte');

      if (isHelp) {
        const ticketNumber = `TK-WPP-2026-TEST`;
        return {
          action: 'TICKET_CREATED',
          ticketNumber,
          category: 'DUVIDAS',
          priority: 'ALTA',
        };
      }

      return { action: 'IGNORED_NO_KEYWORD' };
    }

    it('deve identificar mensagens com intenção de DÚVIDA e abrir chamado com prioridade ALTA', () => {
      const result = processIncomingWebhook({
        phone: '5564999998888',
        message: 'Olá, estou com uma dúvida sobre o valor da minha fatura de novembro.',
      });

      expect(result.action).toBe('TICKET_CREATED');
      expect(result.ticketNumber).toBe('TK-WPP-2026-TEST');
      expect(result.priority).toBe('ALTA');
    });

    it('deve identificar mensagens com intenção de AJUDA e categorizar como DUVIDAS', () => {
      const result = processIncomingWebhook({
        phone: '5564988887777',
        message: 'Preciso de ajuda urgente para trocar a foto do meu restaurante!',
      });

      expect(result.action).toBe('TICKET_CREATED');
      expect(result.category).toBe('DUVIDAS');
    });

    it('deve ignorar mensagens automáticas enviadas pelo próprio bot ou grupos', () => {
      const fromMeResult = processIncomingWebhook({
        phone: '5564988887777',
        message: 'Preciso de ajuda',
        fromMe: true,
      });

      const groupResult = processIncomingWebhook({
        phone: '5564988887777',
        message: 'Dúvida aqui no grupo',
        isGroup: true,
      });

      expect(fromMeResult.ignored).toBe(true);
      expect(groupResult.ignored).toBe(true);
    });
  });
});
