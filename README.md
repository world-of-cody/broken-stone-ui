# Broken Stone UI Prototype

Pixel-art inspired clicker prototype for the Broken Stone mining game. The goal of this milestone is to deliver the core mining scene, in-browser session persistence, and the scaffolding pattern for future upgrades.

## Features
- 🎯 **Stone canvas** – 480×480 hit-box with responsive layout + hit animation.
- 🧠 **Session state provider** – React Context + localStorage hydration to keep stone HP, currency, and equipped tool in sync across reloads.
- ⚙️ **Damage engine** – Hook that handles hit events, emits `stone:hit` / `resource:changed`, and exposes a simple API for future effects.
- 🧰 **Tool slot + swaps** – Sample tool palette that updates sprites + damage multipliers.
- 🧪 **Tests** – Vitest + React Testing Library coverage for the provider and damage hook.

## Getting started
```bash
npm install
npm run dev
```
Visit <http://localhost:5173>.

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + build |
| `npm run test` | Vitest suite |
| `npm run lint` | ESLint over TS/JS |

## Deployment (Vercel)
1. **Connect GitHub → Vercel** and select the `broken-stone` repo. Production branch is `main`.
2. **Environment variables** — mirror `.env.example` in Vercel Project Settings → Environment Variables:
   | Name | Example | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_API_BASE` | `https://api.example.com/v1` | Also exposed in Vite via `import.meta.env.NEXT_PUBLIC_API_BASE`. |
   | `NEXT_PUBLIC_ANALYTICS_KEY` | `prod-analytics-key` | Used for client-side instrumentation later. |
3. **GitHub secrets** — add `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and `VERCEL_ORG_ID` so Actions can pull/build/deploy via CLI.
4. **Workflow** — `.github/workflows/ci-vercel.yml` runs on pushes & PRs:
   - `npm ci`, `npm run lint`, `npm run test -- --run`, `npm run build` (fails fast on errors).
   - `vercel pull/build/deploy` promotes preview builds for PRs and production for `main`.
   - Preview deployments post a comment with the Vercel URL on every PR.
5. **Notifications** — see [Slack/Discord payloads](#deployment-notification-payloads) for mock webhook examples.

### Rollback
1. Identify a known-good deployment from Vercel (`vercel list broken-stone`).
2. Promote it:
   ```bash
   npx vercel rollback <deployment-id-or-url> \
     --token $VERCEL_TOKEN \
     --org-id $VERCEL_ORG_ID \
     --project-id $VERCEL_PROJECT_ID
   ```
3. Confirm production URL reflects the reverted build and log the rollback in the [handoff template](docs/deployment_handoff_template.md).
4. If a hotfix is needed, create a new branch from the reverted commit, merge, and re-run the workflow.

## QA & Handoff
- Smoke checklist lives at [`docs/qa_smoke_checklist.md`](docs/qa_smoke_checklist.md).
- Record QA owner/date/build hash + Vercel URL per run in [`docs/deployment_handoff_template.md`](docs/deployment_handoff_template.md).
- Ticket owners should link the completed checklist + template section when moving to “Ready for QA”.

## Deployment Notification Payloads
Use these as references for mock Slack/Discord webhooks or to seed future automation.

<details>
<summary>Slack</summary>

```json
{
  "text": "Broken Stone deploy succeeded",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Broken Stone* deployment completed for `preview`\nURL: https://broken-stone-git-feature.vercel.app"
      }
    },
    {
      "type": "context",
      "elements": [
        { "type": "mrkdwn", "text": "Owner: @cody" },
        { "type": "mrkdwn", "text": "Commit: 1a2b3c4" }
      ]
    }
  ]
}
```
</details>

<details>
<summary>Discord</summary>

```json
{
  "username": "Broken Stone Deploy Bot",
  "embeds": [
    {
      "title": "Preview deploy ready",
      "url": "https://broken-stone-git-feature.vercel.app",
      "color": 3066993,
      "fields": [
        { "name": "Environment", "value": "preview", "inline": true },
        { "name": "Build", "value": "1a2b3c4", "inline": true }
      ],
      "footer": { "text": "QA checklist: docs/qa_smoke_checklist.md" }
    }
  ]
}
```
</details>

## Docs
- [`docs/pixel_art_brief.md`](docs/pixel_art_brief.md) — layout + palette reference for future contributors.
- [`AGENTS.md`](AGENTS.md) — onboarding + tooling cheatsheet.
