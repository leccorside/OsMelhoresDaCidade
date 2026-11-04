import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ReviewStatus } from '@prisma/client';

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
        comment,
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

  async replyAsMerchant(merchantProfileId: string, reviewId: string, reply: string) {
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
    if (!isOwner) {
      throw new ForbiddenException('Você não tem permissão para responder por este estabelecimento.');
    }

    return this.prisma.reviewReply.upsert({
      where: { reviewId },
      update: { reply },
      create: {
        reviewId,
        merchantProfileId,
        reply,
      },
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

