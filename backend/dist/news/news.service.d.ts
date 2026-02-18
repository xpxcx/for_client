export interface NewsItem {
    id: string;
    date: string;
    title: string;
    text: string;
}
export declare class NewsService {
    private readonly items;
    findAll(): NewsItem[];
    findOne(id: string): NewsItem | null;
}
