import type { Hero } from "@/data/passivki/types";
import t from "./tablet.module.css";
import c from "./card.module.css";

type Kind = "wood" | "dead" | "iron";

/** Табличка говорит о хозяине без слов: лак — люди Дворца, железо — чужаки, чёрный шнур — погибшие. */
export function tabletKind(h: Pick<Hero, "tablet" | "fate">): Kind {
  if (h.tablet === "iron") return "iron";
  return h.fate === "dead" ? "dead" : "wood";
}
const CHARM: Record<Kind, string> = {
  wood: "/art/passivki/tablet-wood.webp",
  dead: "/art/passivki/tablet-wood-dead.webp",
  iron: "/art/passivki/tablet-iron.webp",
};
/** Уголки таблички говорят, откуда герой: облака — Внешний двор, меандр — старейшины, слива и бамбук — Внутренний двор. */
function cardArt(h: Pick<Hero, "id" | "tablet" | "fate" | "circle">): { src: string; look: string } {
  const kind = tabletKind(h);
  if (kind === "iron") return { src: "/art/passivki/card-iron.webp", look: "iron" };
  if (kind === "dead") return { src: "/art/passivki/card-dead2.webp", look: "dead" };
  const v = h.circle === "outer" ? "a" : h.circle === "elders" ? "b" : [...h.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 2 ? "c" : "d";
  return { src: `/art/passivki/card-${v}.webp`, look: v };
}

/** Окно портрета. Пока портрет не написан и не утверждён, в окне стоит только первая буква имени. */
export function Portrait({ d, has, className }: { d: Pick<Hero, "id" | "name">; has: boolean; className?: string }) {
  return (
    <span className={className} data-empty={has ? undefined : ""}>
      {has ? <img src={`/art/passivki/portraits/${d.id}.webp`} alt="" /> : <i aria-hidden="true">{d.name[0]}</i>}
    </span>
  );
}

/** Узкий брелок на шнуре (рейка в комнате летописца): портрет в окне и имя на нижнем поле. */
export function Tablet({ d, has, name = true }: { d: Hero; has: boolean; name?: boolean }) {
  const kind = tabletKind(d);
  return (
    <span className={t.tablet} data-kind={kind}>
      <img className={t.img} src={CHARM[kind]} alt="" />
      <Portrait d={d} has={has} className={t.window} />
      {name && <span className={t.name}>{d.name}</span>}
    </span>
  );
}

/** Широкая поясная табличка на столе: портрет, имя, принадлежность. */
export function Card({ d, has, text = true }: { d: Hero; has: boolean; text?: boolean }) {
  const art = cardArt(d);
  return (
    <span className={c.card} data-kind={art.look}>
      <img className={c.img} src={art.src} alt="" />
      <Portrait d={d} has={has} className={c.window} />
      {text && (
        <span className={c.label}>
          <b>{d.name}</b>
          <i>{d.affiliation}</i>
        </span>
      )}
    </span>
  );
}
