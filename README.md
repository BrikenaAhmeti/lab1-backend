# MedSphere Lab1 Backend

Backend API for the Hospital Management System lab project. It is built with Express, TypeScript, Prisma, PostgreSQL, JWT authentication, refresh-token sessions, Swagger/OpenAPI docs, and CQRS-style module layering.

Default local API URL: `http://localhost:3011`

## Tech Stack

- Node.js 20+
- Express 5
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT access tokens and rotating refresh tokens
- HTTP-only refresh-token cookies
- Helmet, CORS, login rate limiting
- Swagger / OpenAPI
- Jest, ts-jest, Supertest

## Project Structure

- `src/app.ts` wires Express middleware, route modules, Swagger, health checks, and error handling.
- `src/server.ts` starts the HTTP server on `env.port`.
- `src/config/env.ts` loads runtime configuration from `.env`.
- `src/modules/*` contains feature modules with presentation, service, domain, infrastructure, DTO, command, and query layers.
- `src/shared` contains cross-cutting middleware, validation helpers, buses, errors, pagination, mail, and request user types.
- `prisma/schema.prisma` defines the PostgreSQL data model.
- `prisma/migrations` contains schema migrations.
- `prisma/seed.ts` creates admin, roles, staff, patients, rooms, appointments, admissions, medical records, prescriptions, and invoices.
- `tests/unit` and `tests/integration` cover handlers, services, middleware, security behavior, and HTTP routes.

## Implemented Modules

- Auth / Identity
- Users and role management
- Patients
- Departments
- Doctors
- Nurses
- Appointments
- Medical Records
- Prescriptions
- Rooms
- Admissions
- Invoices
- Dashboard
- Mail verification/test scripts
- Swagger/OpenAPI documentation

## Roles

The identity system stores users, roles, user-role assignments, claims, user tokens, and refresh tokens.

Base roles seeded by the auth service:

- `ADMIN`: full system administration and role/user management.
- `DOCTOR`: clinical user. Doctor tokens are scoped to the linked doctor profile where the service applies doctor scoping.
- `NURSE`: nursing user.
- `RECEPTIONIST`: front desk user for admissions, billing, and operational workflows.
- `PATIENT`: patient portal role.
- `USER`: default limited role for self-registered users.

Admin aliases accepted by role middleware: `ADMIN`, `SADMIN`, and `SUPER_ADMIN`.

## Access Rules

All `/api/*` hospital routes require `Authorization: Bearer <accessToken>` unless noted as public. The app also keeps legacy aliases for `/auth/*` and `/departments/*`.

| Area | Access |
| --- | --- |
| `GET /health` | Public |
| Auth register, login, refresh, email confirmation, resend confirmation, logout | Public, with refresh token required for refresh/logout |
| `GET/PATCH /api/auth/me`, change password, logout all | Authenticated user |
| Auth user/role/admin endpoints | `ADMIN` only |
| Patients | Authenticated users can list/read/create/update; delete is `ADMIN` only |
| Doctors | Authenticated users can list/read/update; create/delete/status is `ADMIN` only |
| Nurses | Authenticated users can list/read/update; create/delete is `ADMIN` only |
| Departments | Authenticated users can list/read/create/update/delete and view department doctors, rooms, nurses |
| Appointments | Authenticated users can list/read/create/update/cancel; doctors are service-scoped to their linked doctor record |
| Medical records | Read: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`; write/delete: `ADMIN`, `DOCTOR` |
| Prescriptions | Read: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`; write/delete: `ADMIN`, `DOCTOR` |
| Rooms | Authenticated users can list/read available rooms; create/update/delete is `ADMIN` only |
| Admissions | Authenticated users can list/read active admissions; create/discharge is `ADMIN` or `RECEPTIONIST` |
| Invoices | Authenticated users can list/read/stats; create/update/pay/delete is `ADMIN` or `RECEPTIONIST` |
| Dashboard | Authenticated user |

Doctor-scoped behavior:

- A non-admin `DOCTOR` can only access appointment data for their linked doctor profile.
- Doctor-scoped patient reads/lists are limited to patients with appointments for that linked doctor.
- Inactive or unlinked doctor users receive `403 Forbidden` for doctor-scoped service access.

## Environment Variables

Create `.env` from `.env.example`, then fill the values that match your local setup.

```env
PORT=
NODE_ENV=
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
BCRYPT_SALT_ROUNDS=
CORS_ALLOWED_ORIGINS=
REFRESH_TOKEN_COOKIE_NAME=
MAX_ACCESS_FAILED_COUNT=
ADMIN_FIRST_NAME=
ADMIN_LAST_NAME=
ADMIN_EMAIL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_PHONE_NUMBER=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
FRONTEND_URL=
APP_URL=
SEED_USER_PASSWORD=
MAIL_TEST_TO=
```

