# Arbeitly – Permissions Matrix

## Purpose
This matrix defines exact permissions by role.

| Action | Candidate | Employee | Super Admin |
|---|---|---|---|
| View own profile | Yes | N/A | N/A |
| View assigned candidate profile | No | Yes | Yes |
| View all candidates | No | No | Yes |
| Edit own profile | Yes | Yes (own employee profile) | Yes (own admin profile) |
| Change own password | Yes | Yes | Yes |
| View onboarding responses | Yes (own) | Yes (assigned candidate) | Yes |
| Edit onboarding responses | No | No | Yes |
| View candidate credentials | No | Yes (assigned candidate) | Yes |
| Upload / create own CV | Yes | No | No |
| Edit candidate base CV | No | Yes (assigned candidate) | Yes |
| Trigger AI CV enhancement | No | Yes | Yes |
| Run custom employee prompt | No | Yes, within admin limits | Yes |
| View candidate files | Yes (own) | Yes (assigned candidate) | Yes |
| View employee global files | No | Yes (own only) | Optional / future |
| Create self application | Yes | No | No |
| View self applications | Yes | No | Yes |
| View employee/system managed applications | Yes (own only) | Yes (assigned candidate only) | Yes |
| Edit self application | Yes | No | Yes |
| Edit managed application status | No | Yes | Yes |
| Manually add managed application | No | Yes | Yes |
| Import/export applications | Yes (own) | Yes (assigned candidate managed set) | Yes |
| View job pool | No | Yes | Yes |
| Add jobs to pool | No | Yes | Yes |
| Bulk move jobs from pool to candidate queue | No | Yes | Yes |
| Create FAQ item | No | Yes | Yes |
| Approve FAQ item | Yes (own) | Yes after external confirmation if policy allows | Yes |
| Reassign candidate | No | No | Yes |
| Create plan | No | No | Yes |
| Edit plan | No | No | Yes |
| Create employee | No | No | Yes |
| View all transactions | No | No | Yes |
| Edit global prompts | No | No | Yes |
| Edit language routing rules | No | No | Yes |
| View analytics | Own only | Own only | Platform-wide + employee + candidate |
| View audit logs | Own limited activity | Own limited activity | Full |
