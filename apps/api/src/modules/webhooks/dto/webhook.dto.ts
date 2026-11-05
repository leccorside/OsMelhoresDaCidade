import { IsString, IsUrl, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebhookEndpointDto {
  @ApiProperty({
    description: 'URL de destino para envio dos eventos via POST (ex: Webhook do Zapier, CRM ou Make)',
    example: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    description: 'Descrição ou nome do sistema integrado',
    example: 'Zapier - Notificar Canal no Slack e CRM HubSpot',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Lista de eventos que este webhook deve receber',
    example: ['SUBSCRIPTION_PAID', 'MERCHANT_REGISTERED', 'SPLIT_SETTLED'],
  })
  @IsArray()
  @IsString({ each: true })
  events: string[];

  @ApiPropertyOptional({
    description: 'Chave secreta para assinatura HMAC SHA-256 (gerada automaticamente se não informada)',
    example: 'whsec_customsecret123456',
  })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiPropertyOptional({
    description: 'Status ativo do endpoint',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
