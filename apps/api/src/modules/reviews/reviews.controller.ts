import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

export class CreateReviewDto {
  listingId: string;
  rating: number;
  comment?: string;
}

export class ReplyReviewDto {
  reply: string;
}

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

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Responder a uma avaliação como comerciante' })
  async replyReview(
    @CurrentUser() user: any,
    @Param('id') reviewId: string,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.reviewsService.replyAsMerchant(user.merchantProfile.id, reviewId, dto.reply);
  }
}

