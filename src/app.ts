import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './shared/middleware/error-handler';
import { notFoundHandler } from './shared/middleware/not-found';
import { departmentRoutes } from './modules/departments/presentation/department.routes';
import { authRoutes } from './modules/auth/presentation/auth.routes';
import { patientRoutes } from './modules/patients/patients.router';
import { doctorRoutes } from './modules/doctors/presentation/doctor.routes';
import { nurseRoutes } from './modules/nurses/presentation/nurse.routes';
import { appointmentRoutes } from './modules/appointments/presentation/appointment.routes';
import { medicalRecordRoutes } from './modules/medical-records/presentation/medical-record.routes';
import { prescriptionRoutes } from './modules/prescriptions/presentation/prescription.routes';
import { roomRoutes } from './modules/rooms/presentation/room.routes';
import { admissionRoutes } from './modules/admissions/presentation/admission.routes';
import { invoiceRoutes } from './modules/invoices/presentation/invoice.routes';
import { dashboardRoutes } from './modules/dashboard/presentation/dashboard.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.config';
import { AppError } from './shared/core/errors/app-error';
import { createAuthLoginRateLimiter } from './modules/auth/presentation/auth.rate-limit';

export function createApp() {
    const app = express();

    app.use(helmet({
        contentSecurityPolicy: false,
    }));
    app.use(cors({
        origin(origin, callback) {
            if (!origin || env.corsAllowedOrigins.includes(origin)) {
                callback(null, true);

                return;
            }

            callback(new AppError('CORS origin not allowed', 403));
        },
        credentials: true,
    }));
    app.use(morgan(envLogFormat()));
    app.use(express.json());
    const loginRateLimiter = createAuthLoginRateLimiter();

    app.use('/auth/login', loginRateLimiter);
    app.use('/api/auth/login', loginRateLimiter);

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    app.use('/api/departments', departmentRoutes);
    app.use('/departments', departmentRoutes);
    app.use('/auth', authRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/patients', patientRoutes);
    app.use('/api/doctors', doctorRoutes);
    app.use('/api/nurses', nurseRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/medical-records', medicalRecordRoutes);
    app.use('/api/prescriptions', prescriptionRoutes);
    app.use('/api/rooms', roomRoutes);
    app.use('/api/admissions', admissionRoutes);
    app.use('/api/invoices', invoiceRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api/docs.json', (_req, res) => {
        res.status(200).json(swaggerSpec);
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

function envLogFormat() {
    return process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
}
