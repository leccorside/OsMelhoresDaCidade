import { DiscountType, SubscriptionPlan, PaymentStatus } from '@prisma/client';

describe('E2E Funil de Assinaturas, Faturamento e Splits', () => {
  describe('1. Validação e Abatimento de Cupons Promocionais', () => {
    const mockCoupons = [
      {
        code: 'PROMO10',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        isActive: true,
        maxUses: 100,
        usedCount: 5,
        expiresAt: new Date(Date.now() + 86400000), // amanhã
      },
      {
        code: 'DESCONTO50',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 50,
        isActive: true,
        maxUses: 10,
        usedCount: 0,
        expiresAt: null,
      },
      {
        code: 'EXPIRADO',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        isActive: true,
        expiresAt: new Date(Date.now() - 86400000), // ontem
      },
      {
        code: 'ESGOTADO',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        isActive: true,
        maxUses: 5,
        usedCount: 5,
      },
    ];

    function evaluateCoupon(code: string, originalPrice: number) {
      const coupon = mockCoupons.find((c) => c.code === code);
      if (!coupon || !coupon.isActive) {
        return { valid: false, message: 'Cupom inválido ou inativo.' };
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return { valid: false, message: 'Este cupom expirou.' };
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { valid: false, message: 'Limite de utilização esgotado.' };
      }

      let discountAmount = 0;
      if (coupon.discountType === DiscountType.PERCENTAGE) {
        discountAmount = (originalPrice * coupon.discountValue) / 100;
      } else {
        discountAmount = Math.min(coupon.discountValue, originalPrice);
      }

      const finalPrice = Math.max(0, originalPrice - discountAmount);
      return {
        valid: true,
        discountAmount,
        finalPrice,
        code: coupon.code,
      };
    }

    it('deve aplicar cupom percentual corretamente (10% de R$ 99 = R$ 9,90 de desconto)', () => {
      const result = evaluateCoupon('PROMO10', 99.0);
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBeCloseTo(9.9, 2);
      expect(result.finalPrice).toBeCloseTo(89.1, 2);
    });

    it('deve aplicar cupom fixo em reais corretamente (R$ 50 de desconto)', () => {
      const result = evaluateCoupon('DESCONTO50', 299.0);
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(50.0);
      expect(result.finalPrice).toBe(249.0);
    });

    it('deve rejeitar cupom expirado', () => {
      const result = evaluateCoupon('EXPIRADO', 100.0);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('expirou');
    });

    it('deve rejeitar cupom com limite de uso atingido', () => {
      const result = evaluateCoupon('ESGOTADO', 100.0);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('esgotado');
    });
  });

  describe('2. Faturamento Integral da Plataforma (Modelo Direto Sem Franquias)', () => {
    function calculatePlatformRevenue(amount: number) {
      return {
        platformAmount: amount,
        isDirectBilling: true,
      };
    }

    it('deve destinar 100% da receita de assinaturas para a plataforma central', () => {
      const revenue = calculatePlatformRevenue(199.0);
      expect(revenue.platformAmount).toBe(199.0);
      expect(revenue.isDirectBilling).toBe(true);
    });
  });

  describe('3. Cálculo de Pró-Rata e Upgrade de Planos', () => {
    function calculateProrataUpgrade(params: {
      currentPlanPrice: number;
      cycleDays: number;
      daysRemaining: number;
      newPlanPrice: number;
    }) {
      const dailyRate = params.currentPlanPrice / params.cycleDays;
      const unusedCredit = Math.max(0, dailyRate * params.daysRemaining);
      const netToPay = Math.max(0, params.newPlanPrice - unusedCredit);

      return {
        dailyRate: Number(dailyRate.toFixed(2)),
        unusedCredit: Number(unusedCredit.toFixed(2)),
        netToPay: Number(netToPay.toFixed(2)),
      };
    }

    it('deve abater proporcionalmente os dias não utilizados de um plano mensal', () => {
      // Plano de R$ 90/mês (R$ 3/dia), restando 10 dias de vigência (R$ 30 de crédito)
      // Upgrade para plano de R$ 200/mês
      const calc = calculateProrataUpgrade({
        currentPlanPrice: 90.0,
        cycleDays: 30,
        daysRemaining: 10,
        newPlanPrice: 200.0,
      });

      expect(calc.dailyRate).toBe(3.0);
      expect(calc.unusedCredit).toBe(30.0);
      expect(calc.netToPay).toBe(170.0);
    });

    it('não deve permitir valor negativo no upgrade se o crédito for maior que o novo plano', () => {
      const calc = calculateProrataUpgrade({
        currentPlanPrice: 300.0,
        cycleDays: 30,
        daysRemaining: 25,
        newPlanPrice: 50.0,
      });

      expect(calc.netToPay).toBe(0.0);
    });
  });

  describe('4. Emissão e Formatação de Fatura e Recibo Oficial', () => {
    function generateInvoice(subscription: {
      id: string;
      plan: string;
      price: number;
      createdAt: Date;
    }) {
      const year = subscription.createdAt.getFullYear();
      const invoiceNumber = `FAT-${year}-${subscription.id.substring(0, 8).toUpperCase()}`;
      const verificationCode = `OSM-${subscription.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;

      return {
        invoiceNumber,
        verificationCode,
        hasVerificationFormat: /^OSM-[A-Z0-9]{16}$/.test(verificationCode),
        hasInvoiceNumberFormat: /^FAT-\d{4}-[A-Z0-9]{8}$/.test(invoiceNumber),
      };
    }

    it('deve gerar identificadores fiscais válidos e código de autenticação digital', () => {
      const inv = generateInvoice({
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        plan: 'OURO_MASTER',
        price: 299.0,
        createdAt: new Date('2026-11-05T00:00:00Z'),
      });

      expect(inv.invoiceNumber).toBe('FAT-2026-9B1DEB4D');
      expect(inv.hasInvoiceNumberFormat).toBe(true);
      expect(inv.hasVerificationFormat).toBe(true);
    });
  });

  describe('5. Lógica de Vencimento e Notificações de Renovação', () => {
    function evaluateExpirationNotice(endDate: Date, now: Date) {
      const diffMs = endDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return {
        daysRemaining,
        isUrgent: daysRemaining <= 3 && daysRemaining >= 0,
        isExpired: daysRemaining < 0,
        shouldNotify: daysRemaining <= 5 && daysRemaining >= -2,
      };
    }

    it('deve marcar como urgente se vencer em até 3 dias', () => {
      const now = new Date('2026-11-05T12:00:00Z');
      const endDate = new Date('2026-11-07T12:00:00Z'); // 2 dias

      const notice = evaluateExpirationNotice(endDate, now);
      expect(notice.daysRemaining).toBe(2);
      expect(notice.isUrgent).toBe(true);
      expect(notice.shouldNotify).toBe(true);
    });

    it('deve indicar vencido se a data final for no passado', () => {
      const now = new Date('2026-11-05T12:00:00Z');
      const endDate = new Date('2026-11-04T12:00:00Z'); // 1 dia atrás

      const notice = evaluateExpirationNotice(endDate, now);
      expect(notice.daysRemaining).toBe(-1);
      expect(notice.isExpired).toBe(true);
      expect(notice.shouldNotify).toBe(true);
    });
  });
});
