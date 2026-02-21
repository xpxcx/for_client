"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const CONTENT_FILE = (0, path_1.join)(process.cwd(), 'data', 'content.json');
const PROFILE_UPLOAD_DIR = 'profile';
function deleteProfilePhotoByUrl(url) {
    if (!url || !url.startsWith('/uploads/'))
        return;
    const relative = url.replace(/^\/uploads\//, '');
    if (!relative.startsWith(PROFILE_UPLOAD_DIR + '/'))
        return;
    const filePath = (0, path_1.join)(process.cwd(), 'uploads', relative);
    try {
        if ((0, fs_1.existsSync)(filePath))
            (0, fs_1.unlinkSync)(filePath);
    }
    catch {
    }
}
let ContentService = class ContentService {
    sections = [
        { id: 'about', title: 'О себе', path: '/about' },
        { id: 'materials', title: 'Материалы', path: '/materials' },
        { id: 'achievements', title: 'Достижения', path: '/achievements' },
        { id: 'news', title: 'Новости', path: '/news' },
        { id: 'contact', title: 'Контакты', path: '/contact' },
        { id: 'links', title: 'Полезные ссылки', path: '/links' },
    ];
    content = {
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
            const data = (0, fs_1.readFileSync)(CONTENT_FILE, 'utf-8');
            const loaded = JSON.parse(data);
            for (const id of Object.keys(loaded)) {
                if (this.content[id] && loaded[id]) {
                    Object.assign(this.content[id], loaded[id]);
                }
            }
        }
        catch {
        }
    }
    saveToFile() {
        try {
            (0, fs_1.mkdirSync)((0, path_1.dirname)(CONTENT_FILE), { recursive: true });
            (0, fs_1.writeFileSync)(CONTENT_FILE, JSON.stringify(this.content, null, 2), 'utf-8');
        }
        catch {
        }
    }
    getSections() {
        return this.sections;
    }
    getContent(id) {
        return this.content[id] ?? null;
    }
    updateContent(id, dto) {
        const item = this.content[id];
        if (!item)
            return null;
        if (dto.imageUrl !== undefined && item.imageUrl && (item.imageUrl !== dto.imageUrl || dto.imageUrl === '' || dto.imageUrl === null)) {
            deleteProfilePhotoByUrl(item.imageUrl);
        }
        if (dto.title !== undefined)
            item.title = dto.title;
        if (dto.body !== undefined)
            item.body = dto.body;
        if (dto.fullName !== undefined)
            item.fullName = dto.fullName;
        if (dto.birthDate !== undefined)
            item.birthDate = dto.birthDate;
        if (dto.imageUrl !== undefined)
            item.imageUrl = dto.imageUrl ?? '';
        if (dto.education !== undefined)
            item.education = dto.education;
        if (dto.experience !== undefined)
            item.experience = dto.experience;
        this.saveToFile();
        return item;
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)()
], ContentService);
//# sourceMappingURL=content.service.js.map