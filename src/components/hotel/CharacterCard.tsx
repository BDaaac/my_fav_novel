"use client";
import { useState } from "react";
import type { Character } from "@/data/types";
import { Fog } from "./Fog";

export function firstChOf(c: Character) {
  return c.firstCh ?? c.facts.find((f) => f.ch != null)?.ch ?? 1;
}

/** Карточка постояльца в виде окна статуса. */
export function CharacterCard({ c }: { c: Character }) {
  const [more, setMore] = useState(false);
  const facts = more ? c.facts : c.facts.slice(0, 3);
  const ch = firstChOf(c);
  return (
    <div className="system-glow rounded-sm bg-[#07131a]/80 p-4 font-system text-[13px] text-system">
      <div className="flex items-baseline justify-between gap-2 text-[11px] uppercase tracking-[0.2em] text-system/60">
        <span>[ Пользователь ]</span>
        <span>гл. {ch}+</span>
      </div>
      <div className="mt-1 font-display text-2xl normal-case tracking-normal text-paper">
        <Fog text={c.name} ch={ch} />
      </div>
      {c.stat && (
        <div className="mt-1">
          Благословение: <Fog text={c.stat} ch={ch} className="text-brass-soft" />
        </div>
      )}
      <ul className="mt-3 space-y-2 text-paper/75">
        {facts.map((f, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-system/50">›</span>
            <span>
              <Fog text={f.text} ch={f.ch} /> <span className="text-[10px] text-system/40">гл.{f.ch}</span>
            </span>
          </li>
        ))}
      </ul>
      {c.facts.length > 3 && (
        <button onClick={() => setMore(!more)} className="mt-3 text-[11px] text-system/70 hover:text-system">
          [ {more ? "свернуть" : `ещё ${c.facts.length - 3}`} ]
        </button>
      )}
    </div>
  );
}
