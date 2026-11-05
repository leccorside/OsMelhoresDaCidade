import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSupportTicketDto, ReplySupportTicketDto } from './dto/support.dto';
import { Role, NotificationType } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async ensureMerchant(user: any) {
    let merchant = await this.prisma.merchantProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        listings: {
          include: { listing: { select: { cityId: true } } },
          take: 1,
        },
      },
    });

    if (!merchant) {
      merchant = await this.prisma.merchantProfile.create({
        data: {
          userId: user.id,
          companyName: user.name || 'Comerciante Parceiro',
          isApproved: true,
          approvedAt: new Date(),
        },
        include: {
          user: true,
          listings: {
            include: { listing: { select: { cityId: true } } },
            take: 1,
          },
        },
      });
    }

    return merchant;
  }

  async createTicket(user: any, dto: CreateSupportTicketDto) {
    const merchant = await this.ensureMerchant(user);
    const cityId = merchant.listings[0]?.listing?.cityId || null;

    const year = new Date().getFullYear();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketNumber = `TK-${year}-${randomCode}`;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        merchantId: merchant.id,
        cityId,
        subject: dto.subject,
        category: dto.category,
        priority: dto.priority || 'NORMAL',
        status: 'ABERTO',
        assignedRole: 'ADMIN',
        messages: {
          create: {
            senderId: user.id,
            senderName: user.name || merchant.companyName,
            senderRole: 'MERCHANT',
            message: dto.message,
            attachments: [],
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return ticket;
  }

  async getMerchantTickets(user: any) {
    const merchant = await this.ensureMerchant(user);

    return this.prisma.supportTicket.findMany({
      where: { merchantId: merchant.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getTicketDetails(user: any, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        merchant: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado de suporte não encontrado.');
    }

    // Validação de acesso
    const isOwner = ticket.merchant.userId === user.id;
    const isStaff = user.role === Role.ADMIN;

    if (!isOwner && !isStaff) {
      throw new ForbiddenException('Acesso negado a este chamado.');
    }

    return ticket;
  }

  async replyTicket(user: any, ticketId: string, dto: ReplySupportTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { merchant: true },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado de suporte não encontrado.');
    }

    const isMerchant = ticket.merchant.userId === user.id;
    const isStaff = user.role === Role.ADMIN;

    if (!isMerchant && !isStaff) {
      throw new ForbiddenException('Acesso negado para responder a este chamado.');
    }

    const senderRole = isMerchant ? 'MERCHANT' : 'ADMIN';
    const newStatus = isMerchant ? 'EM_ANDAMENTO' : 'RESPONDIDO';

    const [message] = await this.prisma.$transaction([
      this.prisma.supportTicketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: user.id,
          senderName: user.name || (isMerchant ? 'Lojista' : 'Atendimento Oficial'),
          senderRole,
          message: dto.message,
          attachments: [],
        },
      }),
      this.prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      }),
    ]);

    return message;
  }

  async resolveTicket(user: any, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { merchant: true },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado de suporte não encontrado.');
    }

    const isOwner = ticket.merchant.userId === user.id;
    const isStaff = user.role === Role.ADMIN;

    if (!isOwner && !isStaff) {
      throw new ForbiddenException('Acesso negado para finalizar este chamado.');
    }

    return this.prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: 'RESOLVIDO',
        updatedAt: new Date(),
      },
    });
  }

  }
