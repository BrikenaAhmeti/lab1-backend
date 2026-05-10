import swaggerJSDoc from 'swagger-jsdoc';

const bearerSecurity = [{ bearerAuth: [] }];

function jsonContent(schema: Record<string, unknown>, example?: unknown) {
    return {
        'application/json': {
            schema,
            ...(example !== undefined ? { example } : {}),
        },
    };
}

function response(
    description: string,
    schema: Record<string, unknown>,
    example?: unknown,
) {
    return {
        description,
        content: jsonContent(schema, example),
    };
}

function requestBody(
    description: string,
    schema: Record<string, unknown>,
    example: unknown,
    required = true,
) {
    return {
        required,
        description,
        content: jsonContent(schema, example),
    };
}

function paginatedSchema(ref: string) {
    return {
        type: 'object',
        properties: {
            data: {
                type: 'array',
                items: { $ref: ref },
            },
            total: { type: 'integer', example: 1 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 1 },
        },
        required: ['data', 'total', 'page', 'limit', 'totalPages'],
    };
}

function noContentResponse(description: string) {
    return {
        description,
    };
}

function errorResponse(statusCode: number, description: string) {
    return response(description, { $ref: '#/components/schemas/ErrorResponse' }, {
        success: false,
        message: description,
        statusCode,
    });
}

function idPathParameter(name: string, description: string) {
    return {
        name,
        in: 'path',
        required: true,
        description,
        schema: {
            type: 'string',
        },
    };
}

const paginationParameters = [
    {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: 'Page number',
    },
    {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        description: 'Page size',
    },
    {
        name: 'sortBy',
        in: 'query',
        schema: { type: 'string' },
        description: 'Sort field',
    },
    {
        name: 'order',
        in: 'query',
        schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' },
        description: 'Sort direction',
    },
];

const sortOnlyParameters = [
    {
        name: 'sortBy',
        in: 'query',
        schema: {
            type: 'string',
            enum: ['created_at', 'name', 'location'],
            default: 'created_at',
        },
        description: 'Sort field (all departments returned; no paging)',
    },
    {
        name: 'order',
        in: 'query',
        schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' },
        description: 'Sort direction',
    },
];

function departmentListSchema(ref: string) {
    return {
        type: 'object',
        properties: {
            data: {
                type: 'array',
                items: { $ref: ref },
            },
        },
        required: ['data'],
    };
}

