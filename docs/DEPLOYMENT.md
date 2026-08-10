# CampusMart — Production Deployment Guide

## Overview

CampusMart is architected as an isolated monorepo with decoupled frontend (`apps/web`) and backend (`apps/api`) services.

---

## Deployment Architecture

```
                               ┌───────────────────────────┐
                               │     Vercel / Netlify      │
                               │   (React 19 / Vite SPA)   │
                               └─────────────┬─────────────┘
                                             │ HTTPS
                                             ▼
┌───────────────────────────┐  REST / WSS    ┌───────────────────────────┐
│     Neon PostgreSQL       │ ◄────────────► │    Render / Railway / AWS │
│   (Relational Database)   │                │   (Node.js Express + WS)  │
└───────────────────────────┘                └─────────────┬─────────────┘
                                                           │ API Calls
                                             ┌─────────────┴─────────────┐
                                             ▼                           ▼
                              ┌──────────────────────────┐ ┌──────────────────────────┐
                              │     Cloudinary CDN       │ │   Google Gemini AI 2.5   │
                              │     (Image Storage)      │ │   (AI Assistance)        │
                              └──────────────────────────┘ └──────────────────────────┘
```

---

## Deployment Steps

### 1. Database Setup (Neon PostgreSQL)
1. Create a project in [Neon PostgreSQL](https://neon.tech).
2. Obtain the pooled connection string with SSL:
   `postgresql://user:pass@ep-cool-db.neon.tech/campusmart?sslmode=require`
3. Run Prisma migrations from `apps/api`:
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```

### 2. Backend Deployment (`apps/api`)
1. Deploy `apps/api` to Render, Railway, or AWS App Runner.
2. Configure Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `CLOUDINARY_*`, `GEMINI_API_KEY`).
3. Set start command: `npm run start --workspace=apps/api`

### 3. Frontend Deployment (`apps/web`)
1. Deploy `apps/web` to Vercel or Netlify.
2. Set Environment Variable `VITE_API_URL` pointing to backend API endpoint (`https://campusmart-api.onrender.com`).
3. Set build command: `npm run build --workspace=apps/web`
