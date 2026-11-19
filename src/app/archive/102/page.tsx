import fs from "node:fs";
import path from "node:path";
import { Room102 } from "@/archive/room102/Room102";

export const metadata = { title: "Архив · Номер 102 · Особняк Ужасов" };

export default function Archive102() {
  let art: string[] = [];
  try {
    art = fs.readdirSync(path.join(process.cwd(), "public/art/102"));
  } catch {}
  return <Room102 art={art} />;
}
