# 🎓 CampusCore ERP

> **Modern, Multi-Tenant Cloud Enterprise Resource Planning (ERP) Platform for Universities & Higher Education Institutions.**

[![Node.js](https://img.shields.io/badge/Node.js-v20+-43853D?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-v9+-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-v16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v7.9-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Monorepo Architecture](#-monorepo-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#1-clone--install-dependencies)
  - [Environment Configuration](#2-environment-configuration)
  - [Database Setup](#3-database-setup)
  - [Running the Applications](#4-running-the-applications)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Domain Model & Entity Hierarchy](#-domain-model--entity-hierarchy)
- [Security & Multi-Tenancy Architecture](#-security--multi-tenancy-architecture)
- [Product Roadmap](#-product-roadmap)
- [License](#-license)

---

## 🌟 Overview

**CampusCore ERP** is a full-featured, enterprise-grade Higher Education Management System designed as a multi-tenant Software-as-a-Service (SaaS) platform. Built from the ground up to support single or multi-campus universities, colleges, and academic institutions, CampusCore seamlessly manages everything from institution onboarding and student admissions to faculty course assignments, scheduling, attendance tracking, and automated grade evaluations.

Every academic record within CampusCore ERP is strictly isolated by `tenantId`, ensuring strict database-level data partitioning and multi-tenant security across all operations.

---

## ✨ Key Features

### 🏢 1. Native Multi-Tenancy & Security
* **Tenant Scoped Isolation**: Every data model (Users, Students, Teachers, Courses, Enrollments, Grades, etc.) is strictly partition-scoped by `tenantId`.
* **JWT & RBAC Security**: Granular Role-Based Access Control integrated with access and refresh tokens.
* **Tenant Resolution Engine**: Interceptors and guards determine domain/tenant context per request.

### 🏛️ 2. Institutional Hierarchy Management
* **Multi-Campus Organization**: Configure campuses, faculties, departments, and degree-granting programs.
* **Program & Course Catalog**: Manage degree requirements, credit hours, year levels, and course prerequisites.

### 🎓 3. Academic Operations & Student Management
* **Student & Teacher Directories**: Track student numbers, employee IDs, personal profiles, and academic affiliations.
* **Course Enrollment Engine**: Manage course registrations with lifecycle status tracking (`ACTIVE`, `COMPLETED`, `DROPPED`, `WITHDRAWN`).
* **Teaching Assignments**: Assign faculty members to courses and manage department workloads.

### 🗓️ 4. Scheduling & Resource Allocation
* **Room & Campus Management**: Monitor classroom facilities, room types, and capacity limits.
* **Timetabling**: Configure weekly course schedules, time slots, and room allocations.

### 📊 5. Attendance, Grading & Result Engine
* **Attendance Tracking**: Record daily or session-based student attendance (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
* **Assessment Management**: Create weighted assessments (Quizzes, Assignments, Midterms, Finals, Projects, Practical Exams).
* **Grade Evaluation & Student Results**: Score entry, automated grade calculation, grade points (GPA generation), and draft/published status lifecycles.

---

## 📂 Monorepo Architecture

CampusCore ERP uses a **PNPM Workspace** monorepo structure separating the backend API and frontend client while maintaining shared build tools and package references.

```text
campuscore-erp/
├── apps/
│   ├── api/                     # NestJS Backend API Service
│   │   ├── prisma/              # Prisma Database Schema, Migrations, & Seeders
│   │   │   ├── schema.prisma    # Complete Multi-Tenant Database Schema
│   │   │   └── seed.ts          # Database Seeder Script
│   │   ├── src/                 # Application Source Code
│   │   │   ├── academic/        # Campuses, Departments, Programs, Courses, Grades, Results
│   │   │   ├── auth/            # JWT Auth, Passport Strategies, Refresh Tokens
│   │   │   ├── common/          # Tenant Guards, Decorators, Interceptors, Filters
│   │   │   ├── config/          # Environment & Application Configuration
│   │   │   └── tenants/         # Multi-Tenant Provisioning & Management
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                     # Next.js Frontend Web Application
│       ├── app/                 # Next.js App Router (Pages, Layouts)
│       ├── components/          # Reusable UI Components
│       ├── lib/                 # API Clients & Service Wrappers
│       ├── types/               # TypeScript Data Interfaces
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                 # Monorepo Workspace Configuration & Root Scripts
├── pnpm-workspace.yaml          # PNPM Workspace Package Definitions
├── pnpm-lock.yaml               # Locked Dependency Tree
└── README.md                    # Project Documentation
```

---

## 🛠️ Tech Stack

### Backend (`apps/api`)
- **Framework**: [NestJS v11](https://nestjs.com/) (Progressive Node.js framework)
- **Language**: TypeScript v5.7
- **Database & ORM**: PostgreSQL with [Prisma ORM v7.9](https://www.prisma.io/)
- **Authentication**: JWT (`@nestjs/jwt`, `passport-jwt`) with hashed refresh tokens & `bcrypt`
- **Validation**: `class-validator` & `class-transformer`
- **Testing**: Jest & Supertest

### Frontend (`apps/web`)
- **Framework**: [Next.js v16](https://nextjs.org/) (App Router architecture)
- **UI Library**: React v19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript v5

### Infrastructure & Package Management
- **Monorepo Manager**: [PNPM Workspaces](https://pnpm.io/workspaces)
- **Runtime Environment**: Node.js (v20+ recommended)

---

## 🚀 Getting Started

Follow these steps to set up CampusCore ERP locally on your development machine.

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v20.x` or higher
- **PNPM**: `v9.x` or higher (`npm i -g pnpm`)
- **PostgreSQL**: `v15.x` or higher running locally or accessible via URL

---

### 1. Clone & Install Dependencies

Clone the repository and install dependencies using PNPM:

```bash
git clone https://github.com/your-org/campuscore-erp.git
cd campuscore-erp
pnpm install
```

---

### 2. Environment Configuration

#### Backend Environment Setup
Create a `.env` file inside `apps/api/.env`:

```ini
NODE_ENV=development
APP_NAME="CampusCore ERP"
PORT=3000

# PostgreSQL Database Connection URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/campuscore?schema=public"

# Secrets for Access and Refresh Tokens
JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
```

#### Frontend Environment Setup
Create a `.env.local` file inside `apps/web/.env.local`:

```ini
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

### 3. Database Setup

Navigate to the API app or run Prisma commands through PNPM:

```bash
# Generate Prisma Client
pnpm --filter api exec prisma generate

# Run Database Migrations
pnpm --filter api exec prisma migrate dev --name init

# Seed Database with Initial Data
pnpm --filter api run prisma:seed
```

---

### 4. Running the Applications

Start both backend and frontend applications concurrently or individually using root workspace scripts:

#### Run Applications via Root Scripts
```bash
# Start Next.js Frontend (runs on http://localhost:3001)
pnpm run dev:web

# Start NestJS Backend API in watch mode (runs on http://localhost:3000)
pnpm run dev:api
```

#### Or Run Directly from Application Directories
```bash
# API Dev Server
cd apps/api && pnpm run start:dev

# Web Dev Server
cd apps/web && pnpm run dev
```

---

## ⚙️ Environment Variables

### Backend API (`apps/api/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application runtime mode (`development`, `production`, `test`) | `development` |
| `PORT` | HTTP Port for NestJS backend server | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/campuscore` |
| `JWT_ACCESS_SECRET` | Secret key for signing short-lived JWT access tokens | `access-secret-key` |
| `JWT_REFRESH_SECRET` | Secret key for signing long-lived JWT refresh tokens | `refresh-secret-key` |
| `JWT_EXPIRES_IN` | Duration for access token expiration | `1d` |
| `JWT_REFRESH_EXPIRES_IN` | Duration for refresh token expiration | `7d` |

### Frontend Web (`apps/web/.env.local`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL endpoint for backend REST API requests | `http://localhost:3000` |

---

## 📜 Available Scripts

Root `package.json` provides handy shortcuts to execute tasks across workspace packages:

| Command | Description |
| :--- | :--- |
| `pnpm run dev:web` | Starts the Next.js web application frontend on port `3001` |
| `pnpm run dev:api` | Starts the NestJS API application in watch/development mode on port `3000` |
| `pnpm run build:web` | Builds the production bundle for the Next.js web application |
| `pnpm run build:api` | Compiles the NestJS backend application to JavaScript (`dist/`) |
| `pnpm --filter api run test` | Executes backend unit tests using Jest |
| `pnpm --filter api run test:cov` | Generates backend unit test coverage report |
| `pnpm --filter api run lint` | Runs ESLint and auto-fixes issues in backend source code |

---

## 🧬 Domain Model & Entity Hierarchy

CampusCore ERP organizes higher education data into an intuitive, hierarchical model:

```mermaid
graph TD
    Tenant[🏢 Tenant / University]
    Tenant --> Campus[🏛️ Campus]
    Tenant --> User[👤 User & Roles]
    
    Campus --> Department[🔬 Department]
    Department --> Program[📜 Academic Program]
    Department --> Teacher[👨‍🏫 Teacher / Instructor]
    
    Program --> Course[📚 Course]
    Program --> Student[👨‍🎓 Student]
    
    Course --> Enrollment[📝 Course Enrollment]
    Student --> Enrollment
    
    Course --> TeachingAssignment[👨‍🏫 Teaching Assignment]
    Teacher --> TeachingAssignment
    
    Campus --> Room[🚪 Room]
    TeachingAssignment --> Timetable[🗓️ Timetable & Schedule]
    Room --> Timetable
    
    TeachingAssignment --> Attendance[📋 Attendance]
    Student --> Attendance
    
    TeachingAssignment --> Assessment[✍️ Assessment]
    Enrollment --> Grade[💯 Grade]
    Assessment --> Grade
    Assessment --> StudentResult[🏆 Student Result]
    Student --> StudentResult
```

### Core Entities Summary
- **`Tenant`**: Root multi-tenant entity representing a university or institution.
- **`User` & `Role`**: System user accounts with multi-tenant scoped role permissions.
- **`Campus`**: Physical or virtual campus locations.
- **`Department`**: Academic departments (e.g., Computer Science, Engineering, Business).
- **`Program`**: Degree programs offered by departments (e.g., BSc Software Engineering).
- **`Course`**: Subject courses with designated credit hours and semester levels.
- **`Student` & `Teacher`**: Profiles containing demographic, contact, and employment/academic credentials.
- **`Enrollment`**: Student registrations in specific courses.
- **`TeachingAssignment`**: Faculty assignments to instruct specific courses.
- **`Timetable` & `Room`**: Scheduling classes into physical rooms with day & time slots.
- **`Attendance`**: Attendance logs (Present, Absent, Late, Excused) per student.
- **`Assessment` & `Grade`**: Assessment definitions (Quizzes, Exams) and student grades.
- **`StudentResult`**: Final grade evaluation and grade points.

---

## 🔒 Security & Multi-Tenancy Architecture

```
[ Incoming HTTP Request ]
          │
          ▼
┌───────────────────────────┐
│     Tenant Resolver       │  <-- Identifies tenant via Domain / Header / Subdomain
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│    JWT Auth Guard         │  <-- Verifies Bearer Token & User Claims
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     RBAC Role Guard       │  <-- Verifies User Permissions & Roles
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     Controller & Service  │  <-- Business Logic Execution
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│   Tenant-Scoped Database  │  <-- Queries filtered automatically by tenantId
└───────────────────────────┘
```

---

## 🗺️ Product Roadmap

### 🏁 Milestone 1 — Platform Core *(Completed)*
- [x] Monorepo structure setup
- [x] Multi-tenancy entity & data isolation models
- [x] JWT Authentication with access and refresh tokens
- [x] Role-Based Access Control (RBAC) & Guards
- [x] Prisma database schema & seeding pipeline

### 🏛️ Milestone 2 — Academic Core *(Completed)*
- [x] Campus management
- [x] Department and Program structures
- [x] Course catalog and degree requirements
- [x] Student and Teacher directory profiles

### ⚙️ Milestone 3 — Academic Operations *(Completed / In Active Development)*
- [x] Course registration & student enrollments
- [x] Teaching assignments & workload allocation
- [x] Room capacity management & timetable scheduling
- [x] Daily attendance recording & status tracking
- [x] Assessment definitions, grade recording & result point calculation

### 🚀 Milestone 4 — Enterprise Extensions *(Planned)*
- [ ] Financial Management & Tuition Invoicing
- [ ] Library Management System
- [ ] Automated Notification Engine (Email / SMS)
- [ ] Analytical Dashboards & Transcript Generation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
