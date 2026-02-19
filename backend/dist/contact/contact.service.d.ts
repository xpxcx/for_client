import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { TelegramService } from '../telegram/telegram.service';
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
    private readonly telegram;
    constructor(repo: Repository<Contact>, telegram: TelegramService);
    create(dto: {
        name: string;
        email: string;
        category?: string;
        message: string;
    }): Promise<ContactItem>;
    findAll(): Promise<ContactItem[]>;
    findOne(id: string): Promise<ContactItem | null>;
    remove(id: string): Promise<boolean>;
}
