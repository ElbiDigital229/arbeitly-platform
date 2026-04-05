# Arbeitly – System States

## Purpose
This document defines explicit state models for core entities so backend logic, UI behavior, analytics, and testing stay consistent.

---

## 1. Candidate States

### Candidate Account Status
- Draft
- Active
- Suspended
- Archived

### Candidate Plan Status
- Free
- Paid
- Expired
- Cancelled

### Candidate Onboarding Status
- Not Started
- In Progress
- Completed

### Candidate Execution Status
- Not Assigned
- Assigned
- Active Pipeline
- Quota Exhausted
- Paused
- Closed

---

## 2. Application States

### Recommended Application Status Enum
- To Apply
- In Progress
- Applied
- Interview
- Rejected
- Offer
- Failed

### Transition Rules
- To Apply → In Progress
- To Apply → Applied
- To Apply → Failed
- In Progress → Applied
- In Progress → Failed
- Applied → Interview
- Applied → Rejected
- Interview → Offer
- Interview → Rejected

### Quota Rule
Quota is consumed only the first time a managed application reaches:
- Applied

This applies to:
- Employee source
- System source

This does not apply to:
- Self source

---

## 3. Job Pool States

Jobs in central pool may carry:
- New
- Reviewed
- Added to Candidate Queue
- Duplicate
- Archived

These states are for pool management only and do not consume quota.

---

## 4. FAQ States
- Pending Approval
- Approved

---

## 5. Transaction States
- Pending
- Paid
- Failed
- Refunded
- Cancelled
