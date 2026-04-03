# Arbeitly

A modern job search platform for candidates. Track applications, manage CVs, and get AI-powered parsing — all in one place.

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

## Quick Start

```bash
# From the project root
./setup-dev.sh
```

This will:
1. Start PostgreSQL 16, Valkey (Redis), and MinIO via Docker Compose
2. Install backend dependencies
3. Run database migrations
4. Seed demo data
5. Install frontend dependencies

Then in two terminals:

```bash
# Terminal 1 — Backend
cd backend && bun run dev

# Terminal 2 — Frontend
cd frontend && bun run dev
```

Open http://localhost:5173 in your browser.

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register a new candidate account |
| POST | /api/auth/login | No | Login and receive JWT |
| GET | /api/auth/me | Yes | Get current user info |

### Profile
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/profile | Yes | Get candidate profile |
| PUT | /api/profile | Yes | Update candidate profile |

### Onboarding
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/onboarding | Yes | Complete onboarding (sets firstName, lastName, marks onboardingCompleted=true) |

### CVs
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/cvs | Yes | Upload CV (multipart/form-data: file + title) — parses with Claude AI |
| GET | /api/cvs | Yes | List all CVs |
| GET | /api/cvs/:id | Yes | Get CV by ID |
| PUT | /api/cvs/:id | Yes | Update CV title |
| DELETE | /api/cvs/:id | Yes | Delete CV (also removes file from MinIO) |
| GET | /api/cvs/:id/export | Yes | Export CV as formatted PDF |

### Applications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/applications | Yes | Create application |
| GET | /api/applications | Yes | List all applications |
| GET | /api/applications/:id | Yes | Get application by ID |
| PUT | /api/applications/:id | Yes | Update application |
| DELETE | /api/applications/:id | Yes | Delete application |

---

## Architecture

```
arbeitly-app/
├── backend/               # Express + TypeScript API (Bun runtime)
│   ├── prisma/            # Prisma schema + migrations
│   ├── scripts/           # DB seed script
│   └── src/
│       ├── config/        # env, prisma, minio, valkey singletons
│       ├── controllers/   # Request handlers (delegate to services)
│       ├── dtos/          # Zod validation schemas
│       ├── errors/        # AppError + HttpError factory
│       ├── middleware/     # auth, roles, validate, errorHandler
│       ├── repositories/  # Thin Prisma DB layer
│       ├── routes/        # Express router registration
│       ├── services/      # Business logic (auth, cv, application, ai, onboarding)
│       └── utils/         # jwt, hash, response helpers
└── frontend/              # Vue 3 + Vite + Vuetify + Tailwind
    └── src/
        ├── components/    # AppLayout, AppNavbar
        ├── router/        # Vue Router config
        ├── stores/        # Pinia auth store
        └── views/         # Login, Register, Dashboard, Profile, CVs, Applications, Onboarding
```

### Key Technology Choices

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| API Framework | Express 4 |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Validation | Zod |
| Auth | JWT + bcryptjs |
| File Storage | MinIO (S3-compatible) |
| Cache | Valkey (Redis-compatible) via ioredis |
| AI | Anthropic Claude API (CV parsing) |
| PDF Generation | PDFKit |
| Frontend | Vue 3 + Vite + Vuetify 3 + Tailwind CSS + Pinia |

### Auth Flow

1. `POST /api/auth/register` — validates input, hashes password, creates User + stub CandidateProfile, returns JWT
2. JWT is stored in `localStorage` by the frontend
3. All protected routes verify the `Authorization: Bearer <token>` header
4. `req.user` is populated with `{ id, email, role }` by the auth middleware

### CV Pipeline

1. File uploaded via `multipart/form-data` to `POST /api/cvs`
2. Multer reads file into memory buffer
3. File is stored in MinIO with key `cvs/{userId}/{timestamp}-{filename}`
4. Buffer is sent to Anthropic Claude API for structured JSON extraction
5. Parsed data (name, email, skills, experience, education) stored as JSON in CV record
6. `GET /api/cvs/:id/export` generates a formatted PDF via PDFKit from the stored JSON

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret for signing JWTs |
| JWT_EXPIRES_IN | No | Token expiry (default: 7d) |
| ANTHROPIC_API_KEY | No | Claude API key for CV parsing |
| MINIO_ENDPOINT | No | MinIO host (default: localhost) |
| MINIO_PORT | No | MinIO port (default: 9000) |
| MINIO_USE_SSL | No | Use HTTPS for MinIO (default: false) |
| MINIO_ACCESS_KEY | No | MinIO access key |
| MINIO_SECRET_KEY | No | MinIO secret key |
| MINIO_BUCKET | No | MinIO bucket name (default: arbeitly) |
| VALKEY_URL | No | Valkey/Redis URL (default: redis://localhost:6379) |
| PORT | No | API server port (default: 3000) |
