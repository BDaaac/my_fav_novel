import fs from "node:fs";
import path from "node:path";
import { Room102Shell } from "@/archive/room102/Room102";

export const metadata = { title: "Архив · Номер 102 · Особняк Ужасов" };

export default function Layout102({ children }: { children: React.ReactNode }) {
  let art: string[] = [];
  try {
    art = fs.readdirSync(path.join(process.cwd(), "public/art/102"));
  } catch {}
  return <Room102Shell art={art}>{children}</Room102Shell>;
}
