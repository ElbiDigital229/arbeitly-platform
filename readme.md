# Arbeitly Platform

A candidate management platform where employees enhance CVs/cover letters with AI, discover jobs, auto-generate tailored applications, and track performance — managed by admins.

## Related Repositories

| Repo | Description | Status |
|------|-------------|--------|
| [arbeitly-platform](https://github.com/ElbiDigital229/arbeitly-platform) | **Current** — Express + Vue 3 rewrite | Active |
| [arbeitly-be](https://github.com/ElbiDigital229/arbeitly-be) | Legacy Laravel backend | Reference |
| [new-arbeitly-fe](https://github.com/ElbiDigital229/new-arbeitly-fe) | Legacy Next.js/React frontend | Reference |

---

## Prerequisites

- [Bun](https://bun.sh) >= 1.0 (runtime + package manager)
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose (for Postgres, MinIO)

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

# Run the setup script (installs deps, starts Docker, pushes schema, seeds)
chmod +x setup-dev.sh
./setup-dev.sh
```

### Manual Setup

```bash
# 1. Start infrastructure (Postgres + MinIO)
docker compose -f backend/dev-docker-compose.yml up -d

# 2. Backend setup
cd backend
bun install
cp .env.example .env        # Edit .env — set ANTHROPIC_API_KEY for AI features
bun run db:push              # Push schema to database
bun run db:seed              # Creates admin + employee accounts
cd ..

# 3. Frontend setup
cd frontend
bun install
cd ..
```

### Running

```bash
# Terminal 1 — Backend (port 4000)
cd backend && bun run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && bun run dev
```

Open http://localhost:5173 in your browser.

### Seed Accounts

After running `bun run db:seed`:

| Role | Email | Password | Portal URL |
|------|-------|----------|------------|
| Admin | `admin@arbeitly.de` | `admin2024` | http://localhost:5173/superadmin/login |
| Employee | `employee@arbeitly.de` | `employee2024` | http://localhost:5173/employee/login |

Candidates register themselves at http://localhost:5173/register.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Backend | Express 4, TypeScript |
| Database | PostgreSQL 16, Prisma 6 |
| Validation | Zod |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Storage | MinIO (S3-compatible) |
| AI | Anthropic Claude (`claude-haiku-4-5-20251001`) |
| PDF | PDFKit (generation), pdfjs-dist (parsing), Sharp (images), Puppeteer (HTML→PDF) |
| Frontend | Vue 3, Vite 6, Vuetify 3, Tailwind CSS 3, Pinia |
| Icons | MDI (`@mdi/font`) |
| HTTP Client | Axios (with interceptors) |

---

## Architecture

### Three Auth Flows

| Role | Login Route | API Prefix | Token Key | Store |
|------|------------|------------|-----------|-------|
| Candidate | `/login` | `/api/auth/*` | `arbeitly_token` | `stores/auth.ts` |
| Employee | `/employee/login` | `/api/employee/*` | `arbeitly_employee_token` | `stores/employee.ts` |
| Admin | `/superadmin/login` | `/api/admin/*` | `arbeitly_admin_token` | `stores/admin.ts` |

### API Pattern

- Frontend axios `baseURL: "/api"` → Vite proxy forwards to backend at `localhost:4000`
- All responses: `{ success: true, data: {...} }` or `{ success: false, error: "..." }`

---

## Project Structure

```
arbeitly-platform/
├── backend/                        # Express + TypeScript API (Bun runtime)
│   ├── prisma/
│   │   ├── schema.prisma           # All database models
│   │   └── seed.ts                 # Creates admin + employee
│   ├── src/
│   │   ├── controllers/            # Request handlers
│   │   ├── dtos/                   # Zod validation schemas
│   │   ├── errors/                 # HttpError class
│   │   ├── middleware/             # auth, roles, validate, errorHandler, rateLimiter
│   │   ├── repositories/          # Prisma DB layer
│   │   ├── routes/                # Express routers
│   │   ├── services/              # Business logic (auth, cv, ai, admin, employee, etc.)
│   │   ├── utils/                 # jwt, hash, response helpers
│   │   └── server.ts              # Entry point
│   ├── dev-docker-compose.yml     # Dev infrastructure
│   └── .env.example
│
├── frontend/                       # Vue 3 + Vite + Vuetify + Tailwind
│   └── src/
│       ├── components/
│       │   ├── landing/            # Landing page sections
│       │   ├── EmployeeLayout.vue  # Employee portal layout + nav
│       │   └── SuperAdminLayout.vue # Admin portal layout + nav
│       ├── router/                 # Vue Router + route guards
│       ├── services/
│       │   └── api.ts              # Axios instance + interceptor
│       ├── stores/
│       │   ├── auth.ts             # Candidate auth (Pinia)
│       │   ├── employee.ts         # Employee auth
│       │   └── admin.ts            # Admin auth
│       └── views/
│           ├── candidate/          # Dashboard, Onboarding, CV Builder, Applications
│           ├── employee/           # Dashboard, CandidateDetail, JobDiscovery
│           └── superadmin/         # Overview, Candidates, Employees, Plans, AIConfig, Performance
│
├── docs/                           # Business logic documentation (11 files)
├── setup-dev.sh                    # One-command dev setup
└── readme.md
```

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | /register | Register candidate |
| POST | /login | Candidate login → JWT |
| GET | /me | Current user + profile |
| PUT | /change-password | Change password |

### Onboarding (`/api/onboarding`)
| Method | Path | Description |
|--------|------|-------------|
| POST | / | Complete candidate onboarding |

### CVs (`/api/cvs`)
| Method | Path | Description |
|--------|------|-------------|
| POST | / | Upload CV (multipart) — AI parses |
| POST | /create | Create CV from editor |
| GET | / | List all CVs |
| GET | /:id | Get CV by ID |
| PUT | /:id | Update CV |
| DELETE | /:id | Delete CV |
| GET | /:id/export | Export CV as PDF |

### Applications (`/api/applications`)
| Method | Path | Description |
|--------|------|-------------|
| POST | / | Create application |
| POST | /bulk | Bulk create (CSV, max 100) |
| GET | / | List applications |
| GET | /:id | Get application |
| PUT | /:id | Update application |
| DELETE | /:id | Delete application |

### Plans (`/api/plans`)
| Method | Path | Description |
|--------|------|-------------|
| GET | / | List active plans |

### Payments (`/api/payments`)
| Method | Path | Description |
|--------|------|-------------|
| POST | /create-checkout | Create checkout session |
| GET | /verify/:sessionId | Verify payment |

### Admin (`/api/admin`)
| Method | Path | Description |
|--------|------|-------------|
| POST | /login | Admin login |
| GET | /me | Current admin |
| GET | /candidates | List all candidates |
| PATCH | /candidates/:id | Update candidate (assign employee, etc.) |
| GET | /employees | List employees |
| POST | /employees | Create employee |
| DELETE | /employees/:id | Delete employee |
| GET | /plans | List all plans |
| POST | /plans | Create plan |
| PATCH | /plans/:id | Update plan |
| DELETE | /plans/:id | Delete plan |
| GET | /prompts | List AI prompts |
| POST | /prompts | Create prompt |
| PATCH | /prompts/:id | Update prompt |
| DELETE | /prompts/:id | Delete prompt |
| GET | /overview | Dashboard stats |
| GET | /performance | Employee performance metrics |
| GET | /performance/:employeeId | Single employee detail |

### Employee (`/api/employee`)
| Method | Path | Description |
|--------|------|-------------|
| POST | /login | Employee login |
| GET | /me | Current employee |
| GET | /candidates | Assigned candidates |
| GET | /candidates/:id | Candidate detail |
| GET | /candidates/:id/cvs | Candidate's CVs |
| POST | /candidates/:id/cvs/:cvId/enhance | AI enhance CV |
| POST | /candidates/:id/cvs/:cvId/version | Create CV version |
| POST | /candidates/:id/cvs/:cvId/variant | Create CV variant |
| GET | /candidates/:id/cvs/:cvId/tree | CV version tree |
| GET | /candidates/:id/cover-letters | Candidate's cover letters |
| POST | /candidates/:id/cover-letters | Create cover letter |
| PUT | /candidates/:id/cover-letters/:clId | Update cover letter |
| POST | /candidates/:id/cover-letters/:clId/enhance | AI enhance CL |
| POST | /candidates/:id/cover-letters/:clId/version | Create CL version |
| POST | /candidates/:id/cover-letters/:clId/variant | Create CL variant |
| GET | /candidates/:id/cover-letters/:clId/tree | CL version tree |
| POST | /candidates/:id/cover-letters/generate | Generate CL for job |
| GET | /candidates/:id/applications | Candidate's applications |
| POST | /candidates/:id/applications | Create application |
| PUT | /candidates/:candidateId/applications/:appId | Update application |
| DELETE | /candidates/:candidateId/applications/:appId | Delete application |
| GET | /performance | Own performance stats |

### Job Discovery (`/api/jobs`)
| Method | Path | Description |
|--------|------|-------------|
| GET | / | List all jobs |
| POST | / | Add job |
| DELETE | /:id | Delete job |
| POST | /:id/score/:candidateId | AI relevance score (0-100) |
| POST | /:id/queue/:candidateId | Add to queue → auto-generates tailored CV |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | — | PostgreSQL connection (port 5433 with dev docker-compose) |
| JWT_SECRET | Yes | — | Secret for signing JWTs |
| JWT_EXPIRES_IN | No | 7d | Token expiry |
| ANTHROPIC_API_KEY | Yes* | — | Claude API key for AI features (CV parsing, enhancement, matching) |
| MINIO_ENDPOINT | No | localhost | MinIO host |
| MINIO_PORT | No | 9000 | MinIO port |
| MINIO_USE_SSL | No | false | MinIO HTTPS |
| MINIO_ACCESS_KEY | No | minioadmin | MinIO access key |
| MINIO_SECRET_KEY | No | minioadmin | MinIO secret key |
| MINIO_BUCKET | No | arbeitly | MinIO bucket name |
| PORT | No | 4000 | API server port |

*Required for CV parsing, enhancement, cover letter generation, and job matching. The app starts without it but AI features will fail.

---

## Docker Services

Started via `docker compose -f backend/dev-docker-compose.yml up -d`:

| Service | Port | Credentials |
|---------|------|-------------|
| PostgreSQL 16 | 5433 | arbeitly / arbeitly / arbeitly |
| MinIO (S3) | 9000 (API), 9001 (Console) | minioadmin / minioadmin |
| Valkey (Redis) | 6379 | — |

---

## Key Business Flows

### Candidate Journey
1. Register → Complete onboarding (profile + upload CV + write cover letter) → Browse plans → Purchase plan → Wait for employee assignment

### Employee Workflow
1. View assigned candidates → Enhance CV/CL with AI → Discover jobs → Score relevance → Add to queue (auto-generates tailored CV + application) → Apply on behalf → Track via kanban

### Admin Operations
1. Create plans → Create employees → Assign paid+onboarded candidates to employees → Configure AI prompts → Monitor employee performance

See `docs/` for detailed breakdowns of each flow.

---

## Prisma Commands

```bash
cd backend

bunx prisma db push       # Push schema changes (use this, NOT migrate dev)
bunx prisma studio         # Visual DB browser
bunx prisma generate       # Regenerate client after schema changes
bun run db:seed            # Seed admin + employee accounts
```

---

## Documentation

The `docs/` folder contains detailed business logic documentation:

| File | Topic |
|------|-------|
| `00-overview.md` | Platform overview and user roles |
| `01-free-candidate.md` | Free tier features and limits |
| `02-paid-candidate.md` | Paid tier and payment flow |
| `03-employee-workflow.md` | Employee portal and candidate management |
| `04-admin-operations.md` | Admin portal and configuration |
| `05-reporting.md` | Performance tracking and metrics |
| `06-job-discovery.md` | Job pool, scoring, and queue system |
| `07-ai-matching.md` | AI relevance scoring |
| `08-cv-generation.md` | CV/CL enhancement and generation |
| `09-cv-parsing.md` | AI CV parsing pipeline |
| `10-misc.md` | Auth, API structure, middleware, database |

---

## Known Quirks

1. **Bun PATH**: Background shell processes may not find bun. Fix: `export PATH="$HOME/.bun/bin:$PATH"`
2. **Prisma shadow DB**: `migrate dev` fails — always use `db push` instead
3. **Docker Postgres port**: Mapped to 5433 (not default 5432) to avoid conflicts with local Postgres
4. **dotenv**: Bun doesn't reliably load .env files. The server imports `dotenv/config` explicitly.
