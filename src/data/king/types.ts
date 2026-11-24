/**
 * Картотека «Аватара короля»: по файлу на игрока в каждой части — src/data/king/p<N>/<id>.json.
 * Карточка заводится на игрока, его аккаунты — внутри. ch — главы, откуда взят факт
 * (на сайте не показываются, нужны для сверки).
 */
export type Para = { text: string; ch: number[] };

export type MoveType = "атака" | "контроль" | "перемещение" | "защита" | "тактика";

export type Player = {
  id: string;
  /** имя как в переводе; если настоящего имени в тексте нет — ник */
  name: string;
  /** другое имя: «Е Цю» */
  alias?: string;
  order: number;
  /** happy — «Счастье», pro — профессионалы Альянса, guild — гильдии серверов */
  group: "happy" | "pro" | "guild";
  /** одна строка под именем: кем он сейчас */
  tagline: string;
  /** команда, клуб или гильдия в этой части: «Счастье» */
  team: string;
  /** роль в бою одним-двумя словами: «тактик» */
  role: string;
  registry: { label: string; value: string }[];
  about: Para[];
  quote: { text: string; ch: number[] };
  accounts: {
    name: string;
    cls: string;
    /** main — играет сейчас, lost — отдан, borrowed — одолжен, temp — временный */
    status: "main" | "lost" | "borrowed" | "temp";
    note: string;
    ch: number[];
  }[];
  weapon?: { name: string; kind: string; text: string; forms: string[]; memory?: Para; ch: number[] };
  style: { traits: { label: string; value: string }[]; strong: Para[]; weak: Para[] };
  moves: { name: string; type: MoveType; text: string; ch: number[] }[];
  /** бои, рекорды и первые убийства части */
  feats: {
    /** соперник или цель: «Тополиный Берег», «Опустошённая Земля» */
    vs: string;
    kind: "победа" | "рекорд" | "первое убийство";
    /** заголовок матча: «Сорок секунд» */
    title: string;
    /** где и при ком: «интернет-кафе „Счастье“, десятый сервер» */
    where: string;
    /** счёт, время или число на экране итога — только то, что названо в тексте */
    score?: { value: string; label: string };
    /** одна строка-вступление над чатом */
    text: string;
    /** чат трансляции: без who — сообщение эфира (пересказ), с who — реплика дословно из перевода */
    ch: number[];
  }[];
  /** side — группа на листе «Связи»: свои, соперники, партнёры, враги */
  links: { to: string; name: string; side: "свои" | "соперники" | "партнёры" | "враги"; bond: string; text: string }[];
};

export const PARTS = [
  { n: 1, title: "Изгнание" },
  { n: 2, title: "Своя команда" },
  { n: 3, title: "Год подготовки" },
  { n: 4, title: "Соревновательная лига" },
  { n: 5, title: "Межсезонье" },
  { n: 6, title: "Профессиональная лига" },
  { n: 7, title: "Плей-офф и финал" },
] as const;
