"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Mask, useRoom } from "./state";
import { cn } from "@/lib/utils";

/**
 * Книга судеб (гл. 16–25). Для каждого надо указать, как он погиб и что его смерть дала остальным:
 * это тактика Ынсоль «идти по одному и умирать, чтобы узнать угрозу» (гл. 17).
 * Судьбы подтверждаются только тройками, как в бортовом журнале: угадывать по одной не выйдет.
 */
type Fate = { id: string; name: string; how: string; gave: string; ch: string; note: string };
const HOW = ["задушена тонкой верёвкой", "укол шипом в шею сзади", "яд в пиве", "столкнули в озеро", "сам, кинжалом в горло", "прыжок с обрыва"];
const GAVE = [
  "убийца может быть среди своих",
  "записка из четырёх слов",
  "проверять надо и напитки",
  "в сюжете не показано, только с его слов",
  "время, чтобы Ари дошла до книги",
  "нападение на Гаина прекратилось",
];
const FATES: Fate[] = [
  { id: "elena-ivanova", name: "Елена Иванова", how: HOW[0], gave: GAVE[0], ch: "16–17", note: "Ночь первого дня. Сама открыла дверь знакомому человеку." },
  { id: "lee-eunsol", name: "Ли Ынсоль", how: HOW[1], gave: GAVE[1], ch: "18", note: "Пошла в библиотеку, зная, что станет жертвой." },
  { id: "cha-jinchul", name: "Ча Джинчхоль", how: HOW[2], gave: GAVE[2], ch: "21, 25", note: "Вечер третьего дня, за закуской." },
  { id: "park-seungyeop", name: "Пак Сынёп", how: HOW[3], gave: GAVE[3], ch: "25", note: "«Нуна позвала прогуляться к озеру»." },
  { id: "han-gain", name: "Хан Гаин", how: HOW[4], gave: GAVE[4], ch: "23–24", note: "В Соборе, с колоколом в руках." },
  { id: "kim-mukseon", name: "Ким Муксон", how: HOW[5], gave: GAVE[5], ch: "23", note: "На вершине, после колокольного звона." },
];

