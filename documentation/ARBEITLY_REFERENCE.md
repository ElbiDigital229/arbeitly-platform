# Arbeitly – Technical Reference Structure

> AI Job Application Automation Platform – V1
> Stack: Next.js (API) + Vue.js (SPA) + PostgreSQL + Redis
> This document is the single source of truth for building this app.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTS                          │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Customer SPA │  │ Internal SPA │                │
│  │   (Vue.js)   │  │   (Vue.js)   │                │
│  └──────┬───────┘  └──────┬───────┘                │
└─────────┼──────────────────┼────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────┐
│              NEXT.JS API LAYER                      │
│  /api/auth/*    /api/cv/*      /api/jobs/*          │
│  /api/cover/*   /api/admin/*   /api/billing/*       │
│  /api/analytics/*  /api/users/*                     │
└──────────┬──────────────────────────────────────────┘
           │
     ┌─────┼──────────────┐
     ▼     ▼              ▼
┌────────┐ ┌────────┐ ┌──────────┐
│Postgres│ │ Redis  │ │ Object   │
│  (DB)  │ │(Queue) │ │ Storage  │
└────────┘ └────────┘ └──────────┘
                          │
        ┌─────────────────┼────────────┐
        ▼                 ▼            ▼
   ┌─────────┐    ┌──────────┐  ┌──────────┐
   │ OpenAI  │    │  Stripe  │  │  OAuth   │
   │   API   │    │   API    │  │ Provider │
   └─────────┘    └──────────┘  └──────────┘
```

---

## 2. User Roles & Permissions (RBAC)

### 2.1 Super Admin
- Full system access
- Configure AI prompts (CV generation, cover letter generation)
- Control tone, formatting logic, keyword extraction params
- Manage all users (internal + customers)
- View all analytics
- Manage subscription plans in Stripe

### 2.2 Internal Employee
- Upload and manage candidate CVs and cover letters
- View matched jobs from mock data (later: scraping tool)
- Track candidate application status
- Manage applications and candidate activity
- Cannot modify AI prompts or system config

### 2.3 Customer (External / SaaS User)
- Register/login via Google OAuth or email/password
- Upload CV (PDF/DOCX)
- Download generated documents (optimized CV, cover letters)
- View document history (versioned per application)
- Read-only view of application records
- View personal analytics
- Manage subscription (upgrade/downgrade/cancel)

---

## 3. Feature Modules

### 3.1 Authentication & Account Management

**Endpoints:** `/api/auth/*`

| Feature | Details |
|---|---|
| Auth0 Integration | Handles all identity: email/password, social logins, MFA |
| User Provisioning | On first Auth0 login, create local User record linked via auth0_id |
| Role Assignment | Default CUSTOMER, upgradeable by Super Admin |
| Session Management | Auth0 JWT validated via API middleware (no local sessions) |
| Email Notifications | Auth0 handles auth emails; app sends subscription/activity emails |

**Auth0 handles externally (NOT in our DB):**
- Password storage and hashing
- Password reset flows
- Session/refresh token management
- Social login providers (Google, etc.)
- MFA if enabled

**Database Tables:**
- `users` — id, auth0_id, email, name, role, is_active, avatar_url, created_at, updated_at

---

### 3.2 CV Optimization Engine

**Endpoints:** `/api/cv/*`

| Feature | Details |
|---|---|
| CV Upload | Accept PDF and DOCX, parse text content |
| Text Extraction | Extract structured data from uploaded CV |
| ATS Optimization | AI rewrites CV for ATS compatibility |
| Keyword Extraction | Pull relevant keywords from job context |
| Template Formatting | 2–3 predefined CV templates |
| Multi-language | German ↔ English (translation via AI) |
| Download | Output as PDF or DOCX |

**AI Integration:**
- Prompt is configurable by Super Admin (stored in DB, not hardcoded)
- Input: raw CV text + optional job description
- Output: structured, ATS-optimized CV content

**Database Tables:**
- `cv_uploads` — id, user_id, original_filename, file_path, file_type, raw_text, language, created_at
- `cv_optimized` — id, cv_upload_id, user_id, job_id (nullable), optimized_content, template_used, language, version, file_path, created_at
- `cv_templates` — id, name, description, template_markup, is_active

---

### 3.3 Cover Letter Engine

**Endpoints:** `/api/cover/*`

| Feature | Details |
|---|---|
| Generation | AI-generated based on CV data + job description |
| Job-Specific Tailoring | Uses job listing details to customize |
| Multi-language | German and English |
| Editable Output | User can edit before download |
| Download | PDF / DOCX |

**AI Integration:**
- Prompt configurable by Super Admin
- Input: CV data + job description + language preference
- Output: formatted cover letter text

**Database Tables:**
- `cover_letters` — id, user_id, cv_id, job_id (nullable), content, language, version, file_path, created_at, updated_at

---

### 3.4 Job Discovery & Matching

**Endpoints:** `/api/jobs/*`

**Current Implementation (V1):** Mock data from a large JSON file simulating job listings.

**Future:** Integration with third-party scraping tool (LinkedIn, Indeed, Google Jobs).

| Feature | Details |
|---|---|
| Job Listing | Display jobs from mock JSON dataset |
| Filtering | By qualification, experience, location |
| Manual URL Input | User pastes a job URL, system extracts details |
| AI Matching | Score/rank jobs against candidate CV |
| Tailored Generation | Generate CV + cover letter for a selected job |

**Database Tables:**
- `jobs` — id, title, company, location, description, qualifications, experience_level, source, source_url, created_at
- `job_matches` — id, user_id, job_id, match_score, matched_at

---

### 3.5 Application Tracking

**Endpoints:** `/api/applications/*`

Applications are created by **Internal Employees** on behalf of candidates. Customers see read-only records.

| Field | Details |
|---|---|
| Job Title | From job record |
| Company Name | From job record |
| Date Applied | Timestamp |
| Status | `applied` · `interview` · `rejected` · `offer` |
| CV Version | Link to specific cv_optimized record |
| Cover Letter Version | Link to specific cover_letters record |

**Database Tables:**
- `applications` — id, user_id, job_id, cv_optimized_id, cover_letter_id, status, applied_at, updated_at, notes

---

### 3.6 Super Admin – Prompt Management

**Endpoints:** `/api/admin/prompts/*`

| Feature | Details |
|---|---|
| CV Prompt Config | Edit system prompt for CV optimization |
| Cover Letter Prompt Config | Edit system prompt for cover letter generation |
| Tone Control | Adjust tone parameters (formal, friendly, etc.) |
| Formatting Logic | Control output structure rules |
| Keyword Params | Configure extraction sensitivity/rules |
| No Deploy Required | All changes via admin UI, stored in DB |

**Database Tables:**
- `ai_prompts` — id, type (cv/cover_letter), prompt_text, tone, formatting_rules, keyword_params, version, is_active, updated_by, updated_at
- `ai_prompt_history` — id, ai_prompt_id, prompt_text, changed_by, changed_at (audit trail)

---

### 3.7 Subscription & Payments (Stripe)

**Endpoints:** `/api/billing/*`

| Feature | Details |
|---|---|
| Plans | Multiple tiers (configured in Stripe) |
| Checkout | Stripe Checkout Session |
| Upgrade/Downgrade | Plan switching via Stripe API |
| Trial Period | Configurable trial days |
| Webhooks | Listen for subscription lifecycle events |
| Access Control | Auto-grant/revoke based on payment status |

**Stripe Webhook Events to Handle:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Database Tables:**
- `subscriptions` — id, user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, trial_end, current_period_start, current_period_end, created_at, updated_at
- `plans` — id, name, stripe_price_id, features_json, is_active

---

### 3.8 Analytics & Reporting

**Endpoints:** `/api/analytics/*`

**Customer View:**
- Total applications submitted
- Status breakdown (applied / interview / rejected / offer)
- Document generation count

**Internal View:**
- All customer analytics aggregated
- Per-candidate activity
- AI usage metrics (tokens, generations)
- Subscription metrics

---

## 4. Database Schema Summary

```
users
  ├── sessions
  ├── password_resets
  ├── subscriptions
  ├── cv_uploads
  │     └── cv_optimized
  ├── cover_letters
  ├── job_matches
  └── applications
        ├── → cv_optimized
        ├── → cover_letters
        └── → jobs

ai_prompts
  └── ai_prompt_history

cv_templates
plans
jobs
```

---

## 5. API Route Map

```
/api
├── /auth
│   ├── POST   /callback         (Auth0 post-login hook — provisions local user)
│   └── GET    /me                (validate Auth0 JWT, return local user profile)
│
├── /users
│   ├── GET    /me
│   ├── PATCH  /me
│   └── GET    /:id              (internal/admin only)
│
├── /cv
│   ├── POST   /upload
│   ├── GET    /                  (list user's CVs)
│   ├── GET    /:id
│   ├── POST   /optimize
│   ├── GET    /optimized         (list optimized versions)
│   ├── GET    /optimized/:id
│   └── GET    /optimized/:id/download
│
├── /cover
│   ├── POST   /generate
│   ├── GET    /                  (list user's cover letters)
│   ├── GET    /:id
│   ├── PATCH  /:id               (edit before download)
│   └── GET    /:id/download
│
├── /jobs
│   ├── GET    /                  (list/filter jobs)
│   ├── GET    /:id
│   ├── POST   /manual            (paste URL, extract details)
│   └── GET    /matches           (AI-matched jobs for user)
│
├── /applications
│   ├── POST   /                  (internal only: create)
│   ├── GET    /                  (list — scoped by role)
│   ├── GET    /:id
│   └── PATCH  /:id/status        (internal only: update status)
│
├── /billing
│   ├── POST   /checkout
│   ├── POST   /portal            (Stripe customer portal)
│   ├── GET    /subscription
│   └── POST   /webhook           (Stripe webhooks)
│
├── /admin
│   ├── /prompts
│   │   ├── GET    /
│   │   ├── GET    /:id
│   │   ├── PATCH  /:id
│   │   └── GET    /:id/history
│   ├── /users
│   │   ├── GET    /
│   │   └── PATCH  /:id/role
│   └── /analytics
│       └── GET    /dashboard
│
└── /analytics
    └── GET    /me                (customer's own stats)
```

---

## 6. File Storage

| Item | Storage Location |
|---|---|
| Original CV uploads | Object storage (S3/GCS), user-isolated paths |
| Optimized CVs (PDF/DOCX) | Object storage, signed URL access |
| Cover letters (PDF/DOCX) | Object storage, signed URL access |
| Access pattern | `/{user_id}/cv/{file_id}.pdf` |

- All files isolated per user (multi-tenant)
- Signed URLs for download (time-limited)
- Encryption at rest

---

## 7. AI Integration Layer

```
┌─────────────────────────────────────┐
│         AI Service Module           │
│                                     │
│  ┌───────────┐   ┌──────────────┐  │
│  │  Prompt    │   │   OpenAI     │  │
│  │  Loader    │──▶│   Client     │  │
│  │  (from DB) │   │              │  │
│  └───────────┘   └──────────────┘  │
│                                     │
│  Functions:                         │
│  - optimizeCV(rawText, jobDesc?)    │
│  - generateCoverLetter(cv, job)     │
│  - matchJobs(cv, jobList)           │
│  - extractKeywords(text)            │
│  - translateContent(text, lang)     │
└─────────────────────────────────────┘
```

- Prompts loaded from `ai_prompts` table (not hardcoded)
- Only necessary fields sent to OpenAI (data minimization)
- Token usage tracked per request

---

## 8. Queue System (Redis)

Used for background tasks:

| Task | Details |
|---|---|
| CV optimization | Heavy AI calls run async |
| Cover letter generation | Queued per request |
| Batch job matching | Score jobs against CV in background |
| Email sending | Transactional emails via queue |

---

## 9. Security & Compliance

| Area | Implementation |
|---|---|
| Auth | Auth0 JWT validation on API, tokens managed by Auth0 SDK on frontend |
| Passwords | Managed by Auth0 (not stored locally) |
| API Protection | Rate limiting, CORS, helmet headers |
| Data Encryption | TLS 1.2+ in transit, AES at rest |
| RBAC | Middleware-enforced role checks on every route |
| Audit Logging | Admin actions logged with user_id + timestamp |
| Data Retention | Configurable per-user, deletion support |
| GDPR | EU-hosted only, data minimization, user data export/delete |

---

## 10. Frontend Structure (Vue.js SPA)

```
src/
├── views/
│   ├── auth/
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   └── ForgotPassword.vue
│   │
│   ├── customer/
│   │   ├── Dashboard.vue
│   │   ├── CVUpload.vue
│   │   ├── CVOptimized.vue
│   │   ├── CoverLetters.vue
│   │   ├── Jobs.vue
│   │   ├── Applications.vue
│   │   ├── Analytics.vue
│   │   └── Subscription.vue
│   │
│   ├── internal/
│   │   ├── Dashboard.vue
│   │   ├── Candidates.vue
│   │   ├── CandidateDetail.vue
│   │   ├── Applications.vue
│   │   └── JobMatches.vue
│   │
│   └── admin/
│       ├── PromptManager.vue
│       ├── UserManager.vue
│       └── Analytics.vue
│
├── components/         (shared UI components)
├── composables/        (shared logic / hooks)
├── stores/             (Pinia state management)
├── router/             (Vue Router config)
├── services/           (API client layer)
└── utils/              (helpers, formatters)
```

---

## 11. Project Directory Structure

```
arbeitly/
├── frontend/                    (Vue.js SPA)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     (Next.js API)
│   ├── pages/
│   │   └── api/                 (all API routes)
│   ├── lib/
│   │   ├── db/                  (Prisma/Drizzle models + queries)
│   │   ├── ai/                  (OpenAI integration)
│   │   ├── auth/                (Auth0 JWT validation, user provisioning)
│   │   ├── billing/             (Stripe integration)
│   │   ├── queue/               (Redis job queue)
│   │   ├── storage/             (file upload/download)
│   │   └── middleware/          (auth, RBAC, rate limiting)
│   ├── prisma/                  (or drizzle schema)
│   │   └── schema.prisma
│   ├── package.json
│   └── next.config.js
│
├── mock-data/
│   └── jobs.json                (giant mock job dataset)
│
├── docker-compose.yml           (Postgres + Redis local dev)
├── .env.example
└── README.md
```

---

## 12. Key Integration Points

| Integration | Purpose | Auth Method |
|---|---|---|
| OpenAI API | CV optimization, cover letters, matching, translation | API key |
| Stripe API | Subscriptions, checkout, webhooks | Secret key + webhook signing |
| Auth0 | Authentication, user management, social logins | OAuth 2.0 / JWT verification |
| SMTP / Email Service | Transactional emails (reset, notifications) | API key or SMTP credentials |
| Object Storage (S3/GCS) | File storage for CVs and documents | IAM / service account |
| Redis | Background job queue | Connection string |

---

## 13. Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/arbeitly

# Redis
REDIS_URL=redis://localhost:6379

# Auth0
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE=
AUTH0_CALLBACK_URL=

# AI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

# Storage
S3_BUCKET=
S3_REGION=eu-central-1
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=

# App
APP_URL=
API_URL=
NODE_ENV=
```

---

*This document serves as the technical blueprint. Each section maps to a buildable module. Work through them sequentially or in parallel based on dependencies.*
