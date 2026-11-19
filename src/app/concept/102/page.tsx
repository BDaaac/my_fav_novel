"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Концепт зала 102: не сам зал, а раскадровка для согласования.
 * Две живые пробы главных приёмов (удар колокола и отъезд к Заключённому), маршрут зала и референсы.
 */
const A = (n: string) => `/art/102/${n}.jpg`;

const STOPS: { img: string; name: string; ch: string; see: string; touch: string; how: string }[] = [
  { img: "car", name: "Машина", ch: "15", see: "Салон внедорожника, дождь, лес за стеклом. Кадр идёт как старая плёнка: посетителю показывают «фильм», в котором гости играют роли. Потом помехи, и плёнка обрывается.", touch: "Ничего. Здесь зритель только смотрит, как и сами гости в эти полчаса.", how: "Плёночный фильтр в шейдере: царапины, сепия, дрожание кадра. Обрыв — резкий срез на помехи." },
  { img: "manor", name: "Мост и ворота", ch: "15", see: "Дом между горой и озером. Камера едет по мосту к воротам, они открываются сами.", touch: "Навести на окна, мост, сад: подписи как таблички у экспонатов.", how: "Арт с картой глубины, камера на GSAP." },
  { img: "statue", name: "Статуя у входа", ch: "15, 23, 25", see: "Шесть рук и сердце, которое будто пульсирует. Первый экспонат зала.", touch: "Постучать по подножию, как Сонъи. Табличка скажет, чем это кончилось, только после колокола.", how: "Пульс сердца в шейдере, тактильный отклик на GSAP." },
  { img: "hall", name: "Дом по дням", ch: "16–21", see: "Одна сцена на событие: холл, комната Елены, библиотека. Дни сменяются светом и погодой, а не вкладками.", touch: "Зеркало, часы с кукушкой, кукла — вещи, которые можно тронуть.", how: "Смена времени суток и погоды в шейдере, один арт на сцену." },
  { img: "bell", name: "Собор. Колокол", ch: "18, 20", see: "Колокольня в бурю. Записка Ынсоль лежит рядом как экспонат.", touch: "Взять колокол и ударить. С этого места он с тобой до конца зала.", how: "3D-колокол в react-three-fiber, качается от руки. Звук по клику." },
  { img: "table", name: "Ночная партия", ch: "21", see: "Стол, свеча, колода. Напротив «другая Ари».", touch: "Сесть и сыграть: партия остаётся, но как экспонат, а не как условие прохода.", how: "Уже сделано: карты на GSAP в перспективе стола." },
  { img: "hill", name: "Склон", ch: "22–23", see: "Ливень, грязь, обрыв. Священник и три срочных Совета Мудреца.", touch: "Смотреть сцену по шагам.", how: "Дождь и молнии в шейдере на полную." },
  { img: "abyss", name: "Под библиотекой", ch: "24", see: "Рычаг за картиной, лестница без света, книга в чёрной коже.", touch: "Спускаться прокруткой. Чем ниже, тем синее свет.", how: "Прокрутка управляет камерой в шейдере." },
  { img: "dragon", name: "Заключённый", ch: "90, 97–98", see: "Камера отходит всё дальше, пока особняк не становится точкой на чешуе Туманного Дракона.", touch: "Только смотреть. Это самый тихий момент зала.", how: "Цепочка дорисованных наружу артов и непрерывный отъезд в шейдере." },
];

const REFS: { name: string; take: string }[] = [
  { name: "What Remains of Edith Finch", take: "Дом, где каждая комната — памятник одному человеку, и у каждой свой способ рассказа. Это прямая модель «музея, где каждая комната шедевр»." },
  { name: "Return of the Obra Dinn", take: "Застывшие сцены смерти, по которым ходишь и рассматриваешь. Зритель не участвует, он изучает момент." },
  { name: "Lobotomy Corporation / Library of Ruina", take: "Как Project Moon подаёт запертых существ: камера содержания, досье, которое открывается по мере наблюдения. Основа для показа Заключённых." },
  { name: "Control", take: "Изменённые предметы как экспонаты с карточками и здание, которое само является существом." },
  { name: "Powers of Ten, Zoomquilt", take: "Непрерывный отъезд камеры, который меняет понимание масштаба. Приём для Дракона." },
  { name: "Диорамы естественно-научных музеев", take: "Сцена за стеклом с глубиной и светом, табличка рядом. Так выглядит каждая остановка." },
];

