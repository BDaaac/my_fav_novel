"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { stageOf, useInfection } from "./infection";
import { Mad } from "./mad";
import { cn } from "@/lib/utils";

/**
 * Четвёртая попытка (гл. 70–71): Гаин запирается в комнате и сорок минут ищет в сети три запроса,
 * найденные в подвале. По статьям складывается история Ким Санмина. Статьи — пересказ глав, не цитаты.
 * Чтение тоже заражает, только слабее видео (гл. 64).
 */
type Article = { source: string; kind: "news" | "abs" | "court" | "opinion" | "list"; title: string; text: string };
type Topic = { id: string; query: string; match: RegExp; articles: Article[] };

const TOPICS: Topic[] = [
  {
    id: "sangmin",
    query: "Ким Санмин",
    match: /санмин|синдон|травл|суд/i,
    articles: [
      { source: "Городские новости", kind: "news", title: "Ученик старшей школы Синдон заявил о жестокой травле", text: "По словам семьи, издевательства длились долго, основных зачинщиков восемь. Школа ученика не защитила. Родители подали в суд." },
      { source: "ABS · расследование", kind: "abs", title: "Кто на самом деле пострадал в школе Синдон?", text: "Журналист ABS выпустил серию материалов: у ученика с самого начала были отклонения, он сам устраивал дебоши, а пострадали другие школьники. Эти материалы легли в дело как доказательства." },
      { source: "Судебная хроника", kind: "court", title: "Суд: травли не было", text: "Дело закрыто. Суд решил, что ученик страдает психическим расстройством и выдумал преследование. Его направили на лечение в больницу «Новый Мир»." },
      { source: "Колонка", kind: "opinion", title: "А если расстройство появилось из-за травли?", text: "Спорили об одном: издевательства довели его до болезни или болезнь придумала издевательства. Суд выбрал второе." },
    ],
  },
  {
    id: "hospital",
    query: "Больница «Новый Мир»",
    match: /новый мир|больниц|главврач|учител/i,
    articles: [
      { source: "Справка", kind: "list", title: "«Новый Мир», специализированная психиатрическая больница", text: "После суда сюда поступил Ким Санмин. Его лечение ведёт сам главврач, известный специалист." },
      { source: "Городские новости", kind: "news", title: "Больница встала на сторону пациента", text: "Главврач выслушал ученика и поверил ему. Больница заявила открыто: до расстройства пациента довели издевательствами. Раз так говорит известный врач, газеты подхватили тему." },
      { source: "Срочно", kind: "court", title: "Больница «Новый Мир» исчезла", text: "Исчезла буквально, вместе со зданием. Это стало сенсацией. Более поздних публикаций нет: через три дня наступил конец света." },
    ],
  },
  {
    id: "hyukjin",
    query: "Ли Хёкчин",
    match: /хёкчин|хекчин|ли хёк|ли хек/i,
    articles: [
      { source: "Старшая школа Синдон", kind: "list", title: "Ли Хёкчин, ученик", text: "То же имя было на бейджике в подвале телестудии. Он успел сказать одно: Ким Санмин вдруг стал монстром и запер их там, и с тех пор каждый день приходит «медсестра»." },
    ],
  },
];

const KIND: Record<Article["kind"], string> = {
  news: "border-l-[#1a56c4]",
  abs: "border-l-[#c0333d]",
  court: "border-l-[#2b2b2b]",
  opinion: "border-l-[#8a6a3a]",
  list: "border-l-[#6a8a7a]",
};

