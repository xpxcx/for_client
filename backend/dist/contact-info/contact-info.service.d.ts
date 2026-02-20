import { Repository } from 'typeorm';
import { Contacts } from './contacts.entity';
import { SocialNetwork } from './social-network.entity';
export interface ContactInfoDto {
    phone: string | null;
    email: string | null;
    socialNetworks: {
        name: string;
        url: string;
    }[];
}
export declare class ContactInfoService {
    private readonly contactsRepo;
    private readonly socialRepo;
    constructor(contactsRepo: Repository<Contacts>, socialRepo: Repository<SocialNetwork>);
    get(): Promise<ContactInfoDto>;
    update(dto: Partial<ContactInfoDto>): Promise<ContactInfoDto>;
}
