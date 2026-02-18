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
exports.ContactController = exports.ContactDto = void 0;
const common_1 = require("@nestjs/common");
class ContactDto {
    name;
    email;
    category;
    message;
}
exports.ContactDto = ContactDto;
let ContactController = class ContactController {
    send(body) {
        return { success: true, message: 'Сообщение принято' };
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ContactDto]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "send", null);
exports.ContactController = ContactController = __decorate([
    (0, common_1.Controller)('contact')
], ContactController);
//# sourceMappingURL=contact.controller.js.map