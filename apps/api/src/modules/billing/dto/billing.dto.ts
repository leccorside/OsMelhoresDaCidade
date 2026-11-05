import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { SubscriptionPlan, PaymentMethod, DiscountType } from '@prisma/client';

export class CreateCheckoutDto {
  @IsString({ message: 'ID do estabelecimento é obrigatório' })
  @IsNotEmpty({ message: 'ID do estabelecimento não pode ser vazio' })
  listingId: string;

  @IsEnum(SubscriptionPlan, { message: 'Plano inválido' })
  plan: SubscriptionPlan;

  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'Método de pagamento inválido' })
  paymentMethod?: PaymentMethod = PaymentMethod.PIX;

  @IsOptional()
  @IsString()
  billingCycle?: string = 'MONTHLY';

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class ValidateCouponDto {
  @IsString({ message: 'Código do cupom é obrigatório' })
  @IsNotEmpty({ message: 'Código do cupom não pode ser vazio' })
  code: string;

  @IsEnum(SubscriptionPlan, { message: 'Plano inválido' })
  plan: SubscriptionPlan;

  @IsOptional()
  @IsString()
  billingCycle?: string = 'MONTHLY';
}

export class CreateSubscriptionCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType = DiscountType.PERCENTAGE;

  @IsNumber()
  @Min(0.01)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @IsOptional()
  @IsString()
  validUntil?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class CalculatePlanChangeDto {
  @IsString({ message: 'ID da assinatura atual é obrigatório' })
  @IsNotEmpty()
  subscriptionId: string;

  @IsEnum(SubscriptionPlan, { message: 'Novo plano inválido' })
  newPlan: SubscriptionPlan;

  @IsOptional()
  @IsString()
  newBillingCycle?: string = 'MONTHLY';
}

export class ChangePlanCheckoutDto {
  @IsString({ message: 'ID da assinatura atual é obrigatório' })
  @IsNotEmpty()
  subscriptionId: string;

  @IsEnum(SubscriptionPlan, { message: 'Novo plano inválido' })
  newPlan: SubscriptionPlan;

  @IsOptional()
  @IsString()
  newBillingCycle?: string = 'MONTHLY';

  @IsOptional()
  @IsString()
  couponCode?: string;
}



