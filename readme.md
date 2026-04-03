# Arbeitly Platform

A modern job search platform for candidates. Track applications, manage CVs, and get AI-powered parsing.

## Related Repositories

| Repo | Description | Status |
|------|-------------|--------|
| [arbeitly-platform](https://github.com/ElbiDigital229/arbeitly-platform) | **Current** — Express + Vue 3 rewrite | Active |
| [arbeitly-be](https://github.com/ElbiDigital229/arbeitly-be) | Legacy Laravel backend (fork of ubaidrehman97) | Reference |
| [new-arbeitly-fe](https://github.com/ElbiDigital229/new-arbeitly-fe) | Legacy Next.js/React frontend (fork of ubaidrehman97) | Reference |
| [cv-builder](https://github.com/ElbiDigital229/cv-builder) | Original Laravel CV builder | Reference |

---

## Prerequisites

- [Bun](https://bun.sh) >= 1.0 (runtime for backend + package manager)
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose (for Postgres, Valkey, MinIO)
- [Node.js](https://nodejs.org) >= 18 (optional, for frontend if not using Bun)

### Install Bun (macOS/Linux)
```bash
curl -fsSL https://bun.sh/install | bash
```

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/ElbiDigital229/arbeitly-platform.git
cd arbeitly-platform

# Run the setup script (installs deps, starts Docker, runs migrations)
chmod +x setup-dev.sh
./setup-dev.sh
```

### Manual Setup

If you prefer to set up manually:

```bash
# 1. Start infrastructure
docker compose -f backend/dev-docker-compose.yml up -d

# 2. Backend setup
cd backend
bun install
cp .env.example .env        # Edit .env — set ANTHROPIC_API_KEY for AI CV parsing
bun run db:push              # Push schema to database (use db:push, NOT db:migrate)
bun run db:seed              # Optional: seed demo data
cd ..

# 3. Frontend setup
cd frontend
bun install
cd ..
```

### Running

```bash
# Terminal 1 — Backend (port 4000)
cd backend
ANTHROPIC_API_KEY=your-key-here bun --watch src/server.ts

# Terminal 2 — Frontend (port 5173)
cd frontend
bun run dev
```

Open http://localhost:5173 in your browser.

### Test Account

After seeding: `demo@arbeitly.com` / `password123`

Or create a new account via the Register page.

If you need to manually set a password:
```sql
-- Connect to postgres and run:
UPDATE "User" SET password = '$2a$10$YourBcryptHashHere' WHERE email = 'your@email.com';
```

---

## Project Structure

```
arbeitly-platform/
├── backend/                    # Express + TypeScript API (Bun runtime)
│   ├── prisma/                 # Prisma schema + migrations
│   │   └── schema.prisma       # Database models
│   ├── scripts/                # DB seed script
│   ├── src/
│   │   ├── config/             # env, prisma, minio, valkey singletons
│   │   ├── controllers/        # Request handlers (delegate to services)
│   │   ├── dtos/               # Zod validation schemas
│   │   ├── errors/             # AppError + HttpError factory
│   │   ├── middleware/         # auth, roles, validate, errorHandler
│   │   ├── repositories/      # Thin Prisma DB layer
│   │   ├── routes/            # Express router registration
│   │   ├── services/          # Business logic (auth, cv, ai, application, etc.)
│   │   └── utils/             # jwt, hash, response helpers
│   ├── server.ts              # App entry point
│   ├── Caddyfile              # Reverse proxy config
│   ├── Dockerfile             # Production Docker build
│   ├── dev-docker-compose.yml # Dev infrastructure (Postgres, Valkey, MinIO)
│   └── docker-compose.yml     # Production compose
│
├── frontend/                   # Vue 3 + Vite + Vuetify + Tailwind
│   └── src/
│       ├── components/         # Layout, sidebar, step indicator, template preview
│       │   └── landing/        # Landing page sections
│       ├── router/             # Vue Router config + guards
│       ├── stores/             # Pinia auth store
│       ├── views/              # Public views (Home, Login, Register, Pricing)
│       │   └── candidate/      # Protected portal views
│       ├── style.css           # Global CSS + design tokens
│       └── main.ts            # App bootstrap
│
├── setup-dev.sh               # One-command dev setup
└── readme.md                  # This file
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Backend | Express 4, TypeScript (strict) |
| Database | PostgreSQL 16, Prisma 6 |
| Validation | Zod |
| Auth | JWT + bcryptjs (Auth0 planned) |
| File Storage | MinIO (S3-compatible) |
| Cache | Valkey (Redis-compatible) via ioredis |
| AI | Anthropic Claude API (CV parsing — 30+ fields) |
| PDF | PDFKit (generation), pdfjs-dist (parsing), Sharp (images) |
| Frontend | Vue 3, Vite 6, Vuetify 3, Tailwind CSS 3, Pinia |
| Payments | Stripe (planned) |
| Messaging | NATS JetStream (planned) |
| Reverse Proxy | Caddy |
| Containers | Docker, Docker Compose |

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register candidate account |
| POST | /api/auth/login | No | Login, receive JWT |
| GET | /api/auth/me | Yes | Get current user + profile + usage |
| PUT | /api/auth/change-password | Yes | Change password |

### Profile
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/profile | Yes | Get candidate profile |
| PUT | /api/profile | Yes | Update profile |

### Onboarding
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/onboarding | Yes | Complete onboarding |

### CVs
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/cvs | Yes | Upload CV (multipart) — AI parses + extracts photo |
| POST | /api/cvs/create | Yes | Create CV from editor data |
| GET | /api/cvs | Yes | List all CVs |
| GET | /api/cvs/:id | Yes | Get CV by ID |
| PUT | /api/cvs/:id | Yes | Update CV |
| DELETE | /api/cvs/:id | Yes | Delete CV |
| GET | /api/cvs/:id/export | Yes | Export CV as PDF |

### Applications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/applications | Yes | Create application |
| POST | /api/applications/bulk | Yes | Bulk create (CSV import, max 100) |
| GET | /api/applications | Yes | List all applications |
| GET | /api/applications/:id | Yes | Get application by ID |
| PUT | /api/applications/:id | Yes | Update application |
| DELETE | /api/applications/:id | Yes | Delete application |

### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Health check |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | — | PostgreSQL connection string |
| JWT_SECRET | Yes | — | Secret for signing JWTs |
| JWT_EXPIRES_IN | No | 7d | Token expiry |
| ANTHROPIC_API_KEY | No | — | Claude API key for CV parsing |
| MINIO_ENDPOINT | No | localhost | MinIO host |
| MINIO_PORT | No | 9000 | MinIO port |
| MINIO_USE_SSL | No | false | MinIO HTTPS |
| MINIO_ACCESS_KEY | No | minioadmin | MinIO access key |
| MINIO_SECRET_KEY | No | minioadmin | MinIO secret key |
| MINIO_BUCKET | No | arbeitly | MinIO bucket |
| VALKEY_URL | No | redis://localhost:6379 | Valkey/Redis URL |
| PORT | No | 4000 | API server port |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | No | http://localhost:4000 | API target (used by Vite proxy) |

---

## Docker Services

Started via `docker compose -f backend/dev-docker-compose.yml up -d`:

| Service | Port | Credentials |
|---------|------|-------------|
| PostgreSQL 16 | 5432 | arbeitly / arbeitly / arbeitly |
| Valkey (Redis) | 6379 | — |
| MinIO (S3) | 9000 (API), 9001 (Console) | minioadmin / minioadmin |

---

## Key Features (Free Tier)

- AI CV Parsing — 30+ fields extracted with zero data loss (Claude)
- Profile Photo Extraction — automatically pulled from uploaded PDF CVs
- CV Builder — 3 templates (Modern/Classic/Minimal), EN/DE, drag-and-drop sections, live preview
- Signature Upload — handwritten signature in CV
- Application Tracker — Kanban board with 7 status columns
- CSV Bulk Import — import up to 100 applications at once
- 6 Extra Application Fields — salary, contact person, next action, job description, CV used, references
- Usage Limits — configurable CV creation quota per user
- Full Tailwind Design System — dark navy theme with cyan accents

---

## Prisma Commands

```bash
cd backend

# Push schema changes (use this instead of migrate dev)
bunx prisma db push

# Open Prisma Studio (visual DB browser)
bunx prisma studio

# Generate client after schema changes
bunx prisma generate

# Seed demo data
bun run db:seed
```

**Note:** `prisma migrate dev` may fail due to shadow database permissions. Use `prisma db push` instead.

---

## Known Quirks

1. **Bun PATH**: Background shell processes may not find bun. Fix: `export PATH="$HOME/.bun/bin:$PATH"`
2. **Port 3000 occupied**: Backend defaults to 4000 to avoid conflicts. Frontend Vite proxy points to `http://localhost:4000`
3. **Prisma shadow DB**: `migrate dev` fails — use `db push` instead
4. **dotenv**: Bun doesn't reliably load .env files. The server imports `dotenv/config` explicitly.