export function Fates() {
  const { fates, locked: lockedIds, lock } = useRoom();
  const locked = new Set(lockedIds);
  const [pick, setPick] = useState<Record<string, { how?: string; gave?: string }>>({});
  const [flash, setFlash] = useState(0);

  const set = (id: string, k: "how" | "gave", v: string) => {
    const next = { ...pick, [id]: { ...pick[id], [k]: v } };
    setPick(next);
    // подтверждение тройками: как только набралось три верных и ещё не закрытых — закрываем все три
    const right = FATES.filter((f) => !locked.has(f.id) && next[f.id]?.how === f.how && next[f.id]?.gave === f.gave);
    if (right.length >= 3) {
      const l = new Set(locked);
      right.slice(0, 3).forEach((f) => l.add(f.id));
      lock([...l]);
      setFlash((x) => x + 1);
    }
  };

  return (
    <section className="relative overflow-hidden text-[#e6dcc6]">
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#c9b27a]">КНИГА СУДЕБ · ГЛ. 16–25</div>
        <h2 className="mt-2 font-display text-5xl md:text-6xl">Кто, как и зачем</h2>
        <p className="mt-4 max-w-2xl font-display text-[19px] leading-relaxed opacity-85">
          План Ынсоль: идти в опасное по одному и умирать, чтобы узнать угрозу. Здесь силы бесполезны, выжить можно только разумом. Установите для каждого, как он погиб и что это дало остальным. Судьбы подтверждаются по три.
        </p>
        <div className="mt-3 font-system text-[12px] text-[#c9b27a]">
          установлено {fates} из 6
          <AnimatePresence>
            {flash > 0 && (
              <motion.span key={flash} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 2.4 }} className="ml-3 text-[#e9dcb6]">
                три судьбы подтверждены
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FATES.map((f) => {
            const done = locked.has(f.id);
            const p = pick[f.id] ?? {};
            return (
              <div key={f.id} className={cn("relative border bg-[#1c1812] p-4 transition", done ? "border-[#c9b27a] shadow-[0_0_30px_-10px_#c9b27a]" : "border-white/12")}>
                <div className="flex gap-3">
                  <div className="relative h-24 w-[72px] shrink-0 overflow-hidden border border-black bg-black">
                    <Image src={`/art/people/${f.id}.jpg`} alt={f.name} fill sizes="72px" unoptimized className={cn("object-cover transition duration-700", done ? "grayscale-0" : "grayscale brightness-50")} />
                    {done && <span className="absolute inset-0 border-2 border-[#c0333d]/70" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-2xl leading-tight">
                      {f.id === "kim-mukseon" ? <Mask role="Дворецкий" truth={f.name} /> : f.name}
                    </div>
                    <div className="mt-0.5 font-hand text-lg leading-tight text-[#c9b27a]">{f.note}</div>
                  </div>
                </div>
                {done ? (
                  <div className="mt-3 space-y-1 font-display text-[16px]">
                    <div>
                      <span className="font-system text-[10px] uppercase tracking-widest opacity-55">как · </span>
                      {f.how}
                    </div>
                    <div>
                      <span className="font-system text-[10px] uppercase tracking-widest opacity-55">что дало · </span>
                      {f.gave}
                    </div>
                    <div className="font-system text-[10px] opacity-50">гл. {f.ch}</div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {(["how", "gave"] as const).map((k) => (
                      <select
                        key={k}
                        value={p[k] ?? ""}
                        onChange={(e) => set(f.id, k, e.target.value)}
                        aria-label={`${f.name}: ${k === "how" ? "как погиб" : "что это дало"}`}
                        className="w-full border border-white/20 bg-[#14110d] px-2 py-1.5 font-display text-[15px] text-[#e6dcc6] outline-none focus:border-[#c9b27a]"
                      >
                        <option value="">{k === "how" ? "как…" : "что это дало…"}</option>
                        {(k === "how" ? HOW : GAVE).map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {fates >= 6 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border border-[#c0333d]/50 bg-[#1a0c0d] p-5">
              <div className="font-system text-[11px] uppercase tracking-[0.3em] text-[#ff8a8a]">Кто убивал · гл. 25</div>
              <p className="mt-2 font-display text-[19px] leading-relaxed">
                К Елене ночью вошла Сонъи. Ынсоль перед ударом встретила в коридоре её же. Пиво Джинчхолю подавала она. В Сонъи сидел Старейшина: он вселился, когда она коснулась статуи у входа. Ынсоль подозревала и успела написать только первую букву её имени.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ───────────────────────── записка и колокол ─────────────────────────

const WHO = ["один", "с Джинчхолем", "с Ари", "с дворецким"];
const WHERE = ["к лодке", "в библиотеку", "в Собор", "на гору"];
const WHAT = ["обыскать", "ждать ночи", "ударить в колокол", "плыть"];

/** Записка Ынсоль (гл. 18) и то, что из неё вышло (гл. 20). */
export function Note() {
  const { bell, ring } = useRoom();
  const [w, setW] = useState([0, 0, 0]);
  const [tried, setTried] = useState(0);
  const ok = w[0] === 2 && w[1] === 2 && w[2] === 2;
  const row = (i: number, opts: string[]) => (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o, j) => (
        <button key={o} onClick={() => setW((v) => v.map((x, k) => (k === i ? j : x)))} className={cn("border px-3 py-1 font-display text-[16px] transition", w[i] === j ? "border-[#c9b27a] bg-[#c9b27a] text-[#14110a]" : "border-white/20 hover:bg-white/10")}>
          {o}
        </button>
      ))}
    </div>
  );
  return (
    <section className="relative overflow-hidden text-[#dfe6e2]">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-[320px_1fr]">
        <div>
          <motion.div initial={{ rotate: -4 }} whileHover={{ rotate: 0 }} className="mx-auto w-[260px] bg-[#efe6cf] p-6 text-[#2a2218] shadow-[0_18px_30px_rgba(0,0,0,0.6)]">
            <div className="font-system text-[9px] uppercase tracking-widest opacity-50">в ладони Гаина · гл. 18</div>
            <div className="mt-3 font-hand text-[40px] leading-[1.05]">
              С
              <br />
              собор,
              <br />
              мейд,
              <br />
              колокол
            </div>
          </motion.div>
          <p className="mt-4 text-center font-hand text-xl text-[#9fb8b0]">«С» — опечатка? Она начала писать «собор»?</p>
        </div>

        <div>
          <div className="font-system text-[12px] tracking-[0.3em] text-[#9fb8b0]">ДЕНЬ 3 · ГЛ. 18, 20</div>
          <h2 className="mt-2 font-display text-5xl">Четыре слова</h2>
          <p className="mt-4 max-w-xl font-display text-[19px] leading-relaxed opacity-85">Ынсоль просто выписала ключевые слова из документов и не знала, что в Соборе есть колокол. Вывод Гаину пришлось делать самому. Что он сделал?</p>
          <div className="mt-6 space-y-3">
            <div>
              <div className="mb-1 font-system text-[10px] uppercase tracking-widest opacity-55">пойти</div>
              {row(0, WHO)}
            </div>
            <div>
              <div className="mb-1 font-system text-[10px] uppercase tracking-widest opacity-55">куда</div>
              {row(1, WHERE)}
            </div>
            <div>
              <div className="mb-1 font-system text-[10px] uppercase tracking-widest opacity-55">и</div>
              {row(2, WHAT)}
            </div>
          </div>
          <button
            onClick={() => {
              setTried((t) => t + 1);
              if (ok) ring();
            }}
            className="mt-6 border border-[#c9b27a] px-6 py-2 font-display text-xl text-[#e9dcb6] hover:bg-[#c9b27a]/15"
          >
            Сделать
          </button>
          {tried > 0 && !ok && !bell && <p className="mt-3 font-hand text-2xl text-[#ff8a8a]">Ничего не изменилось. В доме стало на одного меньше.</p>}

          <AnimatePresence>
            {bell && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 border border-[#c9b27a]/50 bg-black/45 p-5">
                <div className="font-system text-[11px] uppercase tracking-[0.3em] text-[#c9b27a]">Колокол ударил · гл. 20</div>
                <p className="mt-2 font-display text-[19px] leading-relaxed">Ари меняется на глазах. Изо рта идёт чёрный дым с тошнотворной вонью, и она говорит нараспев. Вот что она говорит, в пересказе:</p>
                <p className="mt-3 border-l-2 border-[#c0333d] pl-4 font-hand text-[26px] leading-tight text-[#f0c9c9]">
                  Есть глубокая яма, и в ней плачет Нерождённый. Отец на небесах берёг людей, а самому жалкому дитя в самом низком месте родиться не дал. Оно ползёт наверх. Двое уже отданы верной рукой, осталось трое. Скоро Нерождённый отберёт место у рождённого.
                </p>
                <p className="mt-3 font-display text-[17px] opacity-80">Двое — это Елена и Ынсоль. Колокол теперь у вас: кнопка в окне статуса справа. Ударьте и посмотрите на подписи слуг в начале страницы.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
