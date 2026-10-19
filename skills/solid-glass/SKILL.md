---
name: solid-glass
description: Build front-end pages, internal tools, dashboards, landing pages and single-file HTML demos with the Solid Glass material theme (a thick, smoky glassmorphism skin for shadcn/ui). Use whenever the user asks for UI styling, 玻璃质感/毛玻璃/前端界面/页面美化/换皮肤/这套玻璃效果, or names Solid Glass itself. Ships the upstream stylesheet, a generated set of tuning classes for its 11 knobs, a plain-CSS shim for pages without Tailwind, an offline knob playground, and the 13 official React components. Covers both paths: React 19 + Tailwind 4 + shadcn/ui projects, and no-build single-file HTML.
when_to_use: Any request to style, theme or build a web UI where this project's default look should be Solid Glass, or where the user mentions glass / 毛玻璃 / 玻璃质感 / shadcn theming.
---

# Solid Glass

## Overview

One 55 KB stylesheet (`assets/solid-glass.css`, MIT © 2026 DeepLethe) that re-skins UI by
drawing the material **at the edges**: a line of light along the top, a hairline all round,
a shadow gathered underneath, and a near-opaque neutral face. It reads solid from a distance
and like glass close up, so text stays readable — that is the whole point of choosing it over
generic glassmorphism.

Decide which path applies before writing anything:

| Project | Path |
| --- | --- |
| React 19 + Tailwind 4 + shadcn/ui | `references/react-project.md` — import the CSS, delete shadcn's colour block |
| Plain HTML, no build step, single file | `references/offline-html.md` — CSS + `theme-shim.css` + your layout |

If the stack is neither, say so and stop: the theme keys off shadcn's `data-slot` attributes
and Tailwind utility classes, and half-applying it looks worse than not applying it.

## The look

Pick knobs by class, on `<html>` or on any element (blocks are emitted for both modes):

```html
<html class="dark sg-tint-mauve sg-thick-default sg-rim-default sg-shadow-default sg-accent-violet">
```

Defaults are a deliberate choice, not an absence: **`sg-tint-mauve` + default thickness/rim/
shadow** for dark-first tools, **`sg-tint-neutral` + `sg-thick-default`** when the content is
dense text. Stay off `sg-shadow-deep` and `sg-rim-bright` for screens people stare at all day —
reserve them for landing pages and demos.

Full knob table, upstream's six presets, and the four rules that keep it one material:
`references/knobs.md`.

## Build a page

1. Open `assets/preview.html` (offline, no server) and set the knobs; copy the class list it
   prints in the header bar.
2. For a new single-file page, copy the load order and the surface markup from
   `assets/preview.html` — it already gets the three things right that people miss: the
   shim classes for fills, the background lights behind translucent panes, and
   `[data-slot]` names the theme actually styles.
3. Write your own layout CSS. Do not put colour on panel faces — colour belongs on the
   primary button, a ticked box, a filled bar and status only.
4. Verify per `references/verify.md`. Minimum: `.bg-card` reports 5 box-shadow layers with an
   `inset` rim plus `backdrop-filter: blur(26px)`, and toggling `.dark` changes `--background`.

## Regenerating

```bash
node scripts/build-tint.mjs      # rewrite assets/tint-presets.css from tint-engine.mjs
node scripts/build-preview.mjs   # rewrite assets/preview.html from the three CSS files
node scripts/verify-engine.mjs   # diff tint-engine.mjs against upstream options.ts — must print PASS
```

Run `verify-engine.mjs` after any change to `scripts/tint-engine.mjs` or after replacing
`assets/upstream/options.ts` with a newer upstream copy. It needs Node ≥ 22.6 to execute the
TypeScript original; on older Node it prints `skipped` and changes nothing.

## Resources

- `assets/solid-glass.css` — upstream theme, verbatim. Keep the MIT notice.
- `assets/tint-presets.css` — generated tuning classes (8 base colours × 4 thicknesses, 17 accent hues, 17 chart hues, rim, shadow, blur, radius).
- `assets/theme-shim.css` — plain-CSS stand-in for the Tailwind utilities the theme expects.
- `assets/preview.html` — offline knob playground and copy-paste markup reference.
- `assets/upstream/` — `options.ts` (the tuning source of truth), the 13 component `.tsx` files, `LICENSE.solid-glass`.
- `scripts/` — `tint-engine.mjs` (ported logic), `build-tint.mjs`, `build-preview.mjs`, `verify-engine.mjs`.
- `references/` — `knobs.md`, `react-project.md`, `offline-html.md`, `verify.md`.

Upstream: `github.com/deeplethe/solid-glass` @ commit `6e8903e` (2026-10-16). On networks
where GitHub raw is blocked, `codeload.github.com` and `api.github.com` usually still work.
