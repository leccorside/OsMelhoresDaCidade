import * as crypto from 'crypto';
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
import { WebhooksService } from '../webhooks/webhooks.service';
import { AsaasService } from './asaas.service';
import { MailService } from '../../common/mail/mail.service';
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
  CalculatePlanChangeDto,
  ChangePlanCheckoutDto,
  UpdateCitySplitDto,
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
    private readonly mailService: MailService,
    private readonly webhooksService: WebhooksService,
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
      include: { user: true },
    });

    if (!merchant) {
      merchant = await this.prisma.merchantProfile.create({
        data: {
          userId: user.id,
          companyName: user.name || 'Comerciante Parceiro',
          isApproved: true,
          approvedAt: new Date(),
        },
        include: { user: true },
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

    // Verificar configuração de Split de Franquia por Cidade
    const listingWithCity = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: { city: true },
    });

    let splitConfig: any = undefined;
    if (listingWithCity?.city?.splitEnabled && listingWithCity.city.franchiseWalletId) {
      splitConfig = [
        {
          walletId: listingWithCity.city.franchiseWalletId,
          percentualValue: Number(listingWithCity.city.franchiseFeePercent || 80),
        },
      ];
    }

    // Checkout com Cartão de Crédito
    if (dto.paymentMethod === PaymentMethod.CREDIT_CARD) {
      if (!dto.creditCard || !dto.creditCardHolderInfo) {
        throw new BadRequestException('Dados do cartão de crédito e do titular são obrigatórios.');
      }

      const cardCharge = await this.asaasService.createCreditCardCharge({
        customerId: asaasCustomerId,
        value: finalPrice,
        description: `Plano ${selectedPlan.name} (${dto.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'})${appliedCouponCode ? ` [Cupom ${appliedCouponCode}]` : ''} - Os Melhores da Cidade`,
        externalReference: `sub_${Math.random().toString(36).substring(2, 10)}`,
        dueDate: new Date().toISOString().split('T')[0],
        split: splitConfig,
        creditCard: dto.creditCard,
        creditCardHolderInfo: dto.creditCardHolderInfo,
      });

      const isApproved = cardCharge.isApproved;
      const days = dto.billingCycle === 'YEARLY' ? 365 : 30;
      const now = new Date();
      const endDate = isApproved ? new Date(now.getTime() + days * 24 * 60 * 60 * 1000) : null;

      const subscription = await this.prisma.merchantSubscription.create({
        data: {
          merchantProfileId: merchant.id,
          listingId: dto.listingId,
          plan: dto.plan,
          status: isApproved ? PaymentStatus.PAID : PaymentStatus.PENDING,
          price: finalPrice,
          discountAmount,
          couponId,
          billingCycle: dto.billingCycle || 'MONTHLY',
          startDate: now,
          endDate,
          gatewayPaymentId: cardCharge.paymentId,
          gatewayInvoiceUrl: cardCharge.invoiceUrl,
        },
        include: {
          listing: { select: { id: true, name: true, slug: true } },
        },
      });

      await this.prisma.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          amount: finalPrice,
          method: PaymentMethod.CREDIT_CARD,
          status: isApproved ? PaymentStatus.PAID : PaymentStatus.PENDING,
          paidAt: isApproved ? now : null,
        },
      });

      if (isApproved) {
        await this.prisma.listing.update({
          where: { id: dto.listingId },
          data: { isFeatured: true },
        });

        if (couponId) {
          await this.prisma.subscriptionCoupon
            .update({
              where: { id: couponId },
              data: { usedCount: { increment: 1 } },
            })
            .catch(() => {});
        }

        // Despachar webhook
        this.webhooksService.dispatch('SUBSCRIPTION_PAID', {
          subscriptionId: subscription.id,
          plan: subscription.plan,
          price: Number(subscription.price),
          billingCycle: subscription.billingCycle,
          listingId: subscription.listingId,
          merchantName: merchant.user?.name || merchant.companyName,
          merchantEmail: merchant.user?.email,
          paymentMethod: dto.paymentMethod || 'CREDIT_CARD',
          paidAt: now.toISOString(),
        });

        if (merchant.user?.email && endDate) {
          const year = now.getFullYear();
          const invoiceNumber = `FAT-${year}-${subscription.id.substring(0, 8).toUpperCase()}`;
          const verificationCode = `OSM-${subscription.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;
          const webBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://osmelhoresdacidade.com.br';

          this.mailService
            .sendSubscriptionPaidInvoiceEmail({
              merchantName: merchant.user.name,
              merchantEmail: merchant.user.email,
              listingName: subscription.listing?.name || 'Seu Estabelecimento',
              planName: selectedPlan.name,
              billingCycle: dto.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal',
              amountPaid: finalPrice,
              validUntilDate: endDate.toLocaleDateString('pt-BR'),
              invoiceNumber,
              invoiceUrl: `${webBaseUrl}/comerciante/fatura/${subscription.id}`,
              verificationCode,
            })
            .catch(() => {});
        }
      }

      return {
        success: true,
        isPaid: isApproved,
        status: isApproved ? 'PAID' : 'PENDING',
        subscriptionId: subscription.id,
        plan: selectedPlan,
        basePrice,
        discountAmount,
        price: finalPrice,
        couponCode: appliedCouponCode,
        billingCycle: subscription.billingCycle,
        gatewayInvoiceUrl: cardCharge.invoiceUrl,
        gatewayPaymentId: cardCharge.paymentId,
        listing: subscription.listing,
        message: isApproved
          ? 'Pagamento com cartão aprovado instantaneamente!'
          : 'Aguardando processamento do cartão.',
      };
    }

    const asaasCharge = await this.asaasService.createPixCharge({
      customerId: asaasCustomerId,
      value: finalPrice,
      description: `Plano ${selectedPlan.name} (${dto.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'})${appliedCouponCode ? ` [Cupom ${appliedCouponCode}]` : ''} - Os Melhores da Cidade`,
      externalReference: `sub_${Math.random().toString(36).substring(2, 10)}`,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      split: splitConfig,
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

  /**
   * Calcula o pró-rata proporcional para Upgrade ou Downgrade de plano
   */
  async calculatePlanChange(user: any, dto: CalculatePlanChangeDto) {
    const subscription = await this.prisma.merchantSubscription.findUnique({
      where: { id: dto.subscriptionId },
      include: {
        listing: { select: { id: true, name: true } },
        merchantProfile: { select: { userId: true } },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada.');
    }

    if (user.role !== 'ADMIN' && subscription.merchantProfile.userId !== user.id) {
      throw new ForbiddenException('Acesso negado à assinatura informada.');
    }

    if (subscription.status !== PaymentStatus.PAID || !subscription.endDate) {
      throw new BadRequestException('Apenas assinaturas ativas e pagas podem ser migradas com pró-rata.');
    }

    const now = new Date();
    if (new Date(subscription.endDate) <= now) {
      throw new BadRequestException('Esta assinatura já expirou. Realize uma nova contratação de plano.');
    }

    const plans = this.getAvailablePlans();
    const currentPlanDetails = plans.find((p) => p.id === subscription.plan);
    const newPlanDetails = plans.find((p) => p.id === dto.newPlan);

    if (!newPlanDetails) {
      throw new BadRequestException('O novo plano informado é inválido.');
    }

    // Dias restantes no ciclo atual
    const msDiff = new Date(subscription.endDate).getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
    const totalCycleDays = subscription.billingCycle === 'YEARLY' ? 365 : 30;

    // Crédito pró-rata não utilizado do plano atual
    const currentPrice = Number(subscription.price);
    const dailyRate = currentPrice / totalCycleDays;
    const unusedCredit = Number(Math.min(currentPrice, dailyRate * daysRemaining).toFixed(2));

    // Preço do novo plano
    const newCycle = dto.newBillingCycle || 'MONTHLY';
    const newBasePrice = newCycle === 'YEARLY' ? newPlanDetails.priceYearly : newPlanDetails.priceMonthly;

    // Diferença líquida proporcional a ser cobrada
    const amountToPay = Number(Math.max(1.0, newBasePrice - unusedCredit).toFixed(2));
    const isUpgrade = newBasePrice >= currentPrice;

    return {
      subscriptionId: subscription.id,
      listingId: subscription.listingId,
      listingName: subscription.listing?.name,
      currentPlan: {
        id: subscription.plan,
        name: currentPlanDetails?.name || subscription.plan,
        price: currentPrice,
        billingCycle: subscription.billingCycle,
        endDate: subscription.endDate,
        daysRemaining,
      },
      newPlan: {
        id: newPlanDetails.id,
        name: newPlanDetails.name,
        price: newBasePrice,
        billingCycle: newCycle,
      },
      unusedCredit,
      amountToPay,
      isUpgrade,
    };
  }

  /**
   * Checkout de Migração/Upgrade com Pró-Rata
   */
  async createPlanChangeCheckout(user: any, dto: ChangePlanCheckoutDto) {
    const calc = await this.calculatePlanChange(user, {
      subscriptionId: dto.subscriptionId,
      newPlan: dto.newPlan,
      newBillingCycle: dto.newBillingCycle,
    });

    const merchant = await this.ensureMerchantProfile(user);
    const plans = this.getAvailablePlans();
    const newPlanDetails = plans.find((p) => p.id === dto.newPlan)!;

    let finalPrice = calc.amountToPay;
    let couponDiscount = 0;
    let couponId: string | null = null;
    let appliedCouponCode: string | null = null;

    if (dto.couponCode) {
      const couponValidation = await this.validateCoupon(dto.couponCode, dto.newPlan, dto.newBillingCycle);
      couponDiscount = Math.min(finalPrice - 1.0, couponValidation.discountAmount);
      finalPrice = Math.max(1.0, finalPrice - couponDiscount);
      couponId = couponValidation.couponId;
      appliedCouponCode = couponValidation.code;

      await this.prisma.subscriptionCoupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Criar cobrança PIX no Asaas
    const asaasCustomerId = await this.asaasService.getOrCreateCustomer(merchant.id);
    const asaasCharge = await this.asaasService.createPixCharge({
      customerId: asaasCustomerId,
      value: finalPrice,
      description: `Upgrade para Plano ${newPlanDetails.name} (${dto.newBillingCycle === 'YEARLY' ? 'Anual' : 'Mensal'})${appliedCouponCode ? ` [Cupom ${appliedCouponCode}]` : ''} - Os Melhores da Cidade`,
      externalReference: `sub_${Math.random().toString(36).substring(2, 10)}`,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    // Criar a nova assinatura em status PENDING (que substituirá a anterior ao pagar)
    const newSubscription = await this.prisma.merchantSubscription.create({
      data: {
        merchantProfileId: merchant.id,
        listingId: calc.listingId,
        plan: dto.newPlan,
        status: PaymentStatus.PENDING,
        price: finalPrice,
        discountAmount: Number((calc.unusedCredit + couponDiscount).toFixed(2)),
        couponId,
        billingCycle: dto.newBillingCycle || 'MONTHLY',
        pixQrCode: asaasCharge.pixQrCode,
        gatewayPaymentId: asaasCharge.paymentId,
        gatewayInvoiceUrl: asaasCharge.invoiceUrl,
      },
      include: {
        listing: { select: { id: true, name: true, slug: true } },
      },
    });

    await this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId: newSubscription.id,
        amount: finalPrice,
        method: PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      success: true,
      subscriptionId: newSubscription.id,
      previousSubscriptionId: dto.subscriptionId,
      newPlan: newPlanDetails,
      unusedCredit: calc.unusedCredit,
      couponDiscount,
      couponCode: appliedCouponCode,
      price: finalPrice,
      billingCycle: newSubscription.billingCycle,
      pixQrCode: asaasCharge.pixQrCode,
      gatewayInvoiceUrl: asaasCharge.invoiceUrl,
      gatewayPaymentId: asaasCharge.paymentId,
      listing: newSubscription.listing,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Gestão de Splits e Franquias Regionais por Cidade
   */
  async getAdminCitySplits() {
    return this.prisma.city.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        ibgeCode: true,
        isPublished: true,
        franchiseName: true,
        franchiseCnpj: true,
        franchisePixKey: true,
        franchisePixType: true,
        franchiseWalletId: true,
        platformFeePercent: true,
        franchiseFeePercent: true,
        splitEnabled: true,
        state: { select: { uf: true, name: true } },
        _count: { select: { listings: true } },
      },
    });
  }

  async updateCitySplit(cityId: string, dto: UpdateCitySplitDto) {
    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw new NotFoundException('Cidade não encontrada.');
    }

    return this.prisma.city.update({
      where: { id: cityId },
      data: {
        franchiseName: dto.franchiseName !== undefined ? dto.franchiseName : city.franchiseName,
        franchiseCnpj: dto.franchiseCnpj !== undefined ? dto.franchiseCnpj : city.franchiseCnpj,
        franchisePixKey: dto.franchisePixKey !== undefined ? dto.franchisePixKey : city.franchisePixKey,
        franchisePixType: dto.franchisePixType !== undefined ? dto.franchisePixType : city.franchisePixType,
        franchiseWalletId: dto.franchiseWalletId !== undefined ? dto.franchiseWalletId : city.franchiseWalletId,
        platformFeePercent: dto.platformFeePercent !== undefined ? dto.platformFeePercent : city.platformFeePercent,
        franchiseFeePercent: dto.franchiseFeePercent !== undefined ? dto.franchiseFeePercent : city.franchiseFeePercent,
        splitEnabled: dto.splitEnabled !== undefined ? dto.splitEnabled : city.splitEnabled,
      },
      include: {
        state: { select: { uf: true, name: true } },
      },
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
        merchantProfile: {
          select: {
            userId: true,
            user: { select: { name: true, email: true } },
          },
        },
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

    // Envio automático da Fatura / Comprovante em PDF por E-mail
    try {
      if (subscription.merchantProfile?.user?.email) {
        const planNames: Record<string, string> = {
          FREE: 'Gratuito',
          BRONZE_DESTAQUE: 'Bronze Destaque VIP',
          PRATA_REGIONAL: 'Prata Regional VIP',
          OURO_MASTER: 'Ouro Master VIP',
        };

        const year = new Date(subscription.createdAt).getFullYear();
        const invoiceNumber = `FAT-${year}-${subscription.id.substring(0, 8).toUpperCase()}`;
        const verificationCode = `OSM-${subscription.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4100';
        const invoiceUrl = `${siteUrl}/comerciante/fatura/${subscription.id}`;

        
        // Despachar evento para Webhooks externos (CRMs, Zapier, Make)
        this.webhooksService.dispatch('SUBSCRIPTION_PAID', {
          subscriptionId: subscription.id,
          plan: subscription.plan,
          price: Number(subscription.price),
          billingCycle: subscription.billingCycle,
          listingId: subscription.listingId,
          merchantName: subscription.merchantProfile?.user?.name || 'Comerciante',
          merchantEmail: subscription.merchantProfile?.user?.email,
          paymentMethod: 'ONLINE_PAYMENT',
          paidAt: new Date().toISOString(),
        });

        await this.mailService.sendSubscriptionPaidInvoiceEmail({
          merchantName: subscription.merchantProfile.user.name || 'Parceiro',
          merchantEmail: subscription.merchantProfile.user.email,
          listingName: subscription.listing?.name || 'Seu Estabelecimento',
          planName: planNames[subscription.plan] || subscription.plan,
          billingCycle: subscription.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal',
          amountPaid: Number(subscription.price),
          invoiceNumber,
          verificationCode,
          invoiceUrl,
          validUntilDate: endDate.toLocaleDateString('pt-BR'),
        });
      }
    } catch (err: any) {
      this.logger.warn(`Falha ao disparar e-mail de fatura paga: ${err.message}`);
    }

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
   * Retorna o Relatório Analítico de Desempenho e Retorno sobre Investimento (ROI) dos planos VIP
   */
  async getMerchantRoiPerformance(user: any) {
    const merchant = await this.ensureMerchantProfile(user);

    // 1. Assinaturas ativas do comerciante
    const activeSubs = await this.prisma.merchantSubscription.findMany({
      where: {
        merchantProfileId: merchant.id,
        status: PaymentStatus.PAID,
        endDate: { gte: new Date() },
      },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            viewsCount: true,
            whatsappClicks: true,
            phoneClicks: true,
            directionsClicks: true,
            websiteClicks: true,
          },
        },
      },
    });

    const hasActivePlan = activeSubs.length > 0;
    const plans = this.getAvailablePlans();

    // Totais dos estabelecimentos com plano ativo
    const totals = activeSubs.reduce(
      (acc, sub) => {
        if (sub.listing) {
          acc.views += sub.listing.viewsCount || 0;
          acc.whatsapp += sub.listing.whatsappClicks || 0;
          acc.phone += sub.listing.phoneClicks || 0;
          acc.directions += sub.listing.directionsClicks || 0;
          acc.website += sub.listing.websiteClicks || 0;
        }
        return acc;
      },
      { views: 0, whatsapp: 0, phone: 0, directions: 0, website: 0 },
    );

    const totalLeads = totals.whatsapp + totals.phone;
    const totalInvestment = activeSubs.reduce((acc, sub) => acc + Number(sub.price), 0);

    // 2. Média da plataforma para estabelecimentos sem plano (benchmark)
    const freeListingsAgg = await this.prisma.listing.aggregate({
      where: {
        isFeatured: false,
        status: 'PUBLISHED',
      },
      _avg: {
        viewsCount: true,
        whatsappClicks: true,
        phoneClicks: true,
        directionsClicks: true,
      },
    });

    const avgFreeViews = Math.max(15, Math.round(freeListingsAgg._avg.viewsCount || 25));
    const avgFreeLeads = Math.max(2, Math.round((freeListingsAgg._avg.whatsappClicks || 0) + (freeListingsAgg._avg.phoneClicks || 0) || 5));

    // Multiplicadores e percentuais de aumento
    const viewsMultiplier = totals.views > 0 ? Number((totals.views / avgFreeViews).toFixed(1)) : 3.8;
    const leadsMultiplier = totalLeads > 0 ? Number((totalLeads / avgFreeLeads).toFixed(1)) : 4.5;
    const viewsIncreasePercentage = Math.round((viewsMultiplier - 1) * 100);
    const leadsIncreasePercentage = Math.round((leadsMultiplier - 1) * 100);

    // Custo por Lead (CPL) e Retorno Estimado
    const costPerLead = totalLeads > 0 && totalInvestment > 0
      ? Number((totalInvestment / totalLeads).toFixed(2))
      : 1.25;

    // Estimativa de retorno baseada em ticket médio regional (R$ 60 por conversão estimada)
    const estimatedTicket = 60.0;
    const estimatedConversions = Math.round(totalLeads * 0.35); // taxa de conversão média de 35% de contatos diretos
    const estimatedReturns = estimatedConversions * estimatedTicket;
    const roiPercentage = totalInvestment > 0
      ? Math.round(((estimatedReturns - totalInvestment) / totalInvestment) * 100)
      : 380;

    const primarySub = activeSubs[0] || null;
    const planDetail = primarySub ? plans.find((p) => p.id === primarySub.plan) : null;

    return {
      hasActivePlan,
      activePlan: primarySub
        ? {
            id: primarySub.plan,
            name: planDetail?.name || primarySub.plan,
            badge: planDetail?.badge || 'VIP',
            price: Number(primarySub.price),
            billingCycle: primarySub.billingCycle,
            listingName: primarySub.listing?.name,
            endDate: primarySub.endDate,
          }
        : null,
      totals: {
        ...totals,
        totalLeads,
      },
      benchmarks: {
        averageFreeViews: avgFreeViews,
        averageFreeLeads: avgFreeLeads,
        viewsIncreasePercentage,
        leadsIncreasePercentage,
        viewsMultiplier,
        leadsMultiplier,
      },
      financialRoi: {
        investmentAmount: totalInvestment,
        costPerLead,
        estimatedConversions,
        estimatedReturns,
        roiPercentage,
      },
    };
  }
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

  async getExpiringSubscriptions(daysWindow = 7) {
    const now = new Date();
    const maxDate = new Date(now.getTime() + daysWindow * 24 * 60 * 60 * 1000);
    const minDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // até 2 dias atrás

    const subscriptions = await this.prisma.merchantSubscription.findMany({
      where: {
        status: PaymentStatus.PAID,
        plan: { not: SubscriptionPlan.FREE },
        endDate: {
          gte: minDate,
          lte: maxDate,
        },
      },
      include: {
        listing: {
          include: {
            city: true,
          },
        },
        merchantProfile: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    const webBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://osmelhoresdacidade.com.br';

    return subscriptions.map((sub) => {
      const endDate = sub.endDate || new Date();
      const diffMs = endDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const merchantName = sub.merchantProfile?.user?.name || 'Comerciante';
      const listingName = sub.listing?.name || 'Seu Estabelecimento';
      const rawPhone = sub.listing?.whatsapp || sub.listing?.phone || sub.merchantProfile?.user?.phone || '';
      const phoneClean = rawPhone.replace(/\D/g, '');

      const planNameMap: Record<string, string> = {
        BRONZE_DESTAQUE: 'Bronze Destaque VIP',
        PRATA_REGIONAL: 'Prata Regional VIP',
        OURO_MASTER: 'Ouro Master VIP',
      };
      const planName = planNameMap[sub.plan] || sub.plan;

      const dateFormatted = endDate.toLocaleDateString('pt-BR');
      const renewUrl = `${webBaseUrl}/comerciante/planos?renew=${sub.id}`;

      let statusDescription = '';
      if (daysRemaining > 1) {
        statusDescription = `Vence em ${daysRemaining} dias (${dateFormatted})`;
      } else if (daysRemaining === 1) {
        statusDescription = `Vence amanhã (${dateFormatted})`;
      } else if (daysRemaining === 0) {
        statusDescription = `Vence hoje (${dateFormatted})!`;
      } else {
        statusDescription = `Venceu há ${Math.abs(daysRemaining)} dia(s) (${dateFormatted})`;
      }

      const message = `Olá, *${merchantName}*! Tudo bem?\n\nLembramos que o plano de destaque VIP *${planName}* do estabelecimento *${listingName}* no portal *Os Melhores da Cidade* ${daysRemaining >= 0 ? `vence em ${daysRemaining === 0 ? 'HOJE' : daysRemaining + ' dias'} (${dateFormatted})` : `expirou em ${dateFormatted}`}.\n\nPara não perder o selo VIP, o topo das pesquisas e os leads diretos no seu WhatsApp, renove de forma rápida e segura pelo link:\n👉 ${renewUrl}\n\nQualquer dúvida, estamos à disposição!`;

      const whatsAppLink = phoneClean ? `https://wa.me/55${phoneClean}?text=${encodeURIComponent(message)}` : null;

      return {
        id: sub.id,
        listingId: sub.listingId,
        listingName,
        merchantName,
        merchantEmail: sub.merchantProfile?.user?.email || null,
        merchantPhone: rawPhone,
        cityName: sub.listing?.city?.name || 'Barreiras',
        plan: sub.plan,
        planName,
        billingCycle: sub.billingCycle,
        price: Number(sub.price),
        endDate: sub.endDate,
        daysRemaining,
        statusDescription,
        renewUrl,
        whatsAppLink,
        whatsAppMessage: message,
      };
    });
  }

  async processSubscriptionRenewals() {
    const list = await this.getExpiringSubscriptions(5);
    let emailsSent = 0;
    let notificationsCreated = 0;

    for (const item of list) {
      // 1. Notificação interna se o usuário existir
      const sub = await this.prisma.merchantSubscription.findUnique({
        where: { id: item.id },
        include: { merchantProfile: true },
      });

      if (sub?.merchantProfile?.userId) {
        const userId = sub.merchantProfile.userId;
        const recentNotif = await this.prisma.notification.findFirst({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // não repete no mesmo dia
            },
            type: NotificationType.SYSTEM_ALERT,
            title: { contains: 'Renovação' },
          },
        });

        if (!recentNotif) {
          await this.prisma.notification.create({
            data: {
              userId,
              type: NotificationType.SYSTEM_ALERT,
              title: `⏰ Renovação de Plano: ${item.listingName}`,
              message: `O plano ${item.planName} ${item.daysRemaining >= 0 ? `vence em ${item.daysRemaining} dias` : 'está expirado'}. Mantenha seu destaque e continue recebendo leads VIP.`,
              linkUrl: '/comerciante/planos',
              metadata: {
                subscriptionId: item.id,
                daysRemaining: item.daysRemaining,
              },
            },
          });
          notificationsCreated++;
        }
      }

      // 2. Disparo de E-mail
      if (item.merchantEmail) {
        if (item.daysRemaining >= 0) {
          const res = await this.mailService.sendSubscriptionExpiringEmail({
            merchantName: item.merchantName,
            merchantEmail: item.merchantEmail,
            listingName: item.listingName,
            planName: item.planName,
            daysLeft: Math.max(0, item.daysRemaining),
            renewUrl: item.renewUrl,
          });
          if (res.success) emailsSent++;
        } else {
          const res = await this.mailService.sendSubscriptionExpiredEmail({
            merchantName: item.merchantName,
            merchantEmail: item.merchantEmail,
            listingName: item.listingName,
            planName: item.planName,
            renewUrl: item.renewUrl,
          });
          if (res.success) emailsSent++;
        }
      }
    }

    return {
      success: true,
      totalExpiring: list.length,
      emailsSent,
      notificationsCreated,
      items: list,
    };
  }

  async getAdminSplitSettlements(cityId?: string) {
    const where: any = {
      status: PaymentStatus.PAID,
    };

    if (cityId) {
      where.subscription = {
        listing: { cityId },
      };
    }

    const payments = await this.prisma.subscriptionPayment.findMany({
      where,
      include: {
        subscription: {
          include: {
            listing: {
              include: {
                city: true,
              },
            },
            merchantProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
      take: 100,
    });

    let grossTotal = 0;
    let franchiseTotal = 0;
    let platformTotal = 0;

    const settlements = payments.map((p) => {
      const city = p.subscription?.listing?.city;
      const franchiseFeePercent = city?.splitEnabled ? Number(city.franchiseFeePercent || 80) : 0;
      const platformFeePercent = 100 - franchiseFeePercent;

      const grossAmount = Number(p.amount);
      const franchiseAmount = (grossAmount * franchiseFeePercent) / 100;
      const platformAmount = grossAmount - franchiseAmount;

      grossTotal += grossAmount;
      franchiseTotal += franchiseAmount;
      platformTotal += platformAmount;

      return {
        paymentId: p.id,
        subscriptionId: p.subscriptionId,
        listingName: p.subscription?.listing?.name || 'Estabelecimento',
        merchantName: p.subscription?.merchantProfile?.user?.name || 'Comerciante',
        cityName: city?.name || 'Não informada',
        splitEnabled: Boolean(city?.splitEnabled),
        franchiseName: city?.franchiseName || 'Matriz / Sem Franquia',
        franchiseWalletId: city?.franchiseWalletId || null,
        franchisePixKey: city?.franchisePixKey || null,
        franchiseFeePercent,
        platformFeePercent,
        grossAmount,
        franchiseAmount,
        platformAmount,
        paymentMethod: p.method,
        status: p.status,
        paidAt: p.paidAt || p.createdAt,
      };
    });

    return {
      totals: {
        grossTotal,
        franchiseTotal,
        platformTotal,
        settlementsCount: settlements.length,
      },
      settlements,
    };
  }

  /**
   * Emissão de Contrato de Adesão e Publicidade Digital em PDF
   */
  async getSubscriptionContract(user: any, subscriptionId: string) {
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
            neighborhood: true,
            phone: true,
            whatsapp: true,
            city: { select: { id: true, name: true, state: true } },
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
            phone: true,
            whatsapp: true,
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
      throw new NotFoundException('Assinatura não encontrada.');
    }

    const isOwner =
      subscription.merchantProfile?.userId === user.id ||
      subscription.merchantProfile?.user?.id === user.id;

    if (user.role !== 'ADMIN' && !isOwner) {
      throw new ForbiddenException('Acesso negado ao contrato desta assinatura.');
    }

    const year = new Date(subscription.createdAt).getFullYear();
    const contractNumber = `CTR-${year}-${subscription.id.substring(0, 8).toUpperCase()}`;

    const planNames: Record<SubscriptionPlan, string> = {
      [SubscriptionPlan.FREE]: 'Plano Gratuito',
      [SubscriptionPlan.BRONZE_DESTAQUE]: 'Bronze Destaque VIP',
      [SubscriptionPlan.PRATA_REGIONAL]: 'Prata Regional VIP',
      [SubscriptionPlan.OURO_MASTER]: 'Ouro Master VIP (N° 1 do Guia)',
    };

    const cityName = subscription.listing?.city?.name || 'Barreiras';
    const stateName = subscription.listing?.city?.state || 'BA';

    // Hash de Autenticidade Digital SHA-256
    const rawContractSignature = `${contractNumber}|${subscription.id}|${subscription.merchantProfile?.id}|${subscription.price}|${subscription.createdAt.toISOString()}|OSM_DIGITAL_LEGAL_CONTRACT_SECRET`;
    const digitalSignatureHash = crypto
      .createHash('sha256')
      .update(rawContractSignature)
      .digest('hex');

    return {
      contractNumber,
      digitalSignatureHash,
      verificationUrl: `https://osmelhoresdacidade.com.br/verificar-contrato?id=${subscription.id}&hash=${digitalSignatureHash.substring(0, 16)}`,
      status: subscription.status,
      issuedAt: subscription.createdAt,
      effectiveStartDate: subscription.startDate,
      effectiveEndDate: subscription.endDate,
      billingCycle: subscription.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal',
      plan: {
        id: subscription.plan,
        name: planNames[subscription.plan] || subscription.plan,
        price: Number(subscription.price),
      },
      emitter: {
        tradeName: 'Os Melhores da Cidade Internet & Publicidade Ltda',
        legalName: 'OS MELHORES DA CIDADE PLATAFORMA DIGITAL LTDA',
        cnpj: '48.912.834/0001-90',
        headquarters: 'Barreiras - Bahia, Brasil',
        email: 'juridico@osmelhoresdacidade.com.br',
        website: 'https://osmelhoresdacidade.com.br',
      },
      contractor: {
        tradeName: subscription.merchantProfile?.companyName || subscription.listing?.name || 'Comerciante Titular',
        legalName: subscription.merchantProfile?.legalName || subscription.merchantProfile?.companyName || subscription.listing?.name,
        document: subscription.merchantProfile?.cnpj || 'Documento cadastrado em conta',
        address: subscription.listing?.street
          ? `${subscription.listing.street}${subscription.listing.number ? ', ' + subscription.listing.number : ''} - ${cityName}/${stateName}`
          : subscription.merchantProfile?.address || `${cityName} - ${stateName}`,
        responsibleName: subscription.merchantProfile?.user?.name || 'Representante Legal',
        responsibleEmail: subscription.merchantProfile?.user?.email || '',
        responsiblePhone: subscription.merchantProfile?.whatsapp || subscription.merchantProfile?.phone || subscription.listing?.whatsapp || '',
      },
      listing: {
        id: subscription.listing?.id,
        name: subscription.listing?.name,
        city: `${cityName} - ${stateName}`,
      },
      clauses: [
        {
          title: 'CLÁUSULA PRIMEIRA — DO OBJETO',
          content: `O presente instrumento tem por objeto a prestação de serviços de publicidade, divulgação eletrônica e veiculação institucional do estabelecimento comercial CONTRATANTE no portal "Os Melhores da Cidade" na praça de ${cityName}/${stateName}, sob as prerrogativas do plano ${planNames[subscription.plan]}, assegurando indexação otimizada, carrosséis prioritários e exibição de selo de destaque certificado.`,
        },
        {
          title: 'CLÁUSULA SEGUNDA — DAS OBRIGAÇÕES DA CONTRATADA',
          content: 'A CONTRATADA compromete-se a: (a) Manter os servidores da plataforma disponíveis 24 horas por dia, 7 dias por semana, ressalvadas manutenções programadas; (b) Aplicar o algoritmo de ordenação de destaques contratado conforme o plano; (c) Prover canal de atendimento direto para suporte técnico; (d) Disponibilizar painel de métricas analíticas e estatísticas de engajamento.',
        },
        {
          title: 'CLÁUSULA TERCEIRA — DAS OBRIGAÇÕES DA CONTRATANTE',
          content: 'A CONTRATANTE obriga-se a: (a) Fornecer informações verídicas, fotos legítimas e dados cadastrais idôneos sobre seu negócio; (b) Não veicular produtos, serviços ou anúncios em desconformidade com a legislação brasileira ou os Termos de Uso da plataforma; (c) Efetuar os pagamentos nas datas de vencimento acordadas.',
        },
        {
          title: 'CLÁUSULA QUARTA — DO PREÇO E CONDIÇÕES DE PAGAMENTO',
          content: `Pela prestação dos serviços contratados, a CONTRATANTE pagará o valor de R$ ${Number(subscription.price).toFixed(2)} por ciclo ${subscription.billingCycle === 'YEARLY' ? 'anual' : 'mensal'}, por meio das formas de pagamento homologadas (PIX Dinâmico ou Cartão de Crédito).`,
        },
        {
          title: 'CLÁUSULA QUINTA — DA VIGÊNCIA E RESCISÃO',
          content: 'O contrato entra em vigor na data de sua confirmação financeira com vigência contratual correspondente ao ciclo de faturamento selecionado. O cancelamento pode ser efetuado a qualquer momento no painel do comerciante sem imposição de multas rescisórias abusivas para os períodos subsequentes.',
        },
        {
          title: 'CLÁUSULA SEXTA — DA VALIDADE JURÍDICA ELETRÔNICA E FORO',
          content: `As partes reconhecem a plena validade jurídica, integridade e eficácia executiva do presente contrato celebrado por meio eletrônico, fundamentado nos termos do Art. 10, § 2º da Medida Provisória nº 2.200-2/2001 e do Código Civil Brasileiro. Para dirimir quaisquer controvérsias oriundas deste instrumento, as partes elegem expressamente o foro da Comarca de ${cityName}/${stateName}.`,
        },
      ],
    };
  }


  /**
   * Relatório Consolidado de Faturamento para Fechamento Mensal
   */
  async getMonthlyClosingReport(year: number, month: number) {
    const targetYear = Number(year) || new Date().getFullYear();
    const targetMonth = Number(month) || new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const payments = await this.prisma.subscriptionPayment.findMany({
      where: {
        status: PaymentStatus.PAID,
        OR: [
          { paidAt: { gte: startDate, lte: endDate } },
          { createdAt: { gte: startDate, lte: endDate } },
        ],
      },
      include: {
        subscription: {
          include: {
            listing: {
              include: {
                city: {
                  include: { state: true },
                },
              },
            },
            merchantProfile: {
              include: {
                user: true,
              },
            },
            coupon: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    let grossRevenue = 0;
    let franchiseCommissionTotal = 0;
    let platformNetRevenue = 0;

    const methodStats: Record<string, { count: number; total: number }> = {
      PIX: { count: 0, total: 0 },
      CREDIT_CARD: { count: 0, total: 0 },
    };

    const cityMap = new Map<string, {
      cityName: string;
      uf: string;
      franchiseName: string;
      splitEnabled: boolean;
      transactionsCount: number;
      grossAmount: number;
      franchiseAmount: number;
      platformAmount: number;
    }>();

    const planNames: Record<SubscriptionPlan, string> = {
      [SubscriptionPlan.FREE]: 'Gratuito',
      [SubscriptionPlan.BRONZE_DESTAQUE]: 'Bronze Destaque VIP',
      [SubscriptionPlan.PRATA_REGIONAL]: 'Prata Regional VIP',
      [SubscriptionPlan.OURO_MASTER]: 'Ouro Master VIP',
    };

    const transactions = payments.map((p) => {
      const gross = Number(p.amount);
      grossRevenue += gross;

      const mKey = p.method === PaymentMethod.CREDIT_CARD ? 'CREDIT_CARD' : 'PIX';
      if (!methodStats[mKey]) methodStats[mKey] = { count: 0, total: 0 };
      methodStats[mKey].count += 1;
      methodStats[mKey].total += gross;

      const city = p.subscription?.listing?.city;
      const splitEnabled = Boolean(city?.splitEnabled);
      const franchiseFeePercent = splitEnabled ? Number(city?.franchiseFeePercent || 80) : 0;
      const platformFeePercent = splitEnabled ? Number(city?.platformFeePercent || 20) : 100;

      const franchiseCut = Number(((gross * franchiseFeePercent) / 100).toFixed(2));
      const platformCut = Number((gross - franchiseCut).toFixed(2));

      franchiseCommissionTotal += franchiseCut;
      platformNetRevenue += platformCut;

      const cityId = city?.id || 'SEM_PRACA';
      if (!cityMap.has(cityId)) {
        cityMap.set(cityId, {
          cityName: city?.name || 'Venda Central / Matriz',
          uf: city?.state?.uf || 'BR',
          franchiseName: city?.franchiseName || 'Matriz / Sem Franquia',
          splitEnabled,
          transactionsCount: 0,
          grossAmount: 0,
          franchiseAmount: 0,
          platformAmount: 0,
        });
      }

      const cData = cityMap.get(cityId)!;
      cData.transactionsCount += 1;
      cData.grossAmount += gross;
      cData.franchiseAmount += franchiseCut;
      cData.platformAmount += platformCut;

      return {
        paymentId: p.id,
        invoiceNumber: `FAT-${targetYear}-${p.subscriptionId.substring(0, 8).toUpperCase()}`,
        listingName: p.subscription?.listing?.name || 'Estabelecimento',
        merchantName: p.subscription?.merchantProfile?.user?.name || p.subscription?.merchantProfile?.companyName || 'Comerciante',
        plan: planNames[p.subscription?.plan as SubscriptionPlan] || p.subscription?.plan,
        billingCycle: p.subscription?.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal',
        cityName: city ? `${city.name} - ${city.state?.uf}` : 'Matriz',
        paymentMethod: p.method,
        grossAmount: gross,
        franchiseAmount: franchiseCut,
        platformAmount: platformCut,
        paidAt: p.paidAt || p.createdAt,
      };
    });

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const closingNumber = `FECH-${targetYear}-${String(targetMonth).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const closingHash = crypto
      .createHash('sha256')
      .update(`${closingNumber}|${targetYear}|${targetMonth}|${grossRevenue.toFixed(2)}|${transactions.length}|OSM_MONTHLY_CLOSING_SECRET`)
      .digest('hex');

    return {
      closingNumber,
      closingHash,
      period: {
        year: targetYear,
        month: targetMonth,
        monthName: monthNames[targetMonth - 1],
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        grossRevenue: Number(grossRevenue.toFixed(2)),
        franchiseCommissionTotal: Number(franchiseCommissionTotal.toFixed(2)),
        platformNetRevenue: Number(platformNetRevenue.toFixed(2)),
        transactionsCount: transactions.length,
        averageTicket: transactions.length > 0 ? Number((grossRevenue / transactions.length).toFixed(2)) : 0,
        methodStats,
      },
      cityBreakdown: Array.from(cityMap.values()).map((c) => ({
        ...c,
        grossAmount: Number(c.grossAmount.toFixed(2)),
        franchiseAmount: Number(c.franchiseAmount.toFixed(2)),
        platformAmount: Number(c.platformAmount.toFixed(2)),
      })),
      transactions,
      generatedAt: new Date().toISOString(),
    };
  }


  /**
   * Processar Repasse Bancário PIX para Franquia Regional via Asaas
   */
  async processCityFranchisePayout(cityId: string, requestedAmount?: number) {
    const city = await this.prisma.city.findUnique({
      where: { id: cityId },
      include: {
        state: true,
        franchisePayouts: true,
      },
    });

    if (!city) {
      throw new NotFoundException('Cidade não encontrada.');
    }

    if (!city.splitEnabled) {
      throw new BadRequestException('Esta cidade não está com split de franquia habilitado.');
    }

    if (!city.franchisePixKey) {
      throw new BadRequestException('Esta cidade não possui Chave PIX cadastrada para recebimento de repasses.');
    }

    // Calcular montante total apurado em comissões
    const payments = await this.prisma.subscriptionPayment.findMany({
      where: {
        status: PaymentStatus.PAID,
        subscription: {
          listing: { cityId },
        },
      },
      select: { amount: true },
    });

    const franchiseFeePercent = Number(city.franchiseFeePercent || 80);
    const totalEarnedCommissions = payments.reduce((acc, p) => {
      const gross = Number(p.amount);
      return acc + (gross * franchiseFeePercent) / 100;
    }, 0);

    // Subtrair repasses já quitados
    const previousPayoutsTotal = city.franchisePayouts
      .filter((p) => p.status === 'COMPLETED')
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const availableBalance = Number(Math.max(0, totalEarnedCommissions - previousPayoutsTotal).toFixed(2));

    const payoutAmount = requestedAmount !== undefined && requestedAmount > 0
      ? Math.min(requestedAmount, availableBalance)
      : availableBalance;

    if (payoutAmount <= 0) {
      throw new BadRequestException(`Esta praça não possui saldo pendente de comissão para repasse (Saldo disponível: R$ ${availableBalance.toFixed(2)}).`);
    }

    // Executar transferência PIX via Asaas
    const transferResult = await this.asaasService.transferPix({
      value: payoutAmount,
      pixKey: city.franchisePixKey,
      pixKeyType: city.franchisePixType || 'CNPJ',
      description: `Repasse Franquia ${city.name}/${city.state?.uf || 'BA'} - Os Melhores da Cidade`,
    });

    // Registrar no banco
    const payout = await this.prisma.franchisePayout.create({
      data: {
        cityId: city.id,
        amount: payoutAmount,
        pixKey: city.franchisePixKey,
        pixKeyType: city.franchisePixType || 'CNPJ',
        franchiseName: city.franchiseName || 'Franquia Regional',
        status: 'COMPLETED',
        transactionId: transferResult.id,
        receiptUrl: transferResult.receiptUrl,
        notes: `Repasse bancário de ${payoutAmount.toFixed(2)} liquidado via Asaas Transfer.`,
      },
    });

    // Despachar evento webhook para CRMs e auditoria
    this.webhooksService.dispatch('SPLIT_SETTLED', {
      payoutId: payout.id,
      cityId: city.id,
      cityName: city.name,
      amount: payoutAmount,
      pixKey: city.franchisePixKey,
      transactionId: transferResult.id,
      paidAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Repasse PIX de R$ ${payoutAmount.toFixed(2)} realizado com sucesso para a franquia de ${city.name}!`,
      payout,
      remainingBalance: Number((availableBalance - payoutAmount).toFixed(2)),
    };
  }

  /**
   * Listar Histórico de Repasses PIX
   */
  async getFranchisePayoutsHistory(cityId?: string) {
    const where: any = {};
    if (cityId) where.cityId = cityId;

    return this.prisma.franchisePayout.findMany({
      where,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            state: { select: { uf: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

}
