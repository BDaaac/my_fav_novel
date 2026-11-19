/**
 * Картотека «Преподобного Гу»: по файлу на героя в каждом томе — src/data/gu/v<N>/<id>.json.
 * Один и тот же id в разных томах = один герой; у каждого тома своя карточка.
 * ch — главы, откуда взят факт (на сайте не показываются, нужны для сверки).
 */
export type Para = { text: string; ch: number[] };

export type Cultivator = {
  id: string;
  /** имя как в переводе: «Фан Юань» */
  name: string;
  /** порядок в свитке тома: 1 — первый */
  order: number;
  /** main — главный, major — важный, minor — второстепенный */
  role: "main" | "major" | "minor";
  /** клан, секта или «одиночка» */
  clan: string;
  /** положение: «ученик академии», «глава клана», «старейшина медицинской ветви» */
  standing: string;
  /** ранг к концу тома: «Второй ранг, высшая стадия»; пусто, если не сказано */
  rank: string;
  /** талант апертуры: «Ранг C» и т.п.; пусто, если не сказано */
  talent?: string;
  /** первобытная эссенция: «медная, 44%» и т.п. */
  essence?: string;
  /** графы бланка: возраст, родство, внешность и т.п. */
  registry: { label: string; value: string }[];
  /** кто он, характер — 2–4 абзаца */
  about: Para[];
  /** путь культивации в томе: ступени по порядку */
  path: { stage: string; text: string; ch: number[] }[];
  /** черви Гу героя */
  gu: { name: string; rank?: string; text: string; fate?: string; ch: number[] }[];
  /** связи с другими героями тома (to — id другого героя) */
  links: { to: string; bond: string; text: string }[];
  /** ключевые эпизоды тома */
  moments: { title: string; text: string; ch: number[] }[];
  /** судьба к концу тома */
  fate: { status: "alive" | "dead" | "unknown"; text: string; ch: number[] };
  quotes: { text: string; ch: number[] }[];
  /** черновик по беглым заметкам; заменится после полного прочтения */
  draft?: boolean;
};

export const VOLUMES = [
  { n: 1, title: "Сердце демона никогда не сожалеет", chapters: [1, 199] },
  { n: 2, title: "Сплав по реке Жёлтый Дракон", chapters: [200, 405] },
  { n: 3, title: "Фэн Цзю Гэ", chapters: [406, 649] },
  { n: 4, title: "Возвращение в благословенную землю Бессмертной Ху", chapters: [650, 1021] },
  { n: 5, title: "Пятый том", chapters: [1022, 2334] },
] as const;
