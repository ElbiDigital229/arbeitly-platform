# Arbeitly – Production Readiness Layer (Addendum)

## Purpose
This document addresses critical production gaps:
- Notifications
- Error visibility
- Multi-language CV scaling
- Data model clarity

---

# 1. Notification System

## 1.1 Candidate Notifications
Trigger events:
- New managed application added
- FAQ pending approval
- Status changed (Interview, Offer, Rejected)
- Quota nearing exhaustion

Channels (phase-based):
- In-app (required)
- Email (optional later)

---

## 1.2 Employee Notifications
- Candidate assigned
- Generation failed
- Application failed
- Candidate quota near/exhausted

---

## 1.3 Admin Notifications
- System-wide failures (AI, scraper future)
- Employee underperformance
- High failure rates
- Quota abuse patterns

---

# 2. Error Visibility & Recovery

## 2.1 UI Error States

### CV Generation Failure
Show:
- “Generation Failed”
- Reason (if available)
- Retry button

### Application Failure
Show:
- Failure reason
- Retry option
- Editable notes

---

## 2.2 Retry Logic

Each failure tracks:
- retry_count
- last_retry_at
- last_retry_by

Rules:
- Employee can retry
- Admin can retry
- Limit retries (configurable)

---

# 3. Multi-Language CV Scaling

## 3.1 Language Routing Enhancements
If translation fails:
- fallback to EN version
- flag for employee review

---

## 3.2 CV Reuse Logic
Before generating new CV:
- check for similar job (title + role + language)
- reuse if similarity threshold met

---

## 3.3 Quality Control
Flag CVs when:
- auto-translated
- low confidence output
- missing sections

---

# 4. Data Model Requirements

## 4.1 Application Object (Extended)

Required fields:
- id
- candidate_id
- source (self / employee / system)
- status
- quota_consumed (boolean)
- consumed_at
- consumed_by
- created_at
- updated_at

---

## 4.2 CV Object (Extended)

Required fields:
- id
- candidate_id
- language (EN / DE)
- source (candidate / employee / system)
- version
- base_version_id
- derived_from
- generation_type (base / enhanced / job_specific / translated)
- linked_job_id (optional)
- created_at

---

## 4.3 Job Object (Pool)

Required fields:
- id
- title
- company
- location
- url
- source
- duplicate_flag
- created_at
- archived_at (optional)

---

## 4.4 Audit Requirements
All critical actions must log:
- actor
- action
- entity
- timestamp

---

# 5. Final Note

This layer ensures:
- system stability
- cost control readiness
- backend clarity
- scalable AI usage
- production-grade UX

It should be implemented alongside the MASTER SPEC.
