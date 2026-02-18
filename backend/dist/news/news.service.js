"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
let NewsService = class NewsService {
    items = [
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
    findAll() {
        return this.items;
    }
    findOne(id) {
        return this.items.find((n) => n.id === id) ?? null;
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)()
], NewsService);
//# sourceMappingURL=news.service.js.map