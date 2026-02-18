import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';
export declare class AuthService {
    private readonly userRepo;
    private readonly refreshTokenRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, refreshTokenRepo: Repository<RefreshToken>, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<User | null>;
    register(username: string, password: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    login(username: string, password: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    generateTokens(user: User): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: number): Promise<void>;
    getProfile(userId: number): Promise<{
        username: string;
        fullName: string | null;
        email: string | null;
    }>;
    updateProfile(userId: number, dto: {
        fullName?: string | null;
        email?: string | null;
    }): Promise<{
        username: string;
        fullName: string | null;
        email: string | null;
    }>;
    getAllUsers(): Promise<Array<{
        id: number;
        fullName: string | null;
        role: string;
    }>>;
    updateUserRole(userId: number, role: 'user' | 'admin'): Promise<{
        id: number;
        fullName: string | null;
        role: string;
    }>;
}
