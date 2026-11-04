import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty({ message: 'O identificador do estabelecimento é obrigatório' })
  listingId: string;

  @IsInt()
  @Min(1, { message: 'A nota mínima é 1 estrela' })
  @Max(5, { message: 'A nota máxima é 5 estrelas' })
  @Type(() => Number)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReplyReviewDto {
  @IsString()
  @IsNotEmpty({ message: 'A mensagem de resposta é obrigatória' })
  reply: string;
}

export class MerchantReviewFilterDto {
  @IsOptional()
  @IsString()
  listingId?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  answered?: boolean;
}

