import * as express from 'express';
import { AuthService } from './auth.service';
import { User } from './user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        username: string;
        password: string;
    }, res: express.Response): Promise<{
        access_token: string;
    }>;
    sendRegisterCode(body: {
        email: string;
    }): Promise<{
        success: boolean;
    }>;
    registerVerify(body: {
        email: string;
        code: string;
        password: string;
    }, res: express.Response): Promise<{
        access_token: string;
    }>;
    register(body: {
        username: string;
        password: string;
    }, res: express.Response): Promise<{
        access_token: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        success: boolean;
    }>;
    resetPassword(body: {
        email: string;
        code: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
    }>;
    refresh(req: express.Request): Promise<{
        access_token: string;
    }>;
    logout(req: express.Request, res: express.Response): Promise<{
        success: boolean;
    }>;
    getAllUsers(): Promise<{
        id: number;
        fullName: string | null;
        role: string;
    }[]>;
    updateUserRole(id: string, body: {
        role: 'user' | 'admin';
    }): Promise<{
        id: number;
        fullName: string | null;
        role: string;
    }>;
    getProfile(req: {
        user: User;
    }): Promise<{
        username: string;
        fullName: string | null;
        email: string | null;
    }>;
    sendProfileCode(req: {
        user: User;
    }, body: {
        email: string;
    }): Promise<void>;
    verifyProfileUpdate(req: {
        user: User;
    }, body: {
        code: string;
        fullName?: string | null;
        email?: string | null;
        newPassword?: string;
    }): Promise<{
        username: string;
        fullName: string | null;
        email: string | null;
    }>;
    updateProfile(req: {
        user: User;
    }, body: {
        fullName?: string | null;
        email?: string | null;
    }): Promise<{
        username: string;
        fullName: string | null;
        email: string | null;
    }>;
}
