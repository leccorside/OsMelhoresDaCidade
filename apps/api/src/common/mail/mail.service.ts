import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface ReviewEmailData {
  merchantName: string;
  merchantEmail: string;
  listingName: string;
  reviewerName: string;
  rating: number;
  comment?: string | null;
  reviewUrl: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST;
    const port = parseInt(this.configService.get<string>('SMTP_PORT') || process.env.SMTP_PORT || '587', 10);
    const user = this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER;
    const pass = this.configService.get<string>('SMTP_PASS') || process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Serviço de e-mail SMTP configurado para ${host}:${port}`);
    } else {
      // Modo de teste / desenvolvimento local: console ou JSON transport
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.logger.log('Serviço de e-mail inicializado em modo de simulação (Log de Desenvolvimento).');
    }
  }

  async sendNewReviewEmail(data: ReviewEmailData) {
    const isFiveStars = data.rating === 5;
    const isCritical = data.rating <= 2;

    const bannerColor = isFiveStars ? '#10B981' : isCritical ? '#EF4444' : '#F59E0B';
    const bannerTitle = isFiveStars
      ? '🌟 Parabéns! Nova Avaliação 5 Estrelas!'
      : isCritical
      ? '⚠️ Atenção: Novo Feedback do Cliente Requer Sua Resposta'
      : '💬 Nova Avaliação Recebida no Guia';

    const starsHtml = '★'.repeat(data.rating) + '☆'.repeat(Math.max(0, 5 - data.rating));

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${bannerTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 24px; color: #1C1B1B;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background-color: #171717; padding: 20px 28px; text-align: center;">
      <h2 style="color: #FFFFFF; margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">
        OS MELHORES DA CIDADE
      </h2>
      <span style="color: #FF3B4F; font-size: 11px; font-weight: 700; text-transform: uppercase;">Portal & Guia Oficial</span>
    </div>

    <!-- Banner de Status -->
    <div style="background-color: ${bannerColor}; padding: 16px 28px; color: #FFFFFF; text-align: center; font-weight: 800; font-size: 14px;">
      ${bannerTitle}
    </div>

    <!-- Corpo do Email -->
    <div style="padding: 28px;">
      <p style="font-size: 14px; color: #374151; margin-top: 0;">
        Olá, <strong>${data.merchantName}</strong>!
      </p>
      
      <p style="font-size: 13px; color: #4B5563; line-height: 1.5;">
        O cliente <strong>${data.reviewerName}</strong> acabou de publicar uma avaliação sobre o seu estabelecimento <strong>"${data.listingName}"</strong>.
      </p>

      <!-- Card do Depoimento -->
      <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <div style="color: #F59E0B; font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-bottom: 8px;">
          ${starsHtml} <span style="font-size: 14px; color: #374151; font-weight: 700;">(${data.rating} de 5)</span>
        </div>
        <p style="font-size: 13px; color: #1F2937; line-height: 1.6; margin: 0; font-style: italic;">
          "${data.comment || 'O cliente deixou uma pontuação sem comentário em texto.'}"
        </p>
        <div style="font-size: 11px; color: #6B7280; margin-top: 10px; font-weight: 600;">
          Por ${data.reviewerName} • Via Aplicativo / Web
        </div>
      </div>

      <!-- Dica Estratégica -->
      <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #92400E; margin-bottom: 24px;">
        <strong>Dica do Guia:</strong> Estabelecimentos que respondem a feedbacks em menos de 24 horas conquistam a fidelidade de novos clientes e aumentam sua pontuação no ranking.
      </div>

      <!-- Botão CTA -->
      <div style="text-align: center; margin: 28px 0 10px 0;">
        <a href="${data.reviewUrl}" style="background-color: #FF3B4F; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 13px; font-weight: 800; display: inline-block; box-shadow: 0 4px 6px -1px rgba(255, 59, 79, 0.3);">
          Responder Avaliação no Painel
        </a>
      </div>
    </div>

    <!-- Rodapé -->
    <div style="background-color: #F3F4F6; padding: 16px 28px; font-size: 11px; color: #9CA3AF; text-align: center; border-top: 1px solid #E5E7EB;">
      Você está recebendo este e-mail porque é o responsável cadastrado pelo estabelecimento em Os Melhores da Cidade.
    </div>
  </div>
</body>
</html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: '"Os Melhores da Cidade" <notificacoes@osmelhoresdacidade.com.br>',
        to: data.merchantEmail,
        subject: `${bannerTitle} - ${data.listingName}`,
        html,
      });

      this.logger.log(`E-mail de avaliação enviado para ${data.merchantEmail} (Nota: ${data.rating}★). Info: ${JSON.stringify(info)}`);
      return { success: true, info };
    } catch (err: any) {
      this.logger.error(`Falha no envio do e-mail de avaliação para ${data.merchantEmail}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

