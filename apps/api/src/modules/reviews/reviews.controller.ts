import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { CreateReviewDto, ReplyReviewDto, MerchantReviewFilterDto } from './dto/review.dto';

@ApiTags('Avaliações')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar avaliação para um estabelecimento (1 por usuário)' })
  async createReview(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(userId, dto.listingId, dto.rating, dto.comment);
  }

  @Get('user/mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar histórico de avaliações do usuário logado' })
  async findMyReviews(@CurrentUser('id') userId: string) {
    return this.reviewsService.findUserReviews(userId);
  }

  // --- ÁREA DO COMERCIANTE ---

  @Get('merchant/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar avaliações dos estabelecimentos do comerciante com filtros' })
  @ApiQuery({ name: 'listingId', required: false })
  @ApiQuery({ name: 'rating', required: false, type: Number })
  @ApiQuery({ name: 'answered', required: false, type: Boolean })
  async findMerchantReviews(
    @CurrentUser() user: any,
    @Query('listingId') listingId?: string,
    @Query('rating') rating?: string,
    @Query('answered') answered?: string,
  ) {
    return this.reviewsService.findMerchantReviews(user, {
      listingId,
      rating: rating ? parseInt(rating, 10) : undefined,
      answered: answered !== undefined ? answered === 'true' : undefined,
    });
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Responder ou atualizar resposta de uma avaliação como comerciante' })
  async replyReview(
    @CurrentUser() user: any,
    @Param('id') reviewId: string,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.reviewsService.replyAsMerchant(user, reviewId, dto.reply);
  }

  @Delete('reply/:replyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir resposta do comerciante' })
  async deleteReply(
    @CurrentUser() user: any,
    @Param('replyId') replyId: string,
  ) {
    return this.reviewsService.deleteReply(user, replyId);
  }
}
