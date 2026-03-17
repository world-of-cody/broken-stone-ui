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

## Docs
- [`docs/pixel_art_brief.md`](docs/pixel_art_brief.md) — layout + palette reference for future contributors.
- [`AGENTS.md`](AGENTS.md) — onboarding + tooling cheatsheet. 
