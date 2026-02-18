import { NewsService } from './news.service';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    findAll(): import("./news.service").NewsItem[];
    findOne(id: string): import("./news.service").NewsItem | {
        error: string;
    };
}
