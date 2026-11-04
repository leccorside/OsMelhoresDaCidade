import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { SubscriptionCronService } from './subscription-cron.service';
import { CreateCheckoutDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Faturamento & Planos')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly subscriptionCronService: SubscriptionCronService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Listar planos de destaque e benefícios disponíveis' })
  getPlans() {
    return this.billingService.getAvailablePlans();
  }

  @Get('merchant/subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar assinaturas e destaques do comerciante logado' })
  getMerchantSubscriptions(@CurrentUser() user: any) {
    return this.billingService.getMerchantSubscriptions(user);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar cobrança e gerar QR Code PIX para assinatura de destaque' })
  createCheckout(@CurrentUser() user: any, @Body() dto: CreateCheckoutDto) {
    return this.billingService.createCheckout(user, dto);
  }

  @Post('confirm/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmar pagamento PIX da assinatura (simulação ou webhook)' })
  confirmPayment(@Param('id') id: string) {
    return this.billingService.confirmPayment(id);
  }

  @Post('admin/process-expirations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disparo manual/rotina da checagem de vigências e vencimentos de assinaturas' })
  processExpirations() {
    return this.subscriptionCronService.runVerification();
  }
}

