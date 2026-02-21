import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ContentModule } from './content/content.module';
import { NewsModule } from './news/news.module';
import { ContactModule } from './contact/contact.module';
import { MaterialsModule } from './materials/materials.module';
import { LinksModule } from './links/links.module';
import { ContactInfoModule } from './contact-info/contact-info.module';
import { SyncNewsModule } from './sync-news/sync-news.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'portfolio',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    ContentModule,
    NewsModule,
    ContactModule,
    AchievementsModule,
    MaterialsModule,
    LinksModule,
    ContactInfoModule,
    SyncNewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
