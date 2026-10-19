/*
 * Plain-JS port of the tuning logic in Solid Glass's `src/create/options.ts`
 * (upstream copy kept at assets/upstream/options.ts, MIT © 2026 DeepLethe).
 *
 * Why a port: the upstream file is TypeScript and needs Node with type
 * stripping; this one runs anywhere Node runs, so the skill works on any
 * machine. `scripts/verify-engine.mjs` diffs this file against the upstream
 * source to prove the numbers still match.
 *
 * Every function returns ONLY the CSS custom properties that differ from the
 * defaults already inside solid-glass.css — same contract as upstream.
 */

export const TINT = {
  neutral: { dark: { c: 0, h: 0 }, light: { c: 0.005, h: 265 } },
  cool: { dark: { c: 0.014, h: 262 }, light: { c: 0.014, h: 262 } },
  warm: { dark: { c: 0.011, h: 70 }, light: { c: 0.012, h: 80 } },
  zinc: { dark: { c: 0.007, h: 286 }, light: { c: 0.008, h: 286 } },
  mist: { dark: { c: 0.014, h: 205 }, light: { c: 0.014, h: 205 } },
  olive: { dark: { c: 0.014, h: 125 }, light: { c: 0.016, h: 120 } },
  taupe: { dark: { c: 0.012, h: 40 }, light: { c: 0.013, h: 45 } },
  mauve: { dark: { c: 0.015, h: 320 }, light: { c: 0.015, h: 320 } },
};

const SHADES = {
  dark: { shade: ["0 0 0", 60], contact: ["0 0 0", 10], lift: ["0 0 0", 22] },
  light: { shade: ["0.3 0.06 265", 28], contact: ["0.25 0.03 265", 6], lift: ["0.25 0.03 265", 14] },
};
const SHADOW = { none: 0, soft: 0.5, deep: 1.7 };
export const DENSITY = { compact: "0.225rem", roomy: "0.28rem" };

