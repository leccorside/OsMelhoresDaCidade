import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@exemplo.com.br', description: 'E-mail do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senha@1234', minLength: 6, description: 'Senha segura' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '(64) 99999-9999', description: 'Telefone para contato' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: Role, default: Role.USER, description: 'Tipo de conta' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'Pousada do Lago LTDA', description: 'Nome da empresa (se comerciante)' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90', description: 'CNPJ da empresa (se comerciante)' })
  @IsOptional()
  @IsString()
  cnpj?: string;
}

