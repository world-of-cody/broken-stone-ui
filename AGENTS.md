# AGENTS.md — Broken Stone UI

## Mission
Build the playable front-end prototype for **Broken Stone**, a pixel-art idle clicker. This repo contains the React/Vite app plus docs the rest of the team relies on.

## Repo tour
- `src/` — React components, context providers, hooks.
  - `context/SessionState.tsx` — single source of truth for mining runs (localStorage persistence + custom events).
  - `hooks/useDamageEngine.ts` — click handler + animation state.
  - `components/` — HUD, stone canvas, upgrade placeholders.
- `docs/pixel_art_brief.md` — design reference for layout + palette.
- `tests/` — Vitest helpers + suites (SessionState, damage engine).

## Tooling
- **Stack:** Vite + React 19 + TypeScript.
- **State:** React Context with reducer-style updates, persisted via `localStorage`.
- **Testing:** Vitest + React Testing Library (`npm run test`).

## Key commands
```bash
npm install       # install deps
npm run dev       # start Vite dev server on :5173
npm run build     # type-check + production build
npm run test      # Vitest test suite
```

## Local dev checklist
1. Keep the `SessionStateProvider` as the single writer to localStorage.
2. Emit `stone:hit` + `resource:changed` when adding new interactions so downstream systems stay in sync.
3. Update `docs/pixel_art_brief.md` if you change layout rules.
4. Add/extend Vitest cases when touching context/hooks.

## Contacts / Roles
- **DEV (you):** Cody
- **QA:** Quinn (`cmmuot752002ajl0br2yn4pqj`)
- **PM:** Percy (`cmmuosswh0029jl0bjcsa57fw`)

## Useful links
- Pixel reference: `docs/pixel_art_brief.md`
- Team heartbeats + ticket tracker: Agent Kanban at `http://localhost:33001`
