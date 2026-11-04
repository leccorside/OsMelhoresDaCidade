import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ListingsService, CreateListingDto } from './listings.service';
import { CreateListingFullDto } from './dto/create-listing-full.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Estabelecimentos')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar estabelecimentos com filtros e paginação' })
  @ApiQuery({ name: 'citySlug', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'neighborhoodSlug', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'priceTier', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
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

  // --- ROTA DE CADASTRO COMPLETO ADAPTADO (Painel Admin & Sistema) ---

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MERCHANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar ou atualizar estabelecimento com campos adaptados por categoria' })
  async createFull(@CurrentUser() user: any, @Body() dto: CreateListingFullDto) {
    return this.listingsService.createFull(dto, user);
  }

  // --- ÁREA ADMINISTRATIVA MASTER ---

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os estabelecimentos para o painel administrativo' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAllAdmin(
    @Query('search') search?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('status') status?: string,
  ) {
    return this.listingsService.findAllAdmin({ search, categorySlug, status });
  }

  @Get('admin/get/:idOrSlug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados completos de um estabelecimento para formulário de edição' })
  async findOneAdmin(@Param('idOrSlug') idOrSlug: string) {
    return this.listingsService.findAdminByIdOrSlug(idOrSlug);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover estabelecimento por ID' })
  async deleteListing(@Param('id') id: string) {
    return this.listingsService.deleteListing(id);
  }

  // --- ROTAS DO COMERCIANTE ---

  @Get('merchant/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar estabelecimentos pertencentes ao comerciante logado' })
  async findMerchantListings(@CurrentUser() user: any) {
    let merchantProfileId = user.merchantProfile?.id;
    if (!merchantProfileId && user.role === Role.ADMIN) {
      merchantProfileId = await this.listingsService.ensureAdminMerchantProfile(user.id, user.name);
    }
    if (!merchantProfileId) {
      throw new ForbiddenException('Perfil de comerciante não vinculado.');
    }
    return this.listingsService.findMerchantListings(merchantProfileId);
  }

  @Get('merchant/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter métricas e estatísticas consolidadas do comerciante' })
  async getMerchantStats(@CurrentUser() user: any) {
    let merchantProfileId = user.merchantProfile?.id;
    if (!merchantProfileId && user.role === Role.ADMIN) {
      merchantProfileId = await this.listingsService.ensureAdminMerchantProfile(user.id, user.name);
    }
    if (!merchantProfileId) {
      throw new ForbiddenException('Perfil de comerciante não vinculado.');
    }
    return this.listingsService.getMerchantStats(merchantProfileId);
  }

  @Post('merchant/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar novo estabelecimento para moderação' })
  async createListing(@CurrentUser() user: any, @Body() dto: CreateListingDto) {
    let merchantProfileId = user.merchantProfile?.id;
    if (!merchantProfileId && user.role === Role.ADMIN) {
      merchantProfileId = await this.listingsService.ensureAdminMerchantProfile(user.id, user.name);
    }
    if (!merchantProfileId) {
      throw new ForbiddenException('Perfil de comerciante não vinculado.');
    }
    return this.listingsService.create(merchantProfileId, dto);
  }

  // --- ROTA PÚBLICA DE DETALHES ---

  @Get(':citySlug/:slug')
  @ApiOperation({ summary: 'Obter detalhes de um estabelecimento' })
  async findBySlug(
    @Param('citySlug') citySlug: string,
    @Param('slug') slug: string,
  ) {
    return this.listingsService.findBySlug(citySlug, slug);
  }
}
