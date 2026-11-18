"use client";
import { useEffect, useRef } from "react";

/** Курсор-фонарик: всё вокруг тонет во тьме, видно только круг света. */
export function CursorLight({ radius = 260 }: { radius?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      el.style.setProperty("--x", `${e.clientX}px`);
      el.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        background: `radial-gradient(circle ${radius}px at var(--x, 50%) var(--y, 40%), transparent 0%, rgba(5,4,4,0.45) 45%, rgba(5,4,4,0.82) 100%)`,
      }}
    />
  );
}
