import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da seção é obrigatório' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}

export class UpdateServiceCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O nome da seção é obrigatório' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}

export class CreateServiceItemDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do item é obrigatório' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'O preço não pode ser negativo' })
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}

export class UpdateServiceItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'O preço não pode ser negativo' })
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}
