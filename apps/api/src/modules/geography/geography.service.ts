import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class GeographyService {
  constructor(private readonly prisma: PrismaService) {}

  async getStates() {
    return this.prisma.state.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            cities: {
              where: { isPublished: true },
            },
          },
        },
      },
    });
  }

  async getCities(params?: { stateUf?: string; search?: string; publishedOnly?: boolean }) {
    const { stateUf, search, publishedOnly = true } = params || {};

    return this.prisma.city.findMany({
      where: {
        ...(publishedOnly ? { isPublished: true } : {}),
        ...(stateUf
          ? {
              state: {
                uf: { equals: stateUf, mode: 'insensitive' },
              },
            }
          : {}),
        ...(search
          ? {
              name: { contains: search, mode: 'insensitive' },
            }
          : {}),
      },
      include: {
        state: true,
        _count: {
          select: {
            listings: { where: { status: 'PUBLISHED' } },
            events: { where: { status: 'PUBLISHED' } },
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    });
  }

  async getCityBySlug(slug: string) {
    const city = await this.prisma.city.findUnique({
      where: { slug },
      include: {
        state: true,
        neighborhoods: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            listings: { where: { status: 'PUBLISHED' } },
            events: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });

    if (!city) {
      throw new NotFoundException(`Cidade com slug "${slug}" não encontrada.`);
    }

    return city;
  }

  async getNeighborhoods(citySlug: string) {
    const city = await this.prisma.city.findUnique({
      where: { slug: citySlug },
      select: { id: true },
    });

    if (!city) {
      throw new NotFoundException(`Cidade com slug "${citySlug}" não encontrada.`);
    }

    return this.prisma.neighborhood.findMany({
      where: { cityId: city.id },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            listings: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });
  }
}

