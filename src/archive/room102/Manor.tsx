"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Mask, useRoom } from "./state";
import { cn } from "@/lib/utils";

/** Дождь: два слоя косых штрихов, двигаются силами компоновщика. */
export function Rain({ strong }: { strong?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="rain102 absolute -inset-[20%]"
          style={{
            opacity: (strong ? 0.5 : 0.28) - i * 0.1,
            backgroundImage: "repeating-linear-gradient(100deg, transparent 0 7px, rgba(200,220,215,0.5) 7px 8px, transparent 8px 19px)",
            backgroundSize: i ? "140px 220px" : "90px 160px",
            animationDuration: `${i ? 0.9 : 0.6}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Приезд (гл. 15): дорога, роли, дом между горой и озером. */
export function Arrival() {
  const { art } = useRoom();
  const img = art("manor");
  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden bg-[#0d1211] text-[#dfe6e2]">
      {img ? (
        <Image src={img} alt="Особняк между горой и озером под дождём" fill priority sizes="100vw" className="object-cover" />
      ) : (
        // без арта: гора, дом и озеро силуэтами
        <div className="absolute inset-0 [background:linear-gradient(#27302e,#151c1b_55%,#0c1110)]">
          <div className="absolute inset-x-0 bottom-[38%] h-[46%] bg-[#0a0e0d] [clip-path:polygon(0_100%,18%_42%,34%_70%,52%_8%,70%_58%,84%_36%,100%_100%)]" />
          <div className="absolute bottom-[38%] left-1/2 h-[16%] w-[26%] -translate-x-1/2 bg-[#070a09] [clip-path:polygon(0_100%,0_42%,10%_42%,10%_18%,22%_0,34%_18%,34%_42%,66%_42%,66%_18%,78%_0,90%_18%,90%_42%,100%_42%,100%_100%)]">
            {[30, 46, 62].map((x) => (
              <span key={x} className="absolute bottom-[18%] h-[14%] w-[4%] bg-[#d9a85a]/70 shadow-[0_0_14px_#d9a85a]" style={{ left: `${x}%` }} />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[38%] [background:linear-gradient(#1b2625,#0a0f0e)]" />
          <div className="absolute bottom-[30%] left-1/2 h-[3px] w-[30%] -translate-x-1/2 bg-[#3a4744]/70" />
        </div>
      )}
      <Rain />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d1211] via-[#0d1211]/55 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#9fb8b0]">КОМНАТА ПРОКЛЯТИЙ · 1-Й ЭТАЖ · №102 · ГЛ. 14–25</div>
        <h1 className="mt-2 font-display text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-none">Особняк Ужасов</h1>
        <div className="mt-2 font-hand text-3xl text-[#c9b27a]">Четыре дня в гостях у «старшего дяди»</div>
        <p className="mt-5 max-w-2xl font-display text-[19px] leading-relaxed text-[#cfd8d4]">
          Полчаса телами управляет отель: все едут в машине и играют выданные роли. Пятеро — друзья по университетскому клубу, их пригласила Ли Ынсоль. За рулём Елена, остальные не умеют водить механику. Дорога немощёная, лес чужой, птицы смотрят на машину с подозрением.
        </p>
        <div className="mt-6 grid max-w-3xl gap-3 font-display text-[16px] sm:grid-cols-2">
          <div className="border border-white/15 bg-black/35 p-3">
            <div className="font-system text-[10px] uppercase tracking-widest text-[#9fb8b0]">Встречают двое</div>
            <div className="mt-1">
              <Mask role="Дворецкий Ким Муксон" truth="Ким Муксон, агент Управления" />. Под одеждой сильное тело.
            </div>
            <div>
              <Mask role="Горничная Ари, его внучка, лет тринадцати" truth="Ким Ари, агент-стажёр Управления" />. Малиновые глаза.
            </div>
          </div>
          <div className="border border-white/15 bg-black/35 p-3">
            <div className="font-system text-[10px] uppercase tracking-widest text-[#9fb8b0]">Что решила команда</div>
            <div className="mt-1">Цели окно статуса не даёт. Значит, выжить хотя бы одному: если кто-то выберется, вернутся все.</div>
          </div>
        </div>
        <motion.div className="mt-10 font-system text-[11px] tracking-[0.25em] text-[#9fb8b0]" animate={{ y: [0, 6, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
          ЛИСТАЙТЕ ВНИЗ · ДЕНЬ ПЕРВЫЙ
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────── дом в разрезе ─────────────────────────

type Loc = "hill" | "church" | "guest" | "elena" | "hall" | "library" | "gate" | "lake" | "stream" | "stairs";
type Ev = { title: string; text: React.ReactNode; ch: string; dead?: string };
type Day = { id: string; label: string; weather: string; ev: Partial<Record<Loc, Ev>> };

const DAYS: Day[] = [
  {
    id: "d1",
    label: "День 1",
    weather: "сыро, мост вязкий, как в распутицу",
    ev: {
      gate: { title: "Статуя у входа", text: "Человеческий силуэт, около шести рук, из груди выпирает огромное сердце и будто пульсирует. За воротами сад с античными статуями. Ворота открываются сами.", ch: "15" },
      hill: { title: "Прогулка на гору", text: "Дворецкий ведёт гостей на Задний холм и поднимается, не вспотев. Рассказывает о спорных землях: вершина принадлежит правительству, Собор — католикам.", ch: "16" },
      stream: { title: "Кемпинг у ручья", text: "Жаровня, мраморная говядина, баранина. Еда отличная, напряжение спадает. Вечером кричит ворон.", ch: "16" },
      library: { title: "Библиотека", text: "Гостям сюда нельзя. Остальной дом открыт. Слуг на огромный особняк всего двое.", ch: "16" },
      elena: { title: "Ночь. Комната Елены", text: "В дверь стучит знакомый человек. Елена прячет нож для мяса, но успокаивается и впускает. Они болтают.", ch: "16" },
    },
  },
  {
    id: "d2",
    label: "День 2",
    weather: "ливень, к вечеру шторм",
    ev: {
      elena: { title: "10:00. Елена мертва", text: "Дверь открыли мастер-ключом. Комната как у спящей красавицы, но стоит резкий запах смерти. На шее след тонкой верёвки. Гаин думает на кого-то из своих и отбрасывает эту мысль как слишком очевидную.", ch: "17", dead: "elena-ivanova" },
      lake: { title: "Мост под водой", text: "К утру мост целиком ушёл под воду. Дороги назад нет.", ch: "17" },
      hall: { title: "Дом начинает чудить", text: "Отражение в зеркале ухмыляется. Кукушка в часах разваливается и течёт красным. На лестнице всхлипы, кукла провожает людей взглядом. Людей это не трогает, только пугает.", ch: "17" },
      church: { title: "18:00. В Собор сквозь бурю", text: "Дворецкий говорит, что у Собора есть лодка. По дороге Ынсоль шепчет Гаину план: идти в опасное по одному и умирать, чтобы узнать угрозу. Гаин должен выжить и делать вид, что он против.", ch: "17" },
    },
  },
  {
    id: "n2",
    label: "Ночь 2",
    weather: "шторм",
    ev: {
      church: { title: "Комната священника", text: "Лодка с пробоиной. Дворецкий уходит «за обогревателем» и пропадает больше часа. Гаин находит переписку священника с хозяином: сперва «глубокоуважаемый», под конец «сатанинское отродье, погрязшее в ереси». Спор идёт о земле и Соборе.", ch: "18" },
      hall: { title: "Ссора напоказ", text: "Гаин разыгрывает ссору с Ынсоль, чтобы выбить у дворецкого ключ от библиотеки.", ch: "18" },
      library: { title: "Конверт", text: "Опрятная, уютная комната, отделённая от безумия дома. В конверте документы на разных языках об одном и том же объекте. Ынсоль дочитывает четвёртый и понимает, что станет жертвой.", ch: "18" },
      guest: { title: "Около часа ночи. Ынсоль", text: "Она стоит на пороге и получает укол в шею сзади. Успевает показать на Гаина, сунуть ему в руку записку и умирает меньше чем за три минуты.", ch: "18", dead: "lee-eunsol" },
    },
  },
  {
    id: "d3",
    label: "День 3",
    weather: "дождь, ночью буря и жуткий лунный свет",
    ev: {
      lake: { title: "Лодка", text: "К утру лодка на треть в воде. Откачивают два с половиной часа, дыру заделывают. В бурю плыть всё равно нельзя.", ch: "20" },
      church: { title: "Колокол", text: "По шаткой мокрой лестнице на колокольню. Колокол маленький, неожиданно чистый, весь в нечитаемых знаках. Звук глухой, со скрежетом.", ch: "20" },
      hall: { title: "Вечер. Джинчхоль", text: "За закуской Джинчхоль падает, изо рта кровь. Еду и сок Гаин проверял заранее, а пиво, которое пил только Джинчхоль, не проверил. Они прощаются «до встречи на той стороне».", ch: "21, 25", dead: "cha-jinchul" },
      guest: { title: "Ночь. Гостья с картами", text: "К Гаину приходит «другая Ари» и предлагает партию.", ch: "21" },
    },
  },
  {
    id: "d4",
    label: "День 4",
    weather: "дождь стихает, в горах ещё льёт",
    ev: {
      hill: { title: "Склон. Исповедь", text: "Дворецкий признаётся: он был священником Собора. Его внучка увидела у Старейшины нечто и сломалась, и он отдал всё, чтобы её вернули. Потом он нападает.", ch: "22" },
      gate: { title: "У статуи стоит Сонъи", text: "Гаин называет её Старейшиной. Она взмахивает рукой, и статуи сада оживают.", ch: "23" },
      church: { title: "С колоколом в руках", text: "Статуи вязнут в мокрой земле. Гаин добегает до Собора и берёт колокол. Старейшина не может к нему прикоснуться.", ch: "23" },
      stairs: { title: "Под библиотекой", text: "За картиной рычаг. Шкаф поворачивается, за ним дверь и лестница вниз без света.", ch: "24" },
    },
  },
];

const PLACE: Record<Loc, { name: string; area: string }> = {
  hill: { name: "Задний холм", area: "hill" },
  church: { name: "Собор", area: "church" },
  elena: { name: "Комната Елены", area: "elena" },
  guest: { name: "Комнаты гостей", area: "guest" },
  hall: { name: "Холл и столовая", area: "hall" },
  library: { name: "Библиотека", area: "library" },
  gate: { name: "Вход, статуя", area: "gate" },
  lake: { name: "Озеро и мост", area: "lake" },
  stream: { name: "Ручей", area: "stream" },
  stairs: { name: "Лестница вниз", area: "stairs" },
};

/** Четыре дня в доме: дом в разрезе, по дням в комнатах загораются события. */
export function House() {
  const [day, setDay] = useState(0);
  const [loc, setLoc] = useState<Loc | null>("gate");
  const d = DAYS[day];
  const ev = loc ? d.ev[loc] : undefined;
  const deadSoFar = DAYS.slice(0, day + 1).flatMap((x) => Object.values(x.ev).map((e) => e?.dead).filter(Boolean)) as string[];

  const pick = (i: number) => {
    setDay(i);
    setLoc((Object.keys(DAYS[i].ev) as Loc[])[0]);
  };
  const cell = (l: Loc, extra?: string) => {
    const has = !!d.ev[l];
    const dead = d.ev[l]?.dead;
    return (
      <button
        key={l}
        onClick={() => has && setLoc(l)}
        disabled={!has}
        style={{ gridArea: PLACE[l].area }}
        className={cn(
          "relative flex min-h-[64px] items-end border p-2 text-left font-system text-[10px] uppercase tracking-wider transition",
          has ? "cursor-pointer border-[#c9b27a]/60 bg-[#c9b27a]/10 text-[#e9dcb6] hover:bg-[#c9b27a]/20" : "border-white/8 bg-black/30 text-white/25",
          loc === l && has && "bg-[#c9b27a]/25 shadow-[0_0_24px_-6px_#c9b27a]",
          extra,
        )}
      >
        {has && <span className={cn("absolute right-2 top-2 h-2 w-2 rounded-full", dead ? "bg-[#c0333d] shadow-[0_0_8px_#c0333d]" : "bg-[#e9dcb6]")} />}
        {PLACE[l].name}
      </button>
    );
  };

  return (
    <section className="relative overflow-hidden bg-[#0d1211] text-[#dfe6e2]">
      <Rain strong={day === 1 || day === 2} />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#9fb8b0]">ДОМ В РАЗРЕЗЕ</div>
        <h2 className="mt-2 font-display text-5xl md:text-6xl">Четыре дня</h2>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {DAYS.map((x, i) => (
            <button key={x.id} onClick={() => pick(i)} className={cn("border px-4 py-1.5 font-display text-[18px] transition", i === day ? "border-[#c9b27a] bg-[#c9b27a] text-[#14110a]" : "border-white/20 hover:bg-white/10")}>
              {x.label}
            </button>
          ))}
          <span className="ml-2 font-hand text-2xl text-[#9fb8b0]">{d.weather}</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
          {/* план: гора и Собор снаружи, дом в два этажа, под библиотекой лестница */}
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: "0.9fr 1fr 1fr 1fr 0.9fr",
              gridTemplateAreas: `"hill hill . church church" "stream elena guest church church" "lake gate hall library ." "lake . . stairs ."`,
            }}
          >
            {cell("hill", "[clip-path:polygon(0_100%,30%_0,60%_45%,100%_100%)] items-end justify-center pb-3")}
            {cell("church")}
            {cell("stream")}
            {cell("elena")}
            {cell("guest")}
            {cell("lake")}
            {cell("gate")}
            {cell("hall")}
            {cell("library")}
            {cell("stairs", day < 4 ? "opacity-0 pointer-events-none" : "border-dashed")}
          </div>

          <div className="min-h-[260px]">
            <>
              {ev ? (
                <motion.div key={d.id + loc} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="border border-white/15 bg-black/40 p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-3xl text-[#e9dcb6]">{ev.title}</h3>
                    <span className="shrink-0 font-system text-[10px] opacity-55">гл. {ev.ch}</span>
                  </div>
                  <p className="mt-2 font-display text-[18px] leading-relaxed">{ev.text}</p>
                  {ev.dead && <div className="mt-3 w-fit border border-[#c0333d]/70 px-2 py-0.5 font-system text-[10px] uppercase tracking-widest text-[#ff8a8a]">жертва</div>}
                  {loc === "hall" && d.id === "d2" && <Anomalies />}
                </motion.div>
              ) : (
                <div className="border border-dashed border-white/15 p-5 font-display text-[17px] opacity-60">Выберите место, где сегодня что-то случилось.</div>
              )}
            </>
            <div className="mt-4 flex items-center gap-2 font-system text-[11px] tracking-wider text-[#9fb8b0]">
              жертв к этому часу
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={cn("h-2.5 w-2.5 rounded-full border border-[#c0333d]/70", i < deadSoFar.length && "bg-[#c0333d]")} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Чертовщина второго дня: пугает, но не трогает (гл. 17–18). */
function Anomalies() {
  const [look, setLook] = useState(0);
  const [clock, setClock] = useState(0);
  const [broken, setBroken] = useState(false);
  return (
    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
      <div>
        <div className="relative mx-auto h-28 w-20 overflow-hidden rounded-t-full border-4 border-[#6a5a3a] bg-gradient-to-b from-[#5d6b68] to-[#1a2221]">
          {broken ? (
            <div className="absolute inset-0 [background:repeating-linear-gradient(33deg,transparent_0_9px,#000_9px_10px),repeating-linear-gradient(120deg,transparent_0_13px,#000_13px_14px)]" />
          ) : (
            <motion.div className="absolute bottom-3 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-[#e9dcb6]" animate={{ width: 8 + look * 12, borderRadius: look > 1 ? "0 0 20px 20px" : "9999px", height: look > 1 ? 3 + look * 3 : 3 }} />
          )}
        </div>
        <div className="mt-2 flex justify-center gap-2 font-system text-[10px]">
          <button onClick={() => setLook((v) => Math.min(4, v + 1))} disabled={broken} className="border border-white/25 px-2 py-1 hover:bg-white/10 disabled:opacity-30">
            смотреть
          </button>
          <button onClick={() => setBroken(true)} disabled={broken} className="border border-white/25 px-2 py-1 hover:bg-white/10 disabled:opacity-30">
            разбить чашкой
          </button>
        </div>
        <p className="mt-1 text-center font-hand text-lg text-[#c9b27a]">{broken ? "Гаин так и сделал." : look > 2 ? "Изо рта лезут зубы, по языку бегут насекомые." : look > 0 ? "Отражение ухмыляется." : "Зеркало в холле"}</p>
      </div>
      <div className="text-center">
        <button onClick={() => setClock((c) => Math.min(10, c + 1))} className="relative mx-auto block h-28 w-20 border-4 border-[#6a5a3a] bg-[#2a1d12]" aria-label="Часы с кукушкой">
          <span className="absolute left-1/2 top-3 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-[#c9b27a] bg-[#e9dcb6]" />
          <motion.span key={clock} className="absolute left-1/2 top-12 w-1.5 -translate-x-1/2 rounded-b-full bg-[#8c0c14]" initial={{ height: 0 }} animate={{ height: clock * 6 }} transition={{ duration: 0.6 }} />
        </button>
        <p className="mt-2 font-hand text-lg text-[#c9b27a]">{clock ? `Хлопок. Кукушка развалилась, течёт красное. ${clock}/10` : "Часы с кукушкой: нажмите"}</p>
        <p className="font-system text-[10px] opacity-50">к концу дня их залило десять раз</p>
      </div>
    </div>
  );
}
