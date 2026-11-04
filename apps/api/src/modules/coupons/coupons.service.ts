import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  CouponFilterDto,
  ClaimCouponDto,
} from './dto/coupon.dto';
import { CouponStatus, DiscountType, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async ensureMerchantProfile(user: any) {
    let merchant = await this.prisma.merchantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!merchant) {
      merchant = await this.prisma.merchantProfile.create({
        data: {
          userId: user.id,
          companyName: user.name || 'Comerciante Parceiro',
          isApproved: true,
          approvedAt: new Date(),
        },
      });
    }

    return merchant;
  }

  private async verifyListingOwnership(user: any, listingId: string) {
    if (user.role === 'ADMIN') return true;

    const merchant = await this.ensureMerchantProfile(user);
    const ownership = await this.prisma.listingOwner.findFirst({
      where: {
        listingId,
        merchantProfileId: merchant.id,
      },
    });

    if (!ownership) {
      throw new ForbiddenException('Você não tem permissão para gerenciar cupons deste estabelecimento.');
    }

    return true;
  }

  async findMerchantCoupons(user: any, filters?: CouponFilterDto) {
    const merchant = await this.ensureMerchantProfile(user);

    // Identificar estabelecimentos do comerciante
    let listingIds: string[] = [];
    if (user.role === 'ADMIN') {
      const allListings = await this.prisma.listing.findMany({ select: { id: true } });
      listingIds = allListings.map((l) => l.id);
    } else {
      const owned = await this.prisma.listingOwner.findMany({
        where: { merchantProfileId: merchant.id },
        select: { listingId: true },
      });
      listingIds = owned.map((o) => o.listingId);
    }

    if (listingIds.length === 0) {
      return {
        metrics: {
          totalCoupons: 0,
          activeCoupons: 0,
          totalClaims: 0,
          estimatedSavings: 0,
        },
        coupons: [],
      };
    }

    const where: any = {
      listingId: { in: listingIds },
    };

    if (filters?.listingId) {
      where.listingId = filters.listingId;
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status as CouponStatus;
    }

    if (filters?.search) {
      const s = filters.search.trim();
      where.OR = [
        { code: { contains: s, mode: 'insensitive' } },
        { title: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [allCoupons, filteredCoupons] = await Promise.all([
      this.prisma.coupon.findMany({
        where: { listingId: { in: listingIds } },
        include: {
          claims: { select: { id: true } },
        },
      }),
      this.prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            select: { id: true, name: true, slug: true, coverUrl: true },
          },
          claims: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              claimCode: true,
              customerName: true,
              customerPhone: true,
              createdAt: true,
              usedAt: true,
            },
          },
        },
      }),
    ]);

    // Calcular métricas
    const totalCoupons = allCoupons.length;
    const activeCoupons = allCoupons.filter((c) => c.status === CouponStatus.ACTIVE).length;
    const totalClaims = allCoupons.reduce((acc, c) => acc + (c.usedCount || c.claims.length), 0);
    const estimatedSavings = allCoupons.reduce((acc, c) => {
      if (c.discountType === DiscountType.FIXED_AMOUNT && c.discountValue) {
        return acc + Number(c.discountValue) * (c.usedCount || 0);
      }
      return acc;
    }, 0);

    return {
      metrics: {
        totalCoupons,
        activeCoupons,
        totalClaims,
        estimatedSavings,
      },
      coupons: filteredCoupons,
    };
  }

  async createMerchantCoupon(user: any, dto: CreateCouponDto) {
    await this.verifyListingOwnership(user, dto.listingId);
    const merchant = await this.ensureMerchantProfile(user);

    const cleanCode = dto.code.trim().toUpperCase();

    // Checar código duplicado no mesmo estabelecimento
    const existing = await this.prisma.coupon.findUnique({
      where: {
        listingId_code: {
          listingId: dto.listingId,
          code: cleanCode,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`Já existe um cupom com o código "${cleanCode}" para este estabelecimento.`);
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        listingId: dto.listingId,
        merchantProfileId: merchant.id,
        code: cleanCode,
        title: dto.title,
        description: dto.description,
        discountType: dto.discountType || DiscountType.PERCENTAGE,
        discountValue: dto.discountValue ? Number(dto.discountValue) : null,
        discountUnit: dto.discountUnit || (dto.discountType === DiscountType.PERCENTAGE ? '%' : 'R$'),
        minSpend: dto.minSpend ? Number(dto.minSpend) : null,
        maxUses: dto.maxUses ? Number(dto.maxUses) : null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        rules: dto.rules,
        status: CouponStatus.ACTIVE,
      },
      include: {
        listing: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return coupon;
  }

  async updateMerchantCoupon(user: any, id: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Cupom promocional não encontrado.');
    }

    await this.verifyListingOwnership(user, coupon.listingId);

    const updated = await this.prisma.coupon.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title : undefined,
        description: dto.description !== undefined ? dto.description : undefined,
        discountType: dto.discountType !== undefined ? dto.discountType : undefined,
        discountValue: dto.discountValue !== undefined ? Number(dto.discountValue) : undefined,
        discountUnit: dto.discountUnit !== undefined ? dto.discountUnit : undefined,
        minSpend: dto.minSpend !== undefined ? Number(dto.minSpend) : undefined,
        maxUses: dto.maxUses !== undefined ? Number(dto.maxUses) : undefined,
        startDate: dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined,
        endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
        rules: dto.rules !== undefined ? dto.rules : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
      },
      include: {
        listing: { select: { id: true, name: true, slug: true } },
      },
    });

    return updated;
  }

  async toggleCouponStatus(user: any, id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado.');
    }

    await this.verifyListingOwnership(user, coupon.listingId);

    const nextStatus = coupon.status === CouponStatus.ACTIVE ? CouponStatus.PAUSED : CouponStatus.ACTIVE;

    return this.prisma.coupon.update({
      where: { id },
      data: { status: nextStatus },
    });
  }

  async deleteMerchantCoupon(user: any, id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado.');
    }

    await this.verifyListingOwnership(user, coupon.listingId);

    await this.prisma.coupon.delete({
      where: { id },
    });

    return { success: true, message: 'Cupom removido com sucesso.' };
  }

  // --- MÉTODOS PÚBLICOS E DE RESGATE (CLIENTES) ---

  async getPublicCouponsByListing(listingId: string) {
    const now = new Date();
    return this.prisma.coupon.findMany({
      where: {
        listingId,
        status: CouponStatus.ACTIVE,
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        discountType: true,
        discountValue: true,
        discountUnit: true,
        minSpend: true,
        maxUses: true,
        usedCount: true,
        endDate: true,
        rules: true,
      },
    });
  }

  async claimPublicCoupon(couponId: string, dto: ClaimCouponDto, user?: any) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        listing: { select: { id: true, name: true } },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Cupom ou promoção não encontrada.');
    }

    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new BadRequestException('Esta promoção não está mais ativa.');
    }

    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      throw new BadRequestException('Este cupom já expirou.');
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Todos os cupons disponíveis já foram resgatados.');
    }

    // Gerar código único e amigável de resgate
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const claimCode = `VOUCH-${coupon.code.substring(0, 4)}-${randomSuffix}`;

    const [claim] = await this.prisma.$transaction([
      this.prisma.couponClaim.create({
        data: {
          couponId: coupon.id,
          userId: user?.id || null,
          customerName: dto.customerName || user?.name || 'Cliente Guia',
          customerPhone: dto.customerPhone || null,
          customerEmail: dto.customerEmail || user?.email || null,
          claimCode,
        },
      }),
      this.prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          usedCount: { increment: 1 },
        },
      }),
    ]);

    // Notificar os donos do estabelecimento em tempo real
    try {
      await this.notificationsService.notifyListingOwners(coupon.listingId, {
        type: NotificationType.COUPON_CLAIMED,
        title: 'Novo Voucher Resgatado!',
        message: `${dto.customerName || 'Um visitante'} resgatou o cupom "${coupon.code}" (${coupon.title}).`,
        linkUrl: '/comerciante/cupons',
        metadata: { couponId: coupon.id, claimCode: claim.claimCode },
      });
    } catch (e) {
      // Ignorar falhas secundárias
    }

    return {
      success: true,
      claimCode: claim.claimCode,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title,
        listingName: coupon.listing.name,
        rules: coupon.rules,
        endDate: coupon.endDate,
      },
      claimedAt: claim.createdAt,
    };
  }

  // --- VALIDAÇÃO E BAIXA DE VOUCHERS NO BALCÃO ---

  async validateVoucher(user: any, claimCode: string) {
    const cleanCode = claimCode.trim().toUpperCase();

    const claim = await this.prisma.couponClaim.findUnique({
      where: { claimCode: cleanCode },
      include: {
        coupon: {
          include: {
            listing: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!claim) {
      throw new NotFoundException(`Nenhum voucher encontrado com o código "${cleanCode}". Verifique os dígitos.`);
    }

    // Verificar se o comerciante é dono do estabelecimento associado
    await this.verifyListingOwnership(user, claim.coupon.listingId);

    const isExpired = claim.coupon.endDate && new Date(claim.coupon.endDate) < new Date();
    const isAlreadyUsed = !!claim.usedAt;

    let status = 'VALID';
    let statusMessage = 'Voucher válido e pronto para uso!';

    if (isAlreadyUsed) {
      status = 'ALREADY_USED';
      statusMessage = `Este voucher já foi utilizado em ${new Date(claim.usedAt!).toLocaleString('pt-BR')}.`;
    } else if (isExpired) {
      status = 'EXPIRED';
      statusMessage = 'A data de validade desta promoção expirou.';
    } else if (claim.coupon.status !== CouponStatus.ACTIVE) {
      status = 'INACTIVE';
      statusMessage = 'A promoção associada a este voucher está pausada ou inativa.';
    }

    return {
      isValid: status === 'VALID',
      status,
      statusMessage,
      claim: {
        id: claim.id,
        claimCode: claim.claimCode,
        customerName: claim.customerName,
        customerPhone: claim.customerPhone,
        customerEmail: claim.customerEmail,
        createdAt: claim.createdAt,
        usedAt: claim.usedAt,
      },
      coupon: {
        id: claim.coupon.id,
        code: claim.coupon.code,
        title: claim.coupon.title,
        description: claim.coupon.description,
        discountType: claim.coupon.discountType,
        discountValue: claim.coupon.discountValue,
        discountUnit: claim.coupon.discountUnit,
        minSpend: claim.coupon.minSpend,
        rules: claim.coupon.rules,
        endDate: claim.coupon.endDate,
        listing: claim.coupon.listing,
      },
    };
  }

  async redeemVoucher(user: any, claimCode: string) {
    const validation = await this.validateVoucher(user, claimCode);

    if (!validation.isValid) {
      throw new BadRequestException(validation.statusMessage);
    }

    const updatedClaim = await this.prisma.couponClaim.update({
      where: { id: validation.claim.id },
      data: { usedAt: new Date() },
    });

    // Notificar
    try {
      await this.notificationsService.createNotification({
        userId: user.id,
        type: NotificationType.COUPON_CLAIMED,
        title: 'Voucher Utilizado no Balcão!',
        message: `O voucher ${validation.claim.claimCode} (${validation.coupon.title}) foi baixado com sucesso em "${validation.coupon.listing.name}".`,
        linkUrl: '/comerciante/cupons',
        metadata: { claimCode: validation.claim.claimCode, usedAt: updatedClaim.usedAt },
      });
    } catch (e) {}

    return {
      success: true,
      message: 'Voucher validado e baixado com sucesso!',
      claimCode: updatedClaim.claimCode,
      usedAt: updatedClaim.usedAt,
      coupon: validation.coupon,
      customerName: validation.claim.customerName,
    };
  }
}
