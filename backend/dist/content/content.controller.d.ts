import { ContentService } from './content.service';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    uploadPhoto(file: Express.Multer.File): {
        url: string;
    };
    getSections(): import("./content.service").Section[];
    getContent(id: string): import("./content.service").SectionContent | {
        error: string;
    };
    updateContent(id: string, body: {
        title?: string;
        body?: string;
        fullName?: string;
        birthDate?: string;
        imageUrl?: string;
        education?: string;
        experience?: string;
    }): import("./content.service").SectionContent | {
        error: string;
    };
}
