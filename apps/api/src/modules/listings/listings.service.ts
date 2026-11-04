import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListingStatus, DayOfWeek } from '@prisma/client';

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

export interface CreateListingDto {
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  categoryId: string;
  cityId: string;
  neighborhoodId?: string;
  street?: string;
  number?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  priceTier?: string;
  metaTitle?: string;
  metaDescription?: string;
  amenities?: string[];
  hours?: Array<{ dayOfWeek: DayOfWeek; openTime: string; closeTime: string; isClosed?: boolean }>;
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

    await this.prisma.listing.update({
      where: { id: listing.id },
      data: { viewsCount: { increment: 1 } },
    });

    return listing;
  }

  // --- ÁREA DO COMERCIANTE ---

  async findMerchantListings(merchantProfileId: string) {
    return this.prisma.listing.findMany({
      where: {
        owners: {
          some: { merchantProfileId },
        },
      },
      include: {
        category: true,
        city: true,
        neighborhood: true,
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMerchantStats(merchantProfileId: string) {
    const listings = await this.prisma.listing.findMany({
      where: {
        owners: {
          some: { merchantProfileId },
        },
      },
      select: {
        id: true,
        viewsCount: true,
        whatsappClicks: true,
        phoneClicks: true,
        directionsClicks: true,
        ratingAverage: true,
        ratingCount: true,
        status: true,
      },
    });

    const totalListings = listings.length;
    const totalViews = listings.reduce((acc, l) => acc + l.viewsCount, 0);
    const totalWhatsappClicks = listings.reduce((acc, l) => acc + l.whatsappClicks, 0);
    const totalDirectionsClicks = listings.reduce((acc, l) => acc + l.directionsClicks, 0);
    const totalPhoneClicks = listings.reduce((acc, l) => acc + l.phoneClicks, 0);

    const ratingsSum = listings.reduce((acc, l) => acc + l.ratingAverage * l.ratingCount, 0);
    const totalRatingReviews = listings.reduce((acc, l) => acc + l.ratingCount, 0);
    const overallRating = totalRatingReviews > 0 ? (ratingsSum / totalRatingReviews).toFixed(1) : '5.0';

    return {
      totalListings,
      totalViews,
      totalWhatsappClicks,
      totalDirectionsClicks,
      totalPhoneClicks,
      overallRating,
      publishedListings: listings.filter((l) => l.status === ListingStatus.PUBLISHED).length,
      pendingListings: listings.filter((l) => l.status === ListingStatus.PENDING).length,
    };
  }

  async create(merchantProfileId: string, dto: CreateListingDto) {
    // Criação com status PENDING para aprovação pela moderação
    return this.prisma.listing.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        fullDescription: dto.fullDescription,
        categoryId: dto.categoryId,
        cityId: dto.cityId,
        neighborhoodId: dto.neighborhoodId,
        street: dto.street,
        number: dto.number,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        website: dto.website,
        priceTier: dto.priceTier || '$$',
        metaTitle: dto.metaTitle || `${dto.name} | Os Melhores da Cidade`,
        metaDescription: dto.metaDescription || dto.shortDescription,
        status: ListingStatus.PENDING,
        owners: {
          create: {
            merchantProfileId,
            role: 'OWNER',
          },
        },
        ...(dto.hours && dto.hours.length > 0
          ? {
              openingHours: {
                createMany: {
                  data: dto.hours.map((h) => ({
                    dayOfWeek: h.dayOfWeek,
                    openTime: h.openTime,
                    closeTime: h.closeTime,
                    isClosed: !!h.isClosed,
                  })),
                },
              },
            }
          : {}),
      },
    });
  }
}
