"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Blackout } from "../room101/story";
import { Mask, useRoom } from "./state";
import { cn } from "@/lib/utils";

/** День 4, склон (гл. 22–23): три срочных Совета Мудреца подряд, потом капсаицин. */
const ADVICE = [
  { text: "Срочно: 3 шага влево!", btn: "влево", pos: "left-[8%]" },
  { text: "Отступите назад!", btn: "назад", pos: "left-1/2 -translate-x-1/2" },
  { text: "Дёрните за камень справа!", btn: "камень", pos: "right-[8%]" },
] as const;

export function Hill() {
  const [step, setStep] = useState(-1); // -1 — до нападения, 3 — деревья упали, 4 — спрей, 5 — колокол
  const [fail, setFail] = useState(false);
  const left = Math.max(0, 3 - Math.max(0, step));
  return (
    <section className="relative overflow-hidden text-[#dfe6e2]">
      <div className="relative mx-auto max-w-5xl px-6 py-24">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#9fb8b0]">ДЕНЬ 4 · СКЛОН · ГЛ. 22–23</div>
        <h2 className="mt-2 font-display text-5xl md:text-6xl">Священник</h2>
        <p className="mt-4 max-w-2xl font-display text-[19px] leading-relaxed opacity-85">
          Склон превратился в грязевую кашу, камни скользят. Гаин выдохся. <Mask role="Дворецкий" truth="Тот, кто играет дворецкого," /> рассказывает, что был священником Собора, что его внучка сломалась в этом доме и что он отдал всё, чтобы её вернули. Потом достаёт шило из подсвечника.
        </p>

        <div className="relative mt-8 h-[300px] overflow-hidden border border-white/12 bg-black/40">
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[#0a0e0d] [clip-path:polygon(0_100%,0_70%,22%_40%,45%_62%,70%_18%,100%_55%,100%_100%)]" />
          <div className="absolute right-4 top-4 border border-[#7fd4ff]/50 bg-[#06141c]/90 px-3 py-1.5 font-system text-[12px] text-[#7fd4ff]">[Совет Мудреца: {left}]</div>

          {step === -1 && (
            <button onClick={() => setStep(0)} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#c0333d] px-6 py-2 font-display text-xl text-[#ffb0b0] hover:bg-[#c0333d]/20">
              Он нападает
            </button>
          )}
          {step >= 0 && step < 3 && (
            <>
              <motion.div key={step} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute left-1/2 top-8 -translate-x-1/2 border border-[#7fd4ff] bg-[#06141c]/95 px-4 py-2 font-system text-[15px] text-[#7fd4ff] shadow-[0_0_30px_-6px_#7fd4ff]">
                [{ADVICE[step].text}]
              </motion.div>
              {ADVICE.map((a, i) => (
                <button
                  key={a.btn}
                  onClick={() => {
                    if (i === step) {
                      setFail(false);
                      setStep(step + 1);
                    } else setFail(true);
                  }}
                  className={cn("absolute bottom-6 border border-white/40 bg-black/60 px-5 py-2 font-system text-[13px] uppercase tracking-widest hover:bg-white/15", a.pos)}
                >
                  {a.btn}
                </button>
              ))}
              {fail && <p className="absolute inset-x-0 top-24 text-center font-hand text-2xl text-[#ff8a8a]">Шило проходит в сантиметре. Слушайте окно.</p>}
            </>
          )}
          {step === 3 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="font-display text-[20px]">Гнилые деревья рушатся на него. Советов больше нет.</p>
              <button onClick={() => setStep(4)} className="border border-[#c9b27a] px-5 py-2 font-display text-lg text-[#e9dcb6] hover:bg-[#c9b27a]/15">
                Брызнуть капсаицином
              </button>
            </div>
          )}
          {step === 4 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="font-display text-[20px]">Спрей сработал. Гаин подходит ближе, и получает кухонный нож в бедро.</p>
              <button onClick={() => setStep(5)} className="border border-[#c9b27a] px-5 py-2 font-display text-lg text-[#e9dcb6] hover:bg-[#c9b27a]/15">
                Снизу доносится колокол
              </button>
            </div>
          )}
          {step === 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <p className="max-w-xl font-display text-[20px] leading-relaxed">Священник замирает. В его теле просыпается кто-то другой, и этот другой знает про отель. Он хвалит Гаина и шагает с обрыва.</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Финал (гл. 23–24). Два дела сразу: Гаин в Соборе с колоколом тянет разговор со Старейшиной,
 * а Ари спускается под библиотеку за книгой. Замолчишь — статуи подойдут ближе.
 */
export function Finale() {
  const { art, bell, draw, escaped, setEscaped } = useRoom();
  const ready = bell && draw;
  const [talking, setTalking] = useState(false);
  const [descent, setDescent] = useState(0); // спуск Ари, 0..1
  const [statues, setStatues] = useState(0); // 0..1, дошли — конец
  const [phase, setPhase] = useState<"idle" | "run" | "book" | "caught" | "end">(escaped ? "end" : "idle");
  const abyss = art("abyss");
  const statue = art("statue");

  useEffect(() => {
    if (phase !== "run") return;
    const id = setInterval(() => {
      if (talking) {
        setDescent((d) => Math.min(1, d + 0.012));
        setStatues((s) => Math.max(0, s - 0.004));
      } else setStatues((s) => Math.min(1, s + 0.02));
    }, 60);
    return () => clearInterval(id);
  }, [phase, talking]);
  useEffect(() => {
    if (phase !== "run") return;
    if (descent >= 1) {
      setTalking(false);
      setPhase("book");
    } else if (statues >= 1) {
      setTalking(false);
      setPhase("caught");
    }
  }, [descent, statues, phase]);

  const start = () => {
    setDescent(0);
    setStatues(0);
    setPhase("run");
  };

  return (
    <section className="relative overflow-hidden text-[#dfe6e2]">
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#9fb8b0]">ДЕНЬ 4 · ФИНАЛ · ГЛ. 23–24</div>
        <h2 className="mt-2 font-display text-5xl md:text-6xl">Жертва вместо дьявола</h2>
        <p className="mt-4 max-w-2xl font-display text-[19px] leading-relaxed opacity-85">
          У входа рядом со статуей стоит Сонъи. Гаин называет её Старейшиной. По взмаху её руки оживают статуи сада. Гаин бежит к Собору и берёт колокол: к нему Старейшина прикоснуться не может. Ари в это время идёт в библиотеку.
        </p>

        {!ready && (
          <div className="mt-8 border border-dashed border-white/20 p-5 font-display text-[18px] opacity-80">
            Финал ещё закрыт. Нужны две вещи из книги:
            <ul className="mt-2 space-y-1 font-system text-[13px]">
              <li className={cn(bell ? "text-[#c9b27a]" : "opacity-60")}>{bell ? "✓" : "·"} колокол Собора</li>
              <li className={cn(draw ? "text-[#c9b27a]" : "opacity-60")}>{draw ? "✓" : "·"} ничья в партии с «другой Ари»</li>
            </ul>
          </div>
        )}

        {ready && phase !== "end" && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {/* Собор: Гаин и статуи */}
            <div className="relative h-[340px] overflow-hidden border border-white/12 bg-[#101615]">
              {statue && <Image src={statue} alt="" fill sizes="50vw" className="object-cover opacity-40" />}
              <div className="absolute left-4 top-3 font-system text-[10px] uppercase tracking-widest text-[#9fb8b0]">Собор · Гаин</div>
              {/* статуи подходят */}
              <div className="absolute inset-x-6 bottom-16">
                <div className="flex justify-between font-system text-[10px] opacity-70">
                  <span>статуи</span>
                  <span>порог</span>
                </div>
                <div className="mt-1 h-2 bg-white/10">
                  <div className={cn("h-full transition-all duration-100", statues > 0.7 ? "bg-[#c0333d]" : "bg-[#9fb8b0]")} style={{ width: `${statues * 100}%` }} />
                </div>
              </div>
              {phase === "run" && <p className="absolute inset-x-6 top-12 font-hand text-[24px] leading-tight text-[#e9dcb6]">{talking ? "Гаин говорит. Старейшина слушает и не замечает, что в доме кто-то ещё." : "Тишина. Из глубины особняка ревёт Нерождённый."}</p>}
              <div className="absolute inset-x-6 bottom-4">
                {phase === "idle" || phase === "caught" ? (
                  <button onClick={start} className="w-full border border-[#c9b27a] py-2 font-display text-lg text-[#e9dcb6] hover:bg-[#c9b27a]/15">
                    {phase === "caught" ? "Статуи дошли. Ещё раз" : "Взять колокол"}
                  </button>
                ) : phase === "run" ? (
                  <button
                    onPointerDown={() => setTalking(true)}
                    onPointerUp={() => setTalking(false)}
                    onPointerLeave={() => setTalking(false)}
                    className={cn("w-full select-none border py-2 font-display text-lg transition", talking ? "border-[#e9dcb6] bg-[#e9dcb6] text-[#14110a]" : "border-[#c9b27a] text-[#e9dcb6]")}
                  >
                    {talking ? "тянуть разговор…" : "зажмите: тянуть разговор"}
                  </button>
                ) : (
                  <button onClick={() => setPhase("end")} className="w-full border border-[#c0333d] bg-[#c0333d]/15 py-2 font-display text-lg text-[#ffb0b0] hover:bg-[#c0333d]/30">
                    Кинжал. В горло
                  </button>
                )}
              </div>
            </div>

            {/* Библиотека: Ари спускается */}
            <div className="relative h-[340px] overflow-hidden border border-white/12 bg-black">
              {abyss && <Image src={abyss} alt="" fill sizes="50vw" className="object-cover" style={{ opacity: 0.15 + descent * 0.75 }} />}
              <div className="absolute left-4 top-3 z-10 font-system text-[10px] uppercase tracking-widest text-[#9fb8b0]">Под библиотекой · Ари</div>
              {/* лестница: ступени уходят вниз, чем глубже, тем синее */}
              <div className="absolute inset-0 flex flex-col items-center justify-end gap-1.5 pb-6" style={{ opacity: abyss ? 0.5 : 1 }}>
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={i} className="h-2 transition-colors duration-300" style={{ width: `${78 - i * 4.5}%`, background: i / 14 < descent ? "#5aa0ff" : "#1c2422", boxShadow: i / 14 < descent ? "0 0 12px #5aa0ff88" : "none" }} />
                ))}
              </div>
              <p className="absolute inset-x-6 top-12 z-10 font-hand text-[24px] leading-tight text-[#cfe0ff]">
                {phase === "book" ? "Ржавая дверь. За ней книга в чёрной коже, она светится голубым." : descent > 0.6 ? "Внизу голубоватое свечение." : descent > 0 ? "За картиной рычаг. Шкаф повернулся. Лестница вниз без света." : "Она ещё наверху."}
              </p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {phase === "end" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-6">
              <div className="relative overflow-hidden border border-white/12 bg-black p-6">
                {abyss && <Image src={abyss} alt="" fill sizes="100vw" className="object-cover opacity-35" />}
                <p className="relative max-w-2xl font-display text-[19px] leading-relaxed">
                  Ари открывает книгу и падает в пустоту. Стены чёрные и красные, живые, как внутренности. Вдалеке что-то бесконечно карабкается по стене: его конечности тают от прикосновения и отрастают снова. Жалкий монстр, запертый внутри кого-то ещё более далёкого. Ари сбегает.
                </p>
              </div>
              <div className="mx-auto max-w-2xl space-y-1.5 border border-[#7fd4ff]/50 bg-[#06141c] p-4 font-system text-[13px] text-[#7fd4ff] shadow-[0_0_30px_-10px_#7fd4ff]">
                <div>[Вы успешно совершили побег!]</div>
                <div>[Несанкционированное участие — нарушение. Вы начали в невыгодном положении.]</div>
                <div>[Стратегия «убить жертву вместо дьявола» верна. Ритуал владельца особняка сорван.]</div>
                <div>[Вы сбежали от проклятия. Источник Проклятий всё ещё существует.]</div>
                <div>[Есть сбежавшие. Все участники возвращаются невредимыми.]</div>
              </div>
              <div className="mx-auto grid max-w-3xl gap-4 font-display text-[17px] leading-relaxed md:grid-cols-2">
                <div className="border border-white/12 bg-white/[0.03] p-4">
                  <div className="font-system text-[10px] uppercase tracking-widest text-[#c9b27a]">Кто были слуги · гл. 25</div>
                  <p className="mt-1">Ким Муксон и Ким Ари — агенты Управления по борьбе с хаосом и бедствиями. Они вошли в номер без разрешения отеля и за это были заперты в ролях дворецкого и горничной.</p>
                </div>
                <div className="border border-white/12 bg-white/[0.03] p-4">
                  <div className="font-system text-[10px] uppercase tracking-widest text-[#c9b27a]">Что осталось · гл. 24–25</div>
                  <p className="mt-1">Это побег, а не решение. Наследия нет. Старейшина Ли Сехён и Нерождённый под особняком никуда не делись. В коридоре Гаина первым делом бьют кулаком в лицо.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Blackout
        open={phase === "end" && !escaped}
        lines={["Гаин закалывает себя кинжалом в горло. Старейшине эта жертва не достаётся.", "…Сознание меркнет."]}
        status={["Пользователь: Хан Гаин (Мудрость) · Уровень 1, коридор", "Номер 102: побег совершён"]}
        note="Побег сделала Ари. Вернулись все."
        button="Открыть глаза"
        onClose={() => setEscaped(true)}
      />
    </section>
  );
}
