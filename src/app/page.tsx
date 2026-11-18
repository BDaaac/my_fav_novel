import Link from "next/link";
import { LampContainer } from "@/components/ui/lamp";
import { ReceptionDesk } from "@/components/hotel/ReceptionDesk";
import { Elevator } from "@/components/hotel/Elevator";
import { StatusWindow } from "@/components/hotel/StatusWindow";

export default function Lobby() {
  return (
    <main className="wallpaper min-h-screen">
      <LampContainer className="min-h-[34rem] rounded-none bg-transparent">
        <p className="mt-24 font-system text-xs uppercase tracking-[0.4em] text-system/70">[ Уровень 1 · Лобби ]</p>
        <h1 className="mt-4 bg-gradient-to-b from-brass-soft to-brass bg-clip-text font-display text-6xl font-semibold tracking-[0.2em] text-transparent md:text-8xl">
          ОТЕЛЬ
        </h1>
        <p className="mt-3 max-w-md text-center font-display text-xl italic text-paper/60">
          Каждый номер — чужой мир. За каждой дверью — свой конец света.
        </p>
      </LampContainer>

      <section className="mx-auto -mt-24 max-w-5xl px-4 pb-24 relative z-50">
        {/* Информационный стенд */}
        <div className="mx-auto max-w-3xl rounded-sm border-2 border-brass/50 bg-[#120e0c] p-1">
          <div className="grid grid-cols-1 divide-y divide-brass/20 border border-brass/25 font-display text-xl sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <span className="flex items-center justify-center gap-3 px-4 py-4 text-paper/35" title="Скоро">
              <span className="text-brass/50">⇦</span> Обсерватория
            </span>
            <a href="#elevator" className="flex items-center justify-center gap-3 px-4 py-4 text-brass transition hover:bg-brass/10">
              <span>⇧</span> Номерной фонд
            </a>
            <span className="flex items-center justify-center gap-3 px-4 py-4 text-paper/35">
              <span className="text-brass/50">⇨</span> <span className="font-system text-base">??</span>
              <span className="text-sm italic">идёт ремонт</span>
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Elevator />
          <ReceptionDesk />

          <Link href="/room/105" className="group rounded-sm border border-system/30 bg-[#07131a]/60 p-5 transition hover:border-system">
            <h3 className="font-display text-2xl text-system">Номер 105</h3>
            <p className="text-xs text-paper/50">Комната Отдыха. Сюда монстры не входят.</p>
            <p className="mt-4 font-system text-[12px] text-system/70 group-hover:text-system">[ Вернуться в безопасную зону → ]</p>
          </Link>

          <Link href="/dining" className="group rounded-sm border border-brass/30 bg-hotel-ink/80 p-5 transition hover:border-brass">
            <h3 className="font-display text-2xl text-brass">Столовая</h3>
            <p className="text-xs text-paper/50">Персонал очень застенчив.</p>
            <p className="mt-4 font-system text-[12px] text-paper/40 group-hover:text-brass">Завтрак 7:00 · Обед 12:00 · Ужин 19:00 →</p>
          </Link>
        </div>

        <div className="mt-5">
          <StatusWindow title="Только для персонала">
            Дверь заперта. Здесь будет архив: досье постояльцев, бестиарий злых богов и хроника по главам.
          </StatusWindow>
        </div>
      </section>
    </main>
  );
}
