import { Body, Controller, Post, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { ContactService } from './contact.service';

export class ContactDto {
  name: string;
  email: string;
  category?: string;
  message: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async send(@Body() body: ContactDto) {
    await this.contactService.create(body);
    return { success: true, message: 'Сообщение принято' };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    return this.contactService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findOne(@Param('id') id: string) {
    const item = await this.contactService.findOne(id);
    if (!item) return { error: 'Not found' };
    return item;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    const ok = await this.contactService.remove(id);
    if (!ok) return { error: 'Not found' };
    return { success: true };
  }
}
