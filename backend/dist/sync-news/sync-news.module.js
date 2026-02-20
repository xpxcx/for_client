"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncNewsModule = void 0;
const common_1 = require("@nestjs/common");
const news_module_1 = require("../news/news.module");
const materials_module_1 = require("../materials/materials.module");
const links_module_1 = require("../links/links.module");
const sync_news_controller_1 = require("./sync-news.controller");
let SyncNewsModule = class SyncNewsModule {
};
exports.SyncNewsModule = SyncNewsModule;
exports.SyncNewsModule = SyncNewsModule = __decorate([
    (0, common_1.Module)({
        imports: [news_module_1.NewsModule, materials_module_1.MaterialsModule, links_module_1.LinksModule],
        controllers: [sync_news_controller_1.SyncNewsController],
    })
], SyncNewsModule);
//# sourceMappingURL=sync-news.module.js.map