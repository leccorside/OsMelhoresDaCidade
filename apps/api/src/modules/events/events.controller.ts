import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateMerchantEventDto, UpdateMerchantEventDto } from './dto/event.dto';

@ApiTags('Eventos')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias de eventos disponíveis' })
  async getCategories() {
    return this.eventsService.getCategories();
  }

  // --- ÁREA DO COMERCIANTE / PARCEIRO ---

  @Get('merchant/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar eventos pertencentes ao comerciante autenticado' })
  async findMerchantEvents(@Req() req: any) {
    return this.eventsService.findMerchantEvents(req.user);
  }

  @Post('merchant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar novo evento pelo comerciante' })
  async createMerchantEvent(@Req() req: any, @Body() dto: CreateMerchantEventDto) {
    return this.eventsService.createMerchantEvent(req.user, dto);
  }

  @Put('merchant/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar evento existente do comerciante' })
  async updateMerchantEvent(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMerchantEventDto,
  ) {
    return this.eventsService.updateMerchantEvent(req.user, id, dto);
  }

  @Delete('merchant/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir evento do comerciante' })
  async deleteMerchantEvent(@Req() req: any, @Param('id') id: string) {
    return this.eventsService.deleteMerchantEvent(req.user, id);
  }

  // --- CONSULTAS PÚBLICAS ---

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
