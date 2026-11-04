import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  source: 'nominatim' | 'fallback';
}

export interface CepLookupResult {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
}

@Injectable()
export class GeographyService {
  constructor(private readonly prisma: PrismaService) {}

  async getStates() {
    return this.prisma.state.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            cities: {
              where: { isPublished: true },
            },
          },
        },
      },
    });
  }

  async getCities(params?: { stateUf?: string; search?: string; publishedOnly?: boolean }) {
    const { stateUf, search, publishedOnly = true } = params || {};

    return this.prisma.city.findMany({
      where: {
        ...(publishedOnly ? { isPublished: true } : {}),
        ...(stateUf
          ? {
              state: {
                uf: { equals: stateUf, mode: 'insensitive' },
              },
            }
          : {}),
        ...(search
          ? {
              name: { contains: search, mode: 'insensitive' },
            }
          : {}),
      },
      include: {
        state: true,
        _count: {
          select: {
            listings: { where: { status: 'PUBLISHED' } },
            events: { where: { status: 'PUBLISHED' } },
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    });
  }

  async getCityBySlug(slug: string) {
    const city = await this.prisma.city.findUnique({
      where: { slug },
      include: {
        state: true,
        neighborhoods: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            listings: { where: { status: 'PUBLISHED' } },
            events: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });

    if (!city) {
      throw new NotFoundException(`Cidade com slug "${slug}" não encontrada.`);
    }

    return city;
  }

  async getNeighborhoods(citySlug: string) {
    const city = await this.prisma.city.findUnique({
      where: { slug: citySlug },
      select: { id: true },
    });

    if (!city) {
      throw new NotFoundException(`Cidade com slug "${citySlug}" não encontrada.`);
    }

    return this.prisma.neighborhood.findMany({
      where: { cityId: city.id },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            listings: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });
  }

  /**
   * Consulta dados de endereço no ViaCEP brasileiro
   */
  async lookupCep(rawCep: string): Promise<CepLookupResult> {
    const cleanCep = (rawCep || '').replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      throw new BadRequestException('CEP inválido. Deve conter 8 dígitos.');
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        throw new BadRequestException(`Erro ao consultar ViaCEP: HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.erro) {
        throw new NotFoundException(`CEP ${cleanCep} não encontrado.`);
      }

      return {
        cep: data.cep || cleanCep,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        localidade: data.localidade || '',
        uf: data.uf || '',
        ibge: data.ibge,
      };
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(`Falha de comunicação ao buscar CEP: ${err.message}`);
    }
  }

  /**
   * Geocodificação de endereço via OpenStreetMap Nominatim com fallbacks inteligentes
   */
  async geocodeAddress(params: {
    address?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    query?: string;
  }): Promise<GeocodeResult> {
    const { address, neighborhood, city = 'Caldas Novas', state = 'Goiás', query } = params;

    const queriesToTry: string[] = [];

    if (query && query.trim()) {
      queriesToTry.push(query.trim());
    }

    if (address && address.trim()) {
      const parts = [
        address.trim(),
        neighborhood?.trim(),
        city.trim(),
        state.trim(),
        'Brasil',
      ].filter(Boolean);
      queriesToTry.push(parts.join(', '));
    }

    if (neighborhood && neighborhood.trim()) {
      queriesToTry.push(`${neighborhood.trim()}, ${city.trim()}, ${state.trim()}, Brasil`);
    }

    queriesToTry.push(`${city.trim()}, ${state.trim()}, Brasil`);

    const userAgent = 'OsMelhoresDaCidade/1.0 (contato@osmelhoresdacidade.com.br)';

    for (const q of queriesToTry) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          q,
        )}`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          },
        });

        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const first = list[0];
            const lat = parseFloat(first.lat);
            const lng = parseFloat(first.lon);
            if (!isNaN(lat) && !isNaN(lng)) {
              return {
                lat,
                lng,
                displayName: first.display_name,
                source: 'nominatim',
              };
            }
          }
        }
      } catch (err) {
        // Tenta próxima query
      }
    }

    // Fallback padrão: Centro de Caldas Novas - GO
    return {
      lat: -17.7444,
      lng: -48.6253,
      displayName: `${city}, ${state}, Brasil (Centro Padrão)`,
      source: 'fallback',
    };
  }
}

