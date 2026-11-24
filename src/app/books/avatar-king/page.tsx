import fs from "node:fs";
import path from "node:path";
import type { Player } from "@/data/king/types";
import { MonitorArchive } from "@/archive/king/MonitorArchive";

const ART_MAP: Record<string, string> = {
  "ye-xiu": "/art/king/p1/ye-xiu.webp",
  "tang-rou": "/art/king/p1/tang-rou.webp",
  "chen-guo": "/art/king/p1/chen-guo.webp",
  "su-mucheng": "/art/king/p1/su-mucheng.webp",
  "steamed-bun": "/art/king/p1/steamed-bun.webp",
  "qiao-yifan": "/art/king/p1/qiao-yifan.webp",
};

export default function KingArchivePage() {
  const dir = path.join(process.cwd(), "src/data/king/p1");
  const players: Player[] = [];

  try {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      players.push(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Player);
    }
  } catch {
    // fallback empty
  }

  players.sort((a, b) => a.order - b.order);

  return (
    <>
      <link rel="preload" as="image" href="/art/king/bg-p1-cafe.webp" fetchPriority="high" />
      <link rel="preload" as="image" href="/art/king/p1/ye-xiu.webp" />
      <MonitorArchive players={players} artMap={ART_MAP} />
    </>
  );
}
