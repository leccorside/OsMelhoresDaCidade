import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token de atualização emitido no login' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

