# CV & Cover Letter Enhancement + Generation

## AI Model

All AI operations use `claude-haiku-4-5-20251001` via the Anthropic SDK (`@anthropic-ai/sdk`).

## CV Enhancement

**Service:** `cv-enhance.service.ts → enhanceCV(cvId, promptType, customPrompt?)`
**Endpoint:** `POST /api/employee/candidates/:id/cvs/:cvId/enhance`

### Flow

1. Fetch the CV's `parsedData` (JSON)
2. Fetch active `CV_ENHANCEMENT` admin prompt (or use default)
3. If custom prompt provided, append it to the system prompt
4. Call Claude with full parsedData as user message
5. Return enhanced parsedData JSON (same structure)

### Default Prompt

```
You are an expert CV writer. Enhance the following CV data to be more impactful,
professional, and ATS-friendly. Keep all factual information intact.
Return the same JSON structure.
```

### Max tokens: 16384

## Cover Letter Enhancement

**Service:** `cl.service.ts → enhanceCoverLetter(clId, promptType, customPrompt?)`
**Endpoint:** `POST /api/employee/candidates/:id/cover-letters/:clId/enhance`

### Flow

1. Fetch cover letter `content` (plain text)
2. Fetch active `CL_ENHANCEMENT` admin prompt (or default)
3. Call Claude with content as user message
4. Return enhanced text (plain string)

### Default Prompt

```
You are an expert cover letter writer. Enhance the following cover letter
to be more compelling, professional, and tailored. Keep all factual
information intact. Return only the enhanced cover letter text.
```

### Max tokens: 4096

## Cover Letter Generation (for specific job)

**Service:** `cl.service.ts → generateForJob(candidateId, jobTitle, company, jobDescription)`
**Endpoint:** `POST /api/employee/candidates/:id/cover-letters/generate`

### Flow

1. Fetch candidate profile (name, bio) + base cover letter
2. Fetch active `CL_GENERATION` admin prompt
3. Build context: candidate info + job details
4. Call Claude to generate from scratch
5. Return generated cover letter text

### Default Prompt

```
You are an expert cover letter writer. Generate a compelling, personalized
cover letter for the job described below. Use the candidate's profile
and base cover letter as context. Return only the cover letter text.
```

## Tailored CV Generation (auto, for job queue)

**Service:** `cv-enhance.service.ts → generateTailoredCV(baseCvId, jobTitle, company, jobDescription)`
**Triggered by:** `job-discovery.service.ts → addToQueue()` (background, async)

### Flow

1. Fetch base CV's parsedData
2. Build tailoring prompt with job context
3. Call Claude to modify CV for this specific job
4. Create new CV record:
   - `title`: "{jobTitle} @ {company}"
   - `parentId`: base CV id
   - `parentType`: "variant"
   - `generatedForJobId`: job id
   - `parsedData`: tailored JSON
5. Auto-create Application with status TO_APPLY

### Tailoring Prompt

```
You are an expert CV tailor. Modify the following CV to be perfectly
tailored for the job described below. Emphasize relevant experience
and skills. Keep all factual information intact — do NOT invent new
experiences. Return the same JSON structure.
```

## Version/Variant System

Both CVs and Cover Letters support a parent-child tree:

```
Base (isBase: true, parentId: null)
  └── Version (parentType: "version", parentId: base.id)
        └── Variant (parentType: "variant", parentId: version.id)
```

### CV Version Operations

| Action | Endpoint |
|--------|----------|
| Create version | `POST /api/employee/candidates/:id/cvs/:cvId/version` |
| Create variant | `POST /api/employee/candidates/:id/cvs/:cvId/variant` |
| Get tree | `GET /api/employee/candidates/:id/cvs/:cvId/tree` |

### Cover Letter Version Operations

| Action | Endpoint |
|--------|----------|
| Create version | `POST /api/employee/candidates/:id/cover-letters/:clId/version` |
| Create variant | `POST /api/employee/candidates/:id/cover-letters/:clId/variant` |
| Get tree | `GET /api/employee/candidates/:id/cover-letters/:clId/tree` |

## Admin Prompt Types Summary

| Type | Service | Purpose | Max Tokens |
|------|---------|---------|------------|
| `CV_ENHANCEMENT` | `cv-enhance.service.ts` | Improve CV | 16384 |
| `CL_ENHANCEMENT` | `cl.service.ts` | Improve cover letter | 4096 |
| `CL_GENERATION` | `cl.service.ts` | Generate for job | 4096 |
| `JOB_MATCHING` | `job-discovery.service.ts` | Score relevance | 1024 |

## Key Files

| File | Purpose |
|------|---------|
| `cv-enhance.service.ts` | CV enhancement + tailored generation |
| `cl.service.ts` | Cover letter enhancement + generation |
| `admin-prompt.repository.ts` | Prompt lookup by type |
| `CandidateDetailView.vue` | UI for enhance/version/variant |
