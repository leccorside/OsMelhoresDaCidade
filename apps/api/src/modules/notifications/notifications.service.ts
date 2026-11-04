import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(params: CreateNotificationParams) {
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        linkUrl: params.linkUrl,
        metadata: params.metadata || {},
      },
    });
  }

  async notifyListingOwners(
    listingId: string,
    params: {
      type: NotificationType;
      title: string;
      message: string;
      linkUrl?: string;
      metadata?: any;
    },
  ) {
    // Buscar donos do estabelecimento
    const owners = await this.prisma.listingOwner.findMany({
      where: { listingId },
      include: {
        merchantProfile: {
          select: { userId: true },
        },
      },
    });

    const notifications = await Promise.all(
      owners.map((o) =>
        this.createNotification({
          userId: o.merchantProfile.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          linkUrl: params.linkUrl,
          metadata: params.metadata,
        }),
      ),
    );

    return notifications;
  }

  async getUserNotifications(userId: string, limit = 20) {
    const [unreadCount, notifications] = await Promise.all([
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    return {
      unreadCount,
      notifications,
    };
  }

  async markAsRead(userId: string, id: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notif) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, message: 'Todas as notificações foram marcadas como lidas.' };
  }

  async deleteNotification(userId: string, id: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notif) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { success: true, message: 'Notificação excluída com sucesso.' };
  }
}
