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
import { diskStorage } from 'multer';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { MaterialsService } from './materials.service';

const MATERIALS_UPLOAD_DIR = 'materials';
const MAX_FILE_SIZE = 15 * 1024 * 1024;

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', MATERIALS_UPLOAD_DIR),
        filename: (_, file, cb) => {
          const ext = (file.originalname.match(/\.[^.]+$/) || ['.bin'])[0];
          const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не загружен');
    return { fileUrl: `/uploads/${MATERIALS_UPLOAD_DIR}/${file.filename}` };
  }

  @Get()
  async findAll() {
    return this.materialsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.materialsService.findOne(id);
    if (!item) return { error: 'Not found' };
    return item;
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() body: { title: string; description: string; fileUrl?: string }) {
    return this.materialsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{ title: string; description: string; fileUrl?: string }>,
  ) {
    const item = await this.materialsService.update(id, body);
    if (!item) return { error: 'Not found' };
    return item;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    const ok = await this.materialsService.remove(id);
    if (!ok) return { error: 'Not found' };
    return { success: true };
  }
}
