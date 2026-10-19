#!/usr/bin/env node
/*
 * Proves scripts/tint-engine.mjs still agrees with upstream options.ts.
 * Lifts the tuning code out of the TypeScript original at runtime and diffs
 * every combination build-tint.mjs uses, plus a random sample. Needs Node
 * >= 22.6 (built-in TypeScript type stripping); says "skipped" elsewhere.
 *
 *   node scripts/verify-engine.mjs
 */

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { overrides, shared, wash, theme, FONTS, DENSITY, BASE, CHOICES } from "./tint-engine.mjs";

const TINTS = CHOICES.tint.values;
const THICKNESS = CHOICES.thickness.values;
const HUES = CHOICES.accent.values.slice(1);
const RIMS = CHOICES.rim.values;
const SHADOWS = CHOICES.shadow.values;
const RADII = CHOICES.radius.values;
const BLURS = CHOICES.blur.values;

const HERE = dirname(fileURLToPath(import.meta.url));
const up = readFileSync(join(HERE, "..", "assets", "upstream", "options.ts"), "utf8");

/* 上游要用的两段：字体栈那段，和 TINT…theme 那段 */
const fontsBlock = up.slice(up.indexOf("const sans = "), up.indexOf("const HUES = "));
const tStart = up.indexOf("export const TINT");
const themeStart = up.indexOf("export function theme");
const tEnd = up.indexOf("\n}", themeStart) + 2;
if (tStart < 0 || themeStart < 0 || fontsBlock.length < 100) {
  console.log("FAIL  上游 options.ts 结构变了（字体栈 / TINT / theme 的分界找不到），需要重新移植");
  process.exit(1);
}
const tsSource =
  'export type Mode = "dark" | "light"\nexport type Options = Record<string, string>\n' +
  fontsBlock + "\n" + up.slice(tStart, tEnd);

const tmp = mkdtempSync(join(tmpdir(), "sg-verify-"));
const tsPath = join(tmp, "tint.ts");
writeFileSync(tsPath, tsSource, "utf8");

let ref;
try {
  ref = await import(pathToFileURL(tsPath).href);
} catch (error) {
  console.log(`skipped 跑不动上游 TypeScript（${error.code || error.message}）。需要 Node >= 22.6；tint-presets.css 里仍是同一套逻辑算出的值。`);
  process.exit(0);
}

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let checked = 0;
const bad = [];
const cmp = (label, opts) => {
  for (const mode of ["light", "dark"]) {
    for (const [name, mine, theirs] of [
      ["overrides", overrides(opts, mode), ref.overrides(opts, mode)],
      ["shared", shared(opts), ref.shared(opts)],
      ["wash", wash(opts, mode), ref.wash(opts, mode)],
      ["theme", theme(opts), ref.theme(opts)],
    ]) {
      checked++;
      if (!eq(mine, theirs) && bad.length < 5) bad.push(`${label} ${mode} ${name}\n   本地 ${JSON.stringify(mine)}\n   上游 ${JSON.stringify(theirs)}`);
    }
  }
};

for (const tint of TINTS) for (const thickness of THICKNESS) cmp(`tint=${tint} thickness=${thickness}`, { ...BASE, tint, thickness });
for (const rim of RIMS) cmp(`rim=${rim}`, { ...BASE, rim });
for (const shadow of SHADOWS) cmp(`shadow=${shadow}`, { ...BASE, shadow });
for (const accent of HUES) cmp(`accent=${accent}`, { ...BASE, accent });
for (const chart of HUES) cmp(`chart=${chart}`, { ...BASE, chart });
for (const radius of RADII) cmp(`radius=${radius}`, { ...BASE, radius });
for (const blur of BLURS) cmp(`blur=${blur}`, { ...BASE, blur });
for (const font of Object.keys(FONTS)) for (const density of Object.keys(DENSITY)) cmp(`font=${font} density=${density}`, { ...BASE, font, heading: font, density });

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
for (let i = 0; i < 400; i++) {
  cmp(`随机#${i}`, {
    ...BASE, tint: pick(TINTS), thickness: pick(THICKNESS), rim: pick(RIMS), shadow: pick(SHADOWS),
    accent: pick(["ink", ...HUES]), chart: pick(["neutral", ...HUES]), radius: pick(RADII), blur: pick(BLURS),
    font: pick(Object.keys(FONTS)), heading: pick(Object.keys(FONTS)), density: pick(Object.keys(DENSITY)),
  });
}

/* 字体栈逐个对：上游是数组、本地是表，family 字符串必须一模一样 */
for (const f of ref.FONTS) {
  checked++;
  if (FONTS[f.value]?.family !== f.family && bad.length < 5) bad.push(`FONTS ${f.value}\n   本地 ${FONTS[f.value]?.family}\n   上游 ${f.family}`);
}

if (bad.length) {
  console.log(`FAIL  ${checked} 项比对，${bad.length} 项起不一致（最多列 5 条）：\n\n${bad.join("\n\n")}`);
  process.exit(1);
}
console.log(`PASS  本地移植与上游 options.ts 一致：${checked} 项比对，0 项不一致（${TINTS.length} 底色 / ${HUES.length} 色相 / ${THICKNESS.length} 厚度 / ${Object.keys(FONTS).length} 字体）`);
