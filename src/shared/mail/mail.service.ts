import nodemailer from 'nodemailer';
import { env } from '../../config/env';

export interface MailMessage {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export class MailService {
    private readonly transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: {
            user: env.smtpUser,
            pass: env.smtpPass,
        },
    });

    async verifyConnection(): Promise<void> {
        this.ensureConfigured();
        await this.transporter.verify();
    }

    async send(message: MailMessage): Promise<void> {
        this.ensureConfigured();

        await this.transporter.sendMail({
            from: env.mailFrom,
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
        });
    }

    private ensureConfigured(): void {
        const missing = [
            ['SMTP_HOST', env.smtpHost],
            ['SMTP_USER', env.smtpUser],
            ['SMTP_PASS', env.smtpPass],
            ['MAIL_FROM', env.mailFrom],
        ]
            .filter(([, value]) => !value)
            .map(([key]) => key);

        if (missing.length > 0) {
            throw new Error(`Missing mail configuration: ${missing.join(', ')}`);
        }
    }
}
