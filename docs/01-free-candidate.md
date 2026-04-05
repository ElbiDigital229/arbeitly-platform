# Free Candidate

## Registration

**Endpoint:** `POST /api/auth/register`
**Frontend:** `RegisterView.vue`
**Service:** `auth.service.ts`

1. User enters email + password
2. Password validation: 10+ chars, 1 uppercase, 1 number, 1 special char
3. Email uniqueness check (409 if exists)
4. User created with `role: CANDIDATE`
5. Stub `CandidateProfile` auto-created with defaults:
   - `cvCreationLimit: 10`
   - `cvCreationsUsed: 0`
   - `applicationLimitUsed: 0`
   - `onboardingCompleted: false`
   - `planId: null` (FREE)
6. JWT returned immediately, user logged in

## What Free Candidates Can Do

| Feature | Available | Limit |
|---------|-----------|-------|
| Application tracker (list + kanban) | Yes | 20 applications |
| CV upload & builder | Yes | 10 CV builds |
| File management | Yes | - |
| Basic profile | Yes | - |
| Onboarding | Accessible but marked PRO in nav | - |
| Human assistant (employee) | No | Paid only |
| Resume/CL expert review | No | Paid only |
| LinkedIn makeover | No | Paid only |

## Application Limit

- Free plan allows up to 20 tracked applications (displayed in UI)
- Counter: `CandidateProfile.applicationLimitUsed`
- **Note:** Backend does NOT currently enforce this limit — it's UI-only

## CV Creation Limit

- Default: 10 CV builds
- **Hard enforced** in backend (`cv.service.ts` → `checkAndIncrementCvQuota()`)
- Throws 403: "CV creation limit reached (10). Upgrade your plan to create more CVs."
- Triggered on every `uploadAndParseCV()` and `createCV()` call

## Profile Display

- Shows "Free" plan with "Free forever" subtitle
- "Upgrade to get an assigned employee" link to `/pricing`
- CV usage bar: "CV Builds used: X / 10" with color coding (green <70%, yellow 70-99%, red 100%)
- No plan badge in sidebar header — shows "Upgrade Plan" button instead

## Onboarding

Onboarding is accessible to free users but marked as "PRO" in the sidebar. Completing it is NOT required for free features, but IS required before a candidate can be assigned to an employee (which requires a paid plan anyway).

### Steps

1. **Personal Info** — First name*, last name*, phone, location, bio
2. **Upload Base CV** — PDF/DOC/DOCX, max 10MB. Uploaded to `/api/cvs`, marked as `isBase: true`
3. **Base Cover Letter** — Free text. Saved as `CoverLetter` record with `isBase: true`, also stored on profile as `baseCoverLetter`

**Endpoint:** `POST /api/onboarding`
**Service:** `onboarding.service.ts`

On completion:
- `CandidateProfile.onboardingCompleted = true`
- First CV marked as base if not already
- Cover letter record created
- Redirects to `/candidate/applications`

## Key Files

| Layer | File |
|-------|------|
| Frontend views | `RegisterView.vue`, `OnboardingView.vue`, `ProfileView.vue`, `ApplicationsView.vue` |
| Frontend layout | `CandidateLayout.vue` |
| Frontend store | `stores/auth.ts`, `stores/subscription.ts` |
| Backend service | `auth.service.ts`, `onboarding.service.ts`, `cv.service.ts` |
| Backend routes | `auth.routes.ts`, `onboarding.routes.ts`, `cv.routes.ts` |
| Schema | `CandidateProfile`, `User`, `CV`, `CoverLetter` |
