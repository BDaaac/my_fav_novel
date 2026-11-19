import fs from "node:fs";
import path from "node:path";
import shelf from "@/data/shelf.json";
import { Shelf, type Book } from "@/shelf/Shelf";

export const metadata = { title: "Книжная полка", description: "Архивы героев любимых новелл" };
export const dynamic = "force-dynamic"; // новые книги и обложки подхватываются без пересборки

export default function Home() {
  // обложки может ещё не быть: тогда книга раскрывается цветом корешка
  const books = (shelf as Book[]).map((b) => ({
    ...b,
    cover: b.cover && fs.existsSync(path.join(process.cwd(), "public", b.cover)) ? b.cover : null,
  }));
  return <Shelf books={books} />;
}