const INK = {
  red: { light: [0.54, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  orange: { light: [0.72, 0.19, "dark"], dark: [0.62, 0.16, "white"] },
  amber: { light: [0.79, 0.165, "dark"], dark: [0.8, 0.165, "dark"] },
  yellow: { light: [0.79, 0.16, "dark"], dark: [0.8, 0.165, "dark"] },
  lime: { light: [0.79, 0.17, "dark"], dark: [0.8, 0.17, "dark"] },
  green: { light: [0.48, 0.13, "white"], dark: [0.58, 0.155, "white"] },
  emerald: { light: [0.48, 0.1, "white"], dark: [0.59, 0.125, "white"] },
  teal: { light: [0.49, 0.085, "white"], dark: [0.59, 0.105, "white"] },
  cyan: { light: [0.49, 0.085, "white"], dark: [0.59, 0.1, "white"] },
  sky: { light: [0.49, 0.1, "white"], dark: [0.6, 0.125, "white"] },
  blue: { light: [0.5, 0.16, "white"], dark: [0.61, 0.19, "white"] },
  indigo: { light: [0.51, 0.2, "white"], dark: [0.61, 0.19, "white"] },
  violet: { light: [0.52, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  purple: { light: [0.52, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  fuchsia: { light: [0.53, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  pink: { light: [0.54, 0.2, "white"], dark: [0.62, 0.19, "white"] },
  rose: { light: [0.54, 0.2, "white"], dark: [0.62, 0.19, "white"] },
};

const COLOURED_INK_DARK = {
  "--primary-rim": "oklch(1 0 0 / 30%)",
  "--primary-under": "oklch(0 0 0 / 40%)",
  "--primary-inner": "oklch(1 0 0 / 7%)",
  "--primary-edge": "oklch(0.2 0 0 / 30%)",
};

const PANES = {
  dark: { background: 0.16, card: [0.31, [30, 46, 68]], panel: [1, [3, 4.5, 7.5]], popover: [0.22, [86, 96, 99]], solid: [0.19, 0.225, 0.22] },
  light: { background: 0.925, card: [0.98, [40, 60, 82]], panel: [0.975, [28, 44, 64]], popover: [0.985, [86, 96, 99]], solid: [0.947, 0.958, 0.98] },
};

export const CHART_HUE = {
  red: 27, orange: 50, amber: 75, yellow: 98, lime: 128, green: 150, emerald: 163, teal: 183,
  cyan: 212, sky: 235, blue: 255, indigo: 275, violet: 293, purple: 307, fuchsia: 325, pink: 350, rose: 12,
};
const CHART_LIGHT = { dark: [0.94, 0.83, 0.69, 0.56, 0.44], light: [0.7, 0.55, 0.46, 0.38, 0.31] };
const CHART_CHROMA = { dark: [0.07, 0.13, 0.15, 0.13, 0.1], light: [0.15, 0.18, 0.16, 0.14, 0.12] };

const RADIUS = { none: ["0rem", "0rem"], small: ["0.5rem", "0.4rem"], large: ["1.125rem", "0.9rem"] };
const RIM = {
  soft: { dark: [8, 5], light: [55, 50] },
  bright: { dark: [32, 22], light: [100, 100] },
};

const colour = (l, tint, alpha) =>
  `oklch(${l} ${tint.c} ${tint.c ? tint.h : 0}${alpha === undefined ? "" : ` / ${alpha}%`})`;

function ink(hue, mode) {
  const h = CHART_HUE[hue];
  const [l, c, on] = INK[hue][mode];
  return { fill: `oklch(${l} ${c} ${h})`, on: on === "white" ? "oklch(0.985 0 0)" : `oklch(0.24 0.05 ${h})` };
}

/** Colour variables one theme takes for these options. Same contract as upstream `overrides()`. */
export function overrides(options, mode) {
  const vars = {};
  const tint = (TINT[options.tint] ?? TINT.neutral)[mode];
  const panes = PANES[mode];

  if (options.tint !== "neutral") vars["--background"] = colour(panes.background, tint);

  if (options.thickness !== "default" || options.tint !== "neutral") {
    if (options.thickness === "opaque") {
      vars["--panel"] = colour(panes.solid[0], tint);
      vars["--card"] = colour(panes.solid[1], tint);
      vars["--popover"] = colour(panes.solid[2], tint);
    } else {
      const at = ["thin", "default", "thick"].indexOf(options.thickness);
      vars["--panel"] = mode === "dark" ? `oklch(1 0 0 / ${panes.panel[1][at]}%)` : colour(panes.panel[0], tint, panes.panel[1][at]);
      vars["--card"] = colour(panes.card[0], tint, panes.card[1][at]);
      vars["--popover"] = colour(panes.popover[0], tint, panes.popover[1][at]);
    }
  }

  if (options.chart !== "neutral") {
    const h = CHART_HUE[options.chart];
    CHART_LIGHT[mode].forEach((l, index) => {
      vars[`--chart-${index + 1}`] = `oklch(${l} ${CHART_CHROMA[mode][index]} ${h})`;
    });
  }

  if (options.rim !== "default") {
    const [rim, control] = RIM[options.rim][mode];
    vars["--glass-rim"] = `oklch(1 0 0 / ${rim}%)`;
    vars["--glass-control-rim"] = `oklch(1 0 0 / ${control}%)`;
  }

  if (options.accent !== "ink") {
    const { fill, on } = ink(options.accent, mode);
    vars["--primary"] = fill;
    vars["--primary-foreground"] = on;
    vars["--sidebar-primary"] = fill;
    vars["--sidebar-primary-foreground"] = on;
    if (mode === "dark") Object.assign(vars, COLOURED_INK_DARK);
  }

  if (options.shadow !== "default") {
    const by = SHADOW[options.shadow];
    for (const name of ["shade", "contact", "lift"]) {
      const [black, alpha] = SHADES[mode][name];
      vars[`--glass-${name}`] = `oklch(${black} / ${Math.min(100, Math.round(alpha * by * 10) / 10)}%)`;
    }
  }

  return vars;
}

/** Variables that are the same in both themes: corners and blur. */
export function shared(options) {
  const vars = {};
  if (options.radius !== "default") {
    vars["--radius"] = RADIUS[options.radius][0];
    vars["--radius-control"] = RADIUS[options.radius][1];
  }
  if (options.blur === "none" || options.thickness === "opaque") {
    vars["--glass-blur"] = "none";
    vars["--glass-blur-control"] = "none";
  } else if (options.blur === "heavy") {
    vars["--glass-blur"] = "blur(48px) saturate(180%)";
    vars["--glass-blur-control"] = "blur(24px)";
  }
  return vars;
}

/** The one colour a look has, if it has one. */
export function wash(options, mode) {
  if (options.accent !== "ink") return ink(options.accent, mode).fill;
  if (options.chart !== "neutral") return `oklch(${mode === "dark" ? 0.72 : 0.6} 0.17 ${CHART_HUE[options.chart]})`;
  if (options.tint !== "neutral") return `oklch(0.62 0.09 ${TINT[options.tint][mode].h})`;
  return undefined;
}

/** Font stacks, ported from upstream `FONTS`. Latin-only: Chinese still falls back to the system face. */
const sans = (stack) => `${stack}, ui-sans-serif, system-ui, sans-serif`;
const serif = (stack) => `${stack}, ui-serif, Georgia, serif`;
const mono = (stack) => `${stack}, ui-monospace, SFMono-Regular, Menlo, monospace`;

export const FONTS = {
  geist: { name: "Geist", kind: "sans", family: sans('"Geist Variable"'), pack: null },
  system: { name: "System", kind: "sans", family: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif', pack: null },
  rounded: { name: "Rounded", kind: "sans", family: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif', pack: null },
  serif: { name: "Serif", kind: "serif", family: 'ui-serif, Georgia, "Times New Roman", serif', pack: null },
  mono: { name: "Geist Mono", kind: "mono", family: mono('"Geist Mono Variable"'), pack: null },
  inter: { name: "Inter", kind: "sans", family: sans('"Inter Variable"'), pack: "inter" },
  manrope: { name: "Manrope", kind: "sans", family: sans('"Manrope Variable"'), pack: "manrope" },
  figtree: { name: "Figtree", kind: "sans", family: sans('"Figtree Variable"'), pack: "figtree" },
  "dm-sans": { name: "DM Sans", kind: "sans", family: sans('"DM Sans Variable"'), pack: "dm-sans" },
  outfit: { name: "Outfit", kind: "sans", family: sans('"Outfit Variable"'), pack: "outfit" },
  "plus-jakarta-sans": { name: "Plus Jakarta Sans", kind: "sans", family: sans('"Plus Jakarta Sans Variable"'), pack: "plus-jakarta-sans" },
  "public-sans": { name: "Public Sans", kind: "sans", family: sans('"Public Sans Variable"'), pack: "public-sans" },
  "nunito-sans": { name: "Nunito Sans", kind: "sans", family: sans('"Nunito Sans Variable"'), pack: "nunito-sans" },
  "noto-sans": { name: "Noto Sans", kind: "sans", family: sans('"Noto Sans Variable"'), pack: "noto-sans" },
  roboto: { name: "Roboto", kind: "sans", family: sans('"Roboto Variable"'), pack: "roboto" },
  raleway: { name: "Raleway", kind: "sans", family: sans('"Raleway Variable"'), pack: "raleway" },
  "ibm-plex-sans": { name: "IBM Plex Sans", kind: "sans", family: sans('"IBM Plex Sans Variable"'), pack: "ibm-plex-sans" },
  "space-grotesk": { name: "Space Grotesk", kind: "sans", family: sans('"Space Grotesk Variable"'), pack: "space-grotesk" },
  lora: { name: "Lora", kind: "serif", family: serif('"Lora Variable"'), pack: "lora" },
  "source-serif-4": { name: "Source Serif 4", kind: "serif", family: serif('"Source Serif 4 Variable"'), pack: "source-serif-4" },
  "noto-serif": { name: "Noto Serif", kind: "serif", family: serif('"Noto Serif Variable"'), pack: "noto-serif" },
  merriweather: { name: "Merriweather", kind: "serif", family: serif('"Merriweather Variable"'), pack: "merriweather" },
  "playfair-display": { name: "Playfair Display", kind: "serif", family: serif('"Playfair Display Variable"'), pack: "playfair-display" },
  "jetbrains-mono": { name: "JetBrains Mono", kind: "mono", family: mono('"JetBrains Mono Variable"'), pack: "jetbrains-mono" },
};

const familyOf = (value) => (FONTS[value] ?? FONTS.geist).family;

/** Every knob, its choices and its upstream default — mirrors OPTIONS/DEFAULTS in options.ts. */
export const CHOICES = {
  tint: { label: "Base Color", values: Object.keys(TINT), default: "neutral" },
  thickness: { label: "Thickness", values: ["thin", "default", "thick", "opaque"], default: "default" },
  rim: { label: "Rim", values: ["soft", "default", "bright"], default: "default" },
  shadow: { label: "Shadow", values: ["none", "soft", "default", "deep"], default: "default" },
  blur: { label: "Blur", values: ["none", "default", "heavy"], default: "default" },
  radius: { label: "Radius", values: ["none", "small", "default", "large"], default: "default" },
  density: { label: "Density", values: ["compact", "default", "roomy"], default: "default" },
  accent: { label: "Accent", values: ["ink", ...Object.keys(CHART_HUE)], default: "ink" },
  chart: { label: "Chart Color", values: ["neutral", ...Object.keys(CHART_HUE)], default: "neutral" },
  font: { label: "Font", values: Object.keys(FONTS), default: "geist" },
  heading: { label: "Heading", values: Object.keys(FONTS), default: "geist" },
};

export const BASE = Object.fromEntries(Object.entries(CHOICES).map(([k, v]) => [k, v.default]));

/** Non-colour variables: the faces and the spacing. Same contract as upstream `theme()`. */
export function theme(options) {
  const vars = {};
  if (options.font !== "geist") vars["--font-sans"] = familyOf(options.font);
  if (options.heading !== options.font) vars["--font-heading"] = familyOf(options.heading);
  if (options.density !== "default") vars["--spacing"] = DENSITY[options.density];
  return vars;
}

/*
 * theme() writes --font-sans / --font-heading / --spacing, but those are NOT
 * baked into tint-presets.css: the webfont files live in npm packages
 * (@fontsource/*) this skill does not carry, and every face in FONTS is
 * Latin-only, so Chinese text is unaffected either way. Apply them by hand
 * when the real font files are present, e.g. <html style="--spacing: 0.225rem">
 * for a compact look. verify-engine.mjs checks these against upstream.
 */



