# Verifying a Solid Glass page

Screenshots are usually unavailable here (the in-app browser reports
`NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`, viewport `0x0`). Read the styles the browser
actually computed instead — that proves the theme is doing the work, which is the point.

## Minimum checks

```js
() => {
  const card = document.querySelector(".bg-card");
  const cs = getComputedStyle(card);
  return {
    cardShadowLayers: cs.boxShadow.split(")").length - 1,          // expect 5
    hasRim: /inset/.test(cs.boxShadow),                            // true
    blur: cs.backdropFilter,                                       // blur(26px)
    primaryHasRim: /inset/.test(getComputedStyle(document.querySelector(".glass-primary")).boxShadow),
    cardVar: getComputedStyle(document.documentElement).getPropertyValue("--card").trim(),
    officialRules: document.styleSheets[0].cssRules.length,        // ~107 for solid-glass.css
  };
}
```

Then: toggle `.dark` on `<html>` and confirm `--background` and `--card` change; click a
knob chip and confirm the computed value moves; check the console is clean.

## Four ways to get a false result

1. **`loading="lazy"` in a hidden page.** Images never enter the viewport, so
   `naturalWidth` stays 0 and a perfectly good inline data-URI image looks broken.
   Don't lazy-load in single-file deliverables.
2. **CSS transitions in a hidden page.** Animation doesn't progress, so
   `getComputedStyle` keeps returning the *old* colour after a theme switch. Set
   `element.style.transition = "none"` before measuring.
3. **`prefers-reduced-transparency: reduce`.** If Windows has 设置 → 辅助功能 → 视觉效果 →
   透明效果 switched off, `solid-glass.css` itself turns every pane opaque and drops the
   blur. "It looks flat" is often this, not the skin — check before editing anything.
4. **Specificity when you hand-write a shim.** A baseline like `.strip .cell { --card: … }`
   (0,2,0) outranks a single-class knob block `.sg-rim-bright` (0,1,0) and silently wins.
   Keep baselines to the variables the knob blocks also set, or match their specificity.

## Performance

The stylesheet has 22 `backdrop-filter` uses. On integrated GPUs (and over remote desktop)
scrolling and animation can drop frames. Degrade with `sg-blur-none`, or
`sg-thick-opaque` (which also drops the blur by upstream's own rule), rather than rewriting
the theme.

## Don't

- Don't edit `solid-glass.css` in place. If a project must diverge, copy it, note the
  upstream commit in the file header, and keep the MIT notice.
- Don't hand-type colours that the knobs already produce — run `node scripts/build-tint.mjs`.
  `node scripts/verify-engine.mjs` must print `PASS` after any change to `tint-engine.mjs`
  or after pulling a new upstream `options.ts`.
- Don't ship without the attribution comment: the CSS and the derived values are
  MIT © 2026 DeepLethe, and the licence copy is at `assets/upstream/LICENSE.solid-glass`.
