# Arbeitly – Failure & Retry Handling

## Purpose
This document defines what happens when execution or generation fails.

---

## 1. Application Failure Cases

Possible reasons:
- Broken job link
- Candidate credentials invalid
- External site login failed
- Captcha / anti-bot interruption
- Form submission failed
- Job already closed
- Duplicate detected before submission

### Employee Action
Employee can mark managed application as:
- Failed

### Required Failure Fields
- Failure reason
- Failure notes
- Failed at timestamp
- Failed by employee

### Quota Rule
Failed applications do not consume quota.

---

## 2. AI Generation Failure Cases

Possible failures:
- CV generation failed
- Cover letter generation failed
- Language routing failed
- Prompt provider timeout
- LLM output invalid / empty

### System Behavior
- Mark generation status as Failed
- Keep job in To Apply or Generation Failed sub-state
- Allow retry
- Show reason in UI if available

### Retry Guidance
- Retry manually by employee
- Retry manually by admin
- Optional automatic retry later

---

## 3. Retry Tracking

Suggested retry fields:
- Retry allowed (true/false)
- Retry count
- Max retry count
- Last retry timestamp
- Last retry actor

---

## 4. Escalation Rules

Recommended operational rules:
- If application fails repeatedly, notify admin
- If generation fails repeatedly, surface in admin dashboard
- If candidate credentials fail, flag candidate account tab clearly
