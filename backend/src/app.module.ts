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
      synchronize: true,
    }),
    AuthModule,
    ContentModule,
    NewsModule,
    ContactModule,
    AchievementsModule,
    MaterialsModule,
    LinksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
