"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const user_entity_1 = require("./user.entity");
const refresh_token_entity_1 = require("./refresh-token.entity");
const email_verification_entity_1 = require("./email-verification.entity");
const mail_service_1 = require("../mail/mail.service");
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;
const CODE_EXPIRY_MINUTES = 15;
function generateCode() {
    return (0, crypto_1.randomInt)(100000, 999999).toString();
}
let AuthService = class AuthService {
    userRepo;
    refreshTokenRepo;
    emailVerificationRepo;
    jwtService;
    mailService;
    constructor(userRepo, refreshTokenRepo, emailVerificationRepo, jwtService, mailService) {
        this.userRepo = userRepo;
        this.refreshTokenRepo = refreshTokenRepo;
        this.emailVerificationRepo = emailVerificationRepo;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    async validateUser(username, password) {
        const user = await this.userRepo.findOne({ where: { username } });
        if (!user)
            return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        return ok ? user : null;
    }
    async register(username, password, email) {
        const existing = await this.userRepo.findOne({ where: { username } });
        if (existing)
            throw new common_1.UnauthorizedException('Пользователь уже существует');
        if (email) {
            const existingEmail = await this.userRepo.findOne({ where: { email } });
            if (existingEmail)
                throw new common_1.UnauthorizedException('Этот email уже привязан к аккаунту');
        }
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = this.userRepo.create({ username, passwordHash, role: 'user', email: email ?? null });
        await this.userRepo.save(user);
        return this.generateTokens(user);
    }
    async sendRegisterCode(email) {
        const normalized = email.trim().toLowerCase();
        const existing = await this.userRepo.findOne({ where: { email: normalized } });
        if (existing)
            throw new common_1.UnauthorizedException('Этот email уже привязан к аккаунту');
        await this.emailVerificationRepo.delete({ email: normalized, type: 'register' });
        const code = generateCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + CODE_EXPIRY_MINUTES);
        await this.emailVerificationRepo.save({ email: normalized, code, expiresAt, type: 'register' });
        await this.mailService.sendVerificationCode(normalized, code, 'register');
    }
    async verifyAndRegister(email, code, password) {
        const normalized = email.trim().toLowerCase();
        const record = await this.emailVerificationRepo.findOne({
            where: { email: normalized, type: 'register', code },
        });
        if (!record)
            throw new common_1.UnauthorizedException('Неверный или истёкший код');
        if (record.expiresAt < new Date()) {
            await this.emailVerificationRepo.remove(record);
            throw new common_1.UnauthorizedException('Код истёк. Запросите новый.');
        }
        await this.emailVerificationRepo.remove(record);
        return this.register(normalized, password, normalized);
    }
    async sendResetCode(email) {
        const normalized = email.trim().toLowerCase();
        const user = await this.userRepo.findOne({ where: { email: normalized } });
        if (!user)
            return;
        await this.emailVerificationRepo.delete({ email: normalized, type: 'reset' });
        const code = generateCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + CODE_EXPIRY_MINUTES);
        await this.emailVerificationRepo.save({ email: normalized, code, expiresAt, type: 'reset' });
        await this.mailService.sendVerificationCode(normalized, code, 'reset');
    }
    async resetPassword(email, code, newPassword) {
        const normalized = email.trim().toLowerCase();
        const record = await this.emailVerificationRepo.findOne({
            where: { email: normalized, type: 'reset', code },
        });
        if (!record)
            throw new common_1.UnauthorizedException('Неверный или истёкший код');
        if (record.expiresAt < new Date()) {
            await this.emailVerificationRepo.remove(record);
            throw new common_1.UnauthorizedException('Код истёк. Запросите новый.');
        }
        const user = await this.userRepo.findOne({ where: { email: normalized } });
        if (!user)
            throw new common_1.UnauthorizedException('Неверно указана почта');
        user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await this.userRepo.save(user);
        await this.emailVerificationRepo.remove(record);
    }
    async login(username, password) {
        const user = await this.validateUser(username, password);
        if (!user)
            throw new common_1.UnauthorizedException('Неверная почта или пароль');
        return this.generateTokens(user);
    }
    async generateTokens(user) {
        const payload = { sub: user.id, username: user.username, role: user.role };
        const access_token = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
        const refreshToken = (0, crypto_1.randomBytes)(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
        await this.refreshTokenRepo.save({
            token: refreshToken,
            userId: user.id,
            expiresAt,
        });
        return { access_token, refresh_token: refreshToken };
    }
    async refreshAccessToken(refreshToken) {
        const tokenRecord = await this.refreshTokenRepo.findOne({
            where: { token: refreshToken },
            relations: ['user'],
        });
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            if (tokenRecord)
                await this.refreshTokenRepo.remove(tokenRecord);
            throw new common_1.UnauthorizedException('Недействительный refresh токен');
        }
        const user = tokenRecord.user;
        const payload = { sub: user.id, username: user.username, role: user.role };
        const access_token = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
        return { access_token };
    }
    async logout(refreshToken) {
        const tokenRecord = await this.refreshTokenRepo.findOne({ where: { token: refreshToken } });
        if (tokenRecord)
            await this.refreshTokenRepo.remove(tokenRecord);
    }
    async logoutAll(userId) {
        await this.refreshTokenRepo.delete({ userId });
    }
    async getProfile(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        return { username: user.username, fullName: user.fullName ?? null, email: user.email ?? null };
    }
    async updateProfile(userId, dto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        if (dto.fullName !== undefined)
            user.fullName = dto.fullName ?? null;
        if (dto.email !== undefined)
            user.email = dto.email ?? null;
        await this.userRepo.save(user);
        return this.getProfile(userId);
    }
    async sendProfileCode(userId, email) {
        const normalized = email.trim().toLowerCase();
        if (!normalized)
            throw new common_1.UnauthorizedException('Укажите email');
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        const isNewEmail = normalized !== (user.email?.trim().toLowerCase() ?? '');
        if (isNewEmail) {
            const existing = await this.userRepo.findOne({ where: { email: normalized } });
            if (existing)
                throw new common_1.UnauthorizedException('Этот email уже привязан к другому аккаунту');
        }
        await this.emailVerificationRepo.delete({ userId, type: 'profile' });
        const code = generateCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + CODE_EXPIRY_MINUTES);
        await this.emailVerificationRepo.save({
            email: normalized,
            code,
            expiresAt,
            type: 'profile',
            userId,
        });
        await this.mailService.sendVerificationCode(normalized, code, 'profile');
    }
    async verifyProfileUpdate(userId, code, dto) {
        const record = await this.emailVerificationRepo.findOne({
            where: { userId, type: 'profile', code },
        });
        if (!record)
            throw new common_1.UnauthorizedException('Неверный или истёкший код');
        if (record.expiresAt < new Date()) {
            await this.emailVerificationRepo.remove(record);
            throw new common_1.UnauthorizedException('Код истёк. Запросите новый.');
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        if (dto.fullName !== undefined)
            user.fullName = dto.fullName ?? null;
        const newEmail = (record.email || '').trim().toLowerCase() || null;
        user.email = newEmail;
        if (newEmail) {
            const existingByUsername = await this.userRepo.findOne({ where: { username: newEmail } });
            if (existingByUsername && existingByUsername.id !== userId) {
                await this.emailVerificationRepo.remove(record);
                throw new common_1.UnauthorizedException('Этот email уже используется для входа другим пользователем');
            }
            user.username = newEmail;
        }
        if (dto.newPassword !== undefined && dto.newPassword.length > 0) {
            user.passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
        }
        await this.userRepo.save(user);
        await this.emailVerificationRepo.remove(record);
        return this.getProfile(userId);
    }
    async getAllUsers() {
        const users = await this.userRepo.find({
            select: ['id', 'fullName', 'role'],
            order: { id: 'ASC' },
        });
        return users.map((u) => ({ id: u.id, fullName: u.fullName ?? null, role: u.role }));
    }
    async updateUserRole(userId, role) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('Неверно указана почта');
        user.role = role;
        await this.userRepo.save(user);
        return { id: user.id, fullName: user.fullName ?? null, role: user.role };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __param(2, (0, typeorm_1.InjectRepository)(email_verification_entity_1.EmailVerification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map