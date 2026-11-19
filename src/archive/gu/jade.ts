/** Камень жетона по клану: свой цвет нефрита и иероглиф клана на оконце. */
export type Jade = { glyph: string; base: string; deep: string; hi: string; lo: string; line: string; ink: string };

const stone = (h: number, c: number, glyph: string, light = 0.62): Jade => ({
  glyph,
  base: `oklch(${light} ${c} ${h})`,
  deep: `oklch(${light - 0.2} ${c * 0.9} ${h})`,
  hi: `oklch(${Math.min(0.95, light + 0.2)} ${c * 0.6} ${h} / 0.75)`,
  lo: `oklch(${light - 0.08} ${c * 1.2} ${h + 10} / 0.6)`,
  line: `oklch(${light - 0.25} ${c} ${h} / 0.55)`,
  ink: `oklch(${light - 0.42} ${c * 0.8} ${h})`,
});

const CLANS: [RegExp, Jade][] = [
  [/Гу Юэ/i, stone(165, 0.09, "古月")], // зелёный нефрит
  [/Бай/i, stone(220, 0.025, "白", 0.8)], // белый нефрит
  [/Сюн/i, stone(65, 0.1, "熊", 0.66)], // медовый
  [/(^|\s)Т[еэ](\s|$)/i, stone(240, 0.03, "铁", 0.58)], // железный
  [/Цзя/i, stone(85, 0.11, "贾", 0.72)], // золотистый
  [/Журавл/i, stone(195, 0.05, "鹤", 0.74)], // секта Бессмертного Журавля
  [/Яо/i, stone(330, 0.06, "姚", 0.62)],
];
const ROGUE = stone(200, 0.02, "散", 0.42); // чёрный нефрит: одиночки и демонические

export const jadeOf = (clan: string) => CLANS.find(([re]) => re.test(clan))?.[1] ?? ROGUE;

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
export const NUM_HAN = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const ORD = ["первый", "второй", "третий", "четв", "пят", "шест", "седьм", "восьм", "девят"];
/** «Второй ранг, высшая стадия» → 2; «ранг 3» → 3; иначе 0. */
export function rankNo(rank: string) {
  const s = rank.toLowerCase();
  const d = s.match(/(\d)/);
  if (d) return +d[1];
  const i = ORD.findIndex((w) => s.includes(w));
  return i + 1;
}
