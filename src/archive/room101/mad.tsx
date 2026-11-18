"use client";
import { Fragment } from "react";
import FuzzyText from "@/components/FuzzyText";
import { STAGE, useInfection } from "./infection";
import { cn } from "@/lib/utils";

/** Стабильный «случай» для слова: одно и то же слово сходит с ума всегда одинаково. */
function rnd(seed: string, k: number) {
  let h = 2166136261 ^ k;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

const FAMILY_WORDS = ["семья", "мама", "дома", "ужин", "останься", "мы рядом", "♥", "родной", "навсегда"];
const ODD: Record<string, string> = { а: "ɐ", е: "ǝ", о: "ọ", и: "ᴎ", я: "ʁ", к: "ʞ", т: "ꓕ", р: "ꓒ", м: "w", н: "ʜ" };

/**
 * Текст, который заражается. Разметка: «{безумие|забота}» — слово, которое семья переписывает в норму.
 * Стадии: ≥20 нормализация · ≥40 рукописные вставки, ржавчина · ≥60 дрожь, повторы, подмена слов, чужие буквы · ≥82 «мокрая краска».
 */
export function Mad({ text, className, as: Tag = "p" }: { text: string; className?: string; as?: "p" | "span" | "div" }) {
  const { level } = useInfection();
  const parts = text.split(/(\{[^}]+\}|\s+)/).filter((p) => p !== "");
  let wi = 0;
  return (
    <Tag
      className={cn("transition-[letter-spacing,filter] duration-700", className)}
      style={{
        letterSpacing: level >= STAGE.glitch ? `${((level - STAGE.glitch) / 40) * 0.04}em` : undefined,
        filter: level >= STAGE.critical ? "blur(0.3px)" : undefined,
      }}
    >
      {parts.map((p, i) => {
        if (/^\s+$/.test(p)) return " ";
        if (p.startsWith("{")) {
          const [a, b] = p.slice(1, -1).split("|");
          if (level < STAGE.rewrite) return <Fragment key={i}>{a}</Fragment>;
          return (
            <span key={i} className="whitespace-nowrap">
              <s className="opacity-55 decoration-[var(--accent)] decoration-2">{a}</s>{" "}
              <span className="font-hand text-[1.3em] leading-none text-[var(--accent)]">{b}</span>
            </span>
          );
        }
        const w = p;
        const k = wi++;
        const r = (n: number) => rnd(w + text.length, k * 7 + n);
        const over = (from: number, span: number) => Math.max(0, (level - from) / span);

        // критическое: кровавая «мокрая краска»
        if (r(1) < over(STAGE.critical, 120)) return <span key={i} className="font-wet text-[1.15em] text-[#9b0f16]">{w}</span>;
        // подмена слова на «семейное»
        if (r(2) < over(STAGE.glitch, 260))
          return (
            <span key={i} className="font-hand text-[1.3em] leading-none text-[var(--accent)]">
              {FAMILY_WORDS[Math.floor(r(9) * FAMILY_WORDS.length)]}
            </span>
          );
        // глитч-шрифт
        if (r(3) < over(STAGE.glitch, 220)) return <span key={i} className="font-glitch text-[var(--accent)]">{w}</span>;
        // повтор
        if (r(4) < over(STAGE.glitch, 300))
          return (
            <span key={i}>
              {w} <span className="font-hand text-[1.25em] text-[var(--accent)]">{w.toLowerCase()} {w.toLowerCase()}</span>
            </span>
          );
        // дрожь и чужие буквы
        if (r(5) < over(STAGE.glitch - 10, 160))
          return (
            <span key={i} className="inline-block whitespace-nowrap">
              {[...w].map((c, j) => (
                <span key={j} className="mad-jit inline-block" style={{ animationDelay: `${-r(20 + j) * 2}s` }}>
                  {r(40 + j) < over(STAGE.glitch, 120) && ODD[c] ? ODD[c] : c}
                </span>
              ))}
            </span>
          );
        // рукописные вставки
        if (r(6) < over(STAGE.warp, 280)) return <span key={i} className="font-hand text-[1.25em] leading-none text-[var(--accent)]">{w}</span>;
        return <Fragment key={i}>{w}</Fragment>;
      })}
    </Tag>
  );
}

/** Заголовок, который начинает «плыть» и в конце сам себя переименовывает. */
export function MadTitle({ text, alt, className, size = "clamp(3rem, 9vw, 8.5rem)" }: { text: string; alt?: string; className?: string; size?: string }) {
  const { level } = useInfection();
  const shown = level >= STAGE.critical && alt ? alt : text;
  return (
    <div className={cn(level >= STAGE.critical ? "font-wet" : level >= STAGE.glitch ? "font-hand" : "font-display", className)}>
      <FuzzyText
        key={shown + (level >= STAGE.critical ? "w" : level >= STAGE.glitch ? "h" : "d")}
        fontSize={size}
        fontWeight={level >= STAGE.glitch ? 400 : 600}
        baseIntensity={0.02 + (level / 100) * 0.45}
        hoverIntensity={0.25 + (level / 100) * 0.6}
        fuzzRange={14 + level * 0.5}
        glitchMode={level >= STAGE.warp}
        glitchInterval={Math.max(500, 3000 - level * 25)}
        colorSplit={level >= STAGE.glitch ? 2 : 0}
      >
        {shown}
      </FuzzyText>
    </div>
  );
}
