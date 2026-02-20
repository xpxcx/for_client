import { ContactInfoService } from './contact-info.service';
export declare class ContactInfoController {
    private readonly contactInfoService;
    constructor(contactInfoService: ContactInfoService);
    get(): Promise<import("./contact-info.service").ContactInfoDto>;
    update(body: Partial<{
        phone: string | null;
        email: string | null;
        socialNetworks: {
            name: string;
            url: string;
        }[];
    }>): Promise<import("./contact-info.service").ContactInfoDto>;
}
