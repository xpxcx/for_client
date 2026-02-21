import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';

export interface Section {
  id: string;
  title: string;
  path: string;
}

export interface SectionContent {
  id: string;
  title: string;
  body: string;
  fullName?: string;
  birthDate?: string;
  imageUrl?: string;
  education?: string;
  experience?: string;
}

const CONTENT_FILE = join(process.cwd(), 'data', 'content.json');
const PROFILE_UPLOAD_DIR = 'profile';

function deleteProfilePhotoByUrl(url: string | null | undefined): void {
  if (!url || !url.startsWith('/uploads/')) return;
  const relative = url.replace(/^\/uploads\//, '');
  if (!relative.startsWith(PROFILE_UPLOAD_DIR + '/')) return;
  const filePath = join(process.cwd(), 'uploads', relative);
  try {
    if (existsSync(filePath)) unlinkSync(filePath);
  } catch {
    // ignore
  }
}

@Injectable()
export class ContentService implements OnModuleInit {
  private readonly sections: Section[] = [
    { id: 'about', title: 'О себе', path: '/about' },
    { id: 'materials', title: 'Материалы', path: '/materials' },
    { id: 'achievements', title: 'Достижения', path: '/achievements' },
    { id: 'news', title: 'Новости', path: '/news' },
    { id: 'contact', title: 'Контакты', path: '/contact' },
    { id: 'links', title: 'Полезные ссылки', path: '/links' },
  ];

  private readonly content: Record<string, SectionContent> = {
    home: {
      id: 'home',
      title: 'Добро пожаловать',
      body: 'Сайт-портфолио педагога. Используйте меню для навигации.',
    },
    about: {
      id: 'about',
      title: 'Раздел о себе',
      body: 'Информация о профессиональной деятельности, образовании и опыте работы. Здесь можно разместить краткую биографию, образование, квалификацию, стаж, направления работы и профессиональные интересы.',
      fullName: '',
      birthDate: '',
      imageUrl: '',
      education: '',
      experience: '',
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

  onModuleInit() {
    try {
      const data = readFileSync(CONTENT_FILE, 'utf-8');
      const loaded = JSON.parse(data) as Record<string, SectionContent>;
      for (const id of Object.keys(loaded)) {
        if (this.content[id] && loaded[id]) {
          Object.assign(this.content[id], loaded[id]);
        }
      }
    } catch {
      // файла нет или ошибка — используем значения по умолчанию
    }
  }

  private saveToFile() {
    try {
      mkdirSync(dirname(CONTENT_FILE), { recursive: true });
      writeFileSync(CONTENT_FILE, JSON.stringify(this.content, null, 2), 'utf-8');
    } catch {
      // игнорируем ошибки записи
    }
  }

  getSections(): Section[] {
    return this.sections;
  }

  getContent(id: string): SectionContent | null {
    return this.content[id] ?? null;
  }

  updateContent(
    id: string,
    dto: { title?: string; body?: string; fullName?: string; birthDate?: string; imageUrl?: string; education?: string; experience?: string },
  ): SectionContent | null {
    const item = this.content[id];
    if (!item) return null;
    if (dto.imageUrl !== undefined && item.imageUrl && (item.imageUrl !== dto.imageUrl || dto.imageUrl === '' || dto.imageUrl === null)) {
      deleteProfilePhotoByUrl(item.imageUrl);
    }
    if (dto.title !== undefined) item.title = dto.title;
    if (dto.body !== undefined) item.body = dto.body;
    if (dto.fullName !== undefined) item.fullName = dto.fullName;
    if (dto.birthDate !== undefined) item.birthDate = dto.birthDate;
    if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl ?? '';
    if (dto.education !== undefined) item.education = dto.education;
    if (dto.experience !== undefined) item.experience = dto.experience;
    this.saveToFile();
    return item;
  }
}
