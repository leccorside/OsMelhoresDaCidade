import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsBoolean, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionPlan, PaymentMethod, DiscountType } from '@prisma/client';

export class CreditCardDto {
  @IsString({ message: 'Nome impresso no cartão é obrigatório' })
  @IsNotEmpty()
  holderName: string;

  @IsString({ message: 'Número do cartão é obrigatório' })
  @IsNotEmpty()
  number: string;

  @IsString({ message: 'Mês de vencimento é obrigatório' })
  @IsNotEmpty()
  expiryMonth: string;

  @IsString({ message: 'Ano de vencimento é obrigatório' })
  @IsNotEmpty()
  expiryYear: string;

  @IsString({ message: 'Código de segurança (CVV) é obrigatório' })
  @IsNotEmpty()
  ccv: string;
}

export class CreditCardHolderInfoDto {
  @IsString({ message: 'Nome do titular é obrigatório' })
  @IsNotEmpty()
  name: string;

  @IsString({ message: 'E-mail do titular é obrigatório' })
  @IsNotEmpty()
  email: string;

  @IsString({ message: 'CPF ou CNPJ do titular é obrigatório' })
  @IsNotEmpty()
  cpfCnpj: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  addressNumber?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => CreditCardDto)
  creditCard?: CreditCardDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreditCardHolderInfoDto)
  creditCardHolderInfo?: CreditCardHolderInfoDto;
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




