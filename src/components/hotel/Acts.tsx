"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Fog } from "./Fog";

type Act = { title: string; text: string; ch: [number, number] };

/** Ход событий по актам, вдоль латунной «трассирующей» линии. */
export function Acts({ acts, accent }: { acts: Act[]; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const h = useSpring(scrollYProgress, { stiffness: 300, damping: 40 });
  return (
    <div ref={ref} className="relative pl-10">
      <div className="absolute left-3 top-1 bottom-1 w-px bg-paper/10" />
      <motion.div
        className="absolute left-3 top-1 w-px origin-top"
        style={{ scaleY: h, bottom: 4, background: `linear-gradient(${accent}, #c9a227)`, boxShadow: `0 0 10px ${accent}` }}
      />
      <ol className="space-y-10">
        {acts.map((a, i) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-[2.15rem] top-1 grid size-5 place-items-center rounded-full border bg-hotel-black font-system text-[10px]"
              style={{ borderColor: accent, color: accent }}
            >
              {i + 1}
            </span>
            <p className="font-system text-[11px] text-paper/40">гл. {a.ch[0]}{a.ch[1] !== a.ch[0] ? `–${a.ch[1]}` : ""}</p>
            <h3 className="font-display text-2xl text-paper">
              <Fog text={a.title} ch={a.ch[0]} />
            </h3>
            <p className="mt-1 max-w-2xl text-paper/70">
              <Fog text={a.text} ch={a.ch[1]} />
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
