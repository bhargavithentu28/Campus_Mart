# CAMPUSMART ARCHITECTURE SPECIFICATION

## System Overview
CampusMart is built as a high-performance, production-grade monorepo using npm workspaces (`apps/*`, `packages/*`).

```
CampusMart Monorepo
├── apps/
│   ├── web/                # React 19 + Vite + Tailwind CSS v4 SPA
│   └── api/                # Express.js + Prisma ORM + Socket.io Server
└── packages/
    ├── shared-types/      # Unified domain interfaces
    ├── validation/        # Shared Zod validation schemas
    └── config/            # Base TSConfig configurations
```

## Backend Architecture Layers
The Express API (`apps/api`) adheres strictly to Clean Architecture principles:

1. **REST Routes (`src/routes/`)**: Declarative HTTP verb & path handlers wired to authentication middleware.
2. **Controllers (`src/controllers/`)**: Thin handlers responsible for HTTP request parsing, Zod validation, invoking services, and returning structured JSON responses.
3. **Application Services (`src/modules/`)**: Domain business logic, state machines, ownership verification, and Gemini AI integrations.
4. **Prisma Infrastructure (`src/infrastructure/database/prisma.ts`)**: Singleton Prisma Client instance interacting with Neon PostgreSQL.

## Authentication & Security
- **Email Verification**: College domain email verification matching student emails (e.g. `student@coep.ac.in`) against registered university domain rules.
- **Token Strategy**: 15-minute JWT Access Tokens and 7-day Refresh Tokens stored in HTTP-only cookies.
- **Token Rotation**: Secure session rotation invalidating old refresh tokens upon re-issue (`DeviceSession` model).
- **RBAC**: Multi-role support (`STUDENT`, `FACULTY`, `CLUB`, `ALUMNI`, `MODERATOR`, `COLLEGE_ADMIN`, `SUPER_ADMIN`).
