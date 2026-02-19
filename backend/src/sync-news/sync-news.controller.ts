import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { MaterialsService } from '../materials/materials.service';
import { LinksService } from '../links/links.service';
import { NewsService } from '../news/news.service';

@Controller('news')
export class SyncNewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly materialsService: MaterialsService,
    private readonly linksService: LinksService,
  ) {}

  @Post('sync')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async syncExisting() {
    const materials = await this.materialsService.findAll();
    let created = 0;
    for (const m of materials) {
      const has = await this.newsService.hasNewsForMaterial(Number(m.id));
      if (!has) {
        const dateStr = m.createdAt.slice(0, 10);
        await this.newsService.createFromMaterial(Number(m.id), m.title, m.description, dateStr);
        created++;
      }
    }
    const links = await this.linksService.findAll();
    for (const l of links) {
      const has = await this.newsService.hasNewsForLink(Number(l.id));
      if (!has) {
        const dateStr = l.createdAt.slice(0, 10);
        await this.newsService.createFromLink(Number(l.id), l.title, l.url, l.description, dateStr);
        created++;
      }
    }
    return { success: true, created };
  }
}
