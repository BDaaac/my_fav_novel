"use client";
import Link from "next/link";
import { Stage } from "@/stage/Stage";
import { Curtain } from "@/stage/Curtain";
import { ArtProvider, Hud, SceneNav, useHydrateRoom } from "./state";

/**
 * Оболочка номера 102: общий WebGL-холст, шторка-переход, окно статуса и лента сцен.
 * Сами сцены — отдельные маршруты внутри /archive/102; холст и состояние между ними не пересоздаются.
 */
export function Room102Shell({ art, children }: { art: string[]; children: React.ReactNode }) {
  useHydrateRoom();
  return (
    <ArtProvider value={art}>
      <Stage />
      <main className="relative min-h-screen overflow-x-clip text-[#dfe6e2]">{children}</main>
      <Link href="/" className="fixed left-5 top-5 z-30 font-system text-[11px] tracking-widest text-[#9fb8b0] underline-offset-4 hover:underline">
        ← вестибюль
      </Link>
      <Hud />
      <SceneNav />
      <Curtain />
    </ArtProvider>
  );
}
