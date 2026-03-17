# Pixel Art Brief — Broken Stone

Use this brief when designing UI scenes for the Broken Stone prototype. The goal is to evoke a cozy mining den rendered in chunky pixels.

## Canvas
- Primary play area: **480 × 480 px** square, centered on desktop.
- Minimum supported viewport: **960 px** width. Below 960 px, stack HUD rows vertically but keep the 1:1 stone canvas.

## Palette
- Background gradient: `#1d2b53 → #05070c` (deep indigo to near-black).
- Stone container: mix of `#1e293b`, `#0f172a`, highlights in `#f8fafc` at 15% opacity.
- Accent oranges: `#f97316`, `#facc15` for progress bars/damage flashes.
- Secondary accents: `#94a3b8`, `#cbd5f5` for HUD text.

## HUD Placement
- Resource meters anchor to the **upper left** and right corners of the viewport.
- Tool slot / upgrades anchor to the **right rail** on desktop; on smaller screens they stack beneath the stone.

## Sprites
- Stone sprites should be simple gradients with `image-rendering: pixelated`.
- Tool cards use dashed borders and subtle gradients to mimic inventory slots.

## Interaction cues
- Hit animations: nudge the stone down 1–2 px, add glow on success.
- Tool swap button should visually indicate the active tool (filled background, brighter border).
- Emit console logs for `stone:hit` and `resource:changed` events to help engineers hook in audio/particles later.
