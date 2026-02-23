import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.MAIL_HOST;
    const port = process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 587;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASSWORD;
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  async sendVerificationCode(to: string, code: string, kind: 'register' | 'reset' | 'profile'): Promise<void> {
    const subject =
      kind === 'register'
        ? 'Код подтверждения регистрации'
        : kind === 'reset'
          ? 'Код для сброса пароля'
          : 'Код подтверждения изменений в профиле';
    const text =
      kind === 'register'
        ? `Ваш код подтверждения: ${code}. Введите его на странице регистрации.`
        : kind === 'reset'
          ? `Ваш код для сброса пароля: ${code}. Введите его на странице восстановления пароля.`
          : `Ваш код подтверждения: ${code}. Введите его в личном кабинете для сохранения изменений.`;
    await this.send(to, subject, text);
  }

  private async send(to: string, subject: string, text: string): Promise<void> {
    const from = process.env.MAIL_FROM || process.env.MAIL_USER || 'noreply@localhost';
    if (!this.transporter) {
      console.warn('[Mail] MAIL_* not set, skip send:', { to, subject });
      return;
    }
    await this.transporter.sendMail({ from, to, subject, text });
  }
}
