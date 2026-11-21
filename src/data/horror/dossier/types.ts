/**
 * Досье обитателя «Мой дом ужасов»: один файл на персонажа.
 * Каждое поле с фактом держит главы (ch), чтобы его можно было сверить с текстом.
 * Подложка (plate) — сгенерированная фотография планшета с уликами персонажа;
 * подписи к уликам ставятся поверх неё в координатах кадра 1200×1600.
 */

export type Ref = number[];

export type Side = "ghost" | "living" | "enemy" | "patient";

/** строка анкеты: «Имя: Чжан Я» */
export type IdentRow = { k: string; v: string; ch?: Ref; wide?: boolean };

/** полоса с флажками: ранг призрака, привязанность, статус */
export type CheckRow = { title: string; options: { label: string; on?: boolean; ch?: Ref }[] };

/** k — короткий заголовок строки (черта характера), если нужен */
export type TextLine = { text: string; k?: string; ch?: Ref };

/** где на подложке подпись: координаты в кадре 1200×1600 */
export type Spot = { x: number; y: number; rot?: number; w?: number };

export type Dossier = {
  id: string;
  /** учётный номер в картотеке */
  no: string;
  name: string;
  side: Side;
  /** надпись на красной плашке пропуска */
  badge: string;
  ident: IdentRow[];
  checks: CheckRow[];
  abilities: { title: string; rows: { k: string; text: string; ch?: Ref }[] };
  look: TextLine[];
  traits: TextLine[];
  meetings: { ch: string; text: string }[];
  record: TextLine;
  stamp: { big: string; small?: string };
  questions: TextLine[];
  /** надпись на краю конверта/предмета у правого края, если есть */
  aside?: TextLine & Spot;
  /**
   * Новая форма досье (нейтральная архивная запись). Если есть lead — лист собирается по ней:
   * справка → анкета → способности; под пропуском облик | характер с цитатой; история; связи.
   */
  lead?: TextLine;
  story?: TextLine;
  quote?: { text: string; to?: string; ch?: Ref };
  links?: { id: string; name: string; role: string }[];
  art: {
    portrait?: string;
    plate?: string;
  };
  /** подписи к предметам на подложке */
  props: {
    photo?: { title: string; sub?: string } & Spot;
    evidence?: { title: string; sub?: string } & Spot;
  };
};
