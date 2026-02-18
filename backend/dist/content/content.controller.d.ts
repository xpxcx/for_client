import { ContentService } from './content.service';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    getSections(): import("./content.service").Section[];
    getContent(id: string): import("./content.service").SectionContent | {
        error: string;
    };
}
