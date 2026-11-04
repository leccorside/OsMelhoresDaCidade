import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMerchantEventDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do evento é obrigatório' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  programDetails?: string;

  @IsString()
  @IsNotEmpty({ message: 'A categoria do evento é obrigatória' })
  categoryId: string;

  @IsOptional()
  @IsString()
  listingId?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  @IsNotEmpty({ message: 'A data de início é obrigatória' })
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFree?: boolean;

  @IsOptional()
  @IsString()
  priceInfo?: string;

  @IsOptional()
  @IsString()
  ticketUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateMerchantEventDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O nome do evento não pode ser vazio' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  programDetails?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  listingId?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFree?: boolean;

  @IsOptional()
  @IsString()
  priceInfo?: string;

  @IsOptional()
  @IsString()
  ticketUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

