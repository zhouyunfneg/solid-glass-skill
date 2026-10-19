#!/usr/bin/env node
/*
 * Regenerates assets/preview.html — a self-contained, offline knob playground:
 * solid-glass.css + tint-presets.css + theme-shim.css are inlined, so the file
 * opens anywhere with no network and no build step. Use it to pick a look, then
 * copy the class list off the bar into your real page.
 *
 *   node scripts/build-preview.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CHOICES } from "./tint-engine.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const A = join(HERE, "..", "assets");
const read = (f) => readFileSync(join(A, f), "utf8");

const css = `${read("solid-glass.css")}\n/* ---- tint-presets.css ---- */\n${read("tint-presets.css")}\n/* ---- theme-shim.css ---- */\n${read("theme-shim.css")}`;

/* only classes that actually exist as blocks — so the printed class list stays copy-paste clean */
const emitted = [...new Set((read("tint-presets.css").match(/^\.[a-z-]+/gm) || []).map((s) => s.slice(1)))];

/* knob → class prefix; `none` values write no class (that is upstream's default) */
const KNOBS = [
  { key: "tint", prefix: "sg-tint", label: "底色", names: { neutral: "中性", cool: "石板蓝", warm: "暖石", zinc: "锌灰", mist: "雾", olive: "橄榄", taupe: "灰褐", mauve: "藕紫" } },
  { key: "accent", prefix: "sg-accent", label: "强调色", none: "ink", names: { red: "红", orange: "橙", amber: "琥珀", yellow: "黄", lime: "青柠", green: "绿", emerald: "翠绿", teal: "蓝绿", cyan: "青", sky: "天蓝", blue: "蓝", indigo: "靛蓝", violet: "紫罗兰", purple: "紫", fuchsia: "洋红", pink: "粉", rose: "玫红" } },
  { key: "chart", prefix: "sg-chart", label: "图表色", none: "neutral" },
  { key: "thickness", prefix: "sg-thick", label: "厚度", names: { thin: "更透", default: "默认", thick: "更厚", opaque: "实心" } },
  { key: "rim", prefix: "sg-rim", label: "边缘高光", names: { soft: "柔", default: "默认", bright: "亮" } },
  { key: "shadow", prefix: "sg-shadow", label: "投影", names: { none: "无", soft: "浅", default: "默认", deep: "深" } },
  { key: "blur", prefix: "sg-blur", label: "背景模糊", names: { none: "不糊", default: "默认", heavy: "更糊" } },
  { key: "radius", prefix: "sg-radius", label: "圆角", names: { none: "直角", small: "小", default: "默认", large: "大" } },
];
const zh = (k, v) => k.names?.[v] ?? v;

const bars = KNOBS.map((k) => {
  const values = CHOICES[k.key].values.filter((v) => !(k.none && v === k.none));
  return `<div class="sg-row sg-wrapline"><span class="sg-note sg-lab">${k.label}</span>${values
    .map((v) => `<button class="sg-chip" data-knob="${k.key}" data-val="${v}" aria-pressed="${v === CHOICES[k.key].default ? "true" : "false"}">${zh(k, v)}</button>`)
    .join("")}</div>`;
}).join("\n");

const depthCells = [
  { name: "平", cls: "sg-thick-thin sg-rim-soft sg-shadow-none" },
  { name: "柔", cls: "sg-thick-default sg-rim-soft sg-shadow-soft" },
  { name: "标准", cls: "sg-thick-default sg-rim-default sg-shadow-default" },
  { name: "强", cls: "sg-thick-thick sg-rim-bright sg-shadow-deep" },
].map((d) => `<div class="bg-card sg-col sg-cell ${d.cls}"><b>${d.name}</b><span class="sg-note">厚度 / 高光 / 投影不同，颜色相同</span>
  <span class="sg-row"><button data-slot="button" class="bg-primary glass-primary">按钮</button><span data-slot="badge" class="bg-secondary" data-variant="secondary">标签</span></span></div>`).join("");

const html = `<!doctype html>
<html lang="zh-CN" class="dark sg-tint-mauve sg-thick-default sg-rim-default sg-shadow-default">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Solid Glass 旋钮台</title>
<style>
/* 这一页内联了三份样式：solid-glass.css（上游原文，MIT © 2026 DeepLethe）、
   tint-presets.css 与 theme-shim.css（本仓库生成 / 补写）。
   重新生成：node scripts/build-preview.mjs
   页面里的业务文字是虚构示例，跟任何真实产品无关。 */
${css}

/* 只有这个演示页用到的排版 */
.sg-wrapline { flex-wrap: wrap; gap: 6px; }
.sg-lab { min-width: 62px; }
.sg-chip { padding: 4px 10px; border-radius: 999px; border: 1px solid transparent; background: var(--panel); cursor: pointer; font: inherit; font-size: 12.5px; color: var(--foreground); }
.sg-chip[aria-pressed="true"] { background: var(--primary); color: var(--primary-foreground); }
.bar { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; position: sticky; top: 0; z-index: 5; }
.grid { display: grid; grid-template-columns: 220px minmax(0, 1fr) 260px; gap: 14px; padding: 14px; align-items: start; }
.stack { display: flex; flex-direction: column; gap: 12px; }
.sg-cell { min-height: 96px; }
.strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 0 14px 14px; }
@media (max-width: 980px) { .grid, .strip { grid-template-columns: 1fr; } }
</style>
</head>
<body>