const patientExample = {
    id: 'patient-1',
    firstName: 'Ana',
    lastName: 'Krasniqi',
    dateOfBirth: '1998-03-10T00:00:00.000Z',
    gender: 'FEMALE',
    phoneNumber: '+38344111222',
    address: 'Prishtine',
    bloodType: 'A+',
    isDeleted: false,
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const departmentExample = {
    id: 'department-1',
    name: 'Cardiology',
    description: 'Heart care department',
    location: 'Block A',
    isActive: true,
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const doctorExample = {
    id: 'doctor-1',
    userId: 'user-2',
    firstName: 'Arben',
    lastName: 'Hoxha',
    specialization: 'Cardiology',
    departmentId: 'department-1',
    phoneNumber: '+38344123456',
    department: {
        id: 'department-1',
        name: 'Cardiology',
        location: 'Block A',
    },
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const nurseExample = {
    id: 'nurse-1',
    firstName: 'Sara',
    lastName: 'Krasniqi',
    departmentId: 'department-1',
    shift: 'Morning',
    department: {
        id: 'department-1',
        name: 'Cardiology',
        location: 'Block A',
    },
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const appointmentExample = {
    id: 'appointment-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    appointmentDate: '2026-05-09T00:00:00.000Z',
    appointmentTime: '10:30',
    status: 'Scheduled',
    notes: 'Routine check-up',
    patient: {
        id: 'patient-1',
        firstName: 'Ana',
        lastName: 'Krasniqi',
    },
    doctor: {
        id: 'doctor-1',
        firstName: 'Arben',
        lastName: 'Hoxha',
        specialization: 'Cardiology',
    },
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const medicalRecordExample = {
    id: 'medical-record-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    diagnosis: 'Seasonal flu',
    treatment: 'Rest and hydration',
    prescriptionsText: 'Paracetamol as needed',
    recordDate: '2026-05-08T00:00:00.000Z',
    patient: {
        id: 'patient-1',
        firstName: 'Ana',
        lastName: 'Krasniqi',
    },
    doctor: {
        id: 'doctor-1',
        firstName: 'Arben',
        lastName: 'Hoxha',
        specialization: 'Cardiology',
    },
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const prescriptionExample = {
    id: 'prescription-1',
    medicalRecordId: 'medical-record-1',
    medicine: 'Paracetamol',
    dosage: '500mg',
    duration: '5 days',
    instructions: 'After meals',
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const roomExample = {
    id: 'room-1',
    roomNumber: '101',
    departmentId: 'department-1',
    type: 'GENERAL',
    status: 'AVAILABLE',
    capacity: 2,
    activeAdmissionsCount: 0,
    availableCapacity: 2,
    department: {
        id: 'department-1',
        name: 'Cardiology',
        location: 'Block A',
    },
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const roomDetailExample = {
    ...roomExample,
    currentAdmissions: [],
};

const admissionExample = {
    id: 'admission-1',
    patientId: 'patient-1',
    roomId: 'room-1',
    admissionDate: '2026-05-08T00:00:00.000Z',
    dischargeDate: null,
    status: 'ACTIVE',
    patient: {
        id: 'patient-1',
        firstName: 'Ana',
        lastName: 'Krasniqi',
    },
    room: {
        id: 'room-1',
        roomNumber: '101',
        departmentId: 'department-1',
        type: 'GENERAL',
        status: 'AVAILABLE',
        capacity: 2,
        department: {
            id: 'department-1',
            name: 'Cardiology',
            location: 'Block A',
        },
    },
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const invoiceExample = {
    id: 'invoice-1',
    patientId: 'patient-1',
    amount: 120.5,
    invoiceDate: '2026-05-08T00:00:00.000Z',
    status: 'PENDING',
    description: 'Consultation fee',
    patient: {
        id: 'patient-1',
        firstName: 'Ana',
        lastName: 'Krasniqi',
    },
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const authUserExample = {
    id: 'user-1',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@example.com',
    username: 'admin',
    phoneNumber: '+38344123456',
    emailConfirmed: true,
    isActive: true,
    lockoutEnabled: true,
    accessFailedCount: 0,
    roles: ['ADMIN'],
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const authResponseExample = {
    user: authUserExample,
    accessToken: 'jwt-access-token',
    refreshToken: 'jwt-refresh-token',
};

const roleExample = {
    id: 'role-1',
    name: 'Admin',
    description: 'Full access to the system',
    normalizedName: 'ADMIN',
    isActive: true,
    createdAt: '2026-05-08T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
};

const userRoleExample = {
    id: 'user-role-1',
    userId: 'user-1',
    roleId: 'role-1',
    createdAt: '2026-05-08T10:00:00.000Z',
    role: roleExample,
};

const refreshTokenExample = {
    id: 'refresh-token-1',
    userId: 'user-1',
    tokenId: 'refresh-token-jti',
    expires: '2026-05-15T10:00:00.000Z',
    created: '2026-05-08T10:00:00.000Z',
    revoked: null,
    replacedByTokenId: null,
};

const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'Hospital Management System API',
        version: '1.0.0',
        description: 'Backend API for the Lab Course 1 hospital management system built with Express, TypeScript, PostgreSQL, CQRS, and JWT authentication.',
    },
    servers: [
        {
            url: 'http://localhost:3005',
            description: 'Local development server',
        },
    ],
    tags: [
        { name: 'Auth' },
        { name: 'Patients' },
        { name: 'Departments' },
        { name: 'Doctors' },
        { name: 'Nurses' },
        { name: 'Appointments' },
        { name: 'Medical Records' },
        { name: 'Prescriptions' },
        { name: 'Rooms' },
        { name: 'Admissions' },
        { name: 'Invoices' },
        { name: 'Dashboard' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Validation failed' },
                    errors: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string', example: 'phoneNumber' },
                                message: { type: 'string', example: 'phoneNumber format is invalid' },
                            },
                        },
                    },
                    statusCode: { type: 'integer', example: 400 },
                },
                required: ['success', 'message', 'statusCode'],
            },
            Patient: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string', format: 'date-time' },
                    gender: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    address: { type: 'string' },
                    bloodType: { type: 'string' },
                    isDeleted: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Department: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    location: { type: 'string' },
                    isActive: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Doctor: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string', nullable: true },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    specialization: { type: 'string' },
                    departmentId: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    department: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            location: { type: 'string' },
                        },
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Nurse: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    departmentId: { type: 'string' },
                    shift: { type: 'string', enum: ['Morning', 'Evening', 'Night'] },
                    department: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            location: { type: 'string' },
                        },
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Appointment: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    patientId: { type: 'string' },
                    doctorId: { type: 'string' },
                    appointmentDate: { type: 'string', format: 'date-time' },
                    appointmentTime: { type: 'string' },
                    status: { type: 'string', enum: ['Scheduled', 'Completed', 'Cancelled'] },
                    notes: { type: 'string', nullable: true },
                    patient: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                        },
                    },
                    doctor: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            specialization: { type: 'string' },
                        },
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            MedicalRecord: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    patientId: { type: 'string' },
                    doctorId: { type: 'string' },
                    diagnosis: { type: 'string' },
                    treatment: { type: 'string' },
                    prescriptionsText: { type: 'string', nullable: true },
                    recordDate: { type: 'string', format: 'date-time' },
                    patient: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                        },
                    },
                    doctor: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            specialization: { type: 'string' },
                        },
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Prescription: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    medicalRecordId: { type: 'string' },
                    medicine: { type: 'string' },
                    dosage: { type: 'string' },
                    duration: { type: 'string' },
                    instructions: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Room: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    roomNumber: { type: 'string' },
                    departmentId: { type: 'string' },
                    type: { type: 'string', enum: ['GENERAL', 'ICU', 'SURGERY', 'EMERGENCY', 'PEDIATRIC'] },
                    status: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE'] },
                    capacity: { type: 'integer' },
                    activeAdmissionsCount: { type: 'integer' },
                    availableCapacity: { type: 'integer' },
                    department: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            location: { type: 'string' },
                        },
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            RoomDetail: {
                allOf: [
                    { $ref: '#/components/schemas/Room' },
                    {
                        type: 'object',
                        properties: {
                            currentAdmissions: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        patientId: { type: 'string' },
                                        roomId: { type: 'string' },
                                        admissionDate: { type: 'string', format: 'date-time' },
                                        dischargeDate: { type: 'string', format: 'date-time', nullable: true },
                                        status: { type: 'string' },
                                        patient: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                firstName: { type: 'string' },
                                                lastName: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            Admission: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    patientId: { type: 'string' },
                    roomId: { type: 'string' },
                    admissionDate: { type: 'string', format: 'date-time' },
                    dischargeDate: { type: 'string', format: 'date-time', nullable: true },
                    status: { type: 'string', enum: ['ACTIVE', 'DISCHARGED'] },
                    patient: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                        },
                    },
                    room: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            roomNumber: { type: 'string' },
                            departmentId: { type: 'string' },
                            type: { type: 'string' },
                            status: { type: 'string' },
                            capacity: { type: 'integer' },
                            department: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    location: { type: 'string' },
                                },
                            },
                        },
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Invoice: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    patientId: { type: 'string' },
                    amount: { type: 'number' },
                    invoiceDate: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['PENDING', 'PAID', 'CANCELLED'] },
                    description: { type: 'string', nullable: true },
                    patient: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                        },
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            InvoiceStats: {
                type: 'object',
                properties: {
                    totalRevenue: { type: 'number' },
                },
            },
            DashboardStats: {
                type: 'object',
                properties: {
                    appointmentsToday: { type: 'integer' },
                    availableRooms: { type: 'integer' },
                    admittedPatients: { type: 'integer' },
                    totalPatients: { type: 'integer' },
                    totalDoctors: { type: 'integer' },
                    pendingInvoicesAmount: { type: 'number' },
                },
            },
            AuthUser: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    username: { type: 'string' },
                    phoneNumber: { type: 'string', nullable: true },
                    emailConfirmed: { type: 'boolean' },
                    isActive: { type: 'boolean' },
                    lockoutEnabled: { type: 'boolean' },
                    accessFailedCount: { type: 'integer' },
                    roles: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    user: { $ref: '#/components/schemas/AuthUser' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                },
            },
            Role: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    normalizedName: { type: 'string' },
                    isActive: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            UserRole: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    roleId: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    role: { $ref: '#/components/schemas/Role' },
                },
            },
            RefreshTokenInfo: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    userId: { type: 'string' },
                    tokenId: { type: 'string' },
                    expires: { type: 'string', format: 'date-time' },
                    created: { type: 'string', format: 'date-time' },
                    revoked: { type: 'string', format: 'date-time', nullable: true },
                    replacedByTokenId: { type: 'string', nullable: true },
                },
            },
        },
    },
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register user',
                description: 'Registers a new user and returns JWT access and refresh tokens.',
                requestBody: requestBody(
                    'Registration payload',
                    {
                        type: 'object',
                        required: ['firstName', 'lastName', 'email', 'password'],
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                            username: { type: 'string' },
                            password: { type: 'string' },
                            phoneNumber: { type: 'string' },
                        },
                    },
                    {
                        firstName: 'System',
                        lastName: 'Admin',
                        email: 'admin@example.com',
                        username: 'admin',
                        password: 'Secret123',
                        phoneNumber: '+38344123456',
                    },
                ),
                responses: {
                    '201': response('User registered successfully', { $ref: '#/components/schemas/AuthResponse' }, authResponseExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '409': errorResponse(409, 'Email already exists'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login user',
                description: 'Authenticates a user with identifier or email and returns JWT tokens.',
                requestBody: requestBody(
                    'Login payload',
                    {
                        type: 'object',
                        required: ['password'],
                        properties: {
                            identifier: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string' },
                        },
                    },
                    {
                        identifier: 'admin',
                        password: 'Secret123',
                    },
                ),
                responses: {
                    '200': response('Login successful', { $ref: '#/components/schemas/AuthResponse' }, authResponseExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/refresh': {
            post: {
                tags: ['Auth'],
                summary: 'Refresh tokens',
                description: 'Generates a new access token and refresh token pair using the refresh token from the httpOnly cookie or request body.',
                requestBody: requestBody(
                    'Optional refresh token payload',
                    {
                        type: 'object',
                        properties: {
                            refreshToken: { type: 'string' },
                        },
                    },
                    {
                        refreshToken: 'jwt-refresh-token',
                    },
                ),
                responses: {
                    '200': response('Tokens refreshed successfully', { $ref: '#/components/schemas/AuthResponse' }, authResponseExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Logout user',
                description: 'Revokes the current refresh token from the httpOnly cookie or request body and logs the user out.',
                requestBody: requestBody(
                    'Optional logout payload',
                    {
                        type: 'object',
                        properties: {
                            refreshToken: { type: 'string' },
                        },
                    },
                    {
                        refreshToken: 'jwt-refresh-token',
                    },
                ),
                responses: {
                    '204': noContentResponse('Logout successful'),
                    '400': errorResponse(400, 'Validation failed'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/logout-all': {
            post: {
                tags: ['Auth'],
                summary: 'Logout from all devices',
                description: 'Revokes all refresh tokens for the authenticated user.',
                security: bearerSecurity,
                responses: {
                    '204': noContentResponse('All refresh tokens revoked successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get current user',
                description: 'Returns the authenticated user profile and roles.',
                security: bearerSecurity,
                responses: {
                    '200': response('Authenticated user loaded successfully', { $ref: '#/components/schemas/AuthUser' }, authUserExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/users': {
            get: {
                tags: ['Auth'],
                summary: 'List users',
                description: 'Returns all identity users.',
                security: bearerSecurity,
                responses: {
                    '200': response('Users retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/AuthUser' } }, [authUserExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Auth'],
                summary: 'Create user',
                description: 'Creates a user from the admin panel.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'User payload',
                    {
                        type: 'object',
                        required: ['firstName', 'lastName', 'email', 'password'],
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                            username: { type: 'string' },
                            password: { type: 'string' },
                            phoneNumber: { type: 'string' },
                            emailConfirmed: { type: 'boolean' },
                            lockoutEnabled: { type: 'boolean' },
                            isActive: { type: 'boolean' },
                            roleIds: { type: 'array', items: { type: 'string' } },
                        },
                    },
                    {
                        firstName: 'Erza',
                        lastName: 'Bytyqi',
                        email: 'erza@example.com',
                        username: 'erza',
                        password: 'Secret123',
                        roleIds: ['role-1'],
                    },
                ),
                responses: {
                    '201': response('User created successfully', { $ref: '#/components/schemas/AuthUser' }, authUserExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '409': errorResponse(409, 'Email already exists'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/users/{id}': {
            get: {
                tags: ['Auth'],
                summary: 'Get user by id',
                description: 'Loads one user from the identity module.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'User id')],
                responses: {
                    '200': response('User retrieved successfully', { $ref: '#/components/schemas/AuthUser' }, authUserExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'User not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            patch: {
                tags: ['Auth'],
                summary: 'Update user',
                description: 'Updates user information and assigned roles.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'User id')],
                requestBody: requestBody(
                    'User update payload',
                    {
                        type: 'object',
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                            username: { type: 'string' },
                            password: { type: 'string' },
                            phoneNumber: { type: 'string', nullable: true },
                            emailConfirmed: { type: 'boolean' },
                            lockoutEnabled: { type: 'boolean' },
                            isActive: { type: 'boolean' },
                            roleIds: { type: 'array', items: { type: 'string' } },
                        },
                    },
                    {
                        phoneNumber: null,
                        isActive: true,
                    },
                ),
                responses: {
                    '200': response('User updated successfully', { $ref: '#/components/schemas/AuthUser' }, authUserExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'User not found'),
                    '409': errorResponse(409, 'Email already exists'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Auth'],
                summary: 'Delete user',
                description: 'Deletes a user from the identity module.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'User id')],
                responses: {
                    '204': noContentResponse('User deleted successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'User not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/users/{id}/status': {
            patch: {
                tags: ['Auth'],
                summary: 'Set user status',
                description: 'Activates or deactivates a user.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'User id')],
                requestBody: requestBody(
                    'Status payload',
                    {
                        type: 'object',
                        required: ['isActive'],
                        properties: {
                            isActive: { type: 'boolean' },
                        },
                    },
                    {
                        isActive: false,
                    },
                ),
                responses: {
                    '200': response('User status updated successfully', { $ref: '#/components/schemas/AuthUser' }, authUserExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'User not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/roles': {
            get: {
                tags: ['Auth'],
                summary: 'List roles',
                description: 'Returns all available roles.',
                security: bearerSecurity,
                responses: {
                    '200': response('Roles retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/Role' } }, [roleExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Auth'],
                summary: 'Create role',
                description: 'Creates a new role.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Role payload',
                    {
                        type: 'object',
                        required: ['name'],
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            isActive: { type: 'boolean' },
                        },
                    },
                    {
                        name: 'Receptionist',
                        description: 'Front desk role',
                        isActive: true,
                    },
                ),
                responses: {
                    '201': response('Role created successfully', { $ref: '#/components/schemas/Role' }, roleExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '409': errorResponse(409, 'Role already exists'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/roles/{roleId}': {
            patch: {
                tags: ['Auth'],
                summary: 'Update role',
                description: 'Updates an existing role.',
                security: bearerSecurity,
                parameters: [idPathParameter('roleId', 'Role id')],
                requestBody: requestBody(
                    'Role update payload',
                    {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string', nullable: true },
                            isActive: { type: 'boolean' },
                        },
                    },
                    {
                        description: 'Updated description',
                        isActive: true,
                    },
                ),
                responses: {
                    '200': response('Role updated successfully', { $ref: '#/components/schemas/Role' }, roleExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Role not found'),
                    '409': errorResponse(409, 'Role already exists'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Auth'],
                summary: 'Delete role',
                description: 'Deletes a role if it is not assigned to users.',
                security: bearerSecurity,
                parameters: [idPathParameter('roleId', 'Role id')],
                responses: {
                    '204': noContentResponse('Role deleted successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Role not found'),
                    '409': errorResponse(409, 'Role cannot be deleted while assigned'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/users/{userId}/roles': {
            get: {
                tags: ['Auth'],
                summary: 'List user roles',
                description: 'Returns all roles assigned to a user.',
                security: bearerSecurity,
                parameters: [idPathParameter('userId', 'User id')],
                responses: {
                    '200': response('User roles retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/UserRole' } }, [userRoleExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'User not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Auth'],
                summary: 'Assign role to user',
                description: 'Assigns one role to a user and returns the updated user roles.',
                security: bearerSecurity,
                parameters: [idPathParameter('userId', 'User id')],
                requestBody: requestBody(
                    'Role assignment payload',
                    {
                        type: 'object',
                        required: ['roleId'],
                        properties: {
                            roleId: { type: 'string' },
                        },
                    },
                    {
                        roleId: 'role-1',
                    },
                ),
                responses: {
                    '200': response('Role assigned successfully', { type: 'array', items: { $ref: '#/components/schemas/UserRole' } }, [userRoleExample]),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'User or role not found'),
                    '409': errorResponse(409, 'Role already assigned'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Auth'],
                summary: 'Replace user roles',
                description: 'Replaces all user roles with the provided role ids.',
                security: bearerSecurity,
                parameters: [idPathParameter('userId', 'User id')],
                requestBody: requestBody(
                    'Replace roles payload',
                    {
                        type: 'object',
                        required: ['roleIds'],
                        properties: {
                            roleIds: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                        },
                    },
                    {
                        roleIds: ['role-1'],
                    },
                ),
                responses: {
                    '200': response('User roles replaced successfully', { type: 'array', items: { $ref: '#/components/schemas/UserRole' } }, [userRoleExample]),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'User or role not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/users/{userId}/roles/{roleId}': {
            delete: {
                tags: ['Auth'],
                summary: 'Remove role from user',
                description: 'Removes a specific role assignment from a user.',
                security: bearerSecurity,
                parameters: [
                    idPathParameter('userId', 'User id'),
                    idPathParameter('roleId', 'Role id'),
                ],
                responses: {
                    '200': response('Role removed successfully', { type: 'array', items: { $ref: '#/components/schemas/UserRole' } }, [userRoleExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Role assignment not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/auth/users/{userId}/refresh-tokens': {
            get: {
                tags: ['Auth'],
                summary: 'List user refresh tokens',
                description: 'Returns active and historical refresh tokens for a user.',
                security: bearerSecurity,
                parameters: [idPathParameter('userId', 'User id')],
                responses: {
                    '200': response('Refresh tokens retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/RefreshTokenInfo' } }, [refreshTokenExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'User not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Auth'],
                summary: 'Revoke all user refresh tokens',
                description: 'Revokes all refresh tokens for a user.',
                security: bearerSecurity,
                parameters: [idPathParameter('userId', 'User id')],
                responses: {
                    '204': noContentResponse('User refresh tokens revoked successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'User not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/patients': {
            get: {
                tags: ['Patients'],
                summary: 'List patients',
                description: 'Returns patients with pagination, sorting, and optional search filters.',
                security: bearerSecurity,
                parameters: [
                    ...paginationParameters,
                    { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by full name' },
                    { name: 'bloodGroup', in: 'query', schema: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }, description: 'Filter by blood group' },
                    { name: 'gender', in: 'query', schema: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] }, description: 'Filter by gender' },
                ],
                responses: {
                    '200': response('Patients retrieved successfully', paginatedSchema('#/components/schemas/Patient'), {
                        data: [patientExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Patients'],
                summary: 'Create patient',
                description: 'Creates a new patient record.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Patient payload',
                    {
                        type: 'object',
                        required: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber', 'address', 'bloodType'],
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            dateOfBirth: { type: 'string', example: '1998-03-10' },
                            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
                            phoneNumber: { type: 'string' },
                            address: { type: 'string' },
                            bloodType: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
                        },
                    },
                    {
                        firstName: 'Ana',
                        lastName: 'Krasniqi',
                        dateOfBirth: '1998-03-10',
                        gender: 'FEMALE',
                        phoneNumber: '+38344111222',
                        address: 'Prishtine',
                        bloodType: 'A+',
                    },
                ),
                responses: {
                    '201': response('Patient created successfully', { $ref: '#/components/schemas/Patient' }, patientExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/patients/{id}': {
            get: {
                tags: ['Patients'],
                summary: 'Get patient by id',
                description: 'Returns a single patient.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Patient id')],
                responses: {
                    '200': response('Patient retrieved successfully', { $ref: '#/components/schemas/Patient' }, patientExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Patient not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Patients'],
                summary: 'Update patient',
                description: 'Updates patient information.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Patient id')],
                requestBody: requestBody(
                    'Patient update payload',
                    {
                        type: 'object',
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            dateOfBirth: { type: 'string', example: '1998-03-10' },
                            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
                            phoneNumber: { type: 'string' },
                            address: { type: 'string' },
                            bloodType: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
                        },
                    },
                    {
                        address: 'Peje',
                        phoneNumber: '+38344123456',
                    },
                ),
                responses: {
                    '200': response('Patient updated successfully', { $ref: '#/components/schemas/Patient' }, patientExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Patient not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Patients'],
                summary: 'Delete patient',
                description: 'Soft deletes a patient. Admin role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Patient id')],
                responses: {
                    '204': noContentResponse('Patient deleted successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Patient not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/departments': {
            get: {
                tags: ['Departments'],
                summary: 'List departments',
                description: 'Returns hospital departments with pagination and sorting.',
                security: bearerSecurity,
                parameters: paginationParameters,
                responses: {
                    '200': response('Departments retrieved successfully', paginatedSchema('#/components/schemas/Department'), {
                        data: [departmentExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Departments'],
                summary: 'Create department',
                description: 'Creates a new hospital department.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Department payload',
                    {
                        type: 'object',
                        required: ['name', 'location'],
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            location: { type: 'string' },
                        },
                    },
                    {
                        name: 'Cardiology',
                        description: 'Heart care department',
                        location: 'Block A',
                    },
                ),
                responses: {
                    '201': response('Department created successfully', { $ref: '#/components/schemas/Department' }, departmentExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/departments/all': {
            get: {
                tags: ['Departments'],
                summary: 'List all departments',
                description: 'Returns every department with optional sorting. No paging (no page or limit query parameters).',
                security: bearerSecurity,
                parameters: sortOnlyParameters,
                responses: {
                    '200': response('Departments retrieved successfully', departmentListSchema('#/components/schemas/Department'), {
                        data: [departmentExample],
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/departments/{id}': {
            get: {
                tags: ['Departments'],
                summary: 'Get department by id',
                description: 'Returns one department.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Department id')],
                responses: {
                    '200': response('Department retrieved successfully', { $ref: '#/components/schemas/Department' }, departmentExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Department not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Departments'],
                summary: 'Update department',
                description: 'Updates department details.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Department id')],
                requestBody: requestBody(
                    'Department update payload',
                    {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            location: { type: 'string' },
                        },
                    },
                    {
                        name: 'Neurology',
                        description: 'Brain care department',
                        location: 'Block B',
                    },
                ),
                responses: {
                    '200': response('Department updated successfully', { $ref: '#/components/schemas/Department' }, departmentExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Department not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Departments'],
                summary: 'Delete department',
                description: 'Deletes a department if it has no dependent doctors, rooms, or nurses.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Department id')],
                responses: {
                    '204': noContentResponse('Department deleted successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Department not found'),
                    '409': errorResponse(409, 'Department cannot be deleted because it has related data'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/departments/{id}/doctors': {
            get: {
                tags: ['Departments'],
                summary: 'List department doctors',
                description: 'Returns all doctors assigned to the department.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Department id')],
                responses: {
                    '200': response('Department doctors retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/Doctor' } }, [doctorExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Department not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/departments/{id}/rooms': {
            get: {
                tags: ['Departments'],
                summary: 'List department rooms',
                description: 'Returns all rooms assigned to the department.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Department id')],
                responses: {
                    '200': response('Department rooms retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/Room' } }, [roomExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Department not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/departments/{id}/nurses': {
            get: {
                tags: ['Departments'],
                summary: 'List department nurses',
                description: 'Returns all nurses assigned to the department.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Department id')],
                responses: {
                    '200': response('Department nurses retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/Nurse' } }, [nurseExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Department not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/doctors': {
            get: {
                tags: ['Doctors'],
                summary: 'List doctors',
                description: 'Returns doctors with pagination, filtering, and sorting.',
                security: bearerSecurity,
                parameters: [
                    ...paginationParameters,
                    { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Filter by department id' },
                    { name: 'specialization', in: 'query', schema: { type: 'string' }, description: 'Filter by specialization' },
                ],
                responses: {
                    '200': response('Doctors retrieved successfully', paginatedSchema('#/components/schemas/Doctor'), {
                        data: [doctorExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Doctors'],
                summary: 'Create doctor',
                description: 'Creates a doctor linked to a user and department. Admin role required.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Doctor payload',
                    {
                        type: 'object',
                        required: ['firstName', 'lastName', 'specialization', 'departmentId', 'phoneNumber'],
                        properties: {
                            userId: {
                                type: 'string',
                                description: 'Optional existing user id. If omitted, a linked doctor user is auto-created.',
                            },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            specialization: { type: 'string' },
                            departmentId: { type: 'string' },
                            phoneNumber: { type: 'string' },
                        },
                    },
                    {
                        firstName: 'Arben',
                        lastName: 'Hoxha',
                        specialization: 'Cardiology',
                        departmentId: 'department-1',
                        phoneNumber: '+38344123456',
                    },
                ),
                responses: {
                    '201': response('Doctor created successfully', { $ref: '#/components/schemas/Doctor' }, doctorExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Department or user not found'),
                    '409': errorResponse(409, 'Doctor already exists for this user'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/doctors/{id}': {
            get: {
                tags: ['Doctors'],
                summary: 'Get doctor by id',
                description: 'Returns one doctor with department information.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Doctor id')],
                responses: {
                    '200': response('Doctor retrieved successfully', { $ref: '#/components/schemas/Doctor' }, doctorExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Doctor not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Doctors'],
                summary: 'Update doctor',
                description: 'Updates doctor details.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Doctor id')],
                requestBody: requestBody(
                    'Doctor update payload',
                    {
                        type: 'object',
                        properties: {
                            userId: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            specialization: { type: 'string' },
                            departmentId: { type: 'string' },
                            phoneNumber: { type: 'string' },
                        },
                    },
                    {
                        specialization: 'Neurology',
                        phoneNumber: '+38344111223',
                    },
                ),
                responses: {
                    '200': response('Doctor updated successfully', { $ref: '#/components/schemas/Doctor' }, doctorExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Doctor not found'),
                    '409': errorResponse(409, 'Doctor already exists for this user'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Doctors'],
                summary: 'Delete doctor',
                description: 'Deletes a doctor. Admin role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Doctor id')],
                responses: {
                    '204': noContentResponse('Doctor deleted successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Doctor not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/nurses': {
            get: {
                tags: ['Nurses'],
                summary: 'List nurses',
                description: 'Returns nurses with optional department filtering.',
                security: bearerSecurity,
                parameters: [
                    ...paginationParameters,
                    { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Filter by department id' },
                ],
                responses: {
                    '200': response('Nurses retrieved successfully', paginatedSchema('#/components/schemas/Nurse'), {
                        data: [nurseExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Nurses'],
                summary: 'Create nurse',
                description: 'Creates a nurse record. Admin role required.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Nurse payload',
                    {
                        type: 'object',
                        required: ['firstName', 'lastName', 'departmentId', 'shift'],
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            departmentId: { type: 'string' },
                            shift: { type: 'string', enum: ['Morning', 'Evening', 'Night'] },
                        },
                    },
                    {
                        firstName: 'Sara',
                        lastName: 'Krasniqi',
                        departmentId: 'department-1',
                        shift: 'Morning',
                    },
                ),
                responses: {
                    '201': response('Nurse created successfully', { $ref: '#/components/schemas/Nurse' }, nurseExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Department not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/nurses/{id}': {
            get: {
                tags: ['Nurses'],
                summary: 'Get nurse by id',
                description: 'Returns one nurse.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Nurse id')],
                responses: {
                    '200': response('Nurse retrieved successfully', { $ref: '#/components/schemas/Nurse' }, nurseExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Nurse not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Nurses'],
                summary: 'Update nurse',
                description: 'Updates nurse details.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Nurse id')],
                requestBody: requestBody(
                    'Nurse update payload',
                    {
                        type: 'object',
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            departmentId: { type: 'string' },
                            shift: { type: 'string', enum: ['Morning', 'Evening', 'Night'] },
                        },
                    },
                    {
                        shift: 'Evening',
                    },
                ),
                responses: {
                    '200': response('Nurse updated successfully', { $ref: '#/components/schemas/Nurse' }, nurseExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Nurse not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Nurses'],
                summary: 'Delete nurse',
                description: 'Deletes a nurse. Admin role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Nurse id')],
                responses: {
                    '204': noContentResponse('Nurse deleted successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Nurse not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/appointments': {
            get: {
                tags: ['Appointments'],
                summary: 'List appointments',
                description: 'Returns appointments with pagination, date filters, and search options.',
                security: bearerSecurity,
                parameters: [
                    ...paginationParameters,
                    { name: 'date', in: 'query', schema: { type: 'string' }, description: 'Filter by one date (YYYY-MM-DD)' },
                    { name: 'doctorId', in: 'query', schema: { type: 'string' }, description: 'Filter by doctor id' },
                    { name: 'patientId', in: 'query', schema: { type: 'string' }, description: 'Filter by patient id' },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['Scheduled', 'Completed', 'Cancelled'] }, description: 'Filter by appointment status' },
                    { name: 'from', in: 'query', schema: { type: 'string' }, description: 'Start date range (YYYY-MM-DD)' },
                    { name: 'to', in: 'query', schema: { type: 'string' }, description: 'End date range (YYYY-MM-DD)' },
                ],
                responses: {
                    '200': response('Appointments retrieved successfully', paginatedSchema('#/components/schemas/Appointment'), {
                        data: [appointmentExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Appointments'],
                summary: 'Create appointment',
                description: 'Books a new appointment and checks doctor schedule conflicts.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Appointment payload',
                    {
                        type: 'object',
                        required: ['patientId', 'doctorId', 'date', 'time'],
                        properties: {
                            patientId: { type: 'string' },
                            doctorId: { type: 'string' },
                            date: { type: 'string', example: '2026-05-09' },
                            time: { type: 'string', example: '10:30' },
                            notes: { type: 'string' },
                        },
                    },
                    {
                        patientId: 'patient-1',
                        doctorId: 'doctor-1',
                        date: '2026-05-09',
                        time: '10:30',
                        notes: 'Routine check-up',
                    },
                ),
                responses: {
                    '201': response('Appointment created successfully', { $ref: '#/components/schemas/Appointment' }, appointmentExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Patient or doctor not found'),
                    '409': errorResponse(409, 'Doctor already has an appointment at this time'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/appointments/today': {
            get: {
                tags: ['Appointments'],
                summary: 'Get today appointments',
                description: 'Returns appointments scheduled for today.',
                security: bearerSecurity,
                parameters: paginationParameters,
                responses: {
                    '200': response('Today appointments retrieved successfully', paginatedSchema('#/components/schemas/Appointment'), {
                        data: [appointmentExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/appointments/{id}': {
            get: {
                tags: ['Appointments'],
                summary: 'Get appointment by id',
                description: 'Returns a single appointment.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Appointment id')],
                responses: {
                    '200': response('Appointment retrieved successfully', { $ref: '#/components/schemas/Appointment' }, appointmentExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Appointment not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Appointments'],
                summary: 'Update appointment',
                description: 'Reschedules or updates appointment status.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Appointment id')],
                requestBody: requestBody(
                    'Appointment update payload',
                    {
                        type: 'object',
                        properties: {
                            patientId: { type: 'string' },
                            doctorId: { type: 'string' },
                            date: { type: 'string', example: '2026-05-10' },
                            time: { type: 'string', example: '11:00' },
                            status: { type: 'string', enum: ['Scheduled', 'Completed', 'Cancelled'] },
                            notes: { type: 'string', nullable: true },
                        },
                    },
                    {
                        status: 'Completed',
                    },
                ),
                responses: {
                    '200': response('Appointment updated successfully', { $ref: '#/components/schemas/Appointment' }, appointmentExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Appointment not found'),
                    '409': errorResponse(409, 'Doctor already has an appointment at this time'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Appointments'],
                summary: 'Delete appointment',
                description: 'Cancels an appointment unless business rules block it.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Appointment id')],
                responses: {
                    '204': noContentResponse('Appointment deleted successfully'),
                    '400': errorResponse(400, 'Appointment cannot be deleted'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Appointment not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/medical-records': {
            get: {
                tags: ['Medical Records'],
                summary: 'List medical records',
                description: 'Returns medical records for a patient ordered through pagination and sorting.',
                security: bearerSecurity,
                parameters: [
                    ...paginationParameters,
                    { name: 'patientId', in: 'query', required: true, schema: { type: 'string' }, description: 'Patient id' },
                ],
                responses: {
                    '200': response('Medical records retrieved successfully', paginatedSchema('#/components/schemas/MedicalRecord'), {
                        data: [medicalRecordExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Patient not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Medical Records'],
                summary: 'Create medical record',
                description: 'Creates a medical history record. Doctor or Admin role required.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Medical record payload',
                    {
                        type: 'object',
                        required: ['patientId', 'doctorId', 'diagnosis', 'treatment', 'date'],
                        properties: {
                            patientId: { type: 'string' },
                            doctorId: { type: 'string' },
                            diagnosis: { type: 'string' },
                            treatment: { type: 'string' },
                            prescriptionsText: { type: 'string', nullable: true },
                            date: { type: 'string', example: '2026-05-08' },
                        },
                    },
                    {
                        patientId: 'patient-1',
                        doctorId: 'doctor-1',
                        diagnosis: 'Seasonal flu',
                        treatment: 'Rest and hydration',
                        prescriptionsText: 'Paracetamol as needed',
                        date: '2026-05-08',
                    },
                ),
                responses: {
                    '201': response('Medical record created successfully', { $ref: '#/components/schemas/MedicalRecord' }, medicalRecordExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Patient or doctor not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/medical-records/{id}': {
            get: {
                tags: ['Medical Records'],
                summary: 'Get medical record by id',
                description: 'Returns one medical record.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Medical record id')],
                responses: {
                    '200': response('Medical record retrieved successfully', { $ref: '#/components/schemas/MedicalRecord' }, medicalRecordExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Medical record not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Medical Records'],
                summary: 'Update medical record',
                description: 'Updates an existing medical record. Doctor or Admin role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Medical record id')],
                requestBody: requestBody(
                    'Medical record update payload',
                    {
                        type: 'object',
                        properties: {
                            patientId: { type: 'string' },
                            doctorId: { type: 'string' },
                            diagnosis: { type: 'string' },
                            treatment: { type: 'string' },
                            prescriptionsText: { type: 'string', nullable: true },
                            date: { type: 'string', example: '2026-05-08' },
                        },
                    },
                    {
                        treatment: 'Updated treatment plan',
                    },
                ),
                responses: {
                    '200': response('Medical record updated successfully', { $ref: '#/components/schemas/MedicalRecord' }, medicalRecordExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Medical record not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Medical Records'],
                summary: 'Delete medical record',
                description: 'Deletes a medical record. Doctor or Admin role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Medical record id')],
                responses: {
                    '204': noContentResponse('Medical record deleted successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Medical record not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/medical-records/{id}/prescriptions': {
            get: {
                tags: ['Medical Records'],
                summary: 'List medical record prescriptions',
                description: 'Returns prescriptions linked to a medical record.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Medical record id')],
                responses: {
                    '200': response('Medical record prescriptions retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/Prescription' } }, [prescriptionExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Medical record not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/prescriptions': {
            get: {
                tags: ['Prescriptions'],
                summary: 'List prescriptions',
                description: 'Returns prescriptions for a medical record.',
                security: bearerSecurity,
                parameters: [
                    ...paginationParameters,
                    { name: 'medicalRecordId', in: 'query', required: true, schema: { type: 'string' }, description: 'Medical record id' },
                ],
                responses: {
                    '200': response('Prescriptions retrieved successfully', paginatedSchema('#/components/schemas/Prescription'), {
                        data: [prescriptionExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Medical record not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Prescriptions'],
                summary: 'Create prescription',
                description: 'Creates a prescription linked to a medical record. Doctor or Admin role required.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Prescription payload',
                    {
                        type: 'object',
                        required: ['medicalRecordId', 'medicine', 'dosage', 'duration'],
                        properties: {
                            medicalRecordId: { type: 'string' },
                            medicine: { type: 'string' },
                            dosage: { type: 'string' },
                            duration: { type: 'string' },
                            instructions: { type: 'string', nullable: true },
                        },
                    },
                    {
                        medicalRecordId: 'medical-record-1',
                        medicine: 'Paracetamol',
                        dosage: '500mg',
                        duration: '5 days',
                        instructions: 'After meals',
                    },
                ),
                responses: {
                    '201': response('Prescription created successfully', { $ref: '#/components/schemas/Prescription' }, prescriptionExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Medical record not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/prescriptions/{id}': {
            get: {
                tags: ['Prescriptions'],
                summary: 'Get prescription by id',
                description: 'Returns one prescription.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Prescription id')],
                responses: {
                    '200': response('Prescription retrieved successfully', { $ref: '#/components/schemas/Prescription' }, prescriptionExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Prescription not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Prescriptions'],
                summary: 'Update prescription',
                description: 'Updates a prescription. Doctor or Admin role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Prescription id')],
                requestBody: requestBody(
                    'Prescription update payload',
                    {
                        type: 'object',
                        properties: {
                            medicalRecordId: { type: 'string' },
                            medicine: { type: 'string' },
                            dosage: { type: 'string' },
                            duration: { type: 'string' },
                            instructions: { type: 'string', nullable: true },
                        },
                    },
                    {
                        dosage: '650mg',
                    },
                ),
                responses: {
                    '200': response('Prescription updated successfully', { $ref: '#/components/schemas/Prescription' }, prescriptionExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Prescription not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Prescriptions'],
                summary: 'Delete prescription',
                description: 'Deletes a prescription. Doctor or Admin role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Prescription id')],
                responses: {
                    '204': noContentResponse('Prescription deleted successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Prescription not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/rooms': {
            get: {
                tags: ['Rooms'],
                summary: 'List rooms',
                description: 'Returns hospital rooms with pagination and filtering.',
                security: bearerSecurity,
                parameters: [
                    ...paginationParameters,
                    { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Filter by department id' },
                    { name: 'type', in: 'query', schema: { type: 'string', enum: ['GENERAL', 'ICU', 'SURGERY', 'EMERGENCY', 'PEDIATRIC'] }, description: 'Filter by room type' },
                ],
                responses: {
                    '200': response('Rooms retrieved successfully', paginatedSchema('#/components/schemas/Room'), {
                        data: [roomExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Rooms'],
                summary: 'Create room',
                description: 'Creates a hospital room. Admin role required.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Room payload',
                    {
                        type: 'object',
                        required: ['roomNumber', 'departmentId', 'type', 'capacity'],
                        properties: {
                            roomNumber: { type: 'string' },
                            departmentId: { type: 'string' },
                            type: { type: 'string', enum: ['GENERAL', 'ICU', 'SURGERY', 'EMERGENCY', 'PEDIATRIC'] },
                            status: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE'] },
                            capacity: { type: 'integer' },
                        },
                    },
                    {
                        roomNumber: '101',
                        departmentId: 'department-1',
                        type: 'GENERAL',
                        status: 'AVAILABLE',
                        capacity: 2,
                    },
                ),
                responses: {
                    '201': response('Room created successfully', { $ref: '#/components/schemas/Room' }, roomExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Department not found'),
                    '409': errorResponse(409, 'Room number already exists'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/rooms/available': {
            get: {
                tags: ['Rooms'],
                summary: 'List available rooms',
                description: 'Returns rooms currently available for admission.',
                security: bearerSecurity,
                responses: {
                    '200': response('Available rooms retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/Room' } }, [roomExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/rooms/{id}': {
            get: {
                tags: ['Rooms'],
                summary: 'Get room by id',
                description: 'Returns one room with current admissions.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Room id')],
                responses: {
                    '200': response('Room retrieved successfully', { $ref: '#/components/schemas/RoomDetail' }, roomDetailExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Room not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Rooms'],
                summary: 'Update room',
                description: 'Updates room details. Admin role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Room id')],
                requestBody: requestBody(
                    'Room update payload',
                    {
                        type: 'object',
                        properties: {
                            roomNumber: { type: 'string' },
                            departmentId: { type: 'string' },
                            type: { type: 'string', enum: ['GENERAL', 'ICU', 'SURGERY', 'EMERGENCY', 'PEDIATRIC'] },
                            status: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE'] },
                            capacity: { type: 'integer' },
                        },
                    },
                    {
                        status: 'UNDER_MAINTENANCE',
                    },
                ),
                responses: {
                    '200': response('Room updated successfully', { $ref: '#/components/schemas/Room' }, roomExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Room not found'),
                    '409': errorResponse(409, 'Room number already exists'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Rooms'],
                summary: 'Delete room',
                description: 'Deletes a room. Admin role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Room id')],
                responses: {
                    '204': noContentResponse('Room deleted successfully'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Room not found'),
                    '409': errorResponse(409, 'Room cannot be deleted while in use'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/admissions': {
            get: {
                tags: ['Admissions'],
                summary: 'List admissions',
                description: 'Returns hospital admissions with pagination and filtering.',
                security: bearerSecurity,
                parameters: [
                    ...paginationParameters,
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'DISCHARGED'] }, description: 'Filter by status' },
                    { name: 'patientId', in: 'query', schema: { type: 'string' }, description: 'Filter by patient id' },
                    { name: 'roomId', in: 'query', schema: { type: 'string' }, description: 'Filter by room id' },
                ],
                responses: {
                    '200': response('Admissions retrieved successfully', paginatedSchema('#/components/schemas/Admission'), {
                        data: [admissionExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Admissions'],
                summary: 'Create admission',
                description: 'Admits a patient to a room. Admin or Receptionist role required.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Admission payload',
                    {
                        type: 'object',
                        required: ['patientId', 'roomId'],
                        properties: {
                            patientId: { type: 'string' },
                            roomId: { type: 'string' },
                            admissionDate: { type: 'string', example: '2026-05-08' },
                        },
                    },
                    {
                        patientId: 'patient-1',
                        roomId: 'room-1',
                        admissionDate: '2026-05-08',
                    },
                ),
                responses: {
                    '201': response('Admission created successfully', { $ref: '#/components/schemas/Admission' }, admissionExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Patient or room not found'),
                    '409': errorResponse(409, 'Room has no available capacity'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/admissions/active': {
            get: {
                tags: ['Admissions'],
                summary: 'List active admissions',
                description: 'Returns only active admissions.',
                security: bearerSecurity,
                parameters: paginationParameters,
                responses: {
                    '200': response('Active admissions retrieved successfully', paginatedSchema('#/components/schemas/Admission'), {
                        data: [admissionExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/admissions/{id}/discharge': {
            put: {
                tags: ['Admissions'],
                summary: 'Discharge admission',
                description: 'Discharges a patient from the hospital. Admin or Receptionist role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Admission id')],
                requestBody: requestBody(
                    'Discharge payload',
                    {
                        type: 'object',
                        properties: {
                            dischargeDate: { type: 'string', example: '2026-05-10' },
                        },
                    },
                    {
                        dischargeDate: '2026-05-10',
                    },
                    false,
                ),
                responses: {
                    '200': response('Admission discharged successfully', { $ref: '#/components/schemas/Admission' }, {
                        ...admissionExample,
                        dischargeDate: '2026-05-10T00:00:00.000Z',
                        status: 'DISCHARGED',
                    }),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Admission not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/invoices': {
            get: {
                tags: ['Invoices'],
                summary: 'List invoices',
                description: 'Returns patient invoices with pagination and filtering.',
                security: bearerSecurity,
                parameters: [
                    ...paginationParameters,
                    { name: 'patientId', in: 'query', schema: { type: 'string' }, description: 'Filter by patient id' },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'PAID', 'CANCELLED'] }, description: 'Filter by invoice status' },
                ],
                responses: {
                    '200': response('Invoices retrieved successfully', paginatedSchema('#/components/schemas/Invoice'), {
                        data: [invoiceExample],
                        total: 1,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    }),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            post: {
                tags: ['Invoices'],
                summary: 'Create invoice',
                description: 'Creates a patient invoice. Admin or Receptionist role required.',
                security: bearerSecurity,
                requestBody: requestBody(
                    'Invoice payload',
                    {
                        type: 'object',
                        required: ['patientId', 'amount', 'date'],
                        properties: {
                            patientId: { type: 'string' },
                            amount: { type: 'number' },
                            date: { type: 'string', example: '2026-05-08' },
                            description: { type: 'string', nullable: true },
                        },
                    },
                    {
                        patientId: 'patient-1',
                        amount: 120.5,
                        date: '2026-05-08',
                        description: 'Consultation fee',
                    },
                ),
                responses: {
                    '201': response('Invoice created successfully', { $ref: '#/components/schemas/Invoice' }, invoiceExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Patient not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/invoices/stats': {
            get: {
                tags: ['Invoices'],
                summary: 'Get invoice stats',
                description: 'Returns billing summary information used by the dashboard.',
                security: bearerSecurity,
                responses: {
                    '200': response('Invoice stats retrieved successfully', { $ref: '#/components/schemas/InvoiceStats' }, {
                        totalRevenue: 5000.75,
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/invoices/{id}': {
            get: {
                tags: ['Invoices'],
                summary: 'Get invoice by id',
                description: 'Returns one invoice.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Invoice id')],
                responses: {
                    '200': response('Invoice retrieved successfully', { $ref: '#/components/schemas/Invoice' }, invoiceExample),
                    '401': errorResponse(401, 'Unauthorized'),
                    '404': errorResponse(404, 'Invoice not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            put: {
                tags: ['Invoices'],
                summary: 'Update invoice',
                description: 'Updates a pending invoice. Admin or Receptionist role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Invoice id')],
                requestBody: requestBody(
                    'Invoice update payload',
                    {
                        type: 'object',
                        properties: {
                            patientId: { type: 'string' },
                            amount: { type: 'number' },
                            date: { type: 'string', example: '2026-05-08' },
                            description: { type: 'string', nullable: true },
                        },
                    },
                    {
                        amount: 150,
                        description: 'Updated invoice description',
                    },
                ),
                responses: {
                    '200': response('Invoice updated successfully', { $ref: '#/components/schemas/Invoice' }, invoiceExample),
                    '400': errorResponse(400, 'Validation failed'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Invoice not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
            delete: {
                tags: ['Invoices'],
                summary: 'Delete invoice',
                description: 'Cancels an invoice. Admin or Receptionist role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Invoice id')],
                responses: {
                    '204': noContentResponse('Invoice deleted successfully'),
                    '400': errorResponse(400, 'Paid invoice cannot be cancelled'),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Invoice not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/invoices/{id}/pay': {
            put: {
                tags: ['Invoices'],
                summary: 'Pay invoice',
                description: 'Marks a pending invoice as paid. Admin or Receptionist role required.',
                security: bearerSecurity,
                parameters: [idPathParameter('id', 'Invoice id')],
                responses: {
                    '200': response('Invoice paid successfully', { $ref: '#/components/schemas/Invoice' }, {
                        ...invoiceExample,
                        status: 'PAID',
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '403': errorResponse(403, 'Forbidden'),
                    '404': errorResponse(404, 'Invoice not found'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/dashboard/stats': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get dashboard stats',
                description: 'Returns dashboard KPI cards for today appointments, rooms, admissions, patients, doctors, and pending invoice amount.',
                security: bearerSecurity,
                responses: {
                    '200': response('Dashboard stats retrieved successfully', { $ref: '#/components/schemas/DashboardStats' }, {
                        appointmentsToday: 5,
                        availableRooms: 12,
                        admittedPatients: 8,
                        totalPatients: 140,
                        totalDoctors: 18,
                        pendingInvoicesAmount: 1540.25,
                    }),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/dashboard/appointments/today': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get dashboard today appointments',
                description: 'Returns today appointments for the dashboard table.',
                security: bearerSecurity,
                responses: {
                    '200': response('Dashboard appointments retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/Appointment' } }, [appointmentExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
        '/api/dashboard/admissions/active': {
            get: {
                tags: ['Dashboard'],
                summary: 'Get dashboard active admissions',
                description: 'Returns active admissions for the dashboard.',
                security: bearerSecurity,
                responses: {
                    '200': response('Dashboard active admissions retrieved successfully', { type: 'array', items: { $ref: '#/components/schemas/Admission' } }, [admissionExample]),
                    '401': errorResponse(401, 'Unauthorized'),
                    '500': errorResponse(500, 'Internal server error'),
                },
            },
        },
    },
};

export const swaggerSpec = swaggerJSDoc({
    definition: swaggerDefinition,
    apis: [],
});
