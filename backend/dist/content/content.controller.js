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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const content_service_1 = require("./content.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const PROFILE_UPLOAD_DIR = 'profile';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
let ContentController = class ContentController {
    contentService;
    constructor(contentService) {
        this.contentService = contentService;
    }
    uploadPhoto(file) {
        if (!file)
            throw new common_1.BadRequestException('Файл не загружен или неверный тип (нужно изображение)');
        return { url: `/uploads/${PROFILE_UPLOAD_DIR}/${file.filename}` };
    }
    getSections() {
        return this.contentService.getSections();
    }
    getContent(id) {
        const content = this.contentService.getContent(id);
        if (!content) {
            return { error: 'Not found' };
        }
        return content;
    }
    updateContent(id, body) {
        const updated = this.contentService.updateContent(id, body);
        if (!updated) {
            return { error: 'Not found' };
        }
        return updated;
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Post)('upload-photo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (0, path_1.join)(process.cwd(), 'uploads', PROFILE_UPLOAD_DIR),
            filename: (_, file, cb) => {
                const ext = (file.originalname.match(/\.[^.]+$/) || ['.jpg'])[0];
                const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
                cb(null, name);
            },
        }),
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: (_, file, cb) => {
            const ok = /^image\//.test(file.mimetype);
            cb(null, !!ok);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Get)('sections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getSections", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "getContent", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateContent", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.Controller)('content'),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map