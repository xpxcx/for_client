export type UserRole = 'user' | 'admin';
export declare class User {
    id: number;
    username: string;
    passwordHash: string;
    role: UserRole;
    fullName: string | null;
    email: string | null;
}
