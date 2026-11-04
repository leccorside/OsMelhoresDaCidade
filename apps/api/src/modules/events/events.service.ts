import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventStatus } from '@prisma/client';

export interface EventFilterParams {
  citySlug?: string;
  categorySlug?: string;
  search?: string;
  isFree?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

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
}

