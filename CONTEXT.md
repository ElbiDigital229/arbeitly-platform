# Arbeitly Platform — Full Project Context

This document captures the complete history, architecture decisions, and legacy references for anyone (human or AI) picking up this project.

---

## 1. Project History

### Phase 1: CV Builder Prototype (`cv-builder`)
A standalone Laravel + Livewire app for parsing CVs with Claude AI. Single-page flow: upload PDF, AI extracts data, edit in browser, export PDF. No auth, no persistence — CVs exist only in session memory. This proved the AI parsing concept worked.

**Repo:** [ElbiDigital229/cv-builder](https://github.com/ElbiDigital229/cv-builder)
**Stack:** Laravel 13, Livewire 3, Alpine.js, Tailwind, Anthropic Claude, DomPDF
**Key file:** `app/Services/CvParserService.php` — original CV parsing prompt (7 fields: personal, summary, experience, education, skills)

### Phase 2: Full Legacy Platform (`arbeitly-be` + `new-arbeitly-fe`)
A production SaaS platform built by the original development team (ubaidrehman97, noor-jafri). Multi-role system with candidates, employees, admins, and superadmins. Stripe payments, Spatie roles/permissions, activity logging, FAQ system, onboarding documents, job listings.

**Backend repo:** [ElbiDigital229/arbeitly-be](https://github.com/ElbiDigital229/arbeitly-be) (fork of ubaidrehman97/arbeitly-be)
**Frontend repo:** [ElbiDigital229/new-arbeitly-fe](https://github.com/ElbiDigital229/new-arbeitly-fe) (fork of ubaidrehman97/new-arbeitly-fe)

**Backend stack:** Laravel 12, PHP 8.2, Sanctum auth, Spatie permissions, Stripe, Anthropic Claude Sonnet 4, DomPDF, Smalot PDF parser, SQLite/MySQL
**Frontend stack:** Next.js 15, React 19, React Router v7, Tailwind, Radix UI, TanStack Query, Tiptap rich text, Framer Motion, @dnd-kit, html2pdf

### Phase 3: Platform Rewrite (`arbeitly-platform` — this repo)
Complete rewrite from Laravel+React to Express+Vue3. Started with free candidate features only. Simplified the architecture while keeping the comprehensive AI CV parsing from the legacy backend.

**Repo:** [ElbiDigital229/arbeitly-platform](https://github.com/ElbiDigital229/arbeitly-platform)
**Stack:** Bun, Express 4, TypeScript, PostgreSQL 16, Prisma 6, Vue 3, Vite, Vuetify, Tailwind CSS, Pinia

---

## 2. Why the Rewrite

1. **Simpler stack** — Laravel + Next.js + React Router was overly complex (Next.js used as a shell for a React Router SPA)
2. **Single runtime** — Bun handles both backend and frontend tooling
3. **TypeScript everywhere** — Shared type safety across backend and frontend
4. **PostgreSQL** — Production-grade DB from day one (legacy used SQLite locally)
5. **Focus on free tier first** — Ship the candidate experience before adding paid features
6. **Docker-native** — Postgres, Valkey, MinIO all containerized from the start

---

## 3. What Was Ported from Legacy

### From `cv-builder` (Phase 1)
- AI CV parsing concept

### From `arbeitly-be` (Phase 2 Backend)
- **CV parsing prompt** — Upgraded from 7 fields to 30+ fields with "ZERO TOLERANCE FOR DATA LOSS" policy. Now extracts: personal info (name, email, phone, location, nationality, LinkedIn, GitHub, portfolio, website), summary, experience (with full bullet points), education (with GPA, courses, awards, thesis), certifications (with institution, dates, exam results), skills (flat array), languages (with proficiency), leadership roles, interests, additional information
- **PDF photo extraction** — New in rewrite (not in legacy). Uses pdfjs-dist + sharp to extract profile photos from uploaded PDFs
- **Application model** — Ported the 7 status columns (WISHLIST/TO_APPLY → APPLIED → PHONE_SCREEN → INTERVIEW → OFFER → REJECTED → WITHDRAWN)
- **Bulk application import** — CSV import of up to 100 applications
- **Usage limits/quotas** — cvCreationLimit, cvCreationsUsed on CandidateProfile
- **Controller → Service → Repository pattern** — Legacy used Laravel's service pattern; rewrite uses explicit repository layer

### From `new-arbeitly-fe` (Phase 2 Frontend)
- **CV Builder wizard** — Multi-step flow: landing → upload/create → extracting → template picker → language picker → editor with live preview
- **3 CV templates** — Modern (blue accents), Classic (serif), Minimal (spacious)
- **Application Kanban board** — Card-based status columns with drag support
- **Candidate sidebar layout** — Portal with collapsible sidebar, header with search, user avatar
- **Dark theme design system** — Deep navy (#043243) + cyan accent, CSS custom properties with raw HSL channels for Tailwind opacity

---

## 4. What Exists Only in Legacy (NOT yet in rewrite)

### Backend features not yet ported
| Feature | Legacy Location | Notes |
|---------|----------------|-------|
| **Employee portal** | `arbeitly-be/app/Http/Controllers/Api/Employee*` | Job listings, candidate assignment |
| **Admin/SuperAdmin portal** | `arbeitly-be/app/Http/Controllers/Api/Admin*` | User management, plan management, audit log |
| **Spatie roles & permissions** | `arbeitly-be/app/Models/User.php` (HasRoles trait) | RBAC with candidate/employee/admin/superadmin |
| **Activity logging** | `spatie/laravel-activitylog` | Audit trail for all actions |
| **FAQ system** | `arbeitly-be/app/Services/FaqService.php` | Advisor creates Q&A, candidate approves |
| **Onboarding documents** | `arbeitly-be/app/Http/Controllers/Api/CandidateOnboardingDocumentController.php` | Upload/download/delete docs |
| **Cover letter builder** | `new-arbeitly-fe/src/features/candidate/CandidateCoverLetterBuilder.tsx` | AI cover letter generation |
| **CV variants** | `arbeitly-be/app/Models/CandidateCvVariant.php` | Multiple versions of same CV |
| **CV versioning** | `arbeitly-be/app/Models/CandidateCvVersion.php` | Version history |
| **Job scraper** | `new-arbeitly-fe/src/features/superadmin/SuperAdminScraper.tsx` | Automated job discovery |
| **Analytics dashboard** | `new-arbeitly-fe/src/features/candidate/CandidateAnalytics.tsx` | Charts via Recharts |
| **Application source tracking** | Legacy application model had source field | Where job was found |

### Frontend features not yet ported
| Feature | Legacy Location | Notes |
|---------|----------------|-------|
| **Radix UI component library** | `new-arbeitly-fe/src/components/ui/` (50+ components) | We use Vuetify instead |
| **Tiptap rich text editor** | `new-arbeitly-fe/src/components/editor/CvRichField.tsx` | CV fields with rich text |
| **Signature pad** | `new-arbeitly-fe/src/components/editor/SignaturePad.tsx` | HTML5 canvas drawing (we do image upload instead) |
| **Command palette** | `new-arbeitly-fe/src/components/ui/command.tsx` | Keyboard-driven search |
| **Framer Motion animations** | Throughout legacy frontend | Page transitions, list animations |
| **React Query caching** | `new-arbeitly-fe/src/providers/` | Server state management (we use simple axios) |

---

## 5. Legacy Architecture Reference

### Legacy Backend (`arbeitly-be`) Structure
```
arbeitly-be/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── CandidateAuthController.php
│   │   │   ├── CandidateProfileController.php
│   │   │   ├── CandidateApplicationController.php
│   │   │   ├── CandidateCvController.php
│   │   │   ├── CandidateCvPdfController.php
│   │   │   ├── CandidateFaqController.php
│   │   │   ├── CandidateActivityController.php
│   │   │   ├── CandidateOnboardingDocumentController.php
│   │   │   ├── CandidateBillingCheckoutController.php
│   │   │   ├── AdminAuthController.php
│   │   │   ├── AdminCandidateCvController.php
│   │   │   ├── AdminCandidateFaqController.php
│   │   │   ├── AdminPlanController.php
│   │   │   ├── AdminRolePermissionController.php
│   │   │   ├── EmployeeAuthController.php
│   │   │   ├── EmployeeProfileController.php
│   │   │   ├── EmployeeJobListingController.php
│   │   │   ├── BillingCheckoutController.php
│   │   │   ├── StripeWebhookController.php
│   │   │   ├── CvParseController.php
│   │   │   └── PdfExtractController.php
│   │   ├── Requests/          # Form request validation
│   │   └── Resources/         # JSON response resources
│   ├── Models/
│   │   ├── User.php           # Has Spatie roles, soft deletes
│   │   ├── UserProfile.php
│   │   ├── UserSubscription.php
│   │   ├── UserUsageLimit.php
│   │   ├── CandidateCv.php
│   │   ├── CandidateCvVersion.php
│   │   ├── CandidateCvVariant.php
│   │   ├── CandidateApplication.php
│   │   ├── CandidateOnboardingDocument.php
│   │   ├── Plan.php
│   │   ├── PendingCheckout.php
│   │   ├── FaqItem.php
│   │   └── JobListing.php
│   └── Services/
│       ├── CvParserService.php           # Claude Sonnet 4 CV parsing + SSE streaming
│       ├── PdfTextExtractor.php          # Smalot PDF text extraction fallback
│       ├── StripeCheckoutService.php     # Stripe checkout session management
│       ├── CandidateAuthService.php
│       ├── CandidateApplicationService.php
│       ├── CandidateProfileService.php
│       ├── AdminAuthService.php
│       ├── EmployeeAuthService.php
│       ├── EmployeeOverviewService.php
│       ├── FaqService.php
│       └── RolePermissionService.php
├── database/migrations/       # 30 migration files
├── routes/api.php             # All API routes
└── config/services.php        # Stripe + Anthropic keys
```

### Legacy Frontend (`new-arbeitly-fe`) Structure
```
new-arbeitly-fe/
├── src/
│   ├── app/                   # Next.js entry (minimal — just renders React Router)
│   ├── shell/App.tsx          # React Router + all context providers
│   ├── features/
│   │   ├── candidate/         # CandidateLogin, CVBuilder, Applications, Profile, etc.
│   │   ├── employee/          # InternalOverview, Candidates, Jobs
│   │   ├── superadmin/        # Overview, Customers, Plans, AuditLog, AIConfig, Scraper
│   │   ├── admin/             # PromptManager, AISettings
│   │   └── public/            # Landing, Login, Register, Pricing, Payment
│   ├── components/
│   │   ├── ui/                # 50+ Radix UI primitives (button, dialog, form, etc.)
│   │   ├── candidate/         # CandidateLayout, CandidateSidebar
│   │   ├── editor/            # CvRichField (Tiptap), SignaturePad, PdfExportDialog
│   │   ├── portal/            # PortalLayout (employee)
│   │   ├── superadmin/        # SuperAdminLayout
│   │   └── landing/           # Navbar, Hero, Features, Pricing, Footer
│   ├── providers/             # React Context (Customers, Pricing, Notifications, etc.)
│   ├── api/                   # HTTP client functions per domain
│   ├── hooks/                 # use-mobile, use-toast
│   └── lib/                   # Utils, api-base-url, downloadBlob
├── tailwind.config.ts
└── package.json               # Next.js 15, React 19, Radix UI, TanStack Query, Tiptap
```

### Legacy DB Schema (key models)
```
Users
├── UserProfile (1:1) — onboarding_data, marketing_data, job_account_data (JSON)
├── UserSubscription (1:1) — stripe_customer_id, stripe_subscription_id, plan_id, status
├── UserUsageLimit (1:1) — application_limit, cv_creation_limit, cv_export_limit + used counts
├── CandidateCv (1:1)
│   ├── CandidateCvVersion (1:N) — versioned snapshots
│   └── CandidateCvVariant (1:N) — style variants per version
├── CandidateApplication (1:N) — company, job title, URL, status, notes, source
├── CandidateOnboardingDocument (1:N) — file uploads
├── FaqItem (1:N) — question, answer, status (pending/approved/overridden)
└── assigned via employee_id → JobListing (employee creates, assigns candidates)

Plans — name, slug, price, currency, amount_cents, features (JSON), limits, stripe_price_id
PendingCheckout — tracks Stripe checkout sessions during signup/upgrade
```

---

## 6. Current Rewrite DB Schema (Prisma)

```
User
├── CandidateProfile (1:1) — firstName, lastName, phone, location, bio, linkedinUrl, portfolioUrl, onboardingCompleted, cvCreationLimit, cvCreationsUsed
├── CV (1:N) — title, originalFileKey, parsedData (JSON), editorData (JSON), htmlContent, style, language
└── Application (1:N) — companyName, jobTitle, jobUrl, status, appliedAt, notes, salary, contactPerson, nextAction, jobDescription, cvUsed, references
```

---

## 7. Mapping: Legacy → Rewrite

| Legacy (Laravel) | Rewrite (Express) | Status |
|---|---|---|
| `CandidateAuthController` | `auth.controller.ts` | Done |
| `CandidateProfileController` | `profile.controller.ts` | Done |
| `CandidateApplicationController` | `application.controller.ts` | Done (+ bulk import) |
| `CandidateCvController` | `cv.controller.ts` | Done (+ photo extraction) |
| `CandidateCvPdfController` | `cv.controller.ts` (exportCVToPDF) | Done |
| `CvParserService` (7 fields) | `ai.service.ts` (30+ fields) | Done (upgraded) |
| `StripeCheckoutService` | — | Planned (Phase 4) |
| `StripeWebhookController` | — | Planned (Phase 4) |
| `AdminAuthController` | — | Not started |
| `AdminPlanController` | — | Not started |
| `EmployeeJobListingController` | — | Not started |
| `FaqService` | — | Not started (PRO feature) |
| `CandidateOnboardingDocumentController` | — | Not started |
| Sanctum token auth | JWT auth | Done (Auth0 planned) |
| Spatie roles/permissions | Simple role field | Done (basic) |
| Activity logging | — | Not started |

---

## 8. Key Differences: Legacy vs Rewrite

| Aspect | Legacy | Rewrite |
|--------|--------|---------|
| Runtime | PHP 8.2 | Bun (Node-compatible) |
| Framework | Laravel 12 | Express 4 |
| DB | SQLite (local) / MySQL (prod) | PostgreSQL 16 |
| ORM | Eloquent | Prisma 6 |
| Auth | Sanctum (token) | JWT (Auth0 planned) |
| Validation | FormRequest classes | Zod schemas |
| Frontend framework | React 19 + Next.js 15 | Vue 3 + Vite |
| State management | React Context + TanStack Query | Pinia |
| Component library | Radix UI (50+ primitives) | Vuetify 3 |
| Rich text | Tiptap | Plain textarea (Tiptap planned) |
| Styling | Tailwind + custom tokens | Tailwind + CSS vars + Vuetify |
| PDF export | html2pdf (client) + DomPDF (server) | PDFKit (server) |
| File storage | Local / AWS S3 | MinIO (S3-compatible) |
| Cache | Laravel cache (database) | Valkey/Redis (planned) |
| Messaging | None | NATS JetStream (planned) |
| Payments | Stripe (full integration) | Stripe (scaffolding planned) |
| Roles | Spatie (granular permissions) | Simple role enum |
| CV structure | CandidateCv → Versions → Variants | Single CV model with editorData JSON |

---

## 9. Environment Setup for New Device

See `readme.md` for full setup instructions. Quick summary:

```bash
git clone https://github.com/ElbiDigital229/arbeitly-platform.git
cd arbeitly-platform
./setup-dev.sh

# Terminal 1: Backend
cd backend && ANTHROPIC_API_KEY=your-key bun --watch src/server.ts

# Terminal 2: Frontend
cd frontend && bun run dev
```

### To also run legacy code
```bash
# Legacy Laravel backend
git clone https://github.com/ElbiDigital229/arbeitly-be.git
cd arbeitly-be
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8001

# Legacy React frontend
git clone https://github.com/ElbiDigital229/new-arbeitly-fe.git
cd new-arbeitly-fe
npm install
# Set NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001 in .env.local
npm run dev
```
