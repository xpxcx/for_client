import { MaterialsService } from './materials.service';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    uploadFile(file: Express.Multer.File): {
        fileUrl: string;
    };
    findAll(): Promise<import("./materials.service").MaterialItem[]>;
    findOne(id: string): Promise<import("./materials.service").MaterialItem | {
        error: string;
    }>;
    create(body: {
        title: string;
        description: string;
        fileUrl?: string;
    }): Promise<import("./materials.service").MaterialItem>;
    update(id: string, body: Partial<{
        title: string;
        description: string;
        fileUrl?: string;
    }>): Promise<import("./materials.service").MaterialItem | {
        error: string;
    }>;
    remove(id: string): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
}
