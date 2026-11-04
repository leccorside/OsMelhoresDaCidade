import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { SubscriptionPlan, PaymentMethod } from '@prisma/client';

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
}

