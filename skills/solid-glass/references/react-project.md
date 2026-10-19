# React + Tailwind 4 + shadcn/ui projects

Solid Glass is one stylesheet that re-skins existing shadcn/ui components by their
`data-slot` attributes and the classes they already carry. No component source changes.

## Requirements

React 19, Tailwind CSS 4, shadcn/ui on Base UI. Check before promising anything:

```bash
grep -E '"(react|tailwindcss|shadcn)"' package.json
```

If the project is not on this stack, do not force it — use the no-Tailwind path in
`offline-html.md`, or keep only the layout ideas.

## Apply the theme

1. Copy `assets/solid-glass.css` into the project (e.g. `src/solid-glass.css`).
2. Import it **after** Tailwind and shadcn's own stylesheet:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "./solid-glass.css";
```

3. Delete the `:root { … }` and `.dark { … }` colour-variable blocks that
   `shadcn init` wrote — Solid Glass defines the same variable names, and the old
   block wins or loses by load order, which is how "half the page changed" bugs happen.
4. Dark mode follows `class="dark"` on `<html>` (same as upstream).

## Optional: the tuning classes

`assets/tint-presets.css` adds the 11-knob classes (`sg-tint-*`, `sg-thick-*`,
`sg-rim-*`, `sg-shadow-*`, `sg-blur-*`, `sg-radius-*`, `sg-accent-*`, `sg-chart-*`).
Load it after `solid-glass.css` and put classes on `<html>`:

```html
<html class="dark sg-tint-mauve sg-thick-default sg-rim-default sg-shadow-default">
```

Absence of a class is upstream's default. In a Tailwind project you can equally set the
variables in CSS instead — the classes are just pre-computed values.

## Optional: the 14 registry items

`registry.json` upstream has 14 items (its README badge says 13): the stylesheet plus 12
components (`ask-card`, `composer`, `context-ring`, `diff-view`, `dot-loader`, `panel`,
`reasoning`, `status-glyph`, `tag`, `task-notice`, `tool-steps`, `turn-status`) and one
block (`agent-workspace`).

```bash
npx shadcn@latest add deeplethe/solid-glass/<name>
```

The `github:owner/repo/name` form fetches from GitHub raw, which is blocked on some
networks. Fallback: the `.tsx` sources are copied at `assets/upstream/` — drop them into
`src/components/ui/` yourself. They need:

- `@/lib/utils` (`cn`) — every one of the 13 files
- `lucide-react` — 8 of them
- other shadcn parts (`button`, `popover`, `dropdown-menu`, `kbd`) and each other — install those first
- `@hugeicons/*`, `@tabler/*` are **not** required by these 13

## Verify

Follow `verify.md`. Minimum: the primary button must come back with an `inset 0 1px 0 …`
box-shadow and a `backdrop-filter`, and a `.bg-card` element must show 5 shadow layers.
