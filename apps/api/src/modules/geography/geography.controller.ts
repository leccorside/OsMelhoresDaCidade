import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GeographyService } from './geography.service';

@ApiTags('Geografia')
@Controller('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get('states')
  @ApiOperation({ summary: 'Listar todos os estados cadastrados' })
  async getStates() {
    return this.geographyService.getStates();
  }

  @Get('cep/:cep')
  @ApiOperation({ summary: 'Consultar endereço por CEP (ViaCEP brasileiro)' })
  async lookupCep(@Param('cep') cep: string) {
    return this.geographyService.lookupCep(cep);
  }

  @Get('geocode')
  @ApiOperation({ summary: 'Geocodificar endereço e obter latitude/longitude via OpenStreetMap' })
  @ApiQuery({ name: 'address', required: false, description: 'Rua ou logradouro com número' })
  @ApiQuery({ name: 'neighborhood', required: false, description: 'Bairro' })
  @ApiQuery({ name: 'city', required: false, description: 'Cidade' })
  @ApiQuery({ name: 'state', required: false, description: 'Estado / UF' })
  @ApiQuery({ name: 'query', required: false, description: 'Busca textual completa livre' })
  async geocode(
    @Query('address') address?: string,
    @Query('neighborhood') neighborhood?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('query') query?: string,
  ) {
    return this.geographyService.geocodeAddress({ address, neighborhood, city, state, query });
  }

  @Get('cities')
  @ApiOperation({ summary: 'Listar cidades disponíveis para o portal' })
  @ApiQuery({ name: 'stateUf', required: false, description: 'Sigla do Estado (UF)' })
  @ApiQuery({ name: 'search', required: false, description: 'Termo para busca de cidade' })
  async getCities(
    @Query('stateUf') stateUf?: string,
    @Query('search') search?: string,
  ) {
    return this.geographyService.getCities({ stateUf, search, publishedOnly: true });
  }

  @Get('cities/:slug')
  @ApiOperation({ summary: 'Obter dados completos de uma cidade por slug' })
  async getCityBySlug(@Param('slug') slug: string) {
    return this.geographyService.getCityBySlug(slug);
  }

  @Get('cities/:slug/neighborhoods')
  @ApiOperation({ summary: 'Listar bairros de uma cidade' })
  async getNeighborhoods(@Param('slug') slug: string) {
    return this.geographyService.getNeighborhoods(slug);
  }
}

