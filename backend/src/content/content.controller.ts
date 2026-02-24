import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import type { Section } from './content.service';

const PROFILE_UPLOAD_DIR = 'profile';
const SECTION_FILES_UPLOAD_DIR = 'section-files';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_SECTION_FILE_SIZE = 15 * 1024 * 1024;

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', PROFILE_UPLOAD_DIR),
        filename: (_, file, cb) => {
          const ext = (file.originalname.match(/\.[^.]+$/) || ['.jpg'])[0];
          const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_, file, cb) => {
        const ok = /^image\//.test(file.mimetype);
        cb(null, !!ok);
      },
    }),
  )
  uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не загружен или неверный тип (нужно изображение)');
    return { url: `/uploads/${PROFILE_UPLOAD_DIR}/${file.filename}` };
  }

  @Post('section-upload')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', SECTION_FILES_UPLOAD_DIR),
        filename: (_, file, cb) => {
          const ext = (file.originalname.match(/\.[^.]+$/) || ['.bin'])[0];
          const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: MAX_SECTION_FILE_SIZE },
    }),
  )
  uploadSectionFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не загружен');
    return { fileUrl: `/uploads/${SECTION_FILES_UPLOAD_DIR}/${file.filename}` };
  }

  @Get('sections')
  getSections() {
    return this.contentService.getSections();
  }

  @Put('sections')
  @UseGuards(JwtAuthGuard, AdminGuard)
  setSections(@Body() body: { sections: Section[] }) {
    const sections = Array.isArray(body?.sections) ? body.sections : [];
    return this.contentService.setSections(sections);
  }

  @Get('section/:sectionId/items')
  getSectionItems(@Param('sectionId') sectionId: string) {
    return this.contentService.getSectionItems(sectionId);
  }

  @Post('section/:sectionId/items')
  @UseGuards(JwtAuthGuard, AdminGuard)
  addSectionItem(
    @Param('sectionId') sectionId: string,
    @Body() body: { title: string; description?: string; link?: string },
  ) {
    const item = this.contentService.addSectionItem(sectionId, body);
    if (!item) throw new BadRequestException('Неверные данные');
    return item;
  }

  @Patch('section/:sectionId/items/:itemId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateSectionItem(
    @Param('sectionId') sectionId: string,
    @Param('itemId') itemId: string,
    @Body() body: { title?: string; description?: string; link?: string },
  ) {
    const item = this.contentService.updateSectionItem(sectionId, itemId, body);
    if (!item) throw new BadRequestException('Не найден');
    return item;
  }

  @Delete('section/:sectionId/items/:itemId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteSectionItem(@Param('sectionId') sectionId: string, @Param('itemId') itemId: string) {
    const ok = this.contentService.deleteSectionItem(sectionId, itemId);
    if (!ok) throw new BadRequestException('Не найден');
    return { ok: true };
  }

  @Get(':id')
  getContent(@Param('id') id: string) {
    const content = this.contentService.getContent(id);
    if (!content) {
      return { error: 'Not found' };
    }
    return content;
  }

  @Patch(':id')
  updateContent(
    @Param('id') id: string,
    @Body() body: { title?: string; body?: string; fullName?: string; birthDate?: string; imageUrl?: string; education?: string; experience?: string },
  ) {
    const updated = this.contentService.updateContent(id, body);
    if (!updated) {
      return { error: 'Not found' };
    }
    return updated;
  }
}
