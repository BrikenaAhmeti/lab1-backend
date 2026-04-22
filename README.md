# MedSphere Lab1 Backend

Backend API for the Hospital Management System (Lab Course 1), built with Express, TypeScript, Prisma, PostgreSQL, and CQRS-style layering.

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
- Login with `identifier` (username or email)
- Backward-compatible login with `email`
- Role-based authorization (`ADMIN` routes)
- Single-admin policy (only one user can hold `ADMIN` role)
- Admin seed script

## Prerequisites
- Node.js 20+
- PostgreSQL running locally

## Environment Variables
Create `.env` (or copy from `.env.example`) with:

```env
PORT=3005
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medsphere?schema=public
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MAX_ACCESS_FAILED_COUNT=5
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Admin
ADMIN_EMAIL=admin@medsphere.local
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!
ADMIN_PHONE_NUMBER=
```

## Commands
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
npm run prisma:migrate -- --name init
```

### 4) Seed default admin and base roles
```bash
npm run prisma:seed
```

### 5) Run development server
```bash
npm run dev
```

### 6) Build
```bash
npm run build
```

### 7) Run tests
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
- `GET /auth/me` (Bearer token)

### Users (Admin)
- `GET /auth/users`
- `GET /auth/users/:id`
- `POST /auth/users`
- `PATCH /auth/users/:id`
- `DELETE /auth/users/:id`
- `PATCH /auth/users/:id/status`

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

```json
{
  "identifier": "admin",
  "password": "Admin123!"
}
```

or

```json
{
  "email": "admin@medsphere.local",
  "password": "Admin123!"
}
```

## Notes
- If Prisma reports migration drift on your local DB, use a clean local DB or reset dev schema before re-running migrations.
- Seed enforces one active admin role owner.
