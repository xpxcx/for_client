import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { randomBytes, randomInt } from 'crypto';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';
import { EmailVerification } from './email-verification.entity';
import { MailService } from '../mail/mail.service';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;
const CODE_EXPIRY_MINUTES = 15;

function generateCode(): string {
  return randomInt(100000, 999999).toString();
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async register(username: string, password: string, email?: string | null): Promise<{ access_token: string; refresh_token: string }> {
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) throw new UnauthorizedException('Пользователь уже существует');
    if (email) {
      const existingEmail = await this.userRepo.findOne({ where: { email } });
      if (existingEmail) throw new UnauthorizedException('Этот email уже привязан к аккаунту');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = this.userRepo.create({ username, passwordHash, role: 'user', email: email ?? null });
    await this.userRepo.save(user);
    return this.generateTokens(user);
  }

  async sendRegisterCode(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({ where: { email: normalized } });
    if (existing) throw new UnauthorizedException('Этот email уже привязан к аккаунту');
    await this.emailVerificationRepo.delete({ email: normalized, type: 'register' });
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + CODE_EXPIRY_MINUTES);
    await this.emailVerificationRepo.save({ email: normalized, code, expiresAt, type: 'register' });
    await this.mailService.sendVerificationCode(normalized, code, 'register');
  }

  async verifyAndRegister(email: string, code: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const normalized = email.trim().toLowerCase();
    const record = await this.emailVerificationRepo.findOne({
      where: { email: normalized, type: 'register', code },
    });
    if (!record) throw new UnauthorizedException('Неверный или истёкший код');
    if (record.expiresAt < new Date()) {
      await this.emailVerificationRepo.remove(record);
      throw new UnauthorizedException('Код истёк. Запросите новый.');
    }
    await this.emailVerificationRepo.remove(record);
    return this.register(normalized, password, normalized);
  }

  async sendResetCode(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: normalized } });
    if (!user) return;
    await this.emailVerificationRepo.delete({ email: normalized, type: 'reset' });
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + CODE_EXPIRY_MINUTES);
    await this.emailVerificationRepo.save({ email: normalized, code, expiresAt, type: 'reset' });
    await this.mailService.sendVerificationCode(normalized, code, 'reset');
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const record = await this.emailVerificationRepo.findOne({
      where: { email: normalized, type: 'reset', code },
    });
    if (!record) throw new UnauthorizedException('Неверный или истёкший код');
    if (record.expiresAt < new Date()) {
      await this.emailVerificationRepo.remove(record);
      throw new UnauthorizedException('Код истёк. Запросите новый.');
    }
    const user = await this.userRepo.findOne({ where: { email: normalized } });
    if (!user) throw new UnauthorizedException('Неверно указана почта');
    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepo.save(user);
    await this.emailVerificationRepo.remove(record);
  }

  async login(username: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Неверная почта или пароль');
    return this.generateTokens(user);
  }

  async generateTokens(user: User): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });

    const refreshToken = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await this.refreshTokenRepo.save({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return { access_token, refresh_token: refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    const tokenRecord = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) await this.refreshTokenRepo.remove(tokenRecord);
      throw new UnauthorizedException('Недействительный refresh токен');
    }

    const user = tokenRecord.user;
    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });

    return { access_token };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenRecord = await this.refreshTokenRepo.findOne({ where: { token: refreshToken } });
    if (tokenRecord) await this.refreshTokenRepo.remove(tokenRecord);
  }

  async logoutAll(userId: number): Promise<void> {
    await this.refreshTokenRepo.delete({ userId });
  }

  async getProfile(userId: number): Promise<{ username: string; fullName: string | null; email: string | null }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { username: user.username, fullName: user.fullName ?? null, email: user.email ?? null };
  }

  async updateProfile(
    userId: number,
    dto: { fullName?: string | null; email?: string | null },
  ): Promise<{ username: string; fullName: string | null; email: string | null }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (dto.fullName !== undefined) user.fullName = dto.fullName ?? null;
    if (dto.email !== undefined) user.email = dto.email ?? null;
    await this.userRepo.save(user);
    return this.getProfile(userId);
  }

  async sendProfileCode(userId: number, email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) throw new UnauthorizedException('Укажите email');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const isNewEmail = normalized !== (user.email?.trim().toLowerCase() ?? '');
    if (isNewEmail) {
      const existing = await this.userRepo.findOne({ where: { email: normalized } });
      if (existing) throw new UnauthorizedException('Этот email уже привязан к другому аккаунту');
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

  async verifyProfileUpdate(
    userId: number,
    code: string,
    dto: { fullName?: string | null; email?: string | null; newPassword?: string },
  ): Promise<{ username: string; fullName: string | null; email: string | null }> {
    const record = await this.emailVerificationRepo.findOne({
      where: { userId, type: 'profile', code },
    });
    if (!record) throw new UnauthorizedException('Неверный или истёкший код');
    if (record.expiresAt < new Date()) {
      await this.emailVerificationRepo.remove(record);
      throw new UnauthorizedException('Код истёк. Запросите новый.');
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (dto.fullName !== undefined) user.fullName = dto.fullName ?? null;
    const newEmail = (record.email || '').trim().toLowerCase() || null;
    user.email = newEmail;
    if (newEmail) {
      const existingByUsername = await this.userRepo.findOne({ where: { username: newEmail } });
      if (existingByUsername && existingByUsername.id !== userId) {
        await this.emailVerificationRepo.remove(record);
        throw new UnauthorizedException('Этот email уже используется для входа другим пользователем');
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

  async getAllUsers(): Promise<Array<{ id: number; fullName: string | null; role: string }>> {
    const users = await this.userRepo.find({
      select: ['id', 'fullName', 'role'],
      order: { id: 'ASC' },
    });
    return users.map((u) => ({ id: u.id, fullName: u.fullName ?? null, role: u.role }));
  }

  async updateUserRole(userId: number, role: 'user' | 'admin'): Promise<{ id: number; fullName: string | null; role: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Неверно указана почта');
    user.role = role;
    await this.userRepo.save(user);
    return { id: user.id, fullName: user.fullName ?? null, role: user.role };
  }
}
