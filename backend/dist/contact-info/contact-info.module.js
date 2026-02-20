"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactInfoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const contacts_entity_1 = require("./contacts.entity");
const social_network_entity_1 = require("./social-network.entity");
const contact_info_service_1 = require("./contact-info.service");
const contact_info_controller_1 = require("./contact-info.controller");
let ContactInfoModule = class ContactInfoModule {
};
exports.ContactInfoModule = ContactInfoModule;
exports.ContactInfoModule = ContactInfoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([contacts_entity_1.Contacts, social_network_entity_1.SocialNetwork]), auth_module_1.AuthModule],
        controllers: [contact_info_controller_1.ContactInfoController],
        providers: [contact_info_service_1.ContactInfoService],
        exports: [contact_info_service_1.ContactInfoService],
    })
], ContactInfoModule);
//# sourceMappingURL=contact-info.module.js.map