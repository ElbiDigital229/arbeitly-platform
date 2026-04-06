# Employee Workflow

## Authentication

Employees have a separate auth flow from candidates.

- **Login page:** `/employee/login` → `EmployeeLoginView.vue`
- **Endpoint:** `POST /api/employee/signin`
- **Token storage:** `localStorage.arbeitly_employee_token` (separate from candidate token)
- **Store:** `stores/employee.ts` — `getAuthHeaders()` returns `{ Authorization: 'Bearer {token}' }`
- **Role guard:** All employee routes require `role === 'EMPLOYEE'` (returns 403 otherwise)

## Dashboard

**Route:** `/employee/dashboard`
**Endpoint:** `GET /api/employee/dashboard`

Displays:
- Total candidates assigned
- Active applications count
- Interviews count
- Accepted count
- **"Your Stats This Month"** — applications filed, interview rate, accepted, jobs added
- Quick actions: View Candidates, Job Discovery

## Candidate Management

### Viewing Assigned Candidates

**Route:** `/employee/candidates`
**Endpoint:** `GET /api/employee/candidates`

- Shows only candidates where `assignedEmployeeId = current employee`
- Table with: name, email, application count, status breakdown

### Candidate Detail (5 Tabs)

**Route:** `/employee/candidates/:id`

#### Tab 1: Profile
- Read-only personal info: name, email, phone, location, LinkedIn, onboarding status

#### Tab 2: Onboarding
- **Endpoint:** `GET /api/employee/candidates/:id/onboarding`
- Read-only view of onboarding responses (name, phone, location, bio, base cover letter)

#### Tab 3: CV
- **List CVs:** `GET /api/employee/candidates/:id/cvs`
- **Enhance:** `POST /api/employee/candidates/:id/cvs/:cvId/enhance`
  - Uses admin's `CV_ENHANCEMENT` prompt + optional custom prompt
  - Returns enhanced CV data
- **Save as Version:** `POST /api/employee/candidates/:id/cvs/:cvId/version`
- **Create Variant:** `POST /api/employee/candidates/:id/cvs/:cvId/variant`
- **Version Tree:** `GET /api/employee/candidates/:id/cvs/:cvId/tree`
- UI shows: CV selector, parsed content view, "Enhance with Arbeitly" button, custom prompt input, version tree sidebar

#### Tab 4: Cover Letter
- **List CLs:** `GET /api/employee/candidates/:id/cover-letters`
- **Enhance:** `POST /api/employee/candidates/:id/cover-letters/:clId/enhance`
- **Save as Version:** `POST /api/employee/candidates/:id/cover-letters/:clId/version`
- **Create Variant:** `POST /api/employee/candidates/:id/cover-letters/:clId/variant`
- **Generate for Job:** `POST /api/employee/candidates/:id/cover-letters/generate`

#### Tab 5: Applications
- **List:** `GET /api/employee/candidates/:id/applications`
- **Create:** `POST /api/employee/candidates/:id/applications`
  - Fields: jobTitle*, companyName*, jobUrl, status, salary, notes
  - Source set to `platform`, `addedById` set to employee
- **Update:** `PUT /api/employee/candidates/:candidateId/applications/:appId`
- **Delete:** `DELETE /api/employee/candidates/:candidateId/applications/:appId`

Two view modes:
- **List view** — table with status badges, dropdown to change status
- **Kanban view** — drag-and-drop columns: TO_APPLY → APPLIED → INTERVIEW → ACCEPTED → REJECTED

## Version/Variant Hierarchy

CVs and Cover Letters follow the same tree structure:

```
Base (isBase: true)
  └── Version (parentType: "version") — e.g. "Tech Industry"
        └── Variant (parentType: "variant") — e.g. "Frontend Developer"
        └── Variant — e.g. "Backend Engineer"
  └── Version — e.g. "Finance Industry"
        └── Variant — e.g. "Risk Analyst"
```

- **Version:** Industry-specific adaptation of the base
- **Variant:** Use-case-specific tailoring of a version
- Auto-generated tailored CVs from job queue are also stored as variants with `generatedForJobId`

## Application Statuses

```
TO_APPLY → APPLIED → INTERVIEW → ACCEPTED
                                → REJECTED
```

## Employee Self-Performance

**Endpoint:** `GET /api/employee/performance`

Returns own metrics:
- `applicationsFiled` — apps with status !== TO_APPLY, added by this employee
- `interviews` — INTERVIEW status count
- `accepted` — ACCEPTED status count
- `interviewRatio` — (interviews / applied) * 100
- `jobsAdded` — jobs this employee added to discovery pool

## Settings

- **Update profile:** `PUT /api/employee/profile`
- **Change password:** `PUT /api/employee/change-password`

## Key Files

| Layer | File |
|-------|------|
| Frontend views | `DashboardView.vue`, `CandidatesView.vue`, `CandidateDetailView.vue`, `JobDiscoveryView.vue`, `SettingsView.vue` |
| Frontend layout | `EmployeeLayout.vue` |
| Frontend store | `stores/employee.ts` |
| Backend service | `employee.service.ts`, `cv-enhance.service.ts`, `cl.service.ts` |
| Backend controller | `employee.controller.ts` |
| Backend routes | `employee.routes.ts` |
