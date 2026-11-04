import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateMerchantProfileDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto' })
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  legalName?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  pixKey?: string;

  @IsOptional()
  @IsString()
  pixKeyType?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAgency?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'Senha atual é obrigatória' })
  @IsNotEmpty({ message: 'Senha atual não pode ser vazia' })
  currentPassword: string;

  @IsString({ message: 'Nova senha é obrigatória' })
  @IsNotEmpty({ message: 'Nova senha não pode ser vazia' })
  @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres' })
  newPassword: string;
}

