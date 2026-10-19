# Plain HTML, no Tailwind, no build step

This is how to get the material into a single-file page (demos, internal tools, reports).
`assets/preview.html` is a working example of everything below — open it, or copy from it.

## Load order

```html
<style>/* solid-glass.css verbatim */</style>
<style>/* tint-presets.css — optional knobs */</style>
<style>/* theme-shim.css — the Tailwind stand-in */</style>
<style>/* your layout */</style>
<html class="dark sg-tint-mauve …">
```

## What the theme needs that Tailwind would have provided

`solid-glass.css` only draws edges. Three things break silently without Tailwind:

1. **Fills.** `.bg-card`, `.bg-popover`, `.bg-sidebar`, `.bg-primary`, `.bg-secondary`,
   `.bg-muted` are *styled* by the theme but their `background-color` comes from Tailwind
   utilities. `theme-shim.css` supplies them from the same variables.
2. **Corners and sizes.** The theme's rules key off `.rounded-lg` and `[data-slot=…]`;
   padding, height and font size are yours.
3. **Base layer.** The `@layer base { * { @apply … } }` block is dropped by browsers
   (`@apply` is Tailwind syntax), so set body colour, background and font family yourself.

Two Tailwind-only at-rules in the file are skipped harmlessly — `@theme inline` and
`@custom-variant`. That means the `--color-*` tokens and `--radius-md` inside `@theme`
**do not exist**: use `var(--radius)` and `var(--radius-control)` (defined in `:root`).

## Surfaces are keyed by colour class, not by `data-slot`

There is no `[data-slot="card"]` rule. To get a pane, use the class:

| Want | Write |
| --- | --- |
| page column / section background | `<div class="glass-panel">` |
| card | `<section class="bg-card rounded-lg">` |
| menu / tooltip / dialog | `<div class="bg-popover rounded-lg">` |
| sidebar | `<div class="bg-sidebar" data-slot="sidebar-inner">` |
| small clear control (chip, bubble, step row) | `class="glass-control"` |
| the one solid button | `class="bg-primary glass-primary"` |

`[data-slot]` names the theme actually styles: `button` (with `data-variant="secondary|
outline|destructive|ghost"`), `badge`, `input`, `textarea`, `select-trigger`,
`input-group`, `toggle`, `toggle-group-item`, `tabs-list` + `tabs-trigger[data-active]`,
`bubble` + `bubble-content`, `tooltip-content`, `separator`, `calendar`, `slider-range`,
`switch`, `field-separator-content`, `questionnaire-*`, `sidebar-*`, `resizable-handle`.
Anything else gets no material — it just looks flat.

## The glass needs something behind it

`--panel` / `--card` are translucent (dark card is 46% opaque). On a flat page the blur is
invisible and everything reads as a plain grey box. Put the theme's own lights behind it:

```css
body {
  background-image:
    radial-gradient(52rem 30rem at 12% -6%, var(--light-1), transparent 70%),
    radial-gradient(46rem 30rem at 92% 8%, var(--light-2), transparent 72%),
    radial-gradient(60rem 34rem at 60% 108%, var(--light-3), transparent 70%);
  background-attachment: fixed;
}
```

`sg-tint-*` / `sg-accent-*` blocks in `tint-presets.css` already retint those three lights
using upstream's `wash()`; the strength (30% / 20% / 16%) is this skill's choice, not upstream's.

## Comparing looks side by side

Every block in `tint-presets.css` is emitted twice — `.sg-x` and `html.dark .sg-x, .sg-x.dark`
— so a class works on `<html>` **and** on a nested element. Give each comparison card its own
full class list (`sg-tint-neutral sg-thick-thin sg-rim-soft sg-shadow-none`) and it stops
inheriting the page's look.

## Chinese text

The 24 font stacks are Latin-only; Chinese falls back to the system face whatever you pick.
Light-theme controls that are text-only (ghost buttons, unselected tabs) have weak contrast
at small sizes — check them at 12–13px before shipping.
