import Link from "next/link";
import type { ReactNode } from "react";
import n from "./nav.module.css";

/**
 * Единая навигация «Шумихи»: строка гротеска без рамки, фона и табличек.
 * Одна форма на всех экранах — выбор дела, страница дела, досье.
 * Наведение — предмет не светится, строка чуть сдвигается в сторону движения.
 */
type Common = { children: ReactNode; /** стрелка «назад» перед подписью */ back?: boolean; label?: string };

const Arrow = () => (
  <svg viewBox="0 0 28 10" aria-hidden>
    <path d="M27 5H1.5M6 1 1.5 5 6 9" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function NavLink({ href, children, back, label }: Common & { href: string }) {
  return (
    <Link href={href} className={n.nav} data-back={back || undefined} aria-label={label}>
      {back && <Arrow />}
      <span>{children}</span>
    </Link>
  );
}

export function NavButton({ onClick, children, back, label }: Common & { onClick: () => void }) {
  return (
    <button type="button" className={n.nav} data-back={back || undefined} aria-label={label} onClick={onClick}>
      {back && <Arrow />}
      <span>{children}</span>
    </button>
  );
}
