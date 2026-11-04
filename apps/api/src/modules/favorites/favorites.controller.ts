import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Favoritos')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('listing/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alternar status de favorito em um estabelecimento' })
  async toggleListing(@CurrentUser('id') userId: string, @Param('id') listingId: string) {
    return this.favoritesService.toggleListing(userId, listingId);
  }

  @Post('event/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alternar status de favorito em um evento' })
  async toggleEvent(@CurrentUser('id') userId: string, @Param('id') eventId: string) {
    return this.favoritesService.toggleEvent(userId, eventId);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os favoritos do usuário logado' })
  async findMyFavorites(@CurrentUser('id') userId: string) {
    return this.favoritesService.findUserFavorites(userId);
  }
}

