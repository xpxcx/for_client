import { Module } from '@nestjs/common';
import { NewsModule } from '../news/news.module';
import { MaterialsModule } from '../materials/materials.module';
import { LinksModule } from '../links/links.module';
import { SyncNewsController } from './sync-news.controller';

@Module({
  imports: [NewsModule, MaterialsModule, LinksModule],
  controllers: [SyncNewsController],
})
export class SyncNewsModule {}
