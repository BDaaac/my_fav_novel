"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { FAMILY_PHOTOS, short } from "./data";
import { stageOf, useInfection } from "./infection";
import { Mad } from "./mad";
import { cn } from "@/lib/utils";

/**
 * Заход 1 как семейные чаты: шестерым гостям пишут их «родные» (гл. 6–10).
 * Сообщения приходят сами; ответишь — заражение растёт, не ответишь — увидишь, чем всё кончилось.
 * Реплики — пересказ сцен из глав, не цитаты.
 */
type Msg = { from: string; text: string };
const CHATS: Record<string, { title: string; msgs: Msg[] }> = {
  "han-gain": {
    title: "Семья ❤",
    msgs: [
      { from: "Мама", text: "Вставай! Все уже позавтракали!" },
      { from: "Хиган", text: "Оппа, я звала тебя пять раз. У меня чуть уши не отвалились." },
      { from: "Мама", text: "В рис добавила шелкопряда, он полезный. Не капризничай, ешь." },
      { from: "Отец", text: "С утра дендрарий, в обед утка, вечером резорт. Ничего-то ты не знаешь." },
      { from: "Хиган", text: "Ножницы взял? В дендрарий ходят резать растения, ты чего." },
      { from: "Мама", text: "Зима должна быть холодной. Раздевайся." },
    ],
  },
  "cha-jinchul": {
    title: "Мама, директор Пак",
    msgs: [
      { from: "Директор Пак", text: "Джинчхоль, добрая весть! В Пусане большой турнир по смешанным единоборствам." },
      { from: "Мама", text: "Благодари директора. И ещё раз благодари!" },
      { from: "Директор Пак", text: "Топовых бойцов не будет, одни середнячки. Призовые приличные. Где ещё такой шанс?" },
      { from: "Директор Пак", text: "Турнир называется «Один выживший». Не опаздывай." },
      { from: "Мама", text: "Пояс победителю вручит сам мэр Пусана. Мы так гордимся." },
    ],
  },
  "lee-eunsol": {
    title: "Семья Ли",
    msgs: [
      { from: "Отец", text: "Наследство достанется одному из вас. Покажите, кто чего стоит." },
      { from: "Второй брат", text: "С отцом мы с тобой разобрались. Остались старший и младшая." },
      { from: "Второй брат", text: "Теперь мы ведь доверяем друг другу?" },
      { from: "Второй брат", text: "Зайди ко мне. Одна." },
    ],
  },
  "yu-sonyi": {
    title: "Дом ❤",
    msgs: [
      { from: "Мама", text: "Сонъи, все твои любимцы в сборе. Ждут тебя." },
      { from: "Папа", text: "Они от тебя ни на шаг. Так любят." },
      { from: "Мама", text: "С утра не кормлены. Проголодались." },
      { from: "Мама", text: "Дверь на ночь не закрывай." },
    ],
  },
  "elena-ivanova": {
    title: "Семья",
    msgs: [
      { from: "Мама", text: "Елена, ужин в семь. Сестра сама всё приготовила." },
      { from: "Сестра", text: "Я так старалась. Попробуй всё." },
      { from: "Папа", text: "Что-то живот прихватило." },
      { from: "Сестра", text: "Ешь. Не обижай меня." },
    ],
  },
  "park-seungyeop": {
    title: "Мама, Папа",
    msgs: [
      { from: "Мама", text: "Сынёп, ты и обед пропустил. Тарелка у двери." },
      { from: "Мама", text: "Мама просто хочет, чтобы ты немного позанимался." },
      { from: "Папа", text: "Отец не пытается тебя мучить. Выйди, поговорим." },
      { from: "Мама", text: "Ужин готов. Выходи." },
      { from: "Мама", text: "Выходи." },
    ],
  },
};

type State = { shown: number; replied: number; closed: boolean };
const EMPTY: State = { shown: 0, replied: 0, closed: false };

