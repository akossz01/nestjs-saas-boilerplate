import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as mailgun from 'mailgun-js';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private senderEmail: string;
  private projectName: string;
  private useCustomMailServer: boolean;
  private mailgunClient: mailgun.Mailgun;

  constructor(private configService: ConfigService) {
    this.useCustomMailServer = this.configService.get<boolean>('USE_CUSTOM_MAIL_SERVER');

    if (this.useCustomMailServer) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAIL_HOST'),
        port: this.configService.get<number>('MAIL_PORT'),
        secure: this.configService.get<boolean>('MAIL_SECURE'),
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASS'),
        },
      });
    } else {
      this.mailgunClient = mailgun({
        apiKey: this.configService.get<string>('MAILGUN_API_KEY'),
        domain: this.configService.get<string>('MAILGUN_DOMAIN'),
      });
    }

    this.senderEmail = this.configService.get<string>('SENDER_EMAIL');
    this.projectName = this.configService.get<string>('PROJECT_NAME');
  }

  async sendMail(to: string, from: string, subject: string, text: string, html: string) {
    const mailOptions = {
      from,
      to,
      subject,
      text,
      html,
    };

    try {
      console.log(`Sending email to: ${to}`);

      if (this.useCustomMailServer) {
        const result = await this.transporter.sendMail(mailOptions);
        console.log(`Email sent: ${result.messageId}`);
        return result;
      } else {
        const data = {
          from,
          to,
          subject,
          text,
          html,
        };
        const result = await this.mailgunClient.messages().send(data);
        console.log(`Email sent: ${result.id}`);
        return result;
      }
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendThankYouEmail(to: string) {
    const from = this.senderEmail;
    const subject = `Thank you for subscribing to ${this.projectName}`;
    const text = `Thank you for subscribing to ${this.projectName}! We’re excited to have you on board.`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; margin: 0 auto; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; }
          .header { text-align: center; padding-bottom: 20px; }
          .content { font-size: 16px; line-height: 1.5; color: #333; }
          .button { display: block; width: 200px; margin: 20px auto; padding: 10px 20px; background-color: #007bff; color: white !important; text-align: center; text-decoration: none; border-radius: 5px; font-size: 18px; }
          .button a { text-decoration: none; color: white !important }
          .footer { text-align: center; font-size: 12px; color: #888; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${this.projectName}</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Thank you for subscribing to ${this.projectName}! We’re excited to have you on board.</p>
            <a href="https://example.com" class="button">Visit Our Website</a>
            <p>Thank you for using our service!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${this.projectName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(to, from, subject, text, html);
  }

  async sendResetPasswordEmail(to: string, token: string) {
    const from = this.senderEmail;
    const subject = `Reset your password for ${this.projectName}`;
    const text = `Please use the following link to reset your password: http://example.com/reset-password?token=${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; margin: 0 auto; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; }
          .header { text-align: center; padding-bottom: 20px; }
          .content { font-size: 16px; line-height: 1.5; color: #333; }
          .button { display: block; width: 200px; margin: 20px auto; padding: 10px 20px; background-color: #007bff; color: white !important; text-align: center; text-decoration: none; border-radius: 5px; font-size: 18px; }
          .button a { text-decoration: none; color: white !important }
          .footer { text-align: center; font-size: 12px; color: #888; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Please use the following link to reset your password for ${this.projectName}: <a href="http://example.com/reset-password?token=${token}">Reset Password</a></p>
            <a href="http://example.com/reset-password?token=${token}" class="button">Reset Password</a>
            <p>Thank you for using our service!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${this.projectName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(to, from, subject, text, html);
  }

  async sendConfirmEmail(to: string, token: string) {
    const from = this.senderEmail;
    const subject = `Confirm your email for ${this.projectName}`;
    const text = `Please use the following link to confirm your email: http://example.com/confirm-email?token=${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; margin: 0 auto; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; }
          .header { text-align: center; padding-bottom: 20px; }
          .content { font-size: 16px; line-height: 1.5; color: #333; }
          .button { display: block; width: 200px; margin: 20px auto; padding: 10px 20px; background-color: #007bff; color: white !important; text-align: center; text-decoration: none; border-radius: 5px; font-size: 18px; }
          .button a { text-decoration: none; color: white !important }
          .footer { text-align: center; font-size: 12px; color: #888; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Confirm Your Email</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Please use the following link to confirm your email for ${this.projectName}: <a href="http://example.com/confirm-email?token=${token}">Confirm Email</a></p>
            <a href="http://example.com/confirm-email?token=${token}" class="button">Confirm Email</a>
            <p>Thank you for using our service!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${this.projectName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(to, from, subject, text, html);
  }

  async sendInvoicePaymentSucceededEmail(to: string, invoiceUrl: string) {
    const from = this.senderEmail;
    const subject = `Your payment was successful for ${this.projectName}`;
    const text = `Your payment was successful. You can view your invoice here: ${invoiceUrl}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; margin: 0 auto; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; }
          .header { text-align: center; padding-bottom: 20px; }
          .content { font-size: 16px; line-height: 1.5; color: #333; }
          .button { display: block; width: 200px; margin: 20px auto; padding: 10px 20px; background-color: #007bff; color: white !important; text-align: center; text-decoration: none; border-radius: 5px; font-size: 18px; }
          .button a { text-decoration: none; color: white !important }
          .footer { text-align: center; font-size: 12px; color: #888; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Successful</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Your payment for ${this.projectName} was successful. You can view your invoice here: <a href="${invoiceUrl}">View Invoice</a></p>
            <a href="${invoiceUrl}" class="button">View Invoice</a>
            <p>Thank you for using our service!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${this.projectName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(to, from, subject, text, html);
  }

  async sendInvoicePaymentFailedEmail(to: string) {
    const from = this.senderEmail;
    const subject = `Your payment failed for ${this.projectName}`;
    const text = 'Your payment failed. Please verify your card information and try again.';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; margin: 0 auto; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; }
          .header { text-align: center; padding-bottom: 20px; }
          .content { font-size: 16px; line-height: 1.5; color: #333; }
          .button { display: block; width: 200px; margin: 20px auto; padding: 10px 20px; background-color: #007bff; color: white !important; text-align: center; text-decoration: none; border-radius: 5px; font-size: 18px; }
          .button a { text-decoration: none; color: white !important }
          .footer { text-align: center; font-size: 12px; color: #888; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Your payment for ${this.projectName} failed. Please verify your card information and try again.</p>
            <p>Thank you for using our service!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${this.projectName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(to, from, subject, text, html);
  }
}
