import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupportTicketDto {
  @ApiProperty({
    description: 'Assunto resumido da solicitação ou problema',
    example: 'Dúvida sobre renovação do plano Prata VIP',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Categoria do chamado de atendimento',
    example: 'FINANCEIRO',
    enum: ['FINANCEIRO', 'PLANO_VIP', 'ANUNCIO', 'DUVIDAS', 'TECNICO', 'OUTROS'],
  })
  @IsString()
  @IsIn(['FINANCEIRO', 'PLANO_VIP', 'ANUNCIO', 'DUVIDAS', 'TECNICO', 'OUTROS'])
  category: string;

  @ApiPropertyOptional({
    description: 'Prioridade estimada da solicitação',
    example: 'NORMAL',
    enum: ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'])
  priority?: string;

  @ApiProperty({
    description: 'Mensagem detalhada inicial com a descrição da dúvida ou solicitação',
    example: 'Gostaria de verificar se podemos alterar a data de vencimento da fatura mensal do meu comércio.',
  })
  @IsString()
  message: string;
}

export class ReplySupportTicketDto {
  @ApiProperty({
    description: 'Conteúdo da mensagem de resposta no ticket',
    example: 'Olá! Sim, podemos ajustar o vencimento da sua fatura para todo dia 10.',
  })
  @IsString()
  message: string;
}
