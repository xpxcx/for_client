import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';
import { NewsModule } from './news/news.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [ContentModule, NewsModule, ContactModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
