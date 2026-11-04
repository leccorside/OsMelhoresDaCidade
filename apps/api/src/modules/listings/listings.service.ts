import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListingStatus } from '@prisma/client';

export interface ListingFilterParams {
  citySlug?: string;
  categorySlug?: string;
  neighborhoodSlug?: string;
  search?: string;
  priceTier?: string;
  isFeatured?: boolean;
  sortBy?: 'melhores' | 'populares' | 'menor_preco' | 'recentes';
  page?: number;
  limit?: number;
}

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: ListingFilterParams) {
    const {
      citySlug,
      categorySlug,
      neighborhoodSlug,
      search,
      priceTier,
      isFeatured,
      sortBy = 'melhores',
      page = 1,
      limit = 12,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      status: ListingStatus.PUBLISHED,
    };

    if (citySlug) {
      where.city = { slug: citySlug };
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (neighborhoodSlug) {
      where.neighborhood = { slug: neighborhoodSlug };
    }

    if (priceTier) {
      where.priceTier = priceTier;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = [{ isFeatured: 'desc' }, { ratingAverage: 'desc' }];
    if (sortBy === 'populares') {
      orderBy = [{ viewsCount: 'desc' }];
    } else if (sortBy === 'recentes') {
      orderBy = [{ createdAt: 'desc' }];
    } else if (sortBy === 'menor_preco') {
      orderBy = [{ priceTier: 'asc' }];
    }

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          city: { select: { id: true, name: true, slug: true } },
          neighborhood: { select: { id: true, name: true, slug: true } },
          images: {
            where: { isCover: true },
            take: 1,
          },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(citySlug: string, slug: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        slug,
        city: { slug: citySlug },
        status: ListingStatus.PUBLISHED,
      },
      include: {
        category: true,
        subcategory: true,
        city: true,
        neighborhood: true,
        images: {
          orderBy: { order: 'asc' },
        },
        openingHours: true,
        specialHours: true,
        amenities: {
          include: { amenity: true },
        },
        socialLinks: true,
        serviceCategories: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        reviews: {
          where: { status: 'PUBLISHED' },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            reply: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!listing) {
      throw new NotFoundException(`Estabelecimento "${slug}" não encontrado em ${citySlug}.`);
    }

    // Incrementar contador de visualizações
    await this.prisma.listing.update({
      where: { id: listing.id },
      data: { viewsCount: { increment: 1 } },
    });

    return listing;
  }
}

