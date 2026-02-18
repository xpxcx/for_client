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
exports.LinksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const useful_link_entity_1 = require("./useful-link.entity");
function toResponse(row) {
    return {
        id: String(row.id),
        title: row.title,
        url: row.url,
        description: row.description ?? undefined,
        createdAt: row.createdAt.toISOString(),
    };
}
let LinksService = class LinksService {
    repo;
    constructor(repo) {
        this.repo = repo;
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
    async create(dto) {
        const row = this.repo.create({
            title: dto.title,
            url: dto.url,
            description: dto.description ?? null,
        });
        const saved = await this.repo.save(row);
        return toResponse(saved);
    }
    async update(id, dto) {
        const numId = Number(id);
        if (Number.isNaN(numId))
            return null;
        const row = await this.repo.findOne({ where: { id: numId } });
        if (!row)
            return null;
        if (dto.title !== undefined)
            row.title = dto.title;
        if (dto.url !== undefined)
            row.url = dto.url;
        if (dto.description !== undefined)
            row.description = dto.description ?? null;
        const saved = await this.repo.save(row);
        return toResponse(saved);
    }
    async remove(id) {
        const numId = Number(id);
        if (Number.isNaN(numId))
            return false;
        const result = await this.repo.delete(numId);
        return (result.affected ?? 0) > 0;
    }
};
exports.LinksService = LinksService;
exports.LinksService = LinksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(useful_link_entity_1.UsefulLink)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LinksService);
//# sourceMappingURL=links.service.js.map