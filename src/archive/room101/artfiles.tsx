"use client";
import { createContext, useContext } from "react";

/** Какие арты реально лежат в public/art/101 — чтобы новые картинки подхватывались сами, а до тех пор работали заглушки. */
const ArtCtx = createContext<Set<string>>(new Set());

export function ArtProvider({ files, children }: { files: string[]; children: React.ReactNode }) {
  return <ArtCtx.Provider value={new Set(files)}>{children}</ArtCtx.Provider>;
}

/** Путь к арту по базовому имени (без расширения) или null, если файла ещё нет. */
export function useArt() {
  const files = useContext(ArtCtx);
  return (base: string) => {
    for (const ext of [".png", ".jpg", ".jpeg", ".webp"]) if (files.has(base + ext)) return `/art/101/${base}${ext}`;
    return null;
  };
}
