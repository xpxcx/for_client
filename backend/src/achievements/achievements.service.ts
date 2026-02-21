import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { NewsService } from '../news/news.service';
import { Achievement as AchievementEntity } from './achievement.entity';

const ACHIEVEMENTS_UPLOAD_DIR = 'achievements';

function deleteAchievementImageByUrl(url: string | null | undefined): void {
  if (!url || !url.startsWith('/uploads/')) return;
  const relative = url.replace(/^\/uploads\//, '');
  if (!relative.startsWith(ACHIEVEMENTS_UPLOAD_DIR + '/')) return;
  const path = join(process.cwd(), 'uploads', relative);
  try {
    if (existsSync(path)) unlinkSync(path);
  } catch {
    // ignore
  }
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
}

function toResponse(row: AchievementEntity): Achievement {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    date: row.date,
    imageUrl: row.imageUrl ?? undefined,
  };
}

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(AchievementEntity)
    private readonly repo: Repository<AchievementEntity>,
    private readonly newsService: NewsService,
  ) {}

  async findAll(): Promise<Achievement[]> {
    const rows = await this.repo.find({ order: { date: 'DESC' } });
    return rows.map(toResponse);
  }

  async findOne(id: string): Promise<Achievement | null> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    const row = await this.repo.findOne({ where: { id: numId } });
    return row ? toResponse(row) : null;
  }

  async create(dto: { title: string; description: string; date: string; imageUrl?: string }): Promise<Achievement> {
    const row = this.repo.create({
      title: dto.title,
      description: dto.description,
      date: dto.date,
      imageUrl: dto.imageUrl ?? null,
    });
    const saved = await this.repo.save(row);

    const achievementDate = new Date(dto.date);
    achievementDate.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    if (achievementDate >= weekAgo) {
      try {
        await this.newsService.createFromAchievement(saved.id, dto.title, dto.description, dto.date);
      } catch (err) {
        console.error('Ошибка создания новости из достижения:', err);
      }
    }

    return toResponse(saved);
  }

  async update(
    id: string,
    dto: Partial<{ title: string; description: string; date: string; imageUrl?: string }>,
  ): Promise<Achievement | null> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    const row = await this.repo.findOne({ where: { id: numId } });
    if (!row) return null;
    if (dto.imageUrl !== undefined && row.imageUrl && (row.imageUrl !== dto.imageUrl || dto.imageUrl === null || dto.imageUrl === '')) {
      deleteAchievementImageByUrl(row.imageUrl);
    }
    if (dto.title !== undefined) row.title = dto.title;
    if (dto.description !== undefined) row.description = dto.description;
    if (dto.date !== undefined) row.date = dto.date;
    if (dto.imageUrl !== undefined) row.imageUrl = dto.imageUrl ?? null;
    const saved = await this.repo.save(row);
    return toResponse(saved);
  }

  async remove(id: string): Promise<boolean> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return false;
    const row = await this.repo.findOne({ where: { id: numId } });
    if (row?.imageUrl) deleteAchievementImageByUrl(row.imageUrl);
    const result = await this.repo.delete(numId);
    return (result.affected ?? 0) > 0;
  }
}
