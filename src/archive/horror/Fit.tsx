"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Подгоняет кадр досье 1200×1600 под ширину окна через --s; по 14 px полей — место для бокового язычка папки. */
export function Fit({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // до отрисовки кадра: при переходе с доски лист сразу встаёт в нужном масштабе
  useLayoutEffect(() => {
    const set = () => ref.current?.style.setProperty("--s", String(Math.min((window.innerWidth - 28) / 1200, 1.25)));
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
  return (
    <div ref={ref} className="hd-fit">
      {children}
    </div>
  );
}
