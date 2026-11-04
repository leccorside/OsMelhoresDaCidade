import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import {
  CreateCouponDto,
  UpdateCouponDto,
  CouponFilterDto,
  ClaimCouponDto,
  ValidateVoucherDto,
} from './dto/coupon.dto';

@ApiTags('Cupons e Promoções')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // --- PAINEL DO COMERCIANTE ---

  @Get('merchant/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar cupons e métricas dos estabelecimentos do lojista' })
  findMerchantCoupons(
    @CurrentUser() user: any,
    @Query() filters: CouponFilterDto,
  ) {
    return this.couponsService.findMerchantCoupons(user, filters);
  }

  @Post('merchant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova promoção ou cupom de desconto' })
  createMerchantCoupon(
    @CurrentUser() user: any,
    @Body() dto: CreateCouponDto,
  ) {
    return this.couponsService.createMerchantCoupon(user, dto);
  }

  @Put('merchant/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados de um cupom' })
  updateMerchantCoupon(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.updateMerchantCoupon(user, id, dto);
  }

  @Patch('merchant/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alternar status do cupom entre ativo e pausado' })
  toggleCouponStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.couponsService.toggleCouponStatus(user, id);
  }

  @Delete('merchant/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover cupom promocional' })
  deleteMerchantCoupon(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.couponsService.deleteMerchantCoupon(user, id);
  }

  @Post('merchant/validate-voucher')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar status do voucher do cliente pelo código' })
  validateVoucher(
    @CurrentUser() user: any,
    @Body() dto: ValidateVoucherDto,
  ) {
    return this.couponsService.validateVoucher(user, dto.claimCode);
  }

  @Post('merchant/redeem-voucher')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dar baixa definitiva no voucher do cliente' })
  redeemVoucher(
    @CurrentUser() user: any,
    @Body() dto: ValidateVoucherDto,
  ) {
    return this.couponsService.redeemVoucher(user, dto.claimCode);
  }

  // --- ROTAS PÚBLICAS E RESGATE ---

  @Get('public/listing/:listingId')
  @ApiOperation({ summary: 'Listar cupons públicos ativos de um estabelecimento' })
  getPublicCoupons(@Param('listingId') listingId: string) {
    return this.couponsService.getPublicCouponsByListing(listingId);
  }

  @Post('public/:id/claim')
  @ApiOperation({ summary: 'Resgatar um voucher/cupom promocional' })
  claimCoupon(
    @Param('id') id: string,
    @Body() dto: ClaimCouponDto,
  ) {
    return this.couponsService.claimPublicCoupon(id, dto);
  }
}

