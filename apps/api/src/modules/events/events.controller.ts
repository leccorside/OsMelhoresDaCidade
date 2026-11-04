import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Eventos')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar agenda de eventos com filtros e paginação' })
  @ApiQuery({ name: 'citySlug', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isFree', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('citySlug') citySlug?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('search') search?: string,
    @Query('isFree') isFree?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.eventsService.findAll({
      citySlug,
      categorySlug,
      search,
      isFree: isFree !== undefined ? isFree === 'true' : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
    });
  }

  @Get(':citySlug/:slug')
  @ApiOperation({ summary: 'Obter detalhes de um evento por cidade e slug' })
  async findBySlug(
    @Param('citySlug') citySlug: string,
    @Param('slug') slug: string,
  ) {
    return this.eventsService.findBySlug(citySlug, slug);
  }
}

