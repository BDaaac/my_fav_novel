import fs from "node:fs";
import path from "node:path";
import { preload } from "react-dom";
import shelf from "@/data/shelf.json";
import type { Book } from "@/shelf/Shelf";
import { VhsVault } from "@/vhs/VhsVault";

export const metadata = { title: "Архив новелл", description: "Аналоговый CRT-монитор и 3D VHS-архив героев новелл" };

export default function Home() {
  const has = (p?: string | null) => (p && fs.existsSync(path.join(process.cwd(), "public", p)) ? p : null);
  const books = (shelf as Book[]).map((book) => {
    const cover = has(book.cover);
    const sleeve = has(book.sleeve);
    const scene = has(book.scene);
    return {
      ...book,
      cover,
      sleeve,
      scene,
      vitrineCover: sleeve ?? cover,
      readingScene: scene,
    };
  });

  // Предзагружаем 3 видимые на первом экране обложки кассет (центр, справа, слева)
  const initialIndices = [0, 1, books.length - 1];
  for (const idx of new Set(initialIndices)) {
    const art = books[idx]?.vitrineCover;
    if (art) preload(art, { as: "image", fetchPriority: idx === 0 ? "high" : undefined });
  }

  return <VhsVault books={books} />;
}
