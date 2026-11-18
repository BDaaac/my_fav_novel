import type { Theme } from "./world";

export type Variant = "noir" | "ink" | "pixel" | "onebit";

export const VARIANTS: { id: Variant; label: string; note: string }[] = [
  { id: "noir", label: "Нуар ар-деко", note: "Векторные силуэты, латунь и тёплый свет ламп" },
  { id: "ink", label: "Чернила на бумаге", note: "Дрожащая линия, штриховка, как иллюстрация в книге" },
  { id: "pixel", label: "Пиксель-арт", note: "Цветные пиксели, ретро-игра" },
  { id: "onebit", label: "1-бит", note: "Чёрно-белый дизеринг в духе World of Horror" },
];

const noir: Theme = {
  name: "noir",
  wall: "#1c1311", wallLine: "#33241a", wallDark: "#120c0a", floor: "#0e0a09",
  carpet: "#4a0f14", carpetLine: "#7a2a22", brass: "#c9a227", brassDark: "#7a5f14",
  wood: "#2b1810", woodDark: "#170d08", glass: "#0f1e2a", sky: "#6fa8d8", cloud: "#eef4fa",
  light: "#ffd27a", ink: "#050404", screen: "#07131a", screenText: "#7fd4ff",
  glow: true, wobble: false, hatch: false,
};

const ink: Theme = {
  name: "ink",
  wall: "#ece2cc", wallLine: "#c8b893", wallDark: "#d9caa8", floor: "#e2d5b6",
  carpet: "#a8392c", carpetLine: "#7e2a20", brass: "#7a5a22", brassDark: "#4a3814",
  wood: "#8a6a4a", woodDark: "#5a4430", glass: "#f3eee2", sky: "#c9dce6", cloud: "#ffffff",
  light: "#fff2c4", ink: "#1b1612", screen: "#2a2420", screenText: "#efe6d2",
  glow: false, wobble: true, hatch: true,
};

const pixel: Theme = {
  ...noir,
  name: "pixel",
  wall: "#2e1f2a", wallLine: "#45303d", wallDark: "#1c1219", floor: "#140d12",
  carpet: "#8c1c24", carpetLine: "#c43a3a", brass: "#e8b84a", brassDark: "#9a6a1c",
  wood: "#5a3422", woodDark: "#2e1a12", glass: "#1d3b5a", sky: "#7ec0ee", light: "#ffe08a",
};

export const THEMES: Record<Variant, Theme> = { noir, ink, pixel, onebit: noir };
