import Link from "next/link";
import hotel from "@/data/hotel.json";
import characters from "@/data/characters.json";
import type { Character, Fact } from "@/data/types";
import { StatusWindow } from "@/components/hotel/StatusWindow";
import { CharacterCard } from "@/components/hotel/CharacterCard";
import { Fog } from "@/components/hotel/Fog";

const TEAM = ["han-gain", "cha-jinchul", "yu-sonyi", "elena-ivanova", "park-seungyeop", "lee-eunsol"];

export default function RestRoom() {
  const chars = characters as Character[];
  const team = TEAM.map((id) => chars.find((c) => c.id === id)!).filter(Boolean);
  const others = chars.filter((c) => !TEAM.includes(c.id));
  const room = hotel.room105 as { summary: string; facts: Fact[]; statusWindowExample: string };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#0d2230,transparent_60%)] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-system text-xs text-system/60 hover:text-system">← лобби</Link>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-system text-xs uppercase tracking-[0.3em] text-system/70">Уровень 1 · Комната Отдыха</p>
            <h1 className="font-display text-7xl text-paper">105</h1>
            <p className="max-w-xl font-display text-xl italic text-paper/60">{room.summary}</p>
          </div>
          {/* Монстр у порога */}
          <div aria-hidden className="relative h-40 w-28 shrink-0 self-center rounded-t-full border-2 border-brass/40 bg-black/60">
            <div className="absolute inset-x-6 bottom-0 h-28 rounded-t-full bg-gradient-to-b from-[#1a0a0b] to-black blur-[1px]" />
            <div className="absolute left-9 top-14 size-1.5 rounded-full bg-[#ff3b47] shadow-[0_0_8px_#ff3b47]" />
            <div className="absolute right-9 top-14 size-1.5 rounded-full bg-[#ff3b47] shadow-[0_0_8px_#ff3b47]" />
            <p className="absolute -bottom-6 w-full text-center font-system text-[10px] text-paper/40">не может войти</p>
          </div>
        </div>

        <StatusWindow className="mt-10">{room.statusWindowExample.split(" / ").map((l, i) => <div key={i}>{l}</div>)}</StatusWindow>

        <h2 className="mt-14 font-display text-3xl text-brass">Постояльцы</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {team.map((c) => <CharacterCard key={c.id} c={c} />)}
        </div>

        <h2 className="mt-14 font-display text-3xl text-brass">Прочие лица</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {others.map((c) => <CharacterCard key={c.id} c={c} />)}
        </div>

        <h2 className="mt-14 font-display text-3xl text-brass">Что известно о комнате</h2>
        <ul className="mt-4 space-y-2 text-paper/80">
          {room.facts.map((f, i) => (
            <li key={i} className="border-l border-system/30 pl-3"><Fog text={f.text} ch={f.ch} /></li>
          ))}
        </ul>
      </div>
    </main>
  );
}
