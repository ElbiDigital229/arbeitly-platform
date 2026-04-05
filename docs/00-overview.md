# Arbeitly Platform Overview

Arbeitly is a B2B2C job application management platform. Candidates sign up, employees manage their job search on their behalf, and admins oversee operations.

## Stack

- **Backend:** Bun + Express + TypeScript + Prisma + PostgreSQL 16
- **Frontend:** Vue 3 + Vite + Tailwind CSS + Pinia
- **AI:** Anthropic Claude (claude-haiku-4-5-20251001)
- **Storage:** MinIO (S3-compatible) for files
- **Auth:** JWT (separate tokens for candidate, employee, admin)

## Roles

| Role | Portal | Description |
|------|--------|-------------|
| CANDIDATE | `/candidate/*` | End users who need jobs |
| EMPLOYEE | `/employee/*` | Staff who manage candidates and apply on their behalf |
| ADMIN | `/superadmin/*` | Platform administrators with full control |

## Core Flow

```
Candidate registers (FREE)
  → Optionally purchases a plan (PAID, one-time payment)
  → Completes onboarding (personal info + base CV + base cover letter)
  → Admin assigns PAID+onboarded candidate to an employee
  → Employee enhances CV/CL with AI
  → Employee discovers jobs, scores relevance, adds to queue
  → System auto-generates tailored CV per job
  → Employee applies on behalf, tracks status
  → Admin monitors employee performance
```

## Documentation Index

| File | Topic |
|------|-------|
| [01-free-candidate.md](01-free-candidate.md) | Free candidate registration, limits, features |
| [02-paid-candidate.md](02-paid-candidate.md) | Plans, purchase flow, paid features |
| [03-employee.md](03-employee.md) | Employee workflow, candidate management |
| [04-admin.md](04-admin.md) | Admin capabilities, CRUD operations |
| [05-reporting.md](05-reporting.md) | Performance tracking, dashboards, metrics |
| [06-job-discovery.md](06-job-discovery.md) | Shared job pool, queue system |
| [07-ai-matching.md](07-ai-matching.md) | Job relevance scoring |
| [08-cv-generation.md](08-cv-generation.md) | CV/CL enhancement, tailored CV generation |
| [09-cv-parsing.md](09-cv-parsing.md) | CV upload, PDF extraction, parsed data structure |
| [10-misc.md](10-misc.md) | Auth, middleware, file storage, error handling |
