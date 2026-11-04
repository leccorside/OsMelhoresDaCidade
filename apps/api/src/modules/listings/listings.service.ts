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
              orderBy: [{ isAvailable: 'desc' }, { order: 'asc' }],
            },
          },
        },
        events: {
          where: {
            status: 'PUBLISHED',
            startDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
          orderBy: { startDate: 'asc' },
          include: {
            category: true,
            images: { where: { isCover: true }, take: 1 },
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

  async createFull(dto: CreateListingFullDto, user?: any) {
    // Se for comerciante, forçar status PENDING para moderação editorial
    if (user && user.role === 'MERCHANT') {
      dto.status = ListingStatus.PENDING;
    }

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

    // Validação de posse para comerciantes em caso de atualização
    if (user && user.role === 'MERCHANT' && user.merchantProfile) {
      const existingListing = await this.prisma.listing.findUnique({
        where: {
          cityId_slug: {
            cityId: city.id,
            slug: dto.slug,
          },
        },
      });

      if (existingListing) {
        const isOwner = await this.prisma.listingOwner.findUnique({
          where: {
            listingId_merchantProfileId: {
              listingId: existingListing.id,
              merchantProfileId: user.merchantProfile.id,
            },
          },
        });
        if (!isOwner) {
          throw new ForbiddenException('Você não possui autorização para alterar este estabelecimento.');
        }
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

      // Se usuário for comerciante ou tiver merchantProfile, vincular como proprietário
      if (user?.merchantProfile?.id) {
        await tx.listingOwner.upsert({
          where: {
            listingId_merchantProfileId: {
              listingId: listing.id,
              merchantProfileId: user.merchantProfile.id,
            },
          },
          update: {},
          create: {
            listingId: listing.id,
            merchantProfileId: user.merchantProfile.id,
            role: 'OWNER',
          },
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

  async ensureAdminMerchantProfile(userId: string, userName?: string): Promise<string> {
    let profile = await this.prisma.merchantProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      profile = await this.prisma.merchantProfile.create({
        data: {
          userId,
          companyName: `Administração - ${userName || 'Master'}`,
          isApproved: true,
          approvedAt: new Date(),
        },
      });
    }
    return profile.id;
  }

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
        images: {
          orderBy: { order: 'asc' },
        },
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

  // --- GERENCIAMENTO DE CARDÁPIO & SERVIÇOS DO COMERCIANTE ---

  async verifyMerchantOwnership(user: any, listingIdOrSlug: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        OR: [{ id: listingIdOrSlug }, { slug: listingIdOrSlug }],
      },
      include: {
        city: {
          include: {
            state: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Estabelecimento não encontrado.');
    }

    if (user.role === 'ADMIN') {
      return listing;
    }

    if (!user.merchantProfile) {
      throw new ForbiddenException('Usuário não possui perfil de comerciante credenciado.');
    }

    const isOwner = await this.prisma.listingOwner.findUnique({
      where: {
        listingId_merchantProfileId: {
          listingId: listing.id,
          merchantProfileId: user.merchantProfile.id,
        },
      },
    });

    if (!isOwner) {
      throw new ForbiddenException('Você não tem permissão para gerenciar este estabelecimento.');
    }

    return listing;
  }

  async getMerchantServices(user: any, listingIdOrSlug: string) {
    const listing = await this.verifyMerchantOwnership(user, listingIdOrSlug);

    const categories = await this.prisma.listingServiceCategory.findMany({
      where: { listingId: listing.id },
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      listing: {
        id: listing.id,
        name: listing.name,
        title: listing.name,
        slug: listing.slug,
        primaryCity: listing.city
          ? {
              name: listing.city.name,
              state: listing.city.state?.uf || listing.city.state?.name || '',
            }
          : null,
      },
      categories,
    };
  }

  async createServiceCategory(user: any, listingIdOrSlug: string, name: string, order?: number) {
    const listing = await this.verifyMerchantOwnership(user, listingIdOrSlug);

    const count = await this.prisma.listingServiceCategory.count({
      where: { listingId: listing.id },
    });

    return this.prisma.listingServiceCategory.create({
      data: {
        listingId: listing.id,
        name: name.trim(),
        order: order !== undefined ? order : count,
      },
      include: {
        items: true,
      },
    });
  }

  async updateServiceCategory(user: any, categoryId: string, name: string, order?: number) {
    const category = await this.prisma.listingServiceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Seção de serviço não encontrada.');
    }

    await this.verifyMerchantOwnership(user, category.listingId);

    return this.prisma.listingServiceCategory.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        ...(order !== undefined ? { order } : {}),
      },
      include: {
        items: true,
      },
    });
  }

  async deleteServiceCategory(user: any, categoryId: string) {
    const category = await this.prisma.listingServiceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Seção de serviço não encontrada.');
    }

    await this.verifyMerchantOwnership(user, category.listingId);

    return this.prisma.listingServiceCategory.delete({
      where: { id: categoryId },
    });
  }

  async createServiceItem(
    user: any,
    categoryId: string,
    dto: {
      name: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      isAvailable?: boolean;
      order?: number;
    },
  ) {
    const category = await this.prisma.listingServiceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Seção de serviço não encontrada.');
    }

    await this.verifyMerchantOwnership(user, category.listingId);

    const count = await this.prisma.listingServiceItem.count({
      where: { serviceCategoryId: categoryId },
    });

    return this.prisma.listingServiceItem.create({
      data: {
        serviceCategoryId: categoryId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        price: dto.price !== undefined ? new Prisma.Decimal(dto.price) : null,
        imageUrl: dto.imageUrl || null,
        isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
        order: dto.order !== undefined ? dto.order : count,
      },
    });
  }

  async updateServiceItem(
    user: any,
    itemId: string,
    dto: {
      name?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      isAvailable?: boolean;
      order?: number;
    },
  ) {
    const item = await this.prisma.listingServiceItem.findUnique({
      where: { id: itemId },
      include: { serviceCategory: true },
    });

    if (!item) {
      throw new NotFoundException('Item de serviço não encontrado.');
    }

    await this.verifyMerchantOwnership(user, item.serviceCategory.listingId);

    return this.prisma.listingServiceItem.update({
      where: { id: itemId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
        ...(dto.price !== undefined ? { price: dto.price !== null ? new Prisma.Decimal(dto.price) : null } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl || null } : {}),
        ...(dto.isAvailable !== undefined ? { isAvailable: dto.isAvailable } : {}),
        ...(dto.order !== undefined ? { order: dto.order } : {}),
      },
    });
  }

  async toggleServiceItemAvailability(user: any, itemId: string) {
    const item = await this.prisma.listingServiceItem.findUnique({
      where: { id: itemId },
      include: { serviceCategory: true },
    });

    if (!item) {
      throw new NotFoundException('Item de serviço não encontrado.');
    }

    await this.verifyMerchantOwnership(user, item.serviceCategory.listingId);

    return this.prisma.listingServiceItem.update({
      where: { id: itemId },
      data: {
        isAvailable: !item.isAvailable,
      },
    });
  }

  async deleteServiceItem(user: any, itemId: string) {
    const item = await this.prisma.listingServiceItem.findUnique({
      where: { id: itemId },
      include: { serviceCategory: true },
    });

    if (!item) {
      throw new NotFoundException('Item de serviço não encontrado.');
    }

    await this.verifyMerchantOwnership(user, item.serviceCategory.listingId);

    return this.prisma.listingServiceItem.delete({
      where: { id: itemId },
    });
  }

  // --- GESTÃO DA GALERIA DE FOTOS DO COMERCIANTE ---

  async getMerchantGallery(user: any, listingIdOrSlug: string) {
    const listing = await this.verifyMerchantOwnership(user, listingIdOrSlug);

    const images = await this.prisma.listingImage.findMany({
      where: { listingId: listing.id },
      orderBy: [{ isCover: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      listing: {
        id: listing.id,
        name: listing.name,
        slug: listing.slug,
        coverUrl: listing.coverUrl,
      },
      images,
    };
  }

  async addMerchantGalleryImages(
    user: any,
    listingIdOrSlug: string,
    images: Array<{ url: string; caption?: string; isCover?: boolean; order?: number }>,
  ) {
    const listing = await this.verifyMerchantOwnership(user, listingIdOrSlug);

    const currentCount = await this.prisma.listingImage.count({
      where: { listingId: listing.id },
    });

    const hasExistingCover = await this.prisma.listingImage.findFirst({
      where: { listingId: listing.id, isCover: true },
    });

    const createdImages = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const isFirst = currentCount === 0 && i === 0;
      const shouldBeCover = img.isCover || (!hasExistingCover && isFirst);

      if (shouldBeCover) {
        await this.prisma.listingImage.updateMany({
          where: { listingId: listing.id },
          data: { isCover: false },
        });
        await this.prisma.listing.update({
          where: { id: listing.id },
          data: { coverUrl: img.url },
        });
      }

      const newImg = await this.prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: img.url,
          caption: img.caption?.trim() || null,
          isCover: !!shouldBeCover,
          order: img.order !== undefined ? img.order : currentCount + i,
        },
      });

      createdImages.push(newImg);
    }

    return createdImages;
  }

  async setMerchantGalleryCover(user: any, imageId: string) {
    const image = await this.prisma.listingImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada na galeria.');
    }

    await this.verifyMerchantOwnership(user, image.listingId);

    // Desmarca capas anteriores
    await this.prisma.listingImage.updateMany({
      where: { listingId: image.listingId },
      data: { isCover: false },
    });

    // Define esta imagem como capa e move para order 0
    const updated = await this.prisma.listingImage.update({
      where: { id: imageId },
      data: {
        isCover: true,
        order: 0,
      },
    });

    // Atualiza a coverUrl do estabelecimento
    await this.prisma.listing.update({
      where: { id: image.listingId },
      data: { coverUrl: image.url },
    });

    return updated;
  }

  async reorderMerchantGalleryImages(user: any, listingIdOrSlug: string, imageIds: string[]) {
    const listing = await this.verifyMerchantOwnership(user, listingIdOrSlug);

    await Promise.all(
      imageIds.map((id, index) =>
        this.prisma.listingImage.updateMany({
          where: { id, listingId: listing.id },
          data: { order: index },
        }),
      ),
    );

    return this.prisma.listingImage.findMany({
      where: { listingId: listing.id },
      orderBy: [{ isCover: 'desc' }, { order: 'asc' }],
    });
  }

  async deleteMerchantGalleryImage(user: any, imageId: string) {
    const image = await this.prisma.listingImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada na galeria.');
    }

    await this.verifyMerchantOwnership(user, image.listingId);

    await this.prisma.listingImage.delete({
      where: { id: imageId },
    });

    // Se a imagem deletada era a capa, promove a próxima imagem como capa se houver
    if (image.isCover) {
      const nextCover = await this.prisma.listingImage.findFirst({
        where: { listingId: image.listingId },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      });

      if (nextCover) {
        await this.prisma.listingImage.update({
          where: { id: nextCover.id },
          data: { isCover: true, order: 0 },
        });
        await this.prisma.listing.update({
          where: { id: image.listingId },
          data: { coverUrl: nextCover.url },
        });
      } else {
        await this.prisma.listing.update({
          where: { id: image.listingId },
          data: { coverUrl: null },
        });
      }
    }

    return { success: true, deletedId: imageId };
  }
}
