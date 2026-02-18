import { LinksService } from './links.service';
export declare class LinksController {
    private readonly linksService;
    constructor(linksService: LinksService);
    findAll(): Promise<import("./links.service").UsefulLinkItem[]>;
    findOne(id: string): Promise<import("./links.service").UsefulLinkItem | {
        error: string;
    }>;
    create(body: {
        title: string;
        url: string;
        description?: string;
    }): Promise<import("./links.service").UsefulLinkItem>;
    update(id: string, body: Partial<{
        title: string;
        url: string;
        description?: string;
    }>): Promise<import("./links.service").UsefulLinkItem | {
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
