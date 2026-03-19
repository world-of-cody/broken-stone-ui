# Broken Stone — Deployment Handoff Template

Use this template when passing a milestone build to QA or stakeholders.
Fill one row per deploy. Attach links/screenshots directly in the doc or ticket comment.

| Field | Details |
| --- | --- |
| QA Owner | _Name + handle_ |
| Date | _YYYY-MM-DD_ |
| Environment | `preview` \| `production` |
| Git Commit | `_hash_` |
| Vercel URL | `_https://..._` |
| Build Number / ID | `_from Vercel deploy log_` |
| Checklist Status | `PASS` \| `FAIL` (link to checklist run) |
| Notes | _Bugs found, follow-ups, rollback reference_ |

Add rollback verification notes when production is touched (link to README rollback section). For preview-only drops, note which feature flag(s) or branches testers should focus on.
