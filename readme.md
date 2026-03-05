# Arbeitly

## Tech Stack

| Layer         | Tech                                    |
| ------------- | --------------------------------------- |
| Runtime       | Bun                                     |
| Backend       | Express, TypeScript                     |
| Database      | PostgreSQL 16, Prisma ORM               |
| Frontend      | Vue 3, Vite, Vuetify, Tailwind CSS      |
| State         | Pinia                                   |
| Auth          | Auth0                                   |
| Payments      | Stripe                                  |
| Cache         | Valkey (Redis-compatible), ioredis      |
| Messaging     | NATS JetStream                          |
| Storage       | MinIO / S3                              |
| Reverse Proxy | Caddy                                   |
| Containers    | Docker, docker-compose                  |
| Validation    | Zod                                     |

## Prerequisites

- [Bun](https://bun.sh/) installed
- [Docker](https://www.docker.com/) installed and running

## Getting Started

### Quick Setup

```bash
./setup-dev.sh
```

### Manual Setup

**1. Start infrastructure services**

```bash
cd backend
bun run docker:up
```

This starts PostgreSQL, MinIO, and Valkey via `dev-docker-compose.yml`.

**2. Backend**

```bash
cd backend
cp .env.example .env.development   # edit with your Auth0/Stripe keys
bun install
bun run db:migrate
bun run db:seed
bun run dev                        # runs on port 2000
```

**3. Frontend**

```bash
cd frontend
bun install
bun run dev                        # runs on port 2222
```

## Project Structure

```
arbeitly-app/
├── backend/
│   ├── prisma/              # schema, migrations, seed
│   ├── src/
│   │   ├── server.ts        # Express app entrypoint
│   │   ├── config/          # Zod-validated env config
│   │   ├── controllers/     # request handlers
│   │   ├── dtos/            # Zod validation schemas
│   │   ├── errors/          # custom error classes
│   │   ├── middleware/      # auth, validation, error handling
│   │   ├── repositories/    # data access layer
│   │   ├── routes/          # route definitions
│   │   ├── services/        # business logic
│   │   └── utils/
│   ├── dev-docker-compose.yml   # infra only (dev)
│   ├── docker-compose.yml       # full stack (deploy)
│   ├── Dockerfile
│   └── Caddyfile
│
├── frontend/
│   ├── src/
│   │   ├── main.ts          # app entrypoint
│   │   ├── App.vue
│   │   ├── plugins/         # vuetify, auth0, i18n
│   │   ├── router/          # vue-router setup
│   │   ├── stores/          # pinia stores
│   │   ├── services/        # API client (axios)
│   │   ├── composables/
│   │   ├── components/
│   │   ├── views/
│   │   ├── locales/         # i18n translations
│   │   ├── types/
│   │   └── config/
│   └── vite.config.ts
│
├── power-scripts/
├── documentation/
└── setup-dev.sh
```

## Backend Pattern

```
Route → Middleware (auth, validate) → Controller → Service → Repository → Prisma
```

## Scripts

### Backend (`cd backend`)

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `bun run dev`      | Start dev server (watch mode)      |
| `bun run start`    | Start production server            |
| `bun run docker:up`| Start infra containers             |
| `bun run docker:down` | Stop infra containers           |
| `bun run db:migrate` | Run Prisma migrations            |
| `bun run db:push`  | Push schema without migration      |
| `bun run db:seed`  | Seed the database                  |
| `bun run db:studio`| Open Prisma Studio                 |

### Frontend (`cd frontend`)

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `bun run dev`      | Start Vite dev server              |
| `bun run build`    | Type-check and build for prod      |
| `bun run preview`  | Preview production build           |
| `bun run lint`     | Lint and auto-fix                  |
| `bun run format`   | Format with Prettier               |

## Docker Services (Local Dev)

| Service    | Container Name    | Port        |
| ---------- | ----------------- | ----------- |
| PostgreSQL | arbeitly-postgres | 5432        |
| MinIO      | arbeitly-minio    | 9000, 9001  |
| Valkey     | arbeitly-valkey   | 6379        |

## Environment Variables

Copy `.env.example` to `.env.development` and fill in the values.

**Backend:** `PORT`, `NODE_ENV`, `DATABASE_URL`, `FRONTEND_URL`, `VALKEY_URL`, `NATS_URL`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`

**Frontend:** `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`
