import { Repository } from 'typeorm';
import { NewsService } from '../news/news.service';
import { UsefulLink } from './useful-link.entity';
export interface UsefulLinkItem {
    id: string;
    title: string;
    url: string;
    description?: string;
    createdAt: string;
}
export declare class LinksService {
    private readonly repo;
    private readonly newsService;
    constructor(repo: Repository<UsefulLink>, newsService: NewsService);
    findAll(): Promise<UsefulLinkItem[]>;
    findOne(id: string): Promise<UsefulLinkItem | null>;
    create(dto: {
        title: string;
        url: string;
        description?: string;
    }): Promise<UsefulLinkItem>;
    update(id: string, dto: Partial<{
        title: string;
        url: string;
        description?: string;
    }>): Promise<UsefulLinkItem | null>;
    remove(id: string): Promise<boolean>;
}
