import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GalleryImageItemDto {
  @IsString()
  @IsNotEmpty({ message: 'A URL da imagem é obrigatória' })
  url: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}

export class AddGalleryImagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GalleryImageItemDto)
  images: GalleryImageItemDto[];
}

export class ReorderGalleryImagesDto {
  @IsArray()
  @IsString({ each: true })
  imageIds: string[];
}

export class UpdateGalleryImageDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}

