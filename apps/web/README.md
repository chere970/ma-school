# 💻 CampusCore ERP — Web Client (`apps/web`)

> **Next.js 16 (App Router) Frontend Web Interface for CampusCore ERP.**

[![Next.js](https://img.shields.io/badge/Next.js-v16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📖 Overview

The `apps/web` package is the user-facing web application for CampusCore ERP. Built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**, it provides administrators, faculty members, and students with an intuitive, responsive dashboard to interact with the CampusCore backend API.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js v16](https://nextjs.org/) (App Router architecture)
- **UI Library**: React v19
- **Styling Engine**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: TypeScript v5
- **API Integration**: Custom typed API client services connecting to `apps/api`

---

## 📂 Folder Structure

```text
apps/web/
├── app/                         # Next.js App Router Pages & Layouts
│   ├── academic/                # Academic Administration Views
│   ├── dashboard/               # Main Dashboard Interface
│   ├── login/                   # User Authentication & Tenant Login
│   ├── favicon.ico
│   ├── globals.css              # Global Tailwind v4 Styles
│   ├── layout.tsx               # Root Layout Wrapper
│   └── page.tsx                 # Application Home Redirect
├── components/                  # Reusable UI Components & Layouts
├── lib/
│   ├── api/                     # Typed REST API Client Modules
│   │   ├── auth.ts              # Authentication API Wrapper
│   │   ├── client.ts            # Base Fetch Client with Auth Headers
│   │   ├── campuses.ts          # Campus API Client
│   │   ├── departments.ts       # Department API Client
│   │   ├── programs.ts          # Program API Client
│   │   ├── courses.ts           # Course Catalog API Client
│   │   ├── students.ts          # Student Directory API Client
│   │   ├── teachers.ts          # Faculty Directory API Client
│   │   ├── enrollments.ts       # Enrollment API Client
│   │   ├── teaching-assignments.ts # Teaching Assignment API Client
│   │   ├── rooms.ts             # Room Allocation API Client
│   │   └── timetable.ts         # Timetable Scheduling API Client
│   └── auth/                    # Client-side Auth Utilities & Token Storage
├── types/                       # Shared TypeScript Interfaces
│   └── academic.ts              # Academic Data Types & DTO Interfaces
├── public/                      # Static Assets & Images
├── next.config.ts               # Next.js Configuration
├── package.json
└── tsconfig.json
```

---

## 🔌 Connecting to Backend API

The web application communicates with the backend NestJS service (`apps/api`) using a centralized API fetch wrapper located in `lib/api/client.ts`.

It handles:
- **Base Endpoint Resolution**: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3000`).
- **Authorization Headers**: Automatically attaches `Bearer <access_token>` to outgoing requests.
- **Tenant Context Headers**: Passes active `X-Tenant-ID` context when needed.
- **Response Parsing & Error Handling**: Normalizes REST API responses and errors.

---

## 🚀 Local Development & Setup

### 1. Environment Setup
Create `.env.local` inside `apps/web/.env.local`:

```ini
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Run Next.js Development Server

Make sure the backend API (`apps/api`) is running on port 3000 first, then start the web dev server:

```bash
# From monorepo root
pnpm run dev:web

# Or inside apps/web
pnpm run dev
```

The Web Application will start on **`http://localhost:3001`**.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Start Next.js dev server on port `3001` |
| `pnpm run build` | Build optimized production bundle |
| `pnpm run start` | Start Next.js production server |
| `pnpm run lint` | Execute ESLint checks |
