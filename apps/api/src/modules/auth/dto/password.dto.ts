import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'joao@exemplo.com.br', description: 'E-mail para recuperação de senha' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de recuperação de senha enviado por e-mail' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NovaSenha@123', minLength: 6, description: 'Nova senha' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token de confirmação de e-mail' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
