import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BlogService } from './blog.service';

@ApiTags('CMS Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar artigos do blog publicados' })
  @ApiQuery({ name: 'citySlug', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('citySlug') citySlug?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blogService.findAll({
      citySlug,
      categorySlug,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 9,
    });
  }

  @Get(':citySlug/:slug')
  @ApiOperation({ summary: 'Obter artigo completo do blog por cidade e slug' })
  async findBySlug(@Param('citySlug') citySlug: string, @Param('slug') slug: string) {
    return this.blogService.findBySlug(citySlug, slug);
  }
}

