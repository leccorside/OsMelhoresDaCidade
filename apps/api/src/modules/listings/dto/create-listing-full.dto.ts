import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek, ListingStatus } from '@prisma/client';

export class CreateServiceItemDto {
  @ApiProperty({ description: 'Nome do item ou tarifa' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Preço unitário' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'URL da imagem ilustrativa' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Disponibilidade atual', default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Ordem de exibição', default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateServiceCategoryDto {
  @ApiProperty({ description: 'Nome da seção (ex: Ingressos Oficiais, Chalés & Diárias, Cardápio)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Ordem de exibição', default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ type: [CreateServiceItemDto], description: 'Itens pertencentes a esta seção' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceItemDto)
  items: CreateServiceItemDto[];
}

export class CreateListingImageDto {
  @ApiProperty({ description: 'URL pública da imagem' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'Texto alternativo / legenda' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Define como imagem de capa / hero', default: false })
  @IsOptional()
  @IsBoolean()
  isCover?: boolean;

  @ApiPropertyOptional({ description: 'Ordem no mosaico (1 a 5)', default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateOpeningHourDto {
  @ApiProperty({ enum: DayOfWeek, description: 'Dia da semana' })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Horário de abertura (ex: 08:00)' })
  @IsString()
  openTime: string;

  @ApiProperty({ description: 'Horário de fechamento (ex: 18:00)' })
  @IsString()
  closeTime: string;

  @ApiPropertyOptional({ description: 'Fechado neste dia', default: false })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class CreateListingFullDto {
  @ApiProperty({ description: 'Nome comercial do estabelecimento' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Slug único para URL amigável' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Resumo curto de até 255 caracteres' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Texto editorial completo' })
  @IsOptional()
  @IsString()
  fullDescription?: string;

  @ApiPropertyOptional({ description: 'Dica dos Melhores da Cidade' })
  @IsOptional()
  @IsString()
  guideTip?: string;

  @ApiPropertyOptional({ description: 'Slug da categoria (ex: atracoes, hospedagem, restaurantes, comercio)' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ description: 'ID da categoria no banco' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Slug do município (ex: caldas-novas)', default: 'caldas-novas' })
  @IsOptional()
  @IsString()
  citySlug?: string;

  @ApiPropertyOptional({ description: 'ID da cidade' })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional({ description: 'Nome do bairro' })
  @IsOptional()
  @IsString()
  neighborhoodName?: string;

  @ApiPropertyOptional({ description: 'ID do bairro' })
  @IsOptional()
  @IsString()
  neighborhoodId?: string;

  @ApiPropertyOptional({ description: 'Logradouro / Rua' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: 'Número' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ description: 'CEP' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Latitude geográfica' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude geográfica' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Telefone comercial' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'WhatsApp com DDI e DDD' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ description: 'Website oficial' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Perfil no Instagram' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ description: 'E-mail de contato' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Faixa de preço: $, $$, $$$ ou $$$$', default: '$$' })
  @IsOptional()
  @IsString()
  priceTier?: string;

  @ApiPropertyOptional({ enum: ListingStatus, default: ListingStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional({ description: 'Destaque verificado na plataforma', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Título para SEO' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Descrição para motores de busca' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ type: [CreateListingImageDto], description: 'Mosaico de fotos' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingImageDto)
  images?: CreateListingImageDto[];

  @ApiPropertyOptional({ type: [String], description: 'Nomes das comodidades' })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @ApiPropertyOptional({ type: [CreateOpeningHourDto], description: 'Horários de funcionamento' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningHourDto)
  openingHours?: CreateOpeningHourDto[];

  @ApiPropertyOptional({
    type: [CreateServiceCategoryDto],
    description: 'Seções e itens adaptados da categoria (Ingressos, Quartos ou Cardápio)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceCategoryDto)
  serviceCategories?: CreateServiceCategoryDto[];
}

