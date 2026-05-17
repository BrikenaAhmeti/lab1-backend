import { env } from '../src/config/env';
import { MailService } from '../src/shared/mail/mail.service';

async function main() {
    const mail = new MailService();

    await mail.verifyConnection();

    console.log('SMTP connection verified');
    console.log(`Host: ${env.smtpHost}:${env.smtpPort}`);
    console.log(`User: ${env.smtpUser}`);
    console.log(`From: ${env.mailFrom}`);
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`SMTP verification failed: ${message}`);
    process.exit(1);
});
