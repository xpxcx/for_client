"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const CATEGORY_LABELS = {
    student: 'Обучающийся',
    parent: 'Родитель',
    colleague: 'Коллега',
    other: 'Другое',
};
let TelegramService = class TelegramService {
    botToken = process.env.TELEGRAM_BOT_TOKEN ?? null;
    chatId = process.env.TELEGRAM_CHAT_ID ?? null;
    isConfigured() {
        return Boolean(this.botToken && this.chatId);
    }
    async sendContactNotification(data) {
        if (!this.botToken || !this.chatId)
            return;
        const categoryLabel = data.category ? (CATEGORY_LABELS[data.category] ?? data.category) : '';
        const text = [
            'Новая заявка с формы обратной связи:',
            '',
            `ФИО: ${data.name}`,
            `Email: ${data.email}`,
            categoryLabel ? `Роль отправителя: ${categoryLabel}` : '',
            'Сообщение:',
            data.message,
        ]
            .filter(Boolean)
            .join('\n');
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: this.chatId,
                text,
                disable_web_page_preview: true,
            }),
        });
        if (!res.ok) {
            const err = await res.text();
            console.error('[Telegram] sendMessage failed:', res.status, err);
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)()
], TelegramService);
//# sourceMappingURL=telegram.service.js.map