export function Search() {
  const { level, add } = useInfection();
  const stage = stageOf(level);
  const [value, setValue] = useState("");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const run = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setValue(text);
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const t = TOPICS.find((x) => x.match.test(text)) ?? null;
      setTopic(t);
      setMiss(t ? null : text);
      setLoading(false);
      if (t && !seen.has(t.id)) {
        setSeen((s) => new Set(s).add(t.id));
        add(4); // чтение тоже заражает
      }
    }, 650);
  };
  const all = seen.size === TOPICS.length;

  return (
    <section className="relative overflow-hidden bg-[#0c0f0e] text-[#d6dcd8]">
      {/* комната ночью, свет только от монитора */}
      <div className="pointer-events-none absolute left-1/2 top-24 h-[640px] w-[1000px] -translate-x-1/2 rounded-full bg-[#cfe3ff]/10 blur-[110px]" />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="font-system text-[12px] tracking-[0.3em] opacity-60">ЧЕТВЁРТАЯ ПОПЫТКА · ГЛ. 70–71</div>
        <Mad as="div" text="Что там произошло на самом деле?" className="mt-2 font-display text-4xl md:text-6xl" />
        <Mad
          className="mt-4 max-w-2xl font-display text-[19px] leading-relaxed opacity-85"
          text="Гаин говорит «семье», что записывается на курсы, и запирается у себя. В подвале студии он успел найти три слова для поиска. У него минут сорок."
        />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_260px]">
          {/* окно браузера */}
          <div className="overflow-hidden rounded-lg border border-black/60 bg-[#f4f5f2] text-[#1d2220] shadow-[0_30px_70px_rgba(0,0,0,0.6),0_0_80px_-20px_#cfe3ff]">
            <div className="flex items-center gap-2 bg-[#d9dcd6] px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c0333d]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9a227]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#5a8a5a]/70" />
              <span className="ml-3 flex-1 truncate rounded bg-white/70 px-3 py-0.5 font-system text-[11px] text-[#1d2220]/60">поиск · {value || "…"}</span>
            </div>
            <div className="p-5 md:p-7">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(value);
                }}
                className="flex gap-2"
              >
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Что искать?"
                  aria-label="Поисковый запрос"
                  className="min-w-0 flex-1 border-2 border-[#1a56c4] bg-white px-3 py-2 font-system text-[15px] outline-none focus:shadow-[0_0_0_3px_#1a56c433]"
                />
                <button className="bg-[#1a56c4] px-5 font-system text-[13px] font-bold text-white hover:brightness-110">Найти</button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-system text-[11px] opacity-55">из блокнота:</span>
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => run(t.query)}
                    className={cn("rounded-full border px-3 py-1 font-hand text-[19px] leading-none transition", seen.has(t.id) ? "border-[#1d2220]/20 text-[#1d2220]/45 line-through" : "border-[#1d2220]/40 hover:bg-[#1d2220]/5")}
                  >
                    {t.query}
                  </button>
                ))}
              </div>

              <div className="mt-6 min-h-[340px] border-t border-[#1d2220]/15 pt-4">
                {loading ? (
                  <div className="font-system text-[13px] opacity-60">Ищем…</div>
                ) : topic ? (
                  <div className="space-y-4">
                    <div className="font-system text-[11px] opacity-55">Найдено: {topic.articles.length}</div>
                    {topic.articles.map((a, i) => (
                      <motion.article key={a.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} className={cn("border-l-4 bg-white px-4 py-3 shadow-sm", KIND[a.kind])}>
                        <div className={cn("font-system text-[10px] uppercase tracking-widest", a.kind === "abs" ? "text-[#c0333d]" : "opacity-55")}>{a.source}</div>
                        <h4 className="mt-0.5 font-display text-[21px] font-semibold leading-tight text-[#12306e]">
                          <Mad as="span" text={a.title} />
                        </h4>
                        <Mad text={a.text} className="mt-1 font-display text-[16px] leading-snug" />
                      </motion.article>
                    ))}
                  </div>
                ) : miss ? (
                  <div className="font-system text-[13px]">
                    По запросу «{miss}» ничего нет.
                    <div className="mt-1 opacity-55">В блокноте три слова. Попробуйте их.</div>
                  </div>
                ) : (
                  <div className="font-system text-[13px] opacity-55">Введите запрос или возьмите слово из блокнота.</div>
                )}
              </div>
            </div>
            {/* лента сбоку от статей: эфир лезет и сюда */}
            <div className="bg-[#c0333d] px-4 py-1.5 font-system text-[11px] text-white">
              {stage >= 2 ? "ABS · зачем читать? Включите телевизор. Мы ждём." : "ABS · прямой эфир круглосуточно"}
            </div>
          </div>

          {/* блокнот Гаина */}
          <div className="rotate-[1.2deg] bg-[#f3e27a] p-4 text-[#2a2410] shadow-[0_14px_30px_rgba(0,0,0,0.5)]">
            <div className="font-system text-[10px] uppercase tracking-widest opacity-60">блокнот · {seen.size} из {TOPICS.length}</div>
            <ul className="mt-2 space-y-1.5 font-hand text-[21px] leading-tight">
              <li className={cn(!seen.has("sangmin") && "opacity-30")}>Травля. Суд проигран из-за материалов ABS.</li>
              <li className={cn(!seen.has("hospital") && "opacity-30")}>Главврач поверил ему. Потом больница исчезла.</li>
              <li className={cn(!seen.has("hyukjin") && "opacity-30")}>В подвале те, кому он мстит.</li>
            </ul>
            <AnimatePresence>
              {all && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <div className="mt-3 border-t border-[#2a2410]/30 pt-3 font-hand text-[22px] leading-tight text-[#8c1c24]">
                    «Кто» и «почему» понятно. «Как» — нет. Найти Ким Санмина: он в студии или в исчезнувшей больнице, куда ведёт студия.
                  </div>
                  <div className="mt-2 font-hand text-[18px] leading-tight opacity-70">Сонъи: а вдруг суд был прав?</div>
                  <div className="mt-1 text-right font-system text-[10px] opacity-60">гл. 71</div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-3 font-system text-[10px] opacity-60">Тексты заражают слабее видео. Но заражают. (гл. 64)</div>
          </div>
        </div>
      </div>
    </section>
  );
}
