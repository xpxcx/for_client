import { MaterialsService } from '../materials/materials.service';
import { LinksService } from '../links/links.service';
import { NewsService } from '../news/news.service';
export declare class SyncNewsController {
    private readonly newsService;
    private readonly materialsService;
    private readonly linksService;
    constructor(newsService: NewsService, materialsService: MaterialsService, linksService: LinksService);
    syncExisting(): Promise<{
        success: boolean;
        created: number;
    }>;
}
