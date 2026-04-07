# Arbeitly Improvement Plan

> **Prompt for Claude Code:**
>
> I audited the Arbeitly platform (Express + Bun backend, Vue 3 + Vite + Pinia frontend) end-to-end — directory layout, routing, controllers, services, repositories, Prisma usage, error handling, validation, auth, external integrations, stores, components, views, composables, build config, dependencies, and dead code. The findings below are the result of that audit.
>
> I want you to implement everything in this document. Treat each tier as a milestone and each numbered item as a deliverable. Ship them in the order listed under **Suggested execution order** at the bottom — one PR per step, each independently mergeable, with a short PR description summarizing what changed and why. Don't bundle steps. Don't skip steps without flagging it. Before starting any step, re-read the relevant section here so you have full context. After each step, verify nothing regressed (lint, typecheck, dev server boots, key flows still work in preview) before moving to the next.
>
> If you discover something during implementation that contradicts this plan or reveals a better approach, stop and tell me before deviating.

---

Based on a deep pass over both codebases, here's how to tighten the infra. Organized by impact, not effort.

---

## 🔴 Tier 1 — Highest leverage (do first)

### Backend
1. **Collapse the two error systems.** `errors/AppError.ts`, `errors/HttpError.ts` and `errors/index.ts` all coexist with different param orders. Pick one (`HttpError.x()` factory is cleanest) and delete the rest. Single response shape `{ success, error, code, requestId? }`.
2. **Kill controller try/catch boilerplate.** Every controller wraps `async (req,res,next) => { try { … } catch(e){ next(e) } }`. Replace with one `asyncHandler(fn)` wrapper. Removes ~30% of controller LOC.
3. **Consolidate the two `validate` middlewares** (`validate.ts` vs `validate.middleware.ts`) into one that supports `body | params | query` per route.
4. **Move AI model + prompt config out of code.** `claude-haiku-4-5-20251001` is hardcoded in 4 services. New `env.AI_MODEL` + a tiny `aiClient` wrapper that handles: client creation, retries, timeouts, JSON-fence stripping (currently duplicated in `ai.service.ts:233-247` and `cv-enhance.service.ts`).
5. **Rate-limit expensive endpoints**, not just auth. CV upload, CV enhance, AI parse, PDF export. Currently any logged-in user can DoS your Anthropic bill.

### Frontend
1. **Delete dead duplicate views.** Root-level `ApplicationsView.vue`, `CVsView.vue`, `DashboardView.vue`, `ProfileView.vue` are superseded by `views/candidate/*` and `views/employee/*`. Same for `AppNavbar.vue`/`AppLayout.vue` (Vuetify, unimported).
2. **Drop Vuetify entirely.** It's a ~100KB dep with zero usage in modern views — MDI icons are loaded as a font and used via `class="mdi mdi-…"`. Removing Vuetify simplifies `vite.config.ts`, `main.ts`, and the bundle.
3. **Build the missing primitive component layer** in `src/components/ui/` (the directory already exists from the Login work). Top 6 by ROI:
   - `BaseModal.vue` — 13 inline modal implementations across views
   - `LoadingState.vue` — 12+ copies of "spinning mdi-loading + Loading..."
   - `EmptyState.vue` — icon + title + description + action slot
   - `Card.vue` — `rounded-xl border border-border bg-card p-6` repeats 70+ times
   - `Button.vue` — variants: primary/secondary/ghost/destructive (already have shadcn-style starters in `components/ui/`)
   - `Badge.vue` — language/status/plan tags

   Estimated ~700 LOC removed from views.
4. **Extract `SidebarLayout.vue`.** `CandidateLayout`, `EmployeeLayout`, `SuperAdminLayout` are ~90% identical. One layout + a `navItems` prop.

---

## 🟡 Tier 2 — Architecture cleanup

### Backend
5. **Enforce the repository pattern.** 92 direct `prisma.*` calls leak into services (`cv.service.ts`, `payment.service.ts`, `admin.service.ts`, `job-discovery.service.ts`). Add the missing repos (`Job`, `Transaction`, `AdminPrompt`, `CandidateJobQueue`) and forbid `prisma` imports outside `repositories/` via lint rule.
6. **Centralize role guards.** `admin.routes.ts:15` and `employee.routes.ts:15` re-implement the role check inline. Use the existing `requireRole(...roles)` from `roles.middleware.ts` via `router.use(requireRole('ADMIN'))`.
7. **Wrap external services** (`stripe`, `anthropic`, `minio`) into `services/external/` clients with: configured singleton, retry policy, timeout, structured error mapping. Services depend on the wrapper, not the SDK directly.
8. **Batch quota checks.** `application.service.ts:32-44` does N DB hits inside a loop for batch ops. Check once, increment by N, single round-trip.
9. **Activity logging via NATS.** You already have NATS infra. Replace `prisma.activityLog.create(...).catch(noop)` (silently fails) with a fire-and-forget event onto a queue + a consumer that writes. Survives DB hiccups.

