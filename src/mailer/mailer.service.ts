import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private senderEmail: string;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: this.configService.get<boolean>('MAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
    this.senderEmail = this.configService.get<string>('SENDER_EMAIL');
  }

  async sendMail(to: string, from: string, subject: string, text: string, html: string) {
    const mailOptions = {
      from,
      to,
      subject,
      text,
      html,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendThankYouEmail(to: string) {
    const from = this.senderEmail;
    const subject = 'Thank you for subscribing';
    const text = 'Thank you for subscribing to our service!';
    const html = '<p>Thank you for subscribing to our service!</p>';

    return this.sendMail(to, from, subject, text, html);
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const from = this.senderEmail;
    const subject = 'Reset your password';
    const text = `Please use the following link to reset your password: http://example.com/reset-password?token=${token}`;
    const html = `<p>Please use the following link to reset your password: <a href="http://example.com/reset-password?token=${token}">Reset Password</a></p>`;

    return this.sendMail(to, from, subject, text, html);
  }

  async sendConfirmEmail(to: string, token: string) {
    const from = this.senderEmail;
    const subject = 'Confirm your email';
    const text = `Please use the following link to confirm your email: http://example.com/confirm-email?token=${token}`;
    const html = `<p>Please use the following link to confirm your email: <a href="http://example.com/confirm-email?token=${token}">Confirm Email</a></p>`;

    return this.sendMail(to, from, subject, text, html);
  }
}
