import 'dotenv/config';
import bcrypt from 'bcrypt';
import { AuthPrismaRepository } from '../src/modules/auth/infrastructure/auth.prisma.repository';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { env } from '../src/config/env';
import { prisma } from '../src/infrastructure/db/prisma';
import {
    AdmissionStatus,
    InvoiceStatus,
    RoomStatus,
    RoomType,
} from '../src/generated/prisma';

const seedPassword = process.env.SEED_USER_PASSWORD || 'Password123!';
const today = '2026-05-20';
const tomorrow = '2026-05-21';

const departments = [
    {
        key: 'emergency',
        name: 'Emergency Medicine',
        description: '24/7 triage, urgent care, and acute observation',
        location: 'Ground Floor - East Wing',
    },
    {
        key: 'cardiology',
        name: 'Cardiology',
        description: 'Heart diagnostics, consultations, and follow-up care',
        location: 'Second Floor - North Wing',
    },
    {
        key: 'pediatrics',
        name: 'Pediatrics',
        description: 'Primary and specialty care for children and teens',
        location: 'First Floor - Family Wing',
    },
    {
        key: 'surgery',
        name: 'Surgery',
        description: 'Pre-op, post-op, and general surgical services',
        location: 'Third Floor - Surgical Wing',
    },
    {
        key: 'radiology',
        name: 'Radiology',
        description: 'Imaging, ultrasound, and diagnostic reporting',
        location: 'Lower Level - Imaging Center',
    },
] as const;

type DepartmentKey = (typeof departments)[number]['key'];
type RoleName = 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PATIENT' | 'USER';

const doctors = [
    {
        key: 'dr-mira',
        firstName: 'Mira',
        lastName: 'Kelmendi',
        specialization: 'Emergency Medicine',
        departmentKey: 'emergency',
        phoneNumber: '+38344111001',
        username: 'seed.dr.mira',
    },
    {
        key: 'dr-arben',
        firstName: 'Arben',
        lastName: 'Hoxha',
        specialization: 'Cardiology',
        departmentKey: 'cardiology',
        phoneNumber: '+38344111002',
        username: 'seed.dr.arben',
    },
    {
        key: 'dr-elira',
        firstName: 'Elira',
        lastName: 'Krasniqi',
        specialization: 'Pediatrics',
        departmentKey: 'pediatrics',
        phoneNumber: '+38344111003',
        username: 'seed.dr.elira',
    },
    {
        key: 'dr-driton',
        firstName: 'Driton',
        lastName: 'Berisha',
        specialization: 'General Surgery',
        departmentKey: 'surgery',
        phoneNumber: '+38344111004',
        username: 'seed.dr.driton',
    },
    {
        key: 'dr-nora',
        firstName: 'Nora',
        lastName: 'Gashi',
        specialization: 'Internal Medicine',
        departmentKey: 'emergency',
        phoneNumber: '+38344111005',
        username: 'seed.dr.nora',
    },
    {
        key: 'dr-ilir',
        firstName: 'Ilir',
        lastName: 'Shala',
        specialization: 'Orthopedics',
        departmentKey: 'surgery',
        phoneNumber: '+38344111006',
        username: 'seed.dr.ilir',
    },
    {
        key: 'dr-hana',
        firstName: 'Hana',
        lastName: 'Morina',
        specialization: 'Neurology',
        departmentKey: 'cardiology',
        phoneNumber: '+38344111007',
        username: 'seed.dr.hana',
    },
    {
        key: 'dr-fisnik',
        firstName: 'Fisnik',
        lastName: 'Deda',
        specialization: 'Radiology',
        departmentKey: 'radiology',
        phoneNumber: '+38344111008',
        username: 'seed.dr.fisnik',
    },
] as const;

type DoctorKey = (typeof doctors)[number]['key'];

