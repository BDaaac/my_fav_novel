export type RoomType = "curse" | "mission" | "gate" | "rest";

export type DoorInfo = {
  id: string;
  type: RoomType;
  title: string;
  /** глава, когда читатель узнаёт название комнаты */
  titleCh: number;
  /** первый заход: [начало, конец] */
  chapters: [number, number];
  /** повторные заходы */
  reruns?: { title: string; chapters: [number, number] }[];
  /** есть ли подробная карточка комнаты */
  detailed?: boolean;
  accent: string;
};

export const TYPE_LABEL: Record<RoomType, string> = {
  curse: "Комната Проклятий",
  mission: "Комната Миссий",
  gate: "Комната Врат",
  rest: "Комната Отдыха",
};

export const TYPE_COLOR: Record<RoomType, string> = {
  curse: "#c0333d",
  mission: "#c9a227",
  gate: "#8f7cff",
  rest: "#7fd4ff",
};

export const FLOOR_1: DoorInfo[] = [
  { id: "101", type: "curse", title: "Странная семья", titleCh: 5, chapters: [5, 11], detailed: true, accent: "#b0463c",
    reruns: [{ title: "Странная семья Re", chapters: [63, 66] }, { title: "Медиа, меняющие реальность", chapters: [67, 76] }] },
  { id: "102", type: "curse", title: "Особняк Ужасов", titleCh: 15, chapters: [15, 24], detailed: true, accent: "#8a5a2b",
    reruns: [{ title: "Особняк Ужасов Re", chapters: [88, 96] }] },
  { id: "103", type: "curse", title: "Человеческая Ферма Атанасии", titleCh: 26, chapters: [26, 37], detailed: true, accent: "#9fbf8a" },
  { id: "104", type: "curse", title: "Отель-школа «Врата Элиты»", titleCh: 40, chapters: [41, 48], accent: "#6a7fb0",
    reruns: [{ title: "Отель-школа «Врата Элиты» Re", chapters: [207, 220] }] },
  { id: "105", type: "rest", title: "Комната Отдыха", titleCh: 1, chapters: [1, 1168], accent: "#7fd4ff" },
  { id: "106", type: "mission", title: "Отель-Ленд «Надежда»", titleCh: 53, chapters: [54, 59], accent: "#d9a441" },
  { id: "107", type: "gate", title: "Комната Врат", titleCh: 109, chapters: [110, 143], accent: "#8f7cff" },
];

export const FLOORS = [
  { n: 1, unlockCh: 1, doors: FLOOR_1 },
  { n: 2, unlockCh: 150, doors: [] as DoorInfo[] },
  { n: 3, unlockCh: 650, doors: [] as DoorInfo[] },
];
