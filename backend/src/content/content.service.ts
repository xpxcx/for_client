import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { AboutProfile } from './entities/about-profile.entity';
import { AboutEducation } from './entities/about-education.entity';
import { AboutExperience } from './entities/about-experience.entity';
import { AboutBody } from './entities/about-body.entity';
import { MenuSection } from './entities/menu-section.entity';
import { SectionItemEntity } from './entities/section-item.entity';

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
  constructor(
    @InjectRepository(AboutProfile) private readonly aboutProfileRepo: Repository<AboutProfile>,
    @InjectRepository(AboutEducation) private readonly aboutEducationRepo: Repository<AboutEducation>,
    @InjectRepository(AboutExperience) private readonly aboutExperienceRepo: Repository<AboutExperience>,
    @InjectRepository(AboutBody) private readonly aboutBodyRepo: Repository<AboutBody>,
    @InjectRepository(MenuSection) private readonly menuSectionRepo: Repository<MenuSection>,
    @InjectRepository(SectionItemEntity) private readonly sectionItemRepo: Repository<SectionItemEntity>,
  ) {}

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

  async onModuleInit() {
    try {
      const data = readFileSync(CONTENT_FILE, 'utf-8');
      const loaded = JSON.parse(data) as Record<string, SectionContent>;
      for (const id of Object.keys(loaded)) {
        if (id === 'about') continue;
        if (this.content[id] && loaded[id]) {
          Object.assign(this.content[id], loaded[id]);
        }
      }
    } catch {
      //
    }
    await this.ensureAboutProfile();
    await this.ensureMenuSections();
  }

  private async ensureMenuSections() {
    const count = await this.menuSectionRepo.count();
    if (count === 0) {
      for (let i = 0; i < DEFAULT_SECTIONS.length; i++) {
        const s = DEFAULT_SECTIONS[i];
        await this.menuSectionRepo.save(
          this.menuSectionRepo.create({
            id: s.id,
            title: s.title,
            path: s.path,
            description: s.description ?? null,
            sortOrder: i,
          }),
        );
      }
    }
  }

  private async ensureAboutProfile() {
    const count = await this.aboutProfileRepo.count();
    if (count === 0) {
      const profile = this.aboutProfileRepo.create({
        pageTitle: 'Раздел о себе',
        fullName: null,
        birthDate: null,
        imageUrl: null,
      });
      await this.aboutProfileRepo.save(profile);
    }
  }

  private async getAboutFromDb(): Promise<SectionContent | null> {
    const [profile] = await this.aboutProfileRepo.find({ order: { id: 'ASC' }, take: 1 });
    if (!profile) return null;
    const educationRows = await this.aboutEducationRepo.find({ order: { sortOrder: 'ASC' } });
    const experienceRows = await this.aboutExperienceRepo.find({ order: { sortOrder: 'ASC' } });
    const bodyRows = await this.aboutBodyRepo.find({ order: { sortOrder: 'ASC' } });
    const education = JSON.stringify(
      educationRows.map((e) => ({ institution: e.institution, document: e.document, qualification: e.qualification })),
    );
    const experience = JSON.stringify(
      experienceRows.map((e) => ({ placeOfWork: e.placeOfWork, position: e.position, period: e.period })),
    );
    const body = JSON.stringify(bodyRows.map((b) => ({ title: b.title, description: b.description })));
    return {
      id: 'about',
      title: profile.pageTitle,
      body,
      fullName: profile.fullName ?? undefined,
      birthDate: profile.birthDate ?? undefined,
      imageUrl: profile.imageUrl ?? undefined,
      education,
      experience,
    };
  }

  private async updateAboutInDb(dto: {
    title?: string;
    body?: string;
    fullName?: string;
    birthDate?: string;
    imageUrl?: string;
    education?: string;
    experience?: string;
  }): Promise<SectionContent | null> {
    const [profile] = await this.aboutProfileRepo.find({ order: { id: 'ASC' }, take: 1 });
    if (!profile) return null;
    if (dto.imageUrl !== undefined && profile.imageUrl && (profile.imageUrl !== dto.imageUrl || dto.imageUrl === '' || dto.imageUrl === null)) {
      deleteProfilePhotoByUrl(profile.imageUrl);
    }
    if (dto.title !== undefined) profile.pageTitle = dto.title;
    if (dto.fullName !== undefined) profile.fullName = dto.fullName;
    if (dto.birthDate !== undefined) profile.birthDate = dto.birthDate;
    if (dto.imageUrl !== undefined) profile.imageUrl = dto.imageUrl ?? null;
    await this.aboutProfileRepo.save(profile);

    if (dto.education !== undefined) {
      await this.aboutEducationRepo.delete({});
      const arr = (() => {
        try {
          const parsed = JSON.parse(dto.education);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();
      for (let i = 0; i < arr.length; i++) {
        const o = arr[i];
        const e = this.aboutEducationRepo.create({
          sortOrder: i,
          institution: o?.institution ?? '',
          document: o?.document ?? '',
          qualification: o?.qualification ?? '',
        });
        await this.aboutEducationRepo.save(e);
      }
    }
    if (dto.experience !== undefined) {
      await this.aboutExperienceRepo.delete({});
      const arr = (() => {
        try {
          const parsed = JSON.parse(dto.experience);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();
      for (let i = 0; i < arr.length; i++) {
        const o = arr[i];
        const e = this.aboutExperienceRepo.create({
          sortOrder: i,
          placeOfWork: o?.placeOfWork ?? '',
          position: o?.position ?? '',
          period: o?.period ?? '',
        });
        await this.aboutExperienceRepo.save(e);
      }
    }
    if (dto.body !== undefined) {
      await this.aboutBodyRepo.delete({});
      const arr = (() => {
        try {
          const parsed = JSON.parse(dto.body);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();
      for (let i = 0; i < arr.length; i++) {
        const o = arr[i];
        const b = this.aboutBodyRepo.create({
          sortOrder: i,
          title: o?.title ?? '',
          description: o?.description ?? '',
        });
        await this.aboutBodyRepo.save(b);
      }
    }
    return this.getAboutFromDb();
  }

  private static readonly NON_DELETABLE_SECTION_IDS = new Set(['about', 'achievements', 'materials', 'news', 'contact']);

  async getSections(): Promise<Section[]> {
    const rows = await this.menuSectionRepo.find({ order: { sortOrder: 'ASC' } });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      path: r.path,
      description: r.description ?? undefined,
    }));
  }

  async setSections(sections: Section[]): Promise<Section[]> {
    const valid = sections.filter((s) => s && typeof s.id === 'string' && typeof s.title === 'string' && typeof s.path === 'string' && String(s.path).startsWith('/'));
    const fromClient = valid.length > 0 ? valid : [];
    const currentRows = await this.menuSectionRepo.find({ order: { sortOrder: 'ASC' } });
    const clientById = new Map(fromClient.map((s) => [s.id, s]));
    const result: Section[] = [];
    for (const row of currentRows) {
      if (ContentService.NON_DELETABLE_SECTION_IDS.has(row.id)) {
        result.push({ id: row.id, title: row.title, path: row.path, description: row.description ?? undefined });
      } else if (clientById.has(row.id)) {
        result.push(clientById.get(row.id)!);
      } else {
        const items = await this.sectionItemRepo.find({ where: { sectionId: row.id } });
        for (const item of items) deleteSectionFileByUrl(item.link);
        await this.sectionItemRepo.delete({ sectionId: row.id });
      }
    }
    for (const s of fromClient) {
      if (!result.some((r) => r.id === s.id)) result.push(s);
    }
    const final = result.length > 0 ? result : [...DEFAULT_SECTIONS];
    await this.menuSectionRepo.clear();
    for (let i = 0; i < final.length; i++) {
      await this.menuSectionRepo.save(
        this.menuSectionRepo.create({
          id: final[i].id,
          title: final[i].title,
          path: final[i].path,
          description: final[i].description ?? null,
          sortOrder: i,
        }),
      );
    }
    return final;
  }

  private saveToFile() {
    try {
      mkdirSync(dirname(CONTENT_FILE), { recursive: true });
      writeFileSync(CONTENT_FILE, JSON.stringify(this.content, null, 2), 'utf-8');
    } catch {
      // игнорируем ошибки записи
    }
  }

  async getSectionItems(sectionId: string): Promise<SectionItem[]> {
    const rows = await this.sectionItemRepo.find({ where: { sectionId }, order: { sortOrder: 'ASC' } });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? undefined,
      link: r.link ?? undefined,
    }));
  }

  async addSectionItem(sectionId: string, dto: { title: string; description?: string; link?: string }): Promise<SectionItem | null> {
    if (!sectionId || !dto?.title || typeof dto.title !== 'string') return null;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const count = await this.sectionItemRepo.count({ where: { sectionId } });
    const entity = this.sectionItemRepo.create({
      id,
      sectionId,
      title: dto.title.trim(),
      description: dto.description != null ? String(dto.description).trim() : null,
      link: dto.link != null ? String(dto.link).trim() : null,
      sortOrder: count,
    });
    await this.sectionItemRepo.save(entity);
    return { id, title: entity.title, description: entity.description ?? undefined, link: entity.link ?? undefined };
  }

  async updateSectionItem(sectionId: string, itemId: string, dto: { title?: string; description?: string; link?: string }): Promise<SectionItem | null> {
    const entity = await this.sectionItemRepo.findOne({ where: { id: itemId, sectionId } });
    if (!entity) return null;
    if (dto.title !== undefined) entity.title = dto.title.trim();
    if (dto.description !== undefined) entity.description = dto.description ? String(dto.description).trim() : null;
    if (dto.link !== undefined) {
      const oldLink = entity.link;
      entity.link = dto.link ? String(dto.link).trim() : null;
      if (oldLink && (oldLink !== entity.link || !entity.link)) deleteSectionFileByUrl(oldLink);
    }
    await this.sectionItemRepo.save(entity);
    return { id: entity.id, title: entity.title, description: entity.description ?? undefined, link: entity.link ?? undefined };
  }

  async deleteSectionItem(sectionId: string, itemId: string): Promise<boolean> {
    const entity = await this.sectionItemRepo.findOne({ where: { id: itemId, sectionId } });
    if (!entity) return false;
    deleteSectionFileByUrl(entity.link);
    await this.sectionItemRepo.delete({ id: itemId });
    return true;
  }

  async getContent(id: string): Promise<SectionContent | null> {
    if (id === 'about') return this.getAboutFromDb();
    return this.content[id] ?? null;
  }

  async updateContent(
    id: string,
    dto: { title?: string; body?: string; fullName?: string; birthDate?: string; imageUrl?: string; education?: string; experience?: string },
  ): Promise<SectionContent | null> {
    if (id === 'about') return this.updateAboutInDb(dto);
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
