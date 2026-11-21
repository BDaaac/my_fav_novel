import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import shelf from "@/data/shelf.json";
import { Shelf, type Book } from "@/shelf/Shelf";

export const metadata = { title: "Галерея новелл", description: "Архивы героев новелл" };

const vitrineCovers = new Map<string, { modifiedAt: number; size: number; src: Promise<string | null> }>();

async function getVitrineCover(cover: string) {
  const file = path.join(process.cwd(), "public", cover);

  try {
    const { mtimeMs, size } = await fs.promises.stat(file);
    const cached = vitrineCovers.get(file);
    if (cached?.modifiedAt === mtimeMs && cached.size === size) return cached.src;

    // Keep the original proportions so the vitrine can apply the book's coverPos.
    const src = sharp(file)
      .autoOrient()
      .resize({ width: 428, height: 600, fit: "outside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
      .then((image) => `data:image/webp;base64,${image.toString("base64")}`)
      .catch(() => null);

    vitrineCovers.set(file, { modifiedAt: mtimeMs, size, src });
    return src;
  } catch {
    return null;
  }
}

export default async function Home() {
  // обложки или картины может ещё не быть: тогда книга и сцена берут цвет корешка
  const has = (p?: string | null) => (p && fs.existsSync(path.join(process.cwd(), "public", p)) ? p : null);
  const books = await Promise.all((shelf as Book[]).map(async (book) => {
    const cover = has(book.cover);
    return {
      ...book,
      cover,
      vitrineCover: cover ? await getVitrineCover(cover) : null,
      scene: has(book.scene),
    };
  }));
  return <Shelf books={books} hallBg={has("/art/museum/hall-bg.jpg")} />;
}