Important defaults and notes:

- `PORT` defaults to `3011`.
- `FRONTEND_URL` controls email confirmation links and defaults to `http://localhost:3001`.
- `APP_URL` is accepted as a fallback for older env files.
- `REFRESH_TOKEN_COOKIE_NAME` defaults to `refreshToken`.
- `MAX_ACCESS_FAILED_COUNT` defaults to `5`.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are required before running the seed.
- `SEED_USER_PASSWORD` is optional and controls seeded demo staff passwords.
- `MAIL_TEST_TO` is only used by the test mail script.

## Commands

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the TypeScript dev server with nodemon and tsx |
| `npm run build` | Compiles TypeScript to `dist` |
| `npm start` | Runs `dist/server.js` after a build |
| `npm test` | Runs Jest in band |
| `npm run test:watch` | Runs Jest in watch mode |
| `npm run prisma:generate` | Generates the Prisma client |
| `npm run prisma:migrate` | Runs Prisma development migrations |
| `npm run prisma:migrate -- --name <migration_name>` | Creates a named migration after schema changes |
| `npm run prisma:seed` | Seeds roles, admin, and demo hospital data |
| `npx prisma db seed` | Runs Prisma's configured seed command |
| `npm run prisma:studio` | Opens Prisma Studio |
| `npm run mail:verify` | Verifies SMTP/mail configuration |
| `npm run mail:test -- recipient@example.com` | Sends a test email |

## Database

The Prisma schema covers:

- Users, roles, user roles, claims, user tokens, and refresh tokens.
- Departments with doctors, nurses, and rooms.
- Doctors linked to required user accounts.
- Nurses linked to optional user accounts.
- Patients linked to optional portal users and soft deleted by `isDeleted`.
- Appointments with date, time, status, patient, and doctor.
- Medical records with diagnosis, treatment, record date, and prescription summary text.
- Prescriptions connected to medical records.
- Rooms with room number, department, type, status, and capacity.
- Admissions connecting patients and rooms with active/discharged status.
- Invoices connected to patients and optionally one appointment or one admission.
- Optional normalized invoice items and doctor schedules.

## Domain Rules

- Room numbers are unique.
- Room capacity must be positive.
- Room capacity cannot be lowered below active admission count.
- Rooms with active admissions cannot be deleted.
- Rooms under maintenance cannot receive new admissions.
- Admissions cannot be created for already admitted patients.
- Admissions require available room capacity.
- Discharge date cannot be before admission date.
- Active admissions do not have a discharge date; discharged admissions do.
- A doctor cannot have two non-cancelled appointments at the same date and time.
- Appointments cannot be created or rescheduled into the past.
- Only scheduled appointments can be rescheduled.
- Appointment status can move from `Scheduled` to `Completed` or `Cancelled`.
- Completed appointments cannot be cancelled.
- Doctor-linked users must have the `DOCTOR` role.
- Nurse-linked users must have the `NURSE` role.
- Doctor creation can provision a new user or link an existing user, not both at the same time.
- Nurse creation can provision a user when email and username are supplied, link an existing user, or remain unlinked with `userId: null`.
- Patient user links must point to an existing user and be unique per patient.
- Invoice amounts must be greater than zero and have at most two decimal places.
- Invoices can link to either one appointment or one admission, not both.
- Linked appointment/admission must belong to the same patient as the invoice.
- Only pending invoices can be updated.
- Cancelled invoices cannot be paid; paid invoices cannot be cancelled/deleted.
- Only one admin user is allowed by auth service admin assignment rules.

## API Behavior

- JSON request bodies are parsed with `express.json()`.
- Protected routes use `Authorization: Bearer <accessToken>`.
- `POST /api/auth/login` and `POST /api/auth/register` return an access token and set a refresh token cookie.
- Refresh tokens can be read from the refresh-token cookie or from `refreshToken` in the request body.
- Refresh tokens rotate on refresh and are hashed in storage.
- Login is rate-limited to 5 failed attempts per 15 minutes, with successful requests skipped. Admin login attempts are exempt from the rate limiter.
- Helmet security headers are enabled.
- CORS allows credentials and defaults to frontend origins on `3001` and `3000`.
- Validation errors return HTTP `400`.
- App errors return `{ success: false, message, statusCode }`.
- Prisma unique conflicts map to `409`, foreign key/delete conflicts map to `409`, and missing records map to `404`.

