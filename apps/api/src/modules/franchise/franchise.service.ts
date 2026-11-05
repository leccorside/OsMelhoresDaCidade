import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Role, PaymentStatus, SubscriptionPlan } from '@prisma/client';

@Injectable()
export class FranchiseService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveUserCity(userId: string, requestedCityId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, franchiseCityId: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (user.role === Role.ADMIN) {
      if (requestedCityId) {
        const city = await this.prisma.city.findUnique({
          where: { id: requestedCityId },
          include: { state: true },
        });
        if (city) return city;
      }
      // Se admin não passou cidade, pega a primeira cidade com split/franquia ou qualquer cidade publicada
      const defaultCity = await this.prisma.city.findFirst({
        where: { isPublished: true },
        include: { state: true },
        orderBy: [{ splitEnabled: 'desc' }, { name: 'asc' }],
      });
      if (!defaultCity) {
        throw new NotFoundException('Nenhuma cidade encontrada no sistema.');
      }
      return defaultCity;
    }

    if (user.role === Role.FRANCHISEE) {
      if (!user.franchiseCityId) {
        throw new ForbiddenException('Este usuário franqueado não possui uma cidade vinculada.');
      }
      const city = await this.prisma.city.findUnique({
        where: { id: user.franchiseCityId },
        include: { state: true },
      });
      if (!city) {
        throw new NotFoundException('Cidade da franquia não encontrada.');
      }
      return city;
    }

    throw new ForbiddenException('Acesso restrito a franqueados e administradores.');
  }

  async getFranchiseOverview(userId: string, requestedCityId?: string) {
    const city = await this.resolveUserCity(userId, requestedCityId);

    // 1. Contagens de Anúncios na cidade
    const [totalListings, publishedListings, pendingListings] = await Promise.all([
      this.prisma.listing.count({ where: { cityId: city.id } }),
      this.prisma.listing.count({ where: { cityId: city.id, status: 'PUBLISHED' } }),
      this.prisma.listing.count({ where: { cityId: city.id, status: 'PENDING' } }),
    ]);

    // 2. Assinaturas pagas vinculadas à cidade
    const paidSubscriptions = await this.prisma.merchantSubscription.findMany({
      where: {
        listing: { cityId: city.id },
        status: PaymentStatus.PAID,
        plan: { not: SubscriptionPlan.FREE },
      },
      include: {
        listing: { select: { id: true, name: true } },
      },
    });

    const now = new Date();
    const activeVips = paidSubscriptions.filter((s) => s.endDate && s.endDate >= now);

    const monthlyRevenue = activeVips.reduce((acc, sub) => acc + Number(sub.price), 0);
    const franchiseFeePercent = Number(city.franchiseFeePercent || 80);
    const platformFeePercent = Number(city.platformFeePercent || 20);

    const franchiseCommission = (monthlyRevenue * franchiseFeePercent) / 100;
    const platformCommission = (monthlyRevenue * platformFeePercent) / 100;

    return {
      city: {
        id: city.id,
        name: city.name,
        slug: city.slug,
        uf: city.state.uf,
        franchiseName: city.franchiseName || 'Franquia Local',
        franchiseCnpj: city.franchiseCnpj,
        franchisePixKey: city.franchisePixKey,
        franchisePixType: city.franchisePixType,
        franchiseFeePercent,
        platformFeePercent,
        splitEnabled: city.splitEnabled,
      },
      stats: {
        totalListings,
        publishedListings,
        pendingListings,
        activeVipCount: activeVips.length,
        monthlyRevenue,
        franchiseCommission,
        platformCommission,
        vipPlansBreakdown: {
          bronze: activeVips.filter((s) => s.plan === SubscriptionPlan.BRONZE_DESTAQUE).length,
          prata: activeVips.filter((s) => s.plan === SubscriptionPlan.PRATA_REGIONAL).length,
          ouro: activeVips.filter((s) => s.plan === SubscriptionPlan.OURO_MASTER).length,
        },
      },
    };
  }

  async getFranchiseMerchants(
    userId: string,
    query?: { search?: string; status?: string; requestedCityId?: string },
  ) {
    const city = await this.resolveUserCity(userId, query?.requestedCityId);

    const where: any = {
      cityId: city.id,
    };

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { whatsapp: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    const listings = await this.prisma.listing.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        owners: {
          include: {
            merchantProfile: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, phone: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const now = new Date();

    return listings.map((l) => {
      const latestSub = l.subscriptions[0];
      const isVip =
        latestSub &&
        latestSub.status === PaymentStatus.PAID &&
        latestSub.plan !== SubscriptionPlan.FREE &&
        (!latestSub.endDate || latestSub.endDate >= now);

      const owner = l.owners[0]?.merchantProfile?.user;
      const contactPhone = l.whatsapp || l.phone || owner?.phone || '';
      const phoneClean = contactPhone.replace(/\D/g, '');

      return {
        id: l.id,
        name: l.name,
        slug: l.slug,
        status: l.status,
        categoryName: l.category?.name || 'Geral',
        address: `${l.street || ''}${l.number ? ', ' + l.number : ''}`,
        phone: contactPhone,
        ownerName: owner?.name || 'Não vinculado',
        ownerEmail: owner?.email || null,
        isVip,
        currentPlan: isVip ? latestSub.plan : 'FREE',
        planExpiresAt: latestSub?.endDate || null,
        whatsAppLink: phoneClean
          ? `https://wa.me/55${phoneClean}?text=${encodeURIComponent(
              `Olá, parceiro da ${l.name}! Sou o gestor oficial da franquia Os Melhores da Cidade em ${city.name}.`,
            )}`
          : null,
      };
    });
  }

  async getFranchiseSubscriptions(userId: string, requestedCityId?: string) {
    const city = await this.resolveUserCity(userId, requestedCityId);

    const subscriptions = await this.prisma.merchantSubscription.findMany({
      where: {
        listing: { cityId: city.id },
      },
      include: {
        listing: { select: { id: true, name: true, phone: true, whatsapp: true } },
        merchantProfile: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const franchiseFeePercent = Number(city.franchiseFeePercent || 80);
    const platformFeePercent = Number(city.platformFeePercent || 20);

    return subscriptions.map((sub) => {
      const grossAmount = Number(sub.price);
      const franchiseCut = (grossAmount * franchiseFeePercent) / 100;
      const platformCut = (grossAmount * platformFeePercent) / 100;

      return {
        id: sub.id,
        listingName: sub.listing?.name || 'Estabelecimento',
        merchantName: sub.merchantProfile?.user?.name || 'Comerciante',
        plan: sub.plan,
        status: sub.status,
        billingCycle: sub.billingCycle,
        grossAmount,
        franchiseCut,
        platformCut,
        startDate: sub.startDate,
        endDate: sub.endDate,
        createdAt: sub.createdAt,
      };
    });
  }
}
