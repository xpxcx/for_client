import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AchievementsService } from './achievements.service';

const ACHIEVEMENTS_UPLOAD_DIR = 'achievements';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', ACHIEVEMENTS_UPLOAD_DIR),
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
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не загружен или неверный тип');
    return { imageUrl: `/uploads/${ACHIEVEMENTS_UPLOAD_DIR}/${file.filename}` };
  }

  @Get()
  findAll() {
    return this.achievementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const item = this.achievementsService.findOne(id);
    if (!item) return { error: 'Not found' };
    return item;
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() body: { title: string; description: string; date: string; imageUrl?: string }) {
    return this.achievementsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ title: string; description: string; date: string; imageUrl?: string }>,
  ) {
    const item = this.achievementsService.update(id, body);
    if (!item) return { error: 'Not found' };
    return item;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    const ok = this.achievementsService.remove(id);
    if (!ok) return { error: 'Not found' };
    return { success: true };
  }
}
