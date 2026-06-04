# MedSphere Lab1 Backend

Backend API for the Hospital Management System (Lenda Laboratorike 1), built with Express, TypeScript, Prisma, PostgreSQL, and CQRS-style layering.

## Tech Stack
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT + refresh tokens
- Swagger / OpenAPI
- Jest

## Implemented Modules
- Auth / Identity
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

## Prerequisites
- Node.js 20+
- PostgreSQL
- npm

## Environment Variables
Create `.env` from `.env.example`, then fill the values that match your local setup. The variables are listed without values on purpose.

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
APP_URL=
SEED_USER_PASSWORD=
MAIL_TEST_TO=
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are required before running the seed. `SEED_USER_PASSWORD` is optional and controls the demo staff user password created by the seed script. `MAIL_TEST_TO` is only used by the test mail script.

## Commands
### Create local env
```bash
cp .env.example .env
```

### Install
```bash
npm install
```

### Generate Prisma client
```bash
npm run prisma:generate
```

### Run database migrations
```bash
npm run prisma:migrate
```

To name a new migration after changing `prisma/schema.prisma`:

```bash
npm run prisma:migrate -- --name <migration_name>
```

### Seed database
```bash
npm run prisma:seed
```

Prisma can also run the configured seed command:

```bash
npx prisma db seed
```

### Run development server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Run production build
```bash
npm start
```

### Test
```bash
npm test
```

### Optional commands
```bash
npm run test:watch
npm run prisma:studio
npm run mail:verify
npm run mail:test -- recipient@example.com
```

## NPM Scripts
- `npm run dev` starts the TypeScript dev server with nodemon.
- `npm run build` compiles TypeScript to `dist`.
- `npm start` runs `dist/server.js` after a build.
- `npm test` runs Jest in band.
- `npm run test:watch` runs Jest in watch mode.
- `npm run prisma:generate` generates the Prisma client.
- `npm run prisma:migrate` runs Prisma development migrations.
- `npm run prisma:seed` seeds admin, roles, and demo hospital data.
- `npm run prisma:studio` opens Prisma Studio.
- `npm run mail:verify` verifies mail configuration.
- `npm run mail:test` sends a test email.

## CORS
The backend default CORS allowlist accepts frontend origins on both `3001` and `3000`:

- `http://localhost:3001`
- `http://127.0.0.1:3001`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

If you override `CORS_ALLOWED_ORIGINS`, include every frontend origin you want to allow as a comma-separated list.

## API Docs
- Swagger UI: `http://localhost:3011/api/docs`
- OpenAPI JSON: `http://localhost:3011/api/docs.json`
- Health check: `GET http://localhost:3011/health`

Swagger documents the canonical `/api/*` routes. The app also keeps legacy aliases for `/auth/*` and `/departments/*`.

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

## Seed Login
After `npm run prisma:seed`, sign in with the admin email or username and password from your `.env`.

## Notes
- Seed enforces one active admin role owner.
- If Prisma reports migration drift on your local DB, use a clean local DB or reset the dev schema before re-running migrations.

### Reset local database
This is destructive. It drops and recreates your local DB schema, re-applies migrations, and can run the seed again.

```bash
npx prisma migrate reset
```
