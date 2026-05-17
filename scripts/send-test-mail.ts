import { env } from '../src/config/env';
import { MailService } from '../src/shared/mail/mail.service';

async function main() {
    const to = process.argv[2] || process.env.MAIL_TEST_TO || env.smtpUser;
    const mail = new MailService();

    await mail.send({
        to,
        subject: 'MedSphere SMTP test',
        text: 'Your MedSphere backend SMTP configuration can send email.',
        html: '<p>Your MedSphere backend SMTP configuration can send email.</p>',
    });

    console.log(`Test email sent to ${to}`);
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Test email failed: ${message}`);
    process.exit(1);
});
