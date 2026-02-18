import { Repository } from 'typeorm';
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
    constructor(repo: Repository<Material>);
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