Default CORS allowlist:

- `http://localhost:3001`
- `http://127.0.0.1:3001`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

If `CORS_ALLOWED_ORIGINS` is set, include every frontend origin as a comma-separated list.

## API Docs

- Swagger UI: `http://localhost:3011/api/docs`
- OpenAPI JSON: `http://localhost:3011/api/docs.json`
- Health check: `GET http://localhost:3011/health`

Swagger documents the canonical `/api/*` routes.

## Pagination and Filters

Paginated endpoints use:

- `page`: integer, default `1`
- `limit`: integer from `1` to `100`, default `10`
- `sortBy`: module-specific sort field
- `order`: `ASC` or `DESC`, default `DESC`

Module filters:

- Patients: `search`, `bloodGroup`, `gender`; sort by `created_at`, `first_name`, `last_name`, `date_of_birth`.
- Departments: sort by `created_at`, `name`, `location`.
- Doctors: `departmentId`, `specialization`; sort by `created_at`, `first_name`, `last_name`, `specialization`.
- Nurses: `departmentId`, `search`, `shift`; sort by `created_at`, `first_name`, `last_name`, `shift`.
- Appointments: `date`, `from`, `to`, `doctorId`, `patientId`, `status`; sort by `created_at`, `date`, `time`, `status`.
- Medical records: required `patientId`; sort by `created_at`, `date`.
- Prescriptions: required `medicalRecordId`; sort by `created_at`, `medicine`.
- Rooms: `search`, `departmentId`, `type`; sort by `created_at`, `room_number`, `capacity`.
- Admissions: `status`, `patientId`, `roomId`, `date`, `from`, `to`; sort by `created_at`, `admission_date`, `discharge_date`, `status`.
- Invoices: `patientId`, `status`, `date`, `from`, `to`; sort by `created_at`, `date`, `amount`, `status`.

Date-only fields use `YYYY-MM-DD`. Appointment time uses `HH:mm`.

## Enums

