"use client";

import { useEffect, useRef, useState } from "react";
import reactions from "@/data/passivki/reactions.json";
import s from "./slips.module.css";

/**
 * Ярлыки системы. В книге Сюй Сяошоу получает очки за чужие чувства к нему; здесь система так же
 * отзывается на посетителя: потревожил табличку — её хозяин отреагировал — выпал красный ярлык.
 * Виды уведомлений у каждого героя взяты из текста тома (.passivki/build_reactions.py).
 * Ярлыки редки (не чаще раза в 8 секунд), не повторяются подряд, молчат, пока открыт свиток,
 * и выключаются печатью в углу.
 */
export type SlipEvent =
  | { type: "hero"; id: string }
  | { type: "closed"; id: string; dead: boolean; times: number; end: boolean }
  | { type: "flick" };

const subs = new Set<(e: SlipEvent) => void>();
/** сообщить системе о действии посетителя */
export const tell = (e: SlipEvent) => subs.forEach((f) => f(e));

const BY_HERO = reactions as Record<string, string[]>;
const GAP = 8000;
const KEY = "pv-slips-off";

export function Slips({ quiet }: { quiet: boolean }) {
  const [slip, setSlip] = useState<{ text: string; n: number } | null>(null);
  const [off, setOff] = useState(false);
  const st = useRef({ last: 0, lastText: "", heroAt: new Map<string, number>(), recent: [] as { id: string; t: number }[], once: new Set<string>(), off: false, quiet: false });
  st.current.quiet = quiet;
  st.current.off = off;

  useEffect(() => {
    try {
      setOff(localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  useEffect(() => {
    const m = st.current;
    const show = (text: string, force = false) => {
      const now = Date.now();
      if (m.off || m.quiet || text === m.lastText || (!force && now - m.last < GAP)) return false;
      m.last = now;
      m.lastText = text;
      setSlip((p) => ({ text, n: (p?.n ?? 0) + 1 }));
      return true;
    };
    const once = (key: string, text: string) => {
      if (m.once.has(key)) return false;
      if (show(text)) m.once.add(key);
      return true;
    };
    const on = (e: SlipEvent) => {
      const now = Date.now();
      if (e.type === "flick") return void show("Получена внезапная атака");
      if (e.type === "closed") {
        // свиток только что свёрнут: ярлык выпадает сразу, без общей паузы
        setTimeout(() => {
          if (e.times >= 3) show("Получено признание в любви", true);
          else if (e.dead) show("Получена ненависть", true);
          else if (e.id === "xu-xiaoshou" && e.end) show("Получено восхищение", true);
        }, 900);
        return;
      }
      // посетитель мечется от таблички к табличке
      m.recent = m.recent.filter((r) => now - r.t < 6000 && r.id !== e.id);
      m.recent.push({ id: e.id, t: now });
      if (m.recent.length >= 5) {
        m.recent = [];
        return void show("Получено беспокойство");
      }
      if (now - (m.heroAt.get(e.id) ?? 0) < 40000) return;
      if (e.id === "xu-xiaoshou") {
        if (once("tease", "Уведомление: вас дразнят")) m.heroAt.set(e.id, now);
        return;
      }
      if (e.id === "masked-man" && !m.once.has("lie")) {
        if (once("lie", "Получена ложь")) m.heroAt.set(e.id, now);
        return;
      }
      const list = BY_HERO[e.id]?.length ? BY_HERO[e.id] : ["Получен взгляд"];
      const pick = list.filter((t) => t !== m.lastText);
      if (show(pick[Math.floor(Math.random() * pick.length)] ?? list[0])) m.heroAt.set(e.id, now);
    };
    subs.add(on);

    // посетитель долго ничего не трогает — система сомневается
    let idle: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(idle);
      idle = setTimeout(() => show("Получено сомнение"), 35000);
    };
    arm();
    window.addEventListener("pointermove", arm);
    window.addEventListener("keydown", arm);
    return () => {
      subs.delete(on);
      clearTimeout(idle);
      window.removeEventListener("pointermove", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);

  // ярлык лежит четыре секунды и уходит
  useEffect(() => {
    if (!slip) return;
    const t = setTimeout(() => setSlip(null), 4200);
    return () => clearTimeout(t);
  }, [slip]);

  const toggle = () => {
    setOff((v) => {
      try {
        localStorage.setItem(KEY, v ? "0" : "1");
      } catch {}
      return !v;
    });
    setSlip(null);
  };

  return (
    <div className={s.layer} data-quiet={quiet ? "" : undefined}>
      {slip && !quiet && !off && (
        <p className={s.slip} key={slip.n} role="status">
          <img src="/art/passivki/slip.webp" alt="" />
          <span>
            <b>{slip.text}</b>
            <i>Очки пассивности +1</i>
          </span>
        </p>
      )}
      <button type="button" className={s.seal} onClick={toggle} aria-pressed={!off} aria-label={off ? "Включить ярлыки системы" : "Выключить ярлыки системы"} title={off ? "Система молчит" : "Система отзывается"}>
        <img src="/art/passivki/prop-seal.webp" alt="" />
      </button>
    </div>
  );
}