const nurses = [
    {
        firstName: 'Sara',
        lastName: 'Leka',
        departmentKey: 'emergency',
        shift: 'Morning',
        username: 'seed.nurse.sara',
    },
    {
        firstName: 'Gentiana',
        lastName: 'Morina',
        departmentKey: 'emergency',
        shift: 'Evening',
        username: 'seed.nurse.gentiana',
    },
    {
        firstName: 'Blerta',
        lastName: 'Dervishi',
        departmentKey: 'emergency',
        shift: 'Night',
        username: 'seed.nurse.blerta',
    },
    {
        firstName: 'Luan',
        lastName: 'Bytyqi',
        departmentKey: 'cardiology',
        shift: 'Morning',
        username: 'seed.nurse.luan',
    },
    {
        firstName: 'Teuta',
        lastName: 'Shala',
        departmentKey: 'cardiology',
        shift: 'Evening',
        username: 'seed.nurse.teuta',
    },
    {
        firstName: 'Albana',
        lastName: 'Rama',
        departmentKey: 'pediatrics',
        shift: 'Morning',
        username: 'seed.nurse.albana',
    },
    {
        firstName: 'Fitim',
        lastName: 'Beka',
        departmentKey: 'pediatrics',
        shift: 'Night',
        username: 'seed.nurse.fitim',
    },
    {
        firstName: 'Dafina',
        lastName: 'Koci',
        departmentKey: 'surgery',
        shift: 'Morning',
        username: 'seed.nurse.dafina',
    },
    {
        firstName: 'Besart',
        lastName: 'Gashi',
        departmentKey: 'surgery',
        shift: 'Evening',
        username: 'seed.nurse.besart',
    },
    {
        firstName: 'Arta',
        lastName: 'Rexha',
        departmentKey: 'radiology',
        shift: 'Morning',
        username: 'seed.nurse.arta',
    },
] as const;

const receptionists = [
    {
        firstName: 'Rina',
        lastName: 'Selmani',
        username: 'seed.reception.rina',
        phoneNumber: '+38344112001',
    },
    {
        firstName: 'Blerim',
        lastName: 'Koci',
        username: 'seed.reception.blerim',
        phoneNumber: '+38344112002',
    },
] as const;

const rooms = [
    {
        roomNumber: 'ER-01',
        departmentKey: 'emergency',
        type: RoomType.EMERGENCY,
        status: RoomStatus.OCCUPIED,
        capacity: 2,
    },
    {
        roomNumber: 'ER-02',
        departmentKey: 'emergency',
        type: RoomType.EMERGENCY,
        status: RoomStatus.AVAILABLE,
        capacity: 2,
    },
    {
        roomNumber: 'CARD-01',
        departmentKey: 'cardiology',
        type: RoomType.GENERAL,
        status: RoomStatus.AVAILABLE,
        capacity: 2,
    },
    {
        roomNumber: 'CARD-02',
        departmentKey: 'cardiology',
        type: RoomType.GENERAL,
        status: RoomStatus.OCCUPIED,
        capacity: 1,
    },
    {
        roomNumber: 'PED-01',
        departmentKey: 'pediatrics',
        type: RoomType.PEDIATRIC,
        status: RoomStatus.AVAILABLE,
        capacity: 3,
    },
    {
        roomNumber: 'PED-02',
        departmentKey: 'pediatrics',
        type: RoomType.PEDIATRIC,
        status: RoomStatus.OCCUPIED,
        capacity: 2,
    },
    {
        roomNumber: 'SUR-01',
        departmentKey: 'surgery',
        type: RoomType.SURGERY,
        status: RoomStatus.AVAILABLE,
        capacity: 1,
    },
    {
        roomNumber: 'SUR-02',
        departmentKey: 'surgery',
        type: RoomType.SURGERY,
        status: RoomStatus.OCCUPIED,
        capacity: 1,
    },
    {
        roomNumber: 'RAD-01',
        departmentKey: 'radiology',
        type: RoomType.GENERAL,
        status: RoomStatus.AVAILABLE,
        capacity: 1,
    },
    {
        roomNumber: 'ICU-01',
        departmentKey: 'emergency',
        type: RoomType.ICU,
        status: RoomStatus.OCCUPIED,
        capacity: 1,
    },
] as const;

