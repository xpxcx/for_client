import { OnModuleInit } from '@nestjs/common';
export interface Section {
    id: string;
    title: string;
    path: string;
}
export interface SectionContent {
    id: string;
    title: string;
    body: string;
    fullName?: string;
    birthDate?: string;
    imageUrl?: string;
    education?: string;
    experience?: string;
}
export declare class ContentService implements OnModuleInit {
    private readonly sections;
    private readonly content;
    onModuleInit(): void;
    private saveToFile;
    getSections(): Section[];
    getContent(id: string): SectionContent | null;
    updateContent(id: string, dto: {
        title?: string;
        body?: string;
        fullName?: string;
        birthDate?: string;
        imageUrl?: string;
        education?: string;
        experience?: string;
    }): SectionContent | null;
}
