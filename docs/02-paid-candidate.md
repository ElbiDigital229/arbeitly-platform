# Paid Candidate

## Pricing Model

- **One-time payment** — not a subscription
- Currency: EUR (default, configurable per plan)
- No recurring billing, no expiry dates
- Displayed as "€X one time payment" throughout the UI

## Plan Schema

```
Plan {
  id            String
  name          String          // e.g. "Pro", "Enterprise"
  description   String?
  price         Float           // e.g. 49.99
  currency      String          // default "EUR"
  applicationLimit Int          // number of applications included
  features      Json            // array of { text: string, included: boolean }
  isActive      Boolean         // controls visibility and purchasability
  isPopular     Boolean         // "Most Popular" badge on pricing page
  sortOrder     Int             // display order
}
```

## Purchase Flow

**Endpoint:** `POST /api/payments/purchase`
**Service:** `payment.service.ts`

1. User selects plan on `/pricing` page
2. Clicks "Get Started" → registers if not logged in
3. Redirected to `/checkout?plan={planId}`
4. Checkout page shows plan summary (name, price, features, application limit)
5. "Pay €X Now" button (mock — no real Stripe integration)
6. Backend validates:
   - Plan exists and `isActive`
   - Candidate profile exists
   - Candidate does NOT already have a plan (one plan per candidate)
7. On success: sets `CandidateProfile.planId`, resets `applicationLimitUsed` to 0
8. Redirects to `/candidate/applications`

## What Paid Unlocks

| Feature | Free | Paid |
|---------|------|------|
| Application limit | 20 | Plan-defined (e.g. 50, 100) |
| Human assistant | No | Yes — employee assigned by admin |
| Resume/CL review | No | Yes |
| LinkedIn makeover | No | Yes |
| CV builds | 10 | 10 (same default, not plan-dependent) |

## Assignment Prerequisites

A paid candidate can only be assigned to an employee when BOTH conditions are met:

1. `profile.planId IS NOT NULL` (has purchased a plan)
2. `profile.onboardingCompleted = true` (completed onboarding wizard)

Enforced in `admin.service.ts` → `updateCandidate()`. Returns 400 error if either condition fails.

## Plan Management (Admin)

- Max **5 active plans** at any time (enforced on create and on activate)
- Inactive plans can be created without limit
- Plans with active candidates cannot be deleted — must deactivate instead
- Features are a JSON array: `[{ text: "100 applications", included: true }, ...]`

## Current Plan Retrieval

**Endpoint:** `GET /api/payments/subscription`
**Service:** `payment.service.ts` → `getCurrentPlan()`

Returns:
```json
// Free user
{ "plan": null, "status": "FREE" }

// Paid user
{
  "plan": { "id": "...", "name": "Pro", "price": 99, ... },
  "status": "PAID",
  "applicationLimitUsed": 5,
  "applicationLimit": 100
}
```

## Limitations & Gaps

- **Application limit not enforced** — `applicationLimitUsed` is tracked but no backend check prevents exceeding it
- **No plan upgrades/downgrades** — "You already have an active plan" prevents purchasing another
- **No Stripe integration** — checkout is mock only
- **CV limit not plan-dependent** — stays at 10 regardless of plan

## Key Files

| Layer | File |
|-------|------|
| Frontend | `CheckoutView.vue`, `PricingSection.vue`, `PlansView.vue`, `ProfileView.vue` |
| Frontend store | `stores/subscription.ts` |
| Backend service | `payment.service.ts`, `admin.service.ts` (plan CRUD) |
| Backend routes | `payment.routes.ts`, `admin.routes.ts` |
| Backend DTO | `plan.dto.ts`, `payment.dto.ts` (PurchasePlanDto) |
| Backend repo | `plan.repository.ts` |
