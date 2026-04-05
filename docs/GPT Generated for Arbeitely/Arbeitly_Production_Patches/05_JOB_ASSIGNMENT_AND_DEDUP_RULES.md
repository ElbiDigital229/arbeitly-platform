# Arbeitly – Job Assignment, Deduplication, and Queue Rules

## Purpose
Defines how jobs move from central pool into candidate pipelines safely.

---

## 1. Central Pool Assignment Model

Jobs live in one global pool.

Employees can:
- browse jobs
- filter by assigned candidates
- view candidate match scores
- move jobs into a candidate's To Apply queue

---

## 2. Assignment Rule

A job can be linked to multiple candidates if operationally acceptable, but each application record is unique per candidate.

Meaning:
- one pool job
- many candidate application records possible

---

## 3. Generation Trigger Rule

AI generation should occur only when:
- employee adds a pool job into a specific candidate's To Apply queue

At that moment the system:
- selects best base CV
- applies language routing
- generates job-specific CV if needed
- generates cover letter
- attaches outputs to application record

---

## 4. Duplicate Detection Rules

Duplicates should be checked using:
- exact job URL match
- external job ID if available
- company + title + location similarity

### Behaviors
- Flag duplicate in pool
- Prevent accidental double-ingestion where confident
- Allow admin override if needed

---

## 5. Candidate-Level Duplicate Protection

If a candidate already has the same job in:
- self applications
- managed applications

Then system should:
- warn employee
- prevent accidental duplicate apply unless override is allowed

---

## 6. Queue Aging Rules

Recommended:
- Jobs left in To Apply beyond X days are marked stale
- Surface stale items in employee analytics/dashboard
- Surface stale managed queues to admin

---

## 7. Concurrency / Locking Considerations

To avoid two employees actioning the same candidate job at once:
- status update should be transactional
- first successful transition to Applied consumes quota
- repeat updates to Applied must not double-consume quota
