export declare class ContactDto {
    name: string;
    email: string;
    category?: string;
    message: string;
}
export declare class ContactController {
    send(body: ContactDto): {
        success: boolean;
        message: string;
    };
}
