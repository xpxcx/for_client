import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.newsService.findOne(id);
    if (!item) return { error: 'Not found' };
    return item;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    const ok = await this.newsService.remove(id);
    if (!ok) return { error: 'Not found' };
    return { success: true };
  }
}
