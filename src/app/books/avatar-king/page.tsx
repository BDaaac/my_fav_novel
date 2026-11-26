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
  "hidden-light": "/art/king/p1/hidden-light.webp",
  "song-xiang": "/art/king/p1/song-xiang.webp",
  "huang-shaotian": "/art/king/p1/huang-shaotian.webp",
  "wang-jiexi": "/art/king/p1/wang-jiexi.webp",
  "gao-yingjie": "/art/king/p1/gao-yingjie.webp",
  "zhou-zekai": "/art/king/p1/zhou-zekai.webp",
  "han-wenqing": "/art/king/p1/han-wenqing.webp",
  "zhang-xinjie": "/art/king/p1/zhang-xinjie.webp",
  "yu-wenzhou": "/art/king/p1/yu-wenzhou.webp",
  "chu-yunxiu": "/art/king/p1/chu-yunxiu.webp",
  "li-xuan": "/art/king/p1/li-xuan.webp",
  "tan-hao": "/art/king/p1/tan-hao.webp",
  "lin-jinguan": "/art/king/p1/lin-jinguan.webp",
  "du-ming": "/art/king/p1/du-ming.webp",
  "blue-river": "/art/king/p1/blue-river.webp",
  "jiang-you": "/art/king/p1/jiang-you.webp",
  "chen-yehui": "/art/king/p1/chen-yehui.webp",
  "cold-night": "/art/king/p1/cold-night.webp",
  "liang-yichun": "/art/king/p1/liang-yichun.webp",
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
