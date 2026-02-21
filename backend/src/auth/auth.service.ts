import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async register(username: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) throw new UnauthorizedException('Пользователь уже существует');
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = this.userRepo.create({ username, passwordHash, role: 'user' });
    await this.userRepo.save(user);
    return this.generateTokens(user);
  }

  async login(username: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Неверный логин или пароль');
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

  async getAllUsers(): Promise<Array<{ id: number; fullName: string | null; role: string }>> {
    const users = await this.userRepo.find({
      select: ['id', 'fullName', 'role'],
      order: { id: 'ASC' },
    });
    return users.map((u) => ({ id: u.id, fullName: u.fullName ?? null, role: u.role }));
  }

  async updateUserRole(userId: number, role: 'user' | 'admin'): Promise<{ id: number; fullName: string | null; role: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Пользователь не найден');
    user.role = role;
    await this.userRepo.save(user);
    return { id: user.id, fullName: user.fullName ?? null, role: user.role };
  }
}
