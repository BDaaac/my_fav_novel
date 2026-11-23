/** «Шумиха!» — досье информационного агентства. Источник: .baccano/dossiers/*.md (утверждены пользователем). */

export type ArcId = "1930" | "1931";

/** true / false / partial / unknown — как записано в досье. */
export type Immortal = "true" | "false" | "partial" | "unknown";

export type Branch = { arc: ArcId; title: string; text: string; end: string };

/** Поля, которые на странице одного дела показываются иначе (без фактов более поздних томов). */
export type DossierView = Partial<{
  aka: string[];
  immortal: Immortal;
  who: string;
  manner: string;
  quotes: string[];
  said: string[];
  links: string[];
  abilities: string;
  notes: string[];
}>;

export type Dossier = {
  id: string;
  name: string;
  aka: string[];
  group: string;
  arcs: ArcId[];
  volumes: number[];
  immortal: Immortal;
  who: string;
  manner: string;
  /** реплики дословно, в «ёлочках» */
  quotes: string[];
  /** «Что о нём говорят»: строки с **именем** */
  said: string[];
  branches: Branch[];
  links: string[];
  abilities: string;
  /** пометки [противоречие] */
  notes: string[];
  /** ссылки на главы: хранятся, но не показываются */
  sources: { label: string; refs: string }[];
  views?: Partial<Record<ArcId, DossierView>>;
};

/** Досье в том виде, в каком оно показывается на странице конкретного дела. */
export type CaseDossier = Omit<Dossier, "views" | "sources"> & { arc: ArcId };

export function forArc(d: Dossier, arc: ArcId): CaseDossier {
  const { views, sources, ...rest } = d;
  void sources;
  const v = views?.[arc] ?? {};
  return {
    ...rest,
    ...v,
    arc,
    // ветки более поздних дел на странице раннего дела не показываются
    branches: d.branches.filter((b) => arc === "1931" || b.arc === "1930"),
  };
}