const patients = [
    ['seed-patient-001', 'Arian', 'Mehmeti', '1984-04-12', 'MALE', '+38345101001', 'Rr. Luan Haradinaj 12, Pristina', 'O+'],
    ['seed-patient-002', 'Donika', 'Basha', '1991-09-05', 'FEMALE', '+38345101002', 'Rr. Iliria 4, Pristina', 'A+'],
    ['seed-patient-003', 'Leart', 'Osmani', '1978-02-23', 'MALE', '+38345101003', 'Rr. Muharrem Fejza 21, Pristina', 'B+'],
    ['seed-patient-004', 'Vesa', 'Rugova', '2009-12-18', 'FEMALE', '+38345101004', 'Rr. UCK 9, Fushe Kosove', 'AB+'],
    ['seed-patient-005', 'Flamur', 'Gashi', '1966-07-30', 'MALE', '+38345101005', 'Rr. Agim Ramadani 33, Pristina', 'O-'],
    ['seed-patient-006', 'Era', 'Krasniqi', '2016-03-14', 'FEMALE', '+38345101006', 'Rr. Bajram Kelmendi 17, Pristina', 'A-'],
    ['seed-patient-007', 'Nol', 'Hoti', '1999-11-02', 'MALE', '+38345101007', 'Rr. Garibaldi 2, Pristina', 'B-'],
    ['seed-patient-008', 'Lira', 'Shala', '1988-06-26', 'FEMALE', '+38345101008', 'Rr. Fehmi Agani 8, Pristina', 'O+'],
    ['seed-patient-009', 'Bujar', 'Berisha', '1972-01-19', 'MALE', '+38345101009', 'Rr. Bill Clinton 41, Pristina', 'A+'],
    ['seed-patient-010', 'Arta', 'Morina', '1995-08-11', 'FEMALE', '+38345101010', 'Rr. Tirana 5, Pristina', 'AB-'],
    ['seed-patient-011', 'Kreshnik', 'Rama', '1981-10-07', 'MALE', '+38345101011', 'Rr. Eqrem Cabej 15, Pristina', 'O+'],
    ['seed-patient-012', 'Diona', 'Rexha', '2012-05-21', 'FEMALE', '+38345101012', 'Rr. Nena Tereze 20, Pristina', 'A+'],
    ['seed-patient-013', 'Valon', 'Deda', '1959-03-08', 'MALE', '+38345101013', 'Rr. Meto Bajraktari 6, Pristina', 'B+'],
    ['seed-patient-014', 'Alba', 'Kelmendi', '1990-12-03', 'FEMALE', '+38345101014', 'Rr. Deshmoret e Kombit 10, Pristina', 'O-'],
    ['seed-patient-015', 'Trim', 'Selmani', '2001-04-27', 'MALE', '+38345101015', 'Rr. Mark Isaku 7, Pristina', 'A-'],
    ['seed-patient-016', 'Mimoza', 'Hoxha', '1975-09-16', 'FEMALE', '+38345101016', 'Rr. Ahmet Krasniqi 13, Pristina', 'AB+'],
    ['seed-patient-017', 'Besian', 'Leka', '1986-02-10', 'MALE', '+38345101017', 'Rr. Vellusha 29, Pristina', 'O+'],
    ['seed-patient-018', 'Elina', 'Bytyqi', '2018-06-01', 'FEMALE', '+38345101018', 'Rr. 2 Korriku 18, Pristina', 'B+'],
] as const;

const todayAppointmentRows = [
    ['09:00', 'dr-mira', 'seed-patient-001', 'Confirmed emergency consult'],
    ['09:15', 'dr-arben', 'seed-patient-002', 'Confirmed cardiology intake'],
    ['09:30', 'dr-elira', 'seed-patient-003', 'Confirmed pediatric review'],
    ['09:45', 'dr-driton', 'seed-patient-004', 'Confirmed surgical consult'],
    ['10:00', 'dr-nora', 'seed-patient-005', 'Confirmed internal medicine visit'],
    ['10:15', 'dr-ilir', 'seed-patient-006', 'Confirmed orthopedic evaluation'],
    ['10:30', 'dr-hana', 'seed-patient-007', 'Confirmed neurology follow-up'],
    ['10:45', 'dr-fisnik', 'seed-patient-008', 'Confirmed imaging consultation'],
    ['11:15', 'dr-mira', 'seed-patient-009', 'Confirmed triage follow-up'],
    ['11:45', 'dr-arben', 'seed-patient-010', 'Confirmed ECG review'],
    ['12:15', 'dr-elira', 'seed-patient-011', 'Confirmed adolescent checkup'],
    ['12:45', 'dr-driton', 'seed-patient-012', 'Confirmed post-op review'],
    ['13:30', 'dr-nora', 'seed-patient-013', 'Confirmed chronic care visit'],
    ['14:00', 'dr-ilir', 'seed-patient-014', 'Confirmed fracture review'],
    ['14:30', 'dr-hana', 'seed-patient-015', 'Confirmed migraine consultation'],
    ['15:00', 'dr-fisnik', 'seed-patient-016', 'Confirmed ultrasound report'],
] as const;

