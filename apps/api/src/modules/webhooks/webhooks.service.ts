import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWebhookEndpointDto } from './dto/webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWebhookEndpointDto) {
    const secret = dto.secret || `whsec_${crypto.randomBytes(16).toString('hex')}`;

    return this.prisma.webhookEndpoint.create({
      data: {
        url: dto.url,
        description: dto.description || 'Integração Externa Webhook',
        events: dto.events,
        secret,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async findAll() {
    return this.prisma.webhookEndpoint.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    const endpoint = await this.prisma.webhookEndpoint.findUnique({
      where: { id },
    });

    if (!endpoint) {
      throw new NotFoundException('Webhook não encontrado.');
    }

    return this.prisma.webhookEndpoint.delete({
      where: { id },
    });
  }

  async testWebhook(id: string) {
    const endpoint = await this.prisma.webhookEndpoint.findUnique({
      where: { id },
    });

    if (!endpoint) {
      throw new NotFoundException('Webhook não encontrado.');
    }

    const testPayload = {
      event: 'TEST_PING',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Teste de conectividade do webhook do portal Os Melhores da Cidade',
        endpointId: endpoint.id,
        description: endpoint.description,
        supportedEvents: endpoint.events,
      },
    };

    return this.sendToEndpoint(endpoint, 'TEST_PING', testPayload);
  }

  /**
   * Despacha eventos para todos os webhooks ativos cadastrados que escutam o evento
   */
  async dispatch(event: string, payload: any) {
    try {
      const endpoints = await this.prisma.webhookEndpoint.findMany({
        where: {
          isActive: true,
          events: { has: event },
        },
      });

      if (endpoints.length === 0) return;

      this.logger.log(`Despachando evento "${event}" para ${endpoints.length} webhooks externos.`);

      const fullPayload = {
        event,
        timestamp: new Date().toISOString(),
        data: payload,
      };

      // Disparo em paralelo
      await Promise.allSettled(
        endpoints.map((ep) => this.sendToEndpoint(ep, event, fullPayload)),
      );
    } catch (err: any) {
      this.logger.error(`Erro ao despachar webhook "${event}": ${err.message}`);
    }
  }

  private async sendToEndpoint(
    endpoint: { id: string; url: string; secret: string },
    event: string,
    payload: any,
  ) {
    const bodyString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', endpoint.secret)
      .update(bodyString)
      .digest('hex');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OsMelhoresDaCidade-Webhook/1.0',
          'X-Event': event,
          'X-Signature': `sha256=${signature}`,
        },
        body: bodyString,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const status = response.status;
      this.logger.log(`Webhook enviado para ${endpoint.url} - Status: ${status}`);

      return {
        success: response.ok,
        status,
        url: endpoint.url,
      };
    } catch (error: any) {
      clearTimeout(timeout);
      this.logger.warn(`Falha no envio de webhook para ${endpoint.url}: ${error.message}`);
      return {
        success: false,
        error: error.message,
        url: endpoint.url,
      };
    }
  }
}
