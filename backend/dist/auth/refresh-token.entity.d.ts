import { User } from './user.entity';
export declare class RefreshToken {
    id: number;
    token: string;
    userId: number;
    user: User;
    expiresAt: Date;
    createdAt: Date;
}
