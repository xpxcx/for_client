"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncNewsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
const materials_service_1 = require("../materials/materials.service");
const links_service_1 = require("../links/links.service");
const news_service_1 = require("../news/news.service");
let SyncNewsController = class SyncNewsController {
    newsService;
    materialsService;
    linksService;
    constructor(newsService, materialsService, linksService) {
        this.newsService = newsService;
        this.materialsService = materialsService;
        this.linksService = linksService;
    }
    async syncExisting() {
        const materials = await this.materialsService.findAll();
        let created = 0;
        for (const m of materials) {
            const has = await this.newsService.hasNewsForMaterial(Number(m.id));
            if (!has) {
                const dateStr = m.createdAt.slice(0, 10);
                await this.newsService.createFromMaterial(Number(m.id), m.title, m.description, dateStr);
                created++;
            }
        }
        const links = await this.linksService.findAll();
        for (const l of links) {
            const has = await this.newsService.hasNewsForLink(Number(l.id));
            if (!has) {
                const dateStr = l.createdAt.slice(0, 10);
                await this.newsService.createFromLink(Number(l.id), l.title, l.url, l.description, dateStr);
                created++;
            }
        }
        return { success: true, created };
    }
};
exports.SyncNewsController = SyncNewsController;
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncNewsController.prototype, "syncExisting", null);
exports.SyncNewsController = SyncNewsController = __decorate([
    (0, common_1.Controller)('news'),
    __metadata("design:paramtypes", [news_service_1.NewsService,
        materials_service_1.MaterialsService,
        links_service_1.LinksService])
], SyncNewsController);
//# sourceMappingURL=sync-news.controller.js.map