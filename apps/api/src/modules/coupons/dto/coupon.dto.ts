import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DiscountType, CouponStatus } from '@prisma/client';

export class CreateCouponDto {
  @IsString({ message: 'ID do estabelecimento é obrigatório' })
  @IsNotEmpty({ message: 'ID do estabelecimento não pode ser vazio' })
  listingId: string;

  @IsString({ message: 'Código do cupom é obrigatório' })
  @IsNotEmpty({ message: 'Código do cupom não pode ser vazio' })
  @MaxLength(30, { message: 'Código deve ter no máximo 30 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @Matches(/^[A-Z0-9_\-]+$/, {
    message: 'Código deve conter apenas letras maiúsculas, números, hífens ou underlines',
  })
  code: string;

  @IsString({ message: 'Título da promoção é obrigatório' })
  @IsNotEmpty({ message: 'Título da promoção não pode ser vazio' })
  @MaxLength(120, { message: 'Título deve ter no máximo 120 caracteres' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DiscountType, { message: 'Tipo de desconto inválido' })
  discountType?: DiscountType = DiscountType.PERCENTAGE;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Valor do desconto deve ser um número válido' })
  @Min(0, { message: 'Valor do desconto deve ser positivo' })
  discountValue?: number;

  @IsOptional()
  @IsString()
  discountUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Consumo mínimo deve ser numérico' })
  @Min(0, { message: 'Consumo mínimo deve ser positivo' })
  minSpend?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limite de uso deve ser numérico' })
  @Min(1, { message: 'Limite de uso deve ser de pelo menos 1' })
  maxUses?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Data de início inválida' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de expiração inválida' })
  endDate?: string;

  @IsOptional()
  @IsString()
  rules?: string;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsString()
  discountUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSpend?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;
}

export class CouponFilterDto {
  @IsOptional()
  @IsString()
  listingId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class ClaimCouponDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;
}

export class ValidateVoucherDto {
  @IsString({ message: 'Código do voucher é obrigatório' })
  @IsNotEmpty({ message: 'Código do voucher não pode ser vazio' })
  claimCode: string;
}