const LADDER = [
  { who: "Ли Сехён, хозяин особняка", why: "Так думали в первый заход. Он оказался марионеткой.", ch: "23, 94–96" },
  { who: "Нерождённый, «Подземный Демон»", why: "Его рёв слышен из-под дома. Он сам не знает, что заперт.", ch: "20, 90, 97" },
  { who: "Апостол", why: "Вселялся в тела. Пришёл из мира Дракона и служил его ребёнку.", ch: "91–97" },
  { who: "Туманный Дракон", why: "Мать, которая погибла беременной. Её последняя цель — спасти ребёнка.", ch: "90, 98" },
];

export default function Concept102() {
  return (
    <main className="min-h-screen bg-[#0a0c0b] pb-32 text-[#dfe6e2]">
      <header className="mx-auto max-w-6xl px-6 pt-14">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#c9b27a]">КОНЦЕПТ · НЕ ГОТОВЫЙ ЗАЛ</div>
        <h1 className="mt-2 font-display text-5xl md:text-6xl">Зал 102. Особняк Ужасов</h1>
        <p className="mt-4 max-w-2xl font-display text-[19px] leading-relaxed opacity-80">
          Музейный зал, а не игра и не пересказ: посетитель смотрит и берёт экспонаты в руки, но не становится участником. Ниже два главных приёма зала вживую, маршрут и референсы.
        </p>
      </header>

      <Bell />
      <Prisoner />

      <section className="mx-auto mt-24 max-w-6xl px-6">
        <h2 className="font-display text-4xl">Маршрут зала</h2>
        <p className="mt-2 max-w-2xl font-display text-[18px] opacity-70">Девять остановок по порядку. Каждая — поставленная сцена во весь экран, без рамок и списков.</p>
        <ol className="mt-8 space-y-10">
          {STOPS.map((s, i) => (
            <li key={s.name} className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_1fr] md:items-center">
              <div className={cn("relative aspect-video overflow-hidden bg-black", i % 2 && "md:order-2")}>
                <Image src={A(s.img)} alt={s.name} fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
                <div className="absolute left-3 top-3 font-system text-[11px] tracking-widest text-[#efe6cf] [text-shadow:0_1px_6px_#000]">
                  {String(i + 1).padStart(2, "0")} · ГЛ. {s.ch}
                </div>
              </div>
              <div>
                <h3 className="font-display text-3xl text-[#e9dcb6]">{s.name}</h3>
                <dl className="mt-3 space-y-3 font-display text-[17px] leading-relaxed">
                  {[
                    ["Что видит посетитель", s.see],
                    ["Что можно сделать", s.touch],
                    ["Чем делается", s.how],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-system text-[10px] uppercase tracking-[0.25em] text-[#9fb8b0]">{k}</dt>
                      <dd className="mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-6">
        <h2 className="font-display text-4xl">Референсы</h2>
        <p className="mt-2 max-w-2xl font-display text-[18px] opacity-70">Беру подход, а не внешний вид.</p>
        <dl className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {REFS.map((r) => (
            <div key={r.name}>
              <dt className="font-display text-2xl text-[#e9dcb6]">{r.name}</dt>
              <dd className="mt-1 font-display text-[17px] leading-relaxed opacity-85">{r.take}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}

/** Проба 1: удар колокола. Волна расходится от точки клика, и там, где она прошла, видна вторая версия сцены. */
function Bell() {
  const box = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState({ x: 50, y: 50 });
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const strike = (e: React.MouseEvent) => {
    const b = box.current!.getBoundingClientRect();
    setAt({ x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100 });
    setOpen(false);
    clearTimeout(timer.current);
    setTimeout(() => setOpen(true), 40);
    timer.current = setTimeout(() => setOpen(false), 4200);
  };
  return (
    <section className="mx-auto mt-16 max-w-6xl px-6">
      <div className="font-system text-[11px] tracking-[0.3em] text-[#c9b27a]">ПРОБА 1 · ИЗЮМИНКА ЗАЛА</div>
      <h2 className="mt-1 font-display text-4xl">Спектакль и то, что под ним</h2>
      <p className="mt-2 max-w-2xl font-display text-[18px] leading-relaxed opacity-80">Кликните по холлу: это удар колокола. Обе картинки — одна и та же сцена, вторая сделана правкой первой, поэтому всё совпадает.</p>
      <div ref={box} onClick={strike} className="relative mt-6 aspect-video cursor-pointer overflow-hidden bg-black" role="button" aria-label="Ударить в колокол">
        <Image src={A("hall")} alt="Холл особняка, каким его видят гости" fill priority sizes="(min-width: 1152px) 1100px, 100vw" className="object-cover" />
        <div
          className="absolute inset-0"
          style={{
            clipPath: `circle(${open ? 150 : 0}% at ${at.x}% ${at.y}%)`,
            transition: open ? "clip-path 1.5s cubic-bezier(0.16,1,0.3,1)" : "clip-path 0.9s cubic-bezier(0.7,0,0.84,0)",
          }}
        >
          <Image src={A("hall-truth")} alt="Тот же холл после удара колокола" fill sizes="(min-width: 1152px) 1100px, 100vw" className="object-cover" />
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 font-system text-[11px] tracking-widest text-[#efe6cf] [text-shadow:0_1px_6px_#000]">{open ? "ПОД НИМ" : "СПЕКТАКЛЬ"}</div>
      </div>
      <p className="mt-3 max-w-3xl font-display text-[16px] leading-relaxed opacity-65">
        В самом зале волну рисует шейдер: с искажением по краю, хроматической каймой и звуком. Здесь упрощённая проба, чтобы показать идею.
      </p>
    </section>
  );
}

/** Проба 2: Заключённый. Сначала лестница неверных ответов, потом отъезд от особняка к Дракону. */
function Prisoner() {
  const [step, setStep] = useState(0); // 0..3 — ответы, 4 — отъезд
  const far = step >= 4;
  return (
    <section className="mx-auto mt-24 max-w-6xl px-6">
      <div className="font-system text-[11px] tracking-[0.3em] text-[#c9b27a]">ПРОБА 2 · ЗАКЛЮЧЁННЫЙ</div>
      <h2 className="mt-1 font-display text-4xl">Кто здесь заперт</h2>
      <p className="mt-2 max-w-2xl font-display text-[18px] leading-relaxed opacity-80">Команда ошибалась трижды. Посетитель идёт тем же путём: три ответа снимаются, четвёртый не помещается в кадр.</p>

      <ol className="mt-6 grid gap-3 md:grid-cols-4">
        {LADDER.map((l, i) => {
          const wrong = i < 3 && step > i;
          const shown = step >= i;
          return (
            <li key={l.who} className={cn("border p-4 transition-all duration-700", shown ? "opacity-100" : "opacity-25", wrong ? "border-white/10 bg-transparent" : i === 3 && step >= 3 ? "border-[#8fb8ff]/60 bg-[#0d1420]" : "border-[#c9b27a]/50 bg-[#14110d]")}>
              <div className="font-system text-[10px] tracking-[0.25em] opacity-60">ОТВЕТ {i + 1} · ГЛ. {l.ch}</div>
              <div className={cn("mt-1 font-display text-2xl leading-tight transition-all duration-700", wrong && "line-through opacity-45")}>{l.who}</div>
              <p className={cn("mt-2 font-display text-[15px] leading-snug transition-opacity duration-700", shown ? "opacity-80" : "opacity-0")}>{l.why}</p>
            </li>
          );
        })}
      </ol>

      <div className="relative mt-6 aspect-video overflow-hidden bg-black">
        {/* камера стоит на особняке и отходит, пока он не станет точкой на чешуе */}
        <div className="absolute inset-0" style={{ transform: `scale(${far ? 1 : 7.5})`, transformOrigin: "69.5% 26%", transition: "transform 9s cubic-bezier(0.45,0,0.15,1)" }}>
          <Image src={A("dragon")} alt="Особняк с озером на чешуе Туманного Дракона" fill sizes="(min-width: 1152px) 1100px, 100vw" className="object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-1000" style={{ opacity: step >= 3 ? 0 : 0.82 }} />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/85 to-transparent p-4">
          <p className="max-w-xl font-display text-[18px] leading-snug text-[#efe6cf]">
            {far ? "Она не злодей. Она умерла, не успев родить, и всё, что здесь случилось, началось с этого." : step >= 3 ? "Особняк, озеро и гора. Всё это время они стояли на ней." : "Кто Заключённый номера 102?"}
          </p>
          <button
            onClick={() => setStep((s) => (s >= 4 ? 0 : s + 1))}
            className="shrink-0 border border-[#c9b27a] bg-black/60 px-5 py-2 font-system text-[12px] tracking-widest text-[#e9dcb6] transition hover:bg-[#c9b27a]/20"
          >
            {far ? "СНАЧАЛА" : step >= 3 ? "ОТОЙТИ" : "ЭТОТ ОТВЕТ НЕВЕРЕН"}
          </button>
        </div>
      </div>
    </section>
  );
}
