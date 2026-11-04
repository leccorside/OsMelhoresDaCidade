import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ReviewStatus } from '@prisma/client';

export interface MerchantReviewFilters {
  listingId?: string;
  rating?: number;
  answered?: boolean;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, listingId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('A nota da avaliação deve ser entre 1 e 5 estrelas.');
    }

    const existing = await this.prisma.review.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (existing) {
      throw new BadRequestException('Você já enviou uma avaliação para este estabelecimento.');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        listingId,
        rating,
        comment: comment?.trim() || null,
        status: ReviewStatus.PUBLISHED,
      },
    });

    // Atualizar média ponderada do estabelecimento
    await this.updateListingRating(listingId);

    return review;
  }

  async findUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: { select: { slug: true, name: true } },
          },
        },
        reply: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- GESTÃO DE AVALIAÇÕES DO COMERCIANTE ---

  async ensureMerchantProfile(user: any): Promise<string> {
    if (user.merchantProfile?.id) {
      return user.merchantProfile.id;
    }

    let profile = await this.prisma.merchantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await this.prisma.merchantProfile.create({
        data: {
          userId: user.id,
          companyName: user.name || 'Comerciante Parceiro',
          isApproved: true,
          approvedAt: new Date(),
        },
      });
    }

    return profile.id;
  }

  async findMerchantReviews(user: any, filters?: MerchantReviewFilters) {
    const merchantProfileId = await this.ensureMerchantProfile(user);

    // Condição de estabelecimentos pertencentes ao comerciante (ou todos se ADMIN)
    const listingCondition: any = user.role === 'ADMIN'
      ? {}
      : {
          owners: {
            some: { merchantProfileId },
          },
        };

    // Obter IDs dos estabelecimentos do lojista
    const merchantListings = await this.prisma.listing.findMany({
      where: listingCondition,
      select: { id: true, name: true, slug: true },
    });

    const listingIds = merchantListings.map((l) => l.id);

    if (listingIds.length === 0) {
      return {
        metrics: {
          totalReviews: 0,
          averageRating: 0,
          answeredCount: 0,
          unansweredCount: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
        reviews: [],
        listings: [],
      };
    }

    const where: any = {
      listingId: filters?.listingId && listingIds.includes(filters.listingId)
        ? filters.listingId
        : { in: listingIds },
      status: ReviewStatus.PUBLISHED,
    };

    if (filters?.rating) {
      where.rating = filters.rating;
    }

    if (filters?.answered !== undefined) {
      where.reply = filters.answered ? { isNot: null } : null;
    }

    const [reviews, allReviewsForMetrics] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              email: true,
            },
          },
          listing: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          reply: true,
        },
      }),
      this.prisma.review.findMany({
        where: {
          listingId: { in: listingIds },
          status: ReviewStatus.PUBLISHED,
        },
        select: {
          id: true,
          rating: true,
          reply: { select: { id: true } },
        },
      }),
    ]);

    // Cálculo das métricas consolidadas
    const totalReviews = allReviewsForMetrics.length;
    const answeredCount = allReviewsForMetrics.filter((r) => !!r.reply).length;
    const unansweredCount = totalReviews - answeredCount;

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;

    for (const r of allReviewsForMetrics) {
      sumRating += r.rating;
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    }

    const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

    return {
      metrics: {
        totalReviews,
        averageRating,
        answeredCount,
        unansweredCount,
        distribution,
      },
      reviews,
      listings: merchantListings,
    };
  }

  async replyAsMerchant(user: any, reviewId: string, replyText: string) {
    const merchantProfileId = await this.ensureMerchantProfile(user);

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        listing: {
          include: {
            owners: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada.');
    }

    const isOwner = review.listing.owners.some((o) => o.merchantProfileId === merchantProfileId);
    if (user.role !== 'ADMIN' && !isOwner) {
      throw new ForbiddenException('Você não tem permissão para responder por este estabelecimento.');
    }

    return this.prisma.reviewReply.upsert({
      where: { reviewId },
      update: { reply: replyText.trim() },
      create: {
        reviewId,
        merchantProfileId,
        reply: replyText.trim(),
      },
    });
  }

  async deleteReply(user: any, replyId: string) {
    const reply = await this.prisma.reviewReply.findUnique({
      where: { id: replyId },
      include: {
        review: {
          include: {
            listing: {
              include: { owners: true },
            },
          },
        },
      },
    });

    if (!reply) {
      throw new NotFoundException('Resposta não encontrada.');
    }

    const merchantProfileId = user.merchantProfile?.id;
    const isDirectOwner = reply.merchantProfileId === merchantProfileId;
    const isListingOwner = reply.review.listing.owners.some((o) => o.merchantProfileId === merchantProfileId);

    if (user.role !== 'ADMIN' && !isDirectOwner && !isListingOwner) {
      throw new ForbiddenException('Você não tem permissão para remover esta resposta.');
    }

    return this.prisma.reviewReply.delete({
      where: { id: replyId },
    });
  }

  private async updateListingRating(listingId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        listingId,
        status: ReviewStatus.PUBLISHED,
      },
      select: { rating: true },
    });

    const ratingCount = reviews.length;
    const ratingAverage =
      ratingCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount).toFixed(1))
        : 0;

    await this.prisma.listing.update({
      where: { id: listingId },
      data: { ratingAverage, ratingCount },
    });
  }
}
