import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './common/prisma/prisma.module';
import { MailModule } from './common/mail/mail.module';
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
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillingModule } from './modules/billing/billing.module';
import { FranchiseModule } from './modules/franchise/franchise.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { SupportModule } from './modules/support/support.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    MailModule,
    NotificationsModule,
    AuditModule,
    GeographyModule,
    AuthModule,
    ListingsModule,
    EventsModule,
    ReviewsModule,
    CouponsModule,
    BillingModule,
    FranchiseModule,
    WebhooksModule,
    SupportModule,
    FavoritesModule,
    AdminModule,
    BlogModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
