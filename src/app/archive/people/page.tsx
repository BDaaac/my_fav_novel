import fs from "node:fs";
import path from "node:path";
import { People } from "@/archive/people/People";

export const metadata = { title: "Архив · Гости отеля" };

export default function ArchivePeople() {
  let art: string[] = [];
  try {
    art = fs.readdirSync(path.join(process.cwd(), "public/art/people"));
  } catch {}
  return <People art={art} />;
}
