import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import shelf from "@/data/shelf.json";
import type { Book } from "@/shelf/Shelf";
import { VhsVault } from "@/vhs/VhsVault";

export const metadata = { title: "Архив новелл", description: "Аналоговый CRT-монитор и 3D VHS-архив героев новелл" };

const inlineArt = new Map<string, { modifiedAt: number; size: number; src: Promise<string | null> }>();

async function getInlineArt(asset: string | null, kind: "cover" | "scene") {
  if (!asset) return null;
  const file = path.join(process.cwd(), "public", asset);
  const key = `${kind}:${file}`;

  try {
    const { mtimeMs, size } = await fs.promises.stat(file);
    const cached = inlineArt.get(key);
    if (cached?.modifiedAt === mtimeMs && cached.size === size) return cached.src;

    const src = sharp(file)
      .autoOrient()
      .resize(
        kind === "cover"
          ? { width: 512, height: 820, fit: "outside", withoutEnlargement: true }
          : { width: 960, withoutEnlargement: true },
      )
      .webp({ quality: 84 })
      .toBuffer()
      .then((image) => `data:image/webp;base64,${image.toString("base64")}`)
      .catch(() => null);

    inlineArt.set(key, { modifiedAt: mtimeMs, size, src });
    return src;
  } catch {
    return null;
  }
}

export default async function Home() {
  const has = (p?: string | null) => (p && fs.existsSync(path.join(process.cwd(), "public", p)) ? p : null);
  const books = await Promise.all(
    (shelf as Book[]).map(async (book) => {
      const cover = has(book.cover);
      const sleeve = has(book.sleeve);
      const scene = has(book.scene);
      const [vitrineCover, readingScene] = await Promise.all([
        getInlineArt(sleeve ?? cover, "cover"),
        getInlineArt(scene, "scene"),
      ]);
      return { ...book, cover, sleeve, scene, vitrineCover, readingScene };
    }),
  );
  return <VhsVault books={books} />;
}
