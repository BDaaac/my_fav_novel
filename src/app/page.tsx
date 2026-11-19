import fs from "node:fs";
import path from "node:path";
import shelf from "@/data/shelf.json";
import { Shelf, type Book } from "@/shelf/Shelf";

export const metadata = { title: "Музей любимых новелл", description: "Архивы героев любимых новелл" };
export const dynamic = "force-dynamic"; // новые книги и обложки подхватываются без пересборки

export default function Home() {
  // обложки или картины может ещё не быть: тогда книга и сцена берут цвет корешка
  const has = (p?: string | null) => (p && fs.existsSync(path.join(process.cwd(), "public", p)) ? p : null);
  const books = (shelf as Book[]).map((b) => ({ ...b, cover: has(b.cover), scene: has(b.scene) }));
  return <Shelf books={books} />;
}
