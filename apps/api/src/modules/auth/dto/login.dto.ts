import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'joao@exemplo.com.br', description: 'E-mail cadastrado' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senha@1234', description: 'Senha da conta' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
