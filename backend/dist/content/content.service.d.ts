export interface Section {
    id: string;
    title: string;
    path: string;
}
export interface SectionContent {
    id: string;
    title: string;
    body: string;
}
export declare class ContentService {
    private readonly sections;
    private readonly content;
    getSections(): Section[];
    getContent(id: string): SectionContent | null;
}
