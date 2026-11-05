import { IsString, IsEmail, IsOptional, IsIn } from 'class-validator';
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

export class CreateFranchiseLeadDto {
  @ApiProperty({
    description: 'Nome completo do candidato a franqueado regional',
    example: 'Carlos Eduardo Mendes',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'E-mail para contato e envio da proposta comercial',
    example: 'carlos.mendes@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Telefone ou WhatsApp do candidato',
    example: '(77) 99888-7766',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Cidade de interesse para abertura da franquia',
    example: 'Luís Eduardo Magalhães',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Estado da cidade de interesse',
    example: 'BA',
  })
  @IsString()
  state: string;

  @ApiPropertyOptional({
    description: 'Faixa de capital disponível para investimento inicial',
    example: 'R$ 15.000 a R$ 30.000',
  })
  @IsOptional()
  @IsString()
  capitalAvailable?: string;

  @ApiPropertyOptional({
    description: 'Experiência prévia com vendas, marketing ou gestão comercial',
    example: 'Mais de 5 anos de experiência com vendas corporativas locais.',
  })
  @IsOptional()
  @IsString()
  experience?: string;
}