const tomorrowAppointmentRows = [
    ['08:30', 'dr-mira', 'seed-patient-017', 'Confirmed emergency follow-up'],
    ['08:45', 'dr-arben', 'seed-patient-018', 'Confirmed blood pressure review'],
    ['09:00', 'dr-elira', 'seed-patient-001', 'Confirmed pediatric vaccination'],
    ['09:15', 'dr-driton', 'seed-patient-002', 'Confirmed surgical screening'],
    ['09:30', 'dr-nora', 'seed-patient-003', 'Confirmed lab result review'],
    ['09:45', 'dr-ilir', 'seed-patient-004', 'Confirmed sports injury visit'],
    ['10:00', 'dr-hana', 'seed-patient-005', 'Confirmed neurological exam'],
    ['10:15', 'dr-fisnik', 'seed-patient-006', 'Confirmed radiology slot'],
    ['11:00', 'dr-mira', 'seed-patient-007', 'Confirmed wound check'],
    ['11:30', 'dr-arben', 'seed-patient-008', 'Confirmed echo follow-up'],
    ['12:00', 'dr-elira', 'seed-patient-009', 'Confirmed pediatric consult'],
    ['12:30', 'dr-driton', 'seed-patient-010', 'Confirmed procedure planning'],
    ['13:00', 'dr-nora', 'seed-patient-011', 'Confirmed diabetes review'],
    ['13:30', 'dr-ilir', 'seed-patient-012', 'Confirmed mobility assessment'],
    ['14:00', 'dr-hana', 'seed-patient-013', 'Confirmed dizziness consult'],
    ['14:30', 'dr-fisnik', 'seed-patient-014', 'Confirmed X-ray report'],
] as const;

const admissions = [
    {
        id: 'seed-admission-001',
        patientId: 'seed-patient-005',
        roomNumber: 'ICU-01',
        admissionDate: atDateTime(today, '06:40'),
        dischargeDate: null,
        status: AdmissionStatus.ACTIVE,
    },
    {
        id: 'seed-admission-002',
        patientId: 'seed-patient-006',
        roomNumber: 'PED-02',
        admissionDate: atDateTime(today, '08:10'),
        dischargeDate: null,
        status: AdmissionStatus.ACTIVE,
    },
    {
        id: 'seed-admission-003',
        patientId: 'seed-patient-009',
        roomNumber: 'CARD-02',
        admissionDate: atDateTime(today, '09:20'),
        dischargeDate: null,
        status: AdmissionStatus.ACTIVE,
    },
    {
        id: 'seed-admission-004',
        patientId: 'seed-patient-012',
        roomNumber: 'SUR-02',
        admissionDate: atDateTime(today, '11:00'),
        dischargeDate: null,
        status: AdmissionStatus.ACTIVE,
    },
    {
        id: 'seed-admission-005',
        patientId: 'seed-patient-001',
        roomNumber: 'ER-01',
        admissionDate: atDateTime(tomorrow, '07:30'),
        dischargeDate: null,
        status: AdmissionStatus.ACTIVE,
    },
] as const;

const medicalRecords = [
    {
        id: 'seed-record-001',
        patientId: 'seed-patient-001',
        doctorKey: 'dr-mira',
        diagnosis: 'Acute respiratory infection',
        treatment: 'Observation, hydration, and follow-up if fever persists',
        prescriptionsText: 'Fever relief and hydration support summary',
        recordDate: atDateTime(today, '09:35'),
        prescriptions: [
            ['seed-prescription-001', 'Paracetamol', '500mg', '3 days', 'Take after meals if temperature is above 38 C'],
        ],
    },
    {
        id: 'seed-record-002',
        patientId: 'seed-patient-002',
        doctorKey: 'dr-arben',
        diagnosis: 'Hypertension follow-up',
        treatment: 'Continue therapy and repeat blood pressure log in two weeks',
        prescriptionsText: 'Continue antihypertensive therapy as structured below',
        recordDate: atDateTime(today, '10:05'),
        prescriptions: [
            ['seed-prescription-002', 'Amlodipine', '5mg', '30 days', 'Take once every morning'],
        ],
    },
    {
        id: 'seed-record-003',
        patientId: 'seed-patient-006',
        doctorKey: 'dr-elira',
        diagnosis: 'Viral gastroenteritis',
        treatment: 'Oral rehydration and light diet',
        prescriptionsText: 'Hydration replacement summary',
        recordDate: atDateTime(today, '12:05'),
        prescriptions: [
            ['seed-prescription-003', 'ORS', '1 sachet', '2 days', 'Dissolve in clean water after each loose stool'],
        ],
    },
    {
        id: 'seed-record-004',
        patientId: 'seed-patient-014',
        doctorKey: 'dr-ilir',
        diagnosis: 'Ankle sprain',
        treatment: 'Compression, elevation, and limited weight bearing',
        prescriptionsText: 'Pain management summary',
        recordDate: atDateTime(tomorrow, '14:40'),
        prescriptions: [
            ['seed-prescription-004', 'Ibuprofen', '400mg', '5 days', 'Take with food, maximum three times daily'],
        ],
    },
] as const;

