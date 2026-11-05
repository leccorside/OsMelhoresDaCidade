import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AsaasService } from './asaas.service';
import {
  SubscriptionPlan,
  PaymentStatus,
  PaymentMethod,
  NotificationType,
  DiscountType,
} from '@prisma/client';
import {
  CreateCheckoutDto,
  ValidateCouponDto,
  CreateSubscriptionCouponDto,
} from './dto/billing.dto';

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  badge: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

@Injectable()
export class BillingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly asaasService: AsaasService,
  ) {}

  async onApplicationBootstrap() {
    try {
      const count = await this.prisma.subscriptionCoupon.count();
      if (count === 0) {
        await this.prisma.subscriptionCoupon.createMany({
          data: [
            {
              code: 'PRIMEIRO_MES',
              description: '50% de desconto no primeiro mês ou anuidade',
              discountType: DiscountType.PERCENTAGE,
              discountValue: 50,
              maxUses: 1000,
            },
            {
              code: 'INAUGURACAO20',
              description: '20% de desconto especial de inauguração',
              discountType: DiscountType.PERCENTAGE,
              discountValue: 20,
              maxUses: 500,
            },
          ],
        });
        this.logger.log('Cupons padrão de assinatura inicializados com sucesso.');
      }
    } catch (err: any) {
      this.logger.warn(`Erro ao inicializar cupons padrão: ${err.message}`);
    }
  }

  getAvailablePlans(): PlanDetails[] {
    return [
      {
        id: SubscriptionPlan.BRONZE_DESTAQUE,
        name: 'Bronze Destaque',
        badge: 'Bronze',
        priceMonthly: 89.9,
        priceYearly: 899.0,
        description: 'Ideal para negócios locais que querem se destacar da concorrência no bairro.',
        features: [
          'Selo Oficial Bronze de Estabelecimento Verificado',
          'Posicionamento prioritário na categoria',
          'Até 3 cupons de desconto ativos simultâneos',
          'Até 2 eventos e shows cadastrados por mês',
          'Estatísticas básicas de visualizações e leads',
        ],
      },
      {
        id: SubscriptionPlan.PRATA_REGIONAL,
        name: 'Prata Regional',
        badge: 'Prata',
        priceMonthly: 179.9,
        priceYearly: 1799.0,
        description: 'Perfeito para atrações e restaurantes com grande fluxo que buscam máxima visibilidade regional.',
        features: [
          'Selo Oficial Prata de Alto Destaque Regional',
          'Topo das buscas nas categorias e bairros vizinhos',
          'Cupons e promoções com código ILIMITADOS',
          'Eventos e programações especiais ilimitadas',
          'Botão flutuante de WhatsApp direto nas buscas',
          'Relatórios completos com métricas diárias em Excel/PDF',
        ],
      },
      {
        id: SubscriptionPlan.OURO_MASTER,
        name: 'Ouro Master',
        badge: 'Ouro VIP',
        recommended: true,
        priceMonthly: 299.9,
        priceYearly: 2990.0,
        description: 'Para as maiores referências da cidade que exigem a liderança absoluta no guia turístico.',
        features: [
          'Selo Oficial Ouro Master no topo do guia',
          'Destaque no Hero e Mosaico da Página Inicial da Cidade',
          'Prioridade máxima no Mapa Interativo com Marcador Dourado',
          'Cupons, eventos e fotos do mosaico 100% ilimitados',
          'Selo de "Recomendado pelo Guia" com link de reserva direta',
          'Gerente de conta exclusivo e suporte prioritário via WhatsApp',
        ],
      },
    ];
  }

  private async ensureMerchantProfile(user: any) {
    let merchant = await this.prisma.merchantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!merchant) {
      merchant = await this.prisma.merchantProfile.create({
        data: {
          userId: user.id,
          companyName: user.name || 'Comerciante Parceiro',
          isApproved: true,
          approvedAt: new Date(),
        },
      });
    }

    return merchant;
  }

  private async verifyListingOwnership(user: any, listingId: string) {
    if (user.role === 'ADMIN') return true;

    const merchant = await this.ensureMerchantProfile(user);
    const ownership = await this.prisma.listingOwner.findFirst({
      where: {
        listingId,
        merchantProfileId: merchant.id,
      },
    });

    if (!ownership) {
      throw new ForbiddenException('Você não possui permissão para gerenciar este anúncio.');
    }

    return true;
  }

  async createCheckout(user: any, dto: CreateCheckoutDto) {
    await this.verifyListingOwnership(user, dto.listingId);
    const merchant = await this.ensureMerchantProfile(user);

    const plans = this.getAvailablePlans();
    const selectedPlan = plans.find((p) => p.id === dto.plan);
    if (!selectedPlan) {
      throw new BadRequestException('Plano de destaque inválido.');
    }

    const basePrice = dto.billingCycle === 'YEARLY' ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
    let finalPrice = basePrice;
    let discountAmount = 0;
    let couponId: string | null = null;
    let appliedCouponCode: string | null = null;

    if (dto.couponCode) {
      const couponValidation = await this.validateCoupon(dto.couponCode, dto.plan, dto.billingCycle);
      discountAmount = couponValidation.discountAmount;
      finalPrice = couponValidation.finalPrice;
      couponId = couponValidation.couponId;
      appliedCouponCode = couponValidation.code;

      await this.prisma.subscriptionCoupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Integração Asaas: Obter/Criar cliente e gerar cobrança PIX
    const asaasCustomerId = await this.asaasService.getOrCreateCustomer(merchant.id);
    const asaasCharge = await this.asaasService.createPixCharge({
      customerId: asaasCustomerId,
      value: finalPrice,
      description: `Plano ${selectedPlan.name} (${dto.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'})${appliedCouponCode ? ` [Cupom ${appliedCouponCode}]` : ''} - Os Melhores da Cidade`,
      externalReference: `sub_${Math.random().toString(36).substring(2, 10)}`,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const pixQrCode = asaasCharge.pixQrCode;
    const gatewayInvoiceUrl = asaasCharge.invoiceUrl;
    const gatewayPaymentId = asaasCharge.paymentId;

    // Gravar assinatura e cobrança
    const subscription = await this.prisma.merchantSubscription.create({
      data: {
        merchantProfileId: merchant.id,
        listingId: dto.listingId,
        plan: dto.plan,
        status: PaymentStatus.PENDING,
        price: finalPrice,
        discountAmount,
        couponId,
        billingCycle: dto.billingCycle || 'MONTHLY',
        pixQrCode,
        gatewayPaymentId,
        gatewayInvoiceUrl,
      },
      include: {
        listing: { select: { id: true, name: true, slug: true } },
      },
    });

    await this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: finalPrice,
        method: dto.paymentMethod || PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      plan: selectedPlan,
      basePrice,
      discountAmount,
      price: finalPrice,
      couponCode: appliedCouponCode,
      billingCycle: subscription.billingCycle,
      pixQrCode,
      gatewayInvoiceUrl,
      gatewayPaymentId,
      listing: subscription.listing,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h para pagamento
    };
  }

  /**
   * Valida um cupom de desconto para plano de assinatura
   */
  async validateCoupon(code: string, plan: SubscriptionPlan, billingCycle = 'MONTHLY') {
    if (!code) {
      throw new BadRequestException('Código do cupom é obrigatório.');
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await this.prisma.subscriptionCoupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundException(`Cupom "${cleanCode}" inválido ou inativo.`);
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      throw new BadRequestException(`O cupom "${cleanCode}" expirou.`);
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException(`Limite de usos do cupom "${cleanCode}" foi atingido.`);
    }

    const plans = this.getAvailablePlans();
    const selectedPlan = plans.find((p) => p.id === plan);
    if (!selectedPlan) {
      throw new BadRequestException('Plano informado inválido.');
    }

    const basePrice = billingCycle === 'YEARLY' ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
    let discountAmount = 0;

    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (basePrice * Number(coupon.discountValue)) / 100;
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    discountAmount = Math.min(basePrice, Math.max(0, discountAmount));
    const finalPrice = Math.max(1.0, basePrice - discountAmount);

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      basePrice,
      discountAmount: Number(discountAmount.toFixed(2)),
      finalPrice: Number(finalPrice.toFixed(2)),
    };
  }

  /**
   * Gestão administrativa de cupons
   */
  async getSubscriptionCoupons() {
    return this.prisma.subscriptionCoupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });
  }

  async createSubscriptionCoupon(dto: CreateSubscriptionCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.subscriptionCoupon.findUnique({
      where: { code },
    });
    if (existing) {
      throw new BadRequestException(`Já existe um cupom cadastrado com o código ${code}.`);
    }

    return this.prisma.subscriptionCoupon.create({
      data: {
        code,
        description: dto.description,
        discountType: dto.discountType || DiscountType.PERCENTAGE,
        discountValue: dto.discountValue,
        maxUses: dto.maxUses,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async toggleSubscriptionCoupon(id: string) {
    const coupon = await this.prisma.subscriptionCoupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Cupom não encontrado.');

    return this.prisma.subscriptionCoupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });
  }

  async confirmPaymentByGateway(gatewayPaymentId: string, externalReference?: string) {
    let subscription = null;
    if (externalReference) {
      subscription = await this.prisma.merchantSubscription.findFirst({
        where: { id: externalReference },
      });
    }
    if (!subscription && gatewayPaymentId) {
      subscription = await this.prisma.merchantSubscription.findFirst({
        where: { gatewayPaymentId },
      });
    }

    if (!subscription) {
      this.logger.warn(`Assinatura não localizada para webhook Asaas: ${gatewayPaymentId}`);
      return { success: false, message: 'Assinatura não localizada' };
    }

    return this.confirmPayment(subscription.id);
  }

  async confirmPayment(subscriptionId: string) {
    const subscription = await this.prisma.merchantSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        listing: true,
        merchantProfile: { select: { userId: true } },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada.');
    }

    const durationDays = subscription.billingCycle === 'YEARLY' ? 365 : 30;
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const [updatedSub] = await this.prisma.$transaction([
      this.prisma.merchantSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: PaymentStatus.PAID,
          endDate,
        },
      }),
      this.prisma.subscriptionPayment.updateMany({
        where: { subscriptionId, status: PaymentStatus.PENDING },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      }),
      // Atualizar o estabelecimento para Destaque
      this.prisma.listing.update({
        where: { id: subscription.listingId! },
        data: {
          isFeatured: true,
          status: 'PUBLISHED',
        },
      }),
    ]);

    // Enviar notificação em tempo real para o comerciante
    try {
      await this.notificationsService.createNotification({
        userId: subscription.merchantProfile.userId,
        type: NotificationType.SYSTEM_ALERT,
        title: '🎉 Pagamento Aprovado com Sucesso!',
        message: `Seu plano ${subscription.plan.replace('_', ' ')} foi ativado para "${subscription.listing?.name}". Seu estabelecimento agora tem destaque máximo no guia!`,
        linkUrl: '/comerciante/planos',
        metadata: { subscriptionId: updatedSub.id, plan: updatedSub.plan },
      });
    } catch (e) {}

    return {
      success: true,
      message: 'Pagamento aprovado e plano de destaque ativado com sucesso!',
      subscription: updatedSub,
    };
  }

  async getMerchantSubscriptions(user: any) {
    const merchant = await this.ensureMerchantProfile(user);

    const subscriptions = await this.prisma.merchantSubscription.findMany({
      where: { merchantProfileId: merchant.id },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: { id: true, name: true, slug: true, coverUrl: true },
        },
        coupon: {
          select: { code: true, description: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return subscriptions;
  }

  async getAdminFinancialOverview() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Pagamentos Pagos
    const paidPayments = await this.prisma.subscriptionPayment.findMany({
      where: { status: PaymentStatus.PAID },
      select: { amount: true, paidAt: true, createdAt: true },
    });

    const totalRevenue = paidPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const currentMonthRevenue = paidPayments
      .filter((p) => (p.paidAt || p.createdAt) >= startOfCurrentMonth)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    // 2. Faturas Pendentes
    const pendingCount = await this.prisma.subscriptionPayment.count({
      where: { status: PaymentStatus.PENDING },
    });

    // 3. Assinaturas Ativas
    const activeSubs = await this.prisma.merchantSubscription.findMany({
      where: {
        status: PaymentStatus.PAID,
        endDate: { gte: now },
      },
      select: { plan: true },
    });

    const planCounts = {
      BRONZE_DESTAQUE: activeSubs.filter((s) => s.plan === SubscriptionPlan.BRONZE_DESTAQUE).length,
      PRATA_REGIONAL: activeSubs.filter((s) => s.plan === SubscriptionPlan.PRATA_REGIONAL).length,
      OURO_MASTER: activeSubs.filter((s) => s.plan === SubscriptionPlan.OURO_MASTER).length,
    };

    // 4. Timeline dos últimos 6 meses
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const timeline = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = `${months[d.getMonth()]}/${d.getFullYear().toString().substring(2)}`;

      const rev = paidPayments
        .filter((p) => {
          const date = p.paidAt || p.createdAt;
          return date >= d && date < nextD;
        })
        .reduce((acc, p) => acc + Number(p.amount), 0);

      timeline.push({ label, revenue: rev });
    }

    // 5. Histórico recente de transações (últimas 50)
    const recentTransactions = await this.prisma.merchantSubscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        listing: { select: { id: true, name: true, slug: true } },
        merchantProfile: {
          select: {
            id: true,
            companyName: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        coupon: {
          select: { code: true, description: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return {
      metrics: {
        totalRevenue,
        currentMonthRevenue,
        activeSubscriptionsCount: activeSubs.length,
        pendingInvoicesCount: pendingCount,
        planDistribution: planCounts,
      },
      timeline,
      transactions: recentTransactions,
    };
  }

  /**
   * Retorna os dados completos e estruturados da fatura/recibo oficial de publicidade digital
   */
  async getInvoiceDetails(user: any, subscriptionId: string) {
    const subscription = await this.prisma.merchantSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            slug: true,
            street: true,
            number: true,
            phone: true,
            city: { select: { name: true, state: true } },
          },
        },
        merchantProfile: {
          select: {
            id: true,
            userId: true,
            companyName: true,
            legalName: true,
            cnpj: true,
            address: true,
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        coupon: {
          select: { code: true, description: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura / Fatura não encontrada.');
    }

    // Validação de segurança: apenas o ADMIN ou o comerciante titular podem visualizar
    const isOwner =
      subscription.merchantProfile?.userId === user.id ||
      subscription.merchantProfile?.user?.id === user.id;

    if (user.role !== 'ADMIN' && !isOwner) {
      throw new ForbiddenException('Acesso negado à fatura informada.');
    }

    const latestPayment = subscription.payments?.[0] || null;
    const planNames: Record<SubscriptionPlan, string> = {
      [SubscriptionPlan.FREE]: 'Gratuito',
      [SubscriptionPlan.BRONZE_DESTAQUE]: 'Bronze Destaque VIP',
      [SubscriptionPlan.PRATA_REGIONAL]: 'Prata Regional VIP',
      [SubscriptionPlan.OURO_MASTER]: 'Ouro Master VIP (N° 1 do Guia)',
    };

    const year = new Date(subscription.createdAt).getFullYear();
    const invoiceNumber = `FAT-${year}-${subscription.id.substring(0, 8).toUpperCase()}`;
    const verificationCode = `OSM-${subscription.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;

    const listingAddr = subscription.listing?.street
      ? `${subscription.listing.street}${subscription.listing.number ? ', ' + subscription.listing.number : ''}, ${subscription.listing.city?.name || 'Barreiras'} - ${subscription.listing.city?.state || 'BA'}`
      : subscription.merchantProfile?.address || 'Barreiras - BA';

    return {
      invoiceNumber,
      verificationCode,
      status: subscription.status,
      statusLabel:
        subscription.status === PaymentStatus.PAID
          ? 'QUITADO / PAGO'
          : subscription.status === PaymentStatus.PENDING
          ? 'AGUARDANDO PAGAMENTO'
          : 'EXPIRADO',
      issueDate: subscription.createdAt,
      paidAt: latestPayment?.paidAt || (subscription.status === PaymentStatus.PAID ? subscription.updatedAt : null),
      provider: {
        name: 'Os Melhores da Cidade Tecnologia e Publicidade Digital Ltda.',
        tradeName: 'Portal Os Melhores da Cidade',
        cnpj: '48.219.832/0001-45',
        email: 'financeiro@osmelhoresdacidade.com.br',
        website: 'https://osmelhoresdacidade.com.br',
        address: 'Av. Barreiras, Centro Empresarial - Barreiras/BA',
      },
      customer: {
        tradeName: subscription.listing?.name || subscription.merchantProfile?.companyName || 'Estabelecimento Comercial',
        companyName: subscription.merchantProfile?.legalName || subscription.merchantProfile?.companyName || subscription.listing?.name || 'Comerciante Parceiro',
        document: subscription.merchantProfile?.cnpj || 'Não informado',
        contactName: subscription.merchantProfile?.user?.name || 'Responsável Legal',
        contactEmail: subscription.merchantProfile?.user?.email || 'contato@parceiro.com.br',
        contactPhone: subscription.listing?.phone || subscription.merchantProfile?.user?.phone || 'Não informado',
        address: listingAddr,
      },
      service: {
        subscriptionId: subscription.id,
        plan: subscription.plan,
        planName: planNames[subscription.plan] || subscription.plan,
        listingName: subscription.listing?.name || 'Estabelecimento Principal',
        billingCycle: subscription.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal',
        periodStart: subscription.startDate,
        periodEnd: subscription.endDate,
        description: `Prestação de serviços de publicidade digital, indexação institucional e destaque prioritário no Guia Comercial Oficial Os Melhores da Cidade (${planNames[subscription.plan] || subscription.plan}).`,
        grossAmount: Number(subscription.price) + Number(subscription.discountAmount || 0),
        discountAmount: Number(subscription.discountAmount || 0),
        couponCode: subscription.coupon?.code || null,
        netAmount: Number(subscription.price),
        paymentMethod: latestPayment?.method || 'PIX',
        gatewayPaymentId: subscription.gatewayPaymentId,
        gatewayInvoiceUrl: subscription.gatewayInvoiceUrl,
      },
    };
  }
}

