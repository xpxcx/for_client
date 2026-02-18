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
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
const news_service_1 = require("./news.service");
let NewsController = class NewsController {
    newsService;
    constructor(newsService) {
        this.newsService = newsService;
    }
    async findAll() {
        return this.newsService.findAll();
    }
    async findOne(id) {
        const item = await this.newsService.findOne(id);
        if (!item)
            return { error: 'Not found' };
        return item;
    }
    async remove(id) {
        const ok = await this.newsService.remove(id);
        if (!ok)
            return { error: 'Not found' };
        return { success: true };
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "remove", null);
exports.NewsController = NewsController = __decorate([
    (0, common_1.Controller)('news'),
    __metadata("design:paramtypes", [news_service_1.NewsService])
], NewsController);
//# sourceMappingURL=news.controller.js.map