- Patient gender: `MALE`, `FEMALE`, `OTHER`
- Blood type: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`
- Nurse shift: `Morning`, `Evening`, `Night`
- Appointment status: `Scheduled`, `Completed`, `Cancelled`
- Room type: `GENERAL`, `ICU`, `SURGERY`, `EMERGENCY`, `PEDIATRIC`
- Room status: `AVAILABLE`, `OCCUPIED`, `UNDER_MAINTENANCE`
- Admission status: `ACTIVE`, `DISCHARGED`
- Invoice status: `PENDING`, `PAID`, `CANCELLED`

## Main Endpoints

### Health

- `GET /health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/confirm-email`
- `POST /api/auth/resend-confirmation-email`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `POST /api/auth/logout-all`
- `GET /api/auth/me`
- `PATCH /api/auth/me`

### Users and Roles

- `GET /api/auth/users`
- `POST /api/auth/users`
- `POST /api/auth/users/receptionists`
- `GET /api/auth/users/:id`
- `PATCH /api/auth/users/:id`
- `DELETE /api/auth/users/:id`
- `PATCH /api/auth/users/:id/status`
- `PATCH /api/auth/users/:id/password`
- `GET /api/auth/roles`
- `POST /api/auth/roles`
- `PATCH /api/auth/roles/:roleId`
- `DELETE /api/auth/roles/:roleId`
- `GET /api/auth/users/:userId/roles`
- `POST /api/auth/users/:userId/roles`
- `PUT /api/auth/users/:userId/roles`
- `DELETE /api/auth/users/:userId/roles/:roleId`
- `GET /api/auth/users/:userId/refresh-tokens`
- `DELETE /api/auth/users/:userId/refresh-tokens`

### Hospital Modules

- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`
- `GET /api/departments`
- `GET /api/departments/all`
- `POST /api/departments`
- `GET /api/departments/:id`
- `PUT /api/departments/:id`
- `DELETE /api/departments/:id`
- `GET /api/departments/:id/doctors`
- `GET /api/departments/:id/rooms`
- `GET /api/departments/:id/nurses`
- `GET /api/doctors`
- `POST /api/doctors`
- `GET /api/doctors/:id`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`
- `PATCH /api/doctors/:id/status`
- `GET /api/nurses`
- `POST /api/nurses`
- `GET /api/nurses/:id`
- `PUT /api/nurses/:id`
- `DELETE /api/nurses/:id`
- `GET /api/appointments`
- `GET /api/appointments/today`
- `POST /api/appointments`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`
- `GET /api/medical-records`
- `POST /api/medical-records`
- `GET /api/medical-records/:id`
- `PUT /api/medical-records/:id`
- `DELETE /api/medical-records/:id`
- `GET /api/medical-records/:id/prescriptions`
- `GET /api/prescriptions`
- `POST /api/prescriptions`
- `GET /api/prescriptions/:id`
- `PUT /api/prescriptions/:id`
- `DELETE /api/prescriptions/:id`
- `GET /api/rooms`
- `GET /api/rooms/available`
- `POST /api/rooms`
- `GET /api/rooms/:id`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`
- `GET /api/admissions`
- `GET /api/admissions/active`
- `POST /api/admissions`
- `GET /api/admissions/:id`
- `PUT /api/admissions/:id/discharge`
- `GET /api/invoices`
- `GET /api/invoices/stats`
- `POST /api/invoices`
- `GET /api/invoices/:id`
- `PUT /api/invoices/:id`
- `DELETE /api/invoices/:id`
- `PUT /api/invoices/:id/pay`
- `GET /api/dashboard/stats`
- `GET /api/dashboard/rooms/available`
- `GET /api/dashboard/appointments/today`
- `GET /api/dashboard/admissions/active`

## Request Body Quick Reference

- Register: `firstName`, `lastName`, `email`, `password`; optional `username`, `phoneNumber`.
- Login: `identifier` or `email`, plus `password`.
- Change password: `currentPassword`, `newPassword`.
- Create user: `firstName`, `lastName`, `email`, `password`; optional `username`, `phoneNumber`, `emailConfirmed`, `lockoutEnabled`, `isActive`, `roleIds`.
- Create receptionist: `firstName`, `lastName`, `email`; optional `username`, `phoneNumber`, `isActive`.
- Create role: `name`; optional `description`, `isActive`.
- Assign role: `roleId`; replace roles: `roleIds`.
- Patient: `firstName`, `lastName`, `dateOfBirth`, `gender`, `phoneNumber`, `address`, `bloodType`; optional `userId`.
- Department: `name`, `location`; optional `description`.
- Doctor: `firstName`, `lastName`, `specialization`, `departmentId`, `phoneNumber`; optional `userId` or optional `email`/`username` for new linked user provisioning.
- Doctor status: `isActive`.
- Nurse: `firstName`, `lastName`, `departmentId`, `shift`; optional `userId`, `email`, `username`, `password`.
- Appointment: `patientId`, `doctorId`, `date`, `time`; optional `notes`.
- Medical record: `patientId`, `doctorId`, `diagnosis`, `treatment`, `date`; optional `prescriptionsText`.
- Prescription: `medicalRecordId`, `medicine`, `dosage`, `duration`; optional `instructions`.
- Room: `roomNumber`, `departmentId`, `type`, `capacity`; optional `status`.
- Admission: `patientId`, `roomId`; optional `admissionDate`.
- Admission discharge: optional `dischargeDate`.
- Invoice: `patientId`, `amount`, `date`; optional `appointmentId`, `admissionId`, `description`.

Update requests use the same fields as create requests but require at least one updatable field.

Compatibility aliases:

- Medical records accept aliases such as `patient_id`, `doctor_id`, `diagnoza`, `trajtimi`, `prescriptions_text`, `recetat`, and `data`.
- Prescriptions accept aliases such as `medical_record_id`, `bari`, `dozimi`, `kohezgjatja`, and `udhezime`.
- Invoices accept aliases such as `patient_id`, `appointment_id`, `admission_id`, `shuma`, `invoice_date`, `data`, and `pershkrimi`.

## Seed Login

After `npm run prisma:seed`, sign in with the admin email or username and password from `.env`.

Seed behavior:

- Ensures the base roles exist.
- Enforces one active admin role owner.
- Seeds demo hospital departments, doctors, nurses, receptionists, rooms, patients, appointments, admissions, medical records, prescriptions, and invoices.

## Testing

Verified on 2026-06-06 with:

```bash
npm test
```

Current result after this README update: 32 test suites passed, 181 tests passed.

## Backend Prompt

A full backend-side prompt based on the implemented roles, modules, routes, validation, and domain behavior is available in `BACKEND_PROMPT.md`.

Use it when asking an AI assistant or teammate to rebuild, extend, audit, or integrate with this backend.

## Notes

- If Prisma reports migration drift on a local development database, use a clean local database or reset the dev schema before re-running migrations.
- Resetting the local database is destructive. It drops and recreates the schema, re-applies migrations, and can run the seed again:

```bash
npx prisma migrate reset
```
