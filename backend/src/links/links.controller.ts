import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  async findAll() {
    return this.linksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.linksService.findOne(id);
    if (!item) return { error: 'Not found' };
    return item;
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() body: { title: string; url: string; description?: string }) {
    return this.linksService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{ title: string; url: string; description?: string }>,
  ) {
    const item = await this.linksService.update(id, body);
    if (!item) return { error: 'Not found' };
    return item;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    const ok = await this.linksService.remove(id);
    if (!ok) return { error: 'Not found' };
    return { success: true };
  }
}