### Frontend
10. **Unify the API layer.** Three stores (`auth`, `admin`, `employee`) each instantiate axios with their own token key. Refactor to:
    ```
    services/
      api/
        client.ts      ← single axios w/ pluggable token resolver
        auth.api.ts
        cv.api.ts
        payment.api.ts
        admin.api.ts
      ...
    ```
    The token resolver picks `arbeitly_token` / `arbeitly_admin_token` / `arbeitly_employee_token` based on the active portal.
11. **Merge `admin` + `employee` stores via factory.** They are 95% identical (`createPortalAuthStore({ tokenKey, loginPath })`).
12. **Populate `src/types/`** with shared interfaces (`User`, `Profile`, `Plan`, `Application`, `CV`, API envelope `ApiResponse<T>`). Currently `Plan` is duplicated in `auth.ts` and `subscription.ts`, drift waiting to happen.
13. **Composables for repeated patterns:**
    - `useAsync<T>()` — wraps `loading/error/data` (used in 10+ views inline)
    - `usePagination()` — admin tables reimplement offset/limit
    - `useFormState()` — modal forms in `CandidateDetailView`, `ApplicationsView`
    - `useConfirm()` — replaces every "delete confirmation" inline modal

---

## 🟢 Tier 3 — File-level surgery

14. **Split `CVBuilderView.vue` (1359 lines).** This is the worst offender. Split into:
    - `CVBuilderView.vue` (orchestrator, ~200 lines)
    - `cv-builder/UploadStep.vue`
    - `cv-builder/TemplatePicker.vue`
    - `cv-builder/EditorPanel.vue` (the form)
    - `cv-builder/PreviewPanel.vue` (live HTML render)
    - `cv-builder/composables/useCvEditor.ts` — `editorData` reactive state + `editorToHtml()` (currently a 200-line function inside the SFC)
    - `cv-builder/composables/useCvDragReorder.ts` — section + contact drag handlers
15. **Split `CandidateDetailView.vue` (716 lines)** — one component per tab.
16. **Split `ApplicationsView.vue` (676 lines)** — `ApplicationList.vue` + `ApplicationBoard.vue` + `ApplicationFormModal.vue`.

---

## 🛠️ Tier 4 — Tooling & DX

### Both
17. **ESLint + Prettier + lint-staged + husky** — currently zero enforcement. Add a rule banning `prisma` import outside `repositories/`, and one banning direct `axios` outside `services/api/`.
18. **Standardize on bun.** Backend `db:seed` script uses `npx tsx`, the rest use `bun`. Replace with `bun prisma/seed.ts`.
19. **Vite path aliases** (`@/components`, `@/stores`, `@/api`) — kills `../../../` import noise.
20. **Vitest** for both sides. Backend has zero tests; this is the highest-risk gap. Start with: auth service, quota logic, payment flow. Frontend: stores + composables.
21. **Shared types package** (`packages/shared-types/` if you go monorepo, or just code-gen from Zod). Right now backend Zod DTOs and frontend TS interfaces drift independently.

---

## 🏗️ Tier 5 — Strategic (worth considering)

22. **Monorepo via bun workspaces.** `apps/backend`, `apps/frontend`, `packages/shared-types`, `packages/eslint-config`. One `bun install`, shared lint, shared types end-to-end.
23. **Replace Puppeteer for PDF.** It's 100MB+ in `node_modules` and slow to boot. You already have `pdfkit`. If the CV is HTML-templated, `@react-pdf/renderer` or server-side React-to-PDF is lighter. Otherwise, keep one Puppeteer instance pooled instead of launching per request.
24. **Add request ID + structured logging** (`pino`) — currently `console.log` everywhere. Critical once you're debugging in prod.
25. **OpenAPI/typed client.** Zod DTOs → OpenAPI → typed frontend client (e.g. `openapi-typescript` or `zodios`). Eliminates the API/types divergence problem entirely.

---

## Suggested execution order

Each step is independently shippable:

1. **Cleanup PR**: delete dead views, drop Vuetify, add aliases, fix `db:seed` script (~1 hr, zero risk)
2. **Error system + asyncHandler PR**: backend boilerplate kill (~2 hrs)
3. **UI primitives PR**: `BaseModal`, `LoadingState`, `EmptyState`, `Card`, `Button`, `Badge` + migrate 5 highest-traffic views (~half day)
4. **SidebarLayout PR**: collapse 3 layouts into 1 (~1 hr)
5. **Stores + API layer PR**: unified axios, factory for admin/employee, populate `types/` (~half day)
6. **CVBuilderView split PR**: extract composables + child components (~half day, risky — needs visual regression check)
7. **Repository enforcement PR**: add missing repos, lint rule (~half day)
8. **External service wrappers PR**: aiClient/stripeClient/storageClient + retries + timeouts (~half day)
9. **Tooling PR**: eslint/prettier/husky/vitest scaffolding (~2 hrs)
10. **Tests PR**: start with auth, quota, payment service tests
