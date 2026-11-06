import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WhatsAppBotService } from './whatsapp-bot.service';
import { AuditService } from '../audit/audit.service';

export interface ZApiWebhookMessage {
  phone?: string;
  senderPhone?: string;
  from?: string;
  senderName?: string;
  isGroup?: boolean;
  fromMe?: boolean;
  text?: {
    message?: string;
  };
  message?: string;
  body?: string;
  type?: string;
  [key: string]: any;
}

@ApiTags('Notificações / Webhooks')
@Controller('notifications/whatsapp-webhook')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappBotService: WhatsAppBotService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook de recebimento de mensagens e respostas via WhatsApp (Z-API)',
    description:
      'Recebe eventos da Z-API e abre automaticamente chamados de suporte quando o lojista enviar Dúvida ou Ajuda.',
  })
  async handleIncomingMessage(
    @Body() payload: ZApiWebhookMessage,
    @Headers('client-token') clientToken?: string,
  ) {
    // 1. Ignorar mensagens enviadas pelo próprio bot ou de grupos do WhatsApp
    if (payload.fromMe || payload.isGroup) {
      return { success: true, ignored: true, reason: 'from_me_or_group' };
    }

    // 2. Extrair texto da mensagem recebida
    const incomingText =
      payload.text?.message ||
      payload.message ||
      payload.body ||
      (typeof payload.text === 'string' ? payload.text : '');

    // 3. Extrair telefone do remetente
    const rawPhone = payload.phone || payload.senderPhone || payload.from || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');

    if (!cleanPhone || !incomingText.trim()) {
      return { success: true, ignored: true, reason: 'missing_phone_or_text' };
    }

    this.logger.log(`Mensagem recebida no WhatsApp de +${cleanPhone}: "${incomingText}"`);

    // 4. Normalizar texto para detecção de intenção de suporte
    const normalized = incomingText
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    const isHelpIntent =
      normalized.includes('duvida') ||
      normalized.includes('ajuda') ||
      normalized.includes('suporte') ||
      normalized.includes('atendimento') ||
      normalized.includes('socorro') ||
      normalized.includes('atendente') ||
      normalized.includes('nao consigo') ||
      normalized.includes('problema') ||
      normalized.includes('reclama');

    // 5. Localizar comerciante parceiro pelo telefone
    const phoneSuffix = cleanPhone.slice(-8); // últimos 8 dígitos para matching flexível
    let merchant: any = await this.prisma.merchantProfile.findFirst({
      where: {
        OR: [
          { phone: { contains: phoneSuffix } },
          { whatsapp: { contains: phoneSuffix } },
          { user: { phone: { contains: phoneSuffix } } },
        ],
      },
      include: {
        user: true,
        listings: {
          include: { listing: { select: { id: true, name: true, cityId: true } } },
          take: 1,
        },
      },
    });

    // Se o comerciante não estiver previamente cadastrado pelo número, busca qualquer comerciante ativo no sistema
    if (!merchant) {
      merchant = await this.prisma.merchantProfile.findFirst({
        include: {
          user: true,
          listings: {
            include: { listing: { select: { id: true, name: true, cityId: true } } },
            take: 1,
          },
        },
      });
    }

    // Se a mensagem for intenção de Dúvida ou Ajuda: abrir chamado de suporte automático
    if (isHelpIntent && merchant) {
      const year = new Date().getFullYear();
      const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      const ticketNumber = `TK-WPP-${year}-${randomCode}`;

      const merchantName =
        merchant.companyName ||
        merchant.user?.name ||
        payload.senderName ||
        `Lojista (+${cleanPhone})`;

      const listingName = merchant.listings?.[0]?.listing?.name || 'Comércio Parceiro';
      const cityId = merchant.listings?.[0]?.listing?.cityId || null;

      const ticket = await this.prisma.supportTicket.create({
        data: {
          ticketNumber,
          merchantId: merchant.id,
          cityId,
          subject: `[WhatsApp Bot] Dúvida de ${merchantName}: "${incomingText.substring(0, 50)}${incomingText.length > 50 ? '...' : ''}"`,
          category: 'DUVIDAS',
          priority: 'ALTA',
          status: 'ABERTO',
          assignedRole: 'ADMIN',
          messages: {
            create: {
              senderId: merchant.userId || merchant.id,
              senderName: `${merchantName} (via WhatsApp)`,
              senderRole: 'MERCHANT',
              message: incomingText.trim(),
            },
          },
        },
      });

      // Registrar auditoria
      await this.auditService.log({
        userId: merchant.userId,
        userName: merchantName,
        userEmail: merchant.user?.email,
        userRole: 'MERCHANT',
        action: 'WHATSAPP_SUPPORT_TICKET_CREATED',
        entity: 'SUPPORT_TICKET',
        entityId: ticket.id,
        details: {
          phone: cleanPhone,
          ticketNumber,
          initialMessage: incomingText,
          listingName,
        },
      });

      // Disparar resposta automática amigável para o lojista
      const replyMessage =
        `👋 Olá, *${merchantName}*!\n\n` +
        `Recebemos sua mensagem em nosso WhatsApp oficial:\n` +
        `💬 _"${incomingText}"_\n\n` +
        `✅ Abrimos automaticamente o chamado de suporte *#${ticketNumber}* com prioridade em nosso painel administrativo.\n\n` +
        `Nossa equipe oficial do portal *Os Melhores da Cidade* analisará seu pedido e responderá você por aqui o mais rápido possível! 🚀⭐`;

      await this.whatsappBotService.sendTextMessage(cleanPhone, replyMessage);

      return {
        success: true,
        action: 'TICKET_CREATED',
        ticketNumber,
        ticketId: ticket.id,
      };
    }

    // Se for mensagem de saudação genérica, orientar como pedir suporte
    const isGreeting =
      normalized === 'oi' ||
      normalized === 'ola' ||
      normalized === 'bom dia' ||
      normalized === 'boa tarde' ||
      normalized === 'boa noite' ||
      normalized === 'menu';

    if (isGreeting) {
      const greetingReply =
        `👋 Olá! Seja bem-vindo ao canal oficial de atendimento do portal *Os Melhores da Cidade* 🌆\n\n` +
        `Se você precisa de auxílio com sua assinatura, faturas, boleto bancário ou configuração do seu anúncio, basta responder esta mensagem contendo a palavra *DÚVIDA* ou *AJUDA*.\n\n` +
        `Nosso sistema abrirá imediatamente um chamado com nossa equipe de suporte humanizado! ✨`;

      await this.whatsappBotService.sendTextMessage(cleanPhone, greetingReply);

      return { success: true, action: 'GREETING_INFO_SENT' };
    }

    return { success: true, action: 'IGNORED_NO_KEYWORD' };
  }
}
