import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class WhatsAppBotService {
  private readonly logger = new Logger(WhatsAppBotService.name);
  private readonly instanceId: string | null;
  private readonly token: string | null;
  private readonly clientToken: string | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.instanceId = this.configService.get<string>('ZAPI_INSTANCE_ID') || null;
    this.token = this.configService.get<string>('ZAPI_TOKEN') || null;
    this.clientToken = this.configService.get<string>('ZAPI_CLIENT_TOKEN') || null;
  }

  /**
   * Enviar mensagem de texto formatada via Z-API / WhatsApp Bot
   */
  async sendTextMessage(toPhone: string, message: string) {
    let cleanPhone = toPhone.replace(/\D/g, '');
    if (!cleanPhone) return { success: false, error: 'Telefone inválido' };

    // Garantir DDI do Brasil (55) se for celular local (10 ou 11 dígitos)
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    if (!this.instanceId || !this.token) {
      this.logger.log(
        `[SIMULAÇÃO WHATSAPP BOT] Para: +${cleanPhone}\n-------------------------\n${message}\n-------------------------`,
      );
      return { success: true, simulated: true, phone: cleanPhone };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const url = `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}/send-text`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.clientToken) {
        headers['Client-Token'] = this.clientToken;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: cleanPhone,
          message,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        this.logger.warn(`Falha no envio Z-API para ${cleanPhone}: ${JSON.stringify(data)}`);
        return { success: false, error: data.message || 'Erro Z-API', phone: cleanPhone };
      }

      this.logger.log(`WhatsApp enviado com sucesso para +${cleanPhone}`);
      return { success: true, zaapResponse: data, phone: cleanPhone };
    } catch (err: any) {
      clearTimeout(timeout);
      this.logger.error(`Erro ao disparar WhatsApp via Z-API: ${err.message}`);
      return { success: false, error: err.message, phone: cleanPhone };
    }
  }
}
