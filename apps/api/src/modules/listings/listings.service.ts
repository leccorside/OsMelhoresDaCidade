import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListingStatus, DayOfWeek, Prisma } from '@prisma/client';
import { CreateListingFullDto } from './dto/create-listing-full.dto';

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

  // --- ÁREA ADMINISTRATIVA MASTER ---

  async findAllAdmin(query: { search?: string; categorySlug?: string; status?: string }) {
    const where: any = {};

    if (query.status && query.status !== 'todos') {
      if (query.status === 'ativos') where.status = ListingStatus.PUBLISHED;
      else if (query.status === 'pendentes') where.status = ListingStatus.PENDING;
      else if (query.status === 'destaques') where.isFeatured = true;
    }

    if (query.categorySlug && query.categorySlug !== 'todos') {
      where.category = { slug: query.categorySlug };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { neighborhood: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const items = await this.prisma.listing.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        city: { select: { name: true, slug: true } },
        neighborhood: { select: { name: true, slug: true } },
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    return items;
  }

  async findAdminByIdOrSlug(idOrSlug: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
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
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException(`Estabelecimento "${idOrSlug}" não encontrado no banco.`);
    }

    return listing;
  }

  async createFull(dto: CreateListingFullDto) {
    // 1. Resolver Cidade (padrão Caldas Novas se não especificada)
    let city = await this.prisma.city.findFirst({
      where: dto.cityId
        ? { id: dto.cityId }
        : { slug: dto.citySlug || 'caldas-novas' },
    });

    if (!city) {
      city = await this.prisma.city.findFirst({
        where: { slug: 'caldas-novas' },
      });
      if (!city) {
        throw new NotFoundException('Município não localizado no sistema.');
      }
    }

    // 2. Resolver Categoria
    let category = await this.prisma.category.findFirst({
      where: dto.categoryId
        ? { id: dto.categoryId }
        : { slug: dto.categorySlug || 'atracoes' },
    });

    if (!category) {
      // Tenta achar qualquer categoria ativa
      category = await this.prisma.category.findFirst({
        where: { isActive: true },
      });
      if (!category) {
        throw new NotFoundException('Nenhuma categoria ativa cadastrada no sistema.');
      }
    }

    // 3. Resolver ou Criar Bairro no município
    let neighborhoodId = dto.neighborhoodId;
    if (!neighborhoodId && dto.neighborhoodName) {
      const slugNeighborhood = dto.neighborhoodName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const neighborhood = await this.prisma.neighborhood.upsert({
        where: {
          cityId_slug: {
            cityId: city.id,
            slug: slugNeighborhood,
          },
        },
        update: { name: dto.neighborhoodName },
        create: {
          cityId: city.id,
          name: dto.neighborhoodName,
          slug: slugNeighborhood,
        },
      });
      neighborhoodId = neighborhood.id;
    }

    // 4. Salvar Listing e seus relacionamentos numa transação atômica
    return this.prisma.$transaction(async (tx) => {
      // Upsert do Listing por (cityId, slug)
      const listing = await tx.listing.upsert({
        where: {
          cityId_slug: {
            cityId: city.id,
            slug: dto.slug,
          },
        },
        update: {
          name: dto.name,
          shortDescription: dto.shortDescription,
          fullDescription: dto.fullDescription,
          categoryId: category.id,
          neighborhoodId,
          street: dto.street,
          number: dto.number,
          zipCode: dto.zipCode,
          latitude: dto.latitude,
          longitude: dto.longitude,
          phone: dto.phone,
          whatsapp: dto.whatsapp,
          website: dto.website,
          priceTier: dto.priceTier || '$$',
          status: dto.status || ListingStatus.PUBLISHED,
          isFeatured: dto.isFeatured ?? true,
          metaTitle: dto.metaTitle || `${dto.name} em ${city.name} | Os Melhores da Cidade`,
          metaDescription: dto.metaDescription || dto.shortDescription,
        },
        create: {
          name: dto.name,
          slug: dto.slug,
          shortDescription: dto.shortDescription,
          fullDescription: dto.fullDescription,
          cityId: city.id,
          categoryId: category.id,
          neighborhoodId,
          street: dto.street,
          number: dto.number,
          zipCode: dto.zipCode,
          latitude: dto.latitude,
          longitude: dto.longitude,
          phone: dto.phone,
          whatsapp: dto.whatsapp,
          website: dto.website,
          priceTier: dto.priceTier || '$$',
          status: dto.status || ListingStatus.PUBLISHED,
          isFeatured: dto.isFeatured ?? true,
          metaTitle: dto.metaTitle || `${dto.name} em ${city.name} | Os Melhores da Cidade`,
          metaDescription: dto.metaDescription || dto.shortDescription,
        },
      });

      // 5. Imagens do Mosaico Fotográfico
      if (dto.images && dto.images.length > 0) {
        await tx.listingImage.deleteMany({ where: { listingId: listing.id } });
        await tx.listingImage.createMany({
          data: dto.images.map((img, idx) => ({
            listingId: listing.id,
            url: img.url,
            caption: img.altText || `${dto.name} foto ${idx + 1}`,
            isCover: img.isCover !== undefined ? img.isCover : idx === 0,
            order: img.order !== undefined ? img.order : idx,
          })),
        });
      }

      // 6. Comodidades & Diferenciais
      if (dto.amenities && dto.amenities.length > 0) {
        await tx.listingAmenity.deleteMany({ where: { listingId: listing.id } });
        for (const amName of dto.amenities) {
          if (!amName.trim()) continue;
          const amSlug = amName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

          const am = await tx.amenity.upsert({
            where: { slug: amSlug },
            update: { name: amName.trim() },
            create: { name: amName.trim(), slug: amSlug },
          });
          await tx.listingAmenity.create({
            data: {
              listingId: listing.id,
              amenityId: am.id,
            },
          });
        }
      }

      // 7. Horários de Funcionamento
      if (dto.openingHours && dto.openingHours.length > 0) {
        await tx.listingOpeningHour.deleteMany({ where: { listingId: listing.id } });
        await tx.listingOpeningHour.createMany({
          data: dto.openingHours.map((h) => ({
            listingId: listing.id,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: !!h.isClosed,
          })),
        });
      }

      // 8. Seções e Itens de Serviço Adaptados (Ingressos, Quartos ou Cardápio)
      if (dto.serviceCategories && dto.serviceCategories.length > 0) {
        await tx.listingServiceCategory.deleteMany({ where: { listingId: listing.id } });
        for (const catDto of dto.serviceCategories) {
          const sCat = await tx.listingServiceCategory.create({
            data: {
              listingId: listing.id,
              name: catDto.name,
              order: catDto.order || 0,
            },
          });

          if (catDto.items && catDto.items.length > 0) {
            await tx.listingServiceItem.createMany({
              data: catDto.items.map((item, iIdx) => ({
                serviceCategoryId: sCat.id,
                name: item.name,
                description: item.description,
                price: item.price !== undefined ? new Prisma.Decimal(item.price) : null,
                imageUrl: item.imageUrl,
                isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                order: iIdx,
              })),
            });
          }
        }
      }

      return tx.listing.findUnique({
        where: { id: listing.id },
        include: {
          category: true,
          city: true,
          neighborhood: true,
          images: true,
          amenities: { include: { amenity: true } },
          serviceCategories: { include: { items: true } },
        },
      });
    });
  }

  async deleteListing(id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Estabelecimento não encontrado.');

    return this.prisma.listing.delete({
      where: { id },
    });
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
