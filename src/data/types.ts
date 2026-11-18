export type Fact = { text: string; ch: number | null };
export type Room = {
  id: string;
  floor: number;
  type: "curse" | "mission" | "gate";
  title: string;
  chapters: [number, number];
  world: Fact;
  apocalypse: Fact & { deadline: string | null };
  clearCondition: Fact;
  god: { name: string | null; nameCh: number | null; facts: Fact[] };
  team: string[];
  acts: { title: string; text: string; ch: [number, number] }[];
  outcome: Fact;
  mood: { palette: string; motif: string };
};
export type Character = {
  id: string;
  name: string;
  stat: string | null;
  firstCh?: number | null;
  role?: string;
  facts: Fact[];
};