<div class="bar glass-panel">
  <div class="sg-row sg-between">
    <b>Solid Glass 旋钮台</b>
    <span class="sg-mono" id="out"></span>
    <span class="sg-spacer"></span>
    <button data-slot="button" id="mode">深色</button>
  </div>
  ${bars}
  <div class="sg-row"><span class="sg-note">没接的旋钮：</span><span class="sg-mono">font / heading / density</span><span class="sg-note">—— 24 款字体全是西文，汉字不受影响；字体文件在 npm 包里，本仓库不带</span></div>
</div>

<div class="grid">
  <aside class="glass-panel"><div data-slot="sidebar-inner" class="bg-sidebar sg-col">
    <span class="sg-note">项目 · 季度报表</span>
    <div class="sg-col">
      <span data-slot="button" class="bg-primary glass-primary">数据清洗任务</span>
      <span class="sg-row"><span class="sg-spacer"></span><span class="sg-note">12</span></span>
      <span>周报汇总</span><span>指标看板</span><span>导出 PDF</span>
    </div>
    <hr data-slot="separator">
    <span class="sg-note">最近用过</span>
    <span>异常检测</span><span>归档旧表</span>
  </div></aside>

  <main class="stack">
    <div class="sg-row" style="justify-content:flex-end">
      <div data-slot="bubble" data-variant="default"><span data-slot="bubble-content" class="glass-control">把这 8 个数据源统一到季度口径，出双周对比</span></div>
    </div>
    <section class="bg-card sg-col">
      <b>跑了 3 步 +7 −0</b>
      <button data-slot="button" class="glass-control" style="justify-content:space-between"><span>读了 8 张源表</span><span class="sg-note">›</span></button>
      <button data-slot="button" class="glass-control" style="justify-content:space-between"><span>生成季度汇总 ×8</span><span class="sg-note">›</span></button>
      <button data-slot="button" class="glass-control" style="justify-content:space-between"><span>写入 output/quarter/</span><span class="sg-note">›</span></button>
    </section>
    <section class="bg-card sg-col">
      <span style="color:var(--status-interrupted);font-weight:600">需要你决定</span>
      <span>8 张全部按新口径重算，还是先出 4 张给评审看？</span>
      <div class="sg-row">
        <button data-slot="button" class="bg-primary glass-primary">全部重算</button>
        <button data-slot="button" class="bg-secondary" data-variant="secondary">逐张核对</button>
        <button data-slot="button" data-variant="outline">先出 4 张</button>
      </div>
    </section>
    <section class="bg-card sg-col">
      <textarea data-slot="textarea" placeholder="继续跑，或者换个方向……"></textarea>
      <div class="sg-row">
        <span data-slot="badge" class="bg-secondary" data-variant="secondary">quarter_02.csv</span>
        <span data-slot="badge" data-variant="outline" class="sg-note">源表.zip · 60%</span>
        <span class="sg-spacer"></span>
        <span class="sg-mono" style="color:var(--chart-2)">▮▮</span><span class="sg-mono" style="color:var(--chart-4)">▮▮</span>
      </div>
    </section>
  </main>

  <div class="stack">
    <section class="bg-card sg-col">
      <b>后台任务</b>
      <div class="sg-row"><span style="width:7px;height:7px;border-radius:999px;background:var(--status-running)"></span>重算 4 张<span class="sg-spacer"></span><span class="sg-note">2m14s</span></div>
      <div class="sg-row"><span style="width:7px;height:7px;border-radius:999px;background:var(--status-done)"></span>批量导出 PDF<span class="sg-spacer"></span><span class="sg-note">18s</span></div>
    </section>
    <section class="bg-popover sg-col">
      <b>浮层（最厚的一层玻璃）</b>
      <div class="sg-row sg-between"><span>重新算这批</span><span class="sg-note">⌘ R</span></div>
      <div class="sg-row sg-between"><span>存为预设</span><span class="sg-note">⌘ S</span></div>
    </section>
  </div>
</div>

<div class="strip">${depthCells}</div>

<script>
const KNOBS = ${JSON.stringify(KNOBS.map((k) => ({ key: k.key, prefix: k.prefix, none: k.none ?? null, def: CHOICES[k.key].default })))};
const EMITTED = new Set(${JSON.stringify(emitted)});
const root = document.documentElement;
function apply(key, val) {
  const k = KNOBS.find((x) => x.key === key);
  root.classList.remove(...[...root.classList].filter((c) => c.startsWith(k.prefix + "-")));
  const cls = k.prefix + "-" + val;
  if (val !== k.none && EMITTED.has(cls)) root.classList.add(cls);
  document.querySelectorAll('.sg-chip[data-knob="' + key + '"]').forEach((b) => (b.ariaPressed = String(b.dataset.val === val)));
  out();
}
function out() {
  const cls = [...root.classList].filter((c) => c !== "dark").join(" ");
  document.getElementById("out").textContent = "<html class=\\"cls " + cls + "\\">";
}
document.querySelectorAll(".sg-chip").forEach((b) => b.addEventListener("click", () => apply(b.dataset.knob, b.dataset.val)));
document.getElementById("mode").addEventListener("click", function () {
  const dark = root.classList.toggle("dark");
  this.textContent = dark ? "深色" : "浅色";
});
/* 让按钮的选中状态跟 <html> 上真实的类一致（初始用的是藕紫） */
KNOBS.forEach((k) => {
  const on = [...root.classList].find((c) => c.startsWith(k.prefix + "-"));
  apply(k.key, on ? on.slice(k.prefix.length + 1) : k.def);
});
</script>
</body>
</html>`;

const target = join(A, "preview.html");
writeFileSync(target, html, "utf8");
console.log(`wrote assets/preview.html — ${Math.round(html.length / 1024)}KB，${KNOBS.length} 个旋钮已接`);
