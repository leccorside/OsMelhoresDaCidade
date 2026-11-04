import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  SubscriptionPlan,
  PaymentStatus,
  PaymentMethod,
  NotificationType,
} from '@prisma/client';
import { CreateCheckoutDto } from './dto/billing.dto';

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
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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

    const price = dto.billingCycle === 'YEARLY' ? selectedPlan.priceYearly : selectedPlan.priceMonthly;

    // Gerar código EMV Copia e Cola do PIX Dinâmico (simulado com padrão nacional)
    const randomTxid = Math.random().toString(36).substring(2, 10).toUpperCase();
    const pixQrCode = `00020126580014BR.GOV.BCB.PIX0136pagamentos@osmelhoresdacidade.com.br0208TXID${randomTxid}520400005303986540${price.toFixed(2)}5802BR5922OS MELHORES DA CIDADE6009GOIANIA62070503***6304E8A2`;
    const gatewayInvoiceUrl = `https://fatura.osmelhoresdacidade.com.br/pay/${randomTxid}`;

    // Gravar assinatura e cobrança
    const subscription = await this.prisma.merchantSubscription.create({
      data: {
        merchantProfileId: merchant.id,
        listingId: dto.listingId,
        plan: dto.plan,
        status: PaymentStatus.PENDING,
        price,
        billingCycle: dto.billingCycle || 'MONTHLY',
        pixQrCode,
        gatewayPaymentId: `PAY-${randomTxid}`,
        gatewayInvoiceUrl,
      },
      include: {
        listing: { select: { id: true, name: true, slug: true } },
      },
    });

    await this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: price,
        method: dto.paymentMethod || PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      plan: selectedPlan,
      price,
      billingCycle: subscription.billingCycle,
      pixQrCode,
      gatewayInvoiceUrl,
      listing: subscription.listing,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h para pagamento
    };
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
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return subscriptions;
  }
}

