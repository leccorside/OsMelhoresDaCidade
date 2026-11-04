import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventStatus } from '@prisma/client';
import { CreateMerchantEventDto, UpdateMerchantEventDto } from './dto/event.dto';

export interface EventFilterParams {
  citySlug?: string;
  categorySlug?: string;
  search?: string;
  isFree?: boolean;
  page?: number;
  limit?: number;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // Listar categorias de eventos disponíveis (com auto-seed seguro se vazio)
  async getCategories() {
    let categories = await this.prisma.eventCategory.findMany({
      orderBy: { name: 'asc' },
    });

    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Música & Shows', slug: 'musica-e-shows', icon: 'Music' },
        { name: 'Gastronomia & Festivais', slug: 'gastronomia-e-festivais', icon: 'Utensils' },
        { name: 'Happy Hour & Vida Noturna', slug: 'happy-hour-e-vida-noturna', icon: 'Wine' },
        { name: 'Stand-up & Comédia', slug: 'stand-up-e-comedia', icon: 'Smile' },
        { name: 'Infantil & Família', slug: 'infantil-e-familia', icon: 'Baby' },
        { name: 'Esportes & Lazer', slug: 'esportes-e-lazer', icon: 'Activity' },
        { name: 'Inauguração & Promoção', slug: 'inauguracao-e-promocao', icon: 'Sparkles' },
      ];

      for (const cat of defaultCategories) {
        await this.prisma.eventCategory.upsert({
          where: { slug: cat.slug },
          update: {},
          create: cat,
        });
      }

