import rooms from "@/data/rooms.json";
import type { Room } from "@/data/types";
import { Vestibule, type RoomDoor } from "@/hotel/Vestibule";

export const metadata = { title: "Отель «Пионер» · Вестибюль" };

export default function Home() {
  const all = rooms as unknown as Room[];
  // одна дверь на номер: повторные заходы (Re) считаются заходами той же комнаты
  const doors: RoomDoor[] = all
    .filter((r) => !r.runOf)
    .map((r) => {
      const runs = all.filter((x) => x.id === r.id || x.runOf === r.id);
      return { id: r.id, title: r.title, type: r.type, solved: runs.some((x) => x.outcome?.solved === true), runs: runs.length };
    });
  return <Vestibule rooms={doors} />;
}
