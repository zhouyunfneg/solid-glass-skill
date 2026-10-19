# The 11 knobs

Upstream `src/create/options.ts` (copied at `assets/upstream/options.ts`) is the authority.
`scripts/tint-engine.mjs` is a plain-JS port of it; `scripts/verify-engine.mjs` diffs the two.

| Knob | 中文 | Values | Writes | In tint-presets.css |
| --- | --- | --- | --- | --- |
| `tint` | 底色 | neutral, cool, warm, zinc, mist, olive, taupe, mauve | `--background --panel --card --popover` | `.sg-tint-*` (× thickness) |
| `thickness` | 厚度 | thin, default, thick, opaque | `--panel --card --popover` alphas; opaque also kills blur | `.sg-thick-*` |
| `rim` | 边缘高光 | soft, default, bright | `--glass-rim --glass-control-rim` | `.sg-rim-*` |
| `shadow` | 投影 | none, soft, default, deep | `--glass-shade --glass-contact --glass-lift` | `.sg-shadow-*` |
| `blur` | 背景模糊 | none, default, heavy | `--glass-blur --glass-blur-control` | `.sg-blur-*` |
| `radius` | 圆角 | none, small, default, large | `--radius --radius-control` | `.sg-radius-*` |
| `accent` | 强调色 | ink + 17 hues | `--primary --primary-foreground --sidebar-primary*` (+4 in dark) | `.sg-accent-*` |
| `chart` | 图表色 | neutral + 17 hues | `--chart-1…5` | `.sg-chart-*` |
| `density` | 间距松紧 | compact, default, roomy | `--spacing` (a Tailwind variable) | ❌ not emitted |
| `font` | 正文字体 | 24 faces | `--font-sans` | ❌ not emitted |
| `heading` | 标题字体 | 24 faces | `--font-heading` | ❌ not emitted |

`font`/`heading` are left out on purpose: every one of the 24 stacks is Latin-only (Chinese
falls back to the system face either way) and the files live in `@fontsource/*` npm
packages the skill does not carry. Set the three variables by hand if the real fonts exist.

## Upstream's own presets

`STYLES` in options.ts ships six looks — copy them as starting points:

| Preset | Options |
| --- | --- |
| Solid Glass | all defaults |
| Graphite | `thick + cool + small radius + soft rim + inter` |
| Paper | `opaque + warm + small radius + soft shadow + serif faces` |
| Terminal | `olive + green accent/chart + no radius + no blur + compact + mono` |
| Soft | `mauve + violet accent/chart + large radius + bright rim + roomy + nunito` |
| Signal | `taupe + orange accent + amber chart + deep shadow + space-grotesk` |

## Four rules that keep it one material

Quoted from the head comment of `solid-glass.css` — break these and it stops being Solid Glass:

1. **The finish is at the edge.** Rim + hairline + shadow, never a gradient across the face.
2. **Heavy, not airy.** Neutral grey; the blur softens what is behind without boosting its colour.
3. **Depth is thickness.** panel (thinnest) < card < popover (thickest). Thicker is more opaque.
4. **One state.** Hovered, chosen and held-open all wear the same small pane of clear glass.

So: don't paint the panel faces with the accent colour, don't add drop-shadow gradients, and
don't make a hovered element change hue. Colour belongs on the primary button, a ticked box,
a filled bar, and status.
