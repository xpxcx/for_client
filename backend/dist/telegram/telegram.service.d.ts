export declare class TelegramService {
    private readonly botToken;
    private readonly chatId;
    isConfigured(): boolean;
    sendContactNotification(data: {
        name: string;
        email: string;
        category?: string;
        message: string;
    }): Promise<void>;
}
