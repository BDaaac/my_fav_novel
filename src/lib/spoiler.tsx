"use client";
import { createContext, useContext, useEffect, useState } from "react";

type SpoilerCtx = { readCh: number; setReadCh: (n: number) => void };
const Ctx = createContext<SpoilerCtx>({ readCh: 0, setReadCh: () => {} });
const KEY = "hotel.readCh";

/** Глава, до которой дочитал гость. 0 = ничего не указано, весь туман на месте. */
export function SpoilerProvider({ children }: { children: React.ReactNode }) {
  const [readCh, setReadChState] = useState(0);
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(KEY));
      if (Number.isFinite(v) && v > 0) setReadChState(v);
    } catch {}
  }, []);
  const setReadCh = (n: number) => {
    setReadChState(n);
    try {
      localStorage.setItem(KEY, String(n));
    } catch {}
  };
  return <Ctx.Provider value={{ readCh, setReadCh }}>{children}</Ctx.Provider>;
}

export const useSpoiler = () => useContext(Ctx);
export const MAX_CH = 1168;
