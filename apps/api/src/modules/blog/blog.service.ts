import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { citySlug?: string; categorySlug?: string; page?: number; limit?: number }) {
    const { citySlug, categorySlug, page = 1, limit = 9 } = params;
    const skip = (page - 1) * limit;

    const where: any = { isPublished: true };
    if (citySlug) where.city = { slug: citySlug };
    if (categorySlug) where.category = { slug: categorySlug };

    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
          city: true,
          tags: true,
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(citySlug: string, slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        city: { slug: citySlug },
        isPublished: true,
      },
      include: {
        category: true,
        city: true,
        tags: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Artigo "${slug}" não encontrado em ${citySlug}.`);
    }

    await this.prisma.blogPost.update({
      where: { id: post.id },
      data: { viewsCount: { increment: 1 } },
    });

    return post;
  }
}

