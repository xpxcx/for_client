import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const PROFILE_UPLOAD_DIR = 'profile';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

  @Get('sections')
  getSections() {
    return this.contentService.getSections();
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
