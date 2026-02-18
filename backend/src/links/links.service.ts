import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsefulLink } from './useful-link.entity';

export interface UsefulLinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: string;
}

function toResponse(row: UsefulLink): UsefulLinkItem {
  return {
    id: String(row.id),
    title: row.title,
    url: row.url,
    description: row.description ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(UsefulLink)
    private readonly repo: Repository<UsefulLink>,
  ) {}

  async findAll(): Promise<UsefulLinkItem[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map(toResponse);
  }

  async findOne(id: string): Promise<UsefulLinkItem | null> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    const row = await this.repo.findOne({ where: { id: numId } });
    return row ? toResponse(row) : null;
  }

  async create(dto: { title: string; url: string; description?: string }): Promise<UsefulLinkItem> {
    const row = this.repo.create({
      title: dto.title,
      url: dto.url,
      description: dto.description ?? null,
    });
    const saved = await this.repo.save(row);
    return toResponse(saved);
  }

  async update(
    id: string,
    dto: Partial<{ title: string; url: string; description?: string }>,
  ): Promise<UsefulLinkItem | null> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    const row = await this.repo.findOne({ where: { id: numId } });
    if (!row) return null;
    if (dto.title !== undefined) row.title = dto.title;
    if (dto.url !== undefined) row.url = dto.url;
    if (dto.description !== undefined) row.description = dto.description ?? null;
    const saved = await this.repo.save(row);
    return toResponse(saved);
  }

  async remove(id: string): Promise<boolean> {
    const numId = Number(id);
    if (Number.isNaN(numId)) return false;
    const result = await this.repo.delete(numId);
    return (result.affected ?? 0) > 0;
  }
}
