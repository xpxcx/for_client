import { Repository } from 'typeorm';
import { NewsService } from '../news/news.service';
import { Material } from './material.entity';
export interface MaterialItem {
    id: string;
    title: string;
    description: string;
    fileUrl?: string;
    createdAt: string;
}
export declare class MaterialsService {
    private readonly repo;
    private readonly newsService;
    constructor(repo: Repository<Material>, newsService: NewsService);
    findAll(): Promise<MaterialItem[]>;
    findOne(id: string): Promise<MaterialItem | null>;
    create(dto: {
        title: string;
        description: string;
        fileUrl?: string;
    }): Promise<MaterialItem>;
    update(id: string, dto: Partial<{
        title: string;
        description: string;
        fileUrl?: string;
    }>): Promise<MaterialItem | null>;
    remove(id: string): Promise<boolean>;
}
