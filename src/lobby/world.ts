export const WORLD_W = 2400;
export const WORLD_H = 600;
export const FLOOR_Y = 540; // ноги гостя

export type HotspotId = "entrance" | "switch" | "sign" | "desk" | "displays" | "elevator" | "corridor";

export type Hotspot = { id: HotspotId; x: number; w: number; label: string };

export const HOTSPOTS: Hotspot[] = [
  { id: "entrance", x: 250, w: 260, label: "Парадный вход" },
  { id: "switch", x: 405, w: 40, label: "Выключатель" },
  { id: "sign", x: 525, w: 190, label: "Надпись на стене" },
  { id: "desk", x: 910, w: 420, label: "Стойка регистрации" },
  { id: "displays", x: 1340, w: 240, label: "Дисплеи" },
  { id: "elevator", x: 1720, w: 240, label: "Лифт" },
  { id: "corridor", x: 2170, w: 300, label: "Коридор 101–107" },
];

export type SceneState = {
  doorOpen: boolean;
  lightsOff: boolean;
  snacks: boolean;
  blink: boolean;
  burning: boolean;
};

export type Theme = {
  name: string;
  wall: string;
  wallLine: string;
  wallDark: string;
  floor: string;
  carpet: string;
  carpetLine: string;
  brass: string;
  brassDark: string;
  wood: string;
  woodDark: string;
  glass: string;
  sky: string;
  cloud: string;
  light: string;
  ink: string;
  screen: string;
  screenText: string;
  glow: boolean;
  wobble: boolean;
  hatch: boolean;
};
