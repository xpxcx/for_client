import { Repository } from 'typeorm';
import { News } from './news.entity';
export interface NewsItem {
    id: string;
    date: string;
    title: string;
    text: string;
    sourceType: string | null;
}
export declare class NewsService {
    private readonly repo;
    constructor(repo: Repository<News>);
    findAll(): Promise<NewsItem[]>;
    findOne(id: string): Promise<NewsItem | null>;
    remove(id: string): Promise<boolean>;
    createFromAchievement(achievementId: number, title: string, description: string, date: string): Promise<NewsItem>;
    createFromMaterial(materialId: number, title: string, description: string, date: string): Promise<NewsItem>;
    createFromLink(linkId: number, title: string, url: string, description: string | undefined, date: string): Promise<NewsItem>;
    hasNewsForMaterial(materialId: number): Promise<boolean>;
    hasNewsForLink(linkId: number): Promise<boolean>;
}
