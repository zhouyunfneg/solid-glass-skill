#!/usr/bin/env node
/*
 * Regenerates assets/tint-presets.css — the ready-made class blocks that carry
 * Solid Glass's 11 tuning knobs, with every value computed by tint-engine.mjs
 * (a port of upstream options.ts). Nothing here is hand-typed colour.
 *
 *   node scripts/build-tint.mjs            # write assets/tint-presets.css
 *   node scripts/build-tint.mjs --stdout   # print it instead of writing
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { overrides, shared, wash, BASE, CHOICES } from "./tint-engine.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(HERE, "..", "assets");

const TINTS = CHOICES.tint.values;
const THICKNESS = CHOICES.thickness.values;
const HUES = CHOICES.accent.values.slice(1); // 去掉 "ink"
const RIMS = CHOICES.rim.values;
const SHADOWS = CHOICES.shadow.values;
const RADII = CHOICES.radius.values;
const BLURS = CHOICES.blur.values;

const rules = [];
let count = 0;

/* Defaults, read straight out of solid-glass.css. Emitting them as explicit
   classes lets one element restate a look on its own — a nested comparison
   card then carries no value inherited from <html>. */
const themeCss = readFileSync(join(ASSETS, "solid-glass.css"), "utf8");
const blockOf = (name) => {
  const m = themeCss.match(new RegExp(`(?:^|\\n)${name} \\{([\\s\\S]*?)\\n\\}`));
  const out = {};
  if (m) for (const line of m[1].split("\n")) {
    const d = line.match(/^\s*(--[a-z0-9-]+):\s*(.+?);\s*$/);
    if (d) out[d[1]] = d[2];
  }
  return out;
};
const lightDefaults = blockOf(":root"), darkDefaults = blockOf(".dark");
const DECL = {
  tint: ["--background", "--panel", "--card", "--popover"],
  thick: ["--panel", "--card", "--popover"],
  rim: ["--glass-rim", "--glass-control-rim"],
  shadow: ["--glass-shade", "--glass-contact", "--glass-lift"],
};
for (const [cls, keys] of [["sg-tint-neutral", DECL.tint], ["sg-thick-default", DECL.thick], ["sg-rim-default", DECL.rim], ["sg-shadow-default", DECL.shadow]]) {
  const take = (src) => Object.fromEntries(keys.filter((k) => src[k]).map((k) => [k, src[k]]));
  const decl = (vars) => Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n");
  rules.push(`.${cls} {\n${decl(take(lightDefaults))}\n}`);
  rules.push(`html.dark .${cls},\n.${cls}.dark {\n${decl(take(darkDefaults))}\n}`);
  count += 2;
}


/* One block: light values under `sel`, dark values under `sel.dark` + `html.dark sel`,
   so the same class works on <html> and on a nested comparison card. */
function pair(sel, options) {
  const light = overrides(options, "light");
  const dark = overrides(options, "dark");
  const decl = (vars) => Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n");
  if (Object.keys(light).length) {
    rules.push(`${sel} {\n${decl(light)}\n}`);
    count++;
  }
  if (Object.keys(dark).length) {
    rules.push(`html.dark ${sel},\n${sel}.dark {\n${decl(dark)}\n}`);
    count++;
  }
  const sh = shared(options);
  if (Object.keys(sh).length) {
    rules.push(`${sel} {\n${decl(sh)}\n}`);
    count++;
  }
}

/* 1. Base Color × Thickness — upstream computes these together, so they stay paired. */
for (const tint of TINTS) {
  for (const thickness of THICKNESS) {
    const single = thickness === "default" ? `.sg-tint-${tint}` : `.sg-tint-${tint}.sg-thick-${thickness}`;
    pair(single, { ...BASE, tint, thickness });
    if (tint === "neutral" && thickness !== "default") pair(`.sg-thick-${thickness}`, { ...BASE, thickness });
  }
}
/* 2. Rim / Shadow — depend on the theme mode only, never on the colour. */
for (const rim of RIMS.filter((r) => r !== "default")) pair(`.sg-rim-${rim}`, { ...BASE, rim });
for (const shadow of SHADOWS.filter((s) => s !== "default")) pair(`.sg-shadow-${shadow}`, { ...BASE, shadow });
/* 3. Accent and Chart colour — 18 hues each, independent of the base colour. */
for (const accent of HUES) pair(`.sg-accent-${accent}`, { ...BASE, accent });
for (const chart of HUES) pair(`.sg-chart-${chart}`, { ...BASE, chart });
/* 4. Radius / Blur / Density — same in both themes. */
for (const radius of RADII.filter((r) => r !== "default")) {
  const vars = shared({ ...BASE, radius });
  rules.push(`.sg-radius-${radius} {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`);
  count++;
}
for (const blur of BLURS.filter((b) => b !== "default")) {
  const vars = shared({ ...BASE, blur });
  rules.push(`.sg-blur-${blur} {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`);
  count++;
}
rules.push(`.sg-density-compact {\n  --spacing: 0.225rem;\n}\n.sg-density-roomy {\n  --spacing: 0.28rem;\n}`);
count += 2;

/* 5. Page glow: wash() gives each look its one colour; how strong each blob is stays a choice. */
const washLines = [];
for (const p of [
  { tint: "neutral", accent: "ink", chart: "neutral" },
  ...TINTS.filter((t) => t !== "neutral").map((t) => ({ tint: t, accent: "ink", chart: "neutral" })),
  ...HUES.map((h) => ({ tint: "neutral", accent: h, chart: h })),
]) {
  const key = [p.tint !== "neutral" && `sg-tint-${p.tint}`, p.accent !== "ink" && `sg-accent-${p.accent}`, p.chart !== "neutral" && `sg-chart-${p.chart}`].filter(Boolean).join(".");
  if (!key) continue;
  const light = wash({ ...BASE, ...p }, "light");
  const dark = wash({ ...BASE, ...p }, "dark");
  const glow = (w) => ["--light-1: 30%", "--light-2: 20%", "--light-3: 16%"]
    .map((step) => { const [name, pct] = step.split(": "); return `  ${name}: color-mix(in oklch, ${w} ${pct}, transparent);`; }).join("\n");
  washLines.push(`.${key} {\n${glow(light)}\n}\nhtml.dark .${key},\n.${key}.dark {\n${glow(dark)}\n}`);
}
count += washLines.length * 2;

const header = `/*
 * Solid Glass tuning classes — GENERATED by scripts/build-tint.mjs, do not edit by hand.
 * Every value comes from tint-engine.mjs, a plain-JS port of upstream
 * src/create/options.ts (MIT © 2026 DeepLethe). Nothing here is a hand-typed colour.
 *
 * Use: load solid-glass.css first, then this file, then put classes on <html>
 * (or on any element, to compare looks side by side):
 *   <html class="dark sg-tint-mauve sg-thick-thin sg-rim-bright sg-shadow-deep sg-accent-violet">
 * Absence of a class = Solid Glass's own default. Mode follows \`.dark\` on <html>, as upstream.
 * The page-glow blocks (--light-1/2/3) are ours; upstream's Create page picks its glow by hand.
 */
`;

const css = `${header}\n${rules.join("\n\n")}\n\n/* ---- page glow ---- */\n\n${washLines.join("\n\n")}\n`;

if (process.argv.includes("--stdout")) {
  process.stdout.write(css);
} else {
  writeFileSync(join(ASSETS, "tint-presets.css"), css, "utf8");
}
console.log(`${process.argv.includes("--stdout") ? "printed" : "wrote assets/tint-presets.css"} — ${count} 个规则块, ${Math.round(css.length / 1024)}KB`);
