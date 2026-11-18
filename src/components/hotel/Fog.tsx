"use client";
import { useState } from "react";
import DecryptedText from "@/components/DecryptedText";
import { useSpoiler } from "@/lib/spoiler";
import { cn } from "@/lib/utils";

const SQUARES = "□▢▣▤▥▦▧▨▩";

/** Длинный текст не превращаем в стену квадратиков: первые слова → «□□□□ □□ □□□□□ …». */
function fogShort(text: string) {
  return text.split(/\s+/).slice(0, 4).map((w) => "□".repeat(Math.min(w.length, 8))).join(" ") + " …";
}

/** Туман спойлеров: текст после прочитанной главы показан квадратиками «□», клик — рассекретить. */
export function Fog({ text, ch, className }: { text: string; ch: number | null | undefined; className?: string }) {
  const { readCh } = useSpoiler();
  const [revealed, setRevealed] = useState(false);
  const open = ch == null || ch <= readCh;

  if (open) return <span className={className}>{text}</span>;
  if (revealed)
    return (
      <DecryptedText
        text={text}
        animateOn="view"
        sequential
        speed={18}
        characters={SQUARES}
        className={className}
        encryptedClassName="text-system/70"
      />
    );
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setRevealed(true);
      }}
      title={`Спойлер · глава ${ch}. Нажмите, чтобы рассекретить`}
      className={cn(
        "cursor-pointer select-none text-left font-system tracking-[0.15em] text-system/45 transition-colors hover:text-system/80",
        className,
      )}
    >
      {text.length > 32 ? (
        <>
          {fogShort(text)}
          <span className="ml-2 text-[10px] tracking-normal text-system/35">спойлер · гл. {ch}</span>
        </>
      ) : (
        text.replace(/[^\s]/g, "□")
      )}
    </button>
  );
}
