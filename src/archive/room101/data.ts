import rooms from "@/data/rooms.json";
import characters from "@/data/characters.json";
import items from "@/data/items.json";
import type { Room } from "@/data/types";

const ALL = rooms as unknown as Room[];
export const RUN1 = ALL.find((r) => r.id === "101")!;
export const RUN2 = ALL.find((r) => r.id === "101-re")!;
export const RUN3 = ALL.find((r) => r.id === "101-media")!;

const NAMES = Object.fromEntries((characters as { id: string; name: string }[]).map((c) => [c.id, c.name]));
export const nameOf = (id: string) => NAMES[id] ?? id;
export const short = (id: string) => nameOf(id).split(" (")[0].split(" ").slice(-1)[0];

export const ITEMS_101 = (items as { id: string; name: string; owner: string | null; room: string; ch: number; effect: string }[]).filter(
  (i) => i.room === "101",
);

/** Кошмар каждого в первом заходе (гл. 6–10): «фото» и что за ним на самом деле. */
export const FAMILY_PHOTOS: { who: string; caption: string; family: number; truth: string; ch: string; escaped?: boolean }[] = [
  { who: "han-gain", caption: "Мама, папа и сестрёнка Хиган. Поездка в дендрарий", family: 3, truth: "Утки на обед живые. Память об отеле утекает. На склоне он раздевается, ведь «зима должна быть холодной», и замерзает.", ch: "гл. 6–7" },
  { who: "cha-jinchul", caption: "Наш чемпион! Победитель турнира", family: 2, truth: "Турнир был смертельным. Победителя застрелил мэр.", ch: "гл. 8" },
  { who: "lee-eunsol", caption: "Большая семья, большое наследство", family: 3, truth: "Брат убил её в борьбе за наследство.", ch: "гл. 8–9" },
  { who: "yu-sonyi", caption: "Все наши любимцы в сборе", family: 4, truth: "Её съели собственные питомцы.", ch: "гл. 8–9" },
  { who: "elena-ivanova", caption: "Ужин с родителями и сестрой", family: 3, truth: "Сестра отравила её вместе с родителями.", ch: "гл. 8–9" },
  { who: "park-seungyeop", caption: "Сын опять сидит за «Лол»", family: 2, truth: "Он почти не смотрел на «родителей» и потому заметил их безумие. Вспомнил товарищей и прыгнул из окна третьего этажа. Побег спас всю группу.", ch: "гл. 9–10", escaped: true },
];

/** Попытки третьего слоя: кто погиб в какой. */
export const ATTEMPTS: { n: number; note: string; ch: string }[] = [
  { n: 1, note: "Первый заход в «Странную семью Re»: четверо застряли (Ынсоль, Елена, Муксон, Ари).", ch: "гл. 62" },
  { n: 2, note: "Ари побеждает «маму» Миро, но её заражает любовь матери.", ch: "гл. 63" },
  { n: 3, note: "Гаин нарочно нарушает правила подвала. Его тело превращается в плоть.", ch: "гл. 67–68" },
  { n: 4, note: "Бойня в телестудии и палата Санмина: Сонъи стреляет в своих и в себя.", ch: "гл. 70–73" },
  { n: 5, note: "Семьи звереют, побег закрыт. Джинчхоль добивает ком плоти и вырывает Осколок.", ch: "гл. 74–76" },
];

export function deathsIn(attempt: number) {
  const tag = `Попытка ${attempt}`;
  return [...(RUN2.deaths ?? []), ...(RUN3.deaths ?? [])].filter((d) => d.how.includes(tag));
}

/** Правила из заламинированных инструкций и что за ними (гл. 67–68, 72). */
export const RULES: { sheet: "Подвал" | "Верхние этажи"; rule: string; broken: string; ch: number }[] = [
  { sheet: "Подвал", rule: "Не заглядывать в машины на парковке.", broken: "В тонированных окнах вместо салона больничные палаты: безумцы, прикованные к стальным койкам.", ch: 67 },
  { sheet: "Подвал", rule: "Не оглядываться на подвальной лестнице.", broken: "Пространство позади подменяется больницей. Скрежет: медсестра-монстр с надписью «Новый Мир» на шапочке.", ch: 68 },
  { sheet: "Подвал", rule: "Не включать свет на складе.", broken: "При фонарике там бумага и стулья. При свете — восемь пыточных столов с изуродованными школьниками.", ch: 68 },
  { sheet: "Верхние этажи", rule: "В лифте нажимать только одну кнопку.", broken: "Кабину заливает иссиня-чёрным, у дверей белые силуэты.", ch: 72 },
  { sheet: "Верхние этажи", rule: "Между 4-м и 5-м этажами нет пустых этажей.", broken: "Пустой просторный этаж. В камеру смотрит гигантский глаз.", ch: 72 },
  { sheet: "Верхние этажи", rule: "В туалет на 6-м этаже стучать.", broken: "Внутри людоед.", ch: 72 },
  { sheet: "Верхние этажи", rule: "Никогда не ходить на крышу.", broken: "Дверь на крыше ведёт ко входу в больницу «Новый Мир». Здесь вас встречают как гостей.", ch: 73 },
];
