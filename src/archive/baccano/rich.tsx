import { Fragment } from "react";

/** **Имя** → жирное; [вывод …] / [противоречие] → пометка агентства мелкой машинописью. */
export function Rich({ text, tagClass }: { text: string; tagClass?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**")) return <b key={i}>{p.slice(2, -2)}</b>;
        if (p.startsWith("[") && p.endsWith("]"))
          return (
            <span key={i} className={tagClass}>
              {p.slice(1, -1)}
            </span>
          );
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export function stampFor(im: string): string | null {
  if (im === "true") return "Бессмертие";
  if (im === "partial") return "Бессмертие: частично";
  if (im === "unknown") return "Бессмертие: не установлено";
  return null;
}
