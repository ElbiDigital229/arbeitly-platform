# Reporting & Performance

## Admin Dashboard

**Endpoint:** `GET /api/admin/dashboard`

| Metric | Calculation |
|--------|-------------|
| Total Candidates | Count of users with `role = 'CANDIDATE'` |
| Total Employees | Count of users with `role = 'EMPLOYEE'` |
| Total Applications | Count of all Application records |
| Total Revenue | Sum of `plan.price` for each candidate with a plan |
| Paid Candidates | Count of candidates where `planId IS NOT NULL` |

### Plan Distribution

Shows breakdown of candidates across plans:
- Free (candidates without planId)
- Per paid plan: name, count, percentage bar

### Top Performers

Top 3 employees sorted by `applicationsFiled` descending. Shows:
- Email
- Applications filed count
- Interview ratio %
- Accepted count

## Employee Performance (Admin View)

**Route:** `/superadmin/performance`
**Endpoint:** `GET /api/admin/performance`

Table showing all employees with:

| Column | Source |
|--------|--------|
| Email | `user.email` |
| Candidates | Count where `assignedEmployeeId = employee.id` |
| Applications Filed | Applications for assigned candidates with `status !== 'TO_APPLY'` |
| Interviews | Applications with `status = 'INTERVIEW'` |
| Accepted | Applications with `status = 'ACCEPTED'` |
| Interview % | `Math.round((interviews / applicationsFiled) * 100)` |
| Jobs Added | Count of `JobDiscovery` where `addedById = employee.id` |

### Color Coding

Interview ratio is color-coded:
- Green: >= 20%
- Yellow: >= 10%
- Gray: < 10%

### Detail Modal

**Endpoint:** `GET /api/admin/performance/:id`

Shows:
- Summary stat cards (applications, interview rate, accepted, jobs added)
- Recent 10 applications table: job title, company, status

## Employee Self-Performance

**Endpoint:** `GET /api/employee/performance`

Displayed on employee dashboard under "Your Stats This Month":

| Metric | Calculation |
|--------|-------------|
| Applications Filed | Apps added by this employee with `status !== 'TO_APPLY'` |
| Interview Rate | `(interviews / applied) * 100` |
| Accepted | Apps with `status = 'ACCEPTED'` |
| Jobs Added | Count of `JobDiscovery` where `addedById = employee.id` |

## Employee Dashboard Stats

**Endpoint:** `GET /api/employee/dashboard`

| Stat | Source |
|------|--------|
| Total Candidates | Count where `assignedEmployeeId = employee.id` |
| Active Applications | Total application count for assigned candidates |
| Interviews | INTERVIEW status count |
| Accepted | ACCEPTED status count |

## Candidate Profile Stats

Displayed on candidate's `/candidate/profile` page:

- Plan name + price (or "Free")
- Application usage: "Employee applications used: X / {limit}" with progress bar
- CV builds used: "X / 10" with color-coded progress bar
- Onboarding completion status

## Key Files

| Component | File |
|-----------|------|
| Admin dashboard | `OverviewView.vue`, `admin.service.ts → getDashboardStats()` |
| Admin performance | `PerformanceView.vue`, `admin.service.ts → getEmployeePerformance()` |
| Employee dashboard | `DashboardView.vue`, `employee.service.ts → dashboard()` |
| Employee self-stats | `DashboardView.vue`, `employee.service.ts → getPerformanceStats()` |
| Candidate profile | `ProfileView.vue`, `payment.service.ts → getCurrentPlan()` |
