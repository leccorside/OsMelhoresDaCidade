import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleListing(userId: string, listingId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { favorited: false, message: 'Removido dos favoritos.' };
    }

    await this.prisma.favorite.create({
      data: { userId, listingId },
    });
    return { favorited: true, message: 'Salvo nos favoritos.' };
  }

  async toggleEvent(userId: string, eventId: string) {
    const existing = await this.prisma.eventFavorite.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existing) {
      await this.prisma.eventFavorite.delete({
        where: { id: existing.id },
      });
      return { favorited: false, message: 'Evento removido dos favoritos.' };
    }

    await this.prisma.eventFavorite.create({
      data: { userId, eventId },
    });
    return { favorited: true, message: 'Evento salvo na sua agenda.' };
  }

  async findUserFavorites(userId: string) {
    const [listings, events] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              category: true,
              city: true,
              neighborhood: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.eventFavorite.findMany({
        where: { userId },
        include: {
          event: {
            include: {
              category: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      listings: listings.map((f) => f.listing),
      events: events.map((f) => f.event),
    };
  }
}

