# Job Discovery & Queue

## Overview

Job Discovery is a shared pool of job postings visible to all employees and admins. Employees can add jobs manually, score candidate relevance with AI, and add candidates to a job queue that auto-generates tailored CVs.

## Access Control

- Only `EMPLOYEE` and `ADMIN` roles can access job routes
- Middleware: `authenticate` + `requireEmployeeOrAdmin`
- All employees see the same shared pool

## Job Model

```
JobDiscovery {
  id            String
  title         String      // required
  company       String      // required
  url           String?
  description   String?
  location      String?
  salary        String?
  requirements  String?
  source        String      // default "manual"
  addedById     String      // employee/admin who added it
}
```

## Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| List all jobs | GET | `/api/jobs` |
| Create job | POST | `/api/jobs` |
| Delete job | DELETE | `/api/jobs/:id` |
| Score relevance | POST | `/api/jobs/:id/score/:candidateId` |
| Add to queue | POST | `/api/jobs/:id/queue/:candidateId` |

## Creating Jobs

- Employees manually add jobs with title, company, and optional details
- Source defaults to "manual" (future: "scraper" for automated job discovery)
- `addedById` tracks which employee added the job

## Scoring Relevance

**Endpoint:** `POST /api/jobs/:id/score/:candidateId`
**Service:** `job-discovery.service.ts → scoreRelevance()`

1. Fetches job details (title, company, description, requirements, location)
2. Fetches candidate profile + base CV parsed data (truncated to 3000 chars)
3. Calls Claude with `JOB_MATCHING` admin prompt
4. Returns `{ score: 0-100, reasoning: "..." }`

Frontend displays score with color coding:
- Green: >= 70%
- Yellow: >= 40%
- Gray: < 40%

## Job Queue

**Endpoint:** `POST /api/jobs/:id/queue/:candidateId`
**Service:** `job-discovery.service.ts → addToQueue()`

### Queue Flow

1. **Validation** — job exists, candidate is assigned to this employee, not already queued
2. **Create queue item** — `CandidateJobQueue` with status `PENDING`
3. **Background: Generate tailored CV** — async, non-blocking
   - Fetches candidate's base CV
   - Calls `cvEnhanceService.generateTailoredCV()` with job context
   - Creates new CV variant with `generatedForJobId`
   - Creates `Application` with status `TO_APPLY`
   - Updates queue status to `CV_GENERATED`

### Queue Model

```
CandidateJobQueue {
  id              String
  candidateId     String      // the candidate
  jobId           String      // the job
  employeeId      String      // employee who queued it
  relevanceScore  Float?      // AI score 0-100
  status          String      // "PENDING" | "CV_GENERATED"
  generatedCvId   String?     // link to auto-generated CV
}
```

### Queue → Application

When CV generation completes, an Application is auto-created:
- `jobTitle`: from JobDiscovery
- `companyName`: from JobDiscovery
- `status`: TO_APPLY
- `source`: platform
- `addedById`: employee who queued it
- `cvUsed`: link to generated CV

This application appears in the employee's candidate detail → Applications tab.

## Frontend UI

**Route:** `/employee/job-discovery`
**View:** `JobDiscoveryView.vue`

- Card list of all jobs with title, company, location, salary, added by
- "Add Job" button → modal with form fields
- Per job: "Match" button expands candidate matching panel
- Matching panel shows employee's assigned candidates with:
  - Score button → calls relevance scoring
  - Score display with color coding
  - "Add to Queue" button → triggers full queue flow
- Delete button per job (with confirmation)

## Key Files

| Layer | File |
|-------|------|
| Frontend | `JobDiscoveryView.vue` |
| Backend service | `job-discovery.service.ts` |
| Backend controller | `job-discovery.controller.ts` |
| Backend routes | `job-discovery.routes.ts` |
| Backend DTO | `job-discovery.dto.ts` |
| Backend repo | `job-discovery.repository.ts` |
| CV generation | `cv-enhance.service.ts → generateTailoredCV()` |
| Schema | `JobDiscovery`, `CandidateJobQueue` |
