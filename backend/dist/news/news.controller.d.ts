import { NewsService } from './news.service';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    findAll(): Promise<import("./news.service").NewsItem[]>;
    findOne(id: string): Promise<import("./news.service").NewsItem | {
        error: string;
    }>;
}
