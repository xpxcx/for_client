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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs_1 = require("fs");
const path_1 = require("path");
const news_service_1 = require("../news/news.service");
const achievement_entity_1 = require("./achievement.entity");
const ACHIEVEMENTS_UPLOAD_DIR = 'achievements';
function deleteAchievementImageByUrl(url) {
    if (!url || !url.startsWith('/uploads/'))
        return;
    const relative = url.replace(/^\/uploads\//, '');
    if (!relative.startsWith(ACHIEVEMENTS_UPLOAD_DIR + '/'))
        return;
    const path = (0, path_1.join)(process.cwd(), 'uploads', relative);
    try {
        if ((0, fs_1.existsSync)(path))
            (0, fs_1.unlinkSync)(path);
    }
    catch {
    }
}
function toResponse(row) {
    return {
        id: String(row.id),
        title: row.title,
        description: row.description,
        date: row.date,
        imageUrl: row.imageUrl ?? undefined,
    };
}
let AchievementsService = class AchievementsService {
    repo;
    newsService;
    constructor(repo, newsService) {
        this.repo = repo;
        this.newsService = newsService;
    }
    async findAll() {
        const rows = await this.repo.find({ order: { date: 'DESC' } });
        return rows.map(toResponse);
    }
    async findOne(id) {
        const numId = Number(id);
        if (Number.isNaN(numId))
            return null;
        const row = await this.repo.findOne({ where: { id: numId } });
        return row ? toResponse(row) : null;
    }
    async create(dto) {
        const row = this.repo.create({
            title: dto.title,
            description: dto.description,
            date: dto.date,
            imageUrl: dto.imageUrl ?? null,
        });
        const saved = await this.repo.save(row);
        const achievementDate = new Date(dto.date);
        achievementDate.setHours(0, 0, 0, 0);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        if (achievementDate >= weekAgo) {
            try {
                await this.newsService.createFromAchievement(saved.id, dto.title, dto.description, dto.date);
            }
            catch (err) {
                console.error('Ошибка создания новости из достижения:', err);
            }
        }
        return toResponse(saved);
    }
    async update(id, dto) {
        const numId = Number(id);
        if (Number.isNaN(numId))
            return null;
        const row = await this.repo.findOne({ where: { id: numId } });
        if (!row)
            return null;
        if (dto.imageUrl !== undefined && row.imageUrl && (row.imageUrl !== dto.imageUrl || dto.imageUrl === null || dto.imageUrl === '')) {
            deleteAchievementImageByUrl(row.imageUrl);
        }
        if (dto.title !== undefined)
            row.title = dto.title;
        if (dto.description !== undefined)
            row.description = dto.description;
        if (dto.date !== undefined)
            row.date = dto.date;
        if (dto.imageUrl !== undefined)
            row.imageUrl = dto.imageUrl ?? null;
        const saved = await this.repo.save(row);
        return toResponse(saved);
    }
    async remove(id) {
        const numId = Number(id);
        if (Number.isNaN(numId))
            return false;
        const row = await this.repo.findOne({ where: { id: numId } });
        if (row?.imageUrl)
            deleteAchievementImageByUrl(row.imageUrl);
        const result = await this.repo.delete(numId);
        return (result.affected ?? 0) > 0;
    }
};
exports.AchievementsService = AchievementsService;
exports.AchievementsService = AchievementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(achievement_entity_1.Achievement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        news_service_1.NewsService])
], AchievementsService);
//# sourceMappingURL=achievements.service.js.map