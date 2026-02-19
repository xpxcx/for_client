import { Injectable } from '@nestjs/common';

const CATEGORY_LABELS: Record<string, string> = {
  student: 'Обучающийся',
  parent: 'Родитель',
  colleague: 'Коллега',
  other: 'Другое',
}

@Injectable()
export class TelegramService {
  private readonly botToken: string | null = process.env.TELEGRAM_BOT_TOKEN ?? null;
  private readonly chatId: string | null = process.env.TELEGRAM_CHAT_ID ?? null;

  isConfigured(): boolean {
    return Boolean(this.botToken && this.chatId);
  }

  async sendContactNotification(data: {
    name: string;
    email: string;
    category?: string;
    message: string;
  }): Promise<void> {
    if (!this.botToken || !this.chatId) return;

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
}
