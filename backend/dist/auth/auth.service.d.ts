import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';
import { EmailVerification } from './email-verification.entity';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private readonly userRepo;
    private readonly refreshTokenRepo;
    private readonly emailVerificationRepo;
    private readonly jwtService;
    private readonly mailService;
    constructor(userRepo: Repository<User>, refreshTokenRepo: Repository<RefreshToken>, emailVerificationRepo: Repository<EmailVerification>, jwtService: JwtService, mailService: MailService);
    validateUser(username: string, password: string): Promise<User | null>;
    register(username: string, password: string, email?: string | null): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    sendRegisterCode(email: string): Promise<void>;
    verifyAndRegister(email: string, code: string, password: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    sendResetCode(email: string): Promise<void>;
    resetPassword(email: string, code: string, newPassword: string): Promise<void>;
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
    sendProfileCode(userId: number, email: string): Promise<void>;
    verifyProfileUpdate(userId: number, code: string, dto: {
        fullName?: string | null;
        email?: string | null;
        newPassword?: string;
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
