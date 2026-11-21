/**
 * Общий слой архивов: одна схема записи на все новеллы.
 * Каждое утверждение держит главы-источники (ch) и степень уверенности,
 * чтобы любой факт можно было сверить с текстом.
 * Оформление (skin) живёт отдельно: данные и логика одни, облик у каждой новеллы свой.
 */

/** факт — прямо сказано; со слов — так говорит герой или системный текст; догадка — вывод героя; неясно — текст не уточняет */
export type Sure = "факт" | "со слов" | "догадка" | "неясно";

export type Claim = {
  text: string;
  ch: number[];
  sure?: Sure;
  /** чьи это слова, если sure = «со слов» */
  by?: string;
};

export type EntryType = "person" | "place" | "item" | "case" | "entity";

export type Link = {
  /** id другой записи; если записи ещё нет, ссылка показывается без перехода */
  to: string;
  /** как назвать ссылку, если записи ещё нет */
  name?: string;
  rel: string;
  ch: number[];
};

export type Entry = {
  id: string;
  type: EntryType;
  title: string;
  /** другие написания и прозвища — для поиска */
  aliases?: string[];
  firstCh: number;
  tagline: Claim;
  registry: { label: string; value: Claim }[];
  sections: { title: string; claims: Claim[] }[];
  /** дословные цитаты из перевода */
  quotes: Claim[];
  links: Link[];
  /** расхождения внутри самого перевода */
  conflicts?: Claim[];
  status?: Claim;
  /** только для дел */
  timeline?: Claim[];
  evidence?: { name: string; item?: string; claim: Claim }[];
  suspects?: { to: string; name: string; claim: Claim }[];
  outcome?: Claim;
  open?: Claim[];
  /** системные сообщения дословно (для предметов-интерфейсов и дел) */
  messages?: Claim[];
};

export const TYPE_LABEL: Record<EntryType, string> = {
  person: "Лица",
  place: "Места",
  item: "Предметы",
  case: "Дела",
  entity: "Сущности",
};
