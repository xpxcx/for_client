import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './news.entity';

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  text: string;
}

function toResponse(row: News): NewsItem {
  return {
    id: String(row.id),
    date: row.date,
    title: row.title,
    text: row.text,
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
      achievementId,
    });
    const saved = await this.repo.save(row);
    return toResponse(saved);
  }
}
