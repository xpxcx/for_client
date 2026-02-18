import { Injectable } from '@nestjs/common';

export interface Section {
  id: string;
  title: string;
  path: string;
}

export interface SectionContent {
  id: string;
  title: string;
  body: string;
}

@Injectable()
export class ContentService {
  private readonly sections: Section[] = [
    { id: 'home', title: 'Главная', path: '/' },
    { id: 'about', title: 'О себе', path: '/about' },
    { id: 'materials', title: 'Материалы', path: '/materials' },
    { id: 'achievements', title: 'Достижения', path: '/achievements' },
    { id: 'news', title: 'Новости', path: '/news' },
    { id: 'contact', title: 'Контакты', path: '/contact' },
    { id: 'links', title: 'Полезные ссылки', path: '/links' },
    { id: 'cabinet', title: 'Личный кабинет', path: '/cabinet' },
  ];

  private readonly content: Record<string, SectionContent> = {
    home: {
      id: 'home',
      title: 'Добро пожаловать',
      body: 'Сайт-портфолио педагога. Используйте меню для навигации.',
    },
    about: {
      id: 'about',
      title: 'О себе',
      body: 'Информация о профессиональной деятельности, образовании и опыте работы.',
    },
    materials: {
      id: 'materials',
      title: 'Материалы уроков и мероприятий',
      body: 'Открытые уроки, видеоматериалы, фотогалерея, презентации и документы.',
    },
    achievements: {
      id: 'achievements',
      title: 'Достижения',
      body: 'Достижения педагога и обучающихся: олимпиады, конкурсы, проекты.',
    },
    news: {
      id: 'news',
      title: 'Новости',
      body: 'Актуальная информация и обновления.',
    },
    contact: {
      id: 'contact',
      title: 'Обратная связь',
      body: 'Контактные данные и форма обратной связи.',
    },
    links: {
      id: 'links',
      title: 'Полезные ссылки',
      body: 'Профессиональные сообщества и рекомендуемые сервисы.',
    },
  };

  getSections(): Section[] {
    return this.sections;
  }

  getContent(id: string): SectionContent | null {
    return this.content[id] ?? null;
  }
}
