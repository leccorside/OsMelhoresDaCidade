import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListingStatus, CouponStatus, NotificationType, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalMerchants,
      totalListings,
      pendingListings,
      totalEvents,
      totalReviews,
      activeCities,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.merchantProfile.count(),
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: ListingStatus.PENDING } }),
      this.prisma.event.count(),
      this.prisma.review.count(),
      this.prisma.city.count({ where: { isPublished: true } }),
    ]);

    return {
      totalUsers,
      totalMerchants,
      totalListings,
      pendingListings,
      totalEvents,
      totalReviews,
      activeCities,
    };
  }

  async getModerationStats() {
    const [pendingCount, publishedCount, rejectedCount] = await Promise.all([
      this.prisma.listing.count({ where: { status: ListingStatus.PENDING } }),
      this.prisma.listing.count({ where: { status: ListingStatus.PUBLISHED } }),
      this.prisma.listing.count({ where: { status: ListingStatus.REJECTED } }),
    ]);

    return {
      pendingCount,
      publishedCount,
      rejectedCount,
    };
  }

  async getPendingListings() {
    return this.prisma.listing.findMany({
      where: { status: ListingStatus.PENDING },
      include: {
        category: true,
        city: true,
        neighborhood: true,
        images: { orderBy: { order: 'asc' } },
        amenities: { include: { amenity: true } },
        owners: {
          include: {
            merchantProfile: {
              include: { user: { select: { id: true, name: true, email: true, phone: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateListingStatus(id: string, status: ListingStatus, notes?: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Estabelecimento não encontrado.');

    return this.prisma.listing.update({
      where: { id },
      data: {
        status,
        ...(notes ? { metaDescription: listing.metaDescription } : {}),
      },
      include: {
        category: true,
        city: true,
        neighborhood: true,
      },
    });
  }

  // --- MODERAÇÃO GLOBAL DE CUPONS & PROMOÇÕES ---

  async findAllCoupons(query?: { status?: string; search?: string }) {
    const where: any = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as CouponStatus;
    }

    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { code: { contains: s, mode: 'insensitive' } },
        { title: { contains: s, mode: 'insensitive' } },
        { listing: { name: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [allCoupons, filteredCoupons] = await Promise.all([
      this.prisma.coupon.findMany({
        include: { claims: { select: { id: true } } },
      }),
      this.prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            select: { id: true, name: true, slug: true, city: { select: { name: true } } },
          },
          claims: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: { id: true, claimCode: true, customerName: true, createdAt: true, usedAt: true },
          },
        },
      }),
    ]);

    const totalCoupons = allCoupons.length;
    const activeCoupons = allCoupons.filter((c) => c.status === CouponStatus.ACTIVE).length;
    const totalClaims = allCoupons.reduce((acc, c) => acc + (c.usedCount || c.claims.length), 0);

    return {
      metrics: {
        totalCoupons,
        activeCoupons,
        totalClaims,
      },
      coupons: filteredCoupons,
    };
  }

  async updateCouponStatusAdmin(id: string, status: CouponStatus) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Cupom não encontrado.');

    return this.prisma.coupon.update({
      where: { id },
      data: { status },
      include: {
        listing: { select: { id: true, name: true } },
      },
    });
  }

  // --- COMUNICADOS E AVISOS DO SISTEMA EM MASSA ---

  async broadcastNotification(dto: {
    title: string;
    message: string;
    linkUrl?: string;
    targetRole?: string;
  }) {
    const where: any = { isActive: true };

    if (dto.targetRole === 'MERCHANT') {
      where.role = Role.MERCHANT;
    } else if (dto.targetRole === 'USER') {
      where.role = Role.USER;
    }

    const recipients = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (recipients.length === 0) {
      return { success: true, count: 0, message: 'Nenhum usuário encontrado para o perfil selecionado.' };
    }

    await this.prisma.notification.createMany({
      data: recipients.map((u) => ({
        userId: u.id,
        type: NotificationType.SYSTEM_ALERT,
        title: dto.title.trim(),
        message: dto.message.trim(),
        linkUrl: dto.linkUrl ? dto.linkUrl.trim() : null,
      })),
    });

    return {
      success: true,
      count: recipients.length,
      message: `Comunicado enviado com sucesso para ${recipients.length} usuário(s)!`,
    };
  }
}

