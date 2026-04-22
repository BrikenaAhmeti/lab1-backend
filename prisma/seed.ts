import 'dotenv/config';
import { AuthPrismaRepository } from '../src/modules/auth/infrastructure/auth.prisma.repository';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { env } from '../src/config/env';
import { prisma } from '../src/infrastructure/db/prisma';

async function main() {
    if (!env.adminEmail || !env.adminPassword) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in env');
    }

    const repository = new AuthPrismaRepository();
    const service = new AuthService(repository);

    await service.seedAdmin({
        firstName: env.adminFirstName,
        lastName: env.adminLastName,
        email: env.adminEmail,
        username: env.adminUsername,
        password: env.adminPassword,
        phoneNumber: env.adminPhoneNumber,
    });

    console.log(`Admin seeded: ${env.adminEmail}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
