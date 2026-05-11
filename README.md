# MedSphere Lab1 Backend

Backend API for the Hospital Management System (Lenda Laboratorike 1), built with Express, TypeScript, Prisma, PostgreSQL, and CQRS-style layering.

## Tech Stack
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT + Refresh Tokens
- Jest

## Implemented Modules
- Auth / Identity
- Departments

## Identity Features
- JWT access tokens
- Refresh token rotation
- Hashed refresh token storage
- Login with `identifier` (username or email)
- Backward-compatible login with `email`
- Role-based authorization (`ADMIN` routes)
- Rate limiting on login
- CORS allowlist + Helmet headers
- Single-admin policy (only one user can hold `ADMIN` role)
- Admin seed script

## Prerequisites
- Node.js 20+
- PostgreSQL running locally

## Environment Variables
Create `.env` (or copy from `.env.example`) with:

```env
PORT=3006
NODE_ENV=development
DATABASE_URL=
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
CORS_ALLOWED_ORIGINS=
REFRESH_TOKEN_COOKIE_NAME=
MAX_ACCESS_FAILED_COUNT=
ADMIN_FIRST_NAME=
ADMIN_LAST_NAME=
ADMIN_EMAIL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_PHONE_NUMBER=
```

## Commands
### 0) Create `.env`
```bash
cp .env.example .env
```

### 1) Install dependencies
```bash
npm install
```

### 2) Generate Prisma client
```bash
npm run prisma:generate
```

### 3) Run migrations
```bash
npm run prisma:migrate
```
If you're creating a new migration after updating `prisma/schema.prisma`, you can name it:
```bash
npm run prisma:migrate -- --name <migration_name>
```

### 4) Seed default admin and base roles
```bash
npm run prisma:seed
```

### (Optional) Open Prisma Studio
```bash
npm run prisma:studio
```

### 5) Run development server
```bash
npm run dev
```

### 6) Build
```bash
npm run build
```

### 7) Run production build locally (after `npm run build`)
```bash
npm start
```

### 8) Run tests
```bash
npm test
```

## NPM Scripts
- `npm run dev` start dev server with nodemon
- `npm run build` compile TypeScript to `dist`
- `npm start` run compiled build
- `npm test` run jest tests
- `npm run test:watch` run tests in watch mode
- `npm run prisma:generate` generate Prisma client
- `npm run prisma:migrate` run Prisma migrations
- `npm run prisma:seed` seed admin and roles
- `npm run prisma:studio` open Prisma Studio

## Default Admin Login
After `npm run prisma:seed`, login with values from env:
- Email: `admin@medsphere.local`
- Username: `admin`
- Password: `Admin123!`

If you changed env values, use your updated credentials.

## API Base URL
- Local: `http://localhost:3005`

## Endpoints
### Health
- `GET /health`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/change-password`
- `POST /auth/logout-all`
- `GET /auth/me` (Bearer token)

### Users (Admin)
- `GET /auth/users`
- `GET /auth/users/:id`
- `POST /auth/users`
- `PATCH /auth/users/:id`
- `DELETE /auth/users/:id`
- `PATCH /auth/users/:id/status`
- `PATCH /auth/users/:id/password`

### Roles (Admin)
- `GET /auth/roles`
- `POST /auth/roles`
- `PATCH /auth/roles/:roleId`
- `DELETE /auth/roles/:roleId`

### User Role Assignment (Admin)
- `GET /auth/users/:userId/roles`
- `POST /auth/users/:userId/roles`
- `PUT /auth/users/:userId/roles`
- `DELETE /auth/users/:userId/roles/:roleId`

### Refresh Token Management (Admin)
- `GET /auth/users/:userId/refresh-tokens`
- `DELETE /auth/users/:userId/refresh-tokens`

### Departments
- `POST /departments`
- `GET /departments/:id`

## Login Payload Example
Use either username or email:


## Notes
- If Prisma reports migration drift on your local DB, use a clean local DB or reset dev schema before re-running migrations.
- Seed enforces one active admin role owner.

### Reset local database (destructive)
This will drop and recreate your DB schema, then re-apply migrations:
```bash
npx prisma migrate reset
```
