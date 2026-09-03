# 🔌 CampusCore ERP — Backend API (`apps/api`)

> **NestJS 11 Multi-Tenant RESTful API Service & Prisma Database Layer for CampusCore ERP.**

[![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v7.9-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Jest-v30-C21325?style=flat-square&logo=jest&logoColor=white)](https://jestjs.io/)

---

## 📖 Overview

The `apps/api` package is the core backend engine of CampusCore ERP. Built with **NestJS 11** and **Prisma ORM 7**, it enforces strict multi-tenant data partitioning (`tenantId`), provides JWT authentication with refresh tokens, implements Role-Based Access Control (RBAC), and exposes REST endpoints for all institutional and academic operations.

---

## 🛠️ Tech Stack

- **Framework**: [NestJS v11](https://nestjs.com/)
- **ORM & Client**: [Prisma ORM v7.9](https://www.prisma.io/) with PostgreSQL adapter (`@prisma/adapter-pg`)
- **Database**: PostgreSQL 16+
- **Authentication**: `passport-jwt`, `@nestjs/jwt`, `bcrypt` for password hashing & refresh tokens
- **Validation**: `class-validator`, `class-transformer`, `joi`
- **API Docs**: `@nestjs/swagger` (OpenAPI)
- **Testing**: Jest v30, Supertest, `ts-jest`
- **Execution & Tooling**: `tsx`, `ts-node`, Nest CLI

---

## 📂 Folder Structure

```text
apps/api/
├── prisma/                          # Database Schema & Seed Engine
│   ├── migrations/                  # PostgreSQL Migration History
│   ├── schema.prisma                # Multi-Tenant Data Schema & Model Definitions
│   └── seed.ts                      # Database Seeder (Demo Tenants, Users, Campuses)
├── src/
│   ├── academic/                    # All Academic Modules
│   │   ├── campus/                  # Campus CRUD & Management
│   │   ├── department/              # Faculty & Department Management
│   │   ├── program/                 # Degree Program Management
│   │   ├── course/                  # Course Catalog Management
│   │   ├── student/                 # Student Directory & Records
│   │   ├── teacher/                 # Faculty Member Directory
│   │   ├── enrollment/              # Student Course Registrations
│   │   ├── teaching-assignment/     # Teacher-to-Course Assignments
│   │   ├── room/                    # Campus Facilities & Classroom Allocation
│   │   ├── timetable/               # Class Schedule & Timetables
│   │   ├── attendance/              # Daily/Session Attendance Tracking
│   │   ├── assessment/              # Weighted Course Assessments (Exams, Quizzes)
│   │   ├── grade/                   # Score Entry & Assessment Grading
│   │   ├── student-result/          # Final Grade Evaluation & Point Calculation
│   │   ├── academic-year/           # Academic Year Lifecycle Management
│   │   ├── academic-period/         # Academic Period (Year) CRUD
│   │   ├── academic-semester/       # Semester Management within Academic Years
│   │   ├── academic-result/         # Academic Result Aggregation (WIP)
│   │   ├── result-report/           # Analytics: Transcripts, Course & Assessment Reports
│   │   └── academic.module.ts       # Academic feature root module
│   ├── auth/                        # Auth Module (JWT, Passport, Refresh Tokens)
│   ├── tenants/                     # Tenant Management & Resolution
│   ├── common/                      # Shared Guards, Interceptors, Decorators, Filters
│   │   ├── decorators/              # CurrentUser, CurrentTenant, Roles decorators
│   │   ├── guards/                  # JwtAuthGuard, RolesGuard, TenantGuard
│   │   └── prisma/                  # PrismaService Database Context
│   ├── config/                      # Environment Configuration & Validation
│   ├── app.module.ts                # Root Application Module
│   └── main.ts                      # NestJS Application Entry Point
├── test/                            # E2E Integration Tests
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 🧩 API Modules Overview

### 🔑 Authentication (`src/auth`)
- **`POST /auth/register`** — Register a new user within a tenant.
- **`POST /auth/login`** — Authenticate credentials and receive access + refresh JWTs.
- **`POST /auth/refresh`** — Generate a new access token using a valid refresh token.
- **`GET /auth/me`** — Retrieve the current user's profile and tenant scope.

### 🏢 Tenants (`src/tenants`)
- **`GET /tenants`** — List all active institutions/tenants.
- **`POST /tenants`** — Provision a new university/tenant account.
- **`GET /tenants/:id`** — Fetch tenant details and domain configurations.

### 🎓 Academic Core (`src/academic/*`)

#### Campus & Facilities
Manage multi-campus structures, building blocks, and room capacities.

#### Departments & Programs
Configure academic departments and degree/programme requirements.

#### Course Catalog
Define credit hours, semester levels, and department affiliations.

#### Student & Faculty Directories
Manage student profiles, employee numbers, contact details, and role assignments.

---

### ⚙️ Academic Operations

#### Enrollments
Enroll students into courses with status tracking (`ACTIVE`, `COMPLETED`, `DROPPED`).

#### Teaching Assignments
Assign instructors to specific courses per semester.

#### Timetabling
Configure room schedules, day-of-week slots, and class times.

#### Attendance
Log student attendance per session (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).

#### Assessments & Grades
Create weighted assessments (exams, quizzes, assignments) and enter student scores.

#### Student Results
Calculate weighted final scores, letter grades, and grade points per course.

---

### 📅 Academic Calendar (`src/academic/academic-year`, `academic-period`, `academic-semester`)

Manage the full academic calendar hierarchy:

| Module | Route Prefix | Description |
|---|---|---|
| `academic-year` | `/academic-years` | Full lifecycle of an academic year (create, activate, archive) |
| `academic-period` | `/academic-years` *(aliased)* | Period-scoped academic year CRUD |
| `academic-semester` | `/academic-semesters` | Semester records nested within academic years |

**Key endpoints:**
- **`POST /academic-years`** — Create a new academic year.
- **`GET /academic-years`** — List all years (filterable by `?isActive=true`).
- **`GET /academic-years/active`** — Fetch the currently active academic year.
- **`GET /academic-years/:id`** — Fetch a specific academic year.
- **`PATCH /academic-years/:id`** — Update an academic year.
- **`DELETE /academic-years/:id`** — Remove an academic year.
- **`POST /academic-semesters`** — Create a semester linked to a year.
- **`GET /academic-semesters`** — List semesters (filterable by `?academicYearId=` and `?isActive=true`).
- **`GET /academic-semesters/active`** — Get the current active semester.
- **`PATCH /academic-semesters/:id`** / **`DELETE /academic-semesters/:id`** — Update or remove a semester.

---

### 📊 Result Reports (`src/academic/result-report`)

Read-only analytics endpoints for generating academic performance reports. All routes require JWT authentication and are scoped to the caller's tenant.

| Endpoint | Description |
|---|---|
| `GET /result-reports/students/:studentId` | Full academic report for one student — per-assessment results & weighted final grades. Supports `?semester=` and `?yearLevel=` filters. |
| `GET /result-reports/students/:studentId/transcript` | Transcript-style summary — one row per course with final letter grade. |
| `GET /result-reports/courses/:courseId` | Course-level report with all enrolled students and their results. |
| `GET /result-reports/assessments/:assessmentId` | Assessment-level statistics and per-student result breakdown. |

---

## 🚀 Local Development & Setup

### 1. Environment Variables Setup
Ensure `apps/api/.env` exists and contains valid database credentials:

```ini
NODE_ENV=development
APP_NAME="CampusCore ERP"
PORT=3000

# PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/campuscore?schema=public"

# JWT Token Secrets
JWT_ACCESS_SECRET=access-secret-change-this_
JWT_REFRESH_SECRET=refresh-secret-change-this_
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
```

### 2. Run Database Migrations & Generation
From the root monorepo or `apps/api` directory:

```bash
# Generate Prisma Client (outputted to generated/prisma & node_modules)
pnpm --filter api exec prisma generate

# Apply Database Migrations
pnpm --filter api exec prisma migrate dev

# Seed Demo Data (Tenants, Admin User, Campuses, Departments, Courses)
# Defined in package.json → prisma.seed → tsx prisma/seed.ts
pnpm --filter api exec prisma db seed
```

### 3. Start Development Server

```bash
# From monorepo root
pnpm run dev:api

# Or inside apps/api
pnpm run start:dev
```

The API service will start on **`http://localhost:3000`**.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `pnpm run start:dev` | Start NestJS in watch mode for development |
| `pnpm run start:debug` | Start NestJS in debug + watch mode |
| `pnpm run start` | Start NestJS (no watch) |
| `pnpm run build` | Generate Prisma client and compile TypeScript to `dist/` |
| `pnpm run start:prod` | Run the compiled production build (`node dist/src/main.js`) |
| `pnpm run format` | Auto-format all source files with Prettier |
| `pnpm run test` | Run unit tests using Jest |
| `pnpm run test:watch` | Run unit tests in watch mode |
| `pnpm run test:cov` | Generate test coverage report |
| `pnpm run test:e2e` | Run end-to-end API integration tests |
| `pnpm run lint` | Execute ESLint auto-fixer |

---

## 🔒 Tenant Isolation Policy

Every database entity linked to an institution carries a `tenantId String` column. Backend queries are automatically filtered by the `tenantId` extracted from the authenticated JWT token or tenant header, guaranteeing strict data isolation between institutions. No cross-tenant data leakage is possible at the service layer.

---

## 🗺️ API Quick Reference

| Domain | Method | Path | Auth |
|---|---|---|---|
| Auth | POST | `/auth/register` | ✅ Public |
| Auth | POST | `/auth/login` | ✅ Public |
| Auth | POST | `/auth/refresh` | ✅ Public |
| Auth | GET | `/auth/me` | 🔐 JWT |
| Tenants | GET | `/tenants` | 🔐 JWT |
| Tenants | POST | `/tenants` | 🔐 JWT |
| Academic Year | POST/GET | `/academic-years` | 🔐 JWT |
| Academic Year | GET | `/academic-years/active` | 🔐 JWT |
| Academic Year | GET/PATCH/DELETE | `/academic-years/:id` | 🔐 JWT |
| Academic Semester | POST/GET | `/academic-semesters` | 🔐 JWT |
| Academic Semester | GET | `/academic-semesters/active` | 🔐 JWT |
| Academic Semester | GET/PATCH/DELETE | `/academic-semesters/:id` | 🔐 JWT |
| Campus | CRUD | `/campuses` | 🔐 JWT |
| Department | CRUD | `/departments` | 🔐 JWT |
| Program | CRUD | `/programs` | 🔐 JWT |
| Course | CRUD | `/courses` | 🔐 JWT |
| Student | CRUD | `/students` | 🔐 JWT |
| Teacher | CRUD | `/teachers` | 🔐 JWT |
| Enrollment | CRUD | `/enrollments` | 🔐 JWT |
| Teaching Assignment | CRUD | `/teaching-assignments` | 🔐 JWT |
| Room | CRUD | `/rooms` | 🔐 JWT |
| Timetable | CRUD | `/timetables` | 🔐 JWT |
| Attendance | CRUD | `/attendance` | 🔐 JWT |
| Assessment | CRUD | `/assessments` | 🔐 JWT |
| Grade | CRUD | `/grades` | 🔐 JWT |
| Student Result | CRUD | `/student-results` | 🔐 JWT |
| Result Report | GET | `/result-reports/students/:id` | 🔐 JWT |
| Result Report | GET | `/result-reports/students/:id/transcript` | 🔐 JWT |
| Result Report | GET | `/result-reports/courses/:id` | 🔐 JWT |
| Result Report | GET | `/result-reports/assessments/:id` | 🔐 JWT |
