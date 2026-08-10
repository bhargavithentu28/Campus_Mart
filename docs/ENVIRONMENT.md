# CampusMart — Production Environment Variables Documentation

This document defines all environment configuration variables required to run CampusMart in development, staging, and production environments.

---

## 1. Core Server Environment (`apps/api`)

| Variable Name | Required | Description | Example Value |
|---|---|---|---|
| `PORT` | Yes | HTTP server port | `5000` |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string with SSL | `postgresql://user:pass@ep-cool-db.neon.tech/campusmart?sslmode=require` |
| `JWT_SECRET` | Yes | Secret key for 15-min Access Tokens | `super_secret_jwt_access_key_min_32_chars` |
| `JWT_REFRESH_SECRET` | Yes | Secret key for 7-day Refresh Tokens | `super_secret_jwt_refresh_key_min_32_chars` |
| `CLIENT_URL` | Yes | Allowed frontend origin for CORS & cookies | `https://campusmart.vercel.app` |

---

## 2. Cloudinary Storage (`apps/api`)

| Variable Name | Required | Description | Example Value |
|---|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account cloud name | `campusmart` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API Secret (Keep private!) | `aBCdEfGhIjKlMnOpQrStUvWxYz` |

---

## 3. Gemini AI Engine (`apps/api`)

| Variable Name | Required | Description | Example Value |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini 2.5 API Key for descriptions, price prediction & moderation | `AIzaSyD-exampleKeyStringHere` |

---

## 4. Frontend Environment (`apps/web`)

| Variable Name | Required | Description | Example Value |
|---|---|---|---|
| `VITE_API_URL` | Yes | Base URL for REST API & Socket.io server | `https://campusmart-api.onrender.com` |
