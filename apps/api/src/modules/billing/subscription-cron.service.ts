import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../../common/mail/mail.service';
import { PaymentStatus, NotificationType } from '@prisma/client';

@Injectable()
export class SubscriptionCronService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(SubscriptionCronService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  onApplicationBootstrap() {
    this.logger.log('Iniciando rotina agendada de monitoramento de assinaturas...');
    // Executa a primeira checagem após 5 segundos da inicialização do servidor
    setTimeout(() => {
      this.runVerification().catch((err) =>
        this.logger.error(`Erro na checagem inicial de assinaturas: ${err.message}`),
      );
    }, 5000);

    // Agenda checagem a cada 12 horas
    this.timer = setInterval(
      () => {
        this.runVerification().catch((err) =>
          this.logger.error(`Erro na checagem periódica de assinaturas: ${err.message}`),
        );
      },
      12 * 60 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runVerification(): Promise<{
    expiredCount: number;
    expiringSoonCount: number;
    processedAt: Date;
  }> {
    const now = new Date();
    this.logger.log(`[SubscriptionCron] Executando verificação de vigência: ${now.toISOString()}`);

    let expiredCount = 0;
    let expiringSoonCount = 0;

    // 1. PROCESSAR ASSINATURAS EXPIRADAS
    const expiredSubs = await this.prisma.merchantSubscription.findMany({
      where: {
        status: PaymentStatus.PAID,
        endDate: { lt: now },
      },
      include: {
        listing: { select: { id: true, name: true } },
        merchantProfile: {
          select: {
            id: true,
            companyName: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    for (const sub of expiredSubs) {
      try {
        // Atualizar status para EXPIRED
        await this.prisma.merchantSubscription.update({
          where: { id: sub.id },
          data: { status: PaymentStatus.EXPIRED },
        });

        // Verificar se há outra assinatura ativa para este estabelecimento
        if (sub.listingId) {
          const otherActive = await this.prisma.merchantSubscription.findFirst({
            where: {
              listingId: sub.listingId,
              status: PaymentStatus.PAID,
              endDate: { gte: now },
            },
          });

          if (!otherActive) {
            await this.prisma.listing.update({
              where: { id: sub.listingId },
              data: { isFeatured: false },
            });
            this.logger.log(`Destaque do anúncio "${sub.listing?.name}" revertido para padrão (expirado).`);
          }
        }

        // Enviar notificação no sistema
        const userId = sub.merchantProfile?.user?.id;
        const merchantEmail = sub.merchantProfile?.user?.email;
        const merchantName = sub.merchantProfile?.user?.name || sub.merchantProfile?.companyName || 'Comerciante';

        if (userId) {
          await this.notificationsService.createNotification({
            userId,
            type: NotificationType.SYSTEM_ALERT,
            title: '⚠️ Seu Plano de Destaque Expirou',
            message: `A vigência do seu plano ${sub.plan.replace('_', ' ')} para "${sub.listing?.name}" encerrou. Renove agora para manter o selo e o topo do guia!`,
            linkUrl: '/comerciante/planos',
            metadata: { subscriptionId: sub.id, plan: sub.plan },
          });
        }

        // Enviar e-mail de aviso
        if (merchantEmail) {
          await this.mailService.sendSubscriptionExpiredEmail({
            merchantName,
            merchantEmail,
            listingName: sub.listing?.name || 'Seu Estabelecimento',
            planName: sub.plan.replace('_', ' '),
            renewUrl: 'http://localhost:4101/comerciante/planos',
          });
        }

        expiredCount++;
      } catch (err: any) {
        this.logger.error(`Erro ao processar expiração da sub ${sub.id}: ${err.message}`);
      }
    }

    // 2. PROCESSAR AVISO PREVENTIVO (3 DIAS OU MENOS)
    const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringSoonSubs = await this.prisma.merchantSubscription.findMany({
      where: {
        status: PaymentStatus.PAID,
        endDate: {
          gte: now,
          lte: threeDaysAhead,
        },
      },
      include: {
        listing: { select: { id: true, name: true } },
        merchantProfile: {
          select: {
            id: true,
            companyName: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    for (const sub of expiringSoonSubs) {
      try {
        const userId = sub.merchantProfile?.user?.id;
        const merchantEmail = sub.merchantProfile?.user?.email;
        const merchantName = sub.merchantProfile?.user?.name || sub.merchantProfile?.companyName || 'Comerciante';

        const diffTime = (sub.endDate ? new Date(sub.endDate).getTime() : now.getTime()) - now.getTime();
        const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        if (userId) {
          await this.notificationsService.createNotification({
            userId,
            type: NotificationType.SYSTEM_ALERT,
            title: `⏰ Seu Destaque Expira em ${daysLeft} dia(s)`,
            message: `O plano ${sub.plan.replace('_', ' ')} para "${sub.listing?.name}" expira em ${daysLeft} dia(s). Renove antecipadamente para não perder visibilidade!`,
            linkUrl: '/comerciante/planos',
            metadata: { subscriptionId: sub.id, daysLeft },
          });
        }

        if (merchantEmail) {
          await this.mailService.sendSubscriptionExpiringEmail({
            merchantName,
            merchantEmail,
            listingName: sub.listing?.name || 'Seu Estabelecimento',
            planName: sub.plan.replace('_', ' '),
            daysLeft,
            renewUrl: 'http://localhost:4101/comerciante/planos',
          });
        }

        expiringSoonCount++;
      } catch (err: any) {
        this.logger.error(`Erro ao avisar sobre vencimento da sub ${sub.id}: ${err.message}`);
      }
    }

    this.logger.log(
      `[SubscriptionCron] Concluído: ${expiredCount} expiradas processadas, ${expiringSoonCount} avisos preventivos disparados.`,
    );

    return {
      expiredCount,
      expiringSoonCount,
      processedAt: new Date(),
    };
  }
}
