# Project Scaffolding

## Structure

```
project-root/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── dtos/
│   │   ├── errors/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── scripts/
│   ├── .env.example
│   ├── .env.development
│   ├── .env.staging
│   ├── .env.production
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── Caddyfile
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── assets/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── config/
│   │   ├── locales/
│   │   ├── plugins/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── views/
│   ├── .env.development
│   ├── .env.staging
│   ├── .env.production
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.cjs
│   ├── .prettierrc.json
│   └── package.json
│
├── power-scripts/
├── setup-dev.sh
└── .gitignore
```

---

## Setup Steps

```
--- Init ---
1.  mkdir project-root && cd project-root && git init
2.  mkdir backend frontend power-scripts

--- Backend (Bun + Express + TypeScript + Prisma) ---
3.  cd backend && bun init
4.  bun add express cors helmet cookie-parser express-rate-limit express-async-errors dotenv zod axios
5.  bun add -d typescript @types/node @types/express @types/cors @types/cookie-parser prisma dotenv-cli
6.  bun add @prisma/client && bunx prisma init
7.  bun add auth0 jsonwebtoken jwks-rsa && bun add -d @types/jsonwebtoken
8.  bun add stripe
9.  bun add ioredis
10. bun add nats
11. bun add minio @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
12. bun add openai
13. Create tsconfig.json + src/ folder structure
14. Create docker-compose.yml (postgres, minio, valkey)
15. Create Dockerfile
16. Create Caddyfile
17. Create .env.example
18. Setup prisma/schema.prisma + first migration
19. Create seed file

--- Frontend (Vue 3 + Vite + Vuetify + Tailwind) ---
20. cd ../frontend && bun create vue@latest . (TypeScript, Vue Router, Pinia)
21. bun add vuetify @mdi/font lucide-vue-next
22. bun add @auth0/auth0-vue
23. bun add vue-i18n
24. bun add -d tailwindcss @tailwindcss/postcss autoprefixer postcss
25. bun add -d vite-plugin-vue-devtools vite-plugin-vuetify
26. Configure vite.config.ts (plugins, proxy, alias)
27. Configure tailwind.config.js, postcss.config.js
28. Setup plugins/ (auth0, vuetify, i18n, theme)
29. Setup router/ with guards
30. Setup stores/ with Pinia
31. Setup services/ for API calls
32. Create .env.development

--- Infra ---
33. Create setup-dev.sh (docker compose up, prisma migrate, seed)
34. Create .gitignore
```

---

## Stack Summary

| Layer | Tech |
|---|---|
| Runtime | Bun |
| Backend | Express, TypeScript |
| Database | PostgreSQL 16, Prisma ORM |
| Frontend | Vue 3, Vite, Vuetify, Tailwind CSS |
| State | Pinia |
| Auth | Auth0 |
| Payments | Stripe |
| Cache | Valkey (Redis-compatible), ioredis |
| Messaging | NATS JetStream |
| Storage | MinIO / S3 |
| Reverse Proxy | Caddy |
| Containers | Docker, docker-compose |
| Validation | Zod |
| Icons | Lucide Vue Next, MDI |
| Dev Tools | Vue DevTools (vite plugin) |

---

## Backend Pattern

```
Route → Middleware (auth, validate) → Controller → Service → Repository → Prisma
```

---

## Docker Services (Local Dev)

| Service | Image | Port |
|---|---|---|
| PostgreSQL | `postgres:16-alpine` | 5432 |
| MinIO | `minio/minio` | 9000, 9001 |
| Valkey | `valkey/valkey` | 6379 |

---

## Env Vars (Key ones)

**Backend:** `PORT`, `NODE_ENV`, `DATABASE_URL`, `FRONTEND_URL`, `VALKEY_URL`, `NATS_URL`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`

**Frontend:** `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`
