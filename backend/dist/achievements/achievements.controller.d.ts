import { AchievementsService } from './achievements.service';
export declare class AchievementsController {
    private readonly achievementsService;
    constructor(achievementsService: AchievementsService);
    uploadFile(file: Express.Multer.File): {
        imageUrl: string;
    };
    findAll(): Promise<import("./achievements.service").Achievement[]>;
    findOne(id: string): Promise<import("./achievements.service").Achievement | null> | {
        error: string;
    };
    create(body: {
        title: string;
        description: string;
        date: string;
        imageUrl?: string;
    }): Promise<import("./achievements.service").Achievement>;
    update(id: string, body: Partial<{
        title: string;
        description: string;
        date: string;
        imageUrl?: string;
    }>): Promise<import("./achievements.service").Achievement | null> | {
        error: string;
    };
    remove(id: string): {
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    };
}
