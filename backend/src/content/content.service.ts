import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';

export interface Section {
  id: string;
  title: string;
  path: string;
  description?: string;
}

export interface SectionItem {
  id: string;
  title: string;
  description?: string;
  link?: string;
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
const MENU_FILE = join(process.cwd(), 'data', 'menu.json');
const SECTION_CONTENT_FILE = join(process.cwd(), 'data', 'section-content.json');
const PROFILE_UPLOAD_DIR = 'profile';
const SECTION_FILES_UPLOAD_DIR = 'section-files';

const DEFAULT_SECTIONS: Section[] = [
  { id: 'about', title: 'О себе', path: '/' },
  { id: 'achievements', title: 'Достижения', path: '/achievements' },
  { id: 'materials', title: 'Материалы', path: '/materials' },
  { id: 'news', title: 'Новости', path: '/news' },
  { id: 'contact', title: 'Контакты', path: '/contact' },
  { id: 'links', title: 'Полезные ссылки', path: '/links' },
];

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

function deleteSectionFileByUrl(url: string | null | undefined): void {
  if (!url || !url.startsWith('/uploads/')) return;
  const relative = url.replace(/^\/uploads\//, '');
  if (!relative.startsWith(SECTION_FILES_UPLOAD_DIR + '/')) return;
  const filePath = join(process.cwd(), 'uploads', relative);
  try {
    if (existsSync(filePath)) unlinkSync(filePath);
  } catch {
    // ignore
  }
}

@Injectable()
export class ContentService implements OnModuleInit {
  private sections: Section[] = [...DEFAULT_SECTIONS];
  private sectionItems: Record<string, SectionItem[]> = {};

  private readonly content: Record<string, SectionContent> = {
    home: {
      id: 'home',
      title: 'Крумова Эльмира Мамедовна',
      body: 'Крумова Эльмира Мамедовна',
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
    try {
      const menuData = readFileSync(MENU_FILE, 'utf-8');
      const arr = JSON.parse(menuData) as Section[];
      if (Array.isArray(arr) && arr.length > 0) {
        this.sections = arr.filter((s) => s && typeof s.id === 'string' && typeof s.title === 'string' && typeof s.path === 'string');
        if (this.sections.length === 0) this.sections = [...DEFAULT_SECTIONS];
      }
    } catch {
      // файла нет — sections уже по умолчанию
    }
    try {
      const sectionData = readFileSync(SECTION_CONTENT_FILE, 'utf-8');
      const loaded = JSON.parse(sectionData) as Record<string, SectionItem[]>;
      if (loaded && typeof loaded === 'object') {
        this.sectionItems = loaded;
      }
    } catch {
      //
    }
  }

  private saveSectionItems() {
    try {
      mkdirSync(dirname(SECTION_CONTENT_FILE), { recursive: true });
      writeFileSync(SECTION_CONTENT_FILE, JSON.stringify(this.sectionItems, null, 2), 'utf-8');
    } catch {
      //
    }
  }

  private saveMenu() {
    try {
      mkdirSync(dirname(MENU_FILE), { recursive: true });
      writeFileSync(MENU_FILE, JSON.stringify(this.sections, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }

  private static readonly NON_DELETABLE_SECTION_IDS = new Set(['about', 'achievements', 'materials', 'news', 'contact']);

  setSections(sections: Section[]) {
    const valid = sections.filter((s) => s && typeof s.id === 'string' && typeof s.title === 'string' && typeof s.path === 'string' && String(s.path).startsWith('/'));
    const fromClient = valid.length > 0 ? valid : [];
    const clientById = new Map(fromClient.map((s) => [s.id, s]));
    const result: Section[] = [];
    for (const s of this.sections) {
      if (ContentService.NON_DELETABLE_SECTION_IDS.has(s.id)) {
        result.push(s);
      } else if (clientById.has(s.id)) {
        result.push(clientById.get(s.id)!);
      } else {
        const items = this.sectionItems[s.id];
        if (Array.isArray(items)) {
          for (const item of items) deleteSectionFileByUrl(item.link);
          delete this.sectionItems[s.id];
        }
      }
    }
    for (const s of fromClient) {
      if (!result.some((r) => r.id === s.id)) result.push(s);
    }
    this.sections = result.length > 0 ? result : [...DEFAULT_SECTIONS];
    this.saveMenu();
    this.saveSectionItems();
    return this.sections;
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

  getSectionItems(sectionId: string): SectionItem[] {
    const list = this.sectionItems[sectionId];
    return Array.isArray(list) ? [...list] : [];
  }

  addSectionItem(sectionId: string, dto: { title: string; description?: string; link?: string }): SectionItem | null {
    if (!sectionId || !dto?.title || typeof dto.title !== 'string') return null;
    const list = this.sectionItems[sectionId] ?? [];
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const item: SectionItem = {
      id,
      title: dto.title.trim(),
      description: dto.description != null ? String(dto.description).trim() : undefined,
      link: dto.link != null ? String(dto.link).trim() : undefined,
    };
    this.sectionItems[sectionId] = [...list, item];
    this.saveSectionItems();
    return item;
  }

  updateSectionItem(sectionId: string, itemId: string, dto: { title?: string; description?: string; link?: string }): SectionItem | null {
    const list = this.sectionItems[sectionId];
    if (!Array.isArray(list)) return null;
    const idx = list.findIndex((i) => i.id === itemId);
    if (idx < 0) return null;
    const item = { ...list[idx] };
    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.description !== undefined) item.description = dto.description ? String(dto.description).trim() : undefined;
    if (dto.link !== undefined) {
      const oldLink = item.link;
      item.link = dto.link ? String(dto.link).trim() : undefined;
      if (oldLink && (oldLink !== item.link || !item.link)) deleteSectionFileByUrl(oldLink);
    }
    list[idx] = item;
    this.saveSectionItems();
    return item;
  }

  deleteSectionItem(sectionId: string, itemId: string): boolean {
    const list = this.sectionItems[sectionId];
    if (!Array.isArray(list)) return false;
    const found = list.find((i) => i.id === itemId);
    if (!found) return false;
    deleteSectionFileByUrl(found.link);
    this.sectionItems[sectionId] = list.filter((i) => i.id !== itemId);
    this.saveSectionItems();
    return true;
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
