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
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contact_entity_1 = require("./contact.entity");
const telegram_service_1 = require("../telegram/telegram.service");
function toResponse(row) {
    return {
        id: String(row.id),
        name: row.name,
        email: row.email,
        category: row.category ?? undefined,
        message: row.message,
        createdAt: row.createdAt.toISOString(),
    };
}
let ContactService = class ContactService {
    repo;
    telegram;
    constructor(repo, telegram) {
        this.repo = repo;
        this.telegram = telegram;
    }
    async create(dto) {
        const row = this.repo.create({
            name: dto.name,
            email: dto.email,
            category: dto.category ?? null,
            message: dto.message,
        });
        const saved = await this.repo.save(row);
        if (this.telegram.isConfigured()) {
            this.telegram.sendContactNotification(dto).catch((err) => {
                console.error('[Contact] Telegram notification failed:', err);
            });
        }
        return toResponse(saved);
    }
    async findAll() {
        const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
        return rows.map(toResponse);
    }
    async findOne(id) {
        const numId = Number(id);
        if (Number.isNaN(numId))
            return null;
        const row = await this.repo.findOne({ where: { id: numId } });
        return row ? toResponse(row) : null;
    }
    async remove(id) {
        const numId = Number(id);
        if (Number.isNaN(numId))
            return false;
        const result = await this.repo.delete(numId);
        return (result.affected ?? 0) > 0;
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        telegram_service_1.TelegramService])
], ContactService);
//# sourceMappingURL=contact.service.js.map