import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeadPipelineDto {
  @ApiProperty({
    description: 'Estágio do lead no funil de prospecção do franqueado',
    example: 'NEGOCIACAO',
    enum: ['NOVO', 'CONTATADO', 'NEGOCIACAO', 'PROPOSTA_ENVIADA', 'CONVERTIDO_VIP', 'PERDIDO'],
  })
  @IsString()
  @IsIn(['NOVO', 'CONTATADO', 'NEGOCIACAO', 'PROPOSTA_ENVIADA', 'CONVERTIDO_VIP', 'PERDIDO'])
  leadStage: string;

  @ApiPropertyOptional({
    description: 'Anotações e histórico de contato com o lojista',
    example: 'Conversamos por WhatsApp com o gerente Marcos. Ele pediu proposta do plano Ouro Master.',
  })
  @IsOptional()
  @IsString()
  leadNotes?: string;
}
