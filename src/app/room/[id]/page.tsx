import Link from "next/link";
import { notFound } from "next/navigation";
import rooms from "@/data/rooms.json";
import characters from "@/data/characters.json";
import type { Character, Room } from "@/data/types";
import { FLOOR_1, TYPE_COLOR, TYPE_LABEL, type RoomType } from "@/data/floors";
import { Fog } from "@/components/hotel/Fog";
import { StatusWindow } from "@/components/hotel/StatusWindow";
import { Acts } from "@/components/hotel/Acts";

const ROOMS = rooms as unknown as Room[];

export function generateStaticParams() {
  return ROOMS.map((r) => ({ id: r.id }));
}

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = ROOMS.find((r) => r.id === id);
  const door = FLOOR_1.find((d) => d.id === id);
  if (!room || !door) notFound();
  const accent = door.accent;
  const chars = characters as Character[];
  const team = room.team.map((t) => chars.find((c) => c.id === t)?.name ?? t);

  return (
    <main
      className="min-h-screen px-4 pb-24 pt-10"
      style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${accent}33, transparent 70%), #0b0a09` }}
    >
      <div className="mx-auto max-w-4xl">
        <Link href={`/floor/${room.floor}`} className="font-system text-xs text-paper/50 hover:text-brass">← коридор, этаж {room.floor}</Link>

        {/* Шапка */}
        <header className="mt-8 text-center">
          <div className="inline-block rounded-sm border border-brass/70 bg-gradient-to-b from-[#d8b54a] to-[#8e6f17] px-6 py-1 font-display text-4xl font-semibold text-[#2a1d05]">
            {room.id}
          </div>
          <p className="mt-4 font-system text-xs uppercase tracking-[0.35em]" style={{ color: TYPE_COLOR[room.type as RoomType] }}>
            {TYPE_LABEL[room.type as RoomType]}
          </p>
          <h1 className="mt-2 font-display text-5xl text-paper md:text-6xl">
            <Fog text={room.title} ch={door.titleCh} />
          </h1>
          <p className="mt-2 font-system text-xs text-paper/40">главы {room.chapters[0]}–{room.chapters[1]}</p>
          {door.reruns && (
            <div className="mt-5 flex flex-wrap justify-center gap-2 font-system text-[11px]">
              <span className="rounded-sm border border-brass/60 px-3 py-1 text-brass">Первый заход</span>
              {door.reruns.map((r) => (
                <span key={r.title} title="Скоро" className="rounded-sm border border-paper/15 px-3 py-1 text-paper/40">
                  <Fog text={r.title} ch={r.chapters[0]} /> · гл. {r.chapters[0]}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Сценарий */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <StatusWindow title="Сценарий апокалипсиса" tone="danger">
            <Fog text={room.apocalypse.text} ch={room.apocalypse.ch} />
            {room.apocalypse.deadline && (
              <div className="mt-3 text-[#ff6b74]">⏳ <Fog text={room.apocalypse.deadline} ch={room.apocalypse.ch} /></div>
            )}
          </StatusWindow>
          <StatusWindow title="Условие прохождения">
            <Fog text={room.clearCondition.text} ch={room.clearCondition.ch} />
          </StatusWindow>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-3xl text-brass">Мир за дверью</h2>
          <p className="mt-2 text-lg text-paper/80"><Fog text={room.world.text} ch={room.world.ch} /></p>
          <p className="mt-3 font-display italic text-paper/45">Мотив: {room.mood.motif}</p>
        </section>

        {/* Злой бог */}
        <section className="mt-12">
          <StatusWindow title="Досье: злой бог" tone="danger">
            <div className="font-display text-3xl normal-case text-paper">
              {room.god.name ? <Fog text={room.god.name} ch={room.god.nameCh} /> : <span className="text-paper/40">Безымянный Источник Проклятий</span>}
            </div>
            <ul className="mt-3 space-y-2 text-[#f2c9cc]/85">
              {room.god.facts.map((f, i) => (
                <li key={i} className="flex gap-2"><span className="text-[#ff6b74]/60">›</span><Fog text={f.text} ch={f.ch} /></li>
              ))}
            </ul>
          </StatusWindow>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-3xl text-brass">Кто вошёл</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {team.map((n) => (
              <span key={n} className="rounded-sm border border-system/40 bg-[#07131a]/70 px-3 py-1 font-system text-xs text-system">{n}</span>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="mb-8 font-display text-3xl text-brass">Ход событий</h2>
          <Acts acts={room.acts} accent={accent} />
        </section>

        {/* Исход */}
        <section className="mt-16 text-center">
          <div className="mx-auto inline-block rotate-[-3deg] border-4 border-[#c0333d]/80 px-6 py-2 font-system text-xl font-bold tracking-[0.3em] text-[#c0333d]">
            <Fog text="ИСХОД" ch={room.outcome.ch} />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-paper/80"><Fog text={room.outcome.text} ch={room.outcome.ch} /></p>
        </section>
      </div>
    </main>
  );
}