export function FamilyChat() {
  const { level, add } = useInfection();
  const stage = stageOf(level);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const [active, setActive] = useState(FAMILY_PHOTOS[0].who);
  const [st, setSt] = useState<Record<string, State>>({});
  const [typing, setTyping] = useState(false);
  const feed = useRef<HTMLDivElement>(null);

  const cur = st[active] ?? EMPTY;
  const chat = CHATS[active];
  const photo = FAMILY_PHOTOS.find((p) => p.who === active)!;
  const allIn = cur.shown >= chat.msgs.length;

  // сообщения приходят сами, пока чат открыт
  useEffect(() => {
    if (!inView || cur.closed || allIn) return;
    const t1 = setTimeout(() => setTyping(true), 700);
    const t2 = setTimeout(() => {
      setTyping(false);
      setSt((s) => ({ ...s, [active]: { ...(s[active] ?? EMPTY), shown: (s[active]?.shown ?? 0) + 1 } }));
    }, 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      setTyping(false);
    };
  }, [inView, active, cur.shown, cur.closed, allIn]);

  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [cur.shown, cur.replied, cur.closed, typing]);

  const reply = () => {
    add(6);
    setSt((s) => ({ ...s, [active]: { ...cur, replied: cur.replied + 1 } }));
  };
  const close = () => {
    if (photo.escaped) add(-10);
    setSt((s) => ({ ...s, [active]: { ...cur, shown: chat.msgs.length, closed: true } }));
  };

  return (
    <div ref={ref} className="relative mt-14 grid overflow-hidden rounded-[28px] border border-[#2b2018]/20 bg-[#fbf6ea] text-[#2b2018] shadow-[0_30px_60px_rgba(60,30,10,0.35)] md:grid-cols-[250px_1fr]">
      {/* список чатов */}
      <div className="border-b border-[#2b2018]/10 bg-[#f1e7d2] md:border-b-0 md:border-r">
        <div className="px-4 pb-2 pt-4 font-system text-[11px] uppercase tracking-[0.25em] text-[var(--accent)]">Сообщения · шесть домов</div>
        <div className="flex gap-1 overflow-x-auto px-2 pb-2 md:block md:space-y-1">
          {FAMILY_PHOTOS.map((p) => {
            const s = st[p.who] ?? EMPTY;
            const unread = p.who === active || s.closed ? 0 : CHATS[p.who].msgs.length - s.shown;
            return (
              <button
                key={p.who}
                onClick={() => setActive(p.who)}
                className={cn("flex w-full min-w-[150px] items-center gap-3 rounded-2xl px-3 py-2 text-left transition", p.who === active ? "bg-[#fbf6ea] shadow" : "hover:bg-[#fbf6ea]/60")}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-display text-lg text-[#fbf6ea]">{stage >= 3 ? "♥" : short(p.who)[0]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[16px] leading-tight">{short(p.who)}</span>
                  <span className="block truncate font-system text-[10px] opacity-60">{s.closed ? (p.escaped ? "сбежал" : "не в сети") : CHATS[p.who].title}</span>
                </span>
                {unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b3121b] px-1 font-system text-[10px] text-white">{unread}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* переписка */}
      <div className="flex h-[520px] flex-col">
        <div className="flex items-baseline justify-between border-b border-[#2b2018]/10 px-5 py-3">
          <span className="font-display text-xl">{stage >= 3 ? "Наша семья ♥" : chat.title}</span>
          <span className="font-system text-[10px] opacity-60">
            телефон: {short(active)} · {photo.ch}
          </span>
        </div>
        <div ref={feed} className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
          {chat.msgs.slice(0, cur.shown).map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-[78%]">
              <div className="ml-3 font-system text-[10px] opacity-55">{stage >= 3 ? "семья" : m.from}</div>
              <div className="w-fit rounded-2xl rounded-tl-sm bg-[#efe3c8] px-3.5 py-2 font-display text-[17px] leading-snug">
                <Mad as="span" text={m.text} />
              </div>
            </motion.div>
          ))}
          {Array.from({ length: cur.replied }, (_, i) => (
            <motion.div key={`r${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <div className="ml-auto w-fit rounded-2xl rounded-tr-sm bg-[var(--accent)] px-3.5 py-2 font-display text-[17px] text-[#fbf6ea]">Иду ♥</div>
              <div className="w-fit max-w-[78%] rounded-2xl rounded-tl-sm bg-[#efe3c8] px-3.5 py-2 font-hand text-[22px] leading-tight text-[#8c1c24]">
                {["Умница. Мы ждём.", "Вот и хорошо. Никуда не уходи.", "Мы всегда будем вместе ♥"][Math.min(i, 2)]}
              </div>
            </motion.div>
          ))}
          {typing && !cur.closed && (
            <div className="flex w-fit items-center gap-1 rounded-2xl bg-[#efe3c8] px-3.5 py-3">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-[#2b2018]/60" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }} />
              ))}
            </div>
          )}
          {photo.escaped && cur.shown > 0 && !cur.closed && <div className="text-center font-system text-[10px] opacity-50">не прочитано · {cur.shown}</div>}
          <AnimatePresence>
            {cur.closed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn("mx-auto mt-4 max-w-md border bg-[#06141c] p-3 font-system text-[12px] shadow-[0_0_30px_-8px_currentColor]", photo.escaped ? "border-[#7fd4a0]/60 text-[#7fd4a0]" : "border-[#7fd4ff]/60 text-[#7fd4ff]")}
              >
                <div>[Окно Статуса · {photo.escaped ? "побег" : "связь потеряна"}]</div>
                <p className="mt-1.5 leading-relaxed">{photo.truth}</p>
                <div className="mt-1 opacity-60">{photo.ch}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!cur.closed && (
          <div className="flex items-center gap-2 border-t border-[#2b2018]/10 px-5 py-3">
            {!photo.escaped && (
              <button onClick={reply} className="rounded-full bg-[var(--accent)] px-4 py-1.5 font-display text-[16px] text-[#fbf6ea] transition hover:brightness-110">
                Иду ♥
              </button>
            )}
            <button onClick={close} className="rounded-full border border-[#2b2018]/30 px-4 py-1.5 font-display text-[16px] transition hover:bg-[#2b2018]/5">
              {photo.escaped ? "Не читать. Вспомнить товарищей" : "Не отвечать"}
            </button>
            <span className="ml-auto hidden font-system text-[10px] opacity-50 sm:block">{allIn ? "они ждут ответа" : "пишут…"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
