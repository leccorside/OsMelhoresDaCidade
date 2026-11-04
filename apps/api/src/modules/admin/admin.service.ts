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
}

