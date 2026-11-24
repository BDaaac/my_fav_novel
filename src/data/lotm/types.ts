export type LotmGroup = "tarot" | "nighthawks" | "allies" | "antagonists";

export type ArtifactGrade = "0" | "1" | "2" | "3" | "mystic" | "gear";

export type ArtifactArtKey =
  | "fog"
  | "whistle"
  | "pendulum"
  | "puppet"
  | "urn"
  | "revolver"
  | "quill"
  | "mirror"
  | "glove"
  | "ship"
  | "sword"
  | "book";

export type LinkKind = "tarot" | "ally" | "family" | "enemy" | "bond";

export interface LotmArtifact {
  code?: string;
  name: string;
  grade: ArtifactGrade;
  gradeLabel: string;
  art: ArtifactArtKey;
  effect: string;
  drawback?: string;
  source: string;
}

export interface LotmTarotSeat {
  roman: string;
  arcana: string;
  role: string;
}

export interface LotmSequenceStep {
  num: number;
  name: string;
  chapter?: string;
  active?: boolean;
}

export interface LotmEvent {
  chapter: string;
  title: string;
  detail: string;
}

export interface LotmLink {
  to: string;
  name: string;
  relation: string;
  kind: LinkKind;
  note: string;
  chapters?: string;
}

export interface LotmAbilityDetail {
  name: string;
  detail: string;
}

export interface LotmPathwayBrief {
  note: string;
  abilities: LotmAbilityDetail[];
}

export interface LotmCharacter {
  id: string;
  name: string;
  aliases: string[];
  group: LotmGroup;
  cardImage: string;
  ribbonBottom?: string;
  portrait: string;
  affiliation: string;
  city: string;
  age: string;
  tarot?: LotmTarotSeat;
  pathway: string;
  sequence: string;
  sequenceNum: number | null;
  sequenceSteps?: LotmSequenceStep[];
  progression?: string;
  status: "alive" | "dead" | "missing" | "unknown";
  statusText: string;
  firstSeen: string;
  appearance: string;
  personality: string;
  abilities: string[];
  artifacts: LotmArtifact[];
  events: LotmEvent[];
  contradiction?: string;
  links: LotmLink[];
  sources: string[];
}

export type VolumeSymbolId =
  | "hat"
  | "mask"
  | "ship"
  | "infinity"
  | "flame"
  | "sun"
  | "gallows"
  | "star";

export interface LotmVolumeMeta {
  num: number;
  roman: string;
  title: string;
  chapters: string;
  rangeShort: string;
  setting: string;
  blurb: string;
  symbol: VolumeSymbolId;
  ready: boolean;
  stats?: {
    characters: number;
    tarot: number;
    artifacts: number;
  };
}

export const ARTIFACT_ART_SRC: Record<ArtifactArtKey, string> = {
  fog: "/art/lotm/artifacts/fog.webp",
  whistle: "/art/lotm/artifacts/whistle.webp",
  pendulum: "/art/lotm/artifacts/pendulum.webp",
  puppet: "/art/lotm/artifacts/puppet.webp",
  urn: "/art/lotm/artifacts/urn.webp",
  revolver: "/art/lotm/artifacts/revolver.webp",
  quill: "/art/lotm/artifacts/quill.webp",
  mirror: "/art/lotm/artifacts/mirror.webp",
  glove: "/art/lotm/artifacts/glove.webp",
  ship: "/art/lotm/artifacts/ship.webp",
  sword: "/art/lotm/artifacts/sword.webp",
  book: "/art/lotm/artifacts/book.webp",
};

export const SEAL_SRC: Record<LotmGroup, string> = {
  tarot: "/art/lotm/seals/seal-tarot.webp",
  nighthawks: "/art/lotm/seals/seal-nighthawks.webp",
  allies: "/art/lotm/seals/seal-allies.webp",
  antagonists: "/art/lotm/seals/seal-antagonists.webp",
};

export const LOTM_VOLUMES: LotmVolumeMeta[] = [
  {
    num: 1,
    roman: "I",
    title: "Клоун",
    chapters: "Главы 1–213",
    rangeShort: "1–213",
    setting: "Тинген, 1349 год",
    blurb:
      "Пробуждение в викторианском Тингене, служба в отряде Ночных Ястребов, первые собрания Клуба Таро над Серым Туманом и скрытый заговор за Вратами Чаниса.",
    symbol: "hat",
    ready: true,
    stats: { characters: 20, tarot: 4, artifacts: 22 },
  },
  {
    num: 2,
    roman: "II",
    title: "Безликий",
    chapters: "Главы 214–482",
    rangeShort: "214–482",
    setting: "Баклунд",
    blurb:
      "Переезд в столицу Лоэна под чужим именем, частный сыск в туманном Баклунде, следы заговоров аристократии и приближение Великого Смога.",
    symbol: "mask",
    ready: false,
  },
  {
    num: 3,
    roman: "III",
    title: "Путешественник",
    chapters: "Главы 483–732",
    rangeShort: "483–732",
    setting: "Пять морей",
    blurb:
      "Выход в открытые моря в образе безумного авантюриста, охота на пиратских адмиралов, древние острова и тайны Четвёртой Эпохи.",
    symbol: "ship",
    ready: false,
  },
  {
    num: 4,
    roman: "IV",
    title: "Бессмертный",
    chapters: "Главы 733–946",
    rangeShort: "733–946",
    setting: "Баклунд и границы духа",
    blurb:
      "Возвращение в столицу на пороге полубожественной ступени, столкновение с тайными орденами и отголоски древних богов.",
    symbol: "infinity",
    ready: false,
  },
  {
    num: 5,
    roman: "V",
    title: "Красный Жрец",
    chapters: "Главы 947–1150",
    rangeShort: "947–1150",
    setting: "Континент в огне",
    blurb:
      "Тени грядущей мировой войны, игры ангелов и королевских дворов, испытания веры и цены власти.",
    symbol: "flame",
    ready: false,
  },
  {
    num: 6,
    roman: "VI",
    title: "Искатель Света",
    chapters: "Главы 1151–1266",
    rangeShort: "1151–1266",
    setting: "Земля, Забытая Богами",
    blurb:
      "Путь сквозь вечную тьму проклятых земель, Город Серебра и расплата с древними тайнами мироздания.",
    symbol: "sun",
    ready: false,
  },
  {
    num: 7,
    roman: "VII",
    title: "Висельник",
    chapters: "Главы 1267–1353",
    rangeShort: "1267–1353",
    setting: "Порог звёзд",
    blurb:
      "Борьба за ангельские троны, пробуждение древней воли и последний рубеж перед апофеозом.",
    symbol: "gallows",
    ready: false,
  },
  {
    num: 8,
    roman: "VIII",
    title: "Шут",
    chapters: "Главы 1354–1394",
    rangeShort: "1354–1394",
    setting: "Над Серым Туманом",
    blurb:
      "Финальный гамбит Шута, цена божественности и сон, охраняющий мир от внешнего безумия.",
    symbol: "star",
    ready: false,
  },
];
