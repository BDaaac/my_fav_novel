/** «Пассивки» — досье летописца Духовного Дворца. Источник: .passivki/final/*.md (утверждены пользователем), сборка — .passivki/build_data.py. */

export type ArcId = "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7";

/** круг, к которому относится герой: дворы и старейшины Дворца либо чужаки */
export type Circle = "outer" | "inner" | "elders" | "slaves" | "hall" | "other";

/** чем кончились для героя события тома: жив и на месте, погиб, покинул Дворец */
export type Fate = "alive" | "dead" | "gone";

export type Tablet = "wood" | "iron";

export type Link = { name: string; id: string | null; text: string };

export type Hero = {
  id: string;
  name: string;
  affiliation: string;
  circle: Circle;
  tablet: Tablet;
  fate: Fate;
  arcs: ArcId[];
};

export type Dossier = Hero & {
  /** заголовок первого раздела: «Кто он» / «Кто она» / «Кто это» */
  whoTitle: string;
  who: string[];
  power: string[];
  character: string[];
  links: Link[];
  nature: string[];
  goal: string[];
  reputation: string[];
  feats: string[];
  /** только у Сюй Сяошоу: пассивные навыки и их ступени к исходу тома */
  skills?: { name: string; level: string }[];
};
