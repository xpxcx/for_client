import { ContactService } from './contact.service';
export declare class ContactDto {
    name: string;
    email: string;
    category?: string;
    message: string;
}
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    send(body: ContactDto): Promise<{
        success: boolean;
        message: string;
    }>;
    findAll(): Promise<import("./contact.service").ContactItem[]>;
    findOne(id: string): Promise<import("./contact.service").ContactItem | {
        error: string;
    }>;
    remove(id: string): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
}
