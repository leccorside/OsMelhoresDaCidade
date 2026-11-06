import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface InvoiceNotificationParams {
  phone: string;
  merchantName: string;
  listingName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  pixCopiaECola?: string;
}

export interface SubscriptionExpiringParams {
  phone: string;
  merchantName: string;
  listingName: string;
  planName: string;
  daysRemaining: number;
  renewUrl: string;
}

export interface InvoicePaidParams {
  phone: string;
  merchantName: string;
  listingName: string;
  invoiceNumber: string;
  amount: number;
  planName: string;
}

export interface MerchantWelcomeParams {
  phone: string;
  merchantName: string;
  companyName: string;
  setupUrl?: string;
  plansUrl?: string;
}

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
   * Disparo automatizado de Link de Fatura, Boleto Bancário e PIX Copia e Cola para o Lojista
   */
  async notifyMerchantInvoiceDue(params: InvoiceNotificationParams) {
    const formattedAmount = Number(params.amount).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    let message =
      `📄 *FATURA DISPONÍVEL — OS MELHORES DA CIDADE* 🚀\n\n` +
      `Olá, *${params.merchantName}*! Tudo bem?\n\n` +
      `A fatura do plano de destaque de *${params.listingName}* já está pronta para pagamento.\n\n` +
      `🔢 *Fatura:* ${params.invoiceNumber}\n` +
      `💰 *Valor:* ${formattedAmount}\n` +
      `📅 *Vencimento:* ${params.dueDate}\n\n` +
      `🔗 *Acesse sua fatura completa:*\n${params.invoiceUrl}\n`;

    if (params.bankSlipUrl) {
      message += `\n📑 *Boleto Bancário em PDF:*\n${params.bankSlipUrl}\n`;
    }

    if (params.pixCopiaECola) {
      message += `\n⚡ *PIX Copia e Cola (pague direto no seu app bancário):*\n\`${params.pixCopiaECola}\`\n`;
    }

    message += `\nCaso já tenha realizado o pagamento, desconsidere esta mensagem. Obrigado por confiar no portal Os Melhores da Cidade! ⭐`;

    return this.sendTextMessage(params.phone, message);
  }

  /**
   * Lembrete preventivo de renovação de plano antes da suspensão do selo VIP
   */
  async notifyMerchantSubscriptionExpiring(params: SubscriptionExpiringParams) {
    const message =
      `⚠️ *LEMBRETE DE RENOVAÇÃO DO SEU PLANO VIP — OS MELHORES DA CIDADE*\n\n` +
      `Olá, *${params.merchantName}*!\n\n` +
      `O plano *${params.planName}* do estabelecimento *${params.listingName}* vence em *${params.daysRemaining} dias*.\n\n` +
      `Mantenha sua empresa no topo das buscas da cidade, com selo verificado e cupons ativos para os clientes locais.\n\n` +
      `👉 *Renove agora mesmo em 1 clique:*\n${params.renewUrl}\n\n` +
      `Qualquer dúvida, conte com nossa equipe oficial de suporte! ✨`;

    return this.sendTextMessage(params.phone, message);
  }

  /**
   * Confirmação de quitação da fatura e renovação de benefícios
   */
  async notifyMerchantInvoicePaid(params: InvoicePaidParams) {
    const formattedAmount = Number(params.amount).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const message =
      `✅ *PAGAMENTO CONFIRMADO COM SUCESSO!* 🎉\n\n` +
      `Olá, *${params.merchantName}*!\n\n` +
      `Confirmamos o pagamento da fatura *${params.invoiceNumber}* no valor de *${formattedAmount}* para o comércio *${params.listingName}*.\n\n` +
      `O seu plano *${params.planName}* permanece 100% ativo e seu estabelecimento continua em destaque para milhares de moradores da região.\n\n` +
      `Agradecemos pela parceria contínua! ⭐`;

    return this.sendTextMessage(params.phone, message);
  }

  /**
   * Mensagem automática de boas-vindas ao lojista logo após a criação da conta
   */
  async notifyMerchantWelcome(params: MerchantWelcomeParams) {
    const setupUrl = params.setupUrl || 'http://localhost:4100/comerciante/estabelecimentos/novo';
    const plansUrl = params.plansUrl || 'http://localhost:4100/comerciante/planos';

    const message =
      `🎉 *BEM-VINDO AO PORTAL OS MELHORES DA CIDADE!* 🚀\n\n` +
      `Olá, *${params.merchantName}*! Tudo bem?\n\n` +
      `É um prazer ter a empresa *${params.companyName}* em nossa plataforma! Sua conta de comerciante parceiro foi criada com sucesso.\n\n` +
      `Agora você já pode colocar seu comércio em evidência para milhares de clientes e turistas da região:\n\n` +
      `1️⃣ *Cadastre e configure seu anúncio:*\n${setupUrl}\n\n` +
      `2️⃣ *Conheça nossos Planos VIP e escolha seu destaque:*\n${plansUrl}\n\n` +
      `Se tiver qualquer pergunta, basta responder esta mensagem com a palavra *DÚVIDA* ou *AJUDA* que nosso suporte entrará em contato direto com você! ⭐`;

    return this.sendTextMessage(params.phone, message);
  }
}
