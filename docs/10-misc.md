# Miscellaneous

## Authentication Architecture

Three separate auth flows with isolated token storage:

| Role | Login Route | API Prefix | Token Key | Store |
|------|------------|------------|-----------|-------|
| CANDIDATE | `/login` | `/api/auth/*` | `arbeitly_token` | `stores/auth.ts` |
| EMPLOYEE | `/employee/login` | `/api/employee/*` | `arbeitly_employee_token` | `stores/employee.ts` |
| ADMIN | `/superadmin/login` | `/api/admin/*` | `arbeitly_admin_token` | `stores/admin.ts` |

### Token Handling

- All tokens are JWTs signed server-side
- Candidate token auto-attached by axios interceptor (checks `localStorage.arbeitly_token`)
- Employee/Admin tokens passed manually via `getAuthHeaders()` in store
- Interceptor skips auto-attach if `Authorization` header already present

### Password Requirements

- Minimum 10 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

## API Structure

### Base URL

Frontend axios instance: `baseURL: "/api"` → Vite proxy forwards to backend at `localhost:4000`

### Response Format

All endpoints return:
```json
{ "success": true, "data": { ... } }
```

Errors:
```json
{ "success": false, "error": "Error message" }
```

### Backend Route Mounting

```
/api/auth        → auth.routes.ts
/api/admin       → admin.routes.ts
/api/employee    → employee.routes.ts
/api/onboarding  → onboarding.routes.ts
/api/cvs         → cv.routes.ts
/api/applications → application.routes.ts
/api/plans       → plan.routes.ts
/api/payments    → payment.routes.ts
/api/jobs        → job-discovery.routes.ts
```

## Middleware

### authenticate

- Extracts JWT from `Authorization: Bearer <token>`
- Verifies token, attaches `req.user` with `{ id, email, role }`
- Returns 401 if missing or invalid

### requireEmployee / requireAdmin / requireEmployeeOrAdmin

- Role guards that check `req.user.role`
- Return 403 if role doesn't match

### validate(schema)

- Zod schema validation middleware
- Validates `req.body` against provided Zod schema
- Returns 400 with validation errors

### authRateLimiter

- Applied to signin/login endpoints
- Prevents brute-force attacks

## File Storage (MinIO)

- S3-compatible object storage
- CVs stored at: `cvs/{userId}/{timestamp}-{filename}`
- Configured via environment variables: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`
- Files served via signed URLs

## Database

- **PostgreSQL 16** via Prisma ORM
- Connection: `DATABASE_URL` in `.env`
- Schema management: `prisma db push` (no migrations in dev)
- Seed: `prisma/seed.ts` — creates admin + employee users

### Key Models

| Model | Purpose |
|-------|---------|
| User | All users (CANDIDATE, EMPLOYEE, ADMIN) |
| CandidateProfile | Extended candidate data, plan link |
| Plan | Pricing plans |
| CV | CV records with parsed data |
| CoverLetter | Cover letter records |
| Application | Job applications |
| AdminPrompt | AI prompt configurations |
| JobDiscovery | Shared job pool |
| CandidateJobQueue | Job queue linking candidates to jobs |

## Error Handling

### HttpError Class

Custom error class with HTTP status codes:
- `HttpError.badRequest(msg)` → 400
- `HttpError.unauthorized(msg)` → 401
- `HttpError.forbidden(msg)` → 403
- `HttpError.notFound(msg)` → 404
- `HttpError.conflict(msg)` → 409

### Global Error Handler

Express error middleware catches all errors:
- HttpError → returns appropriate status code
- Zod validation error → 400 with field-level messages
- Unknown error → 500 with generic message

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_SECRET` | Token signing |
| `ANTHROPIC_API_KEY` | Claude AI access |
| `MINIO_ENDPOINT` | File storage endpoint |
| `MINIO_ACCESS_KEY` | MinIO credentials |
| `MINIO_SECRET_KEY` | MinIO credentials |
| `MINIO_BUCKET` | Storage bucket name |
| `PORT` | Backend server port (default 4000) |

## Frontend Architecture

- **Vue 3** with Composition API (`<script setup>`)
- **Pinia** for state management (3 stores: auth, admin, employee)
- **Vue Router** with route guards per role
- **Tailwind CSS** with custom design tokens (CSS variables)
- **MDI icons** via `@mdi/font`
- **Axios** for API calls with interceptors

### CSS Conventions

- Dark theme by default
- Custom properties: `--foreground`, `--background`, `--primary`, `--secondary`, `--border`, etc.
- Utility classes: `.input-field`, `.modal-overlay`
- Font: `font-display` for headings

## Seed Data

`prisma/seed.ts` creates:
- Admin: `admin@arbeitly.de` / `admin2024`
- Employee: `employee@arbeitly.de` / `employee2024`
- No plans seeded — must be created via admin UI
