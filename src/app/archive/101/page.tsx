import fs from "node:fs";
import path from "node:path";
import { Room101 } from "@/archive/room101/Room101";

export const metadata = { title: "Архив · Комната 101" };

export default function Archive101() {
  let art: string[] = [];
  try {
    art = fs.readdirSync(path.join(process.cwd(), "public/art/101"));
  } catch {}
  return <Room101 art={art} />;
}