const invoices = [
    {
        id: 'seed-invoice-001',
        patientId: 'seed-patient-001',
        amount: '45.00',
        invoiceDate: atDateTime(today, '10:00'),
        status: InvoiceStatus.PAID,
        description: 'Confirmed emergency consultation',
    },
    {
        id: 'seed-invoice-002',
        patientId: 'seed-patient-002',
        amount: '70.00',
        invoiceDate: atDateTime(today, '10:30'),
        status: InvoiceStatus.PENDING,
        description: 'Confirmed cardiology intake and ECG',
    },
    {
        id: 'seed-invoice-003',
        patientId: 'seed-patient-006',
        amount: '55.00',
        invoiceDate: atDateTime(today, '12:30'),
        status: InvoiceStatus.PAID,
        description: 'Confirmed pediatric treatment',
    },
    {
        id: 'seed-invoice-004',
        patientId: 'seed-patient-014',
        amount: '95.00',
        invoiceDate: atDateTime(tomorrow, '15:10'),
        status: InvoiceStatus.PENDING,
        description: 'Confirmed orthopedic review and X-ray',
    },
] as const;

function normalizeEmail(email: string) {
    return email.trim().toUpperCase();
}

function normalizeUsername(username: string) {
    return username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

function seedEmail(username: string) {
    return `${normalizeUsername(username)}@hospital.local`;
}

function atDate(date: string) {
    return new Date(`${date}T00:00:00.000Z`);
}

function atDateTime(date: string, time: string) {
    return new Date(`${date}T${time}:00.000Z`);
}

function atTime(time: string) {
    return new Date(`1970-01-01T${time}:00.000Z`);
}

function buildAppointments(
    date: string,
    rows: readonly (readonly [string, DoctorKey, string, string])[],
) {
    const dateId = date.replace(/-/g, '');

    return rows.map(([time, doctorKey, patientId, notes], index) => ({
        id: `seed-appointment-${dateId}-${String(index + 1).padStart(2, '0')}`,
        date,
        time,
        doctorKey,
        patientId,
        notes,
    }));
}

async function getRoleIds() {
    const roleNames: RoleName[] = [
        'DOCTOR',
        'NURSE',
        'RECEPTIONIST',
        'PATIENT',
        'USER',
    ];
    const entries = await Promise.all(
        roleNames.map(async (name) => {
            const role = await prisma.role.findUnique({
                where: {
                    normalizedName: name,
                },
            });

            if (!role) {
                throw new Error(`${name} role was not found after base role seeding`);
            }

            return [name, role.id] as const;
        }),
    );

    return new Map<RoleName, string>(entries);
}

async function assignRole(userId: string, roleId: string) {
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId,
                roleId,
            },
        },
        update: {},
        create: {
            userId,
            roleId,
        },
    });
}

async function upsertConfirmedUser(input: {
    firstName: string;
    lastName: string;
    username: string;
    roleName: RoleName;
    passwordHash: string;
    roleIds: Map<RoleName, string>;
    phoneNumber?: string;
}) {
    const username = normalizeUsername(input.username);
    const email = seedEmail(username);
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = username.toUpperCase();

    const user = await prisma.user.upsert({
        where: {
            normalizedEmail,
        },
        update: {
            firstName: input.firstName,
            lastName: input.lastName,
            email,
            normalizedEmail,
            username,
            normalizedUsername,
            passwordHash: input.passwordHash,
            phoneNumber: input.phoneNumber ?? null,
            emailConfirmed: true,
            lockoutEnabled: true,
            accessFailedCount: 0,
            isActive: true,
        },
        create: {
            firstName: input.firstName,
            lastName: input.lastName,
            email,
            normalizedEmail,
            username,
            normalizedUsername,
            passwordHash: input.passwordHash,
            phoneNumber: input.phoneNumber,
            emailConfirmed: true,
            lockoutEnabled: true,
            accessFailedCount: 0,
            isActive: true,
        },
    });

    const roleId = input.roleIds.get(input.roleName);

    if (!roleId) {
        throw new Error(`${input.roleName} role id missing`);
    }

    await assignRole(user.id, roleId);

    return user;
}

