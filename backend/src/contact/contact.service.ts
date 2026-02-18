import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

export interface ContactItem {
  id: string;
  name: string;
  email: string;
  category?: string;
  message: string;
  createdAt: string;
}

function toResponse(row: Contact): ContactItem {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    category: row.category ?? undefined,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly repo: Repository<Contact>,
  ) {}

  async create(dto: { name: string; email: string; category?: string; message: string }): Promise<ContactItem> {
    const row = this.repo.create({
      name: dto.name,
      email: dto.email,
      category: dto.category ?? null,
      message: dto.message,
    });
    const saved = await this.repo.save(row);
    return toResponse(saved);
  }

  async findAll(): Promise<ContactItem[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map(toResponse);
  }

  async findOne(id: string): Promise<ContactItem | null> {
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
}
