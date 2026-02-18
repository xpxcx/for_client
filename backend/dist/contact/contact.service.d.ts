import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
export interface ContactItem {
    id: string;
    name: string;
    email: string;
    category?: string;
    message: string;
    createdAt: string;
}
export declare class ContactService {
    private readonly repo;
    constructor(repo: Repository<Contact>);
    create(dto: {
        name: string;
        email: string;
        category?: string;
        message: string;
    }): Promise<ContactItem>;
    findAll(): Promise<ContactItem[]>;
    findOne(id: string): Promise<ContactItem | null>;
}
