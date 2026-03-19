# Broken Stone — QA Smoke Checklist

_Last updated: 2026-03-18_

This checklist pairs with [`docs/deployment_handoff_template.md`](deployment_handoff_template.md) to capture owner/date/build hash notes for every run.

## 1. Environment sanity
- [ ] `npm install && npm run dev` runs without errors.
- [ ] .env file contains expected keys:
  - `NEXT_PUBLIC_API_BASE`
  - `NEXT_PUBLIC_ANALYTICS_KEY`
- [ ] Build loads at `http://localhost:5173` without console errors.

## 2. Core click loop
- [ ] Stone HP bar animates on click / keyboard (Space).
- [ ] Resource bar increments chips on each successful hit.
- [ ] Stone resets after HP reaches 0 and awards bonus chips + shards.

## 3. Upgrade shop
- [ ] Workshop panel shows **Tools**/**Boosters** tabs with catalog items.
- [ ] Locked items display requirement badges (e.g., crystals needed).
- [ ] Purchasing a tool equips it immediately and updates the tool sprite/hud damage.
- [ ] Purchasing Forge Booster starts countdown timer; damage multiplier expires correctly.

## 4. Special stones & resources
- [ ] Iron Vein unlocks only after requirements; spawns within 3–5 clicks post-unlock.
- [ ] Crystal Geode unlocks per spec; crit hit flash triggers extra shard.
- [ ] Resource controller tracks chips/ingots/shards in HUD.
- [ ] Analytics console log fires the first time each resource type is unlocked.

## 5. Deployment smoke
- [ ] GitHub Action (lint/test/build) passes for the current commit.
- [ ] Vercel preview URL is attached to PR and matches branch build.
- [ ] Production deploy (main) succeeded and latest build hash noted in handoff template.

## 6. Regression checks
- [ ] `npm test` completes with all suites passing.
- [ ] `npm run build` completes without warnings.
- [ ] README deployment instructions followed without manual intervention.

## Notes
- Record QA owner, date, Vercel preview URL, and build hash in the handoff template after completing this checklist.
