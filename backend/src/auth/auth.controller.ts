import { Body, Controller, Get, Param, Patch, Post, Req, Request, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import * as express from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<{ access_token: string }> {
    const tokens = await this.authService.login(body.username, body.password);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token: tokens.access_token };
  }

  @Post('register/send-code')
  async sendRegisterCode(@Body() body: { email: string }) {
    await this.authService.sendRegisterCode(body.email);
    return { success: true };
  }

  @Post('register/verify')
  async registerVerify(
    @Body() body: { email: string; code: string; password: string },
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<{ access_token: string }> {
    const tokens = await this.authService.verifyAndRegister(body.email, body.code, body.password);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token: tokens.access_token };
  }

  @Post('register')
  async register(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<{ access_token: string }> {
    const tokens = await this.authService.register(body.username, body.password);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token: tokens.access_token };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    await this.authService.sendResetCode(body.email);
    return { success: true };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    await this.authService.resetPassword(body.email, body.code, body.newPassword);
    return { success: true };
  }

  @Post('refresh')
  async refresh(@Req() req: express.Request) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Refresh token отсутствует');
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (refreshToken) await this.authService.logout(refreshToken);
    res.clearCookie('refresh_token');
    return { success: true };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateUserRole(@Param('id') id: string, @Body() body: { role: 'user' | 'admin' }) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) throw new UnauthorizedException('Неверный ID пользователя');
    return this.authService.updateUserRole(userId, body.role);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: { user: User }) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('profile/send-code')
  @UseGuards(JwtAuthGuard)
  sendProfileCode(@Request() req: { user: User }, @Body() body: { email: string }) {
    return this.authService.sendProfileCode(req.user.id, body.email);
  }

  @Patch('profile/verify')
  @UseGuards(JwtAuthGuard)
  verifyProfileUpdate(
    @Request() req: { user: User },
    @Body() body: { code: string; fullName?: string | null; email?: string | null; newPassword?: string },
  ) {
    return this.authService.verifyProfileUpdate(req.user.id, body.code, {
      fullName: body.fullName,
      email: body.email,
      newPassword: body.newPassword,
    });
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Request() req: { user: User },
    @Body() body: { fullName?: string | null; email?: string | null },
  ) {
    return this.authService.updateProfile(req.user.id, body);
  }
}
