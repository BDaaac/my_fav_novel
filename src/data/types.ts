export type Fact = { text: string; ch: number | null };
export type Room = {
  id: string;
  /** повторный заход: id исходной комнаты */
  runOf?: string | null;
  floor: number;
  type: string;
  title: string;
  chapters: number[];
  world: Fact;
  apocalypse: Fact & { deadline: string | null };
  clearCondition: Fact;
  missions?: { text: string; done: boolean; ch: number }[];
  god: { name: string | null; nameCh: number | null; facts: Fact[] };
  roles?: { who: string; role: string }[];
  team: string[];
  locations?: { name: string; look: string }[];
  acts: { title: string; text: string; ch: number[] }[];
  deaths?: { who: string; how: string; ch: number }[];
  outcome: Fact & { solved?: boolean | null };
  mood: { palette: string; motif: string; sound?: string };
};
export type Character = {
  id: string;
  name: string;
  stat: string | null;
  firstCh?: number | null;
  role?: string;
  facts: Fact[];
};
export type Item = { id: string; name: string; owner: string | null; room: string; ch: number; effect: string };
