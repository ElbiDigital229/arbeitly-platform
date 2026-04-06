# AI Matching & Scoring

## Overview

AI matching scores how well a candidate fits a specific job, returning a 0-100 score with reasoning. Used in the Job Discovery flow when employees evaluate candidates for positions.

## How It Works

**Service:** `job-discovery.service.ts → scoreRelevance(jobId, candidateId)`
**Model:** `claude-haiku-4-5-20251001`
**Max tokens:** 1024

### Input Data

| Data | Source | Truncation |
|------|--------|------------|
| Job title | `JobDiscovery.title` | - |
| Job company | `JobDiscovery.company` | - |
| Job location | `JobDiscovery.location` | - |
| Job description | `JobDiscovery.description` | - |
| Job requirements | `JobDiscovery.requirements` | - |
| Candidate name | `CandidateProfile.firstName + lastName` | - |
| Candidate location | `CandidateProfile.location` | - |
| Candidate bio | `CandidateProfile.bio` | - |
| CV data | `CV.parsedData` (base CV, JSON stringified) | First 3000 chars |

### Admin Prompt

Uses `JOB_MATCHING` type from `AdminPrompt` table. If none configured, falls back to:

```
You are a job matching expert. Score how well this candidate matches
the job on a scale of 0-100. Return JSON: {"score": number, "reasoning": "brief explanation"}
```

### Output

```json
{
  "score": 75,
  "reasoning": "Strong match due to relevant Python experience and Berlin location..."
}
```

- Score stored in `CandidateJobQueue.relevanceScore` (when added to queue)
- If scoring fails, the flow continues without a score

### UI Display

Scores are color-coded in the frontend:
- **Green (>= 70):** Strong match
- **Yellow (>= 40):** Moderate match
- **Gray (< 40):** Weak match

## Prompt Customization

Admins can customize the matching prompt via `/superadmin/ai-config`:

1. Create a prompt with type `JOB_MATCHING`
2. Set `isActive: true`
3. The AI service will use `findActiveByType('JOB_MATCHING')` to fetch it
4. Multiple prompts can exist but only the active one is used

## Key Files

| File | Purpose |
|------|---------|
| `job-discovery.service.ts` | `scoreRelevance()` method |
| `admin-prompt.repository.ts` | `findActiveByType()` for prompt lookup |
| `JobDiscoveryView.vue` | Score button and display |
| `CandidateDetailView.vue` | Score display in queue items |
