"use client";
import { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useStage } from "@/stage/Stage";
import { useCurtain } from "@/stage/Curtain";
import { cn } from "@/lib/utils";

/**
 * Номер 102 «Особняк Ужасов», первый заход (гл. 14–25).
 * Комната разбита на сцены-маршруты, поэтому прогресс живёт в хранилище и переживает переходы:
 * звонил ли колокол, какие судьбы установлены, сведена ли партия вничью, совершён ли побег.
 */
type Store = {
  tolls: number;
  locked: string[];
  draw: boolean;
  escaped: boolean;
  ring: () => void;
  lock: (ids: string[]) => void;
  setDraw: (v: boolean) => void;
  setEscaped: (v: boolean) => void;
  reset: () => void;
};
const useStore = create<Store>()(
  persist(
    (set) => ({
      tolls: 0,
      locked: [],
      draw: false,
      escaped: false,
      ring: () => set((s) => ({ tolls: s.tolls + 1 })),
      lock: (ids) => set({ locked: ids }),
      setDraw: (draw) => set({ draw }),
      setEscaped: (escaped) => set({ escaped }),
      reset: () => set({ tolls: 0, locked: [], draw: false, escaped: false }),
    }),
    { name: "room102", storage: createJSONStorage(() => sessionStorage), skipHydration: true },
  ),
);

/** Прогресс поднимается из sessionStorage уже в браузере. */
export function useHydrateRoom() {
  useEffect(() => {
    void useStore.persist.rehydrate();
  }, []);
}

const ArtCtx = createContext<string[]>([]);
export const ArtProvider = ArtCtx.Provider;

export function useRoom() {
  const s = useStore();
  const files = useContext(ArtCtx);
  const art = (base: string) => {
    for (const ext of [".jpg", ".png", ".webp"]) if (files.includes(base + ext)) return `/art/102/${base}${ext}`;
    return null;
  };
  // колокол бьёт по всей сцене: волна и вспышка в шейдере
  const ring = () => {
    s.ring();
    useStage.getState().shock();
  };
  return { ...s, art, ring, bell: s.tolls > 0, fates: s.locked.length };
}

// ───────────────────────── сцены ─────────────────────────

export type SceneDef = { id: string; href: string; kicker: string; title: string; art: string; rain: number; dark: number };
export const SCENES: SceneDef[] = [
  { id: "arrival", href: "/archive/102", kicker: "ДЕНЬ 1 · ГЛ. 15", title: "Особняк Ужасов", art: "manor", rain: 0.85, dark: 0.3 },
  { id: "house", href: "/archive/102/house", kicker: "ДОМ В РАЗРЕЗЕ · ГЛ. 16–24", title: "Четыре дня", art: "hall", rain: 0.3, dark: 0.62 },
  { id: "fates", href: "/archive/102/fates", kicker: "КНИГА СУДЕБ · ГЛ. 16–25", title: "Кто, как и зачем", art: "library", rain: 0.12, dark: 0.55 },
  { id: "note", href: "/archive/102/note", kicker: "ДЕНЬ 3 · ГЛ. 18, 20", title: "Четыре слова", art: "bell", rain: 0.65, dark: 0.55 },
  { id: "cards", href: "/archive/102/cards", kicker: "НОЧЬ ТРЕТЬЕГО ДНЯ · ГЛ. 21", title: "Партия", art: "table", rain: 0.25, dark: 0.3 },
  { id: "hill", href: "/archive/102/hill", kicker: "ДЕНЬ 4 · ГЛ. 22–23", title: "Священник", art: "hill", rain: 1, dark: 0.5 },
  { id: "finale", href: "/archive/102/finale", kicker: "ФИНАЛ · ГЛ. 23–24", title: "Жертва вместо дьявола", art: "statue", rain: 0.7, dark: 0.6 },
];

