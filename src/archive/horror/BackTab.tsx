"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

/**
 * Боковой картонный язычок папки «← КОРИДОР».
 * Окно (.tabslot) обрезано ровно по краю бумаги (edge): всё, что правее, «под листом».
 * Сам язычок (.tabcard) длиннее окна и при наведении выдвигается влево, открывая скрытую часть.
 * Координаты — в кадре досье 1200×1600, слой масштабируется вместе с ним.
 */
export function BackTab({ href, edge, top }: { href: string; edge: number; top: number }) {
  const router = useRouter();
  const close = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // обычный переход
    e.preventDefault();
    e.currentTarget.closest(".hd-fit")?.classList.add("closing");
    router.prefetch(href);
    window.setTimeout(() => router.push(href), 320);
  };
  const SLOT = 64; // ширина окна слева от края бумаги
  return (
    <span className="tabslot" style={{ left: edge - SLOT, top, width: SLOT + 2 }}>
      <Link href={href} className="tabcard" onClick={close} aria-label="Закрыть досье и вернуться в коридор">
        <svg viewBox="0 0 16 10" width="16" height="10" aria-hidden><path d="M15 5H2M6 1 2 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
        <span aria-hidden>КОРИДОР</span>
      </Link>
    </span>
  );
}
