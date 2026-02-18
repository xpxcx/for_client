import { Injectable } from '@nestjs/common';

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  text: string;
}

@Injectable()
export class NewsService {
  private readonly items: NewsItem[] = [
    {
      id: '1',
      date: '2026-02-15',
      title: 'Обновление материалов',
      text: 'Добавлены новые материалы открытых уроков и методические разработки.',
    },
    {
      id: '2',
      date: '2026-02-10',
      title: 'Участие в конференции',
      text: 'Принял участие в региональной конференции педагогов. Материалы доступны в разделе «Материалы».',
    },
    {
      id: '3',
      date: '2026-02-05',
      title: 'Достижения учеников',
      text: 'Поздравляем учеников с победой в городской олимпиаде!',
    },
  ];

  findAll(): NewsItem[] {
    return this.items;
  }

  findOne(id: string): NewsItem | null {
    return this.items.find((n) => n.id === id) ?? null;
  }
}