      categories = await this.prisma.eventCategory.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return categories;
  }

  async findAll(params: EventFilterParams) {
    const { citySlug, categorySlug, search, isFree, page = 1, limit = 12 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      status: EventStatus.PUBLISHED,
    };

    if (citySlug) {
      where.city = { slug: citySlug };
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (isFree !== undefined) {
      where.isFree = isFree;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { startDate: 'asc' }],
        include: {
          category: true,
          city: { select: { id: true, name: true, slug: true } },
          listing: { select: { id: true, name: true, slug: true } },
          images: { where: { isCover: true }, take: 1 },
        },
      }),
      this.prisma.event.count({ where }),
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
    const event = await this.prisma.event.findFirst({
      where: {
        slug,
        city: { slug: citySlug },
        status: EventStatus.PUBLISHED,
      },
      include: {
        category: true,
        city: true,
        listing: { select: { id: true, name: true, slug: true, street: true, number: true } },
        images: { orderBy: { order: 'asc' } },
      },
    });

    if (!event) {
      throw new NotFoundException(`Evento "${slug}" não encontrado em ${citySlug}.`);
    }

    await this.prisma.event.update({
      where: { id: event.id },
      data: { viewsCount: { increment: 1 } },
    });

    return event;
  }

  // --- ÁREA DO COMERCIANTE ---

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

  async findMerchantEvents(user: any) {
    const merchantProfileId = await this.ensureMerchantProfile(user);

    const where: any = user.role === 'ADMIN'
      ? {}
      : {
          OR: [
            { merchantProfileId },
            {
              listing: {
                owners: {
                  some: { merchantProfileId },
                },
              },
            },
          ],
        };

    return this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        category: true,
        city: { select: { id: true, name: true, slug: true } },
        listing: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
      },
    });
  }

  async verifyEventOwnership(user: any, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        listing: {
          include: {
            owners: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    if (user.role === 'ADMIN') {
      return event;
    }

    const merchantProfileId = user.merchantProfile?.id;
    const isDirectOwner = event.merchantProfileId && event.merchantProfileId === merchantProfileId;
    const isListingOwner = event.listing?.owners.some((o) => o.merchantProfileId === merchantProfileId);

    if (!isDirectOwner && !isListingOwner) {
      throw new ForbiddenException('Você não tem permissão para gerenciar este evento.');
    }

    return event;
  }

  async createMerchantEvent(user: any, dto: CreateMerchantEventDto) {
    const merchantProfileId = await this.ensureMerchantProfile(user);

    let cityId = dto.cityId;
    let address = dto.address;

    // Se vinculou a um estabelecimento, valida e herda cidade/endereço
    if (dto.listingId) {
      const listing = await this.prisma.listing.findUnique({
        where: { id: dto.listingId },
        include: { owners: true },
      });

      if (!listing) {
        throw new NotFoundException('Estabelecimento vinculado não encontrado.');
      }

      if (
        user.role !== 'ADMIN' &&
        !listing.owners.some((o) => o.merchantProfileId === merchantProfileId)
      ) {
        throw new ForbiddenException('Você só pode vincular eventos aos seus próprios estabelecimentos.');
      }

      cityId = cityId || listing.cityId;
      address = address || [listing.street, listing.number, listing.complement].filter(Boolean).join(', ') || undefined;
    }

    // Se ainda não tiver cidade, pega a primeira cidade disponível
    if (!cityId) {
      const defaultCity = await this.prisma.city.findFirst({
        where: { isPublished: true },
        orderBy: { name: 'asc' },
      });
      if (!defaultCity) {
        throw new BadRequestException('Nenhuma cidade disponível cadastrada no sistema.');
      }
      cityId = defaultCity.id;
    }

    // Gerar slug único na cidade
    const baseSlug = slugify(dto.name) || 'evento';
    let slug = baseSlug;
    let count = 1;

    while (await this.prisma.event.findUnique({ where: { cityId_slug: { cityId, slug } } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    const event = await this.prisma.event.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        programDetails: dto.programDetails?.trim() || null,
        categoryId: dto.categoryId,
        cityId,
        listingId: dto.listingId || null,
        merchantProfileId,
        address: address || null,
        startDate,
        endDate,
        startTime: dto.startTime || null,
        endTime: dto.endTime || null,
        isFree: dto.isFree !== undefined ? dto.isFree : !dto.priceInfo,
        priceInfo: dto.priceInfo?.trim() || null,
        ticketUrl: dto.ticketUrl?.trim() || null,
        status: EventStatus.PUBLISHED,
        ...(dto.imageUrl
          ? {
              images: {
                create: {
                  url: dto.imageUrl,
                  isCover: true,
                  order: 0,
                },
              },
            }
          : {}),
      },
      include: {
        category: true,
        city: true,
        listing: true,
        images: true,
      },
    });

    return event;
  }

  async updateMerchantEvent(user: any, eventId: string, dto: UpdateMerchantEventDto) {
    const existing = await this.verifyEventOwnership(user, eventId);

    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.programDetails !== undefined) data.programDetails = dto.programDetails?.trim() || null;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.listingId !== undefined) data.listingId = dto.listingId || null;
    if (dto.address !== undefined) data.address = dto.address || null;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.startTime !== undefined) data.startTime = dto.startTime || null;
    if (dto.endTime !== undefined) data.endTime = dto.endTime || null;
    if (dto.isFree !== undefined) data.isFree = dto.isFree;
    if (dto.priceInfo !== undefined) data.priceInfo = dto.priceInfo?.trim() || null;
    if (dto.ticketUrl !== undefined) data.ticketUrl = dto.ticketUrl?.trim() || null;

    if (dto.imageUrl !== undefined) {
      // Se enviou nova imagem, remove antigas ou atualiza capa
      if (dto.imageUrl) {
        await this.prisma.eventImage.deleteMany({
          where: { eventId },
        });
        await this.prisma.eventImage.create({
          data: {
            eventId,
            url: dto.imageUrl,
            isCover: true,
            order: 0,
          },
        });
      } else {
        await this.prisma.eventImage.deleteMany({
          where: { eventId },
        });
      }
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data,
      include: {
        category: true,
        city: true,
        listing: true,
        images: true,
      },
    });
  }

  async deleteMerchantEvent(user: any, eventId: string) {
    await this.verifyEventOwnership(user, eventId);

    return this.prisma.event.delete({
      where: { id: eventId },
    });
  }
}
