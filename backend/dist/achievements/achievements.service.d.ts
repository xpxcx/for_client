import { Repository } from 'typeorm';
import { NewsService } from '../news/news.service';
import { Achievement as AchievementEntity } from './achievement.entity';
export interface Achievement {
    id: string;
    title: string;
    description: string;
    date: string;
    imageUrl?: string;
}
export declare class AchievementsService {
    private readonly repo;
    private readonly newsService;
    constructor(repo: Repository<AchievementEntity>, newsService: NewsService);
    findAll(): Promise<Achievement[]>;
    findOne(id: string): Promise<Achievement | null>;
    create(dto: {
        title: string;
        description: string;
        date: string;
        imageUrl?: string;
    }): Promise<Achievement>;
    update(id: string, dto: Partial<{
        title: string;
        description: string;
        date: string;
        imageUrl?: string;
    }>): Promise<Achievement | null>;
    remove(id: string): Promise<boolean>;
}
