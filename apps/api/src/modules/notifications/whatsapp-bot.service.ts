import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Role } from '@prisma/client';

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

  /**
   * Notificar o franqueado responsável da comarca sobre um novo comércio cadastrado
   */
  async notifyFranchiseeNewMerchantLead(
    cityId: string,
    listingData: {
      name: string;
      phone?: string;
      categoryName?: string;
      ownerName?: string;
    },
  ) {
    try {
      const city = await this.prisma.city.findUnique({
        where: { id: cityId },
        include: {
          state: true,
          franchisees: {
            select: { id: true, name: true, phone: true },
          },
        },
      });

      if (!city) return;

      const cityName = `${city.name} - ${city.state?.uf || 'BA'}`;
      const contactTarget = listingData.phone ? listingData.phone.replace(/\D/g, '') : 'Não informado';

      const alertMessage =
        `🔔 *NOVO LEAD COMERCIAL CADASTRADO NO GUIA!* 🚀\n\n` +
        `📍 *Praça:* ${cityName}\n` +
        `🏢 *Estabelecimento:* ${listingData.name}\n` +
        `🏷️ *Segmento:* ${listingData.categoryName || 'Comércio Geral'}\n` +
        `👤 *Responsável:* ${listingData.ownerName || 'Lojista'}\n` +
        `📞 *Telefone / WhatsApp:* ${listingData.phone || 'Ver no painel'}\n\n` +
        `💡 *Dica de Fechamento:* Comércios abordados nos primeiros *15 minutos* têm taxa de conversão até 4x maior em planos VIP! Acesse o CRM local no portal para iniciar a prospecção.`;

      // Enviar para os franqueados cadastrados da praça
      for (const franchisee of city.franchisees) {
        if (franchisee.phone) {
          await this.sendTextMessage(franchisee.phone, alertMessage);
        }
      }

      // Se a cidade tiver chave PIX celular ou telefone cadastrado na franquia
      if (city.franchisePixType === 'PHONE' && city.franchisePixKey) {
        await this.sendTextMessage(city.franchisePixKey, alertMessage);
      }
    } catch (err: any) {
      this.logger.error(`Erro ao notificar franqueado sobre novo lead: ${err.message}`);
    }
  }

  /**
   * Disparo de teste para o franqueado validar o recebimento de alertas
   */
  async sendFranchiseeTestAlert(toPhone: string, franchiseeName: string, cityName: string) {
    const testMessage =
      `✅ *TESTE DE ALERTA DE PROSPECÇÃO — OS MELHORES DA CIDADE*\n\n` +
      `Olá, *${franchiseeName}*! Tudo bem?\n` +
      `Este é um disparo de teste do bot oficial de notificações de novos leads para a franquia de *${cityName}*.\n\n` +
      `Sempre que um novo comércio for cadastrado na sua região, você receberá um alerta imediato aqui para acionar seu script de vendas e fechar planos VIP! 🎯`;

    return this.sendTextMessage(toPhone, testMessage);
  }
}
