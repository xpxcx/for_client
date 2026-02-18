import { Repository } from 'typeorm';
import { News } from './news.entity';
export interface NewsItem {
    id: string;
    date: string;
    title: string;
    text: string;
}
export declare class NewsService {
    private readonly repo;
    constructor(repo: Repository<News>);
    findAll(): Promise<NewsItem[]>;
    findOne(id: string): Promise<NewsItem | null>;
    remove(id: string): Promise<boolean>;
    createFromAchievement(achievementId: number, title: string, description: string, date: string): Promise<NewsItem>;
}
