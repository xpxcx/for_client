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
exports.ContactInfoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contacts_entity_1 = require("./contacts.entity");
const social_network_entity_1 = require("./social-network.entity");
let ContactInfoService = class ContactInfoService {
    contactsRepo;
    socialRepo;
    constructor(contactsRepo, socialRepo) {
        this.contactsRepo = contactsRepo;
        this.socialRepo = socialRepo;
    }
    async get() {
        const [contact] = await this.contactsRepo.find({ order: { id: 'ASC' }, take: 1 });
        const socialList = await this.socialRepo.find({ order: { id: 'ASC' } });
        return {
            phone: contact?.phone ?? null,
            email: contact?.email ?? null,
            socialNetworks: socialList.map((s) => ({ name: s.name, url: s.url })),
        };
    }
    async update(dto) {
        const [contactExisting] = await this.contactsRepo.find({ order: { id: 'ASC' }, take: 1 });
        let contact = contactExisting ?? null;
        if (!contact) {
            contact = this.contactsRepo.create({ phone: dto.phone ?? null, email: dto.email ?? null });
            await this.contactsRepo.save(contact);
        }
        else {
            if (dto.phone !== undefined)
                contact.phone = dto.phone ?? null;
            if (dto.email !== undefined)
                contact.email = dto.email ?? null;
            await this.contactsRepo.save(contact);
        }
        if (dto.socialNetworks !== undefined) {
            await this.socialRepo.clear();
            if (dto.socialNetworks.length > 0) {
                const rows = dto.socialNetworks
                    .filter((s) => s && typeof s.name === 'string' && typeof s.url === 'string' && s.name.trim() && s.url.trim())
                    .map((s) => this.socialRepo.create({ name: s.name.trim(), url: s.url.trim() }));
                if (rows.length > 0)
                    await this.socialRepo.save(rows);
            }
        }
        return this.get();
    }
};
exports.ContactInfoService = ContactInfoService;
exports.ContactInfoService = ContactInfoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contacts_entity_1.Contacts)),
    __param(1, (0, typeorm_1.InjectRepository)(social_network_entity_1.SocialNetwork)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ContactInfoService);
//# sourceMappingURL=contact-info.service.js.map