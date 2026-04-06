# Admin Capabilities

## Authentication

- **Login page:** `/superadmin/login` → `AdminLoginView.vue`
- **Endpoint:** `POST /api/admin/signin`
- **Token storage:** `localStorage.arbeitly_admin_token`
- **Store:** `stores/admin.ts`
- **Role guard:** All admin routes require `role === 'ADMIN'`
- **Seed credentials:** `admin@arbeitly.de` / `admin2024`

## Dashboard Overview

**Route:** `/superadmin/overview`
**Endpoint:** `GET /api/admin/dashboard`

Stats displayed:
- Total Candidates
- Total Employees
- Total Applications
- Total Revenue (€) — sum of plan price × candidates per plan

Sub-sections:
- **Plan Distribution** — bar chart showing candidates per plan vs free
- **Top Performers** — top 3 employees by applications filed (with interview rate and accepted count)

## Candidate Management

**Route:** `/superadmin/candidates`

| Action | Method | Endpoint |
|--------|--------|----------|
| List (paginated) | GET | `/api/admin/candidates?page=1&limit=20` |
| Get detail | GET | `/api/admin/candidates/:id` |
| Assign/reassign | PATCH | `/api/admin/candidates/:id` |
| List applications | GET | `/api/admin/candidates/:id/applications` |

### Assignment Rules

When assigning a candidate to an employee (`assignedEmployeeId`), backend validates:

1. **Must be PAID** — `profile.planId` must not be null
   - Error: "Only PAID candidates can be assigned to an employee"
2. **Must be onboarded** — `profile.onboardingCompleted` must be true
   - Error: "Candidate must complete onboarding before assignment"

To **unassign**, set `assignedEmployeeId` to null. To **reassign**, set to a different employee ID.

## Employee Management

**Route:** `/superadmin/employees`

| Action | Method | Endpoint |
|--------|--------|----------|
| List all | GET | `/api/admin/employees` |
| Create | POST | `/api/admin/employees` |
| Delete | DELETE | `/api/admin/employees/:id` |

- Creating an employee: provide email + password, role auto-set to EMPLOYEE
- Deleting: auto-unassigns all candidates first, then deletes user record
- No edit endpoint — employees manage their own profile via `/employee/settings`

## Plan Management

**Route:** `/superadmin/plans`

| Action | Method | Endpoint |
|--------|--------|----------|
| List all | GET | `/api/admin/plans` |
| Create | POST | `/api/admin/plans` |
| Update | PATCH | `/api/admin/plans/:id` |
| Delete | DELETE | `/api/admin/plans/:id` |

### Business Rules

- **Max 5 active plans** — enforced on create (if `isActive: true`) and on update (when activating an inactive plan)
- **Cannot delete plan with candidates** — must deactivate instead. Error: "Cannot delete plan with X candidate(s)"
- Plans with `isPopular: true` get a "Most Popular" badge on pricing page
- `sortOrder` controls display order

## AI Prompt Management

**Route:** `/superadmin/ai-config`

| Action | Method | Endpoint |
|--------|--------|----------|
| List all | GET | `/api/admin/prompts` |
| Create | POST | `/api/admin/prompts` |
| Update | PATCH | `/api/admin/prompts/:id` |
| Delete | DELETE | `/api/admin/prompts/:id` |

### Prompt Types

| Type | Used For |
|------|----------|
| `CV_ENHANCEMENT` | Improving CV content via AI |
| `CL_ENHANCEMENT` | Improving cover letter content |
| `CL_GENERATION` | Generating new cover letters for specific jobs |
| `JOB_MATCHING` | Scoring job-candidate relevance (0-100) |

- Version auto-increments on update
- Type cannot be changed after creation
- `isActive` controls which prompt is used by AI services (`findActiveByType()`)
- If no active admin prompt exists, hardcoded defaults are used

## Performance Tracking

**Route:** `/superadmin/performance`

| Action | Method | Endpoint |
|--------|--------|----------|
| All employees | GET | `/api/admin/performance` |
| Employee detail | GET | `/api/admin/performance/:id` |

### Summary Metrics (per employee)

- Candidates assigned count
- Applications filed (status !== TO_APPLY)
- Interviews secured
- Accepted count
- Interview ratio (interviews / applied × 100)
- Jobs added to discovery pool

### Detail View

- Same metrics as summary
- Recent 20 applications: jobTitle, companyName, status, createdAt

### UI

- Table with color-coded interview ratio (green >= 20%, yellow >= 10%, gray < 10%)
- Click row to open detail modal

## Other Admin Pages

| Page | Route | Description |
|------|-------|-------------|
| Transactions | `/superadmin/transactions` | Revenue tracking (client-side only, no backend) |
| Audit Log | `/superadmin/audit-log` | Activity reconstruction from application data |
| System Settings | `/superadmin/system-settings` | Platform config (client-side only) |
| Profile | `/superadmin/profile` | Admin account info |
| Change Password | `PUT /api/admin/change-password` | Current + new password |

## Sidebar Navigation

**Platform section:** Overview, Transactions
**Customers section:** Candidates, Employees, Pricing Plans, Performance
**Configuration section:** AI Config, Audit Log, System Settings

## All Admin Routes

```
POST   /admin/signin
GET    /admin/dashboard
GET    /admin/candidates
GET    /admin/candidates/:id
PATCH  /admin/candidates/:id
GET    /admin/candidates/:id/applications
GET    /admin/employees
POST   /admin/employees
DELETE /admin/employees/:id
GET    /admin/plans
POST   /admin/plans
PATCH  /admin/plans/:id
DELETE /admin/plans/:id
GET    /admin/prompts
POST   /admin/prompts
PATCH  /admin/prompts/:id
DELETE /admin/prompts/:id
GET    /admin/performance
GET    /admin/performance/:id
PUT    /admin/change-password
```
