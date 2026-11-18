import type { Variant } from "./themes";

/** Классы интерфейса (окна, HUD, кнопки) под каждый стиль. */
export type Skin = {
  page: string;
  panel: string;
  title: string;
  body: string;
  muted: string;
  btn: string;
  btnDanger: string;
  system: string;
  prompt: string;
  chip: string;
};

export const SKINS: Record<Variant, Skin> = {
  noir: {
    page: "bg-[#070605] text-[#efe6d2]",
    panel: "rounded-lg border border-[#c9a227]/35 bg-[#0d0a09]/95 shadow-[0_0_60px_-10px_rgba(201,162,39,0.35)] backdrop-blur",
    title: "font-display text-3xl text-[#e7c76a]",
    body: "text-[15px] leading-relaxed text-[#e9dfc9]",
    muted: "text-[#a89a80]",
    btn: "rounded-md border border-[#c9a227]/50 px-3 py-1.5 text-sm text-[#e7c76a] transition hover:bg-[#c9a227]/15",
    btnDanger: "rounded-md border border-[#c0333d] bg-[#c0333d]/20 px-3 py-1.5 text-sm text-[#ff8a8a] hover:bg-[#c0333d]/40",
    system: "rounded-md border border-[#7fd4ff]/45 bg-[#06141c]/85 font-system text-[#7fd4ff] shadow-[0_0_24px_-6px_#7fd4ff]",
    prompt: "rounded-md border border-[#c9a227]/50 bg-black/75 px-2.5 py-1 font-system text-xs text-[#e7c76a]",
    chip: "rounded border border-[#c9a227]/30 px-2 py-1",
  },
  ink: {
    page: "bg-[#d9ccb0] text-[#1b1612]",
    panel: "rounded-none border-2 border-[#1b1612] bg-[#f3ead6] shadow-[6px_6px_0_#1b1612] -rotate-[0.4deg]",
    title: "font-display text-3xl italic text-[#1b1612]",
    body: "text-[16px] leading-relaxed text-[#2a2420] font-display",
    muted: "text-[#6b5d4c]",
    btn: "border-2 border-[#1b1612] px-3 py-1 text-sm text-[#1b1612] hover:bg-[#1b1612] hover:text-[#f3ead6]",
    btnDanger: "border-2 border-[#a8392c] px-3 py-1 text-sm text-[#a8392c] hover:bg-[#a8392c] hover:text-[#f3ead6]",
    system: "border-2 border-[#1f4e79] bg-[#e8eef0] font-system text-[#1f4e79] shadow-[4px_4px_0_#1f4e79]",
    prompt: "border-2 border-[#1b1612] bg-[#f3ead6] px-2 py-0.5 font-display text-sm italic text-[#1b1612]",
    chip: "border border-[#1b1612]/50 px-2 py-1",
  },
  pixel: {
    page: "bg-[#0c070b] text-[#f1e6cf]",
    panel: "rounded-none border-4 border-[#e8b84a] bg-[#1c1219] shadow-[6px_6px_0_#000] font-system",
    title: "font-system text-xl uppercase tracking-widest text-[#e8b84a]",
    body: "font-system text-[13px] leading-relaxed text-[#f1e6cf]",
    muted: "text-[#a8879a]",
    btn: "border-2 border-[#e8b84a] bg-[#2e1f2a] px-3 py-1 font-system text-xs uppercase text-[#e8b84a] shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
    btnDanger: "border-2 border-[#c43a3a] bg-[#8c1c24] px-3 py-1 font-system text-xs uppercase text-white shadow-[3px_3px_0_#000]",
    system: "border-2 border-[#7ec0ee] bg-[#0b1a2a] font-system text-[#7ec0ee] shadow-[4px_4px_0_#000]",
    prompt: "border-2 border-[#e8b84a] bg-[#1c1219] px-2 py-0.5 font-system text-[11px] uppercase text-[#e8b84a]",
    chip: "border-2 border-[#45303d] px-2 py-1",
  },
  onebit: {
    page: "bg-[#111111] text-[#e9e1d0]",
    panel: "rounded-none border-2 border-[#e9e1d0] bg-[#111111] shadow-[5px_5px_0_#e9e1d0] font-system",
    title: "font-system text-xl uppercase tracking-[0.2em] text-[#e9e1d0]",
    body: "font-system text-[13px] leading-relaxed text-[#e9e1d0]",
    muted: "text-[#8d877a]",
    btn: "border-2 border-[#e9e1d0] px-3 py-1 font-system text-xs uppercase text-[#e9e1d0] hover:bg-[#e9e1d0] hover:text-[#111]",
    btnDanger: "border-2 border-dashed border-[#e9e1d0] bg-[#e9e1d0] px-3 py-1 font-system text-xs uppercase text-[#111]",
    system: "border-2 border-[#e9e1d0] bg-[#111] font-system text-[#e9e1d0]",
    prompt: "border-2 border-[#e9e1d0] bg-[#111] px-2 py-0.5 font-system text-[11px] uppercase text-[#e9e1d0]",
    chip: "border border-dashed border-[#e9e1d0]/60 px-2 py-1",
  },
};