/** Обёртка сцены: ставит свой арт и погоду на общий холст. */
export function Scene({ id, children }: { id: string; children: React.ReactNode }) {
  const { art } = useRoom();
  const def = SCENES.find((s) => s.id === id)!;
  const img = art(def.art);
  useEffect(() => {
    useStage.getState().set({ image: img, rain: def.rain, dark: def.dark });
  }, [img, def.rain, def.dark]);
  return <div className="relative z-10 min-h-screen pb-28">{children}</div>;
}

/** Подпись, которую переписывает колокол: роль → тот, кто под ней на самом деле. */
export function Mask({ role, truth, className }: { role: string; truth: string; className?: string }) {
  const { bell, tolls } = useRoom();
  return (
    <motion.span key={`${bell}${tolls}`} initial={bell ? { opacity: 0.2, filter: "blur(3px)" } : false} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.9 }} className={className}>
      {bell ? truth : role}
    </motion.span>
  );
}

/** Окно отеля: в этой комнате оно почти ничего не говорит. Плюс колокол в руке, когда он найден. */
export function Hud() {
  const { bell, ring, fates, draw, escaped } = useRoom();
  return (
    <div className="fixed right-5 top-5 z-30 w-[290px] font-system text-[12px] text-[#7fd4ff]">
      <div className="border border-[#7fd4ff]/50 bg-[#06141c]/90 px-3 py-2 shadow-[0_0_24px_-8px_#7fd4ff]">
        <div>[Номер 102 · {escaped ? "побег совершён" : "Особняк Ужасов"}]</div>
        <div className="mt-1 opacity-70">Цель: {escaped ? "выполнена" : "не указана"}</div>
        <div className="mt-1.5 flex justify-between opacity-90">
          <span>судьбы: {fates}/6</span>
          <span>{draw ? "партия: ничья" : "партия: —"}</span>
        </div>
      </div>
      {bell && !escaped && (
        <button onClick={ring} className="mt-2 flex w-full items-center justify-between border border-[#d9c27a]/60 bg-[#14110a]/90 px-3 py-1.5 text-[#e9d9a0] transition hover:bg-[#d9c27a]/15">
          <span>Колокол Собора</span>
          <span className="opacity-70">ударить</span>
        </button>
      )}
    </div>
  );
}

/** Нижняя лента сцен: где ты, что пройдено, куда дальше. */
export function SceneNav() {
  const pathname = usePathname();
  const go = useCurtain((s) => s.go);
  const i = Math.max(0, SCENES.findIndex((s) => s.href === pathname));
  const jump = (k: number) => {
    const s = SCENES[k];
    if (s && k !== i) go({ href: s.href, kicker: s.kicker, title: s.title });
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-center gap-4 bg-gradient-to-t from-[#050606] via-[#050606]/85 to-transparent px-6 pb-4 pt-10">
      <button onClick={() => jump(i - 1)} disabled={i === 0} className="border border-white/25 px-3 py-1.5 font-system text-[12px] text-[#dfe6e2] transition hover:bg-white/10 disabled:opacity-20">
        ←
      </button>
      <ol className="flex items-center gap-1.5">
        {SCENES.map((s, k) => (
          <li key={s.id}>
            <button onClick={() => jump(k)} aria-label={s.title} aria-current={k === i} className="group relative flex h-8 items-center px-1.5">
              <span className={cn("block h-[3px] transition-all duration-300", k === i ? "w-12 bg-[#c9b27a]" : k < i ? "w-6 bg-[#c9b27a]/45" : "w-6 bg-white/20 group-hover:bg-white/50")} />
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap font-system text-[10px] tracking-wider text-[#dfe6e2] opacity-0 transition-opacity group-hover:opacity-100">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <button
        onClick={() => jump(i + 1)}
        disabled={i === SCENES.length - 1}
        className="border border-[#c9b27a] px-4 py-1.5 font-system text-[12px] tracking-widest text-[#e9dcb6] transition hover:bg-[#c9b27a]/15 disabled:opacity-20"
      >
        {SCENES[i + 1] ? `ДАЛЬШЕ · ${SCENES[i + 1].title.toUpperCase()}` : "КОНЕЦ"}
      </button>
    </nav>
  );
}
