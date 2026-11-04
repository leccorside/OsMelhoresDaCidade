import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './common/prisma/prisma.module';
import { GeographyModule } from './modules/geography/geography.module';
import { AuthModule } from './modules/auth/auth.module';
import { ListingsModule } from './modules/listings/listings.module';
import { EventsModule } from './modules/events/events.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { AdminModule } from './modules/admin/admin.module';
import { BlogModule } from './modules/blog/blog.module';
import { UploadModule } from './modules/upload/upload.module';
import { CouponsModule } from './modules/coupons/coupons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    GeographyModule,
    AuthModule,
    ListingsModule,
    EventsModule,
    ReviewsModule,
    CouponsModule,
    FavoritesModule,
    AdminModule,
    BlogModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
