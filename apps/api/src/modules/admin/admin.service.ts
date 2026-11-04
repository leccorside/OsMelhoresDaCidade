import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListingStatus } from '@prisma/client';

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

  async getPendingListings() {
    return this.prisma.listing.findMany({
      where: { status: ListingStatus.PENDING },
      include: {
        category: true,
        city: true,
        owners: {
          include: {
            merchantProfile: {
              include: { user: { select: { name: true, email: true, phone: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateListingStatus(id: string, status: ListingStatus) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Estabelecimento não encontrado.');

    return this.prisma.listing.update({
      where: { id },
      data: { status },
    });
  }
}

