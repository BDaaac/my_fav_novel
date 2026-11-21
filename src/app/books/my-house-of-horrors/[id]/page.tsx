import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { Dossier } from "@/archive/horror/Dossier";
import type { Dossier as D } from "@/data/horror/dossier/types";


const dir = () => path.join(process.cwd(), "src/data/horror/dossier");

// все досье собираются заранее (статическая сборка для GitHub Pages); в dev новые файлы видны сразу
export const dynamicParams = false;
export function generateStaticParams() {
  return fs.readdirSync(dir()).filter((f) => f.endsWith(".json")).map((f) => ({ id: f.slice(0, -5) }));
}

function read(id: string): D | null {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(dir(), `${id}.json`), "utf8")) as D;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const d = read((await params).id);
  return { title: d ? `${d.name} · Мой дом ужасов` : "Мой дом ужасов" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const d = read((await params).id);
  if (!d) notFound();
  return <Dossier d={d} backHref="/books/my-house-of-horrors" />;
}
