import fs from 'node:fs';
import path from 'node:path';
import { AppError } from '../../src/shared/core/errors/app-error';
import { validateLoginDto } from '../../src/modules/auth/dto/auth.dto';
import {
    validateCreatePatientDto,
    validateGetPatientsQueryDto,
} from '../../src/modules/patients/dto/patient.dto';

const rawSqlPatterns = [
    /\.\$queryRaw(?:Unsafe)?\b/,
    /\.\$executeRaw(?:Unsafe)?\b/,
];

const validPatientPayload = {
    firstName: 'Ana',
    lastName: 'Krasniqi',
    dateOfBirth: '1998-03-10',
    gender: 'FEMALE',
    phoneNumber: '+38344111222',
    address: 'Prishtine',
    bloodType: 'A+',
};

describe('security hardening', () => {
    it('does not use raw SQL in application source', () => {
        const sourceFiles = collectSourceFiles(path.resolve(__dirname, '../../src'));
        const violations = sourceFiles.flatMap((file) => {
            const contents = fs.readFileSync(file, 'utf8');

            return rawSqlPatterns
                .filter((pattern) => pattern.test(contents))
                .map((pattern) => `${path.relative(process.cwd(), file)} matches ${pattern}`);
        });

        expect(violations).toEqual([]);
    });

    it('rejects executable markup in DTO text fields', () => {
        expect(() => validateCreatePatientDto({
            ...validPatientPayload,
            firstName: '<img src=x onerror=alert(1)>',
        })).toThrow(AppError);
        expect(() => validateCreatePatientDto({
            ...validPatientPayload,
            address: 'javascript:alert(1)',
        })).toThrow('HTML or script content is not allowed');
    });

    it('does not apply XSS text checks to password or token fields', () => {
        const dto = validateLoginDto({
            identifier: 'ana@example.com',
            password: '<script>alert(1)</script>',
        });

        expect(dto.password).toBe('<script>alert(1)</script>');
    });

    it('allowlists query sorting fields before repository code runs', () => {
        expect(() => validateGetPatientsQueryDto({
            sortBy: 'last_name; DROP TABLE patients;',
        })).toThrow(AppError);
    });
});

function collectSourceFiles(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            return entry.name === 'generated' ? [] : collectSourceFiles(fullPath);
        }

        return entry.isFile() && fullPath.endsWith('.ts') ? [fullPath] : [];
    });
}
