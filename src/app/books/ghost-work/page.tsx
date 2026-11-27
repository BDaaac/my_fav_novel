import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Day Dream · личные дела — Архив новелл",
  description: "«Даже если попадёшь в историю о призраках, всё равно придётся идти на работу»: база сотрудников Day Dream на старом телевизоре, тома I–II.",
};

// Архив живёт отдельной страницей в public/art/ghost-work (WebGL-телевизор, GPL-3, исходники рядом).
// Здесь он открывается на весь экран; путь /art/ получает префикс Pages в scripts/pages-basepath.mjs.
export default function GhostWorkPage() {
  return (
    <main className="fixed inset-0 bg-[#141210]">
      <iframe
        src="/art/ghost-work/index.html"
        title="Day Dream Inc. — личные дела сотрудников"
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen"
      />
      <Link
        href="/"
        className="absolute right-4 top-3 z-10 font-mono text-[12px] tracking-[0.08em] text-[#8d877c] transition-colors hover:text-[#d9d1bb]"
      >
        ← на полку
      </Link>
    </main>
  );
}
