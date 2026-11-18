"use client";
import { useState } from "react";
import { MAX_CH, useSpoiler } from "@/lib/spoiler";

/** Стойка регистрации: по желанию указать главу — туман до неё рассеется сам. */
export function ReceptionDesk() {
  const { readCh, setReadCh } = useSpoiler();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > MAX_CH) {
      setError(`Номер главы от 0 до ${MAX_CH}`);
      return;
    }
    setError("");
    setReadCh(n);
    setValue("");
  };

  return (
    <div className="rounded-sm border border-brass/30 bg-hotel-ink/80 p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-9 place-items-center rounded-full border border-brass/50 text-brass">🛎</span>
        <div>
          <h3 className="font-display text-2xl text-brass">Стойка регистрации</h3>
          <p className="text-xs text-paper/50">Необязательно. Укажите главу — туман до неё рассеется.</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          placeholder={readCh ? `Сейчас: глава ${readCh}` : "Например, 120"}
          className="h-10 w-full rounded-sm border border-brass/30 bg-black/40 px-3 font-system text-sm text-paper placeholder:text-paper/30 focus:border-brass focus:outline-none"
        />
        <button className="h-10 shrink-0 rounded-sm border border-brass/60 px-4 font-display text-lg text-brass transition hover:bg-brass hover:text-hotel-black">
          Записать
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-[#ff6b74]">{error}</p>}
      <p className="mt-3 font-system text-[11px] text-system/70">
        [ Гость: {readCh ? `дочитал до главы ${readCh}` : "глава не указана — весь туман на месте"} ]
      </p>
    </div>
  );
}