async function seedHospitalData() {
    const passwordHash = await bcrypt.hash(seedPassword, env.bcryptSaltRounds);
    const roleIds = await getRoleIds();
    const departmentIds = new Map<DepartmentKey, string>();

    for (const department of departments) {
        const savedDepartment = await prisma.department.upsert({
            where: {
                name: department.name,
            },
            update: {
                description: department.description,
                location: department.location,
                isActive: true,
            },
            create: {
                name: department.name,
                description: department.description,
                location: department.location,
                isActive: true,
            },
        });

        departmentIds.set(department.key, savedDepartment.id);
    }

    const doctorIds = new Map<DoctorKey, string>();

    for (const doctor of doctors) {
        const user = await upsertConfirmedUser({
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            username: doctor.username,
            roleName: 'DOCTOR',
            passwordHash,
            roleIds,
            phoneNumber: doctor.phoneNumber,
        });
        const departmentId = departmentIds.get(doctor.departmentKey);

        if (!departmentId) {
            throw new Error(`Department missing for ${doctor.departmentKey}`);
        }

        const savedDoctor = await prisma.doctor.upsert({
            where: {
                userId: user.id,
            },
            update: {
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization,
                departmentId,
                phoneNumber: doctor.phoneNumber,
                isActive: true,
            },
            create: {
                userId: user.id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization,
                departmentId,
                phoneNumber: doctor.phoneNumber,
                isActive: true,
            },
        });

        doctorIds.set(doctor.key, savedDoctor.id);
    }

    for (const nurse of nurses) {
        const user = await upsertConfirmedUser({
            firstName: nurse.firstName,
            lastName: nurse.lastName,
            username: nurse.username,
            roleName: 'NURSE',
            passwordHash,
            roleIds,
        });
        const departmentId = departmentIds.get(nurse.departmentKey);

        if (!departmentId) {
            throw new Error(`Department missing for ${nurse.departmentKey}`);
        }

        await prisma.nurse.upsert({
            where: {
                userId: user.id,
            },
            update: {
                firstName: nurse.firstName,
                lastName: nurse.lastName,
                departmentId,
                shift: nurse.shift,
            },
            create: {
                userId: user.id,
                firstName: nurse.firstName,
                lastName: nurse.lastName,
                departmentId,
                shift: nurse.shift,
            },
        });
    }

    for (const receptionist of receptionists) {
        await upsertConfirmedUser({
            firstName: receptionist.firstName,
            lastName: receptionist.lastName,
            username: receptionist.username,
            roleName: 'RECEPTIONIST',
            passwordHash,
            roleIds,
            phoneNumber: receptionist.phoneNumber,
        });
    }

    const roomIds = new Map<string, string>();

    for (const room of rooms) {
        const departmentId = departmentIds.get(room.departmentKey);

        if (!departmentId) {
            throw new Error(`Department missing for ${room.departmentKey}`);
        }

        const savedRoom = await prisma.room.upsert({
            where: {
                roomNumber: room.roomNumber,
            },
            update: {
                departmentId,
                type: room.type,
                status: room.status,
                capacity: room.capacity,
            },
            create: {
                roomNumber: room.roomNumber,
                departmentId,
                type: room.type,
                status: room.status,
                capacity: room.capacity,
            },
        });

        roomIds.set(room.roomNumber, savedRoom.id);
    }

    for (const [
        id,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phoneNumber,
        address,
        bloodType,
    ] of patients) {
        await prisma.patient.upsert({
            where: {
                id,
            },
            update: {
                firstName,
                lastName,
                dateOfBirth: atDate(dateOfBirth),
                gender,
                phoneNumber,
                address,
                bloodType,
                isDeleted: false,
            },
            create: {
                id,
                firstName,
                lastName,
                dateOfBirth: atDate(dateOfBirth),
                gender,
                phoneNumber,
                address,
                bloodType,
                isDeleted: false,
            },
        });
    }

    const appointments = [
        ...buildAppointments(today, todayAppointmentRows),
        ...buildAppointments(tomorrow, tomorrowAppointmentRows),
    ];

    for (const appointment of appointments) {
        const doctorId = doctorIds.get(appointment.doctorKey);

        if (!doctorId) {
            throw new Error(`Doctor missing for ${appointment.doctorKey}`);
        }

        await prisma.appointment.upsert({
            where: {
                id: appointment.id,
            },
            update: {
                patientId: appointment.patientId,
                doctorId,
                appointmentDate: atDate(appointment.date),
                appointmentTime: atTime(appointment.time),
                status: 'Scheduled',
                notes: appointment.notes,
            },
            create: {
                id: appointment.id,
                patientId: appointment.patientId,
                doctorId,
                appointmentDate: atDate(appointment.date),
                appointmentTime: atTime(appointment.time),
                status: 'Scheduled',
                notes: appointment.notes,
            },
        });
    }

    for (const admission of admissions) {
        const roomId = roomIds.get(admission.roomNumber);

        if (!roomId) {
            throw new Error(`Room missing for ${admission.roomNumber}`);
        }

        await prisma.admission.upsert({
            where: {
                id: admission.id,
            },
            update: {
                patientId: admission.patientId,
                roomId,
                admissionDate: admission.admissionDate,
                dischargeDate: admission.dischargeDate,
                status: admission.status,
            },
            create: {
                id: admission.id,
                patientId: admission.patientId,
                roomId,
                admissionDate: admission.admissionDate,
                dischargeDate: admission.dischargeDate,
                status: admission.status,
            },
        });
    }

    for (const record of medicalRecords) {
        const doctorId = doctorIds.get(record.doctorKey);

        if (!doctorId) {
            throw new Error(`Doctor missing for ${record.doctorKey}`);
        }

        await prisma.medicalRecord.upsert({
            where: {
                id: record.id,
            },
            update: {
                patientId: record.patientId,
                doctorId,
                diagnosis: record.diagnosis,
                treatment: record.treatment,
                prescriptionsText: record.prescriptionsText,
                recordDate: record.recordDate,
            },
            create: {
                id: record.id,
                patientId: record.patientId,
                doctorId,
                diagnosis: record.diagnosis,
                treatment: record.treatment,
                prescriptionsText: record.prescriptionsText,
                recordDate: record.recordDate,
            },
        });

        for (const [
            id,
            medicine,
            dosage,
            duration,
            instructions,
        ] of record.prescriptions) {
            await prisma.prescription.upsert({
                where: {
                    id,
                },
                update: {
                    medicalRecordId: record.id,
                    medicine,
                    dosage,
                    duration,
                    instructions,
                },
                create: {
                    id,
                    medicalRecordId: record.id,
                    medicine,
                    dosage,
                    duration,
                    instructions,
                },
            });
        }
    }

    for (const invoice of invoices) {
        await prisma.invoice.upsert({
            where: {
                id: invoice.id,
            },
            update: {
                patientId: invoice.patientId,
                amount: invoice.amount,
                invoiceDate: invoice.invoiceDate,
                status: invoice.status,
                description: invoice.description,
            },
            create: {
                id: invoice.id,
                patientId: invoice.patientId,
                amount: invoice.amount,
                invoiceDate: invoice.invoiceDate,
                status: invoice.status,
                description: invoice.description,
            },
        });
    }

    return {
        departments: departments.length,
        doctors: doctors.length,
        nurses: nurses.length,
        receptionists: receptionists.length,
        rooms: rooms.length,
        patients: patients.length,
        appointmentsToday: todayAppointmentRows.length,
        appointmentsTomorrow: tomorrowAppointmentRows.length,
        admissions: admissions.length,
        medicalRecords: medicalRecords.length,
        invoices: invoices.length,
    };
}

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

    const summary = await seedHospitalData();

    console.log(
        [
            `Hospital data seeded for ${today} and ${tomorrow}:`,
            `${summary.departments} departments`,
            `${summary.doctors} doctors`,
            `${summary.nurses} nurses`,
            `${summary.receptionists} receptionists`,
            `${summary.rooms} rooms`,
            `${summary.patients} patients`,
            `${summary.appointmentsToday} appointments today`,
            `${summary.appointmentsTomorrow} appointments tomorrow`,
            `${summary.admissions} admissions`,
            `${summary.medicalRecords} medical records`,
            `${summary.invoices} invoices`,
        ].join(' '),
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
