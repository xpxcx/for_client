import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { NewsService } from '../news/news.service';
import { Material } from './material.entity';

const MATERIALS_UPLOAD_DIR = 'materials';

function deleteMaterialFileByUrl(url: string | null | undefined): void {
  if (!url || !url.startsWith('/uploads/')) return;
  const relative = url.replace(/^\/uploads\//, '');
  if (!relative.startsWith(MATERIALS_UPLOAD_DIR + '/')) return;
  const path = join(process.cwd(), 'uploads', relative);
  try {
    if (existsSync(path)) unlinkSync(path);
  } catch {
    // ignore
  }
}

export interface MaterialItem {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  createdAt: string;
}

function toResponse(row: Material): MaterialItem {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    fileUrl: row.fileUrl ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly repo: Repository<Material>,
    private readonly newsService: NewsService,
  ) {}

  async findAll(): Promise<MaterialItem[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map(toResponse);
  }

  async findOne(id: string): Promise<MaterialItem | null> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    const row = await this.repo.findOne({ where: { id: numId } });
    return row ? toResponse(row) : null;
  }

  async create(dto: { title: string; description: string; fileUrl?: string }): Promise<MaterialItem> {
    const row = this.repo.create({
      title: dto.title,
      description: dto.description,
      fileUrl: dto.fileUrl ?? null,
    });
    const saved = await this.repo.save(row);
    const dateStr = saved.createdAt instanceof Date ? saved.createdAt.toISOString().slice(0, 10) : String(saved.createdAt).slice(0, 10);
    try {
      await this.newsService.createFromMaterial(saved.id, saved.title, saved.description, dateStr);
    } catch (err) {
      console.error('Ошибка создания новости из материала:', err);
    }
    return toResponse(saved);
  }

  async update(
    id: string,
    dto: Partial<{ title: string; description: string; fileUrl?: string }>,
  ): Promise<MaterialItem | null> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    const row = await this.repo.findOne({ where: { id: numId } });
    if (!row) return null;
    if (dto.fileUrl !== undefined && row.fileUrl && (row.fileUrl !== dto.fileUrl || dto.fileUrl === null || dto.fileUrl === '')) {
      deleteMaterialFileByUrl(row.fileUrl);
    }
    if (dto.title !== undefined) row.title = dto.title;
    if (dto.description !== undefined) row.description = dto.description;
    if (dto.fileUrl !== undefined) row.fileUrl = dto.fileUrl ?? null;
    const saved = await this.repo.save(row);
    return toResponse(saved);
  }

  async remove(id: string): Promise<boolean> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return false;
    const row = await this.repo.findOne({ where: { id: numId } });
    if (row?.fileUrl) deleteMaterialFileByUrl(row.fileUrl);
    const result = await this.repo.delete(numId);
    return (result.affected ?? 0) > 0;
  }
}
