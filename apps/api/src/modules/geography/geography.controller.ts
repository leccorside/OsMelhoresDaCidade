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

