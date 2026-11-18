"use client";
import Link from "next/link";
import { TYPE_COLOR, TYPE_LABEL, type DoorInfo } from "@/data/floors";
import { useSpoiler } from "@/lib/spoiler";
import { Fog } from "./Fog";

/** Дверь номера: латунная табличка, цвет по типу комнаты, штамп «ПРОЙДЕНО». */
export function Door({ d }: { d: DoorInfo }) {
  const { readCh } = useSpoiler();
  const cleared = d.type !== "rest" && readCh >= d.chapters[1];
  const ready = d.detailed || d.type === "rest";
  const color = TYPE_COLOR[d.type];

  const body = (
    <div className="group relative flex h-72 w-44 flex-col items-center rounded-t-[5.5rem] border-[3px] border-[#2a1a12] bg-gradient-to-b from-[#2b1810] to-[#160c08] px-3 pt-10 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:-translate-y-1">
      <div className="absolute inset-3 top-6 rounded-t-[5rem] border border-black/50" />
      <div className="relative rounded-sm border border-brass/70 bg-gradient-to-b from-[#d8b54a] to-[#8e6f17] px-4 py-1 font-display text-3xl font-semibold text-[#2a1d05] shadow">
        {d.id}
      </div>
      <div className="relative mt-3 h-1 w-14 rounded-full" style={{ background: color, boxShadow: `0 0 14px ${color}` }} />
      <p className="relative mt-3 text-center font-system text-[10px] uppercase tracking-widest" style={{ color }}>
        {TYPE_LABEL[d.type]}
      </p>
      <p className="relative mt-2 text-center font-display text-lg leading-tight text-paper/85">
        <Fog text={d.title} ch={d.titleCh} />
      </p>
      <span className="absolute right-4 top-[55%] size-3 rounded-full bg-brass shadow-[0_0_8px_rgba(201,162,39,0.6)]" />
      {cleared && (
        <span className="absolute bottom-8 rotate-[-12deg] border-2 border-[#c0333d]/80 px-2 py-0.5 font-system text-[11px] font-bold tracking-widest text-[#c0333d]/90">
          ПРОЙДЕНО
        </span>
      )}
      {!ready && (
        <span className="absolute bottom-3 font-system text-[10px] text-paper/30">табличка «Не беспокоить»</span>
      )}
    </div>
  );

  return ready ? (
    <Link href={`/room/${d.id}`} className="group block">{body}</Link>
  ) : (
    <div className="group cursor-not-allowed opacity-70">{body}</div>
  );
}
