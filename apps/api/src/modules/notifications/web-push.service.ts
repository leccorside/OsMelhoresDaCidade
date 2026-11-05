import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as webpush from 'web-push';

export interface PushSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);
  private vapidPublicKey: string;
  private vapidPrivateKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Chaves padrão para ambiente de desenvolvimento local (par VAPID válido e consistente)
    const defaultPublic =
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    const defaultPrivate = 'UU2x736kM3q0W55yvW6C8_2q7Y-kF4gK8W8X2_0_p_E';

    this.vapidPublicKey =
      this.configService.get<string>('VAPID_PUBLIC_KEY') ||
      process.env.VAPID_PUBLIC_KEY ||
      defaultPublic;

    this.vapidPrivateKey =
      this.configService.get<string>('VAPID_PRIVATE_KEY') ||
      process.env.VAPID_PRIVATE_KEY ||
      defaultPrivate;

    const contactEmail = 'mailto:contato@osmelhoresdacidade.com.br';

    try {
      webpush.setVapidDetails(contactEmail, this.vapidPublicKey, this.vapidPrivateKey);
      this.logger.log('WebPush inicializado com chaves VAPID configuradas.');
    } catch (err: any) {
      this.logger.error(`Erro ao inicializar VAPID: ${err.message}`);
    }
  }

  getPublicKey(): { publicKey: string } {
    return { publicKey: this.vapidPublicKey };
  }

  async saveSubscription(userId: string, dto: PushSubscriptionDto) {
    return this.prisma.webPushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent || null,
      },
      update: {
        userId,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent || null,
        updatedAt: new Date(),
      },
    });
  }

  async removeSubscription(userId: string, endpoint: string) {
    await this.prisma.webPushSubscription.deleteMany({
      where: { endpoint, userId },
    });
    return { success: true };
  }

  async sendNotificationToUser(userId: string, payload: PushPayload) {
    const subscriptions = await this.prisma.webPushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) return { sent: 0, failed: 0 };

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/comerciante',
      icon: payload.icon || '/logo-02.png',
      badge: payload.badge || '/logo-02.png',
      tag: payload.tag || 'general-alert',
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSub as any, notificationPayload);
        sent++;
      } catch (err: any) {
        failed++;
        this.logger.warn(`Falha no envio do push para ${sub.id}: ${err.statusCode || err.message}`);
        // Se a inscrição expirou no Google/Mozilla (404/410), remove do banco
        if (err.statusCode === 404 || err.statusCode === 410) {
          await this.prisma.webPushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    }

    return { sent, failed };
  }

  async sendTestNotification(userId: string) {
    const res = await this.sendNotificationToUser(userId, {
      title: '🎉 Notificações Web Push Ativas!',
      body: 'Seu navegador e celular agora receberão alertas instantâneos de novos leads e avaliações do portal Os Melhores da Cidade.',
      url: '/comerciante',
    });

    return {
      success: true,
      message:
        res.sent > 0
          ? 'Notificação de teste enviada com sucesso!'
          : 'Nenhum dispositivo ativo encontrado. Ative as notificações no botão acima primeiro.',
      details: res,
    };
  }
}
