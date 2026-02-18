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
let ContentService = class ContentService {
    sections = [
        { id: 'home', title: 'Главная', path: '/' },
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
    getSections() {
        return this.sections;
    }
    getContent(id) {
        return this.content[id] ?? null;
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)()
], ContentService);
//# sourceMappingURL=content.service.js.map