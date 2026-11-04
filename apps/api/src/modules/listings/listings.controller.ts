import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ListingsService } from './listings.service';

@ApiTags('Estabelecimentos')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar estabelecimentos com filtros e paginação' })
  @ApiQuery({ name: 'citySlug', required: false, description: 'Slug da cidade' })
  @ApiQuery({ name: 'categorySlug', required: false, description: 'Slug da categoria' })
  @ApiQuery({ name: 'neighborhoodSlug', required: false, description: 'Slug do bairro' })
  @ApiQuery({ name: 'search', required: false, description: 'Termo de busca textual' })
  @ApiQuery({ name: 'priceTier', required: false, description: 'Faixa de preço ($, $$, $$$, $$$$)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['melhores', 'populares', 'menor_preco', 'recentes'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('citySlug') citySlug?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('neighborhoodSlug') neighborhoodSlug?: string,
    @Query('search') search?: string,
    @Query('priceTier') priceTier?: string,
    @Query('sortBy') sortBy?: 'melhores' | 'populares' | 'menor_preco' | 'recentes',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listingsService.findAll({
      citySlug,
      categorySlug,
      neighborhoodSlug,
      search,
      priceTier,
      sortBy,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
    });
  }

  @Get(':citySlug/:slug')
  @ApiOperation({ summary: 'Obter detalhes completos de um estabelecimento por cidade e slug' })
  async findBySlug(
    @Param('citySlug') citySlug: string,
    @Param('slug') slug: string,
  ) {
    return this.listingsService.findBySlug(citySlug, slug);
  }
}

