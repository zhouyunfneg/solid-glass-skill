# solid-glass-skill

给 AI 编程智能体用的前端皮肤 skill：让它在给你做网页、内部工具、仪表盘、单文件演示页时，
默认套上 [Solid Glass](https://github.com/deeplethe/solid-glass) 那套"厚玻璃"质感，
而不是浏览器的默认样式。

仓库里带上游样式表原文、11 个调节旋钮生成的 CSS 类、一份脱离 Tailwind 用的补丁 CSS、
一个离线旋钮台，以及上游 13 个 React 组件源码。

**30 秒上手**

```bash
# 1. 取到本机
git clone https://github.com/zhouyunfneg/solid-glass-skill.git

# 2. 把技能目录拷进你所用智能体的用户技能目录（见下表）
cp -R solid-glass-skill/skills/solid-glass ~/.qoder-cn/skills/

# 3. 重启会话或执行 /skills reload，然后直接说：
#    "给这个页面套上 solid-glass 的质感"
```

| 你在用什么 | 技能目录 |
| --- | --- |
| Qoder CN | `~/.qoder-cn/skills/solid-glass/` |
| Qoder（国际版） | `~/.qoder/skills/solid-glass/` |
| 其他智能体 | 用它自己的"用户技能/指令"目录；装错地方不会报错，只是技能列表里不出现 |

只想手动用、不装 skill 也行：`skills/solid-glass/assets/preview.html` 是一个断网可开的单文件，
挑好旋钮后把顶上那行 `<html class="…">` 抄走即可。

## 它解决什么

Solid Glass 是 shadcn/ui 的一层皮肤：不透明度高、几乎不透底的灰面，玻璃感只画在**边缘**
（顶上一道亮线、四周一条细线、底下一层收住的影子）。它和常见"毛玻璃"的区别就是**字不糊**——
所以适合信息密度高、要长时间盯着看的界面。

```html
<html class="dark sg-tint-mauve sg-thick-default sg-rim-default sg-shadow-default">
```

## 11 个旋钮

上游 `src/create/options.ts` 定义了 11 项可调，本仓库把其中 8 项预生成成了 CSS 类
（`assets/tint-presets.css`，218 个规则块）：

| 旋钮 | 中文 | 取值 | 类名 |
| --- | --- | --- | --- |
| `tint` | 底色 | 8 档（中性 / 石板蓝 / 暖石 / 锌灰 / 雾 / 橄榄 / 灰褐 / 藕紫） | `.sg-tint-*` |
| `thickness` | 厚度 | 更透 / 默认 / 更厚 / 实心 | `.sg-thick-*` |
| `rim` | 边缘高光 | 柔 / 默认 / 亮 | `.sg-rim-*` |
| `shadow` | 投影 | 无 / 浅 / 默认 / 深 | `.sg-shadow-*` |
| `blur` | 背景模糊 | 不糊 / 默认 / 更糊 | `.sg-blur-*` |
| `radius` | 圆角 | 直角 / 小 / 默认 / 大 | `.sg-radius-*` |
| `accent` | 强调色 | ink + 17 色相 | `.sg-accent-*` |
| `chart` | 图表色 | 17 色相 | `.sg-chart-*` |
| `font` / `heading` | 字体 | 24 款 | ❌ 未生成，见下 |
| `density` | 间距松紧 | 3 档 | ❌ 未生成 |

**字体那三项为什么空着**：24 款字体全是西文，中文界面里汉字照样退回系统字体，看不出差别；
字体文件又在 `@fontsource/*` npm 包里，本仓库不带。需要的话自己写
`--font-sans` / `--font-heading` / `--spacing` 三个变量即可。

不写任何类 = 上游默认值。缺哪个类就不生效，不会报错。

## 两条使用路径

- **React 19 + Tailwind 4 + shadcn/ui 项目**：`@import` 顺序、要删掉 shadcn 生成的配色变量块、
  13 个组件怎么装 → 见 `skills/solid-glass/references/react-project.md`。
- **纯 HTML / 单文件 / 无构建**：Solid Glass 只画边缘，填充、圆角、控件尺寸原本由 Tailwind 生成，
  所以要配一份 `theme-shim.css`；还要在面板背后打两片"光"，否则玻璃和扁平看不出区别
  → 见 `skills/solid-glass/references/offline-html.md`。

两条路的判断标准写在 `SKILL.md` 里，智能体会自己选。

## 这些数值是怎么来的（以及怎么核对）

`scripts/tint-engine.mjs` 是上游 `options.ts` 里那段调色逻辑的纯 JS 移植，
`scripts/build-tint.mjs` 用它生成 `tint-presets.css`——**没有一个颜色是手填的**。

```bash
node scripts/verify-engine.mjs   # 把上游 TypeScript 跑起来逐组对比
# PASS  本地移植与上游 options.ts 一致：4248 项比对，0 项不一致（8 底色 / 17 色相 / 4 厚度 / 24 字体）
```

需要 Node ≥ 22.6（要执行上游 TypeScript）。用 CSS 和旋钮台本身不需要任何依赖。
上游 `options.ts` 换了版本，重跑这两个脚本即可。

## 验收怎么做

`skills/solid-glass/references/verify.md` 记了本项目实测有效的办法和四个"假结果"来源：
截图接口经常拿不到画面 → 改成读浏览器算出来的样式；`loading="lazy"` 和 CSS `transition`
在隐藏窗口里会给出假结论；Windows 关掉"透明效果"时上游 CSS 会主动把面板变成不透明
（那不是皮肤坏了）。

## 注意

- **性能**：样式表里有 22 处 `backdrop-filter`。核显机器和远程桌面上滚动可能掉帧，
  用 `.sg-blur-none` 或 `.sg-thick-opaque` 降级，别改样式表本体。
- **浅色模式**：只有文字没有边框的控件（ghost 按钮、未选中的标签）在 12–13px 下对比度偏低，
  上线前单独看一眼。
- **别改 `solid-glass.css` 本体**：要分叉就复制一份，在文件头记下上游 commit，并保留 MIT 声明。

## 许可与出处

- 本仓库自己写的代码与文档：MIT，见 `LICENSE`。
- `skills/solid-glass/assets/solid-glass.css`、`assets/upstream/` 下的 `options.ts` 与 13 个
  `.tsx`：MIT License, Copyright (c) 2026 **DeepLethe**，原文见
  `skills/solid-glass/assets/upstream/LICENSE.solid-glass`，出处见 `NOTICE.md`。
  上游仓库：<https://github.com/deeplethe/solid-glass>（本仓库内容取自 commit `6e8903e`）。
- 演示页里的业务文字（季度报表、数据清洗等）是虚构示例，与任何真实产品无关。

## English

A skill package that makes an AI coding agent build web UIs in the
[Solid Glass](https://github.com/deeplethe/solid-glass) material theme instead of
browser defaults. It ships the upstream stylesheet, 218 generated CSS blocks covering
8 of its 11 tuning knobs, a plain-CSS shim for pages without Tailwind, an offline
playground (`assets/preview.html`), and the 13 upstream React components. Every colour
value is computed by a plain-JS port of upstream's `options.ts`, and
`scripts/verify-engine.mjs` diffs that port against the TypeScript original
(4248 comparisons, 0 mismatches). Install by copying `skills/solid-glass/` into your
agent's user-skills directory. MIT; upstream code stays © 2026 DeepLethe.
