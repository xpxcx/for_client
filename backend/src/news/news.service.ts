import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './news.entity';

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  text: string;
  sourceType: string | null;
}

function toResponse(row: News): NewsItem {
  return {
    id: String(row.id),
    date: row.date,
    title: row.title,
    text: row.text,
    sourceType: row.sourceType ?? (row.achievementId != null ? 'achievement' : null),
  };
}

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly repo: Repository<News>,
  ) {}

  async findAll(): Promise<NewsItem[]> {
    const rows = await this.repo.find({ order: { date: 'DESC' } });
    return rows.map(toResponse);
  }

  async findOne(id: string): Promise<NewsItem | null> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    const row = await this.repo.findOne({ where: { id: numId } });
    return row ? toResponse(row) : null;
  }

  async remove(id: string): Promise<boolean> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return false;
    const result = await this.repo.delete(numId);
    return (result.affected ?? 0) > 0;
  }

  async createFromAchievement(
    achievementId: number,
    title: string,
    description: string,
    date: string,
  ): Promise<NewsItem> {
    const row = this.repo.create({
      title,
      text: description || title,
      date,
      sourceType: 'achievement',
      achievementId,
    });
    const saved = await this.repo.save(row);
    return toResponse(saved);
  }

  async createFromMaterial(
    materialId: number,
    title: string,
    description: string,
    date: string,
  ): Promise<NewsItem> {
    const row = this.repo.create({
      title,
      text: description || title,
      date,
      sourceType: 'material',
      materialId,
    });
    const saved = await this.repo.save(row);
    return toResponse(saved);
  }

  async createFromLink(
    linkId: number,
    title: string,
    url: string,
    description: string | undefined,
    date: string,
  ): Promise<NewsItem> {
    const text = description ? `${description}\n${url}` : url;
    const row = this.repo.create({
      title,
      text,
      date,
      sourceType: 'link',
      linkId,
    });
    const saved = await this.repo.save(row);
    return toResponse(saved);
  }

  async hasNewsForMaterial(materialId: number): Promise<boolean> {
    const count = await this.repo.count({ where: { materialId } });
    return count > 0;
  }

  async hasNewsForLink(linkId: number): Promise<boolean> {
    const count = await this.repo.count({ where: { linkId } });
    return count > 0;
  }
